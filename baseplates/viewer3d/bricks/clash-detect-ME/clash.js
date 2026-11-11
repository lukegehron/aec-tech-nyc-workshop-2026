import * as THREE from "three";

/**
 * The clash test itself, kept out of the component so it is plain data in,
 * plain data out — and so the pair loop can be read without any r3f noise.
 *
 * Everything here works in WORLD space and metres. This scene is Z-up (see
 * `../../geometry.js`), so the third component of every vector is elevation.
 */

// Two solids that merely touch are not a clash — floor slabs are built with a
// deliberate SLAB_GAP and rooms with a PLAN_INSET, and a report that flags
// every neighbouring surface is a report nobody reads.
const TOUCH_EPSILON = 0.002;

// Above this many candidate solids the pair loop stops being interactive.
// Imported .3dm files can carry thousands of meshes, so the test bails with an
// honest message rather than locking the tab up.
export const MAX_CANDIDATES = 1200;

/**
 * An ELEMENT is the thing a clash is reported against. For a view-mode box
 * that's the mesh itself; for an imported model it's the whole imported group,
 * because "mesh 404 of the Rhino file hits mesh 405" is noise — they were
 * authored as one object.
 *
 * So: walk up to the highest ancestor that still sits under the scene root.
 */
function elementRootOf(object, sceneRoot) {
  let node = object;
  while (node.parent && node.parent !== sceneRoot) node = node.parent;
  return node;
}

function isClashable(object) {
  if (!object.isMesh) return false;
  if (!object.visible) return false;
  const geometry = object.geometry;
  if (!geometry) return false;
  // The site plate is a plane — infinitely thin and underneath everything, so
  // it would clash with the whole model and tell you nothing. The drei Grid is
  // a plane too. Skip flat sheets rather than naming specific objects.
  if (geometry.type === "PlaneGeometry") return false;
  return true;
}

/** Has anything between `object` and the root opted this subtree out? */
function optedOut(object, sceneRoot) {
  let node = object;
  while (node && node !== sceneRoot) {
    if (node.userData?.clashIgnore) return true;
    node = node.parent;
  }
  return false;
}

/**
 * Every solid in the live scene, as a world-space AABB.
 *
 * Reading the real scene — rather than rebuilding boxes from project.json — is
 * what makes this a *model* clash test: it sees whichever view mode is active
 * and it sees imported geometry, without either of them opting in.
 */
export function collectSolids(sceneRoot) {
  const solids = [];

  sceneRoot.traverse((object) => {
    if (!isClashable(object)) return;
    if (optedOut(object, sceneRoot)) return;

    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;

    const size = new THREE.Vector3();
    box.getSize(size);
    // Degenerate slivers produce meaningless overlaps.
    if (size.x < 1e-4 || size.y < 1e-4 || size.z < 1e-4) return;

    solids.push({ object, element: elementRootOf(object, sceneRoot), box });
  });

  return solids;
}

/** Per-axis overlap of two AABBs. Negative means a gap on that axis. */
function axisOverlap(a, b) {
  return [
    Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x),
    Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y),
    Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z),
  ];
}

/**
 * The pair loop, with a sweep over X so it isn't the full n².
 *
 * `mode` is "hard" (solids interpenetrate) or "clearance" (solids come within
 * `tolerance` metres). Clearance works by growing each box by half the
 * tolerance on every side before testing, which is the standard trick: two
 * boxes grown by t/2 overlap exactly when the originals are closer than t.
 */
export function findClashes(solids, { mode = "hard", tolerance = 0 } = {}) {
  const grow = mode === "clearance" ? Math.max(tolerance, 0) / 2 : 0;
  const pad = new THREE.Vector3(grow, grow, grow);

  const tested = solids
    .map((solid) => {
      const box = solid.box.clone();
      if (grow > 0) {
        box.min.sub(pad);
        box.max.add(pad);
      }
      return { ...solid, testBox: box };
    })
    .sort((a, b) => a.testBox.min.x - b.testBox.min.x);

  const clashes = [];

  for (let i = 0; i < tested.length; i += 1) {
    const a = tested[i];
    for (let j = i + 1; j < tested.length; j += 1) {
      const b = tested[j];
      // Sweep: once B starts beyond A's far edge, so does everything after it.
      if (b.testBox.min.x > a.testBox.max.x) break;
      // Two meshes of the same authored object are not a clash.
      if (a.element === b.element) continue;

      const padded = axisOverlap(a.testBox, b.testBox);
      if (padded.some((v) => v <= TOUCH_EPSILON)) continue;

      // Depth of the real interpenetration, not the padded one. In clearance
      // mode this goes negative — that negative IS the gap.
      const depth = Math.min(...axisOverlap(a.box, b.box));
      const hard = depth > TOUCH_EPSILON;
      if (mode === "hard" && !hard) continue;

      // The highlight marker is the padded intersection region, so a clearance
      // flag is still visible when the solids don't actually touch.
      const center = [
        (Math.max(a.testBox.min.x, b.testBox.min.x) +
          Math.min(a.testBox.max.x, b.testBox.max.x)) / 2,
        (Math.max(a.testBox.min.y, b.testBox.min.y) +
          Math.min(a.testBox.max.y, b.testBox.max.y)) / 2,
        (Math.max(a.testBox.min.z, b.testBox.min.z) +
          Math.min(a.testBox.max.z, b.testBox.max.z)) / 2,
      ];

      clashes.push({
        key: `${a.object.uuid}:${b.object.uuid}`,
        a: a.object,
        b: b.object,
        aElement: a.element,
        bElement: b.element,
        position: center,
        size: padded.map((v) => Math.max(v, 0.05)),
        // Positive = interpenetration depth. Negative = clearance gap.
        depth,
        kind: hard ? "hard" : "clearance",
      });
    }
  }

  // Worst first — that is the order anyone actually wants to walk a report in.
  return clashes.sort((x, y) => y.depth - x.depth);
}
