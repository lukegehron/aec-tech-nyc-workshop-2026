"use client";

import { useAtom } from "jotai";
import { baseplatesByNavOrder } from "@/lib/baseplates";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { applySceneSnapshot, resetScene, snapshotScene } from "@/lib/scene";
import {
  expandedCardIdAtom,
  expandedTileIdAtom,
  workspaceLayoutAtom,
} from "./atoms";
import { cardsByOrder } from "./bricks/bricks";
import { readAllCardState, writeAllCardState } from "./storage";
import { SceneFilters } from "./SceneFilters";
import {
  occupantUsesScene,
  SurfaceTray,
  WorkspaceBar,
  WorkspaceGrid,
} from "./Workspace";
import {
  defaultLayout,
  moveTile,
  occupantKey,
  parseWorkspaceFile,
  placeOccupant,
  placeOccupants,
  sanitizeLayout,
  serializeWorkspace,
} from "./layout";

/**
 * The BASEPLATE itself — a board of cards you can arrange.
 *
 * Every other baseplate is moulded: a canvas, a 3D scene, a chat thread. Each
 * of those decides a lot for you before you write a line. This one decides
 * almost nothing. It is a grid, a card frame, and a workspace: collapse,
 * remove, resize, reorder, and (when other surfaces unlock) drop a baseplate
 * onto the same board. Export writes that arrangement to a file; a hard
 * refresh throws it away and the default grid comes back.
 *
 * As with every baseplate: no list of cards lives in this file. It loops the
 * registry in `bricks/bricks.js`.
 */
export default function FlatScreen() {
  const [stored, setStored] = useAtom(workspaceLayoutAtom);
  const [expandedTileId, setExpandedTileId] = useAtom(expandedTileIdAtom);
  const [, setExpandedCardId] = useAtom(expandedCardIdAtom);
  const [hiddenBrickKeys, setHiddenBrickKeys] = useAtom(hiddenBrickKeysAtom);
  const cards = cardsByOrder;
  const baseplateIds = baseplatesByNavOrder.map((entry) => entry.id);
  const tiles = stored
    ? sanitizeLayout(stored, cards, baseplateIds).tiles
    : defaultLayout(cards).tiles;
  const layout = {
    tiles,
    expandedTileId: tiles.some((tile) => tile.id === expandedTileId)
      ? expandedTileId
      : null,
  };

  const customize = (updater) => {
    setStored((previous) => {
      const current = previous
        ? sanitizeLayout(previous, cards, baseplateIds)
        : defaultLayout(cards);
      return { tiles: updater(current.tiles) };
    });
  };

  const setExpanded = (tileId) => {
    const tile = tiles.find((entry) => entry.id === tileId) ?? null;
    setExpandedTileId(tileId);
    setExpandedCardId(
      tile?.occupant?.type === "card" ? tile.occupant.id : null,
    );
  };

  const onBoard = new Set(layout.tiles.map((tile) => tile.id));
  const availableCards = cards.filter(
    (card) => !onBoard.has(`card:${card.id}`),
  );
  const availableBaseplates = baseplatesByNavOrder.filter(
    (baseplate) =>
      baseplate.id !== "flat" && !onBoard.has(`baseplate:${baseplate.id}`),
  );
  const availableBricks = [];
  for (const baseplate of availableBaseplates) {
    for (const brick of baseplate.listBricks?.() ?? []) {
      const occupant = {
        type: "brick",
        baseplateId: baseplate.id,
        id: brick.id,
      };
      if (onBoard.has(occupantKey(occupant))) continue;
      if (!brick.Card && !brick.cards?.[0]?.Card) continue;
      availableBricks.push({
        label: `${baseplate.label}: ${brick.label}`,
        occupant,
      });
    }
  }
  const trayOccupants = [
    ...availableCards.map((card) => ({ type: "card", id: card.id })),
    ...availableBaseplates.map((baseplate) => ({
      type: "baseplate",
      id: baseplate.id,
    })),
    ...availableBricks.map((entry) => entry.occupant),
  ];
  const showFilters = layout.tiles.some((tile) =>
    occupantUsesScene(tile.occupant),
  );

  return (
    <div className="flex flex-col gap-4">
      {cards.length === 0 && layout.tiles.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center">
          <p className="font-heading text-base font-semibold text-muted-foreground">
            Nothing on this baseplate yet
          </p>
          <p className="font-hand text-xl text-muted-foreground">
            add a folder in bricks/, then two lines in bricks/bricks.js
          </p>
        </div>
      ) : (
        <>
          <WorkspaceBar
            tileCount={layout.tiles.length}
            hiddenCount={availableCards.length + availableBaseplates.length}
            canAddAll={trayOccupants.length > 0}
            onExport={() =>
              downloadWorkspace(layout, {
                hiddenBrickKeys,
              })
            }
            onImportFile={(file) =>
              importWorkspace(
                file,
                cards,
                baseplateIds,
                setStored,
                setExpandedTileId,
                setExpandedCardId,
                setHiddenBrickKeys,
              )
            }
            onAddAll={() =>
              customize((current) =>
                placeOccupants(current, trayOccupants, cards),
              )
            }
            onRemoveAll={() => {
              setExpanded(null);
              customize(() => []);
            }}
            onReset={() => {
              setStored(null);
              setExpandedTileId(null);
              setExpandedCardId(null);
              setHiddenBrickKeys(null);
              resetScene();
            }}
          />
          <SceneFilters visible={showFilters} />
          <SurfaceTray
            cards={availableCards}
            baseplates={availableBaseplates}
            bricks={availableBricks}
            onAdd={(occupant) =>
              customize((current) =>
                placeOccupant(current, occupant, null, cards),
              )
            }
          />
          <WorkspaceGrid
            tiles={layout.tiles}
            expandedTileId={layout.expandedTileId}
            cards={cards}
            onPlace={(occupant, targetId) =>
              customize((current) =>
                placeOccupant(current, occupant, targetId, cards),
              )
            }
            onReorder={(sourceId, targetId) =>
              customize((current) => moveTile(current, sourceId, targetId))
            }
            onResize={(tileId, size) =>
              customize((current) =>
                current.map((tile) =>
                  tile.id === tileId ? { ...tile, ...size } : tile,
                ),
              )
            }
            onToggleCollapsed={(tileId) => {
              if (layout.expandedTileId === tileId) setExpanded(null);
              customize((current) =>
                current.map((tile) =>
                  tile.id === tileId
                    ? {
                        ...tile,
                        collapsed:
                          layout.expandedTileId === tileId
                            ? true
                            : !tile.collapsed,
                      }
                    : tile,
                ),
              );
            }}
            onToggleExpanded={(tileId) => {
              const next = layout.expandedTileId === tileId ? null : tileId;
              setExpanded(next);
              const tile = tiles.find((entry) => entry.id === tileId);
              if (next && tile?.collapsed) {
                customize((current) =>
                  current.map((entry) =>
                    entry.id === tileId
                      ? { ...entry, collapsed: false }
                      : entry,
                  ),
                );
              }
            }}
            onRemove={(tileId) => {
              if (layout.expandedTileId === tileId) setExpanded(null);
              customize((current) =>
                current.filter((tile) => tile.id !== tileId),
              );
            }}
          />
        </>
      )}
    </div>
  );
}

function downloadWorkspace(layout, kit) {
  const payload = serializeWorkspace({
    layout,
    cardState: readAllCardState(),
    scene: snapshotScene(),
    kit,
  });
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flat-workspace.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importWorkspace(
  file,
  cards,
  baseplateIds,
  setStored,
  setExpandedTileId,
  setExpandedCardId,
  setHiddenBrickKeys,
) {
  try {
    const data = JSON.parse(await file.text());
    const parsed = parseWorkspaceFile(data);
    const layout = sanitizeLayout(parsed.layout, cards, baseplateIds);
    writeAllCardState(parsed.cardState);
    setStored({ tiles: layout.tiles, expandedTileId: layout.expandedTileId });
    setExpandedTileId(layout.expandedTileId);
    setHiddenBrickKeys(parsed.kit?.hiddenBrickKeys ?? null);
    applySceneSnapshot(parsed.scene);
    const tile = layout.tiles.find(
      (entry) => entry.id === layout.expandedTileId,
    );
    setExpandedCardId(
      tile?.occupant?.type === "card" ? tile.occupant.id : null,
    );
  } catch (error) {
    window.alert(
      error instanceof Error
        ? error.message
        : "Could not read that workspace file",
    );
  }
}
