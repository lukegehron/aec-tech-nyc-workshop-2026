import { atom } from "jotai";

// A tool's state is the tool's business — none of this belongs in
// `../../atoms.js`, which holds what the BASEPLATE owns.

/** Is placement armed? While false the brick listens to nothing. */
export const stairActiveAtom = atom(false);

/**
 * Placed stairs. Each is
 * `{ id, center: [x, y], buildingId, buildingName, outline,
 *    floors: [{ level, elevation, height }] }`
 * — snapshots of the building's footprint and storeys, so a stair never has
 * to look its building up again.
 */
export const stairsAtom = atom([]);

/** Placement preview while armed: `{ center: [x, y], building } | null`. */
export const stairHoverAtom = atom(null);

/**
 * The parametric controls. They drive every placed stair live.
 * Riser height is a MAXIMUM: each storey gets as many equal risers as it
 * needs to stay at or under it.
 */
export const stairParamsAtom = atom({
  maxRiser: 0.18, // m
  tread: 0.28, // going, m
  width: 1.2, // clear width of one flight, m
  rotation: 0, // degrees about Z, multiples of 90
  toRoof: false, // also climb the top floor's height to the roof
  xray: true, // ghost the parts of the stair hidden inside the massing
});
