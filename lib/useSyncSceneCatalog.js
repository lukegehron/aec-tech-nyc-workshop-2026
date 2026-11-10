"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { catalogFromProject, sceneCatalogAtom } from "./scene";

/**
 * Call once in a remix Screen after `useProject()`:
 *
 *   const { data } = useProject();
 *   useSyncSceneCatalog(data);
 *
 * Lives in its own module so `lib/scene.js` stays hook-free and safe to
 * import from atom files.
 */
export function useSyncSceneCatalog(project) {
  const setCatalog = useSetAtom(sceneCatalogAtom);
  useEffect(() => {
    setCatalog(catalogFromProject(project));
  }, [project, setCatalog]);
}
