import * as THREE from "three";

// Pure geometry for the curtain wall brick — no React, no r3f.
// Z-up throughout (see `../../geometry.js`).

export const DRAG_SLOP = 4; // px — more than this between down and up was an orbit
export const VERTICAL_TOLERANCE = 0.2; // |normal.z| below this counts as a wall face
export const FACE_OFFSET = 0.06; // m — glass sits this far proud of the face
export const MULLION_DEPTH = 0.18; // m — how far mullions stand out from the glass

/** Spread onto every mesh this brick draws so it can't be picked itself. */
export const noRaycast = () => null;

/**
 * Ray from the pointer into the scene → a candidate wall, or null.
 *
 * Returns `{ id, center: [x, y, zBase], normal: [nx, ny], width, height }`:
 * `center` lies on the face at mid-width, at the object's base elevation.
 */
export function pickFace(event, { gl, camera, scene, raycaster }) {
  const rect = gl.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);

  const hit = raycaster
    .intersectObjects(scene.children, true)
    .find((h) => h.object.isMesh && h.face);
  if (!hit) return null;

  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  if (Math.abs(normal.z) > VERTICAL_TOLERANCE) return null; // roof or ground

  // Horizontal outward normal, and the tangent running along the face.
  const n = new THREE.Vector2(normal.x, normal.y).normalize();
  const t = new THREE.Vector2(n.y, -n.x);

  // Project the object's bounds onto the face frame. Exact for the
  // axis-aligned boxes this scene is built from; approximate for imports.
  const { min, max } = new THREE.Box3().setFromObject(hit.object);
  let tMin = Infinity;
  let tMax = -Infinity;
  for (const x of [min.x, max.x]) {
    for (const y of [min.y, max.y]) {
      const along = x * t.x + y * t.y;
      tMin = Math.min(tMin, along);
      tMax = Math.max(tMax, along);
    }
  }

  const width = tMax - tMin;
  const height = max.z - min.z;
  if (width < 0.5 || height < 0.5) return null;

  // The face plane passes through the hit point.
  const out = hit.point.x * n.x + hit.point.y * n.y;
  const mid = (tMin + tMax) / 2;
  const cx = t.x * mid + n.x * out;
  const cy = t.y * mid + n.y * out;

  return {
    // Same face, same id — placing twice replaces instead of stacking.
    id: [cx, cy, min.z, n.x, n.y].map((v) => v.toFixed(2)).join(":"),
    center: [cx, cy, min.z],
    normal: [n.x, n.y],
    width,
    height,
  };
}

/**
 * Bay layout for one wall. Spacing is a TARGET: counts are rounded so the grid
 * closes exactly on both corners and on the top and bottom.
 */
export function gridFor(wall, params) {
  const bays = Math.max(1, Math.round(wall.width / params.mullionSpacing));
  const rows = Math.max(1, Math.round(wall.height / params.transomSpacing));
  return { bays, rows, bayWidth: wall.width / bays, rowHeight: wall.height / rows };
}

/** Rotation about Z that turns local +X into the face tangent and +Y outward. */
export function yawOf([nx, ny]) {
  return Math.atan2(-nx, ny);
}
