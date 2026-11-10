"use client";

import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import {
  sceneBuildingIdAtom,
  sceneCatalogAtom,
  sceneDepartmentIdAtom,
  sceneFloorIdAtom,
  setSceneBuilding,
  setSceneDepartment,
  setSceneFloor,
} from "@/lib/scene";

/**
 * Board-level Filters strip. Same atoms every project-aware tile reads.
 * Hidden until a `usesScene` occupant is on the board — on 9am Flat that
 * is never, so this is wiring for remix.
 */
export function SceneFilters({ visible }) {
  const catalog = useAtomValue(sceneCatalogAtom);
  const buildingId = useAtomValue(sceneBuildingIdAtom);
  const floorId = useAtomValue(sceneFloorIdAtom);
  const departmentId = useAtomValue(sceneDepartmentIdAtom);

  if (!visible) return null;

  const floors = catalog.floors.filter((floor) =>
    buildingId ? floor.buildingId === buildingId : true
  );

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">
        Scene — every project tile on this board follows this
      </p>
      {catalog.buildings.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Dock a dashboard or 3D view and the building / floor buttons
          appear. (After rebase: call useSyncSceneCatalog in that Screen.)
        </p>
      ) : (
        <>
          <FilterRow label="Building">
            <Chip
              active={buildingId == null}
              onClick={() => setSceneBuilding(null)}
            >
              Whole site
            </Chip>
            {catalog.buildings.map((building) => (
              <Chip
                key={building.id}
                active={buildingId === building.id}
                onClick={() =>
                  setSceneBuilding(
                    buildingId === building.id ? null : building.id
                  )
                }
              >
                {building.name}
              </Chip>
            ))}
          </FilterRow>
          {floors.length > 0 ? (
            <FilterRow label="Floor">
              <Chip active={floorId == null} onClick={() => setSceneFloor(null)}>
                All floors
              </Chip>
              {floors.map((floor) => (
                <Chip
                  key={floor.id}
                  active={floorId === floor.id}
                  onClick={() =>
                    setSceneFloor(floorId === floor.id ? null : floor.id)
                  }
                >
                  {floor.name}
                </Chip>
              ))}
            </FilterRow>
          ) : null}
          {catalog.departments.length > 0 ? (
            <FilterRow label="Department">
              <Chip
                active={departmentId == null}
                onClick={() => setSceneDepartment(null)}
              >
                All
              </Chip>
              {catalog.departments.map((department) => (
                <Chip
                  key={department.id}
                  active={departmentId === department.id}
                  onClick={() =>
                    setSceneDepartment(
                      departmentId === department.id ? null : department.id
                    )
                  }
                >
                  {department.name}
                </Chip>
              ))}
            </FilterRow>
          ) : null}
        </>
      )}
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-20 shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "secondary" : "ghost"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
