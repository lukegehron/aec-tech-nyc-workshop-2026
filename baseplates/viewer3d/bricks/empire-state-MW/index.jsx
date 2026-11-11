"use client";

/**
 * Empire State Building brick — adds an iconic NYC landmark to the 3D scene.
 *
 * This is a TOOL brick (not a view mode): it renders its own geometry inside the
 * Canvas via Scene3d and provides a toggle in the Toolbar. It doesn't replace the
 * active view mode — it layers on top.
 *
 * The building is placed offset from the main project site so it doesn't overlap
 * with the Navy Yard Commons buildings but is still visible in the scene.
 */

import { useState } from "react";
import { atom, useAtom } from "jotai";
import * as THREE from "three";
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

      {/* Label pole — a thin line from the top to help identify the building */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, EMPIRE_STATE.totalHeight, 0, 0, EMPIRE_STATE.totalHeight + 20])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={palette.accent} linewidth={2} />
      </line>
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
