/**
 * The document model — what an "element" is, and everything you can ask about
 * one. `geometry.js` knows about points; this file knows about elements.
 *
 * There are exactly two element types, which is deliberate: a real editor
 * grows dozens, but every one of them is a variation on "geometry + style".
 *
 *   { id, type: "path",      name, subPaths, style, hidden?, locked? }
 *   { id, type: "dimension", name, a, b, offset, style, hidden?, locked? }
 *
 * Units: one canvas unit is `doc.mmPerUnit` millimetres. The geometry never
 * stores millimetres — only the dimension *labels* convert, at draw time.
 */

import {
  boundsOfPoints,
  distance,
  flattenSubPaths,
  mapSubPaths,
  pt,
  toPathD,
  unionBounds,
} from "./geometry";

let idCounter = 0;
export function nextId(prefix = "el") {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export const DEFAULT_STYLE = {
  fill: "none",
  stroke: "#1f2937",
  strokeWidth: 6,
  opacity: 1,
  dash: "none",
};

export const DASH_PATTERNS = {
  none: null,
  dashed: "24 16",
  dotted: "2 14",
  center: "48 12 8 12",
};

export function createPath(subPaths, style, name = "Path") {
  return {
    id: nextId("path"),
    type: "path",
    name,
    subPaths,
    style: { ...DEFAULT_STYLE, ...style },
  };
}

export function createDimension(a, b, style, offset = 0) {
  return {
    id: nextId("dim"),
    type: "dimension",
    name: "Dimension",
    a,
    b,
    offset,
    style: { ...DEFAULT_STYLE, ...style, fill: "none", strokeWidth: 2 },
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function elementBounds(element) {
  if (element.type === "dimension") return boundsOfPoints([element.a, element.b]);
  return unionBounds(flattenSubPaths(element.subPaths).map(boundsOfPoints));
}

export function selectionBounds(elements, ids) {
  const set = new Set(ids);
  return unionBounds(elements.filter((e) => set.has(e.id)).map(elementBounds));
}

/** Every anchor in an element, flattened — what the node tool draws handles for. */
export function elementAnchors(element) {
  if (element.type !== "path") return [];
  const anchors = [];
  element.subPaths.forEach((commands, subPathIndex) => {
    commands.forEach((c, commandIndex) => {
      if (c.type === "Z") return;
      anchors.push({ subPathIndex, commandIndex, point: c.p, kind: "anchor" });
      if (c.type === "C") {
        anchors.push({ subPathIndex, commandIndex, point: c.c1, kind: "c1" });
        anchors.push({ subPathIndex, commandIndex, point: c.c2, kind: "c2" });
      }
    });
  });
  return anchors;
}

// ---------------------------------------------------------------------------
// Transforms — every one of these returns a new element
// ---------------------------------------------------------------------------

export function mapElementPoints(element, fn) {
  if (element.type === "dimension") {
    return { ...element, a: fn(element.a), b: fn(element.b) };
  }
  return { ...element, subPaths: mapSubPaths(element.subPaths, fn) };
}

export function translateElement(element, dx, dy) {
  return mapElementPoints(element, (p) => pt(p.x + dx, p.y + dy));
}

/** Scale about `origin`. Stroke width scales with the average factor. */
export function scaleElement(element, origin, sx, sy) {
  const scaled = mapElementPoints(element, (p) =>
    pt(origin.x + (p.x - origin.x) * sx, origin.y + (p.y - origin.y) * sy)
  );
  const factor = Math.sqrt(Math.abs(sx * sy)) || 1;
  return {
    ...scaled,
    style: { ...scaled.style, strokeWidth: scaled.style.strokeWidth * factor },
  };
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** mm -> a human label. 4200 becomes "4.2 m", 850 stays "850 mm". */
export function formatLength(mm) {
  if (Math.abs(mm) >= 1000) {
    const m = mm / 1000;
    return `${Number(m.toFixed(2))} m`;
  }
  return `${Math.round(mm)} mm`;
}

const TICK = 14; // half-length of the 45° slash at each end, in units
const OVERSHOOT = 10; // how far the extension lines run past the dimension line

/**
 * Everything needed to draw a dimension, in world units. Shared by the canvas
 * renderer and the SVG exporter so the two can never drift apart.
 */
export function dimensionGeometry(element) {
  const { a, b, offset = 0 } = element;
  const length = distance(a, b) || 1;
  const ux = (b.x - a.x) / length;
  const uy = (b.y - a.y) / length;
  const nx = -uy;
  const ny = ux;

  const shift = (p, by) => pt(p.x + nx * by, p.y + ny * by);
  const oa = shift(a, offset);
  const ob = shift(b, offset);

  const tick = (p) =>
    `M ${p.x - (ux + nx) * TICK} ${p.y - (uy + ny) * TICK} ` +
    `L ${p.x + (ux + nx) * TICK} ${p.y + (uy + ny) * TICK}`;

  const extension = (from, to) => {
    const past = shift(to, Math.sign(offset || 1) * OVERSHOOT);
    return `M ${from.x} ${from.y} L ${past.x} ${past.y}`;
  };

  // Keep the label upright — text upside down is the classic dimension bug.
  let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  if (angle > 90 || angle < -90) angle += 180;

  return {
    length,
    lineD: `M ${oa.x} ${oa.y} L ${ob.x} ${ob.y}`,
    ticksD: `${tick(oa)} ${tick(ob)}`,
    extensionsD: offset === 0 ? "" : `${extension(a, oa)} ${extension(b, ob)}`,
    labelAt: pt((oa.x + ob.x) / 2, (oa.y + ob.y) / 2),
    labelAngle: angle,
  };
}

/** The `d` for a path element (dimensions return their line + ticks). */
export function elementPathD(element) {
  if (element.type === "dimension") {
    const g = dimensionGeometry(element);
    return `${g.lineD} ${g.ticksD} ${g.extensionsD}`.trim();
  }
  return toPathD(element.subPaths);
}
