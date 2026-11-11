"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { Eye, EyeOff, Footprints, RotateCw, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { stairActiveAtom, stairParamsAtom, stairsAtom } from "./atoms";
import { blondel, stairBlocks } from "./geometry";

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

const mm = (m) => `${Math.round(m * 1000)} mm`;

export function StairToolbar({ data }) {
  const [active, setActive] = useAtom(stairActiveAtom);
  const [stairs, setStairs] = useAtom(stairsAtom);
  const [params, setParams] = useAtom(stairParamsAtom);

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

  // Report on the most recent stair, or on the first building before any are
  // placed, so the numbers mean something the moment the tool is armed.
  const last = stairs.at(-1);
  const subject = last ?? data.buildings[0];
  const { storeys, footprint } = stairBlocks(subject.floors, params);
  const risers = storeys.map((s) => s.riser);
  const worst = risers.length ? Math.max(...risers) : 0;
  const comfort = blondel(worst, params.tread);
  const totalRisers = storeys.reduce((n, s) => n + s.risers, 0);
  const riserRange =
    risers.length && Math.max(...risers) - Math.min(...risers) > 0.0005
      ? `${mm(Math.min(...risers))}–${mm(worst)}`
      : mm(worst);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => setActive(!active)}
        title="Click inside a building to place a switchback stair from grade to the top floor. Esc stops placing."
      >
        <Footprints className="size-3.5" />
        Stair
      </Button>

      {active || stairs.length ? (
        <>
          <ParamSlider
            label="Riser ≤"
            value={params.maxRiser}
            min={0.12}
            max={0.22}
            step={0.005}
            onChange={set("maxRiser")}
            readout={mm(params.maxRiser)}
          />
          <ParamSlider
            label="Tread"
            value={params.tread}
            min={0.22}
            max={0.4}
            step={0.005}
            onChange={set("tread")}
            readout={mm(params.tread)}
          />
          <ParamSlider
            label="Width"
            value={params.width}
            min={0.9}
            max={2}
            step={0.05}
            onChange={set("width")}
            readout={`${params.width.toFixed(2)} m`}
          />

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            onClick={() => setParams((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
            title={`Rotate stairs 90° (now ${params.rotation}°)`}
          >
            <RotateCw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant={params.toRoof ? "secondary" : "ghost"}
            className="h-7 px-2 text-xs"
            onClick={() => setParams((prev) => ({ ...prev, toRoof: !prev.toRoof }))}
            title="Also climb from the top floor to the roof"
          >
            Roof
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            onClick={() => setParams((prev) => ({ ...prev, xray: !prev.xray }))}
            title={params.xray ? "X-ray on: stairs draw through the massing" : "X-ray off: stairs hide inside the massing"}
          >
            {params.xray ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </Button>

          <span
            className="px-1 font-mono text-xs tabular-nums text-muted-foreground"
            title="Actual riser after dividing each storey evenly · total risers · 2R + G comfort check (550–700 mm) · plan footprint"
          >
            {last ? `${last.buildingName} · ` : "click inside a building · "}
            R {riserRange} · {totalRisers} risers ·{" "}
            <span className={comfort.ok ? undefined : "text-destructive"}>
              2R+G {mm(comfort.value)}
            </span>{" "}
            · {footprint[0].toFixed(2)} × {footprint[1].toFixed(2)} m
          </span>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            disabled={!stairs.length}
            onClick={() => setStairs((prev) => prev.slice(0, -1))}
            title="Remove the last stair"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 px-0"
            disabled={!stairs.length}
            onClick={() => setStairs([])}
            title="Remove all stairs"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  );
}
