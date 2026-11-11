"use client";

// Asset menu: buildings, roads, cars and trees on a top-down site plan.
// Three ways to add them — Place (click), Brush (drag to scatter) and Grid
// (click to generate a rows × cols array). Saved per browser (useCardState).

import { useRef, useState } from "react";
import { useCardState } from "../../storage";
import { ASSETS, ASSET_KEYS, Asset, H, LAYER, W, clamp, makeItem, rand } from "./assets";
import { Btn, Slider } from "./controls";

const MAX_ITEMS = 2000;
const MODES = [
  { key: "place", label: "Place" },
  { key: "brush", label: "Brush scatter" },
  { key: "grid", label: "Grid" },
  { key: "erase", label: "Erase" },
];

function AssetsCard({ expanded }) {
  const [items, setItems] = useCardState("assets-SN-items", []);
  const [asset, setAsset] = useCardState("assets-SN-asset", "building");
  const [mode, setMode] = useCardState("assets-SN-mode", "place");
  const [rot, setRot] = useCardState("assets-SN-rot", 0);
  const [radius, setRadius] = useCardState("assets-SN-radius", 50);
  const [density, setDensity] = useCardState("assets-SN-density", 4);
  const [cols, setCols] = useCardState("assets-SN-cols", 5);
  const [rows, setRows] = useCardState("assets-SN-rows", 3);
  const [spacing, setSpacing] = useCardState("assets-SN-spacing", 0);
  const [jitter, setJitter] = useCardState("assets-SN-jitter", 0);
  const [cursor, setCursor] = useState(null);
  const svgRef = useRef(null);
  const painting = useRef(false);
  const lastStamp = useRef(null);

  const def = ASSETS[asset];
  const step = def.gap + spacing;
  const long = asset === "road" || asset === "car";
  const rotated = rot % 180 === 90;
  // Roads and cars are long on one axis: pack them tightly across it.
  const tight = def.gap * 0.4 + spacing;
  const stepX = long && !rotated ? step : long ? tight : step;
  const stepY = long && rotated ? step : long ? tight : step;

  function toScene(e) {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: clamp(p.x, 0, W), y: clamp(p.y, 0, H) };
  }

  function add(newItems) {
    setItems((cur) => [...cur, ...newItems].slice(-MAX_ITEMS));
  }

  function erase({ x, y }) {
    setItems((cur) => cur.filter((it) => Math.hypot(it.x - x, it.y - y) > radius));
  }

  function scatter({ x, y }) {
    const out = [];
    for (let i = 0; i < density; i += 1) {
      const a = rand(0, Math.PI * 2);
      const d = Math.sqrt(Math.random()) * radius;
      const r =
        asset === "tree" || asset === "building" ? rand(0, 360) : asset === "car" ? rot + rand(-8, 8) : rot;
      out.push(makeItem(asset, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.round(r), false));
    }
    add(out);
  }

  function generateGrid({ x, y }) {
    const out = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const jx = jitter ? rand(-jitter, jitter) : 0;
        const jy = jitter ? rand(-jitter, jitter) : 0;
        out.push(makeItem(asset, x + c * stepX + jx, y + r * stepY + jy, rot, true));
      }
    }
    add(out);
  }

  function onDown(e) {
    const p = toScene(e);
    if (mode === "place") add([makeItem(asset, p.x, p.y, rot, true)]);
    else if (mode === "grid") generateGrid(p);
    else {
      painting.current = true;
      lastStamp.current = p;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (mode === "brush") scatter(p);
      else erase(p);
    }
  }

  function onMove(e) {
    const p = toScene(e);
    setCursor(p);
    if (!painting.current) return;
    const last = lastStamp.current;
    if (Math.hypot(p.x - last.x, p.y - last.y) < radius * 0.5) return;
    lastStamp.current = p;
    if (mode === "brush") scatter(p);
    else if (mode === "erase") erase(p);
  }

  function onUp() {
    painting.current = false;
  }

  const counts = {};
  items.forEach((it) => {
    counts[it.type] = (counts[it.type] ?? 0) + 1;
  });
  const sorted = [...items].sort((a, b) => LAYER[a.type] - LAYER[b.type]);
  const showRadius = (mode === "brush" || mode === "erase") && cursor;
  const radiusColor = mode === "erase" ? "#ef4444" : "#3b82f6";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Asset</span>
        {ASSET_KEYS.map((key) => (
          <Btn key={key} active={asset === key} swatch={ASSETS[key].color} onClick={() => setAsset(key)}>
            {ASSETS[key].label}
          </Btn>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Mode</span>
        {MODES.map((m) => (
          <Btn key={m.key} active={mode === m.key} onClick={() => setMode(m.key)}>
            {m.label}
          </Btn>
        ))}
        {mode !== "erase" && <Btn onClick={() => setRot((r) => (r + 90) % 360)}>Rotate · {rot}°</Btn>}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {(mode === "brush" || mode === "erase") && (
          <Slider label="Radius" value={radius} min={10} max={150} onChange={setRadius} />
        )}
        {mode === "brush" && (
          <Slider label="Density" value={density} min={1} max={20} onChange={setDensity} suffix="/stamp" />
        )}
        {mode === "grid" && (
          <>
            <Slider label="Columns" value={cols} min={1} max={20} onChange={setCols} />
            <Slider label="Rows" value={rows} min={1} max={20} onChange={setRows} />
            <Slider label="Spacing" value={spacing} min={-10} max={60} onChange={setSpacing} suffix="px" />
            <Slider label="Jitter" value={jitter} min={0} max={20} onChange={setJitter} suffix="px" />
          </>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Site plan. Pick an asset and a mode, then click or drag to add."
        className={`w-full touch-none rounded-md border bg-emerald-50 ${expanded ? "max-h-[65vh]" : ""}`}
        style={{ cursor: "crosshair" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => setCursor(null)}
      >
        <defs>
          <pattern id="assets-SN-grid" width={40} height={40} patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#d1fae5" strokeWidth={1} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#assets-SN-grid)" />
        {sorted.map((it) => (
          <Asset key={it.id} item={it} />
        ))}
        {showRadius && (
          <circle
            cx={cursor.x}
            cy={cursor.y}
            r={radius}
            fill={radiusColor}
            fillOpacity={0.12}
            stroke={radiusColor}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
        {mode === "grid" && cursor && (
          <rect
            x={cursor.x - 6}
            y={cursor.y - 6}
            width={(cols - 1) * stepX + 12}
            height={(rows - 1) * stepY + 12}
            fill="#3b82f6"
            fillOpacity={0.08}
            stroke="#3b82f6"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <Btn onClick={() => setItems((cur) => cur.slice(0, -1))}>Undo last</Btn>
        <Btn onClick={() => setItems([])}>Clear</Btn>
        <span className="ml-auto text-muted-foreground tabular-nums">
          {ASSET_KEYS.map((k) => `${counts[k] ?? 0} ${ASSETS[k].label.toLowerCase()}`).join(" · ")}
        </span>
      </div>
    </div>
  );
}

export const assetsSN = {
  id: "assets-SN",
  label: "Asset menu",
  cards: [
    {
      id: "asset-menu",
      label: "Asset menu",
      order: 95,
      span: 2,
      hint: "place · brush scatter · grid",
      Card: AssetsCard,
    },
  ],
};
