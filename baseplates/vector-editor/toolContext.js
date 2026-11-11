/**
 * `ctx` — the single object every tool handler receives.
 *
 * It is rebuilt from scratch for every event, reading each atom through the
 * Jotai store rather than through a hook. That matters: a pointermove fires
 * far more often than React re-renders, so a value captured in a component
 * closure can easily be one frame stale. `store.get()` is always current.
 */

import {
  activeToolIdAtom,
  addElementsAtom,
  docAtom,
  draftAtom,
  elementsAtom,
  pushHistoryAtom,
  selectionAtom,
  setToolAtom,
  styleAtom,
  viewportAtom,
} from "./atoms";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { getTool } from "./bricks/bricks";

export const snapPoint = (p, step) => ({
  x: Math.round(p.x / step) * step,
  y: Math.round(p.y / step) * step,
});

export function makeToolContext(store, { event, rawPoint, hitId = null } = {}) {
  const doc = store.get(docAtom);
  const tool = getTool(store.get(activeToolIdAtom), store.get(hiddenBrickKeysAtom));
  const point =
    rawPoint && tool.snaps && doc.snap ? snapPoint(rawPoint, doc.grid) : rawPoint;

  return {
    event,
    tool,
    point,
    rawPoint,
    hitId,
    doc,
    viewport: store.get(viewportAtom),
    style: store.get(styleAtom),
    elements: store.get(elementsAtom),
    selection: store.get(selectionAtom),
    draft: store.get(draftAtom),

    setElements: (value) => store.set(elementsAtom, value),
    setSelection: (value) => store.set(selectionAtom, value),
    setDraft: (value) => store.set(draftAtom, value),
    setTool: (value) => store.set(setToolAtom, value),
    pushHistory: () => store.set(pushHistoryAtom),
    /** Adds, selects and pushes one history entry — how tools finish a shape. */
    addElements: (value) => store.set(addElementsAtom, value),
  };
}
