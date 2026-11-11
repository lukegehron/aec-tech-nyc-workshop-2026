"use client";

import { PIECES, typeLabel } from "./bridge";

/**
 * Bridge mode: what the editor looks like while the Bridge tool is active.
 *
 * A brick may not edit the baseplate's toolbar or canvas, so the mode is
 * drawn from here. The tool's Overlay mounts <ModeChrome>, which carries a
 * <style> that (1) turns the canvas and sheet yellow and (2) greys out and
 * disables every rail button except Bridge. Because the style lives in the
 * Overlay, it disappears the moment another tool is active.
 *
 * The selectors lean on two things the baseplate renders today: the rail
 * buttons' `aria-label` (the tool label) and the sheet being the first <rect>
 * in the canvas. If either changes, the mode loses its look but still works.
 */

export const TOOL_ID = "bridge";
export const TOOL_LABEL = "Bridge";
export const TOOL_KEY = "g";

const MODE_CSS = `
svg:has([data-bridge-mode]) { background-color: #fef9c3 !important; }
svg:has([data-bridge-mode]) > g > rect:first-child { fill: #fef08a; }
div:has(> button[aria-label="${TOOL_LABEL}"]) > button:not([aria-label="${TOOL_LABEL}"]) {
  opacity: 0.3; filter: grayscale(1); pointer-events: none;
}
`;

// The piece palette sits on the canvas, in SCREEN pixels, so it stays put
// while the sheet pans and zooms.
const CHIP = { x: 12, y: 34, w: 92, h: 26, gap: 6 };

export function paletteChips() {
  return PIECES.map((piece, i) => ({
    value: piece.value,
    label: piece.label,
    x: CHIP.x + i * (CHIP.w + CHIP.gap),
    y: CHIP.y,
    w: CHIP.w,
    h: CHIP.h,
  }));
}

export const toScreen = (world, viewport) => ({
  x: world.x * viewport.zoom + viewport.x,
  y: world.y * viewport.zoom + viewport.y,
});

/** Which palette chip a world point is over, if any. */
export function paletteHit(world, viewport) {
  if (!world) return null;
  const s = toScreen(world, viewport);
  const chip = paletteChips().find(
    (c) => s.x >= c.x && s.x <= c.x + c.w && s.y >= c.y && s.y <= c.y + c.h
  );
  return chip?.value ?? null;
}

/** The yellow mode, the banner and the piece palette. Drawn in screen pixels. */
export function ModeChrome({ viewport, opts }) {
  const { zoom } = viewport;
  return (
    <g
      data-bridge-mode="on"
      pointerEvents="none"
      transform={`scale(${1 / zoom}) translate(${-viewport.x} ${-viewport.y})`}
    >
      <style>{MODE_CSS}</style>
      <text x={12} y={22} fontSize={11} fontWeight={700} letterSpacing={1} fill="#854d0e">
        BRIDGE MODE · pick a piece, then drag joint to joint · Esc to exit
      </text>
      {paletteChips().map((chip, i) => {
        const active = opts.piece === chip.value;
        const label = chip.value === "preset" ? typeLabel(opts.type) : chip.label;
        return (
          <g key={chip.value}>
            <rect
              x={chip.x}
              y={chip.y}
              width={chip.w}
              height={chip.h}
              rx={6}
              fill={active ? "#854d0e" : "#fffbeb"}
              stroke="#854d0e"
              strokeWidth={1}
            />
            <text
              x={chip.x + chip.w / 2}
              y={chip.y + 17}
              textAnchor="middle"
              fontSize={11}
              fontWeight={active ? 700 : 500}
              fill={active ? "#fffbeb" : "#854d0e"}
            >
              {`${i + 1} ${label}`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function SnapMarker({ p, zoom, onJoint = false }) {
  const hair = 1 / zoom;
  const r = (onJoint ? 7 : 5) / zoom;
  return (
    <g pointerEvents="none">
      <circle
        cx={p.x}
        cy={p.y}
        r={r}
        fill={onJoint ? "var(--color-primary)" : "none"}
        fillOpacity={0.35}
        stroke="var(--color-primary)"
        strokeWidth={hair * (onJoint ? 2 : 1.5)}
      />
      <path
        d={`M ${p.x - r * 2} ${p.y} H ${p.x + r * 2} M ${p.x} ${p.y - r * 2} V ${p.y + r * 2}`}
        stroke="var(--color-primary)"
        strokeWidth={hair}
      />
    </g>
  );
}

/**
 * Esc cancels the piece in hand, or leaves bridge mode if there is none.
 * Other tools' single-letter shortcuts are swallowed, so the greyed-out tools
 * really are unavailable.
 */
export function modeKeys(ctx) {
  const event = ctx.event;
  if (event.key === "Escape") {
    if (ctx.draft) ctx.setDraft(null);
    else ctx.setTool("select");
    return true;
  }
  const plain = !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
  if (plain && /^[a-z]$/i.test(event.key)) return event.key.toLowerCase() !== TOOL_KEY;
  return false;
}
