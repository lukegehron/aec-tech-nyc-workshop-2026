"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Z-UP. This is the whole reason the numbers below look the way they do.
// ---------------------------------------------------------------------------
// AEC tools are Z-up — Rhino, Revit, IFC, DWG — and three.js is Y-up. Setting
// DEFAULT_UP before any Object3D is constructed makes every camera, light and
// mesh in this baseplate agree, so a .3dm file drops in without a fix-up
// rotation. `geometry.js` does the matching swap on the project data.
//
// It is a global on THREE, so it would leak to any other baseplate that used
// three.js — today `viewer3d` is the only one, and that's worth re-checking
// before a second 3D baseplate lands.
THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);

// Nothing in here suspends. Loaders inside <Canvas> (drei's <Environment
// preset>, useLoader, useGLTF) tear down and remount the renderer when they
// suspend, and the disposed renderer calls forceContextLoss() on the canvas —
// which then never gets a context back. See AGENTS.md.

// CLAUDE.md tells you not to hardcode a shade, because the app has two themes.
// A three.js material can't take a Tailwind class, so this is the shape that
// rule takes inside a canvas: ONE palette per theme, in one place, picked in
// the component that owns the <Canvas>. Every colour below is a value the
// renderer needs, not a style choice made at the call site — nothing further
// down this file names a colour.
//
// Bricks that draw in 3D get this object handed to them as `palette`, which is
// how a brick paints itself without ever reading `resolvedTheme`.
const PALETTES = {
  light: {
    ground: "#efece6",
    box: "#b9b5ad",
    boxHover: "#d8d4cc",
    gridCell: "#d6d2ca",
    gridSection: "#a8a49c",
    accent: "#b45309", // measurement lines, section plane, import tint
    accentSoft: "#f0b357",
  },
  dark: {
    ground: "#2a2926",
    box: "#6f6b63",
    boxHover: "#928d84",
    gridCell: "#3b3a36",
    gridSection: "#55534d",
    accent: "#f0b357",
    accentSoft: "#b45309",
  },
};

function Box({ box, color, hoverColor, hovered, onHover, onSelect }) {
  return (
    <mesh
      position={box.position}
      castShadow
      receiveShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(box);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(box);
      }}
    >
      <boxGeometry args={box.size} />
      <meshStandardMaterial
        color={hovered ? hoverColor : color}
        roughness={0.75}
        metalness={0}
        transparent={box.dimmed}
        opacity={box.dimmed ? 0.12 : 1}
      />
    </mesh>
  );
}

/**
 * The site plate — gives the massing something to sit on.
 *
 * Z-up: a three.js PlaneGeometry is already in the XY plane, so unlike the
 * Y-up version this needs no rotation at all. It sits a hair below zero so it
 * doesn't z-fight the grid.
 */
function Ground({ outline, color }) {
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return (
    <mesh position={[(minX + maxX) / 2, (minY + maxY) / 2, -0.02]} receiveShadow>
      <planeGeometry args={[maxX - minX, maxY - minY]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

export default function Scene({
  boxes,
  framing,
  siteOutline,
  hoveredKey,
  onHover,
  onSelect,
  sceneBricks = [],
  brickContext,
}) {
  // Read the theme HERE, above <Canvas>, and pass plain values down. R3F runs
  // its own reconciler, so keeping React context out of the 3D tree is one
  // less thing that can go wrong.
  const { resolvedTheme } = useTheme();
  const palette = PALETTES[resolvedTheme === "dark" ? "dark" : "light"];

  return (
    <Canvas
      shadows="percentage"
      // `up` is passed explicitly as well as via DEFAULT_UP: the default is
      // read when the camera is constructed, and being able to see the Z-up
      // decision at the call site is worth the duplication.
      camera={{ position: framing.position, up: [0, 0, 1], fov: 40, near: 0.5, far: 2000 }}
      // Lets a brick clip geometry with material.clippingPlanes as well as the
      // renderer-wide gl.clippingPlanes. The Z slice uses the latter.
      gl={{ localClippingEnabled: true }}
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#ffffff", "#b0aa9e", 0.5]} />
      <directionalLight
        position={[framing.center[0] + 60, framing.center[1] + 40, 90]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-far={400}
      />

      <Ground outline={siteOutline} color={palette.ground} />

      {boxes.map((box) => (
        <Box
          key={box.key}
          box={box}
          // A brick's own colour wins — department colours come from the data
          // and carry meaning in both themes.
          color={box.color ?? palette.box}
          hoverColor={palette.boxHover}
          hovered={hoveredKey === box.key}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}

      {/* EXTENSION POINT — anything a brick wants to draw in 3D. Same rule as
          the rest of this file: no list of features lives here, the list comes
          from bricks/bricks.js. A brick gets plain values (including the
          palette) so it never has to read the theme itself. */}
      {sceneBricks.map(({ id, Scene3d }) => (
        <Scene3d key={id} {...brickContext} palette={palette} />
      ))}

      {/* Z-up: drei's Grid is built in the XZ plane, so it needs a quarter turn
          about X to lie flat on the ground here. */}
      <Grid
        args={[framing.gridSize, framing.gridSize]}
        position={[framing.center[0], framing.center[1], 0]}
        rotation={[Math.PI / 2, 0, 0]}
        // The grid is a reading aid, not geometry. It's an infinite plane, so
        // leaving it raycastable means a brick that shoots a ray into the scene
        // hits it before anything real.
        raycast={() => null}
        cellSize={5}
        cellColor={palette.gridCell}
        sectionSize={25}
        sectionColor={palette.gridSection}
        fadeDistance={framing.gridSize * 1.6}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        target={framing.target}
        // Polar angle is measured from the camera's up vector, which is now Z —
        // so this still means "don't let the camera drop below the ground".
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
