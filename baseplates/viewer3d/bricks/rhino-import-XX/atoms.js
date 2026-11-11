import { atom } from "jotai";

/**
 * `null` or `{ object, name, size, center, meshCount }`.
 * `object` is a live THREE.Object3D — the brick that put it here is the brick
 * that disposes it.
 */
export const rhinoModelAtom = atom(null);

/** "idle" | "loading" | an error message. */
export const rhinoStatusAtom = atom("idle");
