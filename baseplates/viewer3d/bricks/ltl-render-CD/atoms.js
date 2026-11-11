import { atom } from "jotai";

/** Is the LTL sketch render on? Off by default. */
export const ltlRenderActiveAtom = atom(false);

/** Add people (entourage) to the sketch. Only meaningful while it is on. */
export const ltlPeopleAtom = atom(false);

