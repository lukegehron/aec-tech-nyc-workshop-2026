import { atom } from "jotai";
import { DEFAULT_SETTINGS } from "./bridge";

// The brick's own state. `../../atoms.js` is the baseplate's; this toggle
// belongs to the Bridge tool, so it lives here and the baseplate never changes.
export const bridgeSettingsAtom = atom(DEFAULT_SETTINGS);
