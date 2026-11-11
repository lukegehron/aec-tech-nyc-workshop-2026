"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useStore, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Eye, PersonStanding, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clampToSite, headingOf, stanceFor } from "./stance";
import {
  EYE_HEIGHT,
  streetArmedAtom,
  streetPreviewAtom,
  streetReturnAtom,
  streetStanceAtom,
} from "./atoms";

/**
 * STREET VIEW — click anything, stand in front of it at eye level.
 *
 * A TOOL, not a view mode: it builds no boxes, so it never joins the mode rail
 * and it works whichever mode is showing. `Toolbar` is the HTML control,
 * `Scene3d` does the picking and drives the camera.
 *
 * Clicks are picked up with a plain DOM listener on the canvas rather than an
 * r3f `onClick`, for the same two reasons `measure-XX` does it: the view-mode
 * boxes call `stopPropagation()` on theirs, which would eat every pick over a
 * building, and a tool that should work on *anything* shouldn't need every
 * object to opt in. So it shoots its own ray and falls back to the Z = 0 ground
 * plane, which is what makes open pavement clickable too.
 *
 * The camera belongs to `OrbitControls` (`makeDefault` in `Scene.jsx`), so
 * going to street level means moving the controls' target as well as the
 * camera — the same imperative dance `rhino-import-XX` does when it frames an
 * import. We stash the orbit view first so "Back to orbit" returns to the
 * exact view the user left, not a guess.
 */

// Below this many pixels of travel a press-and-release is a click; above it,
// the user was orbiting and meant nothing by it.
const DRAG_SLOP = 4;

// Street level wants to see interiors and far facades without the near plane
// slicing them off.
const STREET_NEAR = 0.1;

/** Ray the pointer into the scene. Returns the hit, its normal and its box. */
function pickSurface(event, { gl, camera, scene, raycaster, groundPlane }) {
  const rect = gl.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);

  // Real geometry first — massing, floor plates, rooms, drawn walls, imported
  // .3dm. This brick never has to know what any of them are.
  const hits = raycaster.intersectObjects(scene.children, true);
  const hit = hits.find((candidate) => candidate.object?.isMesh);

  if (hit) {
    // The normal arrives in the object's local frame; street view needs it in
    // world space to know which way "out of the facade" points.
    let normal = null;
    if (hit.face) {
      normal = hit.face.normal
        .clone()
        .applyNormalMatrix(
          new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
        )
        .normalize()
        .toArray();
    }
    return {
      point: hit.point.toArray(),
      normal,
      box: new THREE.Box3().setFromObject(hit.object),
    };
  }

  // Nothing there: fall through to the pavement. Z-up, so the ground plane's
  // normal is +Z and its constant is 0.
  const onGround = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(groundPlane, onGround)) return null;
  return { point: onGround.toArray(), normal: null, box: null };
}

function StreetScene({ palette, framing }) {
  const { gl, camera, scene } = useThree();
  const store = useStore();
  const [armed, setArmed] = useAtom(streetArmedAtom);
  const [stance, setStance] = useAtom(streetStanceAtom);
  const [preview, setPreview] = useAtom(streetPreviewAtom);
  const [returnTo, setReturnTo] = useAtom(streetReturnAtom);

  // Keep the latest values out of the listener closures, which are registered
  // once per arming.
  const stanceRef = useRef(stance);
  useEffect(() => {
    stanceRef.current = stance;
  }, [stance]);

  // The site, padded a little, so a stance can't end up out in the void.
  const bounds = {
    minX: framing.center[0] - framing.span,
    maxX: framing.center[0] + framing.span,
    minY: framing.center[1] - framing.span,
    maxY: framing.center[1] + framing.span,
  };

  // ── PICKING ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!armed) return undefined;

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
      const travelled = Math.hypot(
        event.clientX - downAt.x,
        event.clientY - downAt.y
      );
      downAt = null;
      if (travelled > DRAG_SLOP) return; // that was an orbit

      const surface = pickSurface(event, ctx);
      if (!surface) return;

      const next = stanceFor({ ...surface, eyeHeight: EYE_HEIGHT });

      // Remember the orbit view ONCE — re-walking from street to street
      // shouldn't overwrite the way home.
      if (!stanceRef.current) {
        const { controls } = store.getState();
        setReturnTo({
          position: camera.position.toArray(),
          target: controls ? controls.target.toArray() : framing.target,
          near: camera.near,
          far: camera.far,
        });
      }

      setStance({
        eye: clampToSite(next.eye, bounds),
        look: next.look,
        label: surface.box ? "facade" : "pavement",
      });
      setPreview(null);
      setArmed(false); // one click, one walk — re-arm to move again
    };

    const onPointerMove = (event) => {
      const surface = pickSurface(event, ctx);
      setPreview(surface ? surface.point : null);
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setArmed(false);
      setPreview(null);
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
    // `bounds` is derived from `framing` each render; depending on the object
    // identity would re-register these listeners every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    armed,
    gl,
    camera,
    scene,
    store,
    framing,
    setStance,
    setPreview,
    setArmed,
    setReturnTo,
  ]);

  // ── DRIVING THE CAMERA ────────────────────────────────────────────────────
  // `useStore()` rather than the `camera` from render: pointing a camera is
  // imperative, and reaching for the live state inside an effect is the
  // documented way to do it (same as `z-slice-XX` and `rhino-import-XX`).
  useEffect(() => {
    const { camera: cam, controls, invalidate } = store.getState();
    if (!controls) return;

    if (stance) {
      cam.position.set(...stance.eye);
      // Near plane tightens so you can stand close to a facade without it
      // being clipped away.
      cam.near = STREET_NEAR;
      cam.updateProjectionMatrix();
      controls.target.set(...stance.look);
      // Standing on the pavement, you can look up and around but not fly — the
      // eye stays put and the target orbits it.
      controls.update();
      invalidate();
      return;
    }

    // Back to orbit: restore exactly what we interrupted.
    if (returnTo) {
      cam.position.set(...returnTo.position);
      cam.near = returnTo.near;
      cam.far = returnTo.far;
      cam.updateProjectionMatrix();
      controls.target.set(...returnTo.target);
      controls.update();
      invalidate();
    }
  }, [store, stance, returnTo]);

  if (!armed || !preview) return null;

  // The landing spot, so a click isn't a leap of faith.
  const dot = Math.max(framing.span * 0.006, 0.2);
  return (
    <group position={preview} userData={{ clashIgnore: true }}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[dot, 16, 16]} />
        <meshBasicMaterial color={palette.accent} depthTest={false} />
      </mesh>
      <Html center zIndexRange={[20, 10]}>
        <div className="pointer-events-none whitespace-nowrap rounded border bg-background/90 px-1.5 py-0.5 font-mono text-[11px] shadow-sm backdrop-blur">
          stand here
        </div>
      </Html>
    </group>
  );
}

function StreetToolbar() {
  const [armed, setArmed] = useAtom(streetArmedAtom);
  const [stance, setStance] = useAtom(streetStanceAtom);
  const setPreview = useSetAtom(streetPreviewAtom);
  const returnTo = useAtomValue(streetReturnAtom);
  const setReturnTo = useSetAtom(streetReturnAtom);

  const leave = () => {
    // Clearing the stance is what triggers the restore in `StreetScene`.
    setStance(null);
    setArmed(false);
    setPreview(null);
    // Drop the saved view too, so the next walk stashes a fresh one.
    setReturnTo(null);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={armed ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => {
          setArmed(!armed);
          setPreview(null);
        }}
        title="Click anywhere in the model to stand there at eye level. Esc cancels."
      >
        <PersonStanding className="size-3.5" />
        Street view
      </Button>

      {armed ? (
        <span className="px-1 text-xs text-muted-foreground">
          click a facade or the ground
        </span>
      ) : null}

      {stance ? (
        <>
          <span className="px-1 font-mono text-xs tabular-nums text-muted-foreground">
            <Eye className="mr-1 inline size-3" />
            {EYE_HEIGHT.toFixed(1)} m · facing {headingOf(stance.eye, stance.look)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-[11px]"
            onClick={leave}
            disabled={!returnTo}
            title="Return to the orbit view you came from"
          >
            <Undo2 className="size-3.5" />
            Back to orbit
          </Button>
        </>
      ) : null}
    </div>
  );
}

export const streetViewME = {
  id: "street-view-ME",
  label: "Street view",
  hint: "Click the model to stand there at eye level",
  order: 46,
  Toolbar: StreetToolbar,
  Scene3d: StreetScene,
};
