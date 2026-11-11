"use client";

import { useAtom } from "jotai";
import {
  brickKey,
  defaultHiddenKeys,
  hiddenBrickKeysAtom,
  visibleBricks,
} from "@/lib/bricks";

/**
 * Remix proofs / attendee bricks the naming rule tucked away. Click one to
 * show it on THIS surface — the same kit travels when you dock the surface
 * onto Flat.
 */
export function KitTray({ baseplateId, bricks }) {
  const [hidden, setHidden] = useAtom(hiddenBrickKeysAtom);
  const shown = visibleBricks(baseplateId, bricks, hidden);
  const shownIds = new Set(shown.map((brick) => brick.id));
  const tucked = (bricks ?? []).filter((brick) => !shownIds.has(brick.id));
  if (tucked.length === 0) return null;

  const reveal = (brickId) => {
    const keys =
      hidden == null
        ? defaultHiddenKeys(baseplateId, bricks)
        : [...hidden];
    setHidden(keys.filter((key) => key !== brickKey(baseplateId, brickId)));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">Add to this surface</p>
      {tucked.map((brick) => (
        <button
          key={brick.id}
          type="button"
          onClick={() => reveal(brick.id)}
          className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
        >
          {brick.label}
        </button>
      ))}
    </div>
  );
}
