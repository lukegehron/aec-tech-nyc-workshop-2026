import { atom, getDefaultStore } from "jotai";

/**
 * Scene scope — what you are *looking at*, not what you published.
 *
 * Artifacts (`lib/artifacts.js`) are objects a brick emits. This file is the
 * shared building / floor / department / space selection so two tiles on the
 * board (a dashboard card and a 3D massing, after remix) stay in sync.
 *
 * In-memory on purpose. Export snapshots it; a hard refresh returns to the
 * whole site. Do not write these to localStorage.
 *
 * ---------------------------------------------------------------------------
 * After rebasing a phase branch, ALIAS the old names. Do not declare new atoms.
 *
 *   // baseplates/building-dashboard/atoms.js
 *   export {
 *     sceneBuildingIdAtom as selectedBuildingAtom,
 *     sceneFloorIdAtom as selectedFloorAtom,
 *   } from "@/lib/scene";
 *
 *   // baseplates/viewer3d/atoms.js
 *   export { sceneFloorIdAtom as levelFilterAtom } from "@/lib/scene";
 *   // keep viewModeAtom local
 *
 * Then call `useSyncSceneCatalog(data)` once in that Screen after `useProject()`.
 * ---------------------------------------------------------------------------
 */

export const sceneBuildingIdAtom = atom(null);
export const sceneFloorIdAtom = atom(null);
export const sceneDepartmentIdAtom = atom(null);
export const sceneSpaceIdAtom = atom(null);
export const sceneViewModeAtom = atom(null);

/**
 * Labels for the Filters strip. Empty on Flat (no project.json). Remix fills
 * this via `useSyncSceneCatalog(project)` so this module never imports
 * `lib/projectData.js` — that file is not on main.
 */
export const sceneCatalogAtom = atom({
  buildings: [],
  floors: [],
  departments: [],
  spaces: [],
});

export function catalogFromProject(project) {
  if (!project) {
    return { buildings: [], floors: [], departments: [], spaces: [] };
  }
  const buildings = (project.buildings ?? []).map((building) => ({
    id: building.id,
    name: building.name ?? building.id,
  }));
  const floors = (project.buildings ?? []).flatMap((building) =>
    (building.floors ?? []).map((floor) => ({
      id: floor.id,
      name: floor.name ?? floor.id,
      buildingId: building.id,
      level: floor.level ?? null,
    }))
  );
  const departments = (project.departments ?? []).map((department) => ({
    id: department.id,
    name: department.name ?? department.id,
  }));
  const spaces = (project.buildings ?? []).flatMap((building) =>
    (building.floors ?? []).flatMap((floor) =>
      (floor.spaces ?? []).map((space) => ({
        id: space.id,
        name: space.name ?? space.id,
        floorId: floor.id,
        buildingId: building.id,
        departmentId: space.departmentId ?? null,
      }))
    )
  );
  return { buildings, floors, departments, spaces };
}

export function snapshotScene() {
  const store = getDefaultStore();
  return {
    buildingId: store.get(sceneBuildingIdAtom),
    floorId: store.get(sceneFloorIdAtom),
    departmentId: store.get(sceneDepartmentIdAtom),
    spaceId: store.get(sceneSpaceIdAtom),
  };
}

export function applySceneSnapshot(scene) {
  const store = getDefaultStore();
  store.set(sceneBuildingIdAtom, scene?.buildingId ?? null);
  store.set(sceneFloorIdAtom, scene?.floorId ?? null);
  store.set(sceneDepartmentIdAtom, scene?.departmentId ?? null);
  store.set(sceneSpaceIdAtom, scene?.spaceId ?? null);
}

export function resetScene() {
  applySceneSnapshot({});
}

export function setSceneBuilding(id) {
  const store = getDefaultStore();
  store.set(sceneBuildingIdAtom, id);
  store.set(sceneFloorIdAtom, null);
  store.set(sceneDepartmentIdAtom, null);
  store.set(sceneSpaceIdAtom, null);
}

export function setSceneFloor(id) {
  const store = getDefaultStore();
  const catalog = store.get(sceneCatalogAtom);
  store.set(sceneFloorIdAtom, id);
  store.set(sceneSpaceIdAtom, null);
  if (id) {
    const floor = catalog.floors.find((entry) => entry.id === id);
    if (floor?.buildingId) store.set(sceneBuildingIdAtom, floor.buildingId);
  }
}

export function setSceneDepartment(id) {
  getDefaultStore().set(sceneDepartmentIdAtom, id);
}

export function setSceneSpace(id) {
  const store = getDefaultStore();
  const catalog = store.get(sceneCatalogAtom);
  store.set(sceneSpaceIdAtom, id);
  if (!id) return;
  const space = catalog.spaces.find((entry) => entry.id === id);
  if (space?.floorId) store.set(sceneFloorIdAtom, space.floorId);
  if (space?.buildingId) store.set(sceneBuildingIdAtom, space.buildingId);
  if (space?.departmentId) store.set(sceneDepartmentIdAtom, space.departmentId);
}
