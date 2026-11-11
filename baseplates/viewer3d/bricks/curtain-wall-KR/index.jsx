"use client";

import { CurtainWallScene } from "./Scene3d";
import { CurtainWallToolbar } from "./Toolbar";

/**
 * CURTAIN WALL — click a vertical face, get a mullion-gridded glazed wall.
 *
 * A TOOL, not a view mode: there is no `buildBoxes`, so it lives in the toolbar
 * and works over whichever mode is showing (massing, floors, spaces, or an
 * imported .3dm).
 *
 * Picking follows the measure brick: a plain DOM listener on the canvas that
 * casts its own ray, so no building has to opt in and the boxes'
 * `stopPropagation()` can't swallow the click. A hit counts as vertical when
 * its world normal is within about 11° of horizontal. The wall is sized to the
 * hit object's bounds along that face, so in massing one click clads a whole
 * side of a building, and in floors mode it clads one floor plate.
 *
 * The grid is parametric. Mullion and transom spacing are targets: the bay
 * count is rounded so mullions land exactly on both corners, and the toolbar
 * shows the bay you actually got. Moving a slider re-grids every placed wall.
 *
 * Z-up throughout. Nothing here suspends, and every mesh this brick draws opts
 * out of raycasting, so you can't place a wall on a wall.
 */
export const curtainWallKR = {
  id: "curtain-wall-KR",
  label: "Curtain wall",
  hint: "Click a vertical face to clad it; mullion and transom spacing are parametric",
  order: 70,
  Toolbar: CurtainWallToolbar,
  Scene3d: CurtainWallScene,
};
