import * as THREE from "three";

/**
 * Entourage for the LTL sketch: flat figures drawn as a pale wash with an ink
 * outline, standing on the ground plane (z = 0, Z-up) and turned to face the
 * camera about the vertical axis only.
 *
 * "Balanced with the scene" means the crowd is sized and placed from what is
 * actually drawn: the count follows the footprint perimeter of the buildings
 * (more frontage, more people), figures never stand inside a footprint, and
 * they favour the ground close to buildings, thinning out with distance.
 * Placement is seeded from the footprints, so it is stable between frames and
 * only changes when the model does.
 */

const MIN_GAP = 1.2; // between unrelated people (m)
const CLEARANCE = 0.6; // from any building footprint (m)
const REACH = 14; // beyond this distance from a building, nobody is placed

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Silhouette in the figure's own plane: x across, y up, feet at y = 0.
// About 1.7 m tall, like the reference drawing's scale figure.
const BODY = [
  [-0.2, 1.45],
  [0.2, 1.45],
  [0.22, 0.9],
  [0.13, 0],
  [0.03, 0],
  [0, 0.75],
  [-0.03, 0],
  [-0.13, 0],
  [-0.22, 0.9],
];
const HEAD = { x: 0, y: 1.6, r: 0.11 };
const HEAD_SEGMENTS = 14;

function figureParts() {
  const bodyShape = new THREE.Shape(BODY.map(([x, y]) => new THREE.Vector2(x, y)));
  const fill = [
    new THREE.ShapeGeometry(bodyShape),
    new THREE.CircleGeometry(HEAD.r, HEAD_SEGMENTS).translate(HEAD.x, HEAD.y, 0),
  ];
  const ring = [];
  for (let i = 0; i < BODY.length; i += 1) {
    const [x1, y1] = BODY[i];
    const [x2, y2] = BODY[(i + 1) % BODY.length];
    ring.push(x1, y1, 0, x2, y2, 0);
  }
  for (let i = 0; i < HEAD_SEGMENTS; i += 1) {
    const a1 = (i / HEAD_SEGMENTS) * Math.PI * 2;
    const a2 = ((i + 1) / HEAD_SEGMENTS) * Math.PI * 2;
    ring.push(
      HEAD.x + Math.cos(a1) * HEAD.r, HEAD.y + Math.sin(a1) * HEAD.r, 0,
      HEAD.x + Math.cos(a2) * HEAD.r, HEAD.y + Math.sin(a2) * HEAD.r, 0,
    );
  }
  const ink = new THREE.BufferGeometry();
  ink.setAttribute("position", new THREE.Float32BufferAttribute(ring, 3));
  // Stand the drawing up: its y becomes the scene's Z (up), x stays x.
  for (const g of [...fill, ink]) g.rotateX(Math.PI / 2);
  return { fill, ink };
}

/** Footprints (deduped) of every box mesh currently in the scene. */
export function footprintsOf(scene) {
  const seen = new Map();
  scene.traverse((obj) => {
    if (!obj.isMesh || obj.geometry?.type !== "BoxGeometry") return;
    const { width, height } = obj.geometry.parameters;
    const f = { cx: obj.position.x, cy: obj.position.y, hw: width / 2, hd: height / 2 };
    seen.set([f.cx, f.cy, f.hw, f.hd].map((n) => n.toFixed(1)).join("|"), f);
  });
  return [...seen.entries()];
}

function distanceTo(rects, x, y) {
  let best = Infinity;
  for (const r of rects) {
    const dx = Math.max(Math.abs(x - r.cx) - r.hw, 0);
    const dy = Math.max(Math.abs(y - r.cy) - r.hd, 0);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/** Decide where people stand. Returns [{ x, y, scale, tint }]. */
export function placePeople(entries, bounds) {
  const rects = entries.map(([, r]) => r);
  const rand = rng(hash(entries.map(([k]) => k).join(";")));
  const perimeter = rects.reduce((sum, r) => sum + 4 * (r.hw + r.hd), 0);
  const area = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  const count = rects.length
    ? Math.min(Math.max(Math.round(perimeter / 10), 8), 48)
    : Math.min(Math.max(Math.round(area / 900), 6), 24);

  const people = [];
  const free = (x, y, gap) =>
    (!rects.length || distanceTo(rects, x, y) >= CLEARANCE) &&
    people.every((p) => Math.hypot(p.x - x, p.y - y) >= gap);

  for (let tries = 0; people.length < count && tries < count * 60; tries += 1) {
    const x = bounds.minX + rand() * (bounds.maxX - bounds.minX);
    const y = bounds.minY + rand() * (bounds.maxY - bounds.minY);
    if (rects.length) {
      const d = distanceTo(rects, x, y);
      if (d > REACH || rand() > 1 - d / (REACH + 2)) continue;
    }
    if (!free(x, y, MIN_GAP)) continue;
    const person = { x, y, scale: 0.92 + rand() * 0.16, tint: Math.floor(rand() * 3) };
    people.push(person);
    // Walking in pairs reads more natural than evenly scattered figures.
    if (rand() < 0.35) {
      const a = rand() * Math.PI * 2;
      const nx = x + Math.cos(a) * 0.8;
      const ny = y + Math.sin(a) * 0.8;
      if (free(nx, ny, 0.6)) {
        people.push({ x: nx, y: ny, scale: 0.9 + rand() * 0.16, tint: (person.tint + 1) % 3 });
      }
    }
  }
  return people;
}

/** Build the group of figures. Call `group.userData.dispose()` when done. */
export function buildPeople(people, palette, paperColor, inkColor) {
  const group = new THREE.Group();
  const { fill, ink } = figureParts();
  const tints = [palette.accentSoft, palette.accent, palette.gridSection].map(
    (c) => new THREE.Color(c).lerp(paperColor, 0.35),
  );
  const fillMats = tints.map(
    (color) =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
  );
  const inkMat = new THREE.LineBasicMaterial({ color: inkColor });

  for (const p of people) {
    const figure = new THREE.Group();
    figure.position.set(p.x, p.y, 0); // always on the ground plane
    figure.scale.setScalar(p.scale);
    for (const geometry of fill) {
      const mesh = new THREE.Mesh(geometry, fillMats[p.tint]);
      mesh.raycast = () => null;
      figure.add(mesh);
    }
    const lines = new THREE.LineSegments(ink, inkMat);
    lines.raycast = () => null;
    figure.add(lines);
    group.add(figure);
  }
  group.userData.dispose = () => {
    [...fill, ink].forEach((g) => g.dispose());
    [...fillMats, inkMat].forEach((m) => m.dispose());
  };
  return group;
}

/** Turn each figure to face the camera, about the vertical axis only. */
export function faceCamera(group, camera) {
  for (const figure of group.children) {
    const dx = camera.position.x - figure.position.x;
    const dy = camera.position.y - figure.position.y;
    figure.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
  }
}

