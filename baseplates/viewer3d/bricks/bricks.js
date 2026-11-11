/**
 * This baseplate's brick registry — the inner studs.
 *
 * `lib/baseplates.js` snaps the BASEPLATES into the app.
 * This file snaps this baseplate's BRICKS onto this baseplate.
 *
 * Same two-line contract, one level in: one import above, one array entry
 * below. The mode buttons, the level filter, the toolbar and the legend all
 * read this list — `Screen.jsx` has no list of features of its own.
 *
 * ---------------------------------------------------------------------------
 * A BRICK HERE IS: one thing the viewer can do.
 * ---------------------------------------------------------------------------
 * It used to be narrower — "a view mode" — and three of the bricks below still
 * are exactly that. But a measuring tool, a section slice and a file importer
 * are not ways of turning building data into boxes, and they are not mutually
 * exclusive with each other or with a view mode: you measure *while* looking at
 * floors. So a brick now declares any of three things, and most declare one.
 *
 * Every field is optional. A brick with none of them does nothing, harmlessly.
 *
 *   id             unique string, ending in the owner's two initials
 *   label          the button label
 *   hint           tooltip — say what it does
 *   order          position among its peers (10, 20, 30 … leave gaps)
 *
 *   --- makes it a VIEW MODE (exclusive — one at a time, picked in the rail)
 *   buildBoxes(ctx)  returns the array the scene renders. Having this is what
 *                    puts the brick in the mode rail and makes its id a legal
 *                    value of `viewModeAtom`.
 *   supportsLevels   true if the level filter means anything in this mode
 *                    (massing has no floors to isolate, so it's false there)
 *   Legend           optional component rendered under the canvas while this
 *                    mode is active. Props: { data, departments }
 *
 *   --- makes it a TOOL (additive — always available, alongside the mode)
 *   Toolbar          component rendered in the toolbar row, as HTML. This is
 *                    where a toggle, a file picker or a slider goes.
 *                    Props: the brick context (see below).
 *   Scene3d          component rendered INSIDE <Canvas>, so it returns r3f
 *                    elements — <line>, <mesh>, <group> — never HTML.
 *                    Props: the brick context, plus `palette` and `framing`.
 *
 * `ctx` — the brick context — is `{ data, departments }` for `buildBoxes`, and
 * `{ data, departments, framing }` for `Toolbar` and `Scene3d`. `data` is the
 * parsed project.json, `departments` the department lookup, `framing` the
 * camera/grid extents from `../geometry`. `Scene3d` also gets `palette`, the
 * baseplate's per-theme colour set — take your colours from there and you never
 * have to read `resolvedTheme`, which is the rule in CLAUDE.md.
 *
 * A BOX is `{ key, position: [x,y,z], size: [w,d,h], meta: { title, lines } }`
 * plus optional `color`, `level` and `department`. Build one with
 * `boxFromOutline()` from `../../geometry` — that's the primitive every mode
 * shares, and it is also the one place that knows this scene is Z-UP. Height is
 * the Z axis here, not Y. Don't do that swap yourself.
 *
 * A tool that needs state puts its own atoms in its own folder. `../atoms.js`
 * is for state the BASEPLATE owns (which mode, which level) — a brick's toggle
 * is the brick's business, and keeping it local means adding a tool doesn't
 * edit the baseplate either.
 *
 * Bricks don't import each other.
 *
 * ---------------------------------------------------------------------------
 * NAMING — folder and id end in your two initials
 * ---------------------------------------------------------------------------
 *   branch   <your GitHub username>     all day. Do not make a new branch.
 *   folder   bricks/section-box-LG/
 *   id       "section-box-LG"
 *   PR       that folder + two lines in this file. Facilitators merge.
 *
 * Everything registered below ends in `-XX` — nobody's initials — because they
 * ship as examples rather than belonging to a specific author.
 *
 * For a view mode the brick IS the mode, so that id is also the value of
 * `viewModeAtom` — initials and all. The mode button is someone's.
 *
 * ---------------------------------------------------------------------------
 * KIT — starter modes stay on the rail
 * ---------------------------------------------------------------------------
 * Wrap the `bricks` array with `visibleBricks()`, never a nested id.
 * Ids ending in `-XX` default ON. Attendee bricks (ids ending in initials)
 * default OFF. Reveal them with the "Add to this surface" tray on this
 * Screen.
 * Floor isolation is `lib/scene.js` (`usesScene: true`).
 */

import { getDefaultStore } from "jotai";
import { hiddenBrickKeysAtom, visibleBricks } from "@/lib/bricks";

// ── Every brick on this baseplate is imported here, and only here. Yours goes
// ── at the end of the list, then at the end of the array below. Two lines.
import { massingBrick } from "./massing-XX";
import { floorsBrick } from "./floors-XX";
import { spacesBrick } from "./spaces-XX";
import { measureBrick } from "./measure-XX";
import { zSliceBrick } from "./z-slice-XX";
import { rhinoImportBrick } from "./rhino-import-XX";
import { dontClickBrick } from "./dont-click-RH";
import { ltlRenderBrick } from "./ltl-render-CD";
import { spaceshipBrick } from "./spaceship-KC";
import { wallToolLU } from "./wall-tool-LU";
import { empireStateEL } from "./empire-state-EL";
import { clashDetectBrick } from "./clash-detect-ME";

export const bricks = [
  massingBrick,
  floorsBrick,
  spacesBrick,
  measureBrick,
  zSliceBrick,
  rhinoImportBrick,
  dontClickBrick,
  ltlRenderBrick,
  spaceshipBrick,
  wallToolLU,
  empireStateEL,
  clashDetectBrick,
];

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

function shownBricks(hiddenSet) {
  const hidden =
    hiddenSet === undefined
      ? getDefaultStore().get(hiddenBrickKeysAtom)
      : hiddenSet;
  return visibleBricks("viewer3d", bricks, hidden);
}

function modesOf(list) {
  return list.filter((b) => b.buildBoxes).sort(byOrder);
}

function toolbarsOf(list) {
  return list.filter((b) => b.Toolbar).sort(byOrder);
}

function scenesOf(list) {
  return list.filter((b) => b.Scene3d).sort(byOrder);
}

/** The exclusive ones — a brick earns a place in the mode rail by building boxes. */
export const modesByOrder = modesOf(bricks);

/** The additive ones. Both lists are derived, so neither has to be maintained. */
export const toolbarBricks = toolbarsOf(bricks);
export const sceneBricks = scenesOf(bricks);

export function kitModes(hiddenSet) {
  return modesOf(shownBricks(hiddenSet));
}

export function kitToolbars(hiddenSet) {
  return toolbarsOf(shownBricks(hiddenSet));
}

export function kitScenes(hiddenSet) {
  return scenesOf(shownBricks(hiddenSet));
}

// Falls back to the first mode rather than throwing, so a half-finished brick
// can't leave the viewer with nothing to draw.
export function getMode(id, hiddenSet) {
  const modes = kitModes(hiddenSet);
  return modes.find((mode) => mode.id === id) ?? modes[0] ?? modesByOrder[0];
}
