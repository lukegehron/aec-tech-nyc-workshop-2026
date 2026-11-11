import { atom } from "jotai";

// A tool's state is the tool's business — none of this belongs in
// `../../atoms.js`, which holds what the BASEPLATE owns.

/** Is placement armed? While false the brick listens to nothing. */
export const curtainWallActiveAtom = atom(false);

/**
 * Placed walls, in world space (metres, Z-up). Each is
 * `{ id, center: [x, y, z], normal: [nx, ny], width, height }` where `center`
 * sits on the face at the wall's mid-width, `z` is the wall's BASE elevation
 * and `normal` is the outward horizontal face normal.
 */
export const curtainWallsAtom = atom([]);

/** The face under the cursor while armed, same shape as a wall, or null. */
export const curtainWallHoverAtom = atom(null);

/**
 * The parametric controls. They drive every placed wall live, so changing the
 * spacing re-grids the whole facade at once.
 */
export const curtainWallParamsAtom = atom({
  mullionSpacing: 1.5, // target centre-to-centre of vertical mullions, m
  transomSpacing: 3.5, // target centre-to-centre of horizontal transoms, m
  mullionSize: 0.1, // face width of a mullion / transom, m
});
