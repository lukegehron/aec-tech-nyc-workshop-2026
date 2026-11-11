"use client";

// An amoeba-shaped blob that shifts through the full colour spectrum as the
// pointer moves across it. Hue comes from where you hover: angle around the
// centre sweeps 0–360°, and distance from the centre shifts lightness.
// Press and drag to pull the nearest part of the outline; its neighbours follow
// with a falloff, so the body stretches like a membrane. Double-click resets.

import { useState } from "react";

// The outline is a ring of control points joined by a smooth closed curve
// (Catmull-Rom converted to cubic Béziers), so the shape can be pulled around.
const REST_POINTS = [
  [100, 12],
  [182, 52],
  [178, 124],
  [146, 184],
  [72, 188],
  [18, 140],
  [24, 80],
  [70, 30],
];

// How much each neighbour follows the grabbed point, by distance around the ring.
const FOLLOW = [1, 0.55, 0.2];
const LIMIT = { min: 6, max: 194 }; // keep the blob inside the viewBox

function smoothPath(pts) {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

const clamp = (v) => Math.min(LIMIT.max, Math.max(LIMIT.min, v));

export function AmoebaCard({ expanded }) {
  const [hover, setHover] = useState(null); // { hue, light } | null
  const [points, setPoints] = useState(REST_POINTS);
  const [drag, setDrag] = useState(null); // { index, last: [x, y] } | null

  // Pointer position in the SVG's 0–200 viewBox coordinates.
  function toSvg(e) {
    const svg = e.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return [100, 100];
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const r = pt.matrixTransform(m.inverse());
    return [r.x, r.y];
  }

  function updateHover(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 180; // 0–360
    const dist = Math.min(1, Math.hypot(x, y) / 0.5);
    setHover({ hue: Math.round(angle), light: Math.round(70 - dist * 20) });
  }

  function onDown(e) {
    const at = toSvg(e);
    let index = 0;
    let best = Infinity;
    points.forEach(([x, y], i) => {
      const dist = Math.hypot(x - at[0], y - at[1]);
      if (dist < best) {
        best = dist;
        index = i;
      }
    });
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ index, last: at });
  }

  function onMove(e) {
    updateHover(e);
    if (!drag) return;
    const at = toSvg(e);
    const dx = at[0] - drag.last[0];
    const dy = at[1] - drag.last[1];
    const n = points.length;
    setPoints(
      points.map(([x, y], i) => {
        const ring = Math.min((i - drag.index + n) % n, (drag.index - i + n) % n);
        const w = FOLLOW[ring] ?? 0;
        return w ? [clamp(x + dx * w), clamp(y + dy * w)] : [x, y];
      })
    );
    setDrag({ index: drag.index, last: at });
  }

  const fill = hover ? `hsl(${hover.hue} 85% ${hover.light}%)` : "hsl(150 25% 75%)";
  const stroke = hover ? `hsl(${hover.hue} 85% 35%)` : "hsl(150 25% 45%)";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <svg
        viewBox="0 0 200 200"
        className={expanded ? "h-full max-h-[32rem] w-full" : "h-full max-h-64 w-full"}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        onPointerLeave={() => setHover(null)}
        onDoubleClick={() => setPoints(REST_POINTS)}
        style={{ touchAction: "none", cursor: drag ? "grabbing" : "grab" }}
        role="img"
        aria-label="Amoeba that changes colour as you hover and can be pulled and stretched"
      >
        <path
          d={smoothPath(points)}
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          style={{ transition: "fill 120ms linear, stroke 120ms linear" }}
        />
        <ellipse cx="108" cy="104" rx="16" ry="13" fill="white" fillOpacity="0.35" pointerEvents="none" />
        <circle cx="62" cy="136" r="5" fill="white" fillOpacity="0.3" pointerEvents="none" />
        <circle cx="140" cy="64" r="4" fill="white" fillOpacity="0.3" pointerEvents="none" />
      </svg>
      <p className="text-xs tabular-nums text-muted-foreground">
        {drag ? "stretching…" : hover ? `hue ${hover.hue}° · drag to stretch · double-click to reset` : "hover, then drag to stretch the amoeba"}
      </p>
    </div>
  );
}

export const amoebaAC = {
  id: "amoeba-AC",
  label: "Amoeba",
  cards: [
    {
      id: "amoeba",
      label: "Amoeba",
      order: 91,
      span: 1,
      hint: "hover for the spectrum, drag to stretch",
      Card: AmoebaCard,
    },
  ],
};
