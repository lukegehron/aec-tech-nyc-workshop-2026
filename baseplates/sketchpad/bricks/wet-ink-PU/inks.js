// The inks, and which baseplate swatch stands in for each.
// The toolbar swatches belong to the baseplate; theme.js recolours them and the
// brush maps the selected swatch back to an ink.
//
// black, plum and emerald are pigment inks — they darken the paper (multiply).
// silver and gold are METAL inks — opaque liquid metal with light; silver is
// shaded as pearl.

export const INKS = {
  black: [26, 22, 20],
  plum: [92, 34, 78],
  emerald: [12, 110, 78],
  silver: [236, 232, 240],
  gold: [212, 165, 55],
};

// Swatch looks: a flat colour for pigments, a sheen for metals.
export const INK_HEX = {
  black: "#1a1614",
  plum: "#5c224e",
  emerald: "#0c6e4e",
  silver: "#ece8f0",
  gold: "#d4a537",
};

export const INK_SHEEN = {
  silver: "linear-gradient(135deg, #fffdfb 0%, #f1e6ee 30%, #e6eef0 55%, #f6f0e4 75%, #bdb8c4 100%)",
  gold: "linear-gradient(135deg, #fff1b8 0%, #c9952e 45%, #f6d77a 60%, #7a5416 100%)",
};

export const SWATCH_FOR_INK = {
  black: "#111827",
  plum: "#ef4444",
  emerald: "#22c55e",
  silver: "#3b82f6",
  gold: "#f59e0b",
};

const INK_FOR_SWATCH = Object.fromEntries(
  Object.entries(SWATCH_FOR_INK).map(([ink, hex]) => [hex, ink])
);

export function inkFor(hex) {
  return INK_FOR_SWATCH[String(hex).toLowerCase()] ?? "black";
}

// Index order used by the wet layer (wetlayer.js) to tag each pass.
export const INK_ORDER = ["black", "plum", "emerald", "silver", "gold"];

export const PEARL = new Set(["silver"]);

export const isMetal = (index) => INK_ORDER[index] === "silver" || INK_ORDER[index] === "gold";

// Liquid-metal tone ramps: shadow → body → light → highlight.
export const METAL_RAMP = {
  // pearl: never dark, a cool lilac-grey shade up to warm white
  silver: [
    [168, 164, 178],
    [214, 210, 220],
    [238, 235, 240],
    [255, 253, 250],
  ],
  gold: [
    [92, 60, 14],
    [190, 138, 42],
    [246, 210, 116],
    [255, 248, 220],
  ],
};
