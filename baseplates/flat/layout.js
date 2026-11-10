/**
 * Workspace layout for this baseplate — the arrangement of tiles, not the
 * contents of any card.
 *
 * A tile is one thing on the board:
 *   { type: "card", id }                  a Flat brick's card
 *   { type: "baseplate", id }             a whole unlocked surface
 *   { type: "brick", baseplateId, id }    one brick from any surface
 *
 * The layout lives in memory. Export writes it (plus scene + kit) to a JSON
 * file; import reads it back; a hard refresh throws it away. Card *contents*
 * still go through `storage.js`.
 *
 * Unknown brick occupants stay on the board as a placeholder so a remix
 * export opened on 9am Flat does not silently drop tiles.
 */

export const WORKSPACE_VERSION = 2;
export const WORKSPACE_KIND = "flat-workspace";
export const GRID_COLS = 12;
export const DEFAULT_ROW_HEIGHT = 280;
export const MIN_ROW_HEIGHT = 140;
export const MAX_ROW_HEIGHT = 900;
export const MIN_COL_SPAN = 2;
export const OCCUPANT_MIME = "application/x-flat-occupant";
export const OCCUPANT_TEXT_PREFIX = "flat-occupant:";

export function occupantKey(occupant) {
  if (occupant?.type === "brick") {
    return `brick:${occupant.baseplateId}/${occupant.id}`;
  }
  return `${occupant.type}:${occupant.id}`;
}

export function normalizeOccupant(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "card" || raw.type === "baseplate") {
    if (typeof raw.id !== "string" || !raw.id) return null;
    return { type: raw.type, id: raw.id };
  }
  if (raw.type === "brick") {
    if (typeof raw.id !== "string" || !raw.id) return null;
    if (typeof raw.baseplateId !== "string" || !raw.baseplateId) return null;
    return { type: "brick", baseplateId: raw.baseplateId, id: raw.id };
  }
  return null;
}

export function parseOccupantPayload(raw) {
  if (!raw) return null;
  const text = raw.startsWith(OCCUPANT_TEXT_PREFIX)
    ? raw.slice(OCCUPANT_TEXT_PREFIX.length)
    : raw;
  try {
    return normalizeOccupant(JSON.parse(text));
  } catch {
    return null;
  }
}

export function writeOccupantPayload(dataTransfer, occupant) {
  const payload = JSON.stringify(normalizeOccupant(occupant) ?? occupant);
  dataTransfer.setData(OCCUPANT_MIME, payload);
  dataTransfer.setData("text/plain", `${OCCUPANT_TEXT_PREFIX}${payload}`);
}

export function readOccupantPayload(dataTransfer) {
  return (
    parseOccupantPayload(dataTransfer.getData(OCCUPANT_MIME)) ??
    parseOccupantPayload(dataTransfer.getData("text/plain"))
  );
}

export function spanToColSpan(span) {
  if (span === 3) return 12;
  if (span === 2) return 8;
  return 4;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function tileFromOccupant(occupant, extra) {
  return {
    id: occupantKey(occupant),
    occupant,
    colSpan: extra.colSpan,
    rowHeight: extra.rowHeight,
    collapsed: false,
  };
}

export function makeTile(occupant, cards) {
  const normalized = normalizeOccupant(occupant);
  if (!normalized) return null;

  if (normalized.type === "card") {
    const card = cards.find((entry) => entry.id === normalized.id);
    if (!card) return null;
    return tileFromOccupant(normalized, {
      colSpan: spanToColSpan(card.span),
      rowHeight: DEFAULT_ROW_HEIGHT,
    });
  }

  if (normalized.type === "baseplate") {
    if (normalized.id === "flat") return null;
    return tileFromOccupant(normalized, {
      colSpan: GRID_COLS,
      rowHeight: 520,
    });
  }

  // Brick from any surface — including ones not unlocked yet.
  return tileFromOccupant(normalized, {
    colSpan: GRID_COLS,
    rowHeight: 420,
  });
}

export function defaultTilesFromCards(cards) {
  return cards
    .map((card) => makeTile({ type: "card", id: card.id }, cards))
    .filter(Boolean);
}

export function defaultLayout(cards) {
  return { tiles: defaultTilesFromCards(cards), expandedTileId: null };
}

export function sanitizeLayout(layout, cards, baseplateIds) {
  if (!layout || !Array.isArray(layout.tiles)) return defaultLayout(cards);
  const knownCards = new Set(cards.map((card) => card.id));
  const knownBaseplates = new Set(baseplateIds);
  const tiles = [];
  const seen = new Set();
  for (const tile of layout.tiles) {
    const occupant = normalizeOccupant(tile?.occupant);
    if (!occupant) continue;
    const id = occupantKey(occupant);
    if (seen.has(id)) continue;
    if (occupant.type === "card" && !knownCards.has(occupant.id)) continue;
    if (occupant.type === "baseplate") {
      if (occupant.id === "flat" || !knownBaseplates.has(occupant.id)) continue;
    }
    seen.add(id);
    tiles.push({
      id,
      occupant,
      colSpan: clamp(
        Number(tile.colSpan) || spanToColSpan(1),
        MIN_COL_SPAN,
        GRID_COLS
      ),
      rowHeight: clamp(
        Number(tile.rowHeight) || DEFAULT_ROW_HEIGHT,
        MIN_ROW_HEIGHT,
        MAX_ROW_HEIGHT
      ),
      collapsed: Boolean(tile.collapsed),
    });
  }
  const expandedTileId = tiles.some((tile) => tile.id === layout.expandedTileId)
    ? layout.expandedTileId
    : null;
  return { tiles, expandedTileId };
}

export function moveTile(tiles, sourceId, targetId) {
  if (!sourceId || sourceId === targetId) return tiles;
  const from = tiles.findIndex((tile) => tile.id === sourceId);
  if (from < 0) return tiles;
  const next = tiles.slice();
  const [item] = next.splice(from, 1);
  if (!targetId) {
    next.push(item);
    return next;
  }
  const to = next.findIndex((tile) => tile.id === targetId);
  if (to < 0) {
    next.push(item);
    return next;
  }
  next.splice(to, 0, item);
  return next;
}

export function placeOccupant(tiles, occupant, targetId, cards) {
  const normalized = normalizeOccupant(occupant);
  if (!normalized) return tiles;
  const id = occupantKey(normalized);
  if (tiles.some((tile) => tile.id === id)) {
    return moveTile(tiles, id, targetId);
  }
  const tile = makeTile(normalized, cards);
  if (!tile) return tiles;
  if (!targetId) return [...tiles, tile];
  const to = tiles.findIndex((entry) => entry.id === targetId);
  if (to < 0) return [...tiles, tile];
  return [...tiles.slice(0, to), tile, ...tiles.slice(to)];
}

export function placeOccupants(tiles, occupants, cards) {
  let next = tiles;
  for (const occupant of occupants) {
    next = placeOccupant(next, occupant, null, cards);
  }
  return next;
}

export function serializeWorkspace({ layout, cardState, scene, kit }) {
  return {
    version: WORKSPACE_VERSION,
    kind: WORKSPACE_KIND,
    exportedAt: new Date().toISOString(),
    layout: {
      tiles: layout.tiles.map((tile) => ({
        id: tile.id,
        occupant: tile.occupant,
        colSpan: tile.colSpan,
        rowHeight: tile.rowHeight,
        collapsed: tile.collapsed,
      })),
      expandedTileId: layout.expandedTileId,
    },
    scene: scene ?? null,
    kit: kit ?? null,
    cardState: cardState ?? {},
  };
}

export function parseWorkspaceFile(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Not a workspace file");
  }
  if (data.kind && data.kind !== WORKSPACE_KIND) {
    throw new Error("This file belongs to a different workspace");
  }
  if (
    data.version &&
    data.version !== 1 &&
    data.version !== WORKSPACE_VERSION
  ) {
    throw new Error(`Unsupported workspace version (${data.version})`);
  }
  const layout = data.layout ?? data;
  if (!Array.isArray(layout.tiles)) {
    throw new Error("Workspace file is missing a tile list");
  }
  return {
    layout: {
      tiles: layout.tiles,
      expandedTileId: layout.expandedTileId ?? null,
    },
    scene: data.scene && typeof data.scene === "object" ? data.scene : null,
    kit:
      data.kit && typeof data.kit === "object"
        ? { hiddenBrickKeys: data.kit.hiddenBrickKeys ?? null }
        : { hiddenBrickKeys: null },
    cardState:
      data.cardState && typeof data.cardState === "object" ? data.cardState : {},
  };
}
