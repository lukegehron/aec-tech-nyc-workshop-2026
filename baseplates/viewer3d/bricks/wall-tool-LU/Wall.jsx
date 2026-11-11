"use client";

import { wallFrame, wallPieces } from "./model";

// r3f elements only — everything here renders inside <Canvas>. Colours come
// from the baseplate's `palette`, never a theme lookup.

export const NO_RAYCAST = () => null;

function Door({ opening, wall, palette }) {
  const { u, width, height } = opening;
  return (
    <mesh position={[u, 0, (height - 0.02) / 2]} userData={{ wallId: wall.id }} castShadow>
      <boxGeometry args={[width - 0.06, wall.thickness * 0.35, height - 0.02]} />
      <meshStandardMaterial color={palette.accent} roughness={0.6} />
    </mesh>
  );
}

function Window({ opening, wall, palette }) {
  const { u, width, height, sill } = opening;
  const frame = { color: palette.gridSection, roughness: 0.6 };
  return (
    <group>
      {/* Glass */}
      <mesh position={[u, 0, sill + height / 2]} userData={{ wallId: wall.id }}>
        <boxGeometry args={[width - 0.04, 0.03, height - 0.04]} />
        <meshStandardMaterial
          color={palette.accentSoft}
          transparent
          opacity={0.4}
          roughness={0.1}
        />
      </mesh>
      {/* Mullion */}
      <mesh position={[u, 0, sill + height / 2]} userData={{ wallId: wall.id }}>
        <boxGeometry args={[0.04, 0.06, height - 0.04]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      {/* Sill board, proud of the wall on both faces */}
      <mesh position={[u, 0, sill + 0.02]} userData={{ wallId: wall.id }} castShadow>
        <boxGeometry args={[width + 0.1, wall.thickness + 0.08, 0.04]} />
        <meshStandardMaterial {...frame} />
      </mesh>
    </group>
  );
}

/** One wall, rebuilt as solid pieces around its openings. */
export function Wall({ wall, palette, ghost = false }) {
  const noPick = ghost ? { raycast: NO_RAYCAST } : {};
  return (
    <group {...wallFrame(wall)}>
      {wallPieces(wall).map(([u0, u1, z0, z1]) => (
        <mesh
          key={`${u0.toFixed(3)}:${z0.toFixed(3)}`}
          position={[(u0 + u1) / 2, 0, (z0 + z1) / 2]}
          userData={{ wallId: wall.id }}
          castShadow={!ghost}
          receiveShadow={!ghost}
          {...noPick}
        >
          <boxGeometry args={[u1 - u0, wall.thickness, z1 - z0]} />
          <meshStandardMaterial
            color={palette.box}
            roughness={0.85}
            transparent={ghost}
            opacity={ghost ? 0.4 : 1}
            depthWrite={!ghost}
          />
        </mesh>
      ))}
      {wall.openings.map((o) =>
        o.type === "door" ? (
          <Door key={o.id} opening={o} wall={wall} palette={palette} />
        ) : (
          <Window key={o.id} opening={o} wall={wall} palette={palette} />
        )
      )}
    </group>
  );
}

/** Where a door/window would go: tinted if it fits, wireframe if it doesn't. */
export function OpeningPreview({ wall, preview, palette }) {
  return (
    <group {...wallFrame(wall)}>
      <mesh position={[preview.u, 0, preview.sill + preview.height / 2]} raycast={NO_RAYCAST}>
        <boxGeometry args={[preview.width, wall.thickness + 0.06, preview.height]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={preview.valid ? 0.5 : 0.9}
          wireframe={!preview.valid}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
