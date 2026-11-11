import { atom } from "jotai";

/** Is the slice cutting? */
export const zSliceActiveAtom = atom(false);

/**
 * [bottom, top] in metres above grade — the band of the model left visible.
 * `null` until the tool is first armed, because the sensible top is the height
 * of the tallest building and only the baseplate's `framing` knows that.
 */
export const zSliceRangeAtom = atom(null);
