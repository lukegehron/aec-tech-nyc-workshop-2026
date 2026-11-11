"use client";

// Topography maker: paint a heightmap with brush tools (raise, lower, smooth,
// flatten, rough, terrace). Rendered as a colour map with hillshade, contour
// lines and a water level. Saved per browser (useCardState) when you lift the
// pen; drag on the map to sculpt.

import { useEffect, useRef, useState } from "react";
import { useCardState } from "../../storage";
import { Btn, Slider } from "./controls";
import { DEFAULT_HEIGHTS, GH, GW, PH, PW, TOOLS, applyBrush, generate, render, sample } from "./terrain";

function TopoCard({ expanded }) {
  const [stored, setStored] = useCardState("topo-SN-heights", DEFAULT_HEIGHTS);
  const [tool, setTool] = useCardState("topo-SN-tool", "raise");
  const [radius, setRadius] = useCardState("topo-SN-radius", 8);
  const [strength, setStrength] = useCardState("topo-SN-strength", 5);
  const [hardness, setHardness] = useCardState("topo-SN-hardness", 0.3);
  const [water, setWater] = useCardState("topo-SN-water", 0.25);
  const [contour, setContour] = useCardState("topo-SN-contour", 0.05);
  const [shade, setShade] = useCardState("topo-SN-shade", 1);
  const [live, setLive] = useState(null); // heights during a stroke
  const [cursor, setCursor] = useState(null);
  const canvasRef = useRef(null);
  const painting = useRef(false);
  const liveRef = useRef(null);
  const target = useRef(0.4);

  const heights = live ?? (stored.length === GW * GH ? stored : DEFAULT_HEIGHTS);

  useEffect(() => {
    if (canvasRef.current) render(canvasRef.current, heights, { water, contour, shade });
  }, [heights, water, contour, shade]);

  function toGrid(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    return { gx: fx * GW, gy: fy * GH, px: fx * 100, py: fy * 100 };
  }

  function dab(base, g) {
    const next = applyBrush(base, tool, g.gx, g.gy, radius, strength, hardness, target.current);
    liveRef.current = next;
    setLive(next);
  }

  function onDown(e) {
    const g = toGrid(e);
    painting.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    target.current = sample(heights, g.gx, g.gy);
    dab(heights, g);
  }

  function onMove(e) {
    const g = toGrid(e);
    setCursor(g);
    if (painting.current) dab(liveRef.current ?? heights, g);
  }

  function onUp() {
    if (!painting.current) return;
    painting.current = false;
    if (liveRef.current) setStored(liveRef.current.map((v) => Math.round(v * 1000) / 1000));
    liveRef.current = null;
    setLive(null);
  }

  function reset(kind) {
    liveRef.current = null;
    setLive(null);
    setStored(generate(kind).map((v) => Math.round(v * 1000) / 1000));
  }

  let lo = 1;
  let hi = 0;
  let wet = 0;
  heights.forEach((v) => {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
    if (v < water) wet += 1;
  });
  const cursorSize = (radius / GW) * 200; // diameter, % of map width

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Brush</span>
        {TOOLS.map((t) => (
          <Btn key={t.key} active={tool === t.key} title={t.hint} onClick={() => setTool(t.key)}>
            {t.label}
          </Btn>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Slider label="Size" value={radius} min={2} max={24} onChange={setRadius} />
        <Slider label="Strength" value={strength} min={1} max={10} onChange={setStrength} />
        <Slider label="Hardness" value={hardness} min={0} max={0.9} step={0.1} onChange={setHardness} format={(v) => v.toFixed(1)} />
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={PW}
          height={PH}
          role="img"
          aria-label="Topography map. Drag to sculpt with the selected brush."
          className={`w-full touch-none rounded-md border ${expanded ? "max-h-[65vh]" : ""}`}
          style={{ cursor: "crosshair", aspectRatio: `${PW} / ${PH}` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => setCursor(null)}
        />
        {cursor && (
          <span
            className="pointer-events-none absolute rounded-full border-2 border-white/90 shadow"
            style={{
              left: `${cursor.px}%`,
              top: `${cursor.py}%`,
              width: `${cursorSize}%`,
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Slider label="Water" value={water} min={0} max={0.6} step={0.01} onChange={setWater} format={(v) => v.toFixed(2)} />
        <Slider label="Contours" value={contour} min={0} max={0.2} step={0.01} onChange={setContour} format={(v) => (v ? v.toFixed(2) : "off")} />
        <Slider label="Shading" value={shade} min={0} max={2} step={0.1} onChange={setShade} format={(v) => v.toFixed(1)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Generate</span>
        <Btn onClick={() => reset("hills")}>Hills</Btn>
        <Btn onClick={() => reset("island")}>Island</Btn>
        <Btn onClick={() => reset("flat")}>Flat</Btn>
        <span className="ml-auto text-muted-foreground tabular-nums">
          relief {lo.toFixed(2)}–{hi.toFixed(2)} · {Math.round((wet / heights.length) * 100)}% water
        </span>
      </div>
    </div>
  );
}

export const topoSN = {
  id: "topo-SN",
  label: "Topography maker",
  cards: [
    {
      id: "topo-maker",
      label: "Topography maker",
      order: 97,
      span: 2,
      hint: "drag to sculpt · six brushes",
      Card: TopoCard,
    },
  ],
};
