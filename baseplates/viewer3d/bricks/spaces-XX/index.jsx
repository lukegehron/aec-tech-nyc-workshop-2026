"use client";

import { boxFromOutline, PLAN_INSET, SLAB_GAP } from "../../geometry";

/** Every room in the project, coloured by department. */
function spaceBoxes(data, departments) {
  const buildingNames = Object.fromEntries(data.buildings.map((b) => [b.id, b.name]));
  return data.buildings.flatMap((b) =>
    b.floors.flatMap((f) =>
      f.spaces.map((s) => ({
        key: s.id,
        ...boxFromOutline(s.footprint, {
          base: f.elevation,
          height: f.height,
          inset: PLAN_INSET,
          verticalGap: SLAB_GAP,
        }),
        color: departments[s.department]?.color,
        department: s.department,
        level: s.level,
        meta: {
          title: s.name,
          lines: [
            `${buildingNames[s.buildingId]} · ${f.name}`,
            departments[s.department]?.name ?? s.department,
            `${Math.round(s.area).toLocaleString()} m²${s.occupancy ? ` · ${s.occupancy} people` : ""}`,
          ],
        },
      }))
    )
  );
}

/**
 * This mode is the only one that colours by department, so it's the only one
 * that owes the reader a key. A brick that needs a legend ships its own.
 */
function DepartmentLegend({ data }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {data.departments.map((dept) => (
        <span
          key={dept.id}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className="size-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: dept.color }}
          />
          {dept.name}
        </span>
      ))}
    </div>
  );
}

export const spacesBrick = {
  id: "spaces-XX",
  label: "Spaces",
  hint: "Every room, coloured by department",
  order: 30,
  supportsLevels: true,
  buildBoxes: ({ data, departments }) => spaceBoxes(data, departments),
  Legend: DepartmentLegend,
};
