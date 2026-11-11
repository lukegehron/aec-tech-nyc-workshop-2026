import { atom } from "jotai";

export const wallpaperActiveAtom = atom(false);
export const wallpaperPatternAtom = atom("botanical");
export const wallpaperStatusAtom = atom(
  "Choose a pattern, enable Wallpaper, then click a flat face in an imported .3dm."
);
export const wallpaperApplicationsAtom = atom([]);
