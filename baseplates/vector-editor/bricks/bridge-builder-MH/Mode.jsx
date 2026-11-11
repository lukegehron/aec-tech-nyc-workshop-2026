"use client";

import { useAtomValue } from "jotai";
import { viewportAtom } from "../../atoms";

/**
 * Bridge mode: what the editor looks like while a bridge tool is active.
 *
 * A brick may not edit the baseplate's toolbar or canvas, so the mode is
 * drawn from here. The active bridge tool's Overlay mounts <ModeChrome>, which
 * carries a <style> that (1) turns the canvas and sheet yellow and (2) greys
 * out and disables every rail button except the bridge tools. Because the
 * style lives in the Overlay, it disappears the moment another tool is active.
 *
 * The selectors lean on two things the baseplate renders today: the rail
 * buttons' `aria-label` (the tool label) and the sheet being the first <rect>
 * in the canvas. If either changes, the mode loses its look but still works.
 */

/** Tool ids and rail labels that stay live in bridge mode. */
export const MODE_TOOLS = [
  { id: "member", label: "Member", key: "m" },
  { id: "bridge", label: "Bridge", key: "g" },
];

const keep = MODE_TOOLS.map((tool) => `:not([aria-label="${tool.label}"])`).join("");
const rail = `div:has(> button[aria-label="${MODE_TOOLS[0].label}"])`;

const MODE_CSS = `
svg:has([data-bridge-mode]) { background-color: #fef9c3 !important; }
svg:has([data-bridge-mode]) > g > rect:first-child { fill: #fef08a; }
${rail} > button${keep} { opacity: 0.3; filter: grayscale(1); pointer-events: none; }
`;

export function ModeChrome({ zoom, label }) {
  const viewport = useAtomValue(viewportAtom);
  // The overlay is drawn in sheet units, so pin the banner to the canvas corner.
  const x = (12 - viewport.x) / zoom;
  const y = (22 - viewport.y) / zoom;
  return (
    <g data-bridge-mode="on" pointerEvents="none">
      <style>{MODE_CSS}</style>
      <text x={x} y={y} fontSize={11 / zoom} fontWeight={700} letterSpacing={1 / zoom} fill="#854d0e">
        {`BRIDGE MODE · ${label} · Esc to exit`}
      </text>
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
 * Keys shared by both bridge tools. Esc cancels the piece in hand, or leaves
 * bridge mode if there is none. Other tools' single-letter shortcuts are
 * swallowed, so the greyed-out tools really are unavailable.
 */
export function modeKeys(ctx) {
  const event = ctx.event;
  if (event.key === "Escape") {
    if (ctx.draft) ctx.setDraft(null);
    else ctx.setTool("select");
    return true;
  }
  const plain = !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
  if (plain && /^[a-z]$/i.test(event.key)) {
    return !MODE_TOOLS.some((tool) => tool.key === event.key.toLowerCase());
  }
  return false;
}
