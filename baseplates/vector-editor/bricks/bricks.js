/**
 * This baseplate's brick registry — the inner studs.
 *
 * `lib/baseplates.js` snaps the BASEPLATES into the app.
 * This file snaps this baseplate's BRICKS onto this baseplate.
 *
 * Same two-line contract, one level in: one import above, one array entry
 * below. Nothing else in the editor needs to know your brick exists — the
 * tool rail, the keyboard shortcuts, the status bar and the side panel all
 * read this list. This is the file your team edits during the sprint, and
 * the merge conflict you get here is the same easy one: keep both lines.
 *
 * A BRICK is a plain object. Everything except `id`/`label` is optional, and
 * a brick may contribute a tool, a panel, both, or several of each:
 *
 *   id      unique string
 *   label   human name, for the registry and error messages
 *   tools   [toolObject, …]   drawing tools, drawn in the left rail
 *   panels  [panelObject, …]  tabs in the right-hand side panel
 *
 * A TOOL object:
 *   id        unique string, also the value of `activeToolIdAtom`
 *   label     shown in the toolbar tooltip
 *   icon      a lucide component
 *   shortcut  single lowercase key that activates the tool
 *   order     position in the toolbar (10, 20, 30 … leave gaps)
 *   cursor    CSS cursor while the tool is active
 *   hint      one line shown in the status bar — say what the gestures are
 *   snaps     true to receive grid-snapped points in `ctx.point`
 *
 *   onPointerDown(ctx) / onPointerMove(ctx) / onPointerUp(ctx)
 *   onKeyDown(ctx)     ctx.event is the keyboard event; return true if handled
 *   onDeactivate(ctx)  last chance to finish or discard a gesture
 *   Overlay            React component drawn in canvas space, on top of the
 *                      artwork. Props: { zoom, toWorld, doc }
 *
 *   `ctx` is rebuilt for every event by `Canvas.jsx` — see `makeToolContext`
 *   in `../toolContext.js` for the full list of what's on it.
 *
 * A PANEL object:
 *   id      unique string, used as the tab value
 *   label   the tab label
 *   order   tab position (10, 20, 30 … leave gaps)
 *   Panel   the component; takes no props, talks to `../atoms.js`
 *
 * Everything a brick needs from the BASEPLATE — `../atoms.js`, `../geometry.js`,
 * `../model.js`, `../svgIo.js`, `../ElementView.jsx` — it imports directly.
 * Bricks don't import each other.
 *
 * ---------------------------------------------------------------------------
 * NAMING — folder and id end in your two initials
 * ---------------------------------------------------------------------------
 *   branch   <your GitHub username>     all day. Do not make a new branch.
 *   folder   bricks/hatch-tool-LG/
 *   id       "hatch-tool-LG"
 *   PR       that folder + two lines in this file. Facilitators merge.
 *
 * Everything registered below ends in `-XX` — nobody's initials — because they
 * ship as examples rather than belonging to a specific author.
 *
 * Ids INSIDE a brick — a tool id, a panel id — belong to this baseplate's
 * contract, not to you. Leave those plain.
 *
 * ---------------------------------------------------------------------------
 * KIT — starter tools stay on the rail
 * ---------------------------------------------------------------------------
 * Wrap the `bricks` array with `visibleBricks()`, never tool or panel ids
 * (those stay plain and would all hide). Ids ending in `-XX` default ON.
 * Remix proofs and attendee tools (ids ending in initials) default OFF.
 * Reveal them with the "Add to this surface" tray on this Screen — that kit
 * travels when you dock Vector Editor onto Flat. Scene selection is
 * `lib/scene.js`; this surface does not use it (`usesScene: false`).
 */

import { getDefaultStore } from "jotai";
import { hiddenBrickKeysAtom, visibleBricks } from "@/lib/bricks";

// ── Every brick on this baseplate is imported here, and only here. Yours goes
// ── at the end of the list, then at the end of the array below. Two lines.
import { selectBrick } from "./select-XX";
import { nodeBrick } from "./node-XX";
import { penBrick } from "./pen-XX";
import { pencilBrick } from "./pencil-XX";
import { shapesBrick } from "./shapes-XX";
import { dimensionBrick } from "./dimension-XX";
import { panBrick } from "./pan-XX";
import { styleBrick } from "./style-XX";
import { layersBrick } from "./layers-XX";
import { documentBrick } from "./document-XX";
import { aiBrick } from "./ai-XX";
import { exportBrick } from "./export-XX";
import { bridgeBuilderMH } from "./bridge-builder-MH";

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
  bridgeBuilderMH,
];

function shownBricks(hiddenSet) {
  const hidden =
    hiddenSet === undefined
      ? getDefaultStore().get(hiddenBrickKeysAtom)
      : hiddenSet;
  return visibleBricks("vector-editor", bricks, hidden);
}

function toolsFrom(list) {
  return list.flatMap((brick) => brick.tools ?? []).sort((a, b) => a.order - b.order);
}

function panelsFrom(list) {
  return list.flatMap((brick) => brick.panels ?? []).sort((a, b) => a.order - b.order);
}

// Everything below is derived from the list above. Add a brick and the tool
// rail, the shortcuts and the side panel all update themselves.

export const toolsByOrder = toolsFrom(bricks);
export const panelsByOrder = panelsFrom(bricks);

export function kitTools(hiddenSet) {
  return toolsFrom(shownBricks(hiddenSet));
}

export function kitPanels(hiddenSet) {
  return panelsFrom(shownBricks(hiddenSet));
}

// Falls back to the first tool in the rail rather than throwing, so a
// half-finished brick can't leave the editor with no active tool.
export function getTool(id, hiddenSet) {
  const tools = kitTools(hiddenSet);
  return tools.find((tool) => tool.id === id) ?? tools[0] ?? toolsByOrder[0];
}

export function getToolByShortcut(key, hiddenSet) {
  return kitTools(hiddenSet).find((tool) => tool.shortcut === key);
}
