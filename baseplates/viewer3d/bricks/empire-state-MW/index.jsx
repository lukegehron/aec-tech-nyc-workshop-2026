"use client";

/**
 * Empire State Building brick — adds an iconic NYC landmark to the 3D scene,
 * complete with Godzilla climbing the side!
 *
 * This is a TOOL brick (not a view mode): it renders its own geometry inside the
 * Canvas via Scene3d and provides a toggle in the Toolbar. It doesn't replace the
 * active view mode — it layers on top.
 *
 * The building is placed offset from the main project site so it doesn't overlap
 * with the Navy Yard Commons buildings but is still visible in the scene.
 */

import { useState, useRef } from "react";
import { atom, useAtom } from "jotai";
import { useFrame } from "@react-three/fiber";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

// Local atom for toggling visibility — lives in this brick, not the baseplate.
const empireStateVisibleAtom = atom(true);

/**
 * The Empire State Building's approximate dimensions (in metres):
 * - Total height to roof: 381m
 * - Total height with antenna: 443m
 * - Base footprint: ~57m x 129m (we'll simplify to stepped massing)
 *
 * The building has a distinctive Art Deco stepped profile. We'll represent it
 * with a series of stacked boxes that capture the iconic silhouette.
 */
const EMPIRE_STATE = {
  // Position offset from project site (placed to the side so it doesn't overlap)
  offset: [120, 0, 0], // 120m east of the site origin

  // Stepped massing from base to spire (each step: [width, depth, height, baseZ])
  steps: [
    // Main base (floors 1-5)
    { width: 57, depth: 129, height: 21, baseZ: 0 },
    // Lower tower setback (floors 6-25)
    { width: 50, depth: 100, height: 80, baseZ: 21 },
    // Middle tower (floors 26-60)
    { width: 42, depth: 80, height: 140, baseZ: 101 },
    // Upper tower (floors 61-85)
    { width: 30, depth: 50, height: 100, baseZ: 241 },
    // Crown section (floors 86-102)
    { width: 18, depth: 30, height: 40, baseZ: 341 },
    // Spire/antenna base
    { width: 8, depth: 8, height: 62, baseZ: 381 },
  ],

  totalHeight: 443,
};

/**
 * Fire! Animated flames engulfing the building.
 */
function Fire({ buildingSteps }) {
  const flamesRef = useRef();
  
  useFrame((state) => {
    if (flamesRef.current) {
      // Animate each flame child
      flamesRef.current.children.forEach((flame, i) => {
        const t = state.clock.elapsedTime;
        // Flickering scale
        flame.scale.y = 1 + Math.sin(t * 8 + i * 2) * 0.3;
        flame.scale.x = 1 + Math.sin(t * 6 + i * 3) * 0.2;
        // Slight position wobble
        flame.position.x += Math.sin(t * 10 + i) * 0.05;
      });
    }
  });

  // Generate flames at various points on the building
  const flames = [];
  buildingSteps.forEach((step, stepIdx) => {
    // More flames on middle sections
    const flameCount = stepIdx < 4 ? 8 : 3;
    for (let i = 0; i < flameCount; i++) {
      const angle = (i / flameCount) * Math.PI * 2;
      const radius = Math.min(step.width, step.depth) * 0.4;
      flames.push({
        key: `flame-${stepIdx}-${i}`,
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          step.baseZ + step.height * 0.5 + Math.random() * step.height * 0.3,
        ],
        scale: [4 + Math.random() * 4, 8 + Math.random() * 12, 4 + Math.random() * 4],
        color: Math.random() > 0.3 ? "#ff4400" : "#ffaa00",
      });
    }
  });

  return (
    <group ref={flamesRef}>
      {flames.map((flame) => (
        <mesh key={flame.key} position={flame.position} scale={flame.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={flame.color}
            emissive={flame.color}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      {/* Big central fire column */}
      <mesh position={[0, 0, 200]}>
        <cylinderGeometry args={[5, 15, 80, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0, 260]}>
        <cylinderGeometry args={[3, 10, 60, 8]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

/**
 * Smoke rising from the building
 */
function Smoke() {
  const smokeRef = useRef();
  
  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.children.forEach((puff, i) => {
        // Rise upward
        puff.position.z += 0.3;
        // Expand as it rises
        puff.scale.x += 0.01;
        puff.scale.y += 0.01;
        // Fade out
        if (puff.material) puff.material.opacity = Math.max(0, puff.material.opacity - 0.002);
        // Reset when too high or faded
        if (puff.position.z > 600 || puff.material.opacity <= 0) {
          puff.position.z = 200 + Math.random() * 150;
          puff.position.x = (Math.random() - 0.5) * 40;
          puff.position.y = (Math.random() - 0.5) * 40;
          puff.scale.set(1, 1, 1);
          if (puff.material) puff.material.opacity = 0.4;
        }
      });
    }
  });

  const smokePuffs = Array.from({ length: 20 }, (_, i) => ({
    key: `smoke-${i}`,
    position: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 200 + Math.random() * 200],
    scale: 5 + Math.random() * 10,
  }));

  return (
    <group ref={smokeRef}>
      {smokePuffs.map((puff) => (
        <mesh key={puff.key} position={puff.position} scale={puff.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#333333" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Godzilla! The King of the Monsters climbing the Empire State Building.
 * Built from simple box geometry to create a recognizable silhouette.
 */
function Godzilla({ buildingWidth }) {
  const groupRef = useRef();
  
  // Animate Godzilla - subtle breathing/movement
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
      groupRef.current.scale.x = breathe;
    }
  });

  const godzillaColor = "#2d4a3e";
  const bellyColor = "#4a5a4a";
  const spineColor = "#1a2f25";
  const climbHeight = 280;
  const sideOffset = buildingWidth / 2 + 15;

  return (
    <group ref={groupRef} position={[sideOffset, 0, climbHeight]} rotation={[0, 0, 0.1]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[25, 20, 50]} />
        <meshStandardMaterial color={godzillaColor} roughness={0.8} />
      </mesh>
      <mesh position={[-8, 0, -5]} castShadow>
        <boxGeometry args={[10, 16, 40]} />
        <meshStandardMaterial color={bellyColor} roughness={0.8} />
      </mesh>

      {/* Head & snout */}
      <mesh position={[5, 0, 35]} castShadow>
        <boxGeometry args={[20, 15, 18]} />
        <meshStandardMaterial color={godzillaColor} roughness={0.8} />
      </mesh>
      <mesh position={[15, 0, 33]} castShadow>
        <boxGeometry args={[12, 10, 10]} />
        <meshStandardMaterial color={godzillaColor} roughness={0.8} />
      </mesh>

      {/* Glowing eyes */}
      <mesh position={[12, 5, 38]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff6600" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[12, -5, 38]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff6600" emissiveIntensity={0.5} />
      </mesh>

      {/* Dorsal spines */}
      {[0, 12, 24, 36, 48].map((zOff, i) => (
        <mesh key={`spine-${i}`} position={[12, 0, 10 - zOff * 0.8]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[3, 2, 15 - i * 2]} />
          <meshStandardMaterial color={spineColor} roughness={0.7} />
        </mesh>
      ))}

      {/* Arms reaching for building */}
      <group position={[-10, 10, 20]} rotation={[0.5, 0, 0.8]}>
        <mesh castShadow><boxGeometry args={[8, 8, 20]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[-8, 5, 15]} rotation={[0.3, 0, 0.5]} castShadow><boxGeometry args={[6, 6, 15]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[-15, 8, 22]} castShadow><boxGeometry args={[8, 4, 4]} /><meshStandardMaterial color={spineColor} roughness={0.6} /></mesh>
      </group>
      <group position={[-10, -10, 15]} rotation={[-0.3, 0, 0.6]}>
        <mesh castShadow><boxGeometry args={[8, 8, 18]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[-6, -5, 12]} rotation={[-0.2, 0, 0.4]} castShadow><boxGeometry args={[6, 6, 14]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
      </group>

      {/* Legs */}
      <group position={[5, 12, -30]} rotation={[0.4, 0, 0]}>
        <mesh castShadow><boxGeometry args={[12, 12, 25]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[0, 5, -18]} castShadow><boxGeometry args={[10, 10, 15]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[5, 5, -28]} castShadow><boxGeometry args={[15, 12, 6]} /><meshStandardMaterial color={spineColor} roughness={0.7} /></mesh>
      </group>
      <group position={[5, -12, -35]} rotation={[-0.2, 0, 0]}>
        <mesh castShadow><boxGeometry args={[12, 12, 25]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[0, -5, -18]} castShadow><boxGeometry args={[10, 10, 15]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
      </group>

      {/* Tail curving down */}
      <group position={[10, 0, -35]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -0.2]} castShadow><boxGeometry args={[15, 12, 30]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[15, 0, -20]} rotation={[0, 0, -0.4]} castShadow><boxGeometry args={[12, 10, 25]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[30, 0, -38]} rotation={[0, 0, -0.6]} castShadow><boxGeometry args={[10, 8, 20]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
        <mesh position={[42, 0, -52]} rotation={[0, 0, -0.8]} castShadow><boxGeometry args={[8, 6, 15]} /><meshStandardMaterial color={godzillaColor} roughness={0.8} /></mesh>
      </group>
    </group>
  );
}

/**
 * Toolbar toggle — shows/hides the Empire State Building.
 */
function Toolbar() {
  const [visible, setVisible] = useAtom(empireStateVisibleAtom);

  return (
    <Button
      size="sm"
      variant={visible ? "default" : "outline"}
      onClick={() => setVisible((v) => !v)}
      title={visible ? "Hide Empire State Building" : "Show Empire State Building"}
    >
      <Building2 className="h-4 w-4 mr-1.5" />
      Empire State
    </Button>
  );
}

/**
 * 3D scene component — renders the Empire State Building geometry.
 * This is rendered INSIDE the Canvas, so it returns r3f elements.
 */
function Scene3d({ palette, framing }) {
  const [visible] = useAtom(empireStateVisibleAtom);
  const [hovered, setHovered] = useState(null);

  if (!visible) return null;

  const [offsetX, offsetY, offsetZ] = EMPIRE_STATE.offset;

  // Art Deco bronze/limestone color scheme
  const baseColor = "#c9b896"; // Limestone
  const accentColor = "#8b7355"; // Bronze accent
  const hoverColor = palette.boxHover;

  return (
    <group position={[offsetX, offsetY, offsetZ]}>
      {EMPIRE_STATE.steps.map((step, i) => {
        const isSpire = i === EMPIRE_STATE.steps.length - 1;
        const isHovered = hovered === i;
        const color = isSpire ? accentColor : baseColor;

        return (
          <mesh
            key={i}
            position={[0, 0, step.baseZ + step.height / 2]}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(null);
            }}
          >
            <boxGeometry args={[step.width, step.depth, step.height]} />
            <meshStandardMaterial
              color={isHovered ? hoverColor : color}
              roughness={0.6}
              metalness={isSpire ? 0.3 : 0.1}
            />
          </mesh>
        );
      })}

      {/* Fire engulfing the building! */}
      <Fire buildingSteps={EMPIRE_STATE.steps} />
      <Smoke />

      {/* Godzilla climbing the building! */}
      <Godzilla palette={palette} buildingWidth={EMPIRE_STATE.steps[2].width} />
    </group>
  );
}

export const empireStateBrick = {
  id: "empire-state-MW",
  label: "Empire State",
  hint: "Toggle the Empire State Building landmark",
  order: 80,

  // This is a tool, not a view mode — no buildBoxes, just Toolbar + Scene3d
  Toolbar,
  Scene3d,
};
