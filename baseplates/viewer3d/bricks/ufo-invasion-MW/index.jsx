"use client";

/**
 * UFO INVASION brick — aliens have arrived at Navy Yard Commons!
 *
 * Features:
 * - Multiple UFOs with spinning lights and pulsing glow
 * - Tractor beams abducting cows from the site
 * - Floating/rotating cows being pulled into the ships
 * - Mothership hovering ominously above
 * - Alien scout creatures on the ground
 *
 * This is a TOOL brick — it layers on top of any view mode.
 */

import { useRef, useMemo } from "react";
import { atom, useAtom } from "jotai";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

// Local atom for toggling the invasion
const ufoInvasionActiveAtom = atom(false);

/**
 * Classic flying saucer with spinning rim lights
 */
function UFO({ position, scale = 1, speed = 1, beamActive = true }) {
  const groupRef = useRef();
  const lightsRef = useRef();
  const beamRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (groupRef.current) {
      groupRef.current.position.z = position[2] + Math.sin(t * 0.8) * 3;
      groupRef.current.position.x = position[0] + Math.sin(t * 0.3) * 5;
      groupRef.current.position.y = position[1] + Math.cos(t * 0.4) * 5;
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.cos(t * 0.3) * 0.1;
    }
    if (lightsRef.current) {
      lightsRef.current.rotation.z = t * 2;
    }
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.3 + Math.sin(t * 4) * 0.15;
    }
  });

  const rimLights = useMemo(() => {
    const lights = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const colors = ["#00ff00", "#ff0000", "#0088ff", "#ffff00"];
      lights.push({ angle, color: colors[i % colors.length], radius: 8 * scale });
    }
    return lights;
  }, [scale]);

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[10 * scale, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#444455" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 2 * scale]} castShadow>
        <sphereGeometry args={[5 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#88ffaa" metalness={0.3} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, -1 * scale]} castShadow>
        <torusGeometry args={[9 * scale, 1.5 * scale, 8, 32]} />
        <meshStandardMaterial color="#666677" metalness={0.9} roughness={0.1} />
      </mesh>
      <group ref={lightsRef}>
        {rimLights.map((light, i) => (
          <mesh key={i} position={[Math.cos(light.angle) * light.radius, Math.sin(light.angle) * light.radius, -1 * scale]}>
            <sphereGeometry args={[0.8 * scale, 8, 8]} />
            <meshBasicMaterial color={light.color} />
          </mesh>
        ))}
      </group>
      {beamActive && (
        <mesh ref={beamRef} position={[0, 0, -40 * scale]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[15 * scale, 80 * scale, 32, 1, true]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      <pointLight position={[0, 0, -3 * scale]} color="#00ff88" intensity={50 * scale} distance={100 * scale} />
    </group>
  );
}

/** The MOTHERSHIP — massive and ominous */
function Mothership({ position }) {
  const groupRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.z = position[2] + Math.sin(t * 0.2) * 5;
      groupRef.current.rotation.z = t * 0.1;
    }
    if (ringRef.current) ringRef.current.rotation.z = -t * 0.5;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow><cylinderGeometry args={[40, 60, 15, 8]} /><meshStandardMaterial color="#333344" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0, 12]} castShadow><cylinderGeometry args={[20, 40, 10, 8]} /><meshStandardMaterial color="#444455" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0, 0, 22]} castShadow><sphereGeometry args={[12, 32, 16]} /><meshStandardMaterial color="#66ffaa" metalness={0.4} roughness={0.1} transparent opacity={0.6} /></mesh>
      <group ref={ringRef} position={[0, 0, -5]}><mesh><torusGeometry args={[55, 3, 8, 64]} /><meshBasicMaterial color="#ff4400" /></mesh></group>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return <pointLight key={i} position={[Math.cos(angle) * 45, Math.sin(angle) * 45, -10]} color="#ff0044" intensity={100} distance={150} />;
      })}
      <mesh position={[0, 0, -60]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[50, 120, 32, 1, true]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Abducted cow floating up in a tractor beam */
function AbductedCow({ startPosition, targetZ, speed = 1, rotationSpeed = 2 }) {
  const groupRef = useRef();
  const startZ = startPosition[2];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;
    const cycle = (Math.sin(t * 0.5) + 1) / 2;
    groupRef.current.position.z = startZ + cycle * (targetZ - startZ);
    groupRef.current.rotation.x = t * rotationSpeed * 0.7;
    groupRef.current.rotation.y = t * rotationSpeed;
    groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.5;
    groupRef.current.position.x = startPosition[0] + Math.sin(t * 2) * 2;
    groupRef.current.position.y = startPosition[1] + Math.cos(t * 1.5) * 2;
  });

  return (
    <group ref={groupRef} position={startPosition}>
      <mesh castShadow><boxGeometry args={[4, 2.5, 2]} /><meshStandardMaterial color="#f5f5f5" roughness={0.9} /></mesh>
      <mesh position={[2.5, 0, 0.3]} castShadow><boxGeometry args={[1.5, 1.5, 1.5]} /><meshStandardMaterial color="#f5f5f5" roughness={0.9} /></mesh>
      <mesh position={[3.3, 0, 0]} castShadow><boxGeometry args={[0.5, 1, 0.8]} /><meshStandardMaterial color="#ffcccc" roughness={0.9} /></mesh>
      <mesh position={[0, 0.8, 1.01]}><circleGeometry args={[0.6, 8]} /><meshStandardMaterial color="#222" roughness={0.9} /></mesh>
      <mesh position={[-1, -0.5, 1.01]}><circleGeometry args={[0.4, 8]} /><meshStandardMaterial color="#222" roughness={0.9} /></mesh>
      {[[1.2, 0.8, -1.5], [1.2, -0.8, -1.5], [-1.2, 0.8, -1.5], [-1.2, -0.8, -1.5]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow><boxGeometry args={[0.4, 0.4, 1.5]} /><meshStandardMaterial color="#f5f5f5" roughness={0.9} /></mesh>
      ))}
      <mesh position={[-0.5, 0, -1.2]}><sphereGeometry args={[0.5, 8, 8]} /><meshStandardMaterial color="#ffcccc" roughness={0.8} /></mesh>
    </group>
  );
}

/** Little green alien scout on the ground */
function AlienScout({ position, speed = 1 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (groupRef.current) {
      groupRef.current.position.x = position[0] + Math.sin(t * 3) * 8;
      groupRef.current.position.y = position[1] + Math.cos(t * 2) * 5;
      groupRef.current.rotation.z = Math.sin(t * 6) * 0.2;
      groupRef.current.rotation.x = Math.cos(t * 3) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 2]} castShadow><capsuleGeometry args={[1.5, 2, 8, 16]} /><meshStandardMaterial color="#44ff44" roughness={0.6} /></mesh>
      <mesh position={[0, 0, 5.5]} castShadow><sphereGeometry args={[2, 16, 16]} /><meshStandardMaterial color="#66ff66" roughness={0.5} /></mesh>
      <mesh position={[0.8, 1.5, 6]}><sphereGeometry args={[0.8, 16, 16]} /><meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} /></mesh>
      <mesh position={[-0.8, 1.5, 6]}><sphereGeometry args={[0.8, 16, 16]} /><meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} /></mesh>
      <mesh position={[0.8, 1.8, 6.2]}><sphereGeometry args={[0.2, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={[-0.8, 1.8, 6.2]}><sphereGeometry args={[0.2, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={[0.8, 0, 7.5]} rotation={[0.3, 0, 0.3]}><cylinderGeometry args={[0.1, 0.1, 2, 8]} /><meshStandardMaterial color="#44ff44" /></mesh>
      <mesh position={[0.8, 0.3, 8.5]}><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color="#ff0088" /></mesh>
      <mesh position={[-0.8, 0, 7.5]} rotation={[-0.3, 0, -0.3]}><cylinderGeometry args={[0.1, 0.1, 2, 8]} /><meshStandardMaterial color="#44ff44" /></mesh>
      <mesh position={[-0.8, -0.3, 8.5]}><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color="#ff0088" /></mesh>
      <mesh position={[1.8, 0, 3]} rotation={[0, 0, 0.8]} castShadow><capsuleGeometry args={[0.3, 1.5, 4, 8]} /><meshStandardMaterial color="#44ff44" /></mesh>
      <mesh position={[-1.8, 0, 3]} rotation={[0, 0, -0.8]} castShadow><capsuleGeometry args={[0.3, 1.5, 4, 8]} /><meshStandardMaterial color="#44ff44" /></mesh>
      <mesh position={[0.6, 0, 0.5]} castShadow><capsuleGeometry args={[0.4, 1, 4, 8]} /><meshStandardMaterial color="#44ff44" /></mesh>
      <mesh position={[-0.6, 0, 0.5]} castShadow><capsuleGeometry args={[0.4, 1, 4, 8]} /><meshStandardMaterial color="#44ff44" /></mesh>
      <group position={[2.5, 0.5, 3.5]} rotation={[0, 0, 0.5]}>
        <mesh><boxGeometry args={[1.5, 0.4, 0.4]} /><meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0.9, 0, 0]}><coneGeometry args={[0.3, 0.6, 8]} /><meshBasicMaterial color="#ff0000" /></mesh>
      </group>
    </group>
  );
}

/** Toolbar toggle for the invasion */
function Toolbar() {
  const [active, setActive] = useAtom(ufoInvasionActiveAtom);
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={() => setActive((v) => !v)}
      title={active ? "End the invasion" : "Begin the invasion"}
      className={active ? "bg-green-600 hover:bg-green-700" : ""}
    >
      <Rocket className="h-4 w-4 mr-1.5" />
      {active ? "🛸 INVASION!" : "UFO Invasion"}
    </Button>
  );
}

/** 3D scene component — renders the entire invasion */
function Scene3d({ framing }) {
  const [active] = useAtom(ufoInvasionActiveAtom);
  const centerX = framing.center[0];
  const centerY = framing.center[1];

  const ufos = useMemo(() => [
    { position: [centerX - 30, centerY + 20, 80], scale: 1, speed: 1, beamActive: true },
    { position: [centerX + 40, centerY - 30, 70], scale: 0.8, speed: 1.2, beamActive: true },
    { position: [centerX + 10, centerY + 50, 90], scale: 0.6, speed: 0.9, beamActive: false },
    { position: [centerX - 50, centerY - 40, 60], scale: 0.7, speed: 1.1, beamActive: true },
  ], [centerX, centerY]);

  const cows = useMemo(() => [
    { startPosition: [centerX - 30, centerY + 20, 5], targetZ: 60, speed: 0.8, rotationSpeed: 1.5 },
    { startPosition: [centerX + 40, centerY - 30, 5], targetZ: 50, speed: 1, rotationSpeed: 2 },
    { startPosition: [centerX - 50, centerY - 40, 5], targetZ: 45, speed: 0.7, rotationSpeed: 1.8 },
  ], [centerX, centerY]);

  const aliens = useMemo(() => [
    { position: [centerX + 20, centerY + 10, 0], speed: 0.8 },
    { position: [centerX - 20, centerY - 15, 0], speed: 1.2 },
    { position: [centerX + 5, centerY - 35, 0], speed: 1 },
  ], [centerX, centerY]);

  if (!active) return null;

  return (
    <group>
      <Mothership position={[centerX, centerY, 200]} />
      {ufos.map((ufo, i) => <UFO key={i} {...ufo} />)}
      {cows.map((cow, i) => <AbductedCow key={i} {...cow} />)}
      {aliens.map((alien, i) => <AlienScout key={i} {...alien} />)}
      <ambientLight intensity={0.3} color="#00ff44" />
    </group>
  );
}

export const ufoInvasionBrick = {
  id: "ufo-invasion-MW",
  label: "UFO Invasion",
  hint: "Aliens have arrived at Navy Yard Commons!",
  order: 90,
  Toolbar,
  Scene3d,
};
