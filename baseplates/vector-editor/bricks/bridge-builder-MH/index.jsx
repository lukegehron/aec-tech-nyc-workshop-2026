"use client";

import { getDefaultStore, useAtomValue } from "jotai";
import { Waypoints } from "lucide-react";
import { ellipseSubPaths, polylineSubPaths, toPathD } from "../../geometry";
import { createDimension, createPath, formatLength } from "../../model";
import { cursorAtom, draftAtom, styleAtom } from "../../atoms";
import { snapPoint } from "../../toolContext";
import { bridgeSettingsAtom } from "./atoms";
import { BRIDGE_TYPES, buildBridge, layoutSpan, typeLabel } from "./bridge";
import BridgePanel from "./Panel";

/**
 * Bridge builder. Drag from one abutment to the other and the tool drops a
 * complete bridge (deck, truss or arch or cables, pin supports, node dots and
 * a span dimension) as ordinary path elements. You can then select, restyle,
 * node-edit and export them like anything else.
 *
 * Everything snaps: the abutments to grid intersections and the span to whole
 * bays, so the structure's nodes sit on the grid. The Bridge panel picks the
 * type, bay width and height. Keys 1–5 switch type while the tool is active.
 */

const store = () => getDefaultStore();

/** A bridge as the elements it will become. Shared by the preview and the commit. */
function bridgeElements(a, b, doc, style, opts) {
  const layout = layoutSpan(a, b, doc.grid, opts);
  const g = buildBridge(layout, opts, doc.grid);
  const w = style.strokeWidth;
  const label = typeLabel(opts.type);
  const line = { ...style, fill: "none" };

  const structure = [
    ...g.members.flatMap(([p, q]) => polylineSubPaths([p, q])),
    ...g.curves.flatMap((points) => polylineSubPaths(points)),
  ];
  const nodeR = Math.max(doc.grid * 0.1, w * 0.9);

  const elements = [
    createPath(polylineSubPaths(g.deck), { ...line, strokeWidth: w * 1.8 }, `${label} · deck`),
    createPath(structure, { ...line, strokeWidth: w * 0.75 }, `${label} · members`),
    createPath(
      g.supports.flatMap((tri) => polylineSubPaths(tri, true)),
      { ...style, fill: style.stroke, strokeWidth: w * 0.5 },
      `${label} · supports`
    ),
  ];
  if (opts.nodes) {
    elements.push(
      createPath(
        g.nodes.flatMap((p) => ellipseSubPaths(p.x, p.y, nodeR, nodeR)),
        { ...style, fill: "#ffffff", strokeWidth: w * 0.5 },
        `${label} · nodes`
      )
    );
  }
  if (opts.dimension) {
    // Drawn left to right, so a positive offset sits below the deck, under the supports.
    elements.push(
      createDimension({ x: layout.x0, y: layout.y0 }, { x: layout.x1, y: layout.y0 }, style, doc.grid * 2)
    );
  }
  return { layout, geometry: g, elements };
}

function SnapMarker({ p, zoom }) {
  const hair = 1 / zoom;
  const r = 5 / zoom;
  return (
    <g pointerEvents="none">
      <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="var(--color-primary)" strokeWidth={hair * 1.5} />
      <path
        d={`M ${p.x - r * 2} ${p.y} H ${p.x + r * 2} M ${p.x} ${p.y - r * 2} V ${p.y + r * 2}`}
        stroke="var(--color-primary)"
        strokeWidth={hair}
      />
    </g>
  );
}

function BridgeOverlay({ zoom, doc }) {
  const draft = useAtomValue(draftAtom);
  const cursor = useAtomValue(cursorAtom);
  const style = useAtomValue(styleAtom);
  const opts = useAtomValue(bridgeSettingsAtom);

  // Before the drag: show the grid node the first abutment will snap to.
  if (!draft?.a) {
    if (!cursor) return null;
    return <SnapMarker p={doc.snap ? snapPoint(cursor, doc.grid) : cursor} zoom={zoom} />;
  }

  const { layout, geometry, elements } = bridgeElements(draft.a, draft.b, doc, style, opts);
  const r = 5 / zoom;
  return (
    <g pointerEvents="none">
      <g opacity={0.7}>
        {elements
          .filter((el) => el.type === "path")
          .map((el) => (
            <path
              key={el.name}
              d={toPathD(el.subPaths)}
              fill={el.style.fill}
              stroke={el.style.stroke}
              strokeWidth={el.style.strokeWidth}
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
        fill="var(--color-primary)"
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
  hint: "Drag abutment to abutment to drop a bridge · snaps to grid nodes and whole bays · 1–5 switch type · Esc cancels",
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
    ctx.addElements(bridgeElements(draft.a, draft.b, ctx.doc, ctx.style, opts).elements);
  },

  onKeyDown(ctx) {
    const key = ctx.event.key;
    if (key === "Escape" && ctx.draft) {
      ctx.setDraft(null);
      return true;
    }
    const type = BRIDGE_TYPES[Number(key) - 1];
    if (/^[1-9]$/.test(key) && type) {
      store().set(bridgeSettingsAtom, { ...store().get(bridgeSettingsAtom), type: type.value });
      return true;
    }
    return false;
  },

  onDeactivate(ctx) {
    ctx.setDraft(null);
  },
};

export const bridgeBuilderMH = {
  id: "bridge-builder-MH",
  label: "Bridge builder",
  tools: [bridgeTool],
  panels: [{ id: "bridge", label: "Bridge", order: 60, Panel: BridgePanel }],
};

