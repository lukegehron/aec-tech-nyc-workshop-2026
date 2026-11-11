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
 * An ELEMENT is the thing a clash is reported against, and getting this right
 * is the difference between a useful report and a useless one.
 *
 * Two meshes of the SAME element never clash with each other — the sill board
 * of a window genuinely overlaps the wall pier it sits in, and flagging that
 * would bury every real result. But if "element" is drawn too wide, whole
 * bricks collapse into one object and real clashes vanish: two separate walls
 * drawn by the wall tool both live under that brick's root group, so walking
 * all the way up to the scene root made them the same element and reported
 * nothing.
 *
 * So an element is, in order of preference:
 *   1. the nearest ancestor (or self) carrying an explicit `clashElement` id —
 *      how a brick names its own parts
 *   2. the nearest ancestor (or self) carrying a `wallId` — the wall tool tags
 *      every mesh it builds, so each wall is its own element and its own
 *      openings are correctly excluded
 *   3. the highest ancestor under the scene root — right for an imported .3dm,
 *      where "mesh 404 hits mesh 405" is noise
 *
 * Anything a brick wants treated as one object can opt in with either tag; it
 * never has to know this brick exists.
 */
function elementRootOf(object, sceneRoot) {
  let node = object;
  while (node && node !== sceneRoot) {
    const tag = node.userData?.clashElement ?? node.userData?.wallId;
    if (tag != null) return { id: String(tag), node };
    node = node.parent;
  }

  // No tag anywhere up the chain: fall back to the top-level object.
  let top = object;
  while (top.parent && top.parent !== sceneRoot) top = top.parent;
  return { id: top.uuid, node: top };
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

    const element = elementRootOf(object, sceneRoot);

    solids.push({
      object,
      element: element.node,
      elementId: element.id,
      box,
      // The ORIENTED box, in the object's own frame. A wall drawn at an angle
      // has a huge axis-aligned box — a 6 m wall at 45° covers 19 m² of plan
      // instead of 1.2 m² — so the AABB alone would report a clash against
      // anything in that square. The AABB stays as the cheap broad phase; this
      // is the narrow phase that confirms it.
      obb: obbFor(object),
    });
  });

  return solids;
}

/**
 * The object's local bounding box plus its world matrix — enough to run an
 * exact oriented-box test. Returns null when the geometry has no usable local
 * box, in which case the caller falls back to the AABB.
 */
function obbFor(object) {
  const geometry = object.geometry;
  if (!geometry) return null;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const local = geometry.boundingBox;
  if (!local || local.isEmpty()) return null;

  const center = new THREE.Vector3();
  const halfSize = new THREE.Vector3();
  local.getCenter(center);
  local.getSize(halfSize).multiplyScalar(0.5);

  // Guard against a zero-thickness axis: the SAT test needs a real basis.
  halfSize.set(
    Math.max(halfSize.x, 1e-5),
    Math.max(halfSize.y, 1e-5),
    Math.max(halfSize.z, 1e-5)
  );

  center.applyMatrix4(object.matrixWorld);

  // Rotation (and scale) only — translation is already in `center`.
  const basis = new THREE.Matrix3().setFromMatrix4(object.matrixWorld);
  const scale = new THREE.Vector3(
    new THREE.Vector3(basis.elements[0], basis.elements[1], basis.elements[2]).length(),
    new THREE.Vector3(basis.elements[3], basis.elements[4], basis.elements[5]).length(),
    new THREE.Vector3(basis.elements[6], basis.elements[7], basis.elements[8]).length()
  );
  halfSize.multiply(scale);

  // Normalise the basis columns so it is a pure rotation.
  const axes = [
    new THREE.Vector3(basis.elements[0], basis.elements[1], basis.elements[2]).normalize(),
    new THREE.Vector3(basis.elements[3], basis.elements[4], basis.elements[5]).normalize(),
    new THREE.Vector3(basis.elements[6], basis.elements[7], basis.elements[8]).normalize(),
  ];

  return { center, halfSize, axes };
}

/**
 * Separating Axis Theorem for two oriented boxes, with a margin.
 *
 * Returns the smallest penetration found across all 15 candidate axes (3 from
 * each box, 9 cross products), or `null` the moment any axis separates them —
 * one separating axis proves no overlap, which is the whole point of SAT.
 *
 * A positive return is how deep they interpenetrate. `margin` grows both boxes,
 * so clearance testing is the same call with a non-zero margin.
 */
function obbPenetration(a, b, margin = 0) {
  const axes = [];
  for (const axis of a.axes) axes.push(axis);
  for (const axis of b.axes) axes.push(axis);
  for (const axisA of a.axes) {
    for (const axisB of b.axes) {
      const cross = new THREE.Vector3().crossVectors(axisA, axisB);
      // Parallel axes give a zero-length cross product and no information.
      if (cross.lengthSq() > 1e-8) axes.push(cross.normalize());
    }
  }

  const centerDelta = new THREE.Vector3().subVectors(b.center, a.center);
  let smallest = Infinity;

  for (const axis of axes) {
    // Project each box's extent onto this axis.
    const projectionA =
      Math.abs(a.axes[0].dot(axis)) * a.halfSize.x +
      Math.abs(a.axes[1].dot(axis)) * a.halfSize.y +
      Math.abs(a.axes[2].dot(axis)) * a.halfSize.z;
    const projectionB =
      Math.abs(b.axes[0].dot(axis)) * b.halfSize.x +
      Math.abs(b.axes[1].dot(axis)) * b.halfSize.y +
      Math.abs(b.axes[2].dot(axis)) * b.halfSize.z;

    const distance = Math.abs(centerDelta.dot(axis));
    const penetration = projectionA + projectionB + margin - distance;

    // Separated on this axis — they cannot be touching.
    if (penetration <= 0) return null;
    if (penetration < smallest) smallest = penetration;
  }

  return smallest;
}

/**
 * A cheap fingerprint of the scene's clashable geometry.
 *
 * This brick can't watch another brick's state — bricks don't import each
 * other — so "did the user just draw a wall?" is answered by watching the
 * scene graph itself. Counting meshes and summing their world positions is
 * enough to notice geometry appearing, disappearing or moving, and it is far
 * cheaper than re-running the pair loop every frame.
 */
export function sceneSignature(sceneRoot) {
  let count = 0;
  let accumulator = 0;
  sceneRoot.traverse((object) => {
    if (!object.isMesh) return;
    if (optedOut(object, sceneRoot)) return;
    count += 1;
    const p = object.matrixWorld.elements;
    // Translation column, plus a cheap nod to orientation.
    accumulator += p[12] + p[13] * 2 + p[14] * 3 + p[0] + p[5];
  });
  return `${count}:${accumulator.toFixed(3)}`;
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
      // Two meshes of the same authored object are not a clash — a window sill
      // really does sit inside its wall.
      if (a.elementId === b.elementId) continue;

      // BROAD PHASE: axis-aligned, cheap, and generous.
      const padded = axisOverlap(a.testBox, b.testBox);
      if (padded.some((v) => v <= TOUCH_EPSILON)) continue;

      // NARROW PHASE: oriented boxes, exact. This is what stops an angled wall
      // from clashing with everything inside its (much larger) AABB.
      //
      // `separation` is positive when the padded boxes overlap. Taking the
      // margin back off gives the real relationship: positive means the solids
      // interpenetrate, negative means that's the gap between them.
      let overlapping = Math.min(...axisOverlap(a.box, b.box));
      if (a.obb && b.obb) {
        const separation = obbPenetration(a.obb, b.obb, grow * 2);
        // The broad phase lied — the oriented boxes don't actually meet.
        if (separation == null) continue;
        overlapping = separation - grow * 2;
      }

      const hard = overlapping > TOUCH_EPSILON;
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

      // An angled wall's AABB intersection is much bigger than the real
      // overlap, so cap the marker at the thinner solid's own extent. A marker
      // that swamps the thing it is pointing at is worse than no marker.
      const extentA = new THREE.Vector3();
      const extentB = new THREE.Vector3();
      a.box.getSize(extentA);
      b.box.getSize(extentB);
      const cap = [
        Math.min(extentA.x, extentB.x),
        Math.min(extentA.y, extentB.y),
        Math.min(extentA.z, extentB.z),
      ];

      clashes.push({
        key: `${a.object.uuid}:${b.object.uuid}`,
        a: a.object,
        b: b.object,
        aElement: a.element,
        bElement: b.element,
        aElementId: a.elementId,
        bElementId: b.elementId,
        position: center,
        size: padded.map((v, axis) =>
          Math.max(Math.min(v, cap[axis]), 0.05)
        ),
        // Positive = how far the solids interpenetrate. Negative = the gap
        // between them.
        //
        // For a hard clash this is capped at the thinnest dimension the two
        // solids share. SAT's raw answer is the minimum translation distance,
        // which for two crossing 3 m-tall walls is 3 m — technically the
        // distance you'd move one to free it, but it reads as nonsense next to
        // a 0.2 m wall. The thickness of the overlap is the number a person
        // means by "how bad is it".
        depth: hard
          ? Math.min(overlapping, Math.max(Math.min(...cap), 0.01))
          : overlapping,
        kind: hard ? "hard" : "clearance",
      });
    }
  }

  // Worst first — that is the order anyone actually wants to walk a report in.
  return clashes.sort((x, y) => y.depth - x.depth);
}
