import { atom } from "jotai";

/** A brick id from `bricks/bricks.js` — massing-XX | floors-XX | spaces-XX. */
export const viewModeAtom = atom("massing-XX");

/** Isolated floor — same id the board Filters use. */
export { sceneFloorIdAtom as levelFilterAtom } from "@/lib/scene";
