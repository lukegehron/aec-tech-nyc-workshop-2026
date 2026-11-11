"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AppWindow, BrickWall, DoorOpen, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  commitWallsAtom,
  openingPreviewAtom,
  undoWallsAtom,
  wallCursorAtom,
  wallDraftStartAtom,
  wallHistoryAtom,
  wallToolAtom,
  wallsAtom,
} from "./atoms";
import { OPENINGS, WALL } from "./model";
import { WallScene } from "./WallScene";

/**
 * WALLS — draw walls on the ground, then drop doors and windows into them.
 *
 * A TOOL, not a view mode: it builds no boxes, so it never enters the mode
 * rail and works on top of whichever mode is showing. `Toolbar` arms one of
 * three placement tools; `Scene3d` draws the model and listens for clicks.
 *
 * Openings are real holes — a wall is rebuilt as solid pieces around them
 * (see `model.js`). State is in-memory jotai atoms in this folder; it resets
 * on reload.
 */

const d = OPENINGS.door;
const w = OPENINGS.window;

const TOOLS = [
  {
    id: "wall",
    label: "Wall",
    Icon: BrickWall,
    title: `Click corners on the ground to draw ${WALL.height} m walls. Click the last corner again or press Esc to finish.`,
  },
  {
    id: "door",
    label: "Door",
    Icon: DoorOpen,
    title: `Click a wall to place a ${d.width} × ${d.height} m door.`,
  },
  {
    id: "window",
    label: "Window",
    Icon: AppWindow,
    title: `Click a wall to place a ${w.width} × ${w.height} m window, ${w.sill} m sill.`,
  },
];

function statusText(tool, { walls, start, preview }) {
  if (tool === "wall") {
    return start
      ? "click the next corner · same point or Esc to finish"
      : "click the ground to start a wall";
  }
  if (walls.length === 0) return "draw a wall first";
  if (!preview) return `hover a wall to place a ${tool}`;
  return preview.valid ? `click to place the ${tool}` : `the ${tool} doesn't fit there`;
}

function WallToolbar() {
  const [tool, setTool] = useAtom(wallToolAtom);
  const walls = useAtomValue(wallsAtom);
  const history = useAtomValue(wallHistoryAtom);
  const commit = useSetAtom(commitWallsAtom);
  const undo = useSetAtom(undoWallsAtom);
  const [start, setStart] = useAtom(wallDraftStartAtom);
  const setCursor = useSetAtom(wallCursorAtom);
  const [preview, setPreview] = useAtom(openingPreviewAtom);

  const clearDraft = () => {
    setStart(null);
    setCursor(null);
    setPreview(null);
  };

  const openings = walls.flatMap((wall) => wall.openings);
  const doors = openings.filter((o) => o.type === "door").length;
  const windows = openings.length - doors;

  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      {TOOLS.map(({ id, label, Icon, title }) => (
        <Button
          key={id}
          size="sm"
          variant={tool === id ? "secondary" : "ghost"}
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => {
            setTool(tool === id ? null : id);
            clearDraft();
          }}
          title={title}
        >
          <Icon className="size-3.5" />
          {label}
        </Button>
      ))}

      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 px-0"
        onClick={() => {
          undo();
          clearDraft();
        }}
        disabled={history.length === 0}
        title="Undo the last wall, door or window"
      >
        <Undo2 className="size-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 px-0"
        onClick={() => {
          commit([]);
          clearDraft();
        }}
        disabled={walls.length === 0}
        title="Remove every wall (undoable)"
      >
        <Trash2 className="size-3.5" />
      </Button>

      <span className="px-1 font-mono text-xs tabular-nums text-muted-foreground">
        {tool
          ? statusText(tool, { walls, start, preview })
          : `${walls.length} walls · ${doors} doors · ${windows} windows`}
      </span>
    </div>
  );
}

export const wallToolLU = {
  id: "wall-tool-LU",
  label: "Walls",
  hint: "Draw walls, then place doors and windows into them",
  order: 70,
  Toolbar: WallToolbar,
  Scene3d: WallScene,
};
