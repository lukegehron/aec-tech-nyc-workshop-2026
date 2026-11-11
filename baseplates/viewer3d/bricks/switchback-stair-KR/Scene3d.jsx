"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stairActiveAtom, stairHoverAtom, stairParamsAtom, stairsAtom } from "./atoms";
import { DRAG_SLOP, buildingAt, clampToBuilding, stairBlocks } from "./geometry";
import { Ghost, Stair } from "./StairMeshes";

/** Plan point under the pointer: the first real hit, else the Z = 0 ground. */
function pickPlan(event, { gl, camera, scene, raycaster, groundPlane }) {
  const rect = gl.domElement.getBoundingClientRect();
  raycaster.setFromCamera(
    new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    ),
    camera
  );
  const [hit] = raycaster.intersectObjects(scene.children, true);
  if (hit) return hit.point;
  const onGround = new THREE.Vector3();
  return raycaster.ray.intersectPlane(groundPlane, onGround) ? onGround : null;
}

/** Where a click would put a stair: `{ center, building }`, or null off-building. */
function candidateAt(event, ctx, data, params) {
  const point = pickPlan(event, ctx);
  if (!point) return null;
  const building = buildingAt(data, point.x, point.y);
  if (!building) return null;
  const { footprint } = stairBlocks(building.floors, params);
  const center = clampToBuilding(building, [point.x, point.y], footprint, params.rotation);
  return { center, building };
}

export function StairScene({ data, palette }) {
  const { gl, camera, scene } = useThree();
  const active = useAtomValue(stairActiveAtom);
  const stairs = useAtomValue(stairsAtom);
  const setStairs = useSetAtom(stairsAtom);
  const [hover, setHover] = useAtom(stairHoverAtom);
  const params = useAtomValue(stairParamsAtom);

  // Listeners are registered once per arming, but params can change while
  // armed (rotate, resize) — read them through a ref, not a stale closure.
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

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
      const hit = candidateAt(event, ctx, data, paramsRef.current);
      if (!hit) return;
      const { building, center } = hit;
      setStairs((prev) => [
        ...prev,
        {
          id: `${building.id}:${center.map((v) => v.toFixed(2)).join(":")}:${Date.now()}`,
          center,
          buildingId: building.id,
          buildingName: building.name,
          // Snapshots, so a stair never has to look its building up again.
          outline: building.outline,
          floors: building.floors.map(({ level, elevation, height }) => ({
            level,
            elevation,
            height,
          })),
        },
      ]);
    };

    const onPointerMove = (event) => {
      if (downAt) return; // orbiting
      setHover(candidateAt(event, ctx, data, paramsRef.current));
    };

    const onPointerLeave = () => setHover(null);

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      setHover(null);
    };
  }, [active, gl, camera, scene, data, setStairs, setHover]);

  return (
    <group>
      {stairs.map((stair) => (
        <Stair key={stair.id} stair={stair} params={params} palette={palette} />
      ))}
      {active && hover ? <Ghost candidate={hover} params={params} palette={palette} /> : null}
    </group>
  );
}
