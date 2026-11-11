"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { FileBox, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  largeErrorAtom,
  largeModelAtom,
  largePendingAtom,
  largePhaseAtom,
} from "./atoms";
import {
  WARN_BYTES,
  disposeModel,
  explain,
  formatBytes,
  measureModel,
  parse3dm,
} from "./parse";

/**
 * LARGE .3DM IMPORT — a separate importer for big Rhino files.
 *
 * `rhino-import-XX` is the starter and stays as it is. This one differs in
 * what it tells you: which stage it is in (reading the file, then parsing it),
 * a heads-up before a heavy file, a readable reason when it fails, and it
 * catches a crashed parser instead of hanging. It also parses with a single
 * worker and drops shadows on very heavy models.
 *
 * What it cannot do is lift the ceiling: rhino3dm's WebAssembly heap is capped
 * at 2 GB and the browser tab has its own limit, so a file that needs more than
 * that has to be reduced in Rhino first. The error message says so.
 *
 * Rhino is Z-up and so is this baseplate, so the model needs no rotation.
 */

function LargeScene() {
  const model = useAtomValue(largeModelAtom);
  const store = useStore();

  // Frame the import once when it arrives; the dependency is the model itself,
  // so this cannot fight the user for the camera afterwards.
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
  return <primitive object={model.object} />;
}

function LargeToolbar() {
  const [model, setModel] = useAtom(largeModelAtom);
  const [phase, setPhase] = useAtom(largePhaseAtom);
  const [error, setError] = useAtom(largeErrorAtom);
  const [pending, setPending] = useAtom(largePendingAtom);

  const clear = () => {
    disposeModel(model?.object);
    setModel(null);
    setError(null);
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // let the same file be picked twice in a row
    if (!file) return;

    setError(null);
    setPending({ name: file.name, bytes: file.size });
    try {
      const object = await parse3dm(file, setPhase);
      const stats = measureModel(object);
      disposeModel(model?.object);
      setModel({ object, name: file.name, bytes: file.size, ...stats });
    } catch (err) {
      console.error("large-3dm-CD:", err);
      setError(explain(err));
    } finally {
      setPhase("idle");
      setPending(null);
    }
  };

  const busy = phase !== "idle";

  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      <Button
        size="sm"
        variant="ghost"
        nativeButton={false}
        render={<label />}
        className="h-7 cursor-pointer gap-1.5 px-2 text-xs"
        title="Load a large Rhino .3dm file — shows progress and readable errors"
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileBox className="size-3.5" />
        )}
        {phase === "reading"
          ? "Reading file…"
          : phase === "parsing"
            ? "Parsing…"
            : "Import large .3dm"}
        <input
          type="file"
          accept=".3dm"
          className="sr-only"
          onChange={onFile}
          disabled={busy}
        />
      </Button>

      {busy && pending ? (
        <span className="px-1 text-xs text-muted-foreground">
          {pending.name} · {formatBytes(pending.bytes)}
          {pending.bytes >= WARN_BYTES
            ? " — large file, this can take a minute or more. Leave the tab open."
            : ""}
        </span>
      ) : error ? (
        <>
          <span
            role="alert"
            className="max-w-md truncate px-1 text-xs text-destructive"
            title={error}
          >
            {error}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            onClick={() => setError(null)}
            title="Dismiss"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : model ? (
        <>
          <span className="px-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{model.name}</span>
            <span className="ml-1.5 font-mono tabular-nums">
              {formatBytes(model.bytes)} · {model.meshCount.toLocaleString()} meshes
              {model.shadows ? "" : " · shadows off"}
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

export const large3dmBrick = {
  id: "large-3dm-CD",
  label: "Import large .3dm",
  hint: "Load a big Rhino file with progress and readable errors",
  order: 65,
  Toolbar: LargeToolbar,
  Scene3d: LargeScene,
};
