import { outlineBounds } from "@/lib/projectData";

// Pure geometry for the switchback stair — no React, no three.js.
// Z-up throughout (see `../../geometry.js`): project.json's plan [x, z] is
// world [x, y], and elevation is world Z.

export const DRAG_SLOP = 4; // px — more than this between down and up was an orbit
export const WELL_GAP = 0.2; // m — gap between the two flights
export const WAIST = 0.15; // m — structural depth under each tread
export const LANDING_THICKNESS = 0.2; // m

/** The building whose footprint contains a plan point, or null. */
export function buildingAt(data, x, y) {
  return (
    data.buildings.find((b) => {
      const bb = outlineBounds([b.outline]);
      return x >= bb.minX && x <= bb.maxX && y >= bb.minZ && y <= bb.maxZ;
    }) ?? null
  );
}

/** Riser count and the actual riser height for one storey. */
export function storeyRisers(height, maxRiser) {
  const risers = Math.max(2, Math.ceil(height / maxRiser - 1e-9));
  return { risers, riser: height / risers };
}

/**
 * One switchback storey in the stair's local frame (before centring).
 *
 * Flight 1 climbs +Y in the left lane (x ∈ [0, w]), turns on a half landing
 * spanning both lanes, and flight 2 climbs back −Y in the right lane. The last
 * riser of each flight lands on a landing, so a flight of n risers has n − 1
 * treads. Flight 1 takes the odd riser, so flight 2 always fits its run.
 *
 * Returns blocks `{ x0, x1, y0, y1, z0, z1, kind }` with z relative to the
 * storey's base, plus the dimensions the caller needs.
 */
export function storeyBlocks(height, params) {
  const { tread: t, width: w } = params;
  const { risers, riser: r } = storeyRisers(height, params.maxRiser);
  const n1 = Math.ceil(risers / 2);
  const n2 = risers - n1;
  const run = (n1 - 1) * t; // flight 1's run; flight 2's is ≤ this
  const right0 = w + WELL_GAP;
  const right1 = 2 * w + WELL_GAP;
  const blocks = [];

  for (let k = 1; k < n1; k += 1) {
    const top = k * r;
    blocks.push({ kind: "tread", x0: 0, x1: w, y0: (k - 1) * t, y1: k * t, z0: top - r - WAIST, z1: top });
  }

  const halfLanding = n1 * r;
  blocks.push({
    kind: "landing",
    x0: 0,
    x1: right1,
    y0: run,
    y1: run + w,
    z0: halfLanding - LANDING_THICKNESS,
    z1: halfLanding,
  });

  for (let k = 1; k < n2; k += 1) {
    const top = (n1 + k) * r;
    blocks.push({
      kind: "tread",
      x0: right0,
      x1: right1,
      y0: run - k * t,
      y1: run - (k - 1) * t,
      z0: top - r - WAIST,
      z1: top,
    });
  }

  // Where flight 2 ends — the floor landing above has to reach this far.
  const arriveY = run - Math.max(n2 - 1, 0) * t;
  return { blocks, risers, riser: r, n1, n2, run, arriveY };
}

/**
 * The storeys a stair serves. Each floor's own height takes you to the next
 * floor up; the top floor's height takes you to the roof, which is optional.
 */
export function servedFloors(floors, toRoof) {
  const sorted = floors.slice().sort((a, b) => a.elevation - b.elevation);
  return toRoof ? sorted : sorted.slice(0, -1);
}

/**
 * Every block of a whole stair, all storeys stacked, centred on the origin in
 * plan and with absolute elevations. Rotation is applied by the caller.
 */
export function stairBlocks(floors, params) {
  const { width: w } = params;
  const totalW = 2 * w + WELL_GAP;
  const storeys = servedFloors(floors, params.toRoof).map((f) => ({
    floor: f,
    ...storeyBlocks(f.height, params),
  }));
  if (!storeys.length) return { blocks: [], storeys, footprint: [totalW, 0] };

  const maxRun = Math.max(...storeys.map((s) => s.run));
  const depth = w + maxRun + w; // floor landing + longest run + half landing
  const cx = totalW / 2;
  const cy = maxRun / 2; // centre of y ∈ [−w, maxRun + w]

  const blocks = [];
  // A floor landing spans both lanes behind the first riser. With an odd
  // riser count the flight arriving from below lands one tread further in, so
  // the landing reaches into the RIGHT lane only — the left lane there is the
  // foot of the next flight up.
  const floorLanding = (z, arriveY) => {
    const slab = { kind: "floor", z0: z - LANDING_THICKNESS, z1: z };
    const parts = [{ ...slab, x0: 0, x1: totalW, y0: -w, y1: 0 }];
    if (arriveY > 1e-6) {
      parts.push({ ...slab, x0: w + WELL_GAP, x1: totalW, y0: 0, y1: arriveY });
    }
    return parts;
  };

  storeys.forEach((s, i) => {
    const base = s.floor.elevation;
    // Ground needs no slab (flight 1 starts on grade); every floor above is
    // where the previous storey's flight 2 arrived.
    if (i > 0) blocks.push(...floorLanding(base, storeys[i - 1].arriveY));
    for (const b of s.blocks) blocks.push({ ...b, z0: b.z0 + base, z1: b.z1 + base });
  });
  const top = storeys.at(-1);
  blocks.push(...floorLanding(top.floor.elevation + top.floor.height, top.arriveY));

  // Centre in plan; never let a block poke below grade.
  const centred = blocks.map((b) => ({
    ...b,
    x0: b.x0 - cx,
    x1: b.x1 - cx,
    y0: b.y0 - cy,
    y1: b.y1 - cy,
    z0: Math.max(b.z0, 0),
  }));

  return { blocks: centred, storeys, footprint: [totalW, depth] };
}

/**
 * Keep a stair of plan size `footprint`, rotated by `rotation` degrees (a
 * multiple of 90), wholly inside a building's footprint.
 */
export function clampToBuilding(building, [x, y], footprint, rotation) {
  const quarter = Math.round(rotation / 90) % 2 !== 0;
  const [w, d] = quarter ? [footprint[1], footprint[0]] : footprint;
  const bb = outlineBounds([building.outline]);
  const clamp = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(Math.max(v, lo), hi));
  return [clamp(x, bb.minX + w / 2, bb.maxX - w / 2), clamp(y, bb.minZ + d / 2, bb.maxZ - d / 2)];
}

/** Comfort check: 2R + G between 550 and 700 mm (Blondel). */
export function blondel(riser, tread) {
  const value = 2 * riser + tread;
  return { value, ok: value >= 0.55 && value <= 0.7 };
}
