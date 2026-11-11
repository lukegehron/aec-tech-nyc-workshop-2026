"use client";

// Material viewer: upload PBR texture maps (albedo, normal, roughness, metalness,
// AO, height) and see them on different shapes under different lighting, with
// roughness / metalness / tiling controls. Everything stays in the browser.
// Textures can't be saved (too big for localStorage); the settings are.

import { useEffect, useRef, useState } from "react";
import { SRGBColorSpace, TextureLoader } from "three";
import { useCardState } from "../../storage";
import { Controls, DEFAULT_LIGHT, DEFAULT_MATERIAL, DEFAULT_TILING } from "./Controls";
import { MapSlots, slotFor } from "./maps";
import { makeSample } from "./samples";
import { MaterialScene } from "./scene";

const loader = new TextureLoader();

function MaterialCard({ expanded }) {
  const [shape, setShape] = useCardState("material-SN-shape", "sphere");
  const [light, setLight] = useCardState("material-SN-light", DEFAULT_LIGHT);
  const [m, setM] = useCardState("material-SN-material", DEFAULT_MATERIAL);
  const [tiling, setTiling] = useCardState("material-SN-tiling", DEFAULT_TILING);
  const [linked, setLinked] = useCardState("material-SN-linked", true);
  const [spin, setSpin] = useCardState("material-SN-spin", true);
  const [urls, setUrls] = useState({});
  const [textures, setTextures] = useState({});
  const [note, setNote] = useState("");
  const owned = useRef(new Set()); // blob: URLs we created, to revoke later

  useEffect(() => {
    const set = owned.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function putSlot(key, url, isBlob) {
    if (isBlob) owned.current.add(url);
    loader.load(
      url,
      (tex) => {
        if (key === "map") tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = 8;
        setTextures((cur) => {
          cur[key]?.dispose();
          return { ...cur, [key]: tex };
        });
        setUrls((cur) => {
          const old = cur[key];
          if (old && owned.current.delete(old)) URL.revokeObjectURL(old);
          return { ...cur, [key]: url };
        });
        setNote("");
      },
      undefined,
      () => setNote("Couldn't read one of those images.")
    );
  }

  function addFile(key, file) {
    if (!file.type.startsWith("image/")) {
      setNote(`${file.name} isn't an image.`);
      return;
    }
    putSlot(key, URL.createObjectURL(file), true);
  }

  function addFiles(files) {
    files.forEach((f) => addFile(slotFor(f.name) ?? "map", f));
  }

  function removeSlot(key) {
    setTextures((cur) => {
      cur[key]?.dispose();
      const { [key]: _gone, ...rest } = cur;
      return rest;
    });
    setUrls((cur) => {
      const { [key]: old, ...rest } = cur;
      if (old && owned.current.delete(old)) URL.revokeObjectURL(old);
      return rest;
    });
  }

  function loadSample() {
    const s = makeSample();
    Object.entries(s).forEach(([k, url]) => putSlot(k, url, false));
    setM({ ...DEFAULT_MATERIAL, roughness: 1 });
  }

  const hasAny = Object.keys(textures).length > 0;

  return (
    <div className={`grid gap-3 ${expanded ? "lg:grid-cols-[1fr_20rem]" : "md:grid-cols-[1fr_16rem]"}`}>
      <div className="flex flex-col gap-2">
        <div className={`relative w-full overflow-hidden rounded-md border bg-muted ${expanded ? "h-[65vh]" : "h-96"}`}>
          <MaterialScene shape={shape} textures={textures} tiling={tiling} m={m} light={light} spin={spin} />
          {!hasAny && (
            <p className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs text-muted-foreground">
              Plain grey material — add texture maps or load the sample.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button type="button" onClick={loadSample} className="rounded-md border bg-background px-2.5 py-1 hover:bg-muted">
            Load sample brick
          </button>
          <button
            type="button"
            disabled={!hasAny}
            onClick={() => Object.keys(textures).forEach(removeSlot)}
            className="rounded-md border bg-background px-2.5 py-1 hover:bg-muted disabled:opacity-40"
          >
            Clear maps
          </button>
          <span className="ml-auto text-muted-foreground">drag to orbit · scroll to zoom</span>
        </div>
      </div>

      <div className="flex max-h-[75vh] flex-col gap-2 overflow-y-auto pr-1">
        <MapSlots urls={urls} onFiles={addFiles} onSlotFile={addFile} onRemove={removeSlot} note={note} />
        <Controls
          shape={shape}
          setShape={setShape}
          light={light}
          setLight={setLight}
          m={m}
          setM={setM}
          tiling={tiling}
          setTiling={setTiling}
          linked={linked}
          setLinked={setLinked}
          spin={spin}
          setSpin={setSpin}
        />
      </div>
    </div>
  );
}

export const materialSN = {
  id: "material-SN",
  label: "Material viewer",
  cards: [
    {
      id: "material-viewer",
      label: "Material viewer",
      order: 100,
      span: 3,
      hint: "texture maps · lighting · shapes · tiling",
      Card: MaterialCard,
    },
  ],
};
