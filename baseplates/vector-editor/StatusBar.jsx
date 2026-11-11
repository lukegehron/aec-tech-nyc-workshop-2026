"use client";

import { useAtomValue } from "jotai";
import {
  activeToolIdAtom,
  cursorAtom,
  docAtom,
  selectionAtom,
  selectionBoundsAtom,
} from "./atoms";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { formatLength } from "./model";
import { getTool } from "./bricks/bricks";

export default function StatusBar() {
  const cursor = useAtomValue(cursorAtom);
  const doc = useAtomValue(docAtom);
  const selection = useAtomValue(selectionAtom);
  const bounds = useAtomValue(selectionBoundsAtom);
  const hidden = useAtomValue(hiddenBrickKeysAtom);
  const tool = getTool(useAtomValue(activeToolIdAtom), hidden);

  const mm = (units) => formatLength(units * doc.mmPerUnit);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-3 py-1.5 text-xs text-muted-foreground">
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium text-foreground">{tool.label}</span>
        {tool.hint ? <span className="ml-2">{tool.hint}</span> : null}
      </span>

      {bounds ? (
        <span className="font-mono">
          {selection.length} selected · {mm(bounds.maxX - bounds.minX)} ×{" "}
          {mm(bounds.maxY - bounds.minY)}
        </span>
      ) : null}

      <span className="w-40 shrink-0 text-right font-mono">
        {cursor ? `${mm(cursor.x)}, ${mm(cursor.y)}` : `grid ${mm(doc.grid)}`}
      </span>
    </div>
  );
}
