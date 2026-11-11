"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { measureActiveAtom, measureCursorAtom, measurePointsAtom } from "./atoms";

/**
 * MEASURE — two clicks, one dimension.
 *
 * The first brick on this baseplate that is a TOOL rather than a view mode: it
 * builds no boxes, so it never appears in the mode rail, and it keeps working
 * whichever mode is showing. It uses both of the additive extension points —
 * `Toolbar` for the HTML control, `Scene3d` for what gets drawn in the canvas.
 *
 * Clicks are picked up with a plain DOM listener on the canvas rather than an
 * r3f `onClick`, for two reasons: the boxes call `stopPropagation()` on theirs
 * (which would eat every pick over a building), and a tool that measures
 * *anything* shouldn't need every measurable object to opt in. So this shoots
 * its own ray, and falls back to the Z = 0 ground plane when the ray hits
 * nothing — which is what makes site distances pickable on empty ground.
 */

// Below this many pixels of travel a press-and-release is a click; above it,
// the user was orbiting and meant nothing by it.
const DRAG_SLOP = 4;

function pickPoint(event, { gl, camera, scene, raycaster, groundPlane }) {
  const rect = gl.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);

  // Real geometry first — massing boxes, floor plates, rooms, and anything
  // another brick has added to the scene, imported .3dm included. This brick
  // never has to know what any of them are.
  const [hit] = raycaster.intersectObjects(scene.children, true);
  if (hit) return hit.point.clone();

  // Nothing there: fall through to the ground. Z-up, so the ground plane's
  // normal is +Z and its constant is 0.
  const onGround = new THREE.Vector3();
  return raycaster.ray.intersectPlane(groundPlane, onGround) ? onGround : null;
}

function MeasureScene({ palette, framing }) {
  const { gl, camera, scene } = useThree();
  const active = useAtomValue(measureActiveAtom);
  const [points, setPoints] = useAtom(measurePointsAtom);
  const [cursor, setCursor] = useAtom(measureCursorAtom);

  // The listeners are registered once per arming, but they need to know how
  // many points are down *now* — hence a ref rather than a stale closure.
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    if (!active) return undefined;

    const el = gl.domElement;
    const ctx = {
      gl,
      camera,
      scene,
      raycaster: new THREE.Raycaster(),
      groundPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    };
    let downAt = null;

    const onPointerDown = (event) => {
      downAt = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      if (!downAt) return;
      const travelled = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      downAt = null;
      if (travelled > DRAG_SLOP) return; // that was an orbit

      const point = pickPoint(event, ctx);
      if (!point) return;
      // Third click starts a fresh dimension rather than growing a polyline —
      // this is a dimension tool, not a path tool.
      setPoints((prev) => (prev.length >= 2 ? [point] : [...prev, point]));
      setCursor(null);
    };

    const onPointerMove = (event) => {
      if (pointsRef.current.length !== 1) return; // only rubber-band mid-dimension
      setCursor(pickPoint(event, ctx));
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setPoints([]);
      setCursor(null);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointermove", onPointerMove);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, gl, camera, scene, setPoints, setCursor]);

  const [a, b] = points;
  const end = b ?? (a && active ? cursor : null);
  if (!a) return null;

  // Marker size follows the site, so the tool reads the same on a 40 m plot
  // and a 400 m one.
  const dot = Math.max(framing.span * 0.005, 0.15);

  return (
    <group>
      <mesh position={a} raycast={() => null}>
        <sphereGeometry args={[dot, 12, 12]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>

      {end ? (
        <>
          <mesh position={end} raycast={() => null}>
            <sphereGeometry args={[dot, 12, 12]} />
            <meshBasicMaterial color={palette.accent} />
          </mesh>

          <Line
            points={[a, end]}
            color={palette.accent}
            lineWidth={2}
            raycast={() => null}
          />

          {/* Plan run, then rise. In a Z-up scene that dogleg is the whole
              reason to bother: it separates the plan distance from the height
              difference at a glance. */}
          <Line
            points={[a, [end.x, end.y, a.z], end]}
            color={palette.accentSoft}
            lineWidth={1}
            dashed
            dashSize={dot * 2}
            gapSize={dot * 1.5}
            raycast={() => null}
          />

          <Html
            position={[(a.x + end.x) / 2, (a.y + end.y) / 2, (a.z + end.z) / 2]}
            center
            zIndexRange={[20, 10]}
          >
            {/* The label is real DOM, so unlike everything else in this file it
                can just use theme tokens. */}
            <div className="pointer-events-none rounded border bg-background/90 px-1.5 py-0.5 font-mono text-[11px] tabular-nums shadow-sm backdrop-blur">
              {a.distanceTo(end).toFixed(2)} m
            </div>
          </Html>
        </>
      ) : null}
    </group>
  );
}

function MeasureToolbar() {
  const [active, setActive] = useAtom(measureActiveAtom);
  const [points, setPoints] = useAtom(measurePointsAtom);
  const setCursor = useSetAtom(measureCursorAtom);

  const [a, b] = points;
  const complete = a && b;

  const clear = () => {
    setPoints([]);
    setCursor(null);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => {
          setActive(!active);
          clear();
        }}
        title="Click two points to dimension between them — objects or open ground. Esc clears."
      >
        <Ruler className="size-3.5" />
        Measure
      </Button>

      {complete ? (
        <>
          <span className="px-1 font-mono text-xs tabular-nums">
            {a.distanceTo(b).toFixed(2)} m
            <span className="ml-1.5 text-muted-foreground">
              ΔX {(b.x - a.x).toFixed(2)} · ΔY {(b.y - a.y).toFixed(2)} · ΔZ{" "}
              {(b.z - a.z).toFixed(2)}
            </span>
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            onClick={clear}
            title="Clear measurement"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : active ? (
        <span className="px-1 text-xs text-muted-foreground">
          {a ? "pick the second point" : "pick the first point"}
        </span>
      ) : null}
    </div>
  );
}

export const measureBrick = {
  id: "measure-XX",
  label: "Measure",
  hint: "Dimension between two picked points",
  order: 40,
  Toolbar: MeasureToolbar,
  Scene3d: MeasureScene,
};
