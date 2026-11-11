# Your brick goes here

## 1 · What this stub does today

It's a **view mode** that draws one flat box over the whole site outline of
**Navy Yard Commons**, the sample building. About ten lines.

It is **not registered**, so it doesn't appear in the mode rail yet. That's on
purpose: snapping it on is the first thing you do, and it's the whole lesson.

> **This is the heaviest baseplate in the repo.** If you're on it because you
> want 3D, good. If you're on it because it looked easiest, `sketchpad` and
> `flat` are genuinely easier and nobody will judge you.

## 2 · Snap it on — the two lines

Open [`../bricks.js`](../bricks.js). Add one import at the top and one entry to
the array. **Nothing else in that file changes.**

```js
import { yourBrick } from "./_your-brick-here-XX";
```

```js
export const bricks = [
  massingBrick,
  floorsBrick,
  spacesBrick,
  measureBrick,
  zSliceBrick,
  rhinoImportBrick,
  yourBrick,
];
```

Save, look at the browser. There's a new button in the mode rail. **That's a
brick, snapped onto a baseplate, and those two lines are the studs.**

Nobody edited `Scene.jsx`. The rail, the legend and the level filter all read
the registry.

## 3 · Now make it yours

Rename first — folder and `id` to the same name ending in your two initials.
Stay on the git branch named after your GitHub username. Open a new PR for
this folder; facilitators merge.

```
folder   bricks/core-shell-LG/
id       "core-shell-LG"
```

Then give Cline this, which is tested and works in one go:

> In `baseplates/viewer3d/bricks/core-shell-LG/`, change this view mode so it
> returns one box per building instead of one box over the site — read
> `data.buildings`, and use each building's `outline` and `height`. Put the
> building name and its floor count in `meta`. Keep using `boxFromOutline` from
> `../../geometry`. Don't change the baseplate.

Three more, in increasing order of trouble:

> Colour each building box by its `use` — pick a colour per distinct use and set
> `color` on the box. Add a `Legend` component to the brick showing the key.
> Don't change the baseplate.

> Make this a **tool** rather than a view mode: drop `buildBoxes` and add a
> `Toolbar` component with a slider that exaggerates building heights, plus a
> `Scene3d` component that draws a ground-plane outline. Read the contract at
> the top of `../bricks.js` first — a brick here can be a mode *or* a tool.
> Don't change the baseplate.

> Add a sun study: a `Toolbar` with a time-of-day slider and a `Scene3d` that
> moves a `<directionalLight>` using `suncalc` (already installed — it's a
> CommonJS default import) for Brooklyn on the summer solstice. Don't change the
> baseplate.

## The rules, in one line each

- Everything you write stays **inside this folder**.
- `../../geometry` and `../../atoms` are the baseplate. Never import another
  brick.
- **This scene is Z-up** — height is Z, not Y. `boxFromOutline()` knows; you
  don't have to.
- **Never put a suspending loader inside `<Canvas>`** — drei's `Environment`,
  `useLoader`, `useGLTF`. It kills the renderer on first load. See `AGENTS.md`.
- Take colours from the `palette` prop, never from `resolvedTheme`.
- The full contract is at the top of [`../bricks.js`](../bricks.js). Read it —
  this baseplate's is the widest in the repo.
