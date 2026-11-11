import * as THREE from "three";

/**
 * Where to stand, and what to look at, given the point the user clicked.
 *
 * Pure maths — no React, no r3f — so the awkward parts (standing outside the
 * building rather than inside its wall, not falling below the pavement) can be
 * reasoned about and tested on their own.
 *
 * Everything is world space in metres. This scene is Z-UP, so the third
 * component of every vector is elevation and "stand on the ground" means
 * z = EYE_HEIGHT, not y.
 */

/** How far back from the clicked face to stand, as a fraction of its height. */
const STANDOFF_RATIO = 0.9;

/** Never stand closer than this to the thing you clicked, or it fills the frame. */
const MIN_STANDOFF = 4;

/** Nor further than this, or "street view" becomes "across the car park". */
const MAX_STANDOFF = 45;

/**
 * Pick the stance for a click.
 *
 * `point`  where the ray hit, world space
 * `normal` the surface normal at the hit, world space, or null for the ground
 * `box`    world AABB of the object that was hit, or null
 *
 * Returns `{ eye, look }` as plain arrays.
 */
export function stanceFor({ point, normal, box, eyeHeight }) {
  const hit = new THREE.Vector3().fromArray(point);

  // How tall is the thing we clicked? That sets both how far back to stand and
  // how high up to look — clicking a 19 m tower should tilt the head up, and
  // clicking the pavement shouldn't.
  const height = box ? Math.max(box.max.z - box.min.z, 0) : 0;

  // Step back along the surface normal, flattened into plan: we want to move
  // AWAY from the facade horizontally, never to float up or sink down.
  let away = new THREE.Vector3(0, 0, 0);
  if (normal) {
    away.set(normal[0], normal[1], 0);
  }

  // A floor or roof has a vertical normal, which flattens to nothing. Fall
  // back to stepping toward the centre of the site instead — any direction
  // that gets us off the slab and looking at it.
  if (away.lengthSq() < 1e-6 && box) {
    const center = new THREE.Vector3(
      (box.min.x + box.max.x) / 2,
      (box.min.y + box.max.y) / 2,
      0
    );
    away.set(hit.x - center.x, hit.y - center.y, 0);
  }

  // Still nothing (clicked dead centre of a flat slab, or open ground): just
  // stand south of the point so the view is deterministic rather than random.
  if (away.lengthSq() < 1e-6) away.set(0, -1, 0);

  away.normalize();

  const standoff = Math.min(
    Math.max(height * STANDOFF_RATIO, MIN_STANDOFF),
    MAX_STANDOFF
  );

  const eye = new THREE.Vector3()
    .copy(hit)
    .addScaledVector(away, standoff);
  // Plant the feet: eye height above the pavement, whatever we clicked.
  eye.z = eyeHeight;

  // Look at the thing, a little above its middle, so a tall facade reads as
  // tall. For ground-level clicks this lands at roughly eye height, which is
  // the natural "looking down the street" horizon.
  const look = new THREE.Vector3(
    hit.x,
    hit.y,
    height > 0 ? Math.max(hit.z, eyeHeight) + height * 0.25 : eyeHeight
  );

  return { eye: eye.toArray(), look: look.toArray() };
}

/**
 * Keep a stance inside the site, so clicking the far edge of a building
 * doesn't put the viewer out in the void with nothing around them.
 *
 * `bounds` is `{ minX, maxX, minY, maxY }` padded by the caller.
 */
export function clampToSite(eye, bounds) {
  return [
    Math.min(Math.max(eye[0], bounds.minX), bounds.maxX),
    Math.min(Math.max(eye[1], bounds.minY), bounds.maxY),
    eye[2],
  ];
}

/** Compass heading for a look direction, as a readable string. */
export function headingOf(eye, look) {
  const dx = look[0] - eye[0];
  const dy = look[1] - eye[1];
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return "—";
  // Y is north in this scene's plan (project.json's [x, z] became [x, y]).
  const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
  const compass = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((deg + 360) % 360) / 45) % 8;
  return compass[index];
}
