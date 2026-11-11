import { atom } from "jotai";

// This brick's own state — it shares nothing with `rhino-import-XX`, so the two
// can be on the canvas together without touching each other's model.

/** `{ object, box, name, bytes, size, center, meshCount }` once loaded. */
export const largeModelAtom = atom(null);

/** "idle" | "reading" | "parsing" */
export const largePhaseAtom = atom("idle");

/** A readable message for the last failure, or null. */
export const largeErrorAtom = atom(null);

/** `{ name, bytes }` of the file being worked on, for the progress line. */
export const largePendingAtom = atom(null);
