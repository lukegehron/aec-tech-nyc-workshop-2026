"use client";

import { useState } from "react";
import { RED, INK } from "./shared";
import { framesA } from "./framesA";
import { framesB } from "./framesB";

const FRAMES = [...framesA, ...framesB];

// One tile. Tracks the pointer and hands the frame a live position:
// x, y in -1..1, px, py in SVG units (0..40), h = hovering.
function Frame({ index, Art }) {
  const [pointer, setPointer] = useState(null);

  const track = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPointer({ x: nx * 2 - 1, y: ny * 2 - 1, px: nx * 40, py: ny * 40 });
  };

  const state = pointer
    ? { ...pointer, h: true }
    : { x: 0, y: 0, px: 20, py: 20, h: false };

  return (
    <div>
      <svg
        viewBox="0 0 40 40"
        className="block aspect-square w-full cursor-crosshair touch-none overflow-hidden bg-neutral-100"
        aria-hidden
        onPointerEnter={track}
        onPointerMove={track}
        onPointerLeave={() => setPointer(null)}
        onPointerCancel={() => setPointer(null)}
      >
        <Art {...state} />
      </svg>
      <p
        className="mt-0.5 text-[8px] font-bold tabular-nums leading-none tracking-widest transition-colors duration-300"
        style={{ color: state.h ? RED : INK }}
      >
        {String(index + 1).padStart(2, "0")}
      </p>
    </div>
  );
}

export function ContactSheet() {
  return (
    <div
      className="grid w-full grid-cols-3 gap-1.5 motion-reduce:[&_*]:!transition-none"
      role="img"
      aria-label="Contact sheet of architectural compositions"
    >
      {FRAMES.map((Art, i) => (
        <Frame key={i} index={i} Art={Art} />
      ))}
    </div>
  );
}
