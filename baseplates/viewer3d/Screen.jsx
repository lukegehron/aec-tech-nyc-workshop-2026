"use client";

import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { departmentIndex, formatArea, useProject } from "@/lib/projectData";
import { KitTray } from "@/lib/KitTray";
import { useOnBoard } from "@/lib/boardChrome";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import {
  sceneBuildingIdAtom,
  setSceneBuilding,
  setSceneFloor,
} from "@/lib/scene";
import { useSyncSceneCatalog } from "@/lib/useSyncSceneCatalog";
import { viewModeAtom, levelFilterAtom } from "./atoms";
import { sceneFraming } from "./geometry";
import {
  bricks,
  getMode,
  kitModes,
  kitScenes,
  kitToolbars,
} from "./bricks/bricks";
import Scene from "./Scene";

/**
 * The BASEPLATE itself.
 *
 * Shell and plumbing only: load the data, hold the filters, run the scene,
 * show the hover readout. The scene is built from
 * public/sample-data/project.json. Nothing here is hardcoded geometry; change
 * the data and the model changes with it.
 *
 * Note there is no list of features in this file — not of view modes, and not
 * of tools either. Every one is a BRICK in `bricks/`, listed in
 * `bricks/bricks.js`; adding one means a folder and two lines over there, and
 * never an edit here. The three lists this file maps over (`kitModes`,
 * `kitToolbars`, `kitScenes`) are all derived from that one array.
 */

export default function Viewer3dScreen() {
  const onBoard = useOnBoard();
  const { data, error, loading } = useProject();
  useSyncSceneCatalog(data);
  const [mode, setMode] = useAtom(viewModeAtom);
  const levelFilter = useAtomValue(levelFilterAtom);
  const buildingId = useAtomValue(sceneBuildingIdAtom);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const hidden = useAtomValue(hiddenBrickKeysAtom);
  const modes = kitModes(hidden);
  const toolbars = kitToolbars(hidden);
  const scenes = kitScenes(hidden);

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Couldn&apos;t load the project data — {error.message}
        </CardContent>
      </Card>
    );
  }

  if (loading) return <Skeleton className="h-[70vh] w-full rounded-lg" />;

  const departments = departmentIndex(data);
  const framing = sceneFraming(data);
  const maxLevel = Math.max(...data.buildings.map((b) => b.floorCount));
  const selectedLevel = levelFromFloorId(data, levelFilter);

  const activeMode =
    modes.find((m) => m.id === mode) ?? modes[0] ?? getMode(mode, hidden);
  let boxes = activeMode.buildBoxes({ data, departments });
  boxes = applySceneIsolation(boxes, { buildingId, selectedLevel });

  const detail = selected ?? hovered;

  // What every additive brick is handed — the same plain values the modes get,
  // plus the framing, because a tool that draws in the scene needs to know how
  // big the site is. Assembled once here rather than per brick.
  const brickContext = { data, departments, framing };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Generated from the brick registry — no list of modes lives here. */}
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {modes.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={activeMode.id === m.id ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-xs"
              onClick={() => {
                setMode(m.id);
                setSelected(null);
              }}
              title={m.hint}
            >
              {m.label}
            </Button>
          ))}
        </div>

        {onBoard ? null : (
          <>
            <div className="flex items-center gap-1 rounded-md border p-0.5">
              <Button
                size="sm"
                variant={buildingId === null ? "secondary" : "ghost"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setSceneBuilding(null)}
              >
                Whole site
              </Button>
              {data.buildings.map((building) => (
                <Button
                  key={building.id}
                  size="sm"
                  variant={buildingId === building.id ? "secondary" : "ghost"}
                  className="h-7 px-2.5 text-xs"
                  onClick={() =>
                    setSceneBuilding(
                      buildingId === building.id ? null : building.id
                    )
                  }
                >
                  {building.name}
                </Button>
              ))}
            </div>

            {activeMode.supportsLevels ? (
              <div className="flex items-center gap-1 rounded-md border p-0.5">
                <Button
                  size="sm"
                  variant={levelFilter === null ? "secondary" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setSceneFloor(null)}
                >
                  All levels
                </Button>
                {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={selectedLevel === level ? "secondary" : "ghost"}
                    className="h-7 w-7 px-0 text-xs tabular-nums"
                    onClick={() =>
                      setSceneFloor(
                        selectedLevel === level
                          ? null
                          : floorIdForLevel(data, buildingId, level)
                      )
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            ) : null}
          </>
        )}

        {/* EXTENSION POINT — the tools. Additive, so they sit next to the mode
            rail rather than inside it, and they stay usable whatever mode is
            selected. Again: this file names none of them. */}
        {toolbars.map(({ id, Toolbar }) => (
          <Toolbar key={id} {...brickContext} />
        ))}

        <span className="ml-auto text-xs text-muted-foreground">
          {data.project.name} · {formatArea(data.project.metrics.gfa)} ·{" "}
          {data.project.metrics.floorCount} floors
        </span>
      </div>

      <KitTray baseplateId="viewer3d" bricks={bricks} />

      <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border bg-card">
        <Scene
          boxes={boxes}
          framing={framing}
          siteOutline={data.site.outline}
          hoveredKey={hovered?.key}
          onHover={setHovered}
          onSelect={setSelected}
          sceneBricks={scenes}
          brickContext={brickContext}
        />

        {/* Hover/click readout lives in HTML over the canvas, not in a drei
            <Html> inside it — keeps the r3f tree free of anything that could
            suspend and take the WebGL context with it. */}
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-xs rounded-md border bg-background/90 px-3 py-2 text-xs backdrop-blur">
          {detail ? (
            <>
              <div className="font-medium">{detail.meta.title}</div>
              {detail.meta.lines.map((line) => (
                <div key={line} className="text-muted-foreground">
                  {line}
                </div>
              ))}
            </>
          ) : (
            <span className="text-muted-foreground">
              {activeMode.hint} · drag to orbit · scroll to zoom
            </span>
          )}
        </div>
      </div>

      {/* A brick supplies its own legend, or none. */}
      {activeMode.Legend ? (
        <activeMode.Legend data={data} departments={departments} />
      ) : null}
    </div>
  );
}

function levelFromFloorId(data, floorId) {
  if (floorId == null) return null;
  if (typeof floorId === "number") return floorId;
  for (const building of data.buildings) {
    const floor = building.floors.find((entry) => entry.id === floorId);
    if (floor) return floor.level;
  }
  const fromKey = Number(String(floorId).match(/L(\d+)/)?.[1]);
  return Number.isFinite(fromKey) ? fromKey : null;
}

function floorIdForLevel(data, buildingId, level) {
  const buildings = buildingId
    ? data.buildings.filter((building) => building.id === buildingId)
    : data.buildings;
  for (const building of buildings) {
    const floor = building.floors.find((entry) => entry.level === level);
    if (floor) return floor.id;
  }
  return null;
}

function boxBuildingId(box) {
  if (box.buildingId) return box.buildingId;
  const key = String(box.key ?? "");
  if (key && !key.includes("-")) return key;
  const match = key.match(/^([^-]+)-/);
  return match ? match[1] : null;
}

function applySceneIsolation(boxes, { buildingId, selectedLevel }) {
  return boxes.map((box) => {
    const boxBuilding = boxBuildingId(box);
    const wrongBuilding =
      Boolean(buildingId) && Boolean(boxBuilding) && boxBuilding !== buildingId;
    const boxLevel =
      box.level ?? Number(String(box.key ?? "").match(/L(\d+)/)?.[1]);
    const wrongLevel =
      selectedLevel != null &&
      Number.isFinite(boxLevel) &&
      boxLevel !== selectedLevel;
    if (!wrongBuilding && !wrongLevel) return box;
    return { ...box, dimmed: true };
  });
}
