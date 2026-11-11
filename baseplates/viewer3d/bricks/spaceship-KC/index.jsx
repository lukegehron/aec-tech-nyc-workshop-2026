import { boxFromOutline } from "../../geometry";

/**
 * One flying saucer per building, built from stacked boxes on the building's
 * footprint (the viewer only draws axis-aligned boxes). Z is up. Colours are
 * fixed on purpose: they are the ship's livery, not UI chrome.
 */
const HULL = "#aab4c3";
const RIM = "#6b7686";
const DOME = "#7fdbff";
const LIGHT = "#ffd166";
const BEAM = "#b8f2a1";
const LEG = "#3b4252";

function saucerParts(b) {
  const { position, size } = boxFromOutline(b.outline, { base: 0, height: b.height });
  const [cx, cy] = position;
  const [w, d] = size;
  const h = b.height;
  const meta = {
    title: `${b.name} — Saucer`,
    lines: [b.use, `${b.floorCount} decks · ${h} m`, `${Math.round(b.gfa).toLocaleString()} m² deck area`],
  };
  // Centred box: fractions of footprint width/depth and of building height.
  const part = (name, fw, fd, z0, fh, color, dx = 0, dy = 0) => ({
    key: `${b.id}-${name}`,
    position: [cx + dx * w, cy + dy * d, h * z0 + (h * fh) / 2],
    size: [w * fw, d * fd, h * fh],
    color,
    meta,
  });

  return [
    // Hovering on four landing legs.
    part("leg-nw", 0.08, 0.08, 0, 0.2, LEG, -0.3, 0.3),
    part("leg-ne", 0.08, 0.08, 0, 0.2, LEG, 0.3, 0.3),
    part("leg-sw", 0.08, 0.08, 0, 0.2, LEG, -0.3, -0.3),
    part("leg-se", 0.08, 0.08, 0, 0.2, LEG, 0.3, -0.3),
    // Tractor-beam emitter under the belly.
    part("emitter", 0.2, 0.2, 0.2, 0.08, BEAM),
    // Disc, widening to the rim then narrowing again.
    part("belly", 0.6, 0.6, 0.28, 0.08, RIM),
    part("rim", 1, 1, 0.36, 0.1, HULL),
    part("deck", 0.74, 0.74, 0.46, 0.08, HULL),
    // Rim lights at the four corners.
    part("light-nw", 0.1, 0.1, 0.46, 0.04, LIGHT, -0.45, 0.45),
    part("light-ne", 0.1, 0.1, 0.46, 0.04, LIGHT, 0.45, 0.45),
    part("light-sw", 0.1, 0.1, 0.46, 0.04, LIGHT, -0.45, -0.45),
    part("light-se", 0.1, 0.1, 0.46, 0.04, LIGHT, 0.45, -0.45),
    // Glass dome, stepped, with a mast on top.
    part("dome-low", 0.46, 0.46, 0.54, 0.14, DOME),
    part("dome-mid", 0.32, 0.32, 0.68, 0.12, DOME),
    part("dome-top", 0.18, 0.18, 0.8, 0.08, DOME),
    part("mast", 0.04, 0.04, 0.88, 0.12, LEG),
  ];
}

const FUR = "#8d939b";
const FUR_LIGHT = "#d9dce0";
const EAR_INNER = "#f4b6c2";
const KOALA_DARK = "#1f2328";
const THRUSTER = "#4cc9f0";

/** Building id that is built as a koala instead of a saucer. */
const KOALA_BUILDING = "C";

/**
 * A koala-shaped ship, sitting and facing north (+Y). Measurements are in
 * "koala units" (about 1 wide, 1.1 tall) and scaled to fit the footprint and
 * height of the building, so the proportions hold whatever the building size.
 */
function koalaParts(b) {
  const { position, size } = boxFromOutline(b.outline, { base: 0, height: b.height });
  const [cx, cy] = position;
  const [w, d] = size;
  const h = b.height;
  const s = Math.min(w / 1.0, d / 0.7, h / 1.18);
  const meta = {
    title: `${b.name} — Koala Ship`,
    lines: [b.use, `${b.floorCount} decks · ${h} m`, `${Math.round(b.gfa).toLocaleString()} m² deck area`],
  };
  // x/y offset from the footprint centre, z0 = underside, then box size.
  const part = (name, x, y, z0, sx, sy, sz, color) => ({
    key: `${b.id}-${name}`,
    position: [cx + x * s, cy + y * s, (z0 + sz / 2) * s],
    size: [sx * s, sy * s, sz * s],
    color,
    meta,
  });
  const lift = 0.08; // thruster pad height; everything else sits on it

  return [
    part("thruster", 0, 0, 0, 0.62, 0.46, lift, THRUSTER),
    // Legs and body.
    part("leg-l", -0.2, 0.05, lift, 0.25, 0.35, 0.15, FUR),
    part("leg-r", 0.2, 0.05, lift, 0.25, 0.35, 0.15, FUR),
    part("body", 0, 0, lift + 0.15, 0.7, 0.5, 0.45, FUR),
    part("belly", 0, 0.22, lift + 0.2, 0.4, 0.06, 0.3, FUR_LIGHT),
    // Arms hugging the body.
    part("arm-l", -0.42, 0.1, lift + 0.25, 0.14, 0.2, 0.3, FUR),
    part("arm-r", 0.42, 0.1, lift + 0.25, 0.14, 0.2, 0.3, FUR),
    // Head, with the big round ears koalas are known for.
    part("head", 0, 0.05, lift + 0.6, 0.66, 0.5, 0.4, FUR),
    part("ear-l", -0.38, 0.03, lift + 0.8, 0.28, 0.12, 0.28, FUR),
    part("ear-r", 0.38, 0.03, lift + 0.8, 0.28, 0.12, 0.28, FUR),
    part("ear-inner-l", -0.38, 0.1, lift + 0.84, 0.16, 0.04, 0.16, EAR_INNER),
    part("ear-inner-r", 0.38, 0.1, lift + 0.84, 0.16, 0.04, 0.16, EAR_INNER),
    // Face: the big nose and two small eyes.
    part("nose", 0, 0.28, lift + 0.68, 0.18, 0.1, 0.22, KOALA_DARK),
    part("eye-l", -0.14, 0.27, lift + 0.84, 0.07, 0.04, 0.07, KOALA_DARK),
    part("eye-r", 0.14, 0.27, lift + 0.84, 0.07, 0.04, 0.07, KOALA_DARK),
  ];
}

const shipParts = (b) => (b.id === KOALA_BUILDING ? koalaParts(b) : saucerParts(b));

export const spaceshipBrick = {
  id: "spaceship-KC",
  label: "Spaceship",
  hint: "Each building as a spaceship — one is a koala",
  order: 11,
  supportsLevels: false,
  buildBoxes: ({ data }) => data.buildings.flatMap(shipParts),
};
