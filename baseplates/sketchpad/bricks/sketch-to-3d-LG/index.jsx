"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

/**
 * Capture the p5 pad and turn it into a GLB, via fal, in two steps:
 *
 *   1. RENDER_MODEL  sketch + prompt → a clean single-object render on white
 *   2. MESH_MODEL    that render → Hunyuan3D GLB
 *
 * fal deprecated the one-shot `fal-ai/hunyuan3d-v3/sketch-to-3d` endpoint, so
 * the "read the sketch" step now happens in an image-edit model first.
 *
 * The GLB is loaded with three's GLTFLoader in an effect — not drei's
 * suspending useGLTF — so the WebGL canvas isn't torn down on first load.
 */

const RENDER_MODEL = "fal-ai/nano-banana/edit";
const MESH_MODEL = "fal-ai/hunyuan3d-v3/image-to-3d";

/** POST one fal call through the server route and return `data`. */
async function runFal(model, input) {
  const response = await fetch("/api/fal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, input }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${model}: ${payload.error || `Request failed (${response.status}).`}`);
  }
  return payload.data;
}

function ModelViewer({ url }) {
  const [object, setObject] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (!cancelled) setObject(gltf.scene);
      },
      undefined,
      (err) => {
        if (!cancelled) setLoadError(String(err?.message ?? err));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loadError) {
    return <p className="text-xs text-destructive">{loadError}</p>;
  }
  if (!object) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-4" />
        Loading model…
      </div>
    );
  }

  return (
    <div className="h-64 overflow-hidden rounded-md border bg-muted/30">
      <Canvas camera={{ position: [2.4, 1.8, 2.4], fov: 45 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 3]} intensity={1.15} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <Center>
          <primitive object={object} />
        </Center>
        <OrbitControls makeDefault enablePan={false} />
      </Canvas>
    </div>
  );
}

function SketchTo3dPanel({ getSketchDataUrl }) {
  const [prompt, setPrompt] = useState("a small building, clay material");
  const [stage, setStage] = useState(null);
  const [error, setError] = useState(null);
  const [renderUrl, setRenderUrl] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const busy = stage !== null;

  const generate = async () => {
    if (busy) return;
    setStage("Rendering sketch…");
    setError(null);
    setRenderUrl(null);
    setModelUrl(null);
    try {
      const sketchUrl = getSketchDataUrl();
      const subject = prompt.trim() || "a 3D object";

      // 1. Sketch → clean object render the mesher can read.
      const rendered = await runFal(RENDER_MODEL, {
        prompt:
          `Turn this line sketch into a single 3D object: ${subject}. ` +
          "Keep the sketch's shape and proportions. Three-quarter view, " +
          "whole object in frame, plain white background, soft studio lighting, no text.",
        image_urls: [sketchUrl],
        num_images: 1,
        output_format: "png",
      });
      const imageUrl = rendered?.images?.[0]?.url;
      if (!imageUrl) throw new Error("The render step didn't return an image.");
      setRenderUrl(imageUrl);

      // 2. Render → GLB.
      setStage("Sculpting mesh…");
      const meshed = await runFal(MESH_MODEL, {
        input_image_url: imageUrl,
        face_count: 40000,
      });
      const glb = meshed?.model_glb?.url || meshed?.model_urls?.glb?.url;
      if (!glb) throw new Error("Hunyuan didn't return a GLB.");
      setModelUrl(glb);
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setStage(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Box className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium">Sketch to 3D</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Draw on the pad and describe material and colour. fal renders the
        sketch, then Hunyuan3D turns that render into a GLB you can orbit.
      </p>
      <Input
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="colour, category, material"
        onKeyDown={(event) => {
          if (event.key === "Enter") generate();
        }}
      />
      <Button size="sm" onClick={generate} disabled={busy}>
        {busy ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
        {busy ? stage : "Generate 3D"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {renderUrl && !modelUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote fal URL, preview only
        <img src={renderUrl} alt="Render of the sketch sent to Hunyuan3D" className="rounded-md border" />
      ) : null}
      {modelUrl ? <ModelViewer key={modelUrl} url={modelUrl} /> : null}
      {modelUrl ? (
        <Button variant="outline" size="sm" nativeButton={false} render={<a href={modelUrl} download="sketch.glb" />}>
          <Download className="size-4" />
          Download GLB
        </Button>
      ) : null}
    </div>
  );
}

export const sketchTo3dBrick = {
  id: "sketch-to-3d-LG",
  label: "Sketch to 3D",
  panels: [{ id: "sketch-to-3d", label: "Sketch to 3D", order: 10, Panel: SketchTo3dPanel }],
};
