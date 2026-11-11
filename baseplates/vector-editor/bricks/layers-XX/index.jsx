"use client";

import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, ChevronUp, Eye, EyeOff, Lock, LockOpen, Ruler, Spline, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  deleteSelectionAtom,
  elementsAtom,
  reorderElementAtom,
  selectionAtom,
  updateElementAtom,
} from "../../atoms";

function LayerRow({ element, selected, onSelect }) {
  const [renaming, setRenaming] = useState(false);
  const updateElement = useSetAtom(updateElementAtom);
  const reorder = useSetAtom(reorderElementAtom);
  const Icon = element.type === "dimension" ? Ruler : Spline;

  return (
    <li
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-1 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent",
        selected && "bg-accent"
      )}
    >
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />

      {renaming ? (
        <Input
          autoFocus
          defaultValue={element.name}
          className="h-6 px-1 text-xs"
          onBlur={(event) => {
            updateElement(element.id, { name: event.target.value || element.name });
            setRenaming(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setRenaming(false);
          }}
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => setRenaming(true)}
          className="flex-1 truncate text-left"
          title="Double-click to rename"
        >
          <span className={cn(element.hidden && "text-muted-foreground line-through")}>
            {element.name}
          </span>
        </button>
      )}

      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 has-[button:focus-visible]:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Bring forward"
          onClick={(event) => {
            event.stopPropagation();
            reorder(element.id, 1);
          }}
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Send backward"
          onClick={(event) => {
            event.stopPropagation();
            reorder(element.id, -1);
          }}
        >
          <ChevronDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={element.locked ? "Unlock" : "Lock"}
          onClick={(event) => {
            event.stopPropagation();
            updateElement(element.id, { locked: !element.locked });
          }}
        >
          {element.locked ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn("size-6", !element.hidden && "opacity-0 group-hover:opacity-100")}
        aria-label={element.hidden ? "Show" : "Hide"}
        onClick={(event) => {
          event.stopPropagation();
          updateElement(element.id, { hidden: !element.hidden });
        }}
      >
        {element.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
    </li>
  );
}

function LayersPanel() {
  const elements = useAtomValue(elementsAtom);
  const [selection, setSelection] = useAtom(selectionAtom);
  const deleteSelection = useSetAtom(deleteSelectionAtom);
  const selected = new Set(selection);

  if (!elements.length) {
    return (
      <Empty className="border-none py-8">
        <EmptyHeader>
          <EmptyTitle className="text-sm">Nothing drawn yet</EmptyTitle>
          <EmptyDescription className="text-xs">
            Draw something, open the sample plan, or ask Claude for geometry.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {elements.length} element{elements.length === 1 ? "" : "s"} · topmost first
        </span>
        {selection.length ? (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={deleteSelection}>
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        ) : null}
      </div>

      {/* The array is in paint order, so the list is reversed: last drawn,
          first listed — the same convention every layers palette uses. */}
      <ul className="-mx-1.5 max-h-[300px] overflow-y-auto">
        {[...elements].reverse().map((element) => (
          <LayerRow
            key={element.id}
            element={element}
            selected={selected.has(element.id)}
            onSelect={() => setSelection([element.id])}
          />
        ))}
      </ul>
    </div>
  );
}

export const layersBrick = {
  id: "layers-XX",
  label: "Layers",
  panels: [{ id: "layers", label: "Layers", order: 20, Panel: LayersPanel }],
};
