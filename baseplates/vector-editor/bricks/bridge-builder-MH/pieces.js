/**
 * Bridge pieces as editor elements.
 *
 * A bridge is not one drawing: it is a set of pieces. Every member, deck
 * segment, support and joint is its own path element carrying a `bridge` tag
 * ("member" | "deck" | "cable" | "support" | "joint"). The tag is how the
 * Member tool finds the joints it can snap to, and each piece can be selected,
 * moved or deleted on its own.
 */

import { ellipseSubPaths, polylineSubPaths } from "../../geometry";
import { createDimension, createPath } from "../../model";
import {
  buildBridge,
  layoutSpan,
  pieceWidth,
  samePoint,
  supportTriangle,
  typeLabel,
  uniquePoints,
} from "./bridge";

const tag = (element, kind) => ({ ...element, bridge: kind });

/** A member, deck segment or cable through `points` (two for a straight piece). */
export function linePiece(points, kind, style, name) {
  return tag(
    createPath(
      polylineSubPaths(points),
      { ...style, fill: "none", strokeWidth: style.strokeWidth * pieceWidth(kind) },
      name
    ),
    kind
  );
}

export function supportPiece(p, grid, style) {
  return tag(
    createPath(
      polylineSubPaths(supportTriangle(p, grid), true),
      { ...style, fill: style.stroke, strokeWidth: style.strokeWidth * pieceWidth("support") },
      "Pin support"
    ),
    "support"
  );
}

function jointPiece(p, doc, style) {
  const r = Math.max(doc.grid * 0.1, style.strokeWidth * 0.9);
  return tag(
    createPath(
      ellipseSubPaths(p.x, p.y, r, r),
      { ...style, fill: "#ffffff", strokeWidth: style.strokeWidth * 0.5, dash: "none" },
      "Joint"
    ),
    "joint"
  );
}

/** A joint dot is an ellipse path: its centre is midway between its left and right anchors. */
function jointCentre(element) {
  const commands = element.subPaths?.[0] ?? [];
  const left = commands[0]?.p;
  const right = commands[2]?.p;
  return left && right ? { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 } : null;
}

/** Joint dots for the points that don't already have one. */
export function missingJoints(points, elements, doc, style) {
  const existing = elements
    .filter((element) => element.bridge === "joint")
    .map(jointCentre)
    .filter(Boolean);
  return uniquePoints(points)
    .filter((p) => !existing.some((q) => samePoint(p, q)))
    .map((p) => jointPiece(p, doc, style));
}

/**
 * Add pieces to the sheet as one undo step. Joint dots are kept at the top of
 * the stack so a new member never paints over the joint it connects to.
 */
export function commitPieces(ctx, pieces, jointPoints, opts) {
  if (!pieces.length) return;
  const fresh = opts.nodes ? missingJoints(jointPoints, ctx.elements, ctx.doc, ctx.style) : [];
  const isJoint = (element) => element.bridge === "joint";
  ctx.pushHistory();
  ctx.setElements([
    ...ctx.elements.filter((element) => !isJoint(element)),
    ...pieces,
    ...ctx.elements.filter(isJoint),
    ...fresh,
  ]);
  ctx.setSelection(pieces.map((piece) => piece.id));
}

/** A whole preset bridge between two abutments, as individual pieces. */
export function presetPieces(a, b, doc, style, opts) {
  const layout = layoutSpan(a, b, doc.grid, opts);
  const g = buildBridge(layout, opts, doc.grid);
  const label = typeLabel(opts.type);
  const { x0, x1, y0, bay, bays } = layout;
  const pieces = [];

  for (let i = 0; i < bays; i++) {
    const ends = [
      { x: x0 + i * bay, y: y0 },
      { x: x0 + (i + 1) * bay, y: y0 },
    ];
    pieces.push(linePiece(ends, "deck", style, `${label} · deck`));
  }
  for (const [p, q] of g.members) {
    pieces.push(linePiece([p, q], "member", style, `${label} · member`));
  }
  // An arch or main cable is cut at every hanger, so each bay is its own piece.
  const curveName = opts.type === "suspension" ? "cable" : "arch";
  for (const curve of g.curves) {
    const per = (curve.length - 1) / bays;
    for (let i = 0; i < bays; i++) {
      const segment = curve.slice(i * per, (i + 1) * per + 1);
      pieces.push(linePiece(segment, "member", style, `${label} · ${curveName}`));
    }
  }
  pieces.push(
    supportPiece({ x: x0, y: y0 }, doc.grid, style),
    supportPiece({ x: x1, y: y0 }, doc.grid, style)
  );
  if (opts.dimension) {
    // Drawn left to right, so a positive offset sits below the deck, under the supports.
    pieces.push(createDimension({ x: x0, y: y0 }, { x: x1, y: y0 }, style, doc.grid * 2));
  }
  return { layout, geometry: g, pieces, jointPoints: g.nodes };
}
