"use client";

import { useRef, useState } from "react";

export const W = 1000;
export const H = 625;

// The SVG drawing surface. Renders shared items; reports clicks/drags upward.
export function Board({ items, tool, color, textSize, onPlace, onLine, onErase }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const toBoard = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  };

  const down = (event) => {
    if (event.button !== 0 || tool === "erase") return;
    const p = toBoard(event);
    if (tool === "line") {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({ x: p.x, y: p.y, x2: p.x, y2: p.y });
    } else {
      onPlace(p);
    }
  };

  const move = (event) => {
    if (!drag) return;
    const p = toBoard(event);
    setDrag({ ...drag, x2: p.x, y2: p.y });
  };

  const up = () => {
    if (!drag) return;
    setDrag(null);
    if (Math.hypot(drag.x2 - drag.x, drag.y2 - drag.y) > 4) onLine(drag);
  };

  const hit = (event, id) => {
    if (tool !== "erase") return;
    event.stopPropagation();
    onErase(id);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`size-full touch-none ${tool === "erase" ? "cursor-pointer" : "cursor-crosshair"}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => setDrag(null)}
    >
      <defs>
        <pattern id="shared-space-dy-grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0V25" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#shared-space-dy-grid)" />

      {items.map((item) =>
        item.kind === "line" ? (
          <g key={item.id} onPointerDown={(e) => hit(e, item.id)}>
            <line x1={item.x} y1={item.y} x2={item.x2} y2={item.y2} stroke="transparent" strokeWidth="16" />
            <line x1={item.x} y1={item.y} x2={item.x2} y2={item.y2} stroke={item.color} strokeWidth="3" strokeLinecap="round" />
            <text x={item.x2 + 6} y={item.y2 - 6} fontSize="12" fontWeight="700" fill={item.color}>
              {item.author}
            </text>
          </g>
        ) : (
          <g key={item.id} onPointerDown={(e) => hit(e, item.id)}>
            <text
              x={item.x}
              y={item.y}
              fontSize={item.kind === "icon" ? textSize * 1.6 : textSize}
              fill={item.color}
              dominantBaseline="middle"
              textAnchor={item.kind === "icon" ? "middle" : "start"}
            >
              {item.text}
            </text>
            <text x={item.x} y={item.y - textSize} fontSize="11" fontWeight="700" fill={item.color}>
              {item.author}
            </text>
          </g>
        )
      )}

      {drag && (
        <line x1={drag.x} y1={drag.y} x2={drag.x2} y2={drag.y2} stroke={color} strokeWidth="3" strokeDasharray="6 4" />
      )}
    </svg>
  );
}
