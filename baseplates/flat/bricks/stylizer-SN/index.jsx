"use client";

// Image stylizer: upload a picture (or use the sample) and get it back in eight
// art styles, all computed in your browser — nothing is uploaded anywhere.
// The intensity slider changes every style at once; each tile can be saved
// as a PNG. The image is not persisted (it would overflow localStorage).

import { useDeferredValue, useState } from "react";
import { STYLES } from "./filters";
import { MAX_W, drawSample } from "./helpers";
import { Tile } from "./Tile";

function StylizerCard({ expanded }) {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0.5);
  const [only, setOnly] = useState(null);
  const [error, setError] = useState("");
  const deferred = useDeferredValue(amount);

  function load(drawable, w, h, label) {
    const scale = Math.min(1, MAX_W / w);
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(drawable, 0, 0, cw, ch);
    setSrc(ctx.getImageData(0, 0, cw, ch));
    setName(label);
    setError("");
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      load(img, img.naturalWidth, img.naturalHeight, file.name);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Couldn't read that image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function useSample() {
    const canvas = document.createElement("canvas");
    drawSample(canvas);
    load(canvas, canvas.width, canvas.height, "sample landscape");
  }

  const shown = only ? STYLES.filter((s) => s.key === only) : STYLES;
  const btn = "rounded-md border bg-background px-2.5 py-1 hover:bg-muted";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="cursor-pointer rounded-md border border-baseplate bg-baseplate px-2.5 py-1 font-medium text-white hover:opacity-90">
          Upload image
          <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
        </label>
        <button type="button" onClick={useSample} className={btn}>
          Use sample
        </button>
        <label className="ml-2 flex items-center gap-1.5 text-muted-foreground">
          Intensity
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-28"
          />
          <span className="w-8 tabular-nums text-foreground">{Math.round(amount * 100)}%</span>
        </label>
        {only && (
          <button type="button" onClick={() => setOnly(null)} className={btn}>
            Show all
          </button>
        )}
        <span className="ml-auto truncate text-muted-foreground">{name}</span>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {!src ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p>Upload an image to see it in eight styles.</p>
          <p className="text-xs">Pencil · ink · pop art · duotone · neon · pixel · halftone · watercolor</p>
        </div>
      ) : (
        <div className={`grid gap-2 ${only ? "grid-cols-1" : expanded ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"}`}>
          {shown.map((s) => (
            <div key={s.key} className="relative">
              <Tile style={s} src={src} amount={deferred} big={Boolean(only)} />
              {!only && (
                <button
                  type="button"
                  aria-label={`Enlarge ${s.label}`}
                  onClick={() => setOnly(s.key)}
                  className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/80"
                >
                  Enlarge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const stylizerSN = {
  id: "stylizer-SN",
  label: "Image stylizer",
  cards: [
    {
      id: "image-stylizer",
      label: "Image stylizer",
      order: 98,
      span: 3,
      hint: "upload · eight art styles",
      Card: StylizerCard,
    },
  ],
};
