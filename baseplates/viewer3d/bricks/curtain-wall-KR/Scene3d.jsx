"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  curtainWallActiveAtom,
  curtainWallHoverAtom,
  curtainWallParamsAtom,
  curtainWallsAtom,
} from "./atoms";
import {
  DRAG_SLOP,
  FACE_OFFSET,
  MULLION_DEPTH,
  gridFor,
  noRaycast,
  pickFace,
  yawOf,
} from "./geometry";

function CurtainWall({ wall, params, palette }) {
  const { bays, rows, bayWidth, rowHeight } = gridFor(wall, params);
  const { width, height } = wall;
  const size = params.mullionSize;
  const y = FACE_OFFSET + MULLION_DEPTH / 2;

  const verticals = Array.from({ length: bays + 1 }, (_, i) => -width / 2 + i * bayWidth);
  // Keep the top and bottom transoms inside the wall rather than overhanging.
  const horizontals = Array.from({ length: rows + 1 }, (_, j) =>
    Math.min(Math.max(j * rowHeight, size / 2), height - size / 2)
  );

  return (
    <group position={wall.center} rotation={[0, 0, yawOf(wall.normal)]}>
      <mesh position={[0, FACE_OFFSET, height / 2]} raycast={noRaycast}>
        <boxGeometry args={[width, 0.02, height]} />
        <meshStandardMaterial
          color={palette.boxHover}
          roughness={0.05}
          metalness={0.6}
          transparent
          opacity={0.45}
        />
      </mesh>

      {verticals.map((x, i) => (
        <mesh key={`m${i}`} position={[x, y, height / 2]} castShadow raycast={noRaycast}>
          <boxGeometry args={[size, MULLION_DEPTH, height]} />
          <meshStandardMaterial color={palette.gridSection} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {horizontals.map((z, j) => (
        <mesh key={`t${j}`} position={[0, y, z]} castShadow raycast={noRaycast}>
          <boxGeometry args={[width, MULLION_DEPTH, size]} />
          <meshStandardMaterial color={palette.gridSection} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** Accent outline of the face under the cursor, so you can see what a click hits. */
function HoverOutline({ face, palette }) {
  const { width: w, height: h } = face;
  const y = FACE_OFFSET + MULLION_DEPTH + 0.02;
  return (
    <group position={face.center} rotation={[0, 0, yawOf(face.normal)]}>
      <Line
        points={[
          [-w / 2, y, 0],
          [w / 2, y, 0],
          [w / 2, y, h],
          [-w / 2, y, h],
          [-w / 2, y, 0],
        ]}
        color={palette.accent}
        lineWidth={2}
        raycast={noRaycast}
      />
    </group>
  );
}

export function CurtainWallScene({ palette }) {
  const { gl, camera, scene } = useThree();
  const active = useAtomValue(curtainWallActiveAtom);
  const walls = useAtomValue(curtainWallsAtom);
  const setWalls = useSetAtom(curtainWallsAtom);
  const [hover, setHover] = useAtom(curtainWallHoverAtom);
  const params = useAtomValue(curtainWallParamsAtom);

  useEffect(() => {
    if (!active) return undefined;

    const el = gl.domElement;
    const ctx = { gl, camera, scene, raycaster: new THREE.Raycaster() };
    let downAt = null;
    let lastHoverId = null;

    const onPointerDown = (event) => {
      downAt = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      if (!downAt) return;
      const travelled = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      downAt = null;
      if (travelled > DRAG_SLOP) return; // that was an orbit
      const face = pickFace(event, ctx);
      if (!face) return;
      setWalls((prev) => [...prev.filter((w) => w.id !== face.id), face]);
    };

    const onPointerMove = (event) => {
      if (downAt) return; // orbiting — don't thrash the preview
      const face = pickFace(event, ctx);
      const id = face?.id ?? null;
      if (id === lastHoverId) return; // only re-render when the face changes
      lastHoverId = id;
      setHover(face);
    };

    const onPointerLeave = () => {
      lastHoverId = null;
      setHover(null);
    };

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
  }, [active, gl, camera, scene, setWalls, setHover]);

  return (
    <group>
      {walls.map((wall) => (
        <CurtainWall key={wall.id} wall={wall} params={params} palette={palette} />
      ))}
      {active && hover ? <HoverOutline face={hover} palette={palette} /> : null}
    </group>
  );
}
