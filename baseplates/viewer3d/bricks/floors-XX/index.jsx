import { boxFromOutline, SLAB_GAP } from "../../geometry";

/** One plate per floor, stacked with a slab gap between them. */
function floorBoxes(data) {
  return data.buildings.flatMap((b) =>
    b.floors.map((f) => ({
      key: f.id,
      ...boxFromOutline(f.outline, {
        base: f.elevation,
        height: f.height,
        verticalGap: SLAB_GAP,
      }),
      meta: {
        title: `${b.name} — ${f.name}`,
        lines: [
          `${Math.round(f.gfa).toLocaleString()} m² gross · ${Math.round(f.nsa).toLocaleString()} m² net`,
          `${f.spaces.length} spaces`,
          `+${f.elevation.toFixed(1)} m`,
        ],
      },
    }))
  );
}

export const floorsBrick = {
  id: "floors-XX",
  label: "Floors",
  hint: "Stacked floor plates",
  order: 20,
  supportsLevels: true,
  buildBoxes: ({ data }) => floorBoxes(data),
};
