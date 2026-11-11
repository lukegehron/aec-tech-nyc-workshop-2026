import * as THREE from "three";

/**
 * Parsing a big .3dm, with the failure modes made visible.
 *
 * `Rhino3dmLoader` parses in a Web Worker running rhino3dm's WebAssembly build
 * (capped at 2 GB). Two things make a large file fail badly with the stock
 * loader: it never listens for the worker's `error` event, so a crashed worker
 * leaves the promise pending forever; and when the parser does report a
 * failure it rejects with a message object (`{ type, id, error }`), so
 * `err.message` is empty. This file fixes both, without editing the loader.
 */

const LIBRARY_PATH = "/wasm/rhino3dm/"; // served locally — never a CDN

export const WARN_BYTES = 100 * 1024 * 1024;
// Past this many meshes a shadow-casting model drags the frame rate down.
const SHADOW_MESH_LIMIT = 400;

export const formatBytes = (n) =>
  n >= 1024 ** 3
    ? `${(n / 1024 ** 3).toFixed(1)} GB`
    : `${Math.round(n / 1024 ** 2)} MB`;

/** Turn whatever the loader rejected with into a sentence a person can use. */
export function explain(err) {
  const inner = err?.error ?? err;
  const raw =
    typeof inner === "string" ? inner : inner?.message || err?.message || "";
  const name = inner?.name ?? "";
  if (/memory|alloc|abort|RangeError|array buffer/i.test(`${name} ${raw}`)) {
    return "Ran out of memory. Reduce the file in Rhino (SaveSmall, purge, hide or delete what you don't need) and try again.";
  }
  return (
    raw ||
    "Rhino couldn't read that file and gave no details. Check the browser console; the file may be from a newer Rhino than this viewer supports."
  );
}

/** Reads and parses `file`; `onPhase("reading" | "parsing")` reports progress. */
export async function parse3dm(file, onPhase) {
  onPhase("reading");
  let buffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new Error(
      "The browser couldn't load that file into memory. Close other tabs, or reduce the file in Rhino.",
    );
  }
  if (buffer.byteLength === 0) throw new Error("That file is empty.");

  onPhase("parsing");
  const { Rhino3dmLoader } = await import(
    "three/examples/jsm/loaders/3DMLoader.js"
  );
  const loader = new Rhino3dmLoader();
  loader.setLibraryPath(LIBRARY_PATH);
  loader.setWorkerLimit(1); // one file, one worker — don't pay for four heaps

  let watch;
  try {
    return await new Promise((resolve, reject) => {
      // The workers are created after the library loads, so poll for them and
      // listen for the crash events the loader ignores.
      const watched = new WeakSet();
      watch = setInterval(() => {
        for (const worker of loader.workerPool) {
          if (watched.has(worker)) continue;
          watched.add(worker);
          worker.addEventListener("error", (event) =>
            reject(new Error(event.message || "The parser crashed, usually from running out of memory.")),
          );
          worker.addEventListener("messageerror", () =>
            reject(new Error("The parser's result was too large to send back.")),
          );
        }
      }, 100);
      loader.parse(buffer, resolve, reject);
    });
  } finally {
    clearInterval(watch);
    loader.dispose();
  }
}

/** Frees the GPU memory behind a loaded model. Nobody else will. */
export function disposeModel(object) {
  object?.traverse((node) => {
    node.geometry?.dispose();
    const material = node.material;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
}

export function measureModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  let meshCount = 0;
  object.traverse((node) => {
    if (node.isMesh) meshCount += 1;
  });
  const shadows = meshCount <= SHADOW_MESH_LIMIT;
  object.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = shadows;
    node.receiveShadow = shadows;
  });
  return { box, size, center, meshCount, shadows };
}
