"use client";

import { Suspense, useState } from "react";
import { useAtomValue } from "jotai";
import { P5Canvas } from "@p5-wrapper/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { KitTray } from "@/lib/KitTray";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { bricks, getBrush, kitBrushes } from "./bricks/bricks";
import { sketch } from "./sketch";

/**
 * The BASEPLATE itself.
 *
 * Shell and plumbing: the toolbar, the colour and weight controls, and the p5
 * canvas. The drawing itself happens in `sketch.js`, which delegates every
 * mark to whichever BRICK is selected.
 *
 * Note there is no list of brushes in this file — it loops the registry in
 * `bricks/bricks.js`. Adding a brush means a folder and two lines over there.
 */

const COLORS = ["#111827", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

export default function SketchpadScreen() {
  const hidden = useAtomValue(hiddenBrickKeysAtom);
  const brushes = kitBrushes(hidden);
  const [brushId, setBrushId] = useState(brushes[0]?.id);
  const [color, setColor] = useState(COLORS[0]);
  const [weight, setWeight] = useState(4);
  const [clearSignal, setClearSignal] = useState(0);

  const brush = getBrush(brushId, hidden);

  return (
    <div className="flex flex-col gap-4">
      <KitTray baseplateId="sketchpad" bricks={bricks} />
      <div className="flex flex-wrap items-center gap-2">
        {/* Generated from the brick registry — no list of brushes lives here. */}
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {brushes.map((b) => (
            <Button
              key={b.id}
              size="sm"
              variant={brush.id === b.id ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-xs"
              onClick={() => setBrushId(b.id)}
              title={b.hint}
            >
              {b.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Brush color ${c}`}
              className="size-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "#000" : "transparent",
              }}
            />
          ))}
        </div>

        <div className="flex w-40 items-center gap-2">
          <span className="text-xs text-muted-foreground">Size</span>
          <Slider
            value={[weight]}
            onValueChange={(v) => setWeight(Array.isArray(v) ? v[0] : v)}
            min={1}
            max={24}
            step={1}
          />
          <span className="w-6 text-right font-mono text-xs text-muted-foreground">
            {weight}
          </span>
        </div>

        <Button variant="ghost" onClick={() => setClearSignal((n) => n + 1)}>
          Clear
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-2 overflow-auto p-4">
          <div className="overflow-hidden rounded-md border [&_canvas:not(:last-of-type)]:pointer-events-none [&_canvas:not(:last-of-type)]:hidden">
            {/* P5Canvas is a lazy component, so it needs a Suspense boundary. */}
            <Suspense fallback={<div className="p-4 text-sm">Loading canvas…</div>}>
              <P5Canvas
                sketch={sketch}
                brushId={brush.id}
                color={color}
                weight={weight}
                clearSignal={clearSignal}
              />
            </Suspense>
          </div>
          {/* The active brick describes itself. */}
          <p className="text-xs text-muted-foreground">{brush.hint}</p>
        </CardContent>
      </Card>
    </div>
  );
}
