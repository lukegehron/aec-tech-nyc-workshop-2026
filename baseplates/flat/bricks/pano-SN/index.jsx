"use client";

// 360° image uploader: pick an equirectangular (2:1) photo and look around
// inside it. The image stays in this browser tab (object URL) — nothing is
// uploaded anywhere, and it is not persisted across reloads.

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SRGBColorSpace, TextureLoader } from "three";

function Sphere({ texture }) {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 64, 48]} />
      <meshBasicMaterial map={texture} side={2} toneMapped={false} />
    </mesh>
  );
}

function PanoCard({ expanded }) {
  const inputRef = useRef(null);
  const [url, setUrl] = useState(null);
  const [name, setName] = useState("");
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState("");

  // Load the texture from the object URL with a plain (non-suspending) loader.
  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    let loaded = null;
    new TextureLoader().load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = SRGBColorSpace;
        loaded = tex;
        setError("");
        setTexture(tex);
      },
      undefined,
      () => {
        if (!cancelled) setError("Couldn't read that image.");
      },
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
      URL.revokeObjectURL(url);
    };
  }, [url]);

  function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setTexture(null);
    setName(file.name);
    setError("");
    setUrl(URL.createObjectURL(file));
  }

  function clear() {
    setUrl(null);
    setTexture(null);
    setName("");
    setError("");
  }

  return (
    <div className="flex h-full min-h-48 flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-baseplate px-3 py-1 text-xs font-medium text-white"
        >
          {url ? "Replace 360° image" : "Upload 360° image"}
        </button>
        {url && (
          <button
            type="button"
            onClick={clear}
            className="rounded-md border px-3 py-1 text-xs"
          >
            Clear
          </button>
        )}
        <span className="truncate text-xs text-muted-foreground">{name}</span>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div
        className={`relative min-h-0 flex-1 overflow-hidden rounded-md border bg-muted ${
          expanded ? "min-h-96" : "min-h-48"
        }`}
      >
        {texture ? (
          <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
            <Sphere texture={texture} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.4}
              enableDamping
            />
          </Canvas>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground"
          >
            {url && !error
              ? "Loading…"
              : "Choose an equirectangular (2:1) panorama, then drag to look around."}
          </button>
        )}
      </div>
    </div>
  );
}

export const panoSN = {
  id: "pano-SN",
  label: "360° image uploader",
  cards: [
    {
      id: "pano-360",
      label: "360° image",
      order: 91,
      span: 2,
      hint: "upload · drag to look around",
      Card: PanoCard,
    },
  ],
};
