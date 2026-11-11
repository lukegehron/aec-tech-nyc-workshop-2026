// The three inks, and which baseplate swatch stands in for each.
// The toolbar swatches belong to the baseplate; the theme recolours these three
// and hides the rest, and the brush maps the selected swatch back to an ink.

export const INKS = {
  black: [26, 22, 20],
  plum: [92, 34, 78],
  emerald: [12, 110, 78],
};

export const INK_HEX = {
  black: "#1a1614",
  plum: "#5c224e",
  emerald: "#0c6e4e",
};

export const SWATCH_FOR_INK = {
  black: "#111827",
  plum: "#ef4444",
  emerald: "#22c55e",
};

const INK_FOR_SWATCH = Object.fromEntries(
  Object.entries(SWATCH_FOR_INK).map(([ink, hex]) => [hex, ink])
);

export function inkFor(hex) {
  return INK_FOR_SWATCH[String(hex).toLowerCase()] ?? "black";
}
