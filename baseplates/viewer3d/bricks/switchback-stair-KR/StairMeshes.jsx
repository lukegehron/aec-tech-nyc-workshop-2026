"use client";

import { Line } from "@react-three/drei";
import { clampToBuilding, stairBlocks } from "./geometry";

// What a stair looks like in the canvas. r3f elements only — no HTML.
// Every mesh opts out of raycasting so a stair can't be picked as a floor.

export const noRaycast = () => null;
const DEG = Math.PI / 180;

function Block({ block, color, xray }) {
  const size = [block.x1 - block.x0, block.y1 - block.y0, block.z1 - block.z0];
  const position = [
    (block.x0 + block.x1) / 2,
    (block.y0 + block.y1) / 2,
    (block.z0 + block.z1) / 2,
  ];
  return (
    <mesh
      position={position}
      castShadow={!xray}
      receiveShadow={!xray}
      raycast={noRaycast}
      // X-ray draws over the massing, so a stair inside a building shows.
      renderOrder={xray ? 10 : 0}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        transparent={xray}
        opacity={xray ? 0.85 : 1}
        depthTest={!xray}
        depthWrite={!xray}
      />
    </mesh>
  );
}

/**
 * One placed stair. Geometry is rebuilt from the live params every render,
 * and the position is re-clamped so a stair that grows stays inside its
 * building.
 */
export function Stair({ stair, params, palette }) {
  const { blocks, footprint } = stairBlocks(stair.floors, params);
  const [x, y] = clampToBuilding(stair, stair.center, footprint, params.rotation);
  return (
    <group position={[x, y, 0]} rotation={[0, 0, params.rotation * DEG]}>
      {blocks.map((b, i) => (
        <Block
          key={i}
          block={b}
          xray={params.xray}
          color={b.kind === "tread" ? palette.accent : palette.accentSoft}
        />
      ))}
    </group>
  );
}

/** Placement preview: footprint at grade and at the top, joined at the corners. */
export function Ghost({ candidate, params, palette }) {
  const { footprint, storeys } = stairBlocks(candidate.building.floors, params);
  if (!storeys.length) return null;
  const top = storeys.at(-1);
  const zTop = top.floor.elevation + top.floor.height;
  const [w, d] = footprint.map((v) => v / 2);
  const ring = (z) => [
    [-w, -d, z],
    [w, -d, z],
    [w, d, z],
    [-w, d, z],
    [-w, -d, z],
  ];
  const corners = [
    [-w, -d],
    [w, -d],
    [w, d],
    [-w, d],
  ];
  const line = { color: palette.accent, depthTest: false, raycast: noRaycast, renderOrder: 11 };

  return (
    <group
      position={[candidate.center[0], candidate.center[1], 0]}
      rotation={[0, 0, params.rotation * DEG]}
    >
      <Line points={ring(0.05)} lineWidth={2} {...line} />
      <Line points={ring(zTop)} lineWidth={2} {...line} />
      {corners.map(([cx, cy]) => (
        <Line
          key={`${cx}:${cy}`}
          points={[
            [cx, cy, 0.05],
            [cx, cy, zTop],
          ]}
          lineWidth={1}
          dashed
          dashSize={0.4}
          gapSize={0.3}
          {...line}
        />
      ))}
    </group>
  );
}
