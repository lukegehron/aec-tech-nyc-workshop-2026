# viewer3d — 3D Massing Viewer

Extrudes `public/sample-data/project.json` into an orbitable model. Change the
data and the model changes with it.

> **The building is Navy Yard Commons** — a fictional mixed-use scheme in
> Brooklyn: a site, 3 buildings, 12 floors, 99 spaces and six departments, all
> in `public/sample-data/project.json`. Every rollup agrees with the geometry.


## This scene is Z-up

AEC tools are Z-up — Rhino, Revit, IFC, DWG. three.js is Y-up. This baseplate
follows the industry, not the library: `Scene.jsx` sets
`THREE.Object3D.DEFAULT_UP = (0, 0, 1)` before anything is constructed, so
**height is Z**.

`project.json` predates that decision — its plan coordinates are still named
`[x, z]`, and `lib/projectData.js` is shared workshop code, so those
names stay. The swap happens in exactly one function:

| project.json | three.js |
|---|---|
| `x` (east) | `x` |
| `z` (north) | `y` |
| height | `z` |

`boxFromOutline()` in `geometry.js` is that function. Every brick spreads its
result, so all three view modes came along without changing a line — **don't do
the swap yourself in a brick.** A box's `size` is `[width, depth, height]`.

The payoff is that an imported `.3dm` needs no fix-up rotation.

## The baseplate

| File | What it does |
|---|---|
| `Screen.jsx` | Loads the data, owns the mode and level filters, hover readout |
| `Scene.jsx` | The r3f `<Canvas>`, camera, controls, Z-up, the per-theme palette, box rendering |
| `geometry.js` | `boxFromOutline()` and `sceneFraming()` — the primitives every mode shares |
| `atoms.js` | Jotai state the *baseplate* owns: active view mode, level filter |

`Screen.jsx` has **no list of features** — not of modes, not of tools. It loops
`bricks/bricks.js`.

## A brick here is one thing the viewer can do

It used to be narrower — "a view mode" — and three of the six still are exactly
that. But measuring, slicing and importing aren't ways of turning building data
into boxes, and they aren't mutually exclusive with a view mode: you measure
*while* looking at floors. **So this baseplate widened its own definition, on
purpose, and wrote the new one down.** A brick now declares any of three things:
`buildBoxes` makes it a view mode, `Toolbar` or `Scene3d` make it a tool.

> **The contract lives in [`bricks/bricks.js`](./bricks/bricks.js), not here.**
> All three shapes, every field, plus what's on the brick context — it's the
> authority, it's the widest contract in the repo, and it's the file to read
> before you write anything. This page is only the things it doesn't say.

Two things that catch people and aren't obvious from the contract:

- **A brick's own state goes in its own folder** (`bricks/my-tool-XX/atoms.js`).
  The baseplate's `atoms.js` is for what the *baseplate* owns — which mode,
  which level.
- **`Scene3d` may return `null`** and exist purely to reach the renderer through
  `useThree()`. That's what `z-slice-XX` does to set `gl.clippingPlanes`.

## Bricks (6)

| Brick | Kind | Does | Notes |
|---|---|---|---|
| `massing-XX` | mode | one volume per building | `supportsLevels: false` — no floors to isolate |
| `floors-XX` | mode | stacked floor plates | |
| `spaces-XX` | mode | every room, coloured by department | ships its own `Legend` |
| `measure-XX` | tool | dimension between two picked points | raycasts objects, falls back to the ground plane |
| `z-slice-XX` | tool | clip the model to a horizontal band | drives `gl.clippingPlanes` |
| `rhino-import-XX` | tool | load a Rhino `.3dm` | `rhino3dm` wasm from `public/wasm/rhino3dm/` |

`massing-XX` is the shortest mode and `z-slice-XX` the shortest tool — copy
whichever matches what you're building.

## Ideas

- Cap the Z slice with a real poché'd section (stencil work — three.js clipping
  leaves a solid hollow)
- Explode the floors vertically
- Colour by space type instead of department
- Snap the measure tool to box corners and edges
- Highlight spaces over/under their target area

## Watch out

Never put a suspending loader (drei `Environment`, `useLoader`, `useGLTF`,
`Text`) inside `<Canvas>` — r3f tears down and remounts the renderer, the
disposed renderer calls `forceContextLoss()`, and the canvas can never get a
context again. It fails on **first** load only, which makes it maddening to
debug. Details in `AGENTS.md`. `rhino-import-XX` sidesteps this by parsing in a
DOM event handler and handing the finished `Object3D` to `<primitive>`, so
nothing inside the canvas ever suspends.

`THREE.Object3D.DEFAULT_UP` is a global on `THREE`. Today this is the only
baseplate using three.js; if a second one lands, that's the line to re-check.
