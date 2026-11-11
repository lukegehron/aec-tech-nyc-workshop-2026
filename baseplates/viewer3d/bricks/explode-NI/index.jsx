"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useFrame, useStore } from "@react-three/fiber";
import * as THREE from "three";
import { Expand } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { explodeAmountAtom } from "./atoms";

/**
 * EXPLODE — a slider that blows every shape apart from its own origin.
 *
 * The baseplate owns the boxes (`Scene.jsx` renders whatever the active mode
 * returns), so this brick doesn't change them in the data. Its `Scene3d` half
 * walks the three.js scene each frame and, for every box mesh, builds its six
 * faces as separate panels. Each panel slides out along its own face normal
 * from THAT box's centre — so shapes stay where they are in the model and each
 * one opens up like a flattened carton, instead of everything flying away from
 * the middle of the site. Every view mode and level filter works the same, and
 * none of them know this brick exists.
 *
 * Pushed all the way to the end, the panels go transparent and each face is
 * drawn with a solid outline.
 *
 * The original box mesh is kept (hidden, not removed) so hovering and clicking
 * still pick the shape. Only `BoxGeometry` meshes are exploded: the ground
 * plate is a plane and imported .3dm geometry is something else.
 */

const TRAVEL = 0.9; // full-explosion travel, as a multiple of the box's longest side
const FULL = 0.999; // the slider's last notch counts as "all the way"
const GHOST_OPACITY = 0.08;

// Six faces of a box, in the box's own frame. `plane` says which box sizes
// (x = width, y = depth, z = height) the panel spans; rotation turns the
// plane's +Z normal onto `normal`.
const FACES = [
  { normal: [1, 0, 0], rot: [0, Math.PI / 2, 0], plane: ["z", "y"] },
  { normal: [-1, 0, 0], rot: [0, -Math.PI / 2, 0], plane: ["z", "y"] },
  { normal: [0, 1, 0], rot: [-Math.PI / 2, 0, 0], plane: ["x", "z"] },
  { normal: [0, -1, 0], rot: [Math.PI / 2, 0, 0], plane: ["x", "z"] },
  { normal: [0, 0, 1], rot: [0, 0, 0], plane: ["x", "y"] },
  { normal: [0, 0, -1], rot: [Math.PI, 0, 0], plane: ["x", "y"] },
];

const boxMeshes = (scene) => {
  const found = [];
  scene.traverse((obj) => {
    if (obj.isMesh && obj.geometry?.type === "BoxGeometry") found.push(obj);
  });
  return found;
};

/** Build the six panels (and their outlines) for one box mesh. */
function buildPanels(mesh) {
  const { width, height, depth } = mesh.geometry.parameters;
  const size = { x: width, y: height, z: depth };
  const material = mesh.material.clone();
  material.side = THREE.DoubleSide;
  const group = new THREE.Group();
  const panels = FACES.map((face) => {
    const geometry = new THREE.PlaneGeometry(size[face.plane[0]], size[face.plane[1]]);
    const panel = new THREE.Mesh(geometry, material);
    panel.rotation.set(...face.rot);
    panel.castShadow = true;
    // Panels are decoration: hover/click goes to the hidden original box.
    panel.raycast = () => null;
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial(),
    );
    outline.raycast = () => null;
    panel.add(outline);
    group.add(panel);
    const half = [width, height, depth].map((n) => n / 2);
    const rest = new THREE.Vector3(...face.normal).multiply(new THREE.Vector3(...half));
    return { panel, outline, rest, normal: new THREE.Vector3(...face.normal) };
  });
  mesh.add(group);
  return {
    group,
    panels,
    material,
    reach: Math.max(width, height, depth) * TRAVEL,
    source: mesh.geometry,
  };
}

function disposePanels(mesh, ex) {
  if (!ex.build) return;
  mesh.remove(ex.build.group);
  for (const { panel, outline } of ex.build.panels) {
    panel.geometry.dispose();
    outline.geometry.dispose();
    outline.material.dispose();
  }
  ex.build.material.dispose();
  ex.build = null;
}

/** Show or hide the original box surface without losing its hover/click. */
function setBoxVisible(mesh, visible) {
  mesh.material.visible = visible;
}

function ExplodeScene({ palette }) {
  const store = useStore();
  const amount = useAtomValue(explodeAmountAtom);

  // Put every box back together when the brick leaves.
  useEffect(() => {
    const { scene, invalidate } = store.getState();
    return () => {
      for (const mesh of boxMeshes(scene)) {
        const ex = mesh.userData.explode;
        if (!ex) continue;
        disposePanels(mesh, ex);
        setBoxVisible(mesh, true);
        delete mesh.userData.explode;
      }
      invalidate();
    };
  }, [store]);

  useFrame(({ scene }) => {
    const full = amount >= FULL;

    for (const mesh of boxMeshes(scene)) {
      const ex = (mesh.userData.explode ??= { build: null });

      // Rebuild if the mesh was handed a different geometry (mode switch).
      if (ex.build && ex.build.source !== mesh.geometry) disposePanels(mesh, ex);

      if (amount <= 0) {
        if (ex.build) ex.build.group.visible = false;
        setBoxVisible(mesh, true);
        continue;
      }

      ex.build ??= buildPanels(mesh);
      const { group, panels, material, reach } = ex.build;
      group.visible = true;
      setBoxVisible(mesh, false);

      // Follow the box's hover tint, then ghost the surfaces at full.
      material.color.copy(mesh.material.color);
      material.transparent = full || mesh.material.transparent;
      material.opacity = full ? GHOST_OPACITY : mesh.material.opacity;
      material.depthWrite = !full;

      for (const { panel, outline, rest, normal } of panels) {
        // Each face leaves from the centre of ITS OWN box, along its normal.
        panel.position.copy(rest).addScaledVector(normal, reach * amount);
        outline.visible = full;
        outline.material.color.set(palette.accent);
      }
    }
  });

  return null;
}

function ExplodeToolbar() {
  const [amount, setAmount] = useAtom(explodeAmountAtom);
  const full = amount >= FULL;

  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <Expand className="size-3.5 text-muted-foreground" />
      <span className="text-xs">Explode</span>
      <Slider
        className="w-32"
        min={0}
        max={1}
        step={0.01}
        value={[amount]}
        onValueChange={(value) =>
          setAmount(Array.isArray(value) ? value[0] : value)
        }
        aria-label="Explode the model"
      />
      <span className="w-14 font-mono text-xs tabular-nums text-muted-foreground">
        {full ? "outline" : `${Math.round(amount * 100)}%`}
      </span>
    </div>
  );
}

export const explodeNI = {
  id: "explode-NI",
  label: "Explode",
  hint: "Slide to open every shape out from its own centre — all the way turns surfaces transparent with solid outlines",
  order: 95,
  Toolbar: ExplodeToolbar,
  Scene3d: ExplodeScene,
};
