"use client";

import { Html } from "@react-three/drei";
import { surfaceFrame } from "./earth";

// Draws one landmark from the plain-data parts in ./landmarks.js. Z-up: a
// part's local +Z is "up the building".

function Part({ part }) {
  const { kind, color, x = 0, y = 0, z = 0, tilt = 0 } = part;
  let body = null;
  if (kind === "cyl") {
    const seg = part.seg ?? 20;
    // For a 4-sided frustum `r` is the half-width, so push out to the corner
    // radius; the half-step phase keeps it axis-aligned.
    const k = seg === 4 ? Math.SQRT2 : 1;
    body = (
      <mesh position={[0, 0, part.h / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[part.r2 * k, part.r1 * k, part.h, seg, 1, false, Math.PI / seg]}
        />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
    );
  } else if (kind === "box") {
    body = (
      <mesh position={[0, 0, part.h / 2]}>
        <boxGeometry args={[part.w, part.l, part.h]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    );
  } else if (kind === "sphere") {
    body = (
      <mesh scale={part.scale ?? [1, 1, 1]}>
        <sphereGeometry args={[part.r, 20, 14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    );
  }
  return (
    <group position={[x, y, z]} rotation={[0, tilt, 0]}>
      {body}
    </group>
  );
}

export default function Landmark({ item, radius }) {
  const { up, quaternion } = surfaceFrame(item.lat, item.lon);
  const size = item.height * radius;
  return (
    <group
      position={up.clone().multiplyScalar(radius * 0.995).toArray()}
      quaternion={quaternion}
    >
      <group scale={size}>
        {item.parts.map((part, i) => (
          <Part key={i} part={part} />
        ))}
      </group>
      {/* Label is HTML, not a drei <Text> — Text suspends, and nothing inside
          <Canvas> may suspend (see AGENTS.md). */}
      <Html position={[0, 0, size * 1.15]} center zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full border bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow">
          {item.name}
        </div>
      </Html>
    </group>
  );
}
