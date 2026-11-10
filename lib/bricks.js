/**
 * Kit visibility — what is on the canvas versus in the tray.
 *
 * Naming rule (every surface except Flat):
 *   id ends in `-XX`  → starter, default ON
 *   id ends in initials (`-LG`, `-PF`, `-NE`) → remix proof, default OFF
 *
 * Flat is the social wall: nametags end in initials and must land on the
 * board after a merge, so Flat defaults every brick on. Hide with the tile
 * X, not with this kit.
 *
 * `hiddenSet === null` means "use the rule". Once the user toggles a remix
 * brick on, pass an explicit list of hidden keys (`baseplateId/brickId`).
 *
 * After rebase, wrap the list a Screen already maps:
 *
 *   import { hiddenBrickKeysAtom, visibleBricks } from "@/lib/bricks";
 *   const hidden = useAtomValue(hiddenBrickKeysAtom);
 *   const shown = visibleBricks("viewer3d", modesByOrder, hidden);
 */

import { atom } from "jotai";

/** Explicit hidden keys, or null for the naming rule. In-memory; export snapshots it. */
export const hiddenBrickKeysAtom = atom(null);

export function brickKey(baseplateId, brickId) {
  return `${baseplateId}/${brickId}`;
}

export function isStarterBrick(brickId) {
  return typeof brickId === "string" && brickId.endsWith("-XX");
}

export function defaultBrickVisible(baseplateId, brickId) {
  if (baseplateId === "flat") return true;
  return isStarterBrick(brickId);
}

export function visibleBricks(baseplateId, bricks, hiddenSet) {
  const list = bricks ?? [];
  if (hiddenSet == null) {
    return list.filter((brick) => defaultBrickVisible(baseplateId, brick.id));
  }
  const hidden = hiddenSet instanceof Set ? hiddenSet : new Set(hiddenSet);
  return list.filter(
    (brick) => !hidden.has(brickKey(baseplateId, brick.id))
  );
}

/** Keys the naming rule would hide — use this to freeze an explicit kit. */
export function defaultHiddenKeys(baseplateId, bricks) {
  return (bricks ?? [])
    .filter((brick) => !defaultBrickVisible(baseplateId, brick.id))
    .map((brick) => brickKey(baseplateId, brick.id));
}
