"use client";

/**
 * Cross-baseplate artifact handoff. Bricks agree on `kind` and payload
 * shape; they never import each other.
 *
 *   const { artifacts, publish, update } = useArtifacts({ kind: "design-option" });
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { atom, getDefaultStore } from "jotai";

const localArtifactsAtom = atom([]);
const store = getDefaultStore();

let seedPromise = null;

function loadSeeds() {
  if (!seedPromise) {
    seedPromise = fetch("/sample-data/artifacts/seed.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        const existing = store.get(localArtifactsAtom);
        if (existing.length > 0) return existing;
        const seeded = (Array.isArray(rows) ? rows : []).map((row) => ({
          ...row,
          id: row.id ?? `seed-${row.kind}-${row.label}`,
          createdAt: row.createdAt ?? Date.now(),
          updatedAt: row.updatedAt ?? Date.now(),
        }));
        store.set(localArtifactsAtom, seeded);
        return seeded;
      })
      .catch(() => store.get(localArtifactsAtom));
  }
  return seedPromise;
}

function subscribeLocal(onStoreChange) {
  return store.sub(localArtifactsAtom, onStoreChange);
}

function getLocalSnapshot() {
  return store.get(localArtifactsAtom);
}

function publishLocal(entry) {
  const now = Date.now();
  const row = {
    id: entry.id ?? `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
    baseplateId: entry.baseplateId,
    brickId: entry.brickId,
    kind: entry.kind,
    label: entry.label ?? entry.kind,
    data: entry.data ?? {},
    createdAt: entry.createdAt ?? now,
    updatedAt: now,
  };
  const prev = store.get(localArtifactsAtom);
  const next = [row, ...prev.filter((a) => a.id !== row.id)];
  store.set(localArtifactsAtom, next);
  return row;
}

function updateLocal(artifactId, patch) {
  const prev = store.get(localArtifactsAtom);
  const next = prev.map((a) =>
    a.id === artifactId
      ? { ...a, ...patch, data: patch.data ?? a.data, updatedAt: Date.now() }
      : a
  );
  store.set(localArtifactsAtom, next);
  return next.find((a) => a.id === artifactId) ?? null;
}

function filterRows(all, filter) {
  const kinds = filter.kinds ?? (filter.kind ? [filter.kind] : null);
  let rows = all;
  if (kinds?.length) rows = rows.filter((a) => kinds.includes(a.kind));
  if (filter.brickId) rows = rows.filter((a) => a.brickId === filter.brickId);
  return [...rows].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/**
 * @param {{ kind?: string, kinds?: string[], brickId?: string }} [filter]
 */
export function useArtifacts(filter = {}) {
  useEffect(() => {
    loadSeeds();
  }, []);

  const localAll = useSyncExternalStore(
    subscribeLocal,
    getLocalSnapshot,
    getLocalSnapshot
  );

  const artifacts = filterRows(localAll, filter);
  const publish = useCallback(async (entry) => publishLocal(entry), []);
  const update = useCallback(
    async (artifactId, patch) => updateLocal(artifactId, patch),
    []
  );

  return {
    artifacts,
    latest: artifacts[0] ?? null,
    publish,
    update,
  };
}

/**
 * Non-hook snapshot for slash commands and other non-React call sites.
 * Kicks off seed load when the local store is still empty.
 */
export async function peekArtifacts(filter = {}) {
  await loadSeeds();
  return filterRows(store.get(localArtifactsAtom), filter);
}
