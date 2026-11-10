"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  GripVertical,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getBaseplate } from "@/lib/baseplates";
import { getCard } from "./bricks/bricks";
import {
  GRID_COLS,
  MAX_ROW_HEIGHT,
  MIN_COL_SPAN,
  MIN_ROW_HEIGHT,
  clamp,
  occupantKey,
  readOccupantPayload,
  writeOccupantPayload,
} from "./layout";

function tileLabel(tile) {
  if (tile.occupant.type === "card") {
    return getCard(tile.occupant.id)?.label ?? tile.occupant.id;
  }
  if (tile.occupant.type === "brick") {
    const brick = findListedBrick(tile.occupant.baseplateId, tile.occupant.id);
    return brick?.label ?? tile.occupant.id;
  }
  return getBaseplate(tile.occupant.id)?.label ?? tile.occupant.id;
}

function tileHint(tile) {
  if (tile.occupant.type === "card") {
    return getCard(tile.occupant.id)?.hint ?? "";
  }
  if (tile.occupant.type === "brick") {
    const baseplate = getBaseplate(tile.occupant.baseplateId);
    return baseplate?.label ?? tile.occupant.baseplateId;
  }
  return getBaseplate(tile.occupant.id)?.description ?? "baseplate";
}

function findListedBrick(baseplateId, brickId) {
  const bricks = getBaseplate(baseplateId)?.listBricks?.() ?? [];
  return bricks.find((brick) => brick.id === brickId) ?? null;
}

export function occupantUsesScene(occupant) {
  if (!occupant) return false;
  if (occupant.type === "baseplate") {
    return Boolean(getBaseplate(occupant.id)?.usesScene);
  }
  if (occupant.type === "brick") {
    return Boolean(getBaseplate(occupant.baseplateId)?.usesScene);
  }
  return false;
}

export function WorkspaceBar({
  tileCount,
  hiddenCount,
  canAddAll,
  onExport,
  onImportFile,
  onReset,
  onAddAll,
  onRemoveAll,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-auto text-sm text-muted-foreground">
        {tileCount} on the board
        {hiddenCount > 0
          ? ` · ${hiddenCount} tucked away`
          : " · drag the grip to reorder, the corner to resize"}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="size-3.5" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<label />}
        >
          <Upload className="size-3.5" />
          Import
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onImportFile(file);
            }}
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canAddAll}
          onClick={onAddAll}
        >
          <Plus className="size-3.5" />
          Add all
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={tileCount === 0}
          onClick={onRemoveAll}
        >
          <Minus className="size-3.5" />
          Remove all
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function matchesQuery(query, ...values) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(needle),
  );
}

export function SurfaceTray({ cards, baseplates, bricks = [], onAdd }) {
  const [query, setQuery] = useState("");
  const empty =
    cards.length === 0 && baseplates.length === 0 && bricks.length === 0;
  const shownCards = cards.filter((card) =>
    matchesQuery(query, card.label, card.hint),
  );
  const shownBaseplates = baseplates.filter((baseplate) =>
    matchesQuery(query, baseplate.label, baseplate.description),
  );
  const shownBricks = bricks.filter((entry) =>
    matchesQuery(query, entry.label),
  );
  const noMatches =
    !empty &&
    query.trim() &&
    shownCards.length === 0 &&
    shownBaseplates.length === 0 &&
    shownBricks.length === 0;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-xs text-muted-foreground">
          {empty
            ? "Other baseplates land here as they unlock — drag one onto the board"
            : "Drag onto the board, or click to add"}
        </p>
        <div className="relative w-full min-w-40 sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Filter other baseplates"
            className="h-7 bg-background pl-7 text-xs md:text-xs"
          />
        </div>
      </div>
      {empty ? null : (
        <div className="flex flex-wrap items-center gap-2">
          {shownCards.map((card) => (
            <TrayChip
              key={`card:${card.id}`}
              label={card.label}
              occupant={{ type: "card", id: card.id }}
              onAdd={onAdd}
            />
          ))}
          {shownBaseplates.map((baseplate) => (
            <TrayChip
              key={`baseplate:${baseplate.id}`}
              label={baseplate.label}
              occupant={{ type: "baseplate", id: baseplate.id }}
              onAdd={onAdd}
            />
          ))}
          {shownBricks.map((entry) => (
            <TrayChip
              key={occupantKey(entry.occupant)}
              label={entry.label}
              occupant={entry.occupant}
              onAdd={onAdd}
            />
          ))}
          {noMatches ? (
            <p className="text-xs text-muted-foreground">No matches</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function TrayChip({ label, occupant, onAdd }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        writeOccupantPayload(event.dataTransfer, occupant);
        event.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onAdd(occupant)}
      className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
    >
      {label}
    </button>
  );
}

export function WorkspaceGrid({
  tiles,
  expandedTileId,
  cards,
  onPlace,
  onReorder,
  onResize,
  onToggleCollapsed,
  onToggleExpanded,
  onRemove,
}) {
  const gridRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const expanded = tiles.find((tile) => tile.id === expandedTileId) ?? null;
  const shown = expanded ? [expanded] : tiles;

  const handleDragOver = (event, tileId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = draggingId ? "move" : "copy";
    setDropActive(true);
    if (overId !== tileId) setOverId(tileId);
  };

  const clearDrag = () => {
    setDraggingId(null);
    setOverId(null);
    setDropActive(false);
  };

  const handleDrop = (event, tileId) => {
    event.preventDefault();
    const occupant = readOccupantPayload(event.dataTransfer);
    clearDrag();
    if (!occupant) return;
    const sourceId = occupantKey(occupant);
    if (tiles.some((tile) => tile.id === sourceId)) {
      onReorder(sourceId, tileId);
      return;
    }
    onPlace(occupant, tileId);
  };

  return (
    <div
      ref={gridRef}
      onDragOver={(event) => handleDragOver(event, null)}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOverId(null);
          setDropActive(false);
        }
      }}
      onDrop={(event) => handleDrop(event, null)}
      onDragEnd={clearDrag}
      className={cn(
        "grid gap-4",
        expanded ? "grid-cols-1" : "grid-cols-1 md:grid-cols-12",
        dropActive &&
          "rounded-xl ring-2 ring-baseplate/25 ring-offset-2 ring-offset-background",
        tiles.length === 0 &&
          "min-h-64 rounded-xl border-2 border-dashed border-border",
      )}
    >
      {tiles.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center gap-1 p-10 text-center">
          <p className="font-heading text-base font-semibold text-muted-foreground">
            Empty board
          </p>
          <p className="font-hand text-xl text-muted-foreground">
            add a card back, or drop a baseplate here
          </p>
        </div>
      ) : (
        shown.map((tile) => (
          <WorkspaceTile
            key={tile.id}
            tile={tile}
            cards={cards}
            expanded={!!expanded}
            dragging={draggingId === tile.id}
            dropTarget={overId === tile.id && draggingId !== tile.id}
            gridRef={gridRef}
            onDragStart={(event) => {
              writeOccupantPayload(event.dataTransfer, tile.occupant);
              event.dataTransfer.effectAllowed = "move";
              setDraggingId(tile.id);
            }}
            onDragOver={(event) => {
              event.stopPropagation();
              handleDragOver(event, tile.id);
            }}
            onDrop={(event) => {
              event.stopPropagation();
              handleDrop(event, tile.id);
            }}
            onResize={onResize}
            onToggleCollapsed={() => onToggleCollapsed(tile.id)}
            onToggleExpanded={() => onToggleExpanded(tile.id)}
            onRemove={() => onRemove(tile.id)}
          />
        ))
      )}
    </div>
  );
}

function WorkspaceTile({
  tile,
  cards,
  expanded,
  dragging,
  dropTarget,
  gridRef,
  onDragStart,
  onDragOver,
  onDrop,
  onResize,
  onToggleCollapsed,
  onToggleExpanded,
  onRemove,
}) {
  const label = tileLabel(tile);
  const hint = tileHint(tile);
  const collapsed = tile.collapsed && !expanded;

  return (
    <section
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border bg-card",
        dropTarget
          ? "border-baseplate ring-2 ring-baseplate/30"
          : "border-border",
        dragging && "opacity-50",
        expanded ? "min-h-[70vh]" : "min-h-0",
      )}
      style={
        expanded
          ? undefined
          : {
              gridColumn: `span ${tile.colSpan}`,
              height: collapsed ? undefined : tile.rowHeight,
            }
      }
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2 py-1.5">
        {!expanded ? (
          <div
            draggable
            onDragStart={onDragStart}
            className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            aria-label={`Reorder ${label}`}
            title="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </div>
        ) : null}

        <h2 className="min-w-0 truncate font-heading text-sm font-semibold text-foreground">
          {label}
        </h2>
        {hint ? (
          <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline">
            {hint}
          </span>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={collapsed ? `Expand ${label}` : `Collapse ${label}`}
            title={collapsed ? "Show card" : "Collapse"}
            onClick={onToggleCollapsed}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                collapsed && "-rotate-90",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={expanded ? "Back to the board" : `Maximize ${label}`}
            title={expanded ? "Back to the board" : "Maximize"}
            onClick={onToggleExpanded}
          >
            {expanded ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={`Remove ${label} from the board`}
            title="Remove from board"
            onClick={onRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {collapsed ? null : (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <OccupantBody tile={tile} cards={cards} expanded={expanded} />
        </div>
      )}

      {expanded || collapsed ? null : (
        <ResizeHandle
          label={label}
          tile={tile}
          gridRef={gridRef}
          onResize={onResize}
        />
      )}
    </section>
  );
}

function OccupantBody({ tile, cards, expanded }) {
  if (tile.occupant.type === "card") {
    const card = cards.find((entry) => entry.id === tile.occupant.id);
    if (!card) {
      return (
        <p className="text-sm text-muted-foreground">This card is gone.</p>
      );
    }
    const { Card } = card;
    return <Card expanded={expanded} />;
  }

  if (tile.occupant.type === "brick") {
    return (
      <BrickBody
        baseplateId={tile.occupant.baseplateId}
        brickId={tile.occupant.id}
        expanded={expanded}
      />
    );
  }

  const baseplate = getBaseplate(tile.occupant.id);
  if (!baseplate?.Screen) {
    return (
      <p className="text-sm text-muted-foreground">
        This baseplate isn&apos;t unlocked yet.
      </p>
    );
  }
  const Screen = baseplate.Screen;
  return (
    <div className="h-full min-h-0 overflow-auto">
      <Screen />
    </div>
  );
}

function BrickBody({ baseplateId, brickId, expanded }) {
  const baseplate = getBaseplate(baseplateId);
  if (!baseplate) {
    return (
      <p className="text-sm text-muted-foreground">
        This surface isn&apos;t unlocked yet.
      </p>
    );
  }
  const brick = findListedBrick(baseplateId, brickId);
  const Card = brick?.Card ?? brick?.cards?.[0]?.Card;
  if (Card) return <Card expanded={expanded} />;
  if (baseplate.Host && brick) {
    const Host = baseplate.Host;
    return <Host brick={brick} expanded={expanded} />;
  }
  return (
    <p className="text-sm text-muted-foreground">
      {brick?.label ?? brickId} can&apos;t sit on this board yet — dock the
      whole {baseplate.label} instead, or add a Host on that surface after
      rebase.
    </p>
  );
}

function ResizeHandle({ label, tile, gridRef, onResize }) {
  return (
    <div
      role="separator"
      aria-label={`Resize ${label}`}
      title="Drag to resize"
      className="absolute right-0 bottom-0 z-10 flex size-6 cursor-se-resize items-end justify-end p-1 text-muted-foreground/80 hover:text-foreground"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const grid = gridRef.current;
        if (!grid) return;
        const styles = window.getComputedStyle(grid);
        const gap = parseFloat(styles.columnGap) || 16;
        const colWidth = (grid.clientWidth - gap * (GRID_COLS - 1)) / GRID_COLS;
        const startX = event.clientX;
        const startY = event.clientY;
        const startSpan = tile.colSpan;
        const startHeight = tile.rowHeight;
        const pointerId = event.pointerId;

        const move = (next) => {
          if (next.pointerId !== pointerId) return;
          onResize(tile.id, {
            colSpan: clamp(
              Math.round(startSpan + (next.clientX - startX) / colWidth),
              MIN_COL_SPAN,
              GRID_COLS,
            ),
            rowHeight: clamp(
              startHeight + (next.clientY - startY),
              MIN_ROW_HEIGHT,
              MAX_ROW_HEIGHT,
            ),
          });
        };
        const up = (next) => {
          if (next.pointerId !== pointerId) return;
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("pointercancel", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
      }}
    >
      <svg
        viewBox="0 0 10 10"
        className="size-3.5"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M9 3.5v5.5H3.5" />
        <path d="M9 6.5H6.5V9" />
      </svg>
    </div>
  );
}
