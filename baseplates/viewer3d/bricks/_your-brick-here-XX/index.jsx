// ─── THE STUB ────────────────────────────────────────────────────────────────
// A working VIEW MODE that draws one box around the whole site. It is NOT
// registered yet — snapping it on is your job, and it takes two lines. See the
// README next to this file.
//
// A brick on this baseplate can be three things (a view mode, a toolbar tool, a
// thing rendered inside the Canvas). This stub is the first and simplest: one
// function that turns building data into boxes.

import { boxFromOutline } from "../../geometry";

export const yourBrick = {
  // Two things, one name: this id and the folder. Swap `_your-brick-here-XX`
  // for `<something>-<your initials>`. Your git branch is your GitHub username.
  // On this baseplate a view mode's id is also the value of `viewModeAtom`.
  id: "_your-brick-here-XX",
  label: "Your mode",
  hint: "One box over the whole site — change me",
  order: 90,

  // There are no floors in this mode, so the level filter has nothing to do.
  supportsLevels: false,

  // The whole contract for a view mode: return an array of boxes. Build each
  // one with `boxFromOutline()` — it is the only place that knows this scene is
  // Z-UP (height is Z, not Y). Don't do that swap yourself.
  buildBoxes({ data }) {
    return [
      {
        key: "site",
        ...boxFromOutline(data.site.outline, { base: 0, height: 4 }),
        meta: {
          title: data.project.name,
          lines: ["Your view mode", "Every box you return shows up here"],
        },
      },
    ];
  },
};
