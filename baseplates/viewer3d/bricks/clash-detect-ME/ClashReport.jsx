"use client";

import { createPortal } from "react-dom";
import { useAtom, useAtomValue } from "jotai";
import { useThree } from "@react-three/fiber";
import { ClipboardList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clashBusyAtom,
  clashFocusAtom,
  clashModeAtom,
  clashReportOpenAtom,
  clashResultsAtom,
  clashToleranceAtom,
} from "./atoms";

/**
 * THE CLASH REPORT — every clash in one list, down the side of the viewer.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A PORTAL, AND NOT A PANEL IN Screen.jsx
 * ---------------------------------------------------------------------------
 * The baseplate gives a brick two extension points: `Toolbar` (HTML, in the
 * toolbar row) and `Scene3d` (r3f elements, inside <Canvas>). There is no
 * "side panel" slot, and adding one would mean editing `Screen.jsx` — which a
 * brick must never do.
 *
 * So this portals straight into `gl.domElement.parentNode` with react-dom —
 * which here is the Screen's `relative h-[70vh] … overflow-hidden` canvas
 * wrapper. An absolutely positioned card lands docked to the right-hand edge
 * of the viewer, clipped to it, exactly as if the baseplate had offered a slot.
 *
 * ---------------------------------------------------------------------------
 * WHY NOT drei's <Html>, WHICH IS THE OBVIOUS CHOICE
 * ---------------------------------------------------------------------------
 * It was, and it did not render. `<Html>` exists to peg DOM to a point in the
 * scene, and it fights anything that isn't that:
 *
 *   1. Every frame it runs `isObjectBehindCamera()` on its own group. This
 *      panel's group sits at the world origin, and the viewer camera looks at
 *      the building from outside the site, so the origin is regularly behind
 *      the camera plane — at which point drei sets `display: none` and the
 *      panel vanishes.
 *   2. The frame update is gated on the projected position having MOVED
 *      (`|old - new| > eps`), with `oldPosition` starting at [0, 0]. Pinning
 *      `calculatePosition` to [0, 0, 0] to stop it drifting means that gate is
 *      never satisfied, so the block that sets `display` may never run at all.
 *
 * Both are a fixed panel being forced through a 3D-label component. A plain
 * portal has no camera maths to disagree with, costs nothing per frame, and is
 * what the job actually needs.
 */

function depthLabel(clash) {
  if (clash.kind === "hard") return `${clash.depth.toFixed(2)} m deep`;
  return `${Math.abs(clash.depth).toFixed(2)} m gap`;
}

export function ClashReport() {
  const [open, setOpen] = useAtom(clashReportOpenAtom);
  const [focus, setFocus] = useAtom(clashFocusAtom);
  const results = useAtomValue(clashResultsAtom);
  const busy = useAtomValue(clashBusyAtom);
  const mode = useAtomValue(clashModeAtom);
  const tolerance = useAtomValue(clashToleranceAtom);

  // The canvas's parent is the Screen's positioned wrapper — the element this
  // panel docks into. The canvas is already mounted by the time any `Scene3d`
  // brick renders, so this is a plain read, not effect-and-state.
  const gl = useThree((state) => state.gl);
  const host = gl.domElement.parentElement;

  const overflow = results.find((clash) => clash.overflow);
  const rows = results.filter((clash) => clash.position);

  if (!host) return null;

  // Collapsed: a single tab, so the report can be got back without going to
  // the toolbar.
  if (!open) {
    return createPortal(
      <div className="absolute right-3 top-3 z-20">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 gap-1.5 px-2 text-xs shadow-sm"
          onClick={() => setOpen(true)}
          title="Show the clash report"
        >
          <ClipboardList className="size-3.5" />
          {rows.length}
        </Button>
      </div>,
      host
    );
  }

  return createPortal(
    <div className="absolute right-3 top-3 z-20 flex max-h-[calc(100%-1.5rem)] w-64 flex-col overflow-hidden rounded-md border bg-background/95 shadow-sm backdrop-blur">
        {/* Header */}
        <div className="flex items-center gap-1.5 border-b px-2.5 py-1.5">
          <ClipboardList className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Clash report</span>
          <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
            {busy ? "…" : rows.length}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="-mr-1 size-6 px-0"
            onClick={() => setOpen(false)}
            title="Hide the report"
          >
            <X className="size-3" />
          </Button>
        </div>

        {/* What was tested — a count means nothing without the test settings */}
        <div className="border-b bg-muted/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
          {mode === "hard"
            ? "hard · interpenetrating solids"
            : `clearance · closer than ${tolerance.toFixed(1)} m`}
        </div>

        {/* The list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {busy ? (
            <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
              testing…
            </p>
          ) : overflow ? (
            <p className="px-2.5 py-3 text-xs text-muted-foreground">
              {overflow.count} solids in the scene — too many to test
              interactively.
            </p>
          ) : rows.length === 0 ? (
            <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
              No clashes found.
            </p>
          ) : (
            <ul className="divide-y">
              {rows.map((clash, index) => (
                <li key={clash.key}>
                  <button
                    type="button"
                    onClick={() => setFocus(index)}
                    className={`flex w-full items-baseline gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-muted ${
                      focus === index ? "bg-muted" : ""
                    }`}
                    title={`${clash.a} ↔ ${clash.b}`}
                  >
                    <span className="w-4 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      {/* The two elements — the whole point of the report */}
                      <span className="block truncate text-xs">
                        {clash.a}{" "}
                        <span className="text-muted-foreground">↔</span>{" "}
                        {clash.b}
                      </span>
                      <span
                        className={`font-mono text-[10px] tabular-nums ${
                          clash.kind === "hard"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {depthLabel(clash)}
                      </span>
                    </span>
                    {/* Hard vs clearance, without relying on colour alone */}
                    <span className="shrink-0 rounded border px-1 font-mono text-[9px] uppercase text-muted-foreground">
                      {clash.kind === "hard" ? "hard" : "clr"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {rows.length > 0 ? (
          <div className="border-t bg-muted/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
            click a row to highlight it
          </div>
        ) : null}
    </div>,
    host
  );
}
