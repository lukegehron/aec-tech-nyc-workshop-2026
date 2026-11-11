"use client";

import { useRef } from "react";
import { useAtomValue, useStore } from "jotai";
import { MousePointer2 } from "lucide-react";
import { boundsIntersect, normalizeRect } from "../../geometry";
import { elementBounds, scaleElement, selectionBounds, translateElement } from "../../model";
import {
  draftAtom,
  elementsAtom,
  pushHistoryAtom,
  selectionAtom,
  selectionBoundsAtom,
} from "../../atoms";

// The eight scale handles, as fractions of the selection box. 0 = min edge,
// 1 = max edge, 0.5 = midpoint (that axis doesn't scale).
const HANDLES = [
  [0, 0, "nwse-resize"],
  [0.5, 0, "ns-resize"],
  [1, 0, "nesw-resize"],
  [1, 0.5, "ew-resize"],
  [1, 1, "nwse-resize"],
  [0.5, 1, "ns-resize"],
  [0, 1, "nesw-resize"],
  [0, 0.5, "ew-resize"],
];

const axisValue = (t, min, max) => (t === 0 ? min : t === 1 ? max : (min + max) / 2);

function SelectOverlay({ zoom, toWorld, snap }) {
  const bounds = useAtomValue(selectionBoundsAtom);
  const draft = useAtomValue(draftAtom);
  const store = useStore();
  const drag = useRef(null);

  // Handles are drawn in world units but should look the same at every zoom.
  const size = 8 / zoom;
  const stroke = 1 / zoom;

  const startScale = (event, hx, hy) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const elements = store.get(elementsAtom);
    const ids = store.get(selectionAtom);
    const box = selectionBounds(elements, ids);
    if (!box) return;
    drag.current = {
      hx,
      hy,
      box,
      ids: new Set(ids),
      origin: elements,
      // Scale about the opposite corner, so that corner stays put.
      anchor: {
        x: axisValue(1 - hx, box.minX, box.maxX),
        y: axisValue(1 - hy, box.minY, box.maxY),
      },
      pushed: false,
    };
  };

  const moveScale = (event) => {
    const d = drag.current;
    if (!d) return;
    const p = snap(toWorld(event));
    const from = { x: axisValue(d.hx, d.box.minX, d.box.maxX), y: axisValue(d.hy, d.box.minY, d.box.maxY) };
    const spanX = from.x - d.anchor.x;
    const spanY = from.y - d.anchor.y;

    let sx = d.hx === 0.5 || Math.abs(spanX) < 1e-6 ? 1 : (p.x - d.anchor.x) / spanX;
    let sy = d.hy === 0.5 || Math.abs(spanY) < 1e-6 ? 1 : (p.y - d.anchor.y) / spanY;
    if (event.shiftKey && d.hx !== 0.5 && d.hy !== 0.5) {
      const uniform = Math.max(Math.abs(sx), Math.abs(sy));
      sx = Math.sign(sx || 1) * uniform;
      sy = Math.sign(sy || 1) * uniform;
    }
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;

    if (!d.pushed) {
      store.set(pushHistoryAtom);
      d.pushed = true;
    }
    store.set(
      elementsAtom,
      d.origin.map((e) => (d.ids.has(e.id) ? scaleElement(e, d.anchor, sx, sy) : e))
    );
  };

  const endScale = () => {
    drag.current = null;
  };

  const marquee = draft?.mode === "marquee" ? normalizeRect(draft.start, draft.current) : null;
  const moving = draft?.mode === "move";

  return (
    <g data-slot="select-overlay">
      {bounds ? (
        <g>
          <rect
            x={bounds.minX}
            y={bounds.minY}
            width={Math.max(bounds.maxX - bounds.minX, 0)}
            height={Math.max(bounds.maxY - bounds.minY, 0)}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeDasharray={`${4 / zoom} ${3 / zoom}`}
            pointerEvents="none"
          />
          {!moving &&
            HANDLES.map(([hx, hy, cursor]) => (
              <rect
                key={`${hx}-${hy}`}
                x={axisValue(hx, bounds.minX, bounds.maxX) - size / 2}
                y={axisValue(hy, bounds.minY, bounds.maxY) - size / 2}
                width={size}
                height={size}
                fill="var(--color-background)"
                stroke="var(--color-primary)"
                strokeWidth={stroke}
                style={{ cursor }}
                onPointerDown={(event) => startScale(event, hx, hy)}
                onPointerMove={moveScale}
                onPointerUp={endScale}
              />
            ))}
        </g>
      ) : null}

      {marquee ? (
        <rect
          x={marquee.minX}
          y={marquee.minY}
          width={marquee.maxX - marquee.minX}
          height={marquee.maxY - marquee.minY}
          fill="var(--color-primary)"
          fillOpacity={0.08}
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          pointerEvents="none"
        />
      ) : null}
    </g>
  );
}

export const selectTool = {
  id: "select",
  label: "Select",
  icon: MousePointer2,
  shortcut: "v",
  order: 10,
  cursor: "default",
  snaps: true,
  hint: "Click to select · Shift-click to add · drag empty space to marquee · drag a handle to scale",
  Overlay: SelectOverlay,

  onPointerDown(ctx) {
    const { hitId, event, point, elements, selection } = ctx;

    if (hitId) {
      if (event.shiftKey) {
        // Shift toggles membership and never starts a drag — otherwise it's
        // impossible to deselect without nudging the element.
        ctx.setSelection(
          selection.includes(hitId)
            ? selection.filter((id) => id !== hitId)
            : [...selection, hitId]
        );
        return;
      }
      const ids = selection.includes(hitId) ? selection : [hitId];
      ctx.setSelection(ids);
      ctx.setDraft({
        mode: "move",
        start: point,
        ids: new Set(ids),
        origin: elements,
        pushed: false,
      });
      return;
    }

    if (!event.shiftKey) ctx.setSelection([]);
    ctx.setDraft({
      mode: "marquee",
      start: point,
      current: point,
      additive: event.shiftKey,
      base: event.shiftKey ? selection : [],
    });
  },

  onPointerMove(ctx) {
    const { draft, point } = ctx;
    if (!draft) return;

    if (draft.mode === "marquee") {
      ctx.setDraft({ ...draft, current: point });
      return;
    }

    if (draft.mode === "move") {
      const dx = point.x - draft.start.x;
      const dy = point.y - draft.start.y;
      if (dx === 0 && dy === 0) return;
      if (!draft.pushed) {
        // One history entry for the whole drag, pushed on the first movement
        // so a plain click doesn't litter the undo stack.
        ctx.pushHistory();
        ctx.setDraft({ ...draft, pushed: true });
      }
      ctx.setElements(
        draft.origin.map((e) => (draft.ids.has(e.id) ? translateElement(e, dx, dy) : e))
      );
    }
  },

  onPointerUp(ctx) {
    const { draft, elements } = ctx;
    if (draft?.mode === "marquee") {
      const rect = normalizeRect(draft.start, draft.current);
      const hits = elements
        .filter((e) => !e.hidden && !e.locked && boundsIntersect(elementBounds(e), rect))
        .map((e) => e.id);
      ctx.setSelection(draft.additive ? [...new Set([...draft.base, ...hits])] : hits);
    }
    ctx.setDraft(null);
  },
};

export const selectBrick = {
  id: "select-XX",
  label: "Select",
  tools: [selectTool],
};
