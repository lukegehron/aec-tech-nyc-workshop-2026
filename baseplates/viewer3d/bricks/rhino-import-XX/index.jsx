"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rhinoModelAtom, rhinoStatusAtom } from "./atoms";

/**
 * RHINO IMPORT — drop a .3dm into the scene.
 *
 * Rhino files are Z-up, and so is this baseplate (see `../../Scene.jsx`), so
 * the imported geometry lands in the right orientation with no fix-up
 * rotation. That is the whole reason the Z-up change was worth making: the
 * alternative is every importer carrying its own -90° about X and every
 * exporter undoing it.
 *
 * `rhino3dm` is a WebAssembly build of the openNURBS kernel. Like `web-ifc`,
 * its runtime is served from `public/wasm/` rather than a CDN — the loader's
 * default `setLibraryPath` points at jsDelivr, and workshop Wi-Fi is not to be
 * trusted. `three/examples/jsm/loaders/3DMLoader.js` fetches `rhino3dm.js` and
 * `rhino3dm.wasm` from that path and runs the parse in a Worker.
 *
 * Both the loader and its wasm are imported dynamically inside the change
 * handler: nothing about this brick may run during SSR, and nothing that
 * suspends may sit inside <Canvas>. See AGENTS.md.
 */

const LIBRARY_PATH = "/wasm/rhino3dm/";

/** Frees the GPU memory behind a loaded model. Nobody else will. */
function disposeModel(object) {
  object?.traverse((node) => {
    node.geometry?.dispose();
    const material = node.material;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
}

async function parse3dm(file) {
  const { Rhino3dmLoader } = await import("three/examples/jsm/loaders/3DMLoader.js");
  const loader = new Rhino3dmLoader();
  loader.setLibraryPath(LIBRARY_PATH);

  const buffer = await file.arrayBuffer();
  try {
    return await new Promise((resolve, reject) => {
      loader.parse(buffer, resolve, reject);
    });
  } finally {
    // Terminates the worker pool. The result is already in hand by here.
    loader.dispose();
  }
}

function measureModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  let meshCount = 0;
  object.traverse((node) => {
    if (!node.isMesh) return;
    meshCount += 1;
    node.castShadow = true;
    node.receiveShadow = true;
  });

  return { size, center, meshCount, box };
}

function RhinoScene() {
  const model = useAtomValue(rhinoModelAtom);
  // `useStore()` rather than `useThree()`: pointing a camera is imperative, and
  // reading the state inside the effect keeps the mutation off a value React
  // handed us during render — which is what the compiler's immutability rule is
  // there to stop. Same reason `z-slice-XX` does it.
  const store = useStore();

  // Frame the import once, when it arrives — the deps are the model itself, so
  // this can't fight the user for the camera afterwards. Rhino models carry
  // real survey coordinates, so an imported file can easily land hundreds of
  // metres from this project's origin; moving it would be a lie, but leaving
  // the camera on the old site makes a good import look like a failed one.
  useEffect(() => {
    if (!model) return;

    const sphere = model.box.getBoundingSphere(new THREE.Sphere());
    if (!Number.isFinite(sphere.radius) || sphere.radius <= 0) return;

    const { camera, controls, invalidate } = store.getState();
    if (!controls) return;

    const distance = sphere.radius * 2.5;
    camera.far = Math.max(camera.far, distance * 10);
    camera.position
      .copy(sphere.center)
      .add(new THREE.Vector3(1, 1, 0.8).normalize().multiplyScalar(distance));
    camera.updateProjectionMatrix();
    controls.target.copy(sphere.center);
    controls.update();
    invalidate();
  }, [model, store]);

  if (!model) return null;
  // No rotation, no scale: Rhino units are metres in a Z-up world, and so are
  // this baseplate's.
  return <primitive object={model.object} />;
}

function RhinoToolbar() {
  const [model, setModel] = useAtom(rhinoModelAtom);
  const [status, setStatus] = useAtom(rhinoStatusAtom);

  const clear = () => {
    disposeModel(model?.object);
    setModel(null);
    setStatus("idle");
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    // Let the same file be picked twice in a row.
    event.target.value = "";
    if (!file) return;

    setStatus("loading");
    try {
      const object = await parse3dm(file);
      const { size, center, meshCount, box } = measureModel(object);
      disposeModel(model?.object);
      setModel({ object, box, name: file.name, size, center, meshCount });
      setStatus("idle");
    } catch (err) {
      setStatus(err?.message ?? "Could not read that .3dm");
    }
  };

  const loading = status === "loading";
  const error = status !== "idle" && status !== "loading" ? status : null;

  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      {/* shadcn here wraps Base UI, so there is no `asChild` — `render` with a
          real <label> plus nativeButton={false} is the documented way to make a
          Button drive a file input. See AGENTS.md. */}
      <Button
        size="sm"
        variant="ghost"
        nativeButton={false}
        render={<label />}
        className="h-7 cursor-pointer gap-1.5 px-2 text-xs"
        title="Load a Rhino .3dm file into the scene"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Box className="size-3.5" />
        )}
        {loading ? "Reading…" : "Import .3dm"}
        <input
          type="file"
          accept=".3dm"
          className="sr-only"
          onChange={onFile}
          disabled={loading}
        />
      </Button>

      {error ? (
        <span className="max-w-48 truncate px-1 text-xs text-destructive" title={error}>
          {error}
        </span>
      ) : model ? (
        <>
          <span className="px-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{model.name}</span>
            <span className="ml-1.5 font-mono tabular-nums">
              {model.meshCount} meshes ·{" "}
              {[model.size.x, model.size.y, model.size.z]
                .map((n) => n.toFixed(1))
                .join(" × ")}{" "}
              m
            </span>
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            onClick={clear}
            title="Remove the imported model"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  );
}

export const rhinoImportBrick = {
  id: "rhino-import-XX",
  label: "Import .3dm",
  hint: "Load Rhino geometry into the scene",
  order: 60,
  Toolbar: RhinoToolbar,
  Scene3d: RhinoScene,
};
