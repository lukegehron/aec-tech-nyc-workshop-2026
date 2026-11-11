import { atom } from "jotai";

// The brick's own state — nothing here belongs to the baseplate.

/**
 * Landmarks placed on the globe:
 * [{ id, name, lat, lon, height, parts }]
 * `parts` is the plain-data model from ./landmarks.js (unit height ≈ 1).
 */
export const placedLandmarksAtom = atom([]);
