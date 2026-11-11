"use client";

import { useRef } from "react";
import { useAtomValue, useStore } from "jotai";
import { Waypoints } from "lucide-react";
import { pt } from "../../geometry";
import { elementsAtom, pushHistoryAtom, selectedElementsAtom } from "../../atoms";

/**
 * Flatten a path into draggable handles. Control points come before their
 * anchor so anchors end up painted on top and win the click.
 */
function handlesFor(element) {
  const items = [];
  element.subPaths.forEach((commands, si) => {
    let previousAnchor = null;
    commands.forEach((c, ci) => {
      if (c.type === "Z") return;
      if (c.type === "C") {
        items.push({ kind: "c1", si, ci, point: c.c1, leader: previousAnchor });
        items.push({ kind: "c2", si, ci, point: c.c2, leader: c.p });
      }
      items.push({ kind: "anchor", si, ci, point: c.p, leader: null });
      previousAnchor = c.p;
    });
  });
  return items;
}

/** Move one anchor or control point, dragging the attached handles with it. */
function movePoint(elements, elementId, ref, to) {
  return elements.map((element) => {
    if (element.id !== elementId) return element;
    const target = element.subPaths[ref.si]?.[ref.ci];
    if (!target) return element;
    const dx = to.x - target.p.x;
    const dy = to.y - target.p.y;
    const shift = (p) => pt(p.x + dx, p.y + dy);

    const subPaths = element.subPaths.map((commands, si) => {
      if (si !== ref.si) return commands;
      return commands.map((c, ci) => {
        if (ci === ref.ci) {
          if (ref.kind !== "anchor") return { ...c, [ref.kind]: to };
          // An anchor owns the incoming handle of its own command…
          return c.type === "C" ? { ...c, p: to, c2: shift(c.c2) } : { ...c, p: to };
        }
        // …and the outgoing handle of the next one.
        if (ref.kind === "anchor" && ci === ref.ci + 1 && c.type === "C") {
          return { ...c, c1: shift(c.c1) };
        }
        return c;
      });
    });
    return { ...element, subPaths };
  });
}

/** Alt-click an anchor to remove it. The first anchor hands "M" to its successor. */
function deleteAnchor(elements, elementId, ref) {
  return elements.flatMap((element) => {
    if (element.id !== elementId) return [element];
    const subPaths = element.subPaths
      .map((commands, si) => {
        if (si !== ref.si) return commands;
        const drawable = commands.filter((c) => c.type !== "Z");
        if (drawable.length <= 2) return []; // would leave nothing to draw
        const next = commands.filter((_, ci) => ci !== ref.ci);
        if (ref.ci === 0 && next.length) {
          const [first, ...rest] = next;
          return [{ type: "M", p: first.p }, ...rest];
        }
        return next;
      })
      .filter((commands) => commands.length > 1);
    return subPaths.length ? [{ ...element, subPaths }] : [];
  });
}

function NodeOverlay({ zoom, toWorld, snap }) {
  const selected = useAtomValue(selectedElementsAtom);
  const store = useStore();
  const drag = useRef(null);

  const paths = selected.filter((e) => e.type === "path");
  const r = 4 / zoom;
  const stroke = 1 / zoom;

  const onPointerDown = (event, elementId, item) => {
    event.stopPropagation();
    if (event.altKey && item.kind === "anchor") {
      store.set(pushHistoryAtom);
      store.set(elementsAtom, deleteAnchor(store.get(elementsAtom), elementId, item));
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { elementId, ref: item, pushed: false };
  };

  const onPointerMove = (event) => {
    const d = drag.current;
    if (!d) return;
    if (!d.pushed) {
      store.set(pushHistoryAtom);
      d.pushed = true;
    }
    const to = snap(toWorld(event));
    store.set(elementsAtom, movePoint(store.get(elementsAtom), d.elementId, d.ref, to));
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  if (!paths.length) return null;

  return (
    <g data-slot="node-overlay">
      {paths.map((element) => {
        const items = handlesFor(element);
        return (
          <g key={element.id}>
            {items
              .filter((item) => item.leader)
              .map((item, i) => (
                <line
                  key={`leader-${i}`}
                  x1={item.leader.x}
                  y1={item.leader.y}
                  x2={item.point.x}
                  y2={item.point.y}
                  stroke="var(--color-primary)"
                  strokeOpacity={0.4}
                  strokeWidth={stroke}
                  pointerEvents="none"
                />
              ))}
            {items.map((item, i) =>
              item.kind === "anchor" ? (
                <rect
                  key={i}
                  x={item.point.x - r}
                  y={item.point.y - r}
                  width={r * 2}
                  height={r * 2}
                  fill="var(--color-background)"
                  stroke="var(--color-primary)"
                  strokeWidth={stroke * 1.5}
                  style={{ cursor: "move" }}
                  onPointerDown={(event) => onPointerDown(event, element.id, item)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                />
              ) : (
                <circle
                  key={i}
                  cx={item.point.x}
                  cy={item.point.y}
                  r={r * 0.8}
                  fill="var(--color-primary)"
                  fillOpacity={0.65}
                  stroke="var(--color-background)"
                  strokeWidth={stroke}
                  style={{ cursor: "move" }}
                  onPointerDown={(event) => onPointerDown(event, element.id, item)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                />
              )
            )}
          </g>
        );
      })}
    </g>
  );
}

export const nodeTool = {
  id: "node",
  label: "Edit points",
  icon: Waypoints,
  shortcut: "n",
  order: 20,
  cursor: "default",
  snaps: true,
  hint: "Select a path, then drag its square anchors or round handles · Alt-click an anchor to delete it",
  Overlay: NodeOverlay,

  // Selecting is all this tool needs from the canvas itself; the handles
  // handle their own pointer events.
  onPointerDown(ctx) {
    if (ctx.hitId) ctx.setSelection([ctx.hitId]);
    else ctx.setSelection([]);
  },
};

export const nodeBrick = {
  id: "node-XX",
  label: "Edit points",
  tools: [nodeTool],
};
