"use client";

// One dataset, one loader. Every brick that needs building information reads
// public/sample-data/project.json through here rather than fetching it itself,
// so every brick is always looking at the same project.
//
// Shape:
//   { project: { name, metrics: { gfa, nsa, efficiency, … } },
//     site: { outline, width, depth },
//     departments: [ { id, name, color, colorDark } ],
//     spaceTypes:  [ { id, name, density } ],
//     buildings:   [ { id, name, use, origin, width, depth, height, outline,
//                      floors: [ { id, level, elevation, height, gfa, nsa,
//                                  outline, spaces: [ … ] } ] } ],
//     materials:   [ { material, embodiedCarbon, cost, quantity, … } ] }
//
// Plan coordinates are metres, written [x, z] — x east, z north, y up — so they
// drop straight into three.js.

import { useEffect, useState } from "react";

const DATA_URL = "/sample-data/project.json";

// Module-level cache: several bricks can mount at once (and React strict mode
// double-invokes effects), and none of them should re-fetch a static file.
let cache = null;
let inflight = null;

export function loadProject() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${DATA_URL}: ${r.status}`);
        return r.json();
      })
      .then((json) => {
        cache = json;
        inflight = null;
        return json;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

/** Loads the project once and re-renders when it arrives. */
export function useProject() {
  const [data, setData] = useState(cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadProject().then(
      (json) => alive && setData(json),
      (err) => alive && setError(err)
    );
    return () => {
      alive = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}

// ---------------------------------------------------------------------------
// Derived views. All pure — pass in the loaded project, get plain arrays back.
// ---------------------------------------------------------------------------

export function getFloors(project) {
  return project?.buildings.flatMap((b) => b.floors) ?? [];
}

export function getSpaces(project) {
  return getFloors(project).flatMap((f) => f.spaces);
}

export function getFloor(project, floorId) {
  return getFloors(project).find((f) => f.id === floorId) ?? null;
}

export function getBuilding(project, buildingId) {
  return project?.buildings.find((b) => b.id === buildingId) ?? null;
}

/** department id -> { id, name, color, colorDark } */
export function departmentIndex(project) {
  return Object.fromEntries((project?.departments ?? []).map((d) => [d.id, d]));
}

/** space type id -> { id, name, density } */
export function spaceTypeIndex(project) {
  return Object.fromEntries((project?.spaceTypes ?? []).map((t) => [t.id, t]));
}

/**
 * Pick a department's hex for the current theme. Charts and the 3D scene both
 * need this, and the two palettes are stepped for their own surface — a dark
 * chart is not a lighter one dimmed.
 */
export function departmentColor(department, isDark) {
  if (!department) return isDark ? "#6b6b6b" : "#9ca3af";
  return isDark ? department.colorDark : department.color;
}

/**
 * Area and headcount rolled up by department, in the palette's fixed slot
 * order — so a filter that drops a department never repaints the survivors.
 * Optionally scoped to one building or one floor.
 */
export function areaByDepartment(project, { buildingId, floorId } = {}) {
  if (!project) return [];
  let spaces = getSpaces(project);
  if (buildingId) spaces = spaces.filter((s) => s.buildingId === buildingId);
  if (floorId) spaces = spaces.filter((s) => s.floorId === floorId);

  return project.departments
    .map((dept) => {
      const own = spaces.filter((s) => s.department === dept.id);
      return {
        id: dept.id,
        name: dept.name,
        color: dept.color,
        colorDark: dept.colorDark,
        area: round(own.reduce((sum, s) => sum + s.area, 0)),
        occupancy: own.reduce((sum, s) => sum + s.occupancy, 0),
        spaceCount: own.length,
      };
    })
    .filter((d) => d.spaceCount > 0);
}

/**
 * One row per floor, highest level first, with each department's area as its
 * own key — the shape a stacked bar chart wants.
 */
export function floorStack(project, { buildingId } = {}) {
  if (!project) return [];
  let floors = getFloors(project);
  if (buildingId) floors = floors.filter((f) => f.buildingId === buildingId);

  return floors
    .slice()
    .sort((a, b) => b.elevation - a.elevation)
    .map((floor) => {
      const row = {
        id: floor.id,
        label: buildingId ? floor.name : `${floor.buildingId} · ${floor.name}`,
        level: floor.level,
        buildingId: floor.buildingId,
        elevation: floor.elevation,
        gfa: floor.gfa,
        nsa: floor.nsa,
        spaceCount: floor.spaces.length,
        occupancy: floor.spaces.reduce((sum, s) => sum + s.occupancy, 0),
      };
      for (const dept of project.departments) {
        row[dept.id] = round(
          floor.spaces
            .filter((s) => s.department === dept.id)
            .reduce((sum, s) => sum + s.area, 0)
        );
      }
      return row;
    });
}

/** Per-building rollup for the summary table. */
export function buildingSummaries(project) {
  return (project?.buildings ?? []).map((b) => {
    const spaces = b.floors.flatMap((f) => f.spaces);
    const nsa = round(b.floors.reduce((sum, f) => sum + f.nsa, 0));
    return {
      id: b.id,
      name: b.name,
      use: b.use,
      floorCount: b.floorCount,
      height: b.height,
      gfa: b.gfa,
      nsa,
      efficiency: b.gfa ? nsa / b.gfa : 0,
      spaceCount: spaces.length,
      occupancy: spaces.reduce((sum, s) => sum + s.occupancy, 0),
    };
  });
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const round = (n) => Math.round(n * 100) / 100;

export function formatArea(n) {
  return `${Math.round(n).toLocaleString()} m²`;
}

export function formatNumber(n) {
  return Math.round(n).toLocaleString();
}

export function formatPercent(fraction, digits = 0) {
  return `${(fraction * 100).toFixed(digits)}%`;
}

/**
 * Plan-space bounds of a set of footprint polygons ([[x, z], …]) — what an SVG
 * or canvas plan view needs to fit the geometry to its viewport.
 */
export function outlineBounds(outlines) {
  const bounds = { minX: Infinity, minZ: Infinity, maxX: -Infinity, maxZ: -Infinity };
  for (const outline of outlines) {
    for (const [x, z] of outline) {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minZ = Math.min(bounds.minZ, z);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxZ = Math.max(bounds.maxZ, z);
    }
  }
  return { ...bounds, width: bounds.maxX - bounds.minX, depth: bounds.maxZ - bounds.minZ };
}
