/**
 * Pure bridge geometry: no React, no atoms. Two abutment points and the
 * settings go in; deck, members, curves, supports and nodes come out, all in
 * canvas units. SVG y points DOWN, so "above the deck" is `y0 - height`.
 *
 * Grid snapping is the point of this tool. The start abutment snaps to the
 * grid, the span snaps to a whole number of bays, and a bay is a whole number
 * of grid squares, so every deck and chord node lands on a grid intersection.
 * (Arch and cable nodes follow a parabola, so only their heights are free.)
 */

export const BRIDGE_TYPES = [
  { value: "pratt", label: "Pratt truss" },
  { value: "howe", label: "Howe truss" },
  { value: "warren", label: "Warren truss" },
  { value: "arch", label: "Tied arch" },
  { value: "suspension", label: "Suspension" },
];

export const DEFAULT_SETTINGS = {
  type: "pratt",
  bayGrid: 2, // bay width, in grid squares
  heightGrid: 3, // truss depth / arch rise / tower height, in grid squares
  dimension: true,
  nodes: true,
};

export const MIN_BAYS = 2;

const P = (x, y) => ({ x, y });
const snapTo = (value, step) => Math.round(value / step) * step;
const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.round(Number(value) || min)));

export function typeLabel(type) {
  return BRIDGE_TYPES.find((t) => t.value === type)?.label ?? "Bridge";
}

/** Bay width in grid squares. A Warren's top nodes sit mid-bay, so its bay must be even. */
export function bayGridFor(settings) {
  const bayGrid = clampInt(settings.bayGrid, 1, 12);
  return settings.type === "warren" && bayGrid % 2 ? bayGrid + 1 : bayGrid;
}

/**
 * Snap the drag to the grid and to whole bays. The deck is always level, so
 * it takes the y of the first abutment.
 */
export function layoutSpan(a, b, grid, settings) {
  const bay = grid * bayGridFor(settings);
  const start = P(snapTo(a.x, grid), snapTo(a.y, grid));
  const dx = b.x - start.x;
  const dir = Math.sign(dx) || 1;
  const bays = Math.max(MIN_BAYS, Math.round(Math.abs(dx) / bay));
  const end = start.x + dir * bays * bay;
  return {
    x0: Math.min(start.x, end),
    x1: Math.max(start.x, end),
    y0: start.y,
    bay,
    bays,
    span: bays * bay,
    // A click (or a tiny drag) shouldn't drop a bridge.
    tooShort: Math.abs(dx) < bay / 2,
  };
}

/** A parabola through (x0, yEnd) and (x1, yEnd) that reaches yMid at mid-span. */
function parabola(x0, x1, yEnd, yMid) {
  const xm = (x0 + x1) / 2;
  const half = (x1 - x0) / 2 || 1;
  return (x) => {
    const t = (x - xm) / half;
    return yMid + (yEnd - yMid) * t * t;
  };
}

function sample(fn, x0, x1, steps) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    points.push(P(x, fn(x)));
  }
  return points;
}

export function buildBridge(layout, settings, grid) {
  const { x0, x1, y0, bay, bays: n } = layout;
  const h = grid * clampInt(settings.heightGrid, 1, 20);
  const X = (i) => x0 + i * bay;
  const B = (i) => P(X(i), y0); // deck (bottom chord) node
  const T = (i) => P(X(i), y0 - h); // top chord node

  const members = []; // [[p, q], ...] straight members
  const curves = []; // [[p, p, p, ...], ...] arch / cable polylines
  const nodes = [];
  for (let i = 0; i <= n; i++) nodes.push(B(i));

  const type = settings.type;

  if (type === "pratt" || type === "howe") {
    for (let i = 1; i < n - 1; i++) members.push([T(i), T(i + 1)]); // top chord
    members.push([B(0), T(1)], [T(n - 1), B(n)]); // end posts
    for (let i = 1; i < n; i++) members.push([B(i), T(i)]); // verticals
    for (let i = 1; i < n - 1; i++) {
      const leftHalf = i + 0.5 < n / 2;
      // Pratt diagonals slope down toward mid-span (tension); Howe's mirror them.
      const downToCentre = leftHalf ? [T(i), B(i + 1)] : [B(i), T(i + 1)];
      const upToCentre = leftHalf ? [B(i), T(i + 1)] : [T(i), B(i + 1)];
      members.push(type === "pratt" ? downToCentre : upToCentre);
    }
    for (let i = 1; i < n; i++) nodes.push(T(i));
  } else if (type === "warren") {
    const M = (i) => P(X(i) + bay / 2, y0 - h); // top node, mid-bay
    for (let i = 0; i < n; i++) {
      members.push([B(i), M(i)], [M(i), B(i + 1)]);
      if (i < n - 1) members.push([M(i), M(i + 1)]);
      nodes.push(M(i));
    }
  } else if (type === "arch") {
    const archY = parabola(x0, x1, y0, y0 - h);
    curves.push(sample(archY, x0, x1, n * 8));
    for (let i = 1; i < n; i++) {
      const top = P(X(i), archY(X(i)));
      members.push([top, B(i)]); // hangers
      nodes.push(top);
    }
  } else if (type === "suspension") {
    const towerTop = y0 - h;
    const sag = y0 - Math.max(grid * 0.5, h * 0.15); // lowest point of the cable
    const cableY = parabola(x0, x1, towerTop, sag);
    curves.push(sample(cableY, x0, x1, n * 8));
    members.push([P(x0, y0 + grid), P(x0, towerTop)], [P(x1, y0 + grid), P(x1, towerTop)]); // towers
    const anchorL = P(x0 - bay, y0);
    const anchorR = P(x1 + bay, y0);
    members.push([P(x0, towerTop), anchorL], [P(x1, towerTop), anchorR]); // backstays
    for (let i = 1; i < n; i++) {
      const top = P(X(i), cableY(X(i)));
      members.push([top, B(i)]); // hangers
      nodes.push(top);
    }
    nodes.push(P(x0, towerTop), P(x1, towerTop), anchorL, anchorR);
  }

  // Pin supports: a triangle under each abutment, half a grid square each side.
  const support = (x) => [P(x, y0), P(x + grid / 2, y0 + grid), P(x - grid / 2, y0 + grid)];

  return {
    deck: [B(0), B(n)],
    members,
    curves,
    supports: [support(x0), support(x1)],
    nodes,
    height: h,
  };
}
