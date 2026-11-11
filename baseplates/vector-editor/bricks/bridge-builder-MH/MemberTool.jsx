"use client";

import { getDefaultStore, useAtomValue } from "jotai";
import { Slash } from "lucide-react";
import { polylineSubPaths, toPathD } from "../../geometry";
import { formatLength } from "../../model";
import { cursorAtom, draftAtom, elementsAtom, styleAtom } from "../../atoms";
import { snapPoint } from "../../toolContext";
import { bridgeSettingsAtom } from "./atoms";
import { PIECES, collectJoints, constrain45, nearestJoint, pieceWidth, supportTriangle } from "./bridge";
import { commitPieces, linePiece, supportPiece } from "./pieces";
import { ModeChrome, SnapMarker, modeKeys } from "./Mode";

/**
 * The Member tool: add one piece at a time. Drag from joint to joint to place
 * a member, deck segment or cable; click to place a pin support. Ends snap to
 * an existing joint first, then to the grid, so pieces actually connect.
 */

const JOINT_RADIUS = 14; // screen px within which an end grabs an existing joint

const store = () => getDefaultStore();
const pieceLabel = (kind) => PIECES.find((p) => p.value === kind)?.label ?? "Member";

/** Where an end lands: an existing joint if one is close, otherwise the grid point. */
function resolveEnd(raw, gridPoint, elements, zoom) {
  const joint = raw ? nearestJoint(raw, collectJoints(elements), JOINT_RADIUS / zoom) : null;
  return { p: joint ?? gridPoint, onJoint: Boolean(joint) };
}

function MemberOverlay({ zoom, doc }) {
  const draft = useAtomValue(draftAtom);
  const cursor = useAtomValue(cursorAtom);
  const style = useAtomValue(styleAtom);
  const elements = useAtomValue(elementsAtom);
  const opts = useAtomValue(bridgeSettingsAtom);
  const kind = opts.piece;
  const joints = collectJoints(elements);
  const hair = 1 / zoom;

  let preview = null;
  if (draft?.a && draft?.b) {
    const length = Math.hypot(draft.b.x - draft.a.x, draft.b.y - draft.a.y);
    preview = (
      <g>
        <path
          d={toPathD(polylineSubPaths([draft.a, draft.b]))}
          fill="none"
          stroke={style.stroke}
          strokeWidth={style.strokeWidth * pieceWidth(kind)}
          strokeLinecap="round"
          opacity={0.7}
        />
        <SnapMarker p={draft.a} zoom={zoom} onJoint={draft.aOnJoint} />
        <SnapMarker p={draft.b} zoom={zoom} onJoint={draft.bOnJoint} />
        <text
          x={(draft.a.x + draft.b.x) / 2}
          y={(draft.a.y + draft.b.y) / 2 - 12 / zoom}
          textAnchor="middle"
          fontSize={12 / zoom}
          fill="#854d0e"
        >
          {formatLength(length * doc.mmPerUnit)}
        </text>
      </g>
    );
  } else if (cursor) {
    const gridPoint = doc.snap ? snapPoint(cursor, doc.grid) : cursor;
    const end = resolveEnd(cursor, gridPoint, elements, zoom);
    preview = (
      <g>
        {kind === "support" ? (
          <path
            d={toPathD(polylineSubPaths(supportTriangle(end.p, doc.grid), true))}
            fill={style.stroke}
            opacity={0.5}
          />
        ) : null}
        <SnapMarker p={end.p} zoom={zoom} onJoint={end.onJoint} />
      </g>
    );
  }

  return (
    <g pointerEvents="none">
      <ModeChrome zoom={zoom} label={`placing ${pieceLabel(kind).toLowerCase()}`} />
      {/* Every joint a new piece can connect to */}
      {joints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={7 / zoom}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={0.6}
          strokeWidth={hair * 1.5}
        />
      ))}
      {preview}
    </g>
  );
}

export const memberTool = {
  id: "member",
  label: "Member",
  icon: Slash,
  shortcut: "m",
  order: 74,
  cursor: "crosshair",
  snaps: true,
  hint: "Bridge mode · drag joint to joint to add a piece · ends snap to joints, then the grid · Shift locks 45° · 1–4 pick member / deck / cable / support · Esc exits",
  Overlay: MemberOverlay,

  onPointerDown(ctx) {
    const opts = store().get(bridgeSettingsAtom);
    const end = resolveEnd(ctx.rawPoint, ctx.point, ctx.elements, ctx.viewport.zoom);
    if (opts.piece === "support") {
      commitPieces(ctx, [supportPiece(end.p, ctx.doc.grid, ctx.style)], [], opts);
      return;
    }
    ctx.setDraft({ a: end.p, b: end.p, aOnJoint: end.onJoint, bOnJoint: end.onJoint });
  },

  onPointerMove(ctx) {
    const draft = ctx.draft;
    if (!draft?.a || !ctx.event.buttons) return;
    const end = ctx.event.shiftKey
      ? { p: constrain45(draft.a, ctx.point), onJoint: false }
      : resolveEnd(ctx.rawPoint, ctx.point, ctx.elements, ctx.viewport.zoom);
    ctx.setDraft({ ...draft, b: end.p, bOnJoint: end.onJoint });
  },

  onPointerUp(ctx) {
    const draft = ctx.draft;
    ctx.setDraft(null);
    if (!draft?.a || !draft?.b) return;
    if (Math.hypot(draft.b.x - draft.a.x, draft.b.y - draft.a.y) < 1) return;
    const opts = store().get(bridgeSettingsAtom);
    const piece = linePiece([draft.a, draft.b], opts.piece, ctx.style, pieceLabel(opts.piece));
    commitPieces(ctx, [piece], [draft.a, draft.b], opts);
  },

  onKeyDown(ctx) {
    const piece = PIECES[Number(ctx.event.key) - 1];
    if (/^[1-9]$/.test(ctx.event.key) && piece) {
      store().set(bridgeSettingsAtom, { ...store().get(bridgeSettingsAtom), piece: piece.value });
      return true;
    }
    return modeKeys(ctx);
  },

  onDeactivate(ctx) {
    ctx.setDraft(null);
  },
};
