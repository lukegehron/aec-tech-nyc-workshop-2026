"use client";

// Small controls for the Photo → Art card: a segmented toggle, a labelled
// slider, and the RGB colour picker with its eyedropper button.

import { Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { hexToRgb, rgbToHex } from "./convert";

export function Segmented({ value, options, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-md border p-0.5">
      {options.map(([v, label]) => (
        <Button
          key={v}
          size="sm"
          variant={value === v ? "secondary" : "ghost"}
          className="h-7 px-2.5 text-xs"
          onClick={() => onChange(v)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

export function LabeledSlider({ label, value, min, max, step = 1, onChange, format = (v) => v }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        min={min}
        max={max}
        step={step}
      />
      <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {format(value)}
      </span>
    </div>
  );
}

// RGB picker: native swatch + R/G/B sliders + hex field + eyedropper button.
export function RgbPicker({ label, value, onChange, onEyedrop, dropping }) {
  const rgb = hexToRgb(value);
  const set = (channel) => (v) => onChange(rgbToHex({ ...rgb, [channel]: v }));
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour`}
          className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="text-xs font-medium">{label}</span>
        <input
          key={value}
          defaultValue={value}
          onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && onChange(e.target.value)}
          className="ml-auto w-20 rounded border bg-background px-1.5 py-0.5 font-mono text-xs"
          aria-label={`${label} hex`}
        />
        <Button
          size="icon"
          variant={dropping ? "secondary" : "ghost"}
          className="size-7"
          aria-label={`Eyedropper for ${label}`}
          title="Eyedropper — pick a colour from the screen or the images"
          onClick={onEyedrop}
        >
          <Pipette className="size-3.5" />
        </Button>
      </div>
      {["r", "g", "b"].map((ch) => (
        <LabeledSlider
          key={ch}
          label={ch.toUpperCase()}
          value={rgb[ch]}
          min={0}
          max={255}
          onChange={set(ch)}
        />
      ))}
    </div>
  );
}
