"use client";

import { useAtomValue, useSetAtom } from "jotai";
import {
  Copy,
  Grid3x3,
  Maximize2,
  Redo2,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  activeToolIdAtom,
  canRedoAtom,
  canUndoAtom,
  deleteSelectionAtom,
  docAtom,
  duplicateSelectionAtom,
  fitViewAtom,
  redoAtom,
  selectionAtom,
  setToolAtom,
  undoAtom,
  viewportAtom,
  zoomByAtom,
} from "./atoms";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { kitTools } from "./bricks/bricks";

function IconAction({ icon: Icon, label, hint, onClick, disabled, active, side = "top" }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon"
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={cn("size-9", active && "text-foreground shadow-sm")}
          >
            <Icon className="size-4" />
          </Button>
        }
      />
      <TooltipContent side={side}>
        {label}
        {hint ? <span className="ml-1 opacity-60">{hint}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The tool rail is generated entirely from `bricks/bricks.js` — it has no
 * list of its own. Add a brick with a `tools` entry and a button appears
 * here, keyboard shortcut and all.
 */
export function ToolRail() {
  const activeToolId = useAtomValue(activeToolIdAtom);
  const setTool = useSetAtom(setToolAtom);
  const hidden = useAtomValue(hiddenBrickKeysAtom);
  const tools = kitTools(hidden);

  return (
    <div className="flex shrink-0 flex-col gap-1 border-r bg-muted/30 p-1.5">
      {tools.map((tool) => (
        <IconAction
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          hint={tool.shortcut?.toUpperCase()}
          side="right"
          active={activeToolId === tool.id}
          onClick={() => setTool(tool.id)}
        />
      ))}
    </div>
  );
}

export function ActionBar() {
  const doc = useAtomValue(docAtom);
  const viewport = useAtomValue(viewportAtom);
  const selection = useAtomValue(selectionAtom);
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);

  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);
  const zoomBy = useSetAtom(zoomByAtom);
  const fitView = useSetAtom(fitViewAtom);
  const duplicate = useSetAtom(duplicateSelectionAtom);
  const remove = useSetAtom(deleteSelectionAtom);
  const setDoc = useSetAtom(docAtom);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b px-1.5 py-1">
      <IconAction icon={Undo2} label="Undo" hint="⌘Z" disabled={!canUndo} onClick={undo} />
      <IconAction icon={Redo2} label="Redo" hint="⇧⌘Z" disabled={!canRedo} onClick={redo} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <IconAction
        icon={Copy}
        label="Duplicate"
        hint="⌘D"
        disabled={!selection.length}
        onClick={duplicate}
      />
      <IconAction
        icon={Trash2}
        label="Delete"
        hint="⌫"
        disabled={!selection.length}
        onClick={remove}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <IconAction icon={ZoomOut} label="Zoom out" onClick={() => zoomBy(1 / 1.25)} />
      <IconAction icon={ZoomIn} label="Zoom in" onClick={() => zoomBy(1.25)} />
      <IconAction icon={Maximize2} label="Fit to drawing" hint="⇧F" onClick={() => fitView()} />
      <IconAction
        icon={Grid3x3}
        label={doc.snap ? "Snapping on" : "Snapping off"}
        active={doc.snap}
        onClick={() => setDoc({ ...doc, snap: !doc.snap })}
      />

      <span className="ml-auto px-2 font-mono text-xs text-muted-foreground">
        {Math.round(viewport.zoom * 100)}%
      </span>
    </div>
  );
}
