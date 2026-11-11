"use client";

import { useEffect } from "react";
import { useStore } from "jotai";
import {
  activeToolIdAtom,
  cursorAtom,
  deleteSelectionAtom,
  docAtom,
  draftAtom,
  duplicateSelectionAtom,
  elementsAtom,
  fitViewAtom,
  nudgeSelectionAtom,
  redoAtom,
  reorderElementAtom,
  selectionAtom,
  setToolAtom,
  undoAtom,
} from "./atoms";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { getTool, getToolByShortcut } from "./bricks/bricks";
import { makeToolContext } from "./toolContext";

/**
 * Keyboard shortcuts, in one place.
 *
 * The listener is on `window` rather than on the editor, so the shortcuts work
 * without clicking the canvas first — with one guard: anything typed into a
 * form control is left alone, or renaming a layer would delete it instead.
 *
 * The active tool gets first refusal on every key (that's how Pen handles
 * Enter and Escape). Return `true` from a tool's `onKeyDown` to stop here.
 */

const isTypingTarget = (target) =>
  Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));

export default function useShortcuts() {
  const store = useStore();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;
      const meta = event.metaKey || event.ctrlKey;
      const key = event.key;

      const hidden = store.get(hiddenBrickKeysAtom);
      const tool = getTool(store.get(activeToolIdAtom), hidden);
      if (tool.onKeyDown) {
        const ctx = makeToolContext(store, { event, rawPoint: store.get(cursorAtom) });
        if (tool.onKeyDown(ctx)) {
          event.preventDefault();
          return;
        }
      }

      if (meta && key.toLowerCase() === "z") {
        event.preventDefault();
        store.set(event.shiftKey ? redoAtom : undoAtom);
        return;
      }
      if (meta && key.toLowerCase() === "d") {
        event.preventDefault();
        store.set(duplicateSelectionAtom);
        return;
      }
      if (meta && key.toLowerCase() === "a") {
        event.preventDefault();
        store.set(
          selectionAtom,
          store.get(elementsAtom).filter((e) => !e.hidden && !e.locked).map((e) => e.id)
        );
        return;
      }
      if (meta) return; // leave every other browser shortcut alone

      if (key === "Delete" || key === "Backspace") {
        event.preventDefault();
        store.set(deleteSelectionAtom);
        return;
      }
      if (key === "Escape") {
        store.set(draftAtom, null);
        store.set(selectionAtom, []);
        return;
      }
      if (key.startsWith("Arrow")) {
        event.preventDefault();
        const doc = store.get(docAtom);
        // Plain arrow = one grid square, Shift = ten, Alt = one unit.
        const step = event.altKey ? 1 : doc.grid * (event.shiftKey ? 10 : 1);
        const [dx, dy] = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }[key] ?? [0, 0];
        store.set(nudgeSelectionAtom, dx, dy);
        return;
      }
      if (key === "[" || key === "]") {
        const selection = store.get(selectionAtom);
        if (selection.length === 1) store.set(reorderElementAtom, selection[0], key === "]" ? 1 : -1);
        return;
      }
      if (key === "F" && event.shiftKey) {
        store.set(fitViewAtom);
        return;
      }

      const shortcutTool = getToolByShortcut(key.toLowerCase(), hidden);
      if (shortcutTool && !event.shiftKey) store.set(setToolAtom, shortcutTool.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store]);
}
