"use client";

import { getDefaultStore, useAtomValue } from "jotai";
import { Waypoints } from "lucide-react";
import { toPathD } from "../../geometry";
import { formatLength } from "../../model";
import { cursorAtom, draftAtom, styleAtom } from "../../atoms";
import { snapPoint } from "../../toolContext";
import { bridgeSettingsAtom } from "./atoms";
import { BRIDGE_TYPES, layoutSpan, typeLabel } from "./bridge";
import { commitPieces, presetPieces } from "./pieces";
import { ModeChrome, SnapMarker, modeKeys } from "./Mode";
import { memberTool } from "./MemberTool";
import BridgePanel from "./Panel";

/**
 * Bridge builder. A bridge here is a set of PIECES, not a drawing: every
 * member, deck segment, support and joint is its own element (see pieces.js).
 *
 *   Member tool (M)  add one piece at a time, joint to joint (MemberTool.jsx)
 *   Bridge tool (G)  drop a whole preset bridge, already split into pieces
 *
 * Either tool puts the editor in BRIDGE MODE (Mode.jsx): the canvas turns
 * yellow and the other tools grey out until you press Esc.
 */

const store = () => getDefaultStore();

function BridgeOverlay({ zoom, doc }) {
  const draft = useAtomValue(draftAtom);
  const cursor = useAtomValue(cursorAtom);
  const style = useAtomValue(styleAtom);
  const opts = useAtomValue(bridgeSettingsAtom);
  const chrome = <ModeChrome zoom={zoom} label={`dropping ${typeLabel(opts.type).toLowerCase()}`} />;

  // Before the drag: show the grid node the first abutment will snap to.
  if (!draft?.a) {
    return (
      <g pointerEvents="none">
        {chrome}
        {cursor ? <SnapMarker p={doc.snap ? snapPoint(cursor, doc.grid) : cursor} zoom={zoom} /> : null}
      </g>
    );
  }

  const { layout, geometry, pieces } = presetPieces(draft.a, draft.b, doc, style, opts);
  const r = 5 / zoom;
  return (
    <g pointerEvents="none">
      {chrome}
      <g opacity={0.7}>
        {pieces
          .filter((piece) => piece.type === "path")
          .map((piece, i) => (
            <path
              key={i}
              d={toPathD(piece.subPaths)}
              fill={piece.style.fill}
              stroke={piece.style.stroke}
              strokeWidth={piece.style.strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
      </g>
      {/* The snapping nodes: one on each grid intersection along the deck */}
      {Array.from({ length: layout.bays + 1 }, (_, i) => (
        <circle key={i} cx={layout.x0 + i * layout.bay} cy={layout.y0} r={r} fill="var(--color-primary)" />
      ))}
      <text
        x={(layout.x0 + layout.x1) / 2}
        y={layout.y0 - geometry.height - 16 / zoom}
        textAnchor="middle"
        fontSize={13 / zoom}
        fill="#854d0e"
      >
        {`${typeLabel(opts.type)} · ${layout.bays} bays · ${formatLength(layout.span * doc.mmPerUnit)}`}
      </text>
    </g>
  );
}

export const bridgeTool = {
  id: "bridge",
  label: "Bridge",
  icon: Waypoints,
  shortcut: "g",
  order: 75,
  cursor: "crosshair",
  snaps: true,
  hint: "Bridge mode · drag abutment to abutment to drop a preset bridge as separate pieces · 1–5 switch type · M adds single members · Esc exits",
  Overlay: BridgeOverlay,

  onPointerDown(ctx) {
    ctx.setDraft({ a: ctx.point, b: ctx.point });
  },

  onPointerMove(ctx) {
    const draft = ctx.draft;
    if (!draft?.a || !ctx.event.buttons) return;
    ctx.setDraft({ ...draft, b: ctx.point });
  },

  onPointerUp(ctx) {
    const draft = ctx.draft;
    ctx.setDraft(null);
    if (!draft?.a || !draft?.b) return;
    const opts = store().get(bridgeSettingsAtom);
    if (layoutSpan(draft.a, draft.b, ctx.doc.grid, opts).tooShort) return;
    const { pieces, jointPoints } = presetPieces(draft.a, draft.b, ctx.doc, ctx.style, opts);
    commitPieces(ctx, pieces, jointPoints, opts);
  },

  onKeyDown(ctx) {
    const type = BRIDGE_TYPES[Number(ctx.event.key) - 1];
    if (/^[1-9]$/.test(ctx.event.key) && type) {
      store().set(bridgeSettingsAtom, { ...store().get(bridgeSettingsAtom), type: type.value });
      return true;
    }
    return modeKeys(ctx);
  },

  onDeactivate(ctx) {
    ctx.setDraft(null);
  },
};

export const bridgeBuilderMH = {
  id: "bridge-builder-MH",
  label: "Bridge builder",
  tools: [memberTool, bridgeTool],
  panels: [{ id: "bridge", label: "Bridge", order: 60, Panel: BridgePanel }],
};

