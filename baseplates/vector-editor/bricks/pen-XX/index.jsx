"use client";

import { useAtomValue } from "jotai";
import { PenTool } from "lucide-react";
import { distance, pt, toPathD } from "../../geometry";
import { createPath } from "../../model";
import { draftAtom, styleAtom } from "../../atoms";

/**
 * The pen works on *nodes* — `{ p, hIn, hOut }` — rather than commands,
 * because a node's two handles belong to two different commands and keeping
 * them together is what makes click-drag-click feel right. The conversion to
 * the command model happens once, here, when the path is committed.
 */
export function nodesToSubPath(nodes, closed) {
  if (nodes.length < 2) return [];
  const segment = (a, b) =>
    a.hOut || b.hIn
      ? { type: "C", c1: a.hOut ?? a.p, c2: b.hIn ?? b.p, p: b.p }
      : { type: "L", p: b.p };

  const commands = [{ type: "M", p: nodes[0].p }];
  for (let i = 1; i < nodes.length; i++) commands.push(segment(nodes[i - 1], nodes[i]));
  if (closed) {
    commands.push(segment(nodes[nodes.length - 1], nodes[0]));
    commands.push({ type: "Z" });
  }
  return [commands];
}

function finish(ctx, { closed = false } = {}) {
  const draft = ctx.draft;
  ctx.setDraft(null);
  if (!draft || draft.nodes.length < 2) return;
  const subPaths = nodesToSubPath(draft.nodes, closed);
  if (subPaths.length) ctx.addElements([createPath(subPaths, ctx.style, "Pen path")]);
}

function PenOverlay({ zoom }) {
  const draft = useAtomValue(draftAtom);
  const style = useAtomValue(styleAtom);
  if (!draft?.nodes?.length) return null;

  const { nodes, preview } = draft;
  const rubber = preview ? nodesToSubPath([...nodes, { p: preview }], false) : [];
  const committed = nodesToSubPath(nodes, false);
  const r = 3.5 / zoom;
  const hair = 1 / zoom;

  return (
    <g data-slot="pen-overlay" pointerEvents="none">
      {rubber.length ? (
        <path
          d={toPathD(rubber)}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={0.35}
          strokeWidth={hair * 1.5}
        />
      ) : null}
      {committed.length ? (
        <path
          d={toPathD(committed)}
          fill="none"
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          strokeOpacity={0.7}
        />
      ) : null}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.p.x}
          cy={node.p.y}
          r={i === 0 ? r * 1.4 : r}
          fill={i === 0 ? "var(--color-primary)" : "var(--color-background)"}
          stroke="var(--color-primary)"
          strokeWidth={hair * 1.5}
        />
      ))}
    </g>
  );
}

export const penTool = {
  id: "pen",
  label: "Pen",
  icon: PenTool,
  shortcut: "p",
  order: 30,
  cursor: "crosshair",
  snaps: true,
  hint: "Click for corners · click-drag for curves · click the first point or press Enter to finish · Esc cancels",
  Overlay: PenOverlay,

  onPointerDown(ctx) {
    const draft = ctx.draft;
    const closeRadius = 10 / ctx.viewport.zoom;

    if (draft?.nodes?.length > 2 && distance(ctx.point, draft.nodes[0].p) < closeRadius) {
      finish(ctx, { closed: true });
      return;
    }

    const nodes = [...(draft?.nodes ?? []), { p: ctx.point }];
    ctx.setDraft({ nodes, preview: ctx.point, dragging: true });
  },

  onPointerMove(ctx) {
    const draft = ctx.draft;
    if (!draft) return;

    // Dragging just after placing a node pulls out its Bézier handles.
    if (draft.dragging && ctx.event.buttons) {
      const nodes = [...draft.nodes];
      const last = nodes[nodes.length - 1];
      nodes[nodes.length - 1] = {
        p: last.p,
        hOut: ctx.point,
        hIn: pt(2 * last.p.x - ctx.point.x, 2 * last.p.y - ctx.point.y),
      };
      ctx.setDraft({ ...draft, nodes });
      return;
    }
    ctx.setDraft({ ...draft, preview: ctx.point });
  },

  onPointerUp(ctx) {
    if (ctx.draft) ctx.setDraft({ ...ctx.draft, dragging: false });
  },

  onKeyDown(ctx) {
    if (ctx.event.key === "Enter") {
      finish(ctx);
      return true;
    }
    if (ctx.event.key === "Escape") {
      ctx.setDraft(null);
      return true;
    }
    return false;
  },

  onDeactivate(ctx) {
    finish(ctx);
  },
};

export const penBrick = {
  id: "pen-XX",
  label: "Pen",
  tools: [penTool],
};
