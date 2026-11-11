"use client";

import { createContext, useContext } from "react";

/**
 * True when a baseplate Screen (or Host) is mounted as a tile on Flat.
 * Standalone routes stay false, so each surface keeps its own filter row.
 * On the board, SceneFilters is the one shared building / floor control.
 */
export const OnBoardContext = createContext(false);

export function useOnBoard() {
  return useContext(OnBoardContext);
}
