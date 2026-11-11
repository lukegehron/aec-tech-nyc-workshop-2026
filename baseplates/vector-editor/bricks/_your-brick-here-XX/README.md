# Your brick goes here

## 1 · What this stub does today

It's a **drawing tool**: click anywhere on the canvas and it drops a 40-unit
square, snapped to the grid, in the current style, with working undo. One
handler, about ten lines.

It is **not registered**, so it doesn't appear in the tool rail yet. That's on
purpose: snapping it on is the first thing you do, and it's the whole lesson.

The plan on the canvas is **Navy Yard Commons** — `floor-plan.svg`, the same
building the 3D Viewer orbits.

## 2 · Snap it on — the two lines

Open [`../bricks.js`](../bricks.js). Add one import at the top and one entry to
the array. **Nothing else in that file changes.**

```js
import { yourBrick } from "./_your-brick-here-XX";
```

```js
export const bricks = [
  selectBrick,
  nodeBrick,
  penBrick,
  pencilBrick,
  shapesBrick,
  dimensionBrick,
  panBrick,
  styleBrick,
  layersBrick,
  documentBrick,
  aiBrick,
  exportBrick,
  yourBrick,
];
```

Save, look at the browser. There's a new button in the left rail, and **`y`
activates it** — the keyboard shortcut wired itself up. **That's a brick,
snapped onto a baseplate, and those two lines are the studs.**

Nobody edited `Canvas.jsx`, the tool rail, the shortcut table or the status bar.
All four read the registry.

## 3 · Now make it yours

Rename first — folder and `id` to the same name ending in your two initials.
Stay on the git branch named after your GitHub username. Open a new PR for
this folder; facilitators merge.

```
folder   bricks/hatch-tool-LG/
id       "hatch-tool-LG"
```

(The **brick** id takes your initials. The **tool** id inside it — `"stub"` —
stays plain: that one belongs to the baseplate's contract.)

Then give Claude this, which is tested and works in one go:

> In `baseplates/vector-editor/bricks/hatch-tool-LG/`, change this tool from
> click-to-stamp into click-drag-release: on pointer down remember the start
> point, on pointer up create the rectangle between start and end. Use
> `ctx.setDraft` while dragging, like the `shapes-XX` brick does. Don't change
> the baseplate.

Three more, in increasing order of trouble:

> Add an `Overlay` component to this tool that draws a live preview of the
> rectangle while you drag, reading `draftAtom` from `../../atoms`. The
> `shapes-XX` brick has one to copy. Don't change the baseplate.

> Turn this into a hatch tool: drag a rectangle, then fill it with parallel
> 45° lines at a spacing you can set. Create it as one path with several
> subpaths via `createPath` from `../../model`. Don't change the baseplate.

> Add a **panel** to this brick as well as the tool — a tab in the right-hand
> side panel listing every element on the canvas by name with its area, reading
> `elementsAtom` from `../../atoms`. One brick may ship both. Don't change the
> baseplate.

## The rules, in one line each

- Everything you write stays **inside this folder**.
- `../../atoms`, `../../geometry`, `../../model`, `../../ElementView` are the
  baseplate. Never import another brick.
- `ctx` is rebuilt for every event — the full list of what's on it is in
  `../../toolContext.js`.
- Finish a shape with `ctx.addElements(...)`; it adds, selects and makes one
  undo step for you.
- Pick a `shortcut` nobody's using — the taken ones are visible in the rail.
- The full contract is at the top of [`../bricks.js`](../bricks.js). Read it.
