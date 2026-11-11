import { atom } from "jotai";

// A tool's state is the tool's business. `../../atoms.js` holds what the
// BASEPLATE owns — which mode is showing, which level is isolated — and a
// measurement is not that. Keeping these here is what lets this brick exist
// without editing the baseplate at all.

/** Is the tool armed? While false the brick listens to nothing. */
export const measureActiveAtom = atom(false);

/** [] | [a] | [a, b] — world-space points in metres. Z is elevation. */
export const measurePointsAtom = atom([]);

/** Where the cursor is while picking the second point, for the rubber band. */
export const measureCursorAtom = atom(null);
