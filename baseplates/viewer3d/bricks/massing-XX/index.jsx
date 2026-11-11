import { boxFromOutline } from "../../geometry";

/** One volume per building — the classic massing model. */
function massingBoxes(data) {
  return data.buildings.map((b) => ({
    key: b.id,
    ...boxFromOutline(b.outline, { base: 0, height: b.height }),
    meta: {
      title: b.name,
      lines: [
        b.use,
        `${b.floorCount} floors · ${b.height} m`,
        `${Math.round(b.gfa).toLocaleString()} m² GFA`,
      ],
    },
  }));
}

export const massingBrick = {
  id: "massing-XX",
  label: "Massing",
  hint: "One volume per building",
  order: 10,
  // There are no floors in this mode, so the level filter has nothing to do.
  supportsLevels: false,
  buildBoxes: ({ data }) => massingBoxes(data),
};
