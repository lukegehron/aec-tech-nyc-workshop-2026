"use client";

// ─── THE STUB ────────────────────────────────────────────────────────────────
// A working drawing TOOL that drops a fixed-size square wherever you click. It
// is NOT registered yet — snapping it on is your job, and it takes two lines.
// See the README next to this file.
//
// A brick here can contribute tools, panels, or both. This stub is one tool
// with one handler — about as small as a tool gets.

import { Stamp } from "lucide-react";
import { rectSubPaths } from "../../geometry";
import { createPath } from "../../model";

const SIZE = 40;

export const yourTool = {
  // Ids INSIDE a brick stay plain — a tool id belongs to the baseplate's
  // contract, not to you. Only the brick id below carries your initials.
  id: "stub",
  label: "Your tool",
  icon: Stamp,
  shortcut: "y",
  order: 90,
  cursor: "crosshair",
  snaps: true,
  hint: "Click to drop a square — change me",

  onPointerUp(ctx) {
    // `addElements` adds, selects and pushes one history entry — so undo works
    // without this brick knowing anything about the undo stack.
    ctx.addElements([
      createPath(
        rectSubPaths(ctx.point.x - SIZE / 2, ctx.point.y - SIZE / 2, SIZE, SIZE),
        ctx.style,
        "Square"
      ),
    ]);
  },
};

export const yourBrick = {
  // Two things, one name: this id and the folder. Swap `_your-brick-here-XX`
  // for `<something>-<your initials>`. Your git branch is your GitHub username.
  id: "_your-brick-here-XX",
  label: "Your tool",
  tools: [yourTool],
};
