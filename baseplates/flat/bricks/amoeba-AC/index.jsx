"use client";

// An amoeba-shaped blob that shifts through the full colour spectrum as the
// pointer moves across it. Hue comes from where you hover: angle around the
// centre sweeps 0–360°, and distance from the centre shifts lightness.

import { useState } from "react";

const BLOB =
  "M100 12 C135 4 168 22 182 52 C196 80 190 102 178 124 C168 146 176 170 146 184 " +
  "C116 198 96 180 72 188 C44 196 20 170 18 140 C16 114 30 104 24 80 C18 52 52 44 70 30 C80 22 90 14 100 12 Z";

export function AmoebaCard({ expanded }) {
  const [hover, setHover] = useState(null); // { hue, light } | null

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 180; // 0–360
    const dist = Math.min(1, Math.hypot(x, y) / 0.5);
    setHover({ hue: Math.round(angle), light: Math.round(70 - dist * 20) });
  }

  const fill = hover ? `hsl(${hover.hue} 85% ${hover.light}%)` : "hsl(150 25% 75%)";
  const stroke = hover ? `hsl(${hover.hue} 85% 35%)` : "hsl(150 25% 45%)";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <svg
        viewBox="0 0 200 200"
        className={expanded ? "h-full max-h-[32rem] w-full" : "h-full max-h-64 w-full"}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Amoeba that changes colour as you hover"
      >
        <path
          d={BLOB}
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
        {hover ? `hue ${hover.hue}°` : "hover the amoeba"}
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
      hint: "hover for the spectrum",
      Card: AmoebaCard,
    },
  ],
};
