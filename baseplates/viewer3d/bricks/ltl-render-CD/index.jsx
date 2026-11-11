"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useFrame, useStore } from "@react-three/fiber";
import * as THREE from "three";
import { Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ltlPeopleAtom, ltlRenderActiveAtom } from "./atoms";
import { buildPeople, faceCamera, footprintsOf, placePeople } from "./people";

/**
 * LTL SKETCH — restyle whatever is in the scene as a loose ink-and-wash
 * architectural drawing, in the manner of LTL Architects' renderings:
 * translucent colour washes, doubled hand-jittered ink edges that overshoot at
 * the corners, and a paper-white background.
 *
 * It works on the scene the active view mode already built, so it needs no
 * list of modes and no edit to the baseplate. Box meshes are found by walking
 * the scene each frame (view modes remount boxes when you switch); each gets
 * a thinned material and an ink line set parented to it. Switching off (or
 * unmounting) restores every material and the background.
 *
 * Nothing here loads anything, so nothing can suspend inside <Canvas>.
 */

const WASH = 0.45; // opacity of a normal box
const WASH_DIMMED = 0.06; // opacity of a box the baseplate dimmed (0.12)
const OVERSHOOT = 0.05; // how far a stroke runs past its corner (fraction)
const JITTER = 0.012; // wobble as a fraction of stroke length (min 0.05 m)

// Deterministic pseudo-random so linework doesn't change between renders.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296 - 0.5;
  };
}

// Two overlapping, slightly wrong strokes per edge — the hand-drawn look.
function sketchEdges(geometry) {
  const edges = new THREE.EdgesGeometry(geometry);
  const src = edges.attributes.position;
  const rand = rng(src.count * 7919 + 13);
  const out = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const dir = new THREE.Vector3();
  for (let i = 0; i < src.count; i += 2) {
    a.fromBufferAttribute(src, i);
    b.fromBufferAttribute(src, i + 1);
    const len = a.distanceTo(b);
    dir.subVectors(b, a).normalize();
    const wobble = Math.max(len * JITTER, 0.05);
    for (let pass = 0; pass < 2; pass += 1) {
      const over = len * OVERSHOOT * (0.4 + (rand() + 0.5));
      const start = a.clone().addScaledVector(dir, -over * (pass ? 0.6 : 1));
      const end = b.clone().addScaledVector(dir, over * (pass ? 1 : 0.6));
      for (const p of [start, end]) {
        out.push(
          p.x + rand() * wobble,
          p.y + rand() * wobble,
          p.z + rand() * wobble,
        );
      }
    }
  }
  edges.dispose();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  return geo;
}

function isBox(obj) {
  return (
    obj.isMesh &&
    obj.geometry?.type === "BoxGeometry" &&
    obj.material?.isMeshStandardMaterial
  );
}

function style(mesh, paper, ink) {
  const mat = mesh.material;
  if (!mesh.userData.ltlOriginal) {
    mesh.userData.ltlOriginal = {
      transparent: mat.transparent,
      depthWrite: mat.depthWrite,
      side: mat.side,
      color: mat.color.clone(),
    };
    // Soften the colour toward the paper once.
    mat.color.lerp(paper, 0.35);
    mat.depthWrite = false;
    mat.side = THREE.DoubleSide;
    mat.needsUpdate = true;

    const lines = new THREE.LineSegments(
      sketchEdges(mesh.geometry),
      new THREE.LineBasicMaterial({ color: ink }),
    );
    lines.raycast = () => null; // ink is not geometry; let picks pass through
    mesh.add(lines);
    mesh.userData.ltlLines = lines;
  }
  // r3f drives opacity from `box.dimmed` (0.12 or 1); thin both.
  mat.transparent = true;
  if (mat.opacity === 1) mat.opacity = WASH;
  else if (mat.opacity === 0.12) mat.opacity = WASH_DIMMED;
}

function restore(mesh) {
  const orig = mesh.userData.ltlOriginal;
  if (!orig) return;
  const mat = mesh.material;
  mat.color.copy(orig.color);
  mat.transparent = orig.transparent;
  mat.depthWrite = orig.depthWrite;
  mat.side = orig.side;
  if (mat.opacity === WASH) mat.opacity = 1;
  else if (mat.opacity === WASH_DIMMED) mat.opacity = 0.12;
  mat.needsUpdate = true;
  const lines = mesh.userData.ltlLines;
  if (lines) {
    mesh.remove(lines);
    lines.geometry.dispose();
    lines.material.dispose();
  }
  delete mesh.userData.ltlOriginal;
  delete mesh.userData.ltlLines;
}

function disposeCrowd(crowd) {
  if (!crowd.group) return;
  crowd.group.parent?.remove(crowd.group);
  crowd.group.userData.dispose?.();
  crowd.group = null;
  crowd.key = null;
}

function LtlRenderScene({ palette, data }) {
  const store = useStore();
  const active = useAtomValue(ltlRenderActiveAtom);
  const people = useAtomValue(ltlPeopleAtom);
  const crowd = useRef({ group: null, key: null });

  // Paper and ink follow the theme via the palette, so this brick never reads
  // `resolvedTheme`.
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(palette.ground).getHSL(hsl);
  const dark = hsl.l < 0.5;
  const paperHex = dark ? "#1d1c1a" : "#fbfaf6";
  const inkHex = dark ? "#e8e4da" : "#1c1b19";
  const paper = new THREE.Color(paperHex);
  const ink = new THREE.Color(inkHex);
  const outline = data.site.outline;

  useFrame(({ scene, camera }) => {
    if (!active) return;
    scene.traverse((obj) => {
      if (isBox(obj)) style(obj, paper, ink);
    });

    const state = crowd.current;
    if (!people) {
      disposeCrowd(state);
      return;
    }
    // Rebuild only when what is drawn changes (mode, floor, building).
    const entries = footprintsOf(scene);
    const key = entries.map(([k]) => k).join(";") + paperHex;
    if (key !== state.key) {
      disposeCrowd(state);
      const xs = outline.map((p) => p[0]);
      const ys = outline.map((p) => p[1]);
      const bounds = {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
      state.group = buildPeople(placePeople(entries, bounds), palette, paper, ink);
      state.key = key;
      scene.add(state.group);
    }
    faceCamera(state.group, camera);
  });

  useEffect(() => {
    if (!active) return undefined;
    const { scene, invalidate } = store.getState();
    const previous = scene.background;
    scene.background = new THREE.Color(paperHex);
    const state = crowd.current;
    invalidate();
    return () => {
      scene.background = previous;
      disposeCrowd(state);
      scene.traverse((obj) => {
        if (obj.userData?.ltlOriginal) restore(obj);
      });
      invalidate();
    };
  }, [store, active, paperHex]);

  return null;
}

function LtlRenderToolbar() {
  const [active, setActive] = useAtom(ltlRenderActiveAtom);
  const [people, setPeople] = useAtom(ltlPeopleAtom);
  return (
    <div className="flex items-center gap-2 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => setActive(!active)}
        aria-pressed={active}
        title="Render the scene as an LTL-style ink and wash sketch"
      >
        <Pencil className="size-3.5" />
        LTL Sketch
      </Button>
      {active ? (
        <Button
          size="sm"
          variant={people ? "secondary" : "ghost"}
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => setPeople(!people)}
          aria-pressed={people}
          title="Scatter scale figures on the ground plane, sized to the scene"
        >
          <Users className="size-3.5" />
          People
        </Button>
      ) : null}
    </div>
  );
}

export const ltlRenderBrick = {
  id: "ltl-render-CD",
  label: "LTL Sketch",
  hint: "Render the scene as an LTL-style ink and wash sketch",
  order: 60,
  Toolbar: LtlRenderToolbar,
  Scene3d: LtlRenderScene,
};

