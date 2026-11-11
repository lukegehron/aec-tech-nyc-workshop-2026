import { outlineBounds } from "@/lib/projectData";
import { boxFromOutline } from "../../geometry";

// Real Empire State Building is ~443 m tall; the sample site is 108 x 84 m, so
// the whole thing is drawn at 1:5 to sit on the site.
const SCALE = 0.2;

const LIMESTONE = "#d9d3c3";
const STEEL = "#aab2ba";

// Approximate setbacks, in real metres: [name, width, depth, from, to, colour].
const TIERS = [
  ["Base (floors 1-5)", 129, 58, 0, 25, LIMESTONE],
  ["First setback", 100, 50, 25, 60, LIMESTONE],
  ["Second setback", 78, 46, 60, 110, LIMESTONE],
  ["Third setback", 62, 40, 110, 180, LIMESTONE],
  ["Fourth setback", 48, 34, 180, 240, LIMESTONE],
  ["Fifth setback", 36, 28, 240, 290, LIMESTONE],
  ["86th floor observatory", 26, 22, 290, 320, LIMESTONE],
  ["Upper tower", 16, 14, 320, 345, LIMESTONE],
  ["102nd floor crown", 10, 10, 345, 380, LIMESTONE],
  ["Spire", 4, 4, 380, 420, STEEL],
  ["Antenna", 1.5, 1.5, 420, 443, STEEL],
];

function rect(cx, cy, w, d) {
  return [
    [cx - w / 2, cy - d / 2],
    [cx + w / 2, cy - d / 2],
    [cx + w / 2, cy + d / 2],
    [cx - w / 2, cy + d / 2],
  ];
}

export const empireStateEL = {
  id: "empire-state-EL",
  label: "Empire State",
  hint: "The Empire State Building, stepped tiers at 1:5",
  order: 95,
  supportsLevels: false,

  buildBoxes({ data }) {
    const b = outlineBounds([data.site.outline]);
    const cx = b.minX + b.width / 2;
    const cy = b.minZ + b.depth / 2;

    return TIERS.map(([name, w, d, from, to, color], i) => ({
      key: `empire-state-${i}`,
      ...boxFromOutline(rect(cx, cy, w * SCALE, d * SCALE), {
        base: from * SCALE,
        height: (to - from) * SCALE,
      }),
      color,
      meta: {
        title: "Empire State Building",
        lines: [name, `${from}\u2013${to} m (real scale)`],
      },
    }));
  },
};
