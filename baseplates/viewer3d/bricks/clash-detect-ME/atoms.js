import { atom } from "jotai";

// A tool's state is the tool's business. `../../atoms.js` holds what the
// BASEPLATE owns — which mode is showing, which level is isolated — and a clash
// report is not that. Keeping these here is what lets this brick exist without
// editing the baseplate at all.

/** Is the tool armed? While false the brick draws nothing and tests nothing. */
export const clashActiveAtom = atom(false);

/**
 * "hard"      — solids actually interpenetrate.
 * "clearance" — solids come within `clashToleranceAtom` metres of each other.
 * The two real flavours of clash detection in any BIM tool.
 */
export const clashModeAtom = atom("hard");

/** Clearance distance in metres. Ignored while the mode is "hard". */
export const clashToleranceAtom = atom(0.3);

/**
 * Bumping this is the "run the test now" signal. The test needs the live
 * three.js scene, which only a component inside <Canvas> can reach, so the
 * Toolbar can't run it directly — it asks, and `ClashScene` answers.
 */
export const clashRunTokenAtom = atom(0);

/** `[{ key, position, size, a, b, depth, kind }]` — world space, metres. */
export const clashResultsAtom = atom([]);

/** Which result the user is stepping through, or null. */
export const clashFocusAtom = atom(null);

/** True between asking for a run and getting results back. */
export const clashBusyAtom = atom(false);
