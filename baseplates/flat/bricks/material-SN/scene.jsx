"use client";

// The 3D part of the material viewer. Textures arrive ready-made from the card
// (never loaded inside <Canvas> — a suspending loader there kills the WebGL
// context on first load). Lighting is plain lights, no HDR download.

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MirroredRepeatWrapping, RepeatWrapping, ClampToEdgeWrapping } from "three";

export const LIGHTS = {
  studio: { label: "Studio", bg: "#e5e7eb", amb: 0.5, dir: [{ p: [4, 5, 4], i: 2.4, c: "#ffffff" }, { p: [-5, 2, -2], i: 0.9, c: "#cfe0ff" }] },
  daylight: { label: "Daylight", bg: "#bcd7f0", hemi: ["#bfdcff", "#8a7f6e", 1.3], amb: 0.2, dir: [{ p: [5, 8, 3], i: 3, c: "#fff4dd" }] },
  sunset: { label: "Sunset", bg: "#2a1830", hemi: ["#7a4a7e", "#2a1a1a", 0.6], amb: 0.1, dir: [{ p: [-6, 1.5, 3], i: 3.6, c: "#ff8a3d" }] },
  raking: { label: "Raking (shows relief)", bg: "#1f2227", amb: 0.12, dir: [{ p: [6, 0.5, 1.5], i: 3.4, c: "#ffffff" }] },
  night: { label: "Spot at night", bg: "#05060a", amb: 0.04, spot: { p: [0, 4.5, 3.5], i: 140, c: "#d6e4ff" }, dir: [] },
};

export const SHAPES = {
  sphere: "Sphere",
  cube: "Cube",
  cylinder: "Cylinder",
  knot: "Torus knot",
  plane: "Flat panel",
  wall: "Wall",
  floor: "Floor",
};

const WRAP = { repeat: RepeatWrapping, mirror: MirroredRepeatWrapping, clamp: ClampToEdgeWrapping };

// Writes tiling onto a texture. Kept outside components: it mutates the texture.
export function applyTiling(tex, t) {
  tex.wrapS = tex.wrapT = WRAP[t.wrap];
  tex.repeat.set(t.repeatX, t.repeatY);
  tex.offset.set(t.offsetX, t.offsetY);
  tex.center.set(0.5, 0.5);
  tex.rotation = (t.rotation * Math.PI) / 180;
  tex.needsUpdate = true;
}

function Geometry({ shape }) {
  if (shape === "sphere") return <sphereGeometry args={[1.25, 96, 64]} />;
  if (shape === "cube") return <boxGeometry args={[1.9, 1.9, 1.9]} />;
  if (shape === "cylinder") return <cylinderGeometry args={[1, 1, 2.3, 96, 1]} />;
  if (shape === "knot") return <torusKnotGeometry args={[0.8, 0.3, 256, 48]} />;
  if (shape === "wall") return <planeGeometry args={[4.4, 2.8]} />;
  if (shape === "floor") return <planeGeometry args={[5, 5]} />;
  return <planeGeometry args={[3, 3]} />;
}

function Lights({ preset, angle, power }) {
  const L = LIGHTS[preset];
  const a = (angle * Math.PI) / 180;
  const spin = ([x, y, z]) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
  return (
    <>
      <ambientLight intensity={L.amb * power} />
      {L.hemi && <hemisphereLight args={[L.hemi[0], L.hemi[1], L.hemi[2] * power]} />}
      {L.dir.map((d, i) => (
        <directionalLight key={i} position={spin(d.p)} intensity={d.i * power} color={d.c} />
      ))}
      {L.spot && <spotLight position={spin(L.spot.p)} intensity={L.spot.i * power} color={L.spot.c} angle={0.7} penumbra={0.7} />}
    </>
  );
}

function Subject({ shape, textures, tiling, m }) {
  useEffect(() => {
    Object.values(textures).forEach((tex) => tex && applyTiling(tex, tiling));
  }, [textures, tiling]);

  const rot = shape === "floor" ? [-Math.PI / 2.6, 0, 0] : [0, 0, 0];
  // Remount the material when a map slot is added/removed: three needs a
  // shader recompile for that, and a changed key guarantees it.
  const key = Object.keys(textures).filter((k) => textures[k]).sort().join(",");
  return (
    <mesh rotation={rot}>
      <Geometry shape={shape} />
      <meshStandardMaterial
        key={key}
        color={m.tint}
        map={textures.map}
        normalMap={textures.normalMap}
        normalScale={[m.normal, m.normal]}
        roughnessMap={textures.roughnessMap}
        roughness={m.roughness}
        metalnessMap={textures.metalnessMap}
        metalness={m.metalness}
        aoMap={textures.aoMap}
        bumpMap={textures.bumpMap}
        bumpScale={m.bump}
        side={shape === "plane" || shape === "wall" || shape === "floor" ? 2 : 0}
      />
    </mesh>
  );
}

export function MaterialScene({ shape, textures, tiling, m, light, spin }) {
  return (
    <Canvas camera={{ position: [0, 0.4, 4.6], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
      <color attach="background" args={[LIGHTS[light.preset].bg]} />
      <Lights preset={light.preset} angle={light.angle} power={light.power} />
      <Subject shape={shape} textures={textures} tiling={tiling} m={m} />
      <OrbitControls enablePan={false} autoRotate={spin} autoRotateSpeed={1.6} />
    </Canvas>
  );
}
