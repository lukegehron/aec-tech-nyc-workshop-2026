"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { SquareSplitVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { zSliceActiveAtom, zSliceRangeAtom } from "./atoms";

/**
 * Z SLICE — keep a horizontal band of the model, cut everything else away.
 *
 * The vertical axis is Z here (see `../../geometry.js`), so "a slice in the Z
 * direction" is a pair of horizontal cuts: one looking down from `top`, one
 * looking up from `bottom`.
 *
 * This is the reason `Scene.jsx` sets `localClippingEnabled`. It clips through
 * `gl.clippingPlanes` — the renderer-wide list — which applies to every
 * material in the scene without this brick having to touch a single one. Boxes
 * from whichever view mode is active, and imported .3dm geometry, get cut the
 * same way, and none of them know this brick exists.
 *
 * A clipped solid is hollow: three.js cuts the surface, it does not cap it. So
 * you see into the floor plates rather than onto a poché'd section. That's the
 * honest behaviour of a clipping plane, and capping it properly means stencil
 * work well past what this brick is here to show.
 */

// three.js keeps the half-space where `normal · p + constant > 0`.
function planesFor(bottom, top, maxHeight) {
  const planes = [];
  // Only add a cut where one is actually asked for: with no bottom cut the
  // site plate (which sits a hair below zero) survives, which is what you want
  // when you're only slicing off the roof.
  if (bottom > 0.001) {
    planes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), -bottom));
  }
  if (top < maxHeight - 0.001) {
    planes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), top));
  }
  return planes;
}

function ZSliceScene({ framing }) {
  // `useStore()` rather than `useThree()`: the renderer is r3f's, and assigning
  // to a value React handed us during render is exactly what the compiler's
  // immutability rule stops. Reaching for the state inside the effect is the
  // documented way to do imperative work against it.
  const store = useStore();
  const active = useAtomValue(zSliceActiveAtom);
  const range = useAtomValue(zSliceRangeAtom);

  // Renders nothing. A `Scene3d` brick doesn't have to draw — this one exists
  // to reach the renderer, which only a component inside <Canvas> can do.
  useEffect(() => {
    const { gl, invalidate } = store.getState();
    const ceiling = Math.ceil(framing.maxHeight);
    const [bottom, top] = active && range ? range : [0, ceiling];
    gl.clippingPlanes = active ? planesFor(bottom, top, ceiling) : [];
    invalidate();
    return () => {
      // Never leave the renderer clipped on the way out — every other brick
      // would inherit the cut.
      gl.clippingPlanes = [];
      invalidate();
    };
  }, [store, active, range, framing.maxHeight]);

  return null;
}

function ZSliceToolbar({ framing }) {
  const [active, setActive] = useAtom(zSliceActiveAtom);
  const [range, setRange] = useAtom(zSliceRangeAtom);

  const ceiling = Math.ceil(framing.maxHeight);
  const [bottom, top] = range ?? [0, ceiling];

  return (
    <div className="flex items-center gap-2 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => {
          // First arming picks a band worth looking at rather than the whole
          // building — a slice that cuts nothing looks broken.
          if (!active && !range) setRange([0, Math.round(ceiling * 0.5)]);
          setActive(!active);
        }}
        title="Clip the model to a horizontal band"
      >
        <SquareSplitVertical className="size-3.5" />
        Z slice
      </Button>

      {active ? (
        <>
          <Slider
            className="w-32"
            min={0}
            max={ceiling}
            step={0.5}
            value={[bottom, top]}
            onValueChange={(value) => setRange(value)}
            aria-label="Slice range in metres above grade"
          />
          <span className="pr-1 font-mono text-xs tabular-nums text-muted-foreground">
            {bottom.toFixed(1)}–{top.toFixed(1)} m
          </span>
        </>
      ) : null}
    </div>
  );
}

export const zSliceBrick = {
  id: "z-slice-XX",
  label: "Z slice",
  hint: "Clip the model to a horizontal band",
  order: 50,
  Toolbar: ZSliceToolbar,
  Scene3d: ZSliceScene,
};
