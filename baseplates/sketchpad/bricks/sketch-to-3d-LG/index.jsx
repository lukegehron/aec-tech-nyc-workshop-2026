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
 * Capture the p5 pad and send it to Hunyuan3D (via fal). The GLB is loaded
 * with three's GLTFLoader in an effect — not drei's suspending useGLTF —
 * so the WebGL canvas isn't torn down on first load.
 */

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);

  const generate = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setModelUrl(null);
    try {
      const imageUrl = getSketchDataUrl();
      const response = await fetch("/api/fal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "fal-ai/hunyuan3d-v3/sketch-to-3d",
          input: {
            input_image_url: imageUrl,
            prompt: prompt.trim() || "a 3D object from this sketch",
            face_count: 40000,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Request failed.");
      const glb = payload.data?.model_glb?.url || payload.data?.model_urls?.glb?.url;
      if (!glb) throw new Error("Hunyuan didn't return a GLB.");
      setModelUrl(glb);
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Box className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium">Sketch to 3D</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Draw on the pad, describe material and colour, and Hunyuan3D (via fal)
        returns a GLB you can orbit.
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
        {busy ? "Sculpting…" : "Generate 3D"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
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
