/**
 * All editor state, in one file, scoped to this brick.
 *
 * Two kinds of atom live here and it's worth knowing which is which:
 *
 *   **State atoms** (`elementsAtom`, `selectionAtom`, …) hold values. Read them
 *   with `useAtomValue`, write them with `useSetAtom`.
 *
 *   **Action atoms** (`pushHistoryAtom`, `deleteSelectionAtom`, …) hold no
 *   value — they're `atom(null, (get, set) => …)` write-only atoms, Jotai's
 *   version of a reducer action. Anything that touches several atoms at once
 *   belongs in one, so the logic lives here instead of being copy-pasted into
 *   every component that needs it.
 */

import { atom } from "jotai";
import {
  DEFAULT_STYLE,
  createPath,
  elementBounds,
  nextId,
  selectionBounds,
  translateElement,
} from "./model";
import { unionBounds } from "./geometry";

/** The drawing sheet. One unit = `mmPerUnit` millimetres. */
export const DEFAULT_DOC = {
  name: "Untitled plan",
  width: 2000, // units — 20 m at the default scale
  height: 1400, // units — 14 m
  mmPerUnit: 10,
  grid: 50, // units between grid lines — 500 mm
  snap: true,
  showGrid: true,
};

// --- state ------------------------------------------------------------------

/** Paint order: later in the array means drawn on top. */
export const elementsAtom = atom([]);
export const selectionAtom = atom([]); // element ids
export const docAtom = atom(DEFAULT_DOC);
export const styleAtom = atom(DEFAULT_STYLE); // style for the *next* thing drawn
export const activeToolIdAtom = atom("select");
export const viewportAtom = atom({ x: 40, y: 40, zoom: 0.45 });

/** Scratch space for the tool that's mid-gesture. Cleared on tool change. */
export const draftAtom = atom(null);

/** Measured by `Canvas`, so zoom and fit can be driven from anywhere. */
export const canvasSizeAtom = atom({ width: 800, height: 520 });

/** Purely cosmetic: drives the status bar and the hover highlight. */
export const cursorAtom = atom(null);
export const hoveredIdAtom = atom(null);

// --- derived ----------------------------------------------------------------

export const selectedElementsAtom = atom((get) => {
  const ids = new Set(get(selectionAtom));
  return get(elementsAtom).filter((e) => ids.has(e.id));
});

export const selectionBoundsAtom = atom((get) =>
  selectionBounds(get(elementsAtom), get(selectionAtom))
);

export const contentBoundsAtom = atom((get) =>
  unionBounds(get(elementsAtom).filter((e) => !e.hidden).map(elementBounds))
);

// --- viewport ---------------------------------------------------------------

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 20;
const FIT_PADDING = 32; // screen px

const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/**
 * Zoom by `factor` while keeping the world point under `screenPoint` pinned.
 * That pinning is the whole trick to zoom-under-cursor: solve the screen
 * transform for the new pan so the same world coordinate lands in the same
 * place.
 */
export const zoomAtAtom = atom(null, (get, set, factor, screenPoint) => {
  const vp = get(viewportAtom);
  const zoom = clampZoom(vp.zoom * factor);
  if (zoom === vp.zoom) return;
  const world = { x: (screenPoint.x - vp.x) / vp.zoom, y: (screenPoint.y - vp.y) / vp.zoom };
  set(viewportAtom, {
    zoom,
    x: screenPoint.x - world.x * zoom,
    y: screenPoint.y - world.y * zoom,
  });
});

/** Zoom about the middle of the canvas — what the +/− buttons use. */
export const zoomByAtom = atom(null, (get, set, factor) => {
  const { width, height } = get(canvasSizeAtom);
  set(zoomAtAtom, factor, { x: width / 2, y: height / 2 });
});

/** Frame `bounds`, or the drawing, or the sheet — in that order of preference. */
export const fitViewAtom = atom(null, (get, set, bounds) => {
  const doc = get(docAtom);
  const { width, height } = get(canvasSizeAtom);
  const box =
    bounds ??
    get(contentBoundsAtom) ?? { minX: 0, minY: 0, maxX: doc.width, maxY: doc.height };

  const boxWidth = Math.max(box.maxX - box.minX, 1);
  const boxHeight = Math.max(box.maxY - box.minY, 1);
  const zoom = clampZoom(
    Math.min((width - FIT_PADDING * 2) / boxWidth, (height - FIT_PADDING * 2) / boxHeight)
  );
  set(viewportAtom, {
    zoom,
    x: (width - boxWidth * zoom) / 2 - box.minX * zoom,
    y: (height - boxHeight * zoom) / 2 - box.minY * zoom,
  });
});

// --- history ----------------------------------------------------------------

const HISTORY_LIMIT = 50;

export const historyAtom = atom({ past: [], future: [] });
export const canUndoAtom = atom((get) => get(historyAtom).past.length > 0);
export const canRedoAtom = atom((get) => get(historyAtom).future.length > 0);

const snapshot = (get) => ({ elements: get(elementsAtom), selection: get(selectionAtom) });

const restore = (set, state) => {
  set(elementsAtom, state.elements);
  set(selectionAtom, state.selection);
};

/**
 * Call this *before* a change you want to be undoable. Elements are immutable,
 * so a "snapshot" is just a reference to the current array — cheap.
 *
 * During a drag, push once on pointerdown and then mutate freely: the whole
 * drag collapses into a single undo step, which is what a user expects.
 */
export const pushHistoryAtom = atom(null, (get, set) => {
  const { past } = get(historyAtom);
  set(historyAtom, {
    past: [...past, snapshot(get)].slice(-HISTORY_LIMIT),
    future: [],
  });
});

export const undoAtom = atom(null, (get, set) => {
  const { past, future } = get(historyAtom);
  if (!past.length) return;
  const current = snapshot(get);
  set(historyAtom, { past: past.slice(0, -1), future: [current, ...future] });
  restore(set, past[past.length - 1]);
  set(draftAtom, null);
});

export const redoAtom = atom(null, (get, set) => {
  const { past, future } = get(historyAtom);
  if (!future.length) return;
  const current = snapshot(get);
  set(historyAtom, { past: [...past, current], future: future.slice(1) });
  restore(set, future[0]);
  set(draftAtom, null);
});

// --- actions ----------------------------------------------------------------

/** Switching tools always abandons whatever gesture was in flight. */
export const setToolAtom = atom(null, (get, set, toolId) => {
  if (get(activeToolIdAtom) === toolId) return;
  set(activeToolIdAtom, toolId);
  set(draftAtom, null);
});

export const addElementsAtom = atom(null, (get, set, incoming, { select = true } = {}) => {
  const added = Array.isArray(incoming) ? incoming : [incoming];
  if (!added.length) return;
  set(pushHistoryAtom);
  set(elementsAtom, [...get(elementsAtom), ...added]);
  if (select) set(selectionAtom, added.map((e) => e.id));
});

/** Patch one element. `patch` may be an object or `(element) => partial`. */
export const updateElementAtom = atom(null, (get, set, id, patch) => {
  set(
    elementsAtom,
    get(elementsAtom).map((e) =>
      e.id === id ? { ...e, ...(typeof patch === "function" ? patch(e) : patch) } : e
    )
  );
});

export const deleteSelectionAtom = atom(null, (get, set) => {
  const ids = new Set(get(selectionAtom));
  if (!ids.size) return;
  set(pushHistoryAtom);
  set(elementsAtom, get(elementsAtom).filter((e) => !ids.has(e.id)));
  set(selectionAtom, []);
});

export const duplicateSelectionAtom = atom(null, (get, set) => {
  const ids = new Set(get(selectionAtom));
  if (!ids.size) return;
  const doc = get(docAtom);
  const offset = doc.grid;
  const copies = get(elementsAtom)
    .filter((e) => ids.has(e.id))
    .map((e) => ({
      ...translateElement(e, offset, offset),
      id: nextId(e.type),
      name: `${e.name} copy`,
    }));
  set(pushHistoryAtom);
  set(elementsAtom, [...get(elementsAtom), ...copies]);
  set(selectionAtom, copies.map((e) => e.id));
});

export const nudgeSelectionAtom = atom(null, (get, set, dx, dy) => {
  const ids = new Set(get(selectionAtom));
  if (!ids.size) return;
  set(pushHistoryAtom);
  set(
    elementsAtom,
    get(elementsAtom).map((e) => (ids.has(e.id) ? translateElement(e, dx, dy) : e))
  );
});

/** Move one element through the paint order. `to` is a delta or "front"/"back". */
export const reorderElementAtom = atom(null, (get, set, id, to) => {
  const elements = [...get(elementsAtom)];
  const from = elements.findIndex((e) => e.id === id);
  if (from < 0) return;
  const [element] = elements.splice(from, 1);
  const index =
    to === "front"
      ? elements.length
      : to === "back"
        ? 0
        : Math.min(elements.length, Math.max(0, from + to));
  elements.splice(index, 0, element);
  set(pushHistoryAtom);
  set(elementsAtom, elements);
});

/** Apply a style patch to the selection, and to whatever gets drawn next. */
export const applyStyleAtom = atom(null, (get, set, patch, { commit = true } = {}) => {
  set(styleAtom, { ...get(styleAtom), ...patch });
  const ids = new Set(get(selectionAtom));
  if (!ids.size) return;
  if (commit) set(pushHistoryAtom);
  set(
    elementsAtom,
    get(elementsAtom).map((e) =>
      ids.has(e.id) ? { ...e, style: { ...e.style, ...patch } } : e
    )
  );
});

/** Replace the whole drawing — used by Open, Import and Clear. */
export const loadSceneAtom = atom(null, (get, set, elements, doc) => {
  set(pushHistoryAtom);
  set(elementsAtom, elements);
  set(selectionAtom, []);
  set(draftAtom, null);
  if (doc) set(docAtom, { ...get(docAtom), ...doc });
});

/** A convenience for the AI panel: drop raw `d` strings onto the canvas. */
export const addPathsFromDataAtom = atom(null, (get, set, paths) => {
  const style = get(styleAtom);
  const elements = paths.map((p) =>
    createPath(p.subPaths, { ...style, ...p.style }, p.name || "Path")
  );
  set(addElementsAtom, elements);
  return elements.length;
});
