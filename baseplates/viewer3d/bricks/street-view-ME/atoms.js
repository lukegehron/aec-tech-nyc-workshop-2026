import { atom } from "jotai";

// A tool's state is the tool's business. `../../atoms.js` holds what the
// BASEPLATE owns — which mode is showing, which level is isolated — and "am I
// standing on the pavement" is not that. Keeping these here is what lets this
// brick exist without editing the baseplate.

/** Is the tool armed and waiting for a click? */
export const streetArmedAtom = atom(false);

/**
 * Where the viewer is standing, or null when up in the orbit view.
 *
 *   { eye: [x, y, z], look: [x, y, z], label }
 *
 * World space, metres, Z-up — so the third component is elevation.
 */
export const streetStanceAtom = atom(null);

/**
 * The orbit camera we interrupted, so "Back to orbit" returns to the exact
 * view the user left rather than a guessed default.
 *
 *   { position: [x, y, z], target: [x, y, z], near, far }
 */
export const streetReturnAtom = atom(null);

/** Ground point under the cursor while armed, for the landing preview. */
export const streetPreviewAtom = atom(null);

/** Eye height in metres. Roughly a standing adult. */
export const EYE_HEIGHT = 1.7;
