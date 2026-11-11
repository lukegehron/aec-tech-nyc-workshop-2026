"use client";

import { useAtomValue } from "jotai";
import { Ruler } from "lucide-react";
import { distance, pt } from "../../geometry";
import { createDimension } from "../../model";
import { draftAtom, styleAtom } from "../../atoms";
import ElementView from "../../ElementView";

/** Shift constrains the measurement to 0° / 45° / 90°. */
function constrain(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (!length) return to;
  const step = Math.PI / 4;
  const angle = Math.round(Math.atan2(dy, dx) / step) * step;
  return pt(from.x + Math.cos(angle) * length, from.y + Math.sin(angle) * length);
}

function DimensionOverlay({ zoom, doc }) {
  const draft = useAtomValue(draftAtom);
  const style = useAtomValue(styleAtom);
  if (!draft?.a || !draft?.b) return null;

  const preview = { ...createDimension(draft.a, draft.b, style), id: "dimension-preview" };
  return (
    <g opacity={0.75} pointerEvents="none">
      <ElementView
        element={preview}
        zoom={zoom}
        mmPerUnit={doc.mmPerUnit}
        interactive={false}
      />
    </g>
  );
}

export const dimensionTool = {
  id: "dimension",
  label: "Dimension",
  icon: Ruler,
  shortcut: "d",
  order: 70,
  cursor: "crosshair",
  snaps: true,
  hint: "Drag between two points to annotate the distance · Shift locks to 45° steps · the label follows the drawing scale",
  Overlay: DimensionOverlay,

  onPointerDown(ctx) {
    ctx.setDraft({ a: ctx.point, b: ctx.point });
  },

  onPointerMove(ctx) {
    const draft = ctx.draft;
    if (!draft?.a || !ctx.event.buttons) return;
    const b = ctx.event.shiftKey ? constrain(draft.a, ctx.point) : ctx.point;
    ctx.setDraft({ ...draft, b });
  },

  onPointerUp(ctx) {
    const draft = ctx.draft;
    ctx.setDraft(null);
    if (!draft?.a || !draft?.b) return;
    if (distance(draft.a, draft.b) < 1) return;
    ctx.addElements([createDimension(draft.a, draft.b, ctx.style)]);
  },
};

export const dimensionBrick = {
  id: "dimension-XX",
  label: "Dimension",
  tools: [dimensionTool],
};
