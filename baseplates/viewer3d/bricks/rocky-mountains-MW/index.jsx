"use client";

/**
 * Rocky Mountains brick — adds a snow-capped mountain range to the 3D scene.
 */

import { useRef, useMemo } from "react";
import { atom, useAtom } from "jotai";
import { useFrame } from "@react-three/fiber";
import { Button } from "@/components/ui/button";
import { Mountain } from "lucide-react";

const rockyMountainsVisibleAtom = atom(true);

/** Single mountain peak with rocky base and snow cap */
function MountainPeak({ position, height, baseRadius, snowLine, rotation = 0 }) {
  const snowCapHeight = height - snowLine;
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh position={[0, 0, snowLine / 2]} castShadow receiveShadow>
        <coneGeometry args={[baseRadius, snowLine, 8]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0, snowLine + snowCapHeight / 2]} castShadow>
        <coneGeometry args={[baseRadius * (snowCapHeight / height), snowCapHeight, 8]} />
        <meshStandardMaterial color="#f8f8ff" roughness={0.3} flatShading />
      </mesh>
      {[0, 1.5, 3, 4.5].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * baseRadius * 0.5, Math.sin(angle) * baseRadius * 0.5, snowLine * 0.7]} rotation={[0.3, angle, 0]} castShadow>
          <coneGeometry args={[baseRadius * 0.2, height * 0.15, 5]} />
          <meshStandardMaterial color="#f8f8ff" roughness={0.4} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Toolbar() {
  const [visible, setVisible] = useAtom(rockyMountainsVisibleAtom);
  return (
    <Button size="sm" variant={visible ? "default" : "outline"} onClick={() => setVisible((v) => !v)} title={visible ? "Hide Rocky Mountains" : "Show Rocky Mountains"}>
      <Mountain className="h-4 w-4 mr-1.5" />
      Rockies
    </Button>
  );
}

function Scene3d({ palette }) {
  const [visible] = useAtom(rockyMountainsVisibleAtom);
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2;
    }
  });

  const mountains = useMemo(() => [
    { position: [-400, -300, 0], height: 450, baseRadius: 180, snowLine: 280 },
    { position: [-200, -350, 0], height: 520, baseRadius: 200, snowLine: 300 },
    { position: [0, -400, 0], height: 580, baseRadius: 220, snowLine: 320 },
    { position: [200, -350, 0], height: 490, baseRadius: 190, snowLine: 290 },
    { position: [400, -300, 0], height: 420, baseRadius: 170, snowLine: 260 },
    { position: [-300, -500, 0], height: 380, baseRadius: 160, snowLine: 240 },
    { position: [-100, -520, 0], height: 440, baseRadius: 180, snowLine: 270 },
    { position: [100, -540, 0], height: 460, baseRadius: 185, snowLine: 280 },
    { position: [300, -500, 0], height: 400, baseRadius: 165, snowLine: 250 },
    { position: [-350, -200, 0], height: 180, baseRadius: 120, snowLine: 150 },
    { position: [-150, -180, 0], height: 220, baseRadius: 130, snowLine: 180 },
    { position: [50, -190, 0], height: 200, baseRadius: 125, snowLine: 160 },
    { position: [250, -200, 0], height: 190, baseRadius: 115, snowLine: 155 },
  ], []);

  const trees = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    x: (Math.random() - 0.5) * 800,
    y: -120 - Math.random() * 80,
  })), []);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {mountains.map((m, i) => (
        <MountainPeak key={i} position={m.position} height={m.height} baseRadius={m.baseRadius} snowLine={m.snowLine} rotation={i * 0.5} />
      ))}
      <mesh position={[0, -350, -1]} receiveShadow>
        <boxGeometry args={[1200, 600, 2]} />
        <meshStandardMaterial color="#3d5c3d" roughness={0.95} />
      </mesh>
      <mesh position={[0, -600, 0]} receiveShadow>
        <boxGeometry args={[1400, 300, 3]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, t.y, 0]}>
          <mesh position={[0, 0, 8]} castShadow>
            <cylinderGeometry args={[1, 2, 16, 6]} />
            <meshStandardMaterial color="#4a3728" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 22]} castShadow>
            <coneGeometry args={[8, 20, 6]} />
            <meshStandardMaterial color="#1a472a" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0, 38]} castShadow>
            <coneGeometry args={[5, 14, 6]} />
            <meshStandardMaterial color="#1a472a" roughness={0.8} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export const rockyMountainsBrick = {
  id: "rocky-mountains-MW",
  label: "Rocky Mountains",
  hint: "Toggle the snow-capped Rocky Mountains",
  order: 85,
  Toolbar,
  Scene3d,
};
