"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { PanelsTopLeft, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { curtainWallActiveAtom, curtainWallParamsAtom, curtainWallsAtom } from "./atoms";
import { gridFor } from "./geometry";

function ParamSlider({ label, value, min, max, step, onChange, readout }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>{label}</span>
      <Slider
        className="w-20"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        aria-label={label}
      />
      <span className="w-12 font-mono tabular-nums text-foreground">{readout}</span>
    </div>
  );
}

export function CurtainWallToolbar() {
  const [active, setActive] = useAtom(curtainWallActiveAtom);
  const [walls, setWalls] = useAtom(curtainWallsAtom);
  const [params, setParams] = useAtom(curtainWallParamsAtom);

  // Esc stops placing, like the other placement tools.
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActive(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, setActive]);

  const set = (key) => (value) => setParams((prev) => ({ ...prev, [key]: value }));

  // Targets get rounded to fit, so report the bay you actually got on the
  // most recent wall, and the panel count across all of them.
  const last = walls.at(-1);
  const grid = last ? gridFor(last, params) : null;
  const panels = walls.reduce((sum, w) => {
    const g = gridFor(w, params);
    return sum + g.bays * g.rows;
  }, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => setActive(!active)}
        title="Click a vertical face to clad it with a curtain wall. Esc stops placing."
      >
        <PanelsTopLeft className="size-3.5" />
        Curtain wall
      </Button>

      {active || walls.length ? (
        <>
          <ParamSlider
            label="Mullions"
            value={params.mullionSpacing}
            min={0.6}
            max={4}
            step={0.1}
            onChange={set("mullionSpacing")}
            readout={`${params.mullionSpacing.toFixed(1)} m`}
          />
          <ParamSlider
            label="Transoms"
            value={params.transomSpacing}
            min={1}
            max={6}
            step={0.1}
            onChange={set("transomSpacing")}
            readout={`${params.transomSpacing.toFixed(1)} m`}
          />
          <ParamSlider
            label="Profile"
            value={params.mullionSize}
            min={0.04}
            max={0.4}
            step={0.01}
            onChange={set("mullionSize")}
            readout={`${Math.round(params.mullionSize * 1000)} mm`}
          />

          <span className="px-1 font-mono text-xs tabular-nums text-muted-foreground">
            {grid
              ? `${walls.length} wall${walls.length === 1 ? "" : "s"} · ${panels} panels · bay ${grid.bayWidth.toFixed(2)} × ${grid.rowHeight.toFixed(2)} m`
              : "click a vertical face"}
          </span>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            disabled={!walls.length}
            onClick={() => setWalls((prev) => prev.slice(0, -1))}
            title="Remove the last curtain wall"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            disabled={!walls.length}
            onClick={() => setWalls([])}
            title="Remove all curtain walls"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  );
}
