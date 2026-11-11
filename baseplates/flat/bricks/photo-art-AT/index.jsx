"use client";

// Photo → Art — upload a photo, turn it into ASCII art or pixel art, then
// recolour the result with an RGB picker and an eyedropper.
//
// The photo lives only in memory (a data URL would blow localStorage's quota);
// settings and colours survive a reload via `useCardState`.

import { useEffect, useRef, useState } from "react";
import { Copy, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCardState } from "../../storage";
import { pickFromCanvas, render, rgbToHex, sampleImage } from "./convert";
import { LabeledSlider, RgbPicker, Segmented } from "./controls";

const DEFAULTS = {
  mode: "pixel", // "pixel" | "ascii"
  cols: 64,
  levels: 8,
  contrast: 1,
  palette: "original", // "original" | "duotone"
  ink: "#1e1b4b",
  paper: "#f5f3ff",
  invert: false,
};

// Some browsers return "rgb(r, g, b)" from EyeDropper instead of hex.
function toHex(str) {
  if (/^#[0-9a-f]{6}$/i.test(str)) return str;
  const [r = 0, g = 0, b = 0] = (str.match(/\d+/g) ?? []).map(Number);
  return rgbToHex({ r, g, b });
}

function PhotoArtCard({ expanded }) {
  const [settings, setSettings] = useCardState("photo-art-AT", DEFAULTS);
  const s = { ...DEFAULTS, ...settings };
  const update = (patch) => setSettings({ ...s, ...patch });

  const [img, setImg] = useState(null);
  const [ascii, setAscii] = useState("");
  const [dropTarget, setDropTarget] = useState(null); // "ink" | "paper" | null
  const sourceRef = useRef(null);
  const outputRef = useRef(null);

  const onFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = URL.createObjectURL(file);
  };

  // Draw the original photo (the eyedropper can sample it).
  useEffect(() => {
    const c = sourceRef.current;
    if (!img || !c) return;
    c.width = 320;
    c.height = Math.round((img.naturalHeight / img.naturalWidth) * 320);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  }, [img, expanded]);

  // Regenerate the artwork whenever the photo or a setting changes.
  useEffect(() => {
    if (!img || !outputRef.current) return;
    const opts = { ...DEFAULTS, ...settings };
    setAscii(render(outputRef.current, sampleImage(img, opts), opts));
  }, [img, settings, expanded]);

  // Ink/Paper are what recolour the art, so editing one switches to duotone.
  const setColour = (slot, hex) => update({ [slot]: hex, palette: "duotone" });

  const eyedrop = async (slot) => {
    // Native EyeDropper (Chromium/Edge) samples anywhere on screen.
    if ("EyeDropper" in window) {
      try {
        const { sRGBHex } = await new window.EyeDropper().open();
        setColour(slot, toHex(sRGBHex));
      } catch {
        // Esc pressed — nothing to do.
      }
      return;
    }
    // Fallback (Firefox/Safari): the next click on an image picks the colour.
    setDropTarget(dropTarget === slot ? null : slot);
  };

  const onCanvasClick = (e) => {
    if (!dropTarget) return;
    setColour(dropTarget, pickFromCanvas(e.currentTarget, e));
    setDropTarget(null);
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = outputRef.current.toDataURL("image/png");
    a.download = `photo-${s.mode}-art.png`;
    a.click();
  };

  const pickCursor = dropTarget ? "cursor-crosshair" : "";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" nativeButton={false} render={<label />} className="cursor-pointer">
          <Upload className="size-3.5" />
          {img ? "Replace photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </Button>
        <Segmented
          value={s.mode}
          options={[["pixel", "Pixel art"], ["ascii", "ASCII"]]}
          onChange={(mode) => update({ mode })}
        />
        <Segmented
          value={s.palette}
          options={[["original", "Photo colours"], ["duotone", "Ink + paper"]]}
          onChange={(palette) => update({ palette })}
        />
      </div>

      {!img ? (
        <div
          className="flex min-h-40 flex-1 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          drop a photo here, or use Upload
        </div>
      ) : (
        <div className={`grid gap-3 ${expanded ? "md:grid-cols-[1fr_2fr_1fr]" : "sm:grid-cols-[3fr_2fr]"}`}>
          {expanded ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Original</span>
              <canvas
                ref={sourceRef}
                onClick={onCanvasClick}
                className={`w-full rounded-md border ${pickCursor}`}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <canvas
              ref={outputRef}
              onClick={onCanvasClick}
              className={`w-full rounded-md border [image-rendering:pixelated] ${pickCursor}`}
            />
            {dropTarget ? (
              <span className="text-xs text-muted-foreground">
                click an image to pick the {dropTarget} colour
              </span>
            ) : null}
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={download}>
                <Download className="size-3.5" /> PNG
              </Button>
              {s.mode === "ascii" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard?.writeText(ascii)}
                >
                  <Copy className="size-3.5" /> Copy text
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <LabeledSlider
              label="Detail"
              value={s.cols}
              min={16}
              max={s.mode === "ascii" ? 160 : 128}
              onChange={(cols) => update({ cols })}
            />
            <LabeledSlider
              label="Levels"
              value={s.levels}
              min={2}
              max={32}
              onChange={(levels) => update({ levels })}
            />
            <LabeledSlider
              label="Contrast"
              value={s.contrast}
              min={0.5}
              max={2.5}
              step={0.05}
              onChange={(contrast) => update({ contrast })}
              format={(v) => v.toFixed(2)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={s.invert}
                onChange={(e) => update({ invert: e.target.checked })}
              />
              Invert light / dark
            </label>
            <RgbPicker
              label="Ink"
              value={s.ink}
              onChange={(hex) => setColour("ink", hex)}
              onEyedrop={() => eyedrop("ink")}
              dropping={dropTarget === "ink"}
            />
            <RgbPicker
              label="Paper"
              value={s.paper}
              onChange={(hex) => setColour("paper", hex)}
              onEyedrop={() => eyedrop("paper")}
              dropping={dropTarget === "paper"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const photoArtAT = {
  id: "photo-art-AT",
  label: "Photo → Art",
  cards: [
    {
      id: "photo-art",
      label: "Photo → Art",
      order: 60,
      span: 2,
      hint: "ASCII or pixel art · recolour with RGB + eyedropper",
      Card: PhotoArtCard,
    },
  ],
};
