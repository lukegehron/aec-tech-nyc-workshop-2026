import { atom } from "jotai";

// A tool's state is the tool's business — none of this belongs to the
// baseplate, so it lives here, next to the brick that uses it.

/** null | "wall" | "door" | "window" — which placement tool is armed. */
export const wallToolAtom = atom(null);

/**
 * The model. Plan points are [x, y] in metres on the Z = 0 ground (Z-up).
 *
 *   { id, a: [x, y], b: [x, y], height, thickness,
 *     openings: [ { id, type: "door" | "window", u, width, height, sill } ] }
 *
 * `u` is the opening's centre, measured along the wall from `a`.
 */
export const wallsAtom = atom([]);

/** Previous versions of `wallsAtom`, newest last — what Undo walks back. */
export const wallHistoryAtom = atom([]);

/** Where the wall being drawn starts, or null when nothing is being drawn. */
export const wallDraftStartAtom = atom(null);

/** Snapped cursor on the ground while a wall is being drawn, for the preview. */
export const wallCursorAtom = atom(null);

/** The door/window preview under the cursor: { wallId, type, u, width, height, sill, valid }. */
export const openingPreviewAtom = atom(null);

/** Replace the model and remember the old one, so every edit is undoable. */
export const commitWallsAtom = atom(null, (get, set, next) => {
  set(wallHistoryAtom, [...get(wallHistoryAtom), get(wallsAtom)]);
  set(wallsAtom, next);
});

export const undoWallsAtom = atom(null, (get, set) => {
  const history = get(wallHistoryAtom);
  if (history.length === 0) return;
  set(wallsAtom, history[history.length - 1]);
  set(wallHistoryAtom, history.slice(0, -1));
});
