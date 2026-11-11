"use client";

import { useAtomValue } from "jotai";
import { Pencil } from "lucide-react";
import { distance, polylineSubPaths, simplifyPoints, smoothPoints, toPathD } from "../../geometry";
import { createPath } from "../../model";
import { draftAtom, styleAtom } from "../../atoms";

// Both thresholds are in screen pixels and divided by zoom at use, so the
// pencil feels identical whether you're zoomed way in or way out.
const MIN_STEP = 2.5; // ignore jitter smaller than this
const SIMPLIFY = 2.5; // Douglas–Peucker tolerance

function PencilOverlay({ zoom }) {
  const draft = useAtomValue(draftAtom);
  const style = useAtomValue(styleAtom);
  if (!draft?.points || draft.points.length < 2) return null;

  return (
    <path
      d={toPathD(polylineSubPaths(draft.points))}
      fill="none"
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
      pointerEvents="none"
    />
  );
}

export const pencilTool = {
  id: "pencil",
  label: "Pencil",
  icon: Pencil,
  shortcut: "b",
  order: 40,
  cursor: "crosshair",
  snaps: false, // freehand and grid snapping do not mix
  hint: "Drag to draw freehand · the stroke is simplified and smoothed into Bézier curves on release",
  Overlay: PencilOverlay,

  onPointerDown(ctx) {
    ctx.setDraft({ points: [ctx.point] });
  },

  onPointerMove(ctx) {
    const draft = ctx.draft;
    if (!draft?.points || !ctx.event.buttons) return;
    const last = draft.points[draft.points.length - 1];
    if (distance(last, ctx.point) < MIN_STEP / ctx.viewport.zoom) return;
    ctx.setDraft({ points: [...draft.points, ctx.point] });
  },

  onPointerUp(ctx) {
    const draft = ctx.draft;
    ctx.setDraft(null);
    if (!draft?.points || draft.points.length < 2) return;

    const simplified = simplifyPoints(draft.points, SIMPLIFY / ctx.viewport.zoom);
    const subPaths = smoothPoints(simplified);
    if (subPaths.length) ctx.addElements([createPath(subPaths, ctx.style, "Freehand")]);
  },
};

export const pencilBrick = {
  id: "pencil-XX",
  label: "Pencil",
  tools: [pencilTool],
};
