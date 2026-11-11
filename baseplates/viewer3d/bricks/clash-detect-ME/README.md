# clash-detect-ME

Model clash detection for the 3D Viewer. Find where the model runs into itself.

A **tool**, not a view mode — it builds no boxes, so it never appears in the
mode rail, and it keeps working whichever mode is showing. It uses both additive
extension points: `Toolbar` for the controls, `Scene3d` for the markers.

## What it does

Hit **Clash** and it tests every solid in the scene against every other one,
then marks each hit with a translucent box over the exact overlap volume plus a
wireframe cage so thin overlaps stay findable. Two flavours, the same two every
BIM clash tool offers:

- **Hard** — solids that actually interpenetrate. Reported as a depth in metres.
- **Clearance** — solids that come within a tolerance of each other (slider,
  0.1–2.0 m). Reported as a gap.

The readout shows the count, which two elements are involved, and `‹ ›` arrows
to step through the list. Results are sorted **worst first**. The focused clash
gets a label and a brighter marker. **Re-run** retests — do that after importing
a model or switching view mode.

## Why it reads the live scene

The test walks the **live three.js scene graph** rather than rebuilding boxes
from `project.json`. That is what makes it a *model* clash test rather than a
data report: it sees whichever view mode is active, and it sees imported `.3dm`
geometry from the Rhino brick, without either of them opting in and without this
brick knowing they exist. Bricks don't import each other — they meet in the
scene.

Anything can opt out by setting `userData.clashIgnore` on itself or an ancestor,
which is how this brick's own markers avoid being tested as geometry.

## Known limits — worth saying out loud

- **Axis-aligned bounding boxes, not triangle-level intersection.** Every solid
  this baseplate builds is an axis-aligned box, so for the building itself the
  AABB *is* the geometry and the result is exact. For a **rotated imported
  mesh** the AABB is conservative and can over-report. Triangle-level testing is
  a `three-mesh-bvh` job, well past what one brick should carry.
- Solids that merely **touch** are not a clash — floor slabs are built with a
  deliberate `SLAB_GAP` and rooms with a `PLAN_INSET`, and flagging every
  neighbouring surface would make the report useless.
- Two meshes of the **same authored object** never clash with each other.
- Above **1200 solids** it stops and says so rather than locking up the tab.
- Flat sheets (the site plate, the grid) are skipped — infinitely thin geometry
  underneath everything would clash with the whole model and tell you nothing.

Out of the box the sample building is **clear** in hard mode: the floor and space
modes are authored not to overlap. Switch to **Clearance** at ~0.3 m to see it
flag the deliberate slab gaps, or import a `.3dm` that lands inside the massing
to see real hard clashes.

## Files

- `index.jsx` — `Toolbar` + `Scene3d`, and the brick export.
- `clash.js` — the test. Plain data in, plain data out, no r3f.
- `atoms.js` — this tool's own state. The baseplate's `../../atoms.js` holds what
  the *baseplate* owns (mode, level); a clash report is not that, and keeping it
  local is what lets this brick exist without editing the baseplate.

## Snapped on with two lines

In [`../bricks.js`](../bricks.js), and nothing else in that file:

```js
import { clashDetectBrick } from "./clash-detect-ME";
```

```js
  clashDetectBrick,
```

Its id ends in initials, so per the kit rule it defaults **off** on this
surface — reveal it with **Add to this surface** on the viewer Screen.
