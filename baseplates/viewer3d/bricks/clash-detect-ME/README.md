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

## The report panel

A **clash report** docks to the right-hand edge of the viewer listing every
clash found, each row naming the two elements involved (`wall-1 ↔ wall-2`,
`door ↔ wall-3`, `Mesh ↔ column`), the depth or gap in metres, and a `HARD` /
`CLR` tag so the two kinds are distinguishable without relying on colour.

- **Click a row** to highlight that clash in the scene — it drives the same
  focus the `‹ ›` arrows do, so the list and the 3D markers stay in step.
- The strip under the header repeats **what was tested** (`hard`, or
  `clearance · closer than 0.3 m`), because a count means nothing without it.
- It still renders when the model is clean, saying **"No clashes found"** —
  hiding the panel then would read as the tool having failed.
- Close it with the `✕`, or the clipboard button in the toolbar. Collapsed, it
  leaves a small tab showing the count.

### Why the panel is a drei `<Html>`

The baseplate gives a brick two extension points — `Toolbar` (HTML, in the
toolbar row) and `Scene3d` (r3f elements, inside `<Canvas>`). There is **no
side-panel slot**, and adding one would mean editing `Screen.jsx`, which a brick
must never do.

drei's `<Html>` is the way out: it renders real DOM and appends it to
`gl.domElement.parentNode`, which here is the Screen's
`relative h-[70vh] … overflow-hidden` canvas wrapper. So an absolutely
positioned card lands docked to the viewer's right edge, clipped to it, exactly
as if the baseplate had offered a slot. `calculatePosition` is pinned to the
origin so it behaves as chrome rather than a label tracking a 3D point, and the
card re-enables `pointer-events` that drei's wrapper disables.

## Why it reads the live scene

The test walks the **live three.js scene graph** rather than rebuilding boxes
from `project.json`. That is what makes it a *model* clash test rather than a
data report: it sees whichever view mode is active, it sees imported `.3dm`
geometry from the Rhino brick, and it sees **walls, doors and windows drawn with
the Walls tool** — without any of them opting in and without this brick knowing
they exist. Bricks don't import each other; they meet in the scene.

Anything can opt out by setting `userData.clashIgnore` on itself or an ancestor,
which is how this brick's own markers avoid being tested as geometry.

## Drawn walls, doors and windows

Walls are tested the moment they exist, and the test **re-runs automatically**
when you draw one, place an opening, or hit Undo in the Walls tool. It does that
by fingerprinting the scene's geometry a few times a second (`sceneSignature`)
rather than subscribing to the other brick's state — which would mean importing
it. Press **Re-run** to force a retest regardless.

Two things were needed to make drawn geometry report correctly:

**1. Each wall is its own element.** Two meshes of the same element never clash,
which is right — a window sill genuinely overlaps the wall pier it sits in, and
flagging that would bury every real result. But the wall tool nests every wall
under one group, so treating "the brick's root group" as the element made two
separate walls look like one object and reported **nothing**. An element is now
the nearest ancestor carrying `userData.clashElement` or `userData.wallId`,
falling back to the top-level object. The wall tool tags every mesh it builds
with `wallId`, so each wall is its own element and its own openings are still
correctly excluded. Any brick can opt into the same treatment with either tag.

**2. Oriented boxes, not just axis-aligned ones.** Walls are drawn at any angle,
and an angled box has a huge axis-aligned bounding box — a 6 m wall at 45°
covers **19.22 m² of plan instead of 1.20 m²**, a 16× over-report, so it would
clash with everything in that square. The AABB is now only the cheap broad
phase; a Separating Axis Theorem test on the **oriented** boxes confirms or
rejects each candidate.

## Known limits — worth saying out loud

- **Box-level, not triangle-level.** Solids are tested as oriented boxes, so
  anything genuinely box-shaped — every massing/floor/space box, every wall
  segment, every door and window — is **exact**, at any angle. A non-boxy
  imported mesh (an L-shaped or curved solid) is still approximated by its
  oriented box and can over-report. Triangle-level testing is a
  `three-mesh-bvh` job, well past what one brick should carry.
- **Reported depth for a hard clash is the thickness of the overlap**, capped at
  the thinnest dimension the two solids share. SAT's raw answer is the minimum
  translation distance, which for two crossing 3 m walls is 3 m — technically
  how far you'd move one to free it, but it reads as nonsense next to a 0.2 m
  wall.
- Solids that merely **touch** are not a clash — floor slabs are built with a
  deliberate `SLAB_GAP` and rooms with a `PLAN_INSET`, and flagging every
  neighbouring surface would make the report useless.
- Two meshes of the **same authored object** never clash with each other.
- Above **1200 solids** it stops and says so rather than locking up the tab.
- Flat sheets (the site plate, the grid) are skipped — infinitely thin geometry
  underneath everything would clash with the whole model and tell you nothing.

Out of the box the sample building is **clear** in hard mode: the floor and space
modes are authored not to overlap. The quickest way to see it fire is the
**Walls** tool — turn both on, draw two walls that cross, and the crossing is
flagged immediately. Otherwise switch to **Clearance** at ~0.3 m to see it flag
the deliberate slab gaps, or import a `.3dm` that lands inside the massing.

## Files

- `index.jsx` — `Toolbar` + `Scene3d`, and the brick export.
- `ClashReport.jsx` — the side panel listing every clash.
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
