// Pure plan/elevation maths for walls and their openings. No React, no three.
// Plan points are [x, y] in metres on the Z = 0 ground — this scene is Z-up.

export const SNAP = 0.25; // m — plan grid snap
export const ENDPOINT_SNAP = 0.6; // m — snap to an existing wall end within this
export const MIN_WALL = 0.3; // m — shorter than this finishes the chain instead
const EDGE_CLEAR = 0.1; // m — min solid wall beside / between / above openings

export const WALL = { height: 3, thickness: 0.2 };

export const OPENINGS = {
  door: { width: 0.9, height: 2.1, sill: 0 },
  window: { width: 1.2, height: 1.2, sill: 0.9 },
};

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function wallLength(wall) {
  return Math.hypot(wall.b[0] - wall.a[0], wall.b[1] - wall.a[1]);
}

/** Distance of a world point along a wall, measured from `a`. */
export function alongWall(wall, x, y) {
  const length = wallLength(wall);
  const dx = (wall.b[0] - wall.a[0]) / length;
  const dy = (wall.b[1] - wall.a[1]) / length;
  return (x - wall.a[0]) * dx + (y - wall.a[1]) * dy;
}

/** Snap a plan point to the nearest existing wall end, else to the grid. */
export function snapPoint([x, y], walls) {
  let best = null;
  let bestDistance = ENDPOINT_SNAP;
  for (const wall of walls) {
    for (const p of [wall.a, wall.b]) {
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < bestDistance) {
        best = p;
        bestDistance = d;
      }
    }
  }
  if (best) return [best[0], best[1]];
  return [Math.round(x / SNAP) * SNAP, Math.round(y / SNAP) * SNAP];
}

/**
 * Fit an opening of `type` into `wall` near `u`. Slides it along the wall so a
 * click near an end still fits, then marks it invalid if it would overlap
 * another opening or the wall is too short / too low to hold it.
 */
export function placeOpening(wall, type, u) {
  const spec = OPENINGS[type];
  const length = wallLength(wall);
  const min = spec.width / 2 + EDGE_CLEAR;
  const max = length - spec.width / 2 - EDGE_CLEAR;
  const fitsWall = max >= min && spec.sill + spec.height <= wall.height - EDGE_CLEAR;
  if (!fitsWall) return { type, u, ...spec, valid: false };

  const centre = Math.min(Math.max(u, min), max);
  const clash = wall.openings.some(
    (o) => Math.abs(o.u - centre) < (o.width + spec.width) / 2 + EDGE_CLEAR
  );
  return { type, u: centre, ...spec, valid: !clash };
}

/**
 * The solid parts of a wall, in the wall's own frame: u runs along the wall
 * from `a`, z is height. Each piece is [u0, u1, z0, z1] — full-height piers
 * between openings, plus a sill piece below and a head piece above each one.
 * The ends run half a thickness past the centreline so chained corners close.
 */
export function wallPieces(wall) {
  const length = wallLength(wall);
  const ext = wall.thickness / 2;
  const pieces = [];
  let cursor = -ext;
  const sorted = [...wall.openings].sort((p, q) => p.u - q.u);
  for (const o of sorted) {
    const u0 = o.u - o.width / 2;
    const u1 = o.u + o.width / 2;
    if (u0 > cursor) pieces.push([cursor, u0, 0, wall.height]);
    if (o.sill > 0) pieces.push([u0, u1, 0, o.sill]);
    if (o.sill + o.height < wall.height) {
      pieces.push([u0, u1, o.sill + o.height, wall.height]);
    }
    cursor = u1;
  }
  if (length + ext > cursor) pieces.push([cursor, length + ext, 0, wall.height]);
  return pieces;
}

/** Group transform that puts a wall's local frame (u along X) into the world. */
export function wallFrame(wall) {
  return {
    position: [wall.a[0], wall.a[1], 0],
    rotation: [0, 0, Math.atan2(wall.b[1] - wall.a[1], wall.b[0] - wall.a[0])],
  };
}
