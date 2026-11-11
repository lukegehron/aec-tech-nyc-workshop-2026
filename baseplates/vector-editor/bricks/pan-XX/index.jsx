"use client";

import { Hand } from "lucide-react";

/**
 * The one tool with no event handlers. Panning changes the viewport, which
 * changes the world coordinate under the cursor — feeding that back through
 * the normal `ctx.point` pipeline would chase its own tail. So `Canvas.jsx`
 * looks for the `pans` flag and handles the drag in screen space instead.
 *
 * You never strictly need this tool: a middle-mouse drag pans with any tool
 * active. It exists for trackpads and touch, where there is no middle button.
 */
export const panTool = {
  id: "pan",
  label: "Pan",
  icon: Hand,
  shortcut: "h",
  order: 80,
  cursor: "grab",
  pans: true,
  hint: "Drag to pan · scroll to zoom · a middle-mouse drag pans with any tool active",
};

export const panBrick = {
  id: "pan-XX",
  label: "Pan",
  tools: [panTool],
};
