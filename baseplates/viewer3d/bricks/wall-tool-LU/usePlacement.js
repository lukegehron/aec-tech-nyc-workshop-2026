"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  commitWallsAtom,
  openingPreviewAtom,
  wallCursorAtom,
  wallDraftStartAtom,
  wallToolAtom,
  wallsAtom,
} from "./atoms";
import { MIN_WALL, WALL, alongWall, newId, placeOpening, snapPoint } from "./model";

// Like measure-XX: plain DOM listeners on the canvas (the massing boxes stop
// propagation on their r3f handlers), and a drag threshold so orbiting never
// places anything.
const DRAG_SLOP = 4;

/**
 * Wires the canvas for the armed tool. `wallsGroup` is a ref to the group
 * holding only the committed walls — the thing doors and windows pick.
 */
export function usePlacement(wallsGroup) {
  const { gl, camera } = useThree();
  const tool = useAtomValue(wallToolAtom);
  const walls = useAtomValue(wallsAtom);
  const start = useAtomValue(wallDraftStartAtom);
  const commit = useSetAtom(commitWallsAtom);
  const setStart = useSetAtom(wallDraftStartAtom);
  const setCursor = useSetAtom(wallCursorAtom);
  const setPreview = useSetAtom(openingPreviewAtom);

  // Listeners are registered once per arming but need the current model.
  const wallsRef = useRef(walls);
  const startRef = useRef(start);
  useEffect(() => {
    wallsRef.current = walls;
  }, [walls]);
  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    if (!tool) return undefined;

    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ground = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Z-up

    const aim = (event) => {
      const rect = el.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        ),
        camera
      );
    };

    // Walls stand on the ground, so they pick the ground plane directly —
    // massing boxes in the way don't matter.
    const groundPoint = (event) => {
      aim(event);
      const hit = new THREE.Vector3();
      return raycaster.ray.intersectPlane(ground, hit)
        ? snapPoint([hit.x, hit.y], wallsRef.current)
        : null;
    };

    const wallHit = (event) => {
      if (!wallsGroup.current) return null;
      aim(event);
      const [hit] = raycaster.intersectObject(wallsGroup.current, true);
      const wall = hit && wallsRef.current.find((w) => w.id === hit.object.userData.wallId);
      if (!wall) return null;
      return { wall, ...placeOpening(wall, tool, alongWall(wall, hit.point.x, hit.point.y)) };
    };

    const clickWall = (event) => {
      const p = groundPoint(event);
      if (!p) return;
      const s = startRef.current;
      if (!s) {
        setStart(p);
        return;
      }
      // Clicking the last corner again finishes the chain.
      if (Math.hypot(p[0] - s[0], p[1] - s[1]) < MIN_WALL) {
        setStart(null);
        setCursor(null);
        return;
      }
      commit([...wallsRef.current, { id: newId("wall"), a: s, b: p, ...WALL, openings: [] }]);
      setStart(p); // keep going from this corner
    };

    const clickOpening = (event) => {
      const hit = wallHit(event);
      if (!hit || !hit.valid) return;
      const { wall, type, u, width, height, sill } = hit;
      const opening = { id: newId(type), type, u, width, height, sill };
      commit(
        wallsRef.current.map((w) =>
          w.id === wall.id ? { ...w, openings: [...w.openings, opening] } : w
        )
      );
      setPreview(null);
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
      if (tool === "wall") clickWall(event);
      else clickOpening(event);
    };

    const onPointerMove = (event) => {
      if (tool === "wall") {
        if (startRef.current) setCursor(groundPoint(event));
        return;
      }
      const hit = wallHit(event);
      if (!hit) {
        setPreview(null);
        return;
      }
      const { wall, ...rest } = hit;
      setPreview({ wallId: wall.id, ...rest });
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setStart(null);
      setCursor(null);
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
  }, [tool, gl, camera, wallsGroup, commit, setStart, setCursor, setPreview]);
}
