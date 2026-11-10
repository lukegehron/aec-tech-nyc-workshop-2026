import { atom } from "jotai";

/**
 * View state for the flat baseplate.
 *
 * A card's *contents* are the brick's own business (see `storage.js` for
 * that). What lives here is the board: which boxes are on it, how big they
 * are, and which one is filling the surface.
 *
 * Layout is in-memory on purpose. Export writes it to a file; a hard refresh
 * sets these atoms back to null, and the grid rebuilds from the brick
 * registry. That is the whole persistence story for *layout*.
 */

/** Which card is blown up to fill the surface, or null for the grid. */
export const expandedCardIdAtom = atom(null);

/** Which tile (card or docked baseplate) is filling the surface. */
export const expandedTileIdAtom = atom(null);

/**
 * Custom tile list, or null for the default grid (every registered card, in
 * `order`, at its `span`). Maximize does not write this — only rearrange,
 * resize, collapse, or remove does — so a new brick after a pull still lands
 * on the board. Once customized, new cards show up in the Add tray instead.
 */
export const workspaceLayoutAtom = atom(null);

