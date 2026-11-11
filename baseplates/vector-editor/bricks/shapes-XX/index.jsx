"use client";

import { useAtomValue } from "jotai";
import { Circle, Square } from "lucide-react";
import { ellipseSubPaths, rectSubPaths, toPathD } from "../../geometry";
import { createPath } from "../../model";
import { draftAtom, styleAtom } from "../../atoms";

/**
 * The shapes brick. Rect and ellipse are the same gesture with a different
 * builder, so they're one factory — and one brick can ship both tools.
 *
 * Adding a polygon or star tool: copy this folder, write a `build(box)`, and
 * add your two lines to `../bricks.js`.
 */

/** start + current + modifier keys -> a box. Shift squares it, Alt centres it. */
function boxFrom(start, current, { shift, alt }) {
  let dx = current.x - start.x;
  let dy = current.y - start.y;

  if (shift) {
    const size = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * size;
    dy = Math.sign(dy || 1) * size;
  }
  if (alt) {
    return { x: start.x - Math.abs(dx), y: start.y - Math.abs(dy), w: Math.abs(dx) * 2, h: Math.abs(dy) * 2 };
  }
  return {
    x: Math.min(start.x, start.x + dx),
    y: Math.min(start.y, start.y + dy),
    w: Math.abs(dx),
    h: Math.abs(dy),
  };
}

function ShapeOverlay() {
  const draft = useAtomValue(draftAtom);
  const style = useAtomValue(styleAtom);
  if (!draft?.preview?.length) return null;

  return (
    <path
      d={toPathD(draft.preview)}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      opacity={0.7}
      pointerEvents="none"
    />
  );
}

function dragShapeTool({ id, label, icon, shortcut, order, name, hint, build }) {
  return {
    id,
    label,
    icon,
    shortcut,
    order,
    cursor: "crosshair",
    snaps: true,
    hint,
    Overlay: ShapeOverlay,

    onPointerDown(ctx) {
      ctx.setDraft({ start: ctx.point, preview: [] });
    },

    onPointerMove(ctx) {
      const draft = ctx.draft;
      if (!draft?.start || !ctx.event.buttons) return;
      const box = boxFrom(draft.start, ctx.point, {
        shift: ctx.event.shiftKey,
        alt: ctx.event.altKey,
      });
      ctx.setDraft({ ...draft, box, preview: build(box) });
    },

    onPointerUp(ctx) {
      const draft = ctx.draft;
      ctx.setDraft(null);
      // A click without a drag shouldn't leave a zero-size element behind.
      if (!draft?.box || draft.box.w < 1 || draft.box.h < 1) return;
      ctx.addElements([createPath(build(draft.box), ctx.style, name)]);
    },
  };
}

export const rectTool = dragShapeTool({
  id: "rect",
  label: "Rectangle",
  icon: Square,
  shortcut: "r",
  order: 50,
  name: "Rectangle",
  hint: "Drag to draw a rectangle · Shift for a square · Alt to draw from the centre",
  build: (b) => rectSubPaths(b.x, b.y, b.w, b.h),
});

export const ellipseTool = dragShapeTool({
  id: "ellipse",
  label: "Ellipse",
  icon: Circle,
  shortcut: "e",
  order: 60,
  name: "Ellipse",
  hint: "Drag to draw an ellipse · Shift for a circle · Alt to draw from the centre",
  build: (b) => ellipseSubPaths(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2),
});

export const shapesBrick = {
  id: "shapes-XX",
  label: "Shapes",
  tools: [rectTool, ellipseTool],
};
