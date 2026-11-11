"use client";

import { useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Ban } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { applyStyleAtom, selectedElementsAtom, styleAtom } from "../../atoms";
import { DASH_PATTERNS } from "../../model";

// A restrained drafting palette — line weights read better than hues do.
const SWATCHES = ["#1f2937", "#64748b", "#b91c1c", "#1d4ed8", "#047857", "#b45309", "#7c3aed"];

function Swatch({ color, active, onClick, title }) {
  return (
    <button
      type="button"
      title={title ?? color}
      onClick={onClick}
      className={cn(
        "size-6 rounded-md border transition-transform hover:scale-110",
        active ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "border-border"
      )}
      style={{ backgroundColor: color === "none" ? "transparent" : color }}
    >
      {color === "none" ? <Ban className="size-4 text-muted-foreground" /> : null}
    </button>
  );
}

function StylePanel() {
  const style = useAtomValue(styleAtom);
  const selected = useAtomValue(selectedElementsAtom);
  const applyStyle = useSetAtom(applyStyleAtom);

  // A slider drag fires dozens of changes. Push one history entry on the
  // first, then keep quiet until the pointer is released.
  const dragging = useRef(false);
  const slide = (patch) => {
    applyStyle(patch, { commit: !dragging.current });
    dragging.current = true;
  };
  const endSlide = () => {
    dragging.current = false;
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-xs text-muted-foreground">
        {selected.length
          ? `Editing ${selected.length} selected element${selected.length === 1 ? "" : "s"}.`
          : "Nothing selected — these become the defaults for the next thing you draw."}
      </p>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Stroke</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {SWATCHES.map((color) => (
            <Swatch
              key={color}
              color={color}
              active={style.stroke === color}
              onClick={() => applyStyle({ stroke: color })}
            />
          ))}
          <input
            type="color"
            aria-label="Custom stroke colour"
            value={style.stroke === "none" ? "#1f2937" : style.stroke}
            onChange={(event) => applyStyle({ stroke: event.target.value })}
            className="size-6 cursor-pointer rounded-md border border-border bg-transparent p-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Fill</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          <Swatch
            color="none"
            title="No fill"
            active={style.fill === "none"}
            onClick={() => applyStyle({ fill: "none" })}
          />
          {["#e2e8f0", "#fecaca", "#bfdbfe", "#bbf7d0", "#fde68a"].map((color) => (
            <Swatch
              key={color}
              color={color}
              active={style.fill === color}
              onClick={() => applyStyle({ fill: color })}
            />
          ))}
          <input
            type="color"
            aria-label="Custom fill colour"
            value={style.fill === "none" ? "#ffffff" : style.fill}
            onChange={(event) => applyStyle({ fill: event.target.value })}
            className="size-6 cursor-pointer rounded-md border border-border bg-transparent p-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Line weight</Label>
          <span className="font-mono text-xs text-muted-foreground">
            {Math.round(style.strokeWidth)}
          </span>
        </div>
        <Slider
          value={[style.strokeWidth]}
          min={1}
          max={60}
          step={1}
          onValueChange={([value]) => slide({ strokeWidth: value })}
          onValueCommitted={endSlide}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Opacity</Label>
          <span className="font-mono text-xs text-muted-foreground">
            {Math.round(style.opacity * 100)}%
          </span>
        </div>
        <Slider
          value={[Math.round(style.opacity * 100)]}
          min={10}
          max={100}
          step={5}
          onValueChange={([value]) => slide({ opacity: value / 100 })}
          onValueCommitted={endSlide}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">Line type</Label>
        <NativeSelect
          size="sm"
          value={style.dash}
          onChange={(event) => applyStyle({ dash: event.target.value })}
          aria-label="Line type"
        >
          {Object.keys(DASH_PATTERNS).map((key) => (
            <NativeSelectOption key={key} value={key}>
              {key === "none" ? "solid" : key}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}

export const styleBrick = {
  id: "style-XX",
  label: "Style",
  panels: [{ id: "style", label: "Style", order: 10, Panel: StylePanel }],
};
