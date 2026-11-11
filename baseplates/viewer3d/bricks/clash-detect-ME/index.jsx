"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useStore } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { ChevronLeft, ChevronRight, ScanSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { collectSolids, findClashes, MAX_CANDIDATES } from "./clash";
import {
  clashActiveAtom,
  clashBusyAtom,
  clashFocusAtom,
  clashModeAtom,
  clashResultsAtom,
  clashRunTokenAtom,
  clashToleranceAtom,
} from "./atoms";

/**
 * CLASH DETECT — find where the model runs into itself.
 *
 * A TOOL, not a view mode: it builds no boxes, so it never appears in the mode
 * rail, and it keeps working whichever mode is showing. It uses both additive
 * extension points — `Toolbar` for the HTML controls, `Scene3d` for the
 * markers drawn in the canvas.
 *
 * The test reads the LIVE three.js scene rather than rebuilding boxes from
 * project.json. That is what makes it a *model* clash test instead of a data
 * report: it sees whichever view mode is active, and it sees imported .3dm
 * geometry from the Rhino brick, without either of them opting in or this
 * brick knowing they exist. Bricks don't import each other — they meet in the
 * scene graph.
 *
 * Two flavours, which is what every BIM clash tool offers:
 *   hard       solids actually interpenetrate
 *   clearance  solids come within N metres of each other
 *
 * Axis-aligned bounding boxes, not triangle-level intersection. Every solid
 * this baseplate builds is an axis-aligned box, so for the building itself the
 * AABB *is* the geometry and the result is exact. For a rotated imported mesh
 * the AABB is conservative — it can over-report. Triangle-level testing is a
 * three-mesh-bvh job, well past what one brick should carry.
 */

// The scene holds the marker group itself, so the test must not see its own
// markers as geometry. `clashIgnore` is what `collectSolids` looks for.
const IGNORE = { clashIgnore: true };

function labelFor(object) {
  if (!object) return "solid";
  // r3f doesn't name meshes, so fall back to something readable.
  return object.name || object.userData?.title || object.type || "solid";
}

function ClashScene({ palette }) {
  const store = useStore();
  const active = useAtomValue(clashActiveAtom);
  const mode = useAtomValue(clashModeAtom);
  const tolerance = useAtomValue(clashToleranceAtom);
  const runToken = useAtomValue(clashRunTokenAtom);
  const [results, setResults] = useAtom(clashResultsAtom);
  const [focus, setFocus] = useAtom(clashFocusAtom);
  const setBusy = useSetAtom(clashBusyAtom);

  // The test runs in an effect, not during render: it walks the scene graph,
  // which is r3f's mutable state, and it writes atoms. `useStore()` rather than
  // `useThree()` for the same reason the Z slice brick uses it — reaching for
  // the live state inside the effect is the documented way to do imperative
  // work against the renderer.
  useEffect(() => {
    if (!active) {
      setResults([]);
      setFocus(null);
      setBusy(false);
      return undefined;
    }

    const { scene, invalidate } = store.getState();
    setBusy(true);

    // Let the toolbar paint "testing…" before the pair loop blocks the frame.
    const id = requestAnimationFrame(() => {
      const solids = collectSolids(scene);

      if (solids.length > MAX_CANDIDATES) {
        setResults([{ key: "overflow", overflow: true, count: solids.length }]);
        setFocus(null);
        setBusy(false);
        return;
      }

      const found = findClashes(solids, { mode, tolerance });
      setResults(
        found.map((clash) => ({
          key: clash.key,
          position: clash.position,
          size: clash.size,
          depth: clash.depth,
          kind: clash.kind,
          a: labelFor(clash.aElement ?? clash.a),
          b: labelFor(clash.bElement ?? clash.b),
        }))
      );
      setFocus(found.length ? 0 : null);
      setBusy(false);
      invalidate();
    });

    return () => cancelAnimationFrame(id);
  }, [store, active, mode, tolerance, runToken, setResults, setFocus, setBusy]);

  if (!active) return null;

  const marks = results.filter((clash) => clash.position);
  if (marks.length === 0) return null;

  const focused = focus != null ? marks[focus] : null;

  return (
    <group userData={IGNORE}>
      {marks.map((clash, index) => {
        const isFocused = focused?.key === clash.key;
        // Hard clashes in the accent colour, clearance flags in the softer one.
        // Both come from `palette`, so neither theme is hardcoded.
        const color = clash.kind === "hard" ? palette.accent : palette.accentSoft;
        return (
          <group key={clash.key} position={clash.position} userData={IGNORE}>
            {/* The overlap volume itself — the thing that is actually wrong.
                `depthTest={false}` so a clash buried inside the massing is
                still visible; a clash you have to orbit to find is useless. */}
            <mesh raycast={() => null} userData={IGNORE}>
              <boxGeometry args={clash.size} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isFocused ? 0.85 : 0.4}
                depthTest={false}
              />
            </mesh>

            {/* A wireframe cage, slightly larger, so a paper-thin overlap is
                still findable from across the site. */}
            <mesh raycast={() => null} userData={IGNORE}>
              <boxGeometry
                args={clash.size.map((v) => v + (isFocused ? 0.6 : 0.3))}
              />
              <meshBasicMaterial
                color={color}
                wireframe
                transparent
                opacity={isFocused ? 0.9 : 0.3}
                depthTest={false}
              />
            </mesh>

            {isFocused ? (
              <Html center zIndexRange={[20, 10]}>
                <div className="pointer-events-none whitespace-nowrap rounded border bg-background/90 px-1.5 py-0.5 font-mono text-[11px] tabular-nums shadow-sm backdrop-blur">
                  #{index + 1} ·{" "}
                  {clash.kind === "hard"
                    ? `${clash.depth.toFixed(2)} m deep`
                    : `${Math.abs(clash.depth).toFixed(2)} m gap`}
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function ClashToolbar() {
  const [active, setActive] = useAtom(clashActiveAtom);
  const [mode, setMode] = useAtom(clashModeAtom);
  const [tolerance, setTolerance] = useAtom(clashToleranceAtom);
  const [focus, setFocus] = useAtom(clashFocusAtom);
  const results = useAtomValue(clashResultsAtom);
  const busy = useAtomValue(clashBusyAtom);
  const bumpRun = useSetAtom(clashRunTokenAtom);

  const overflow = results.find((clash) => clash.overflow);
  const marks = results.filter((clash) => clash.position);
  const current = focus != null ? marks[focus] : null;

  const step = (delta) => {
    if (marks.length === 0) return;
    const next = ((focus ?? 0) + delta + marks.length) % marks.length;
    setFocus(next);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => setActive(!active)}
        title="Test the model against itself for hard clashes and clearance violations"
      >
        <ScanSearch className="size-3.5" />
        Clash
      </Button>

      {active ? (
        <>
          {/* Hard vs clearance. Two buttons rather than a Select — it is a
              two-state choice and the toolbar is already crowded. */}
          <div className="flex items-center rounded border">
            <Button
              size="sm"
              variant={mode === "hard" ? "secondary" : "ghost"}
              className="h-6 rounded-r-none px-1.5 text-[11px]"
              onClick={() => setMode("hard")}
              title="Solids that actually interpenetrate"
            >
              Hard
            </Button>
            <Button
              size="sm"
              variant={mode === "clearance" ? "secondary" : "ghost"}
              className="h-6 rounded-l-none px-1.5 text-[11px]"
              onClick={() => setMode("clearance")}
              title="Solids closer than the tolerance below"
            >
              Clearance
            </Button>
          </div>

          {mode === "clearance" ? (
            <>
              <Slider
                className="w-20"
                min={0.1}
                max={2}
                step={0.1}
                value={[tolerance]}
                onValueChange={([value]) => setTolerance(value)}
                aria-label="Clearance tolerance in metres"
              />
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {tolerance.toFixed(1)} m
              </span>
            </>
          ) : null}

          <span className="px-1 font-mono text-xs tabular-nums">
            {busy ? (
              <span className="text-muted-foreground">testing…</span>
            ) : overflow ? (
              <span className="text-muted-foreground">
                {overflow.count} solids — too many to test
              </span>
            ) : marks.length === 0 ? (
              <span className="text-muted-foreground">clear</span>
            ) : (
              <>
                {marks.length} {marks.length === 1 ? "clash" : "clashes"}
                {current ? (
                  <span className="ml-1.5 text-muted-foreground">
                    #{(focus ?? 0) + 1} {current.a} ↔ {current.b}
                  </span>
                ) : null}
              </>
            )}
          </span>

          {marks.length > 1 ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 px-0"
                onClick={() => step(-1)}
                title="Previous clash"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 px-0"
                onClick={() => step(1)}
                title="Next clash"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </>
          ) : null}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-[11px]"
            onClick={() => bumpRun((token) => token + 1)}
            title="Re-run the test — do this after importing a model or changing view mode"
          >
            Re-run
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            onClick={() => setActive(false)}
            title="Close clash detection"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  );
}

export const clashDetectBrick = {
  id: "clash-detect-ME",
  label: "Clash",
  hint: "Find where the model runs into itself",
  order: 45,
  Toolbar: ClashToolbar,
  Scene3d: ClashScene,
};
