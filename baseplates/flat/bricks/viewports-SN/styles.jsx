"use client";

// Art styles for the viewports: palette + stroke + SVG filter per style, plus
// the shared <defs> (filters, hatch) and a function that draws one scene item.

export const STYLES = [
  {
    key: "blueprint", label: "Blueprint", bg: "#1e3a8a", grid: "#3b5bb5",
    building: "none", road: "none", car: "none", tree: "none",
    line: "#e0f2fe", lw: 1.2, filter: null, dash: null,
  },
  {
    key: "watercolor", label: "Watercolor", bg: "#fdf8ee", grid: null,
    building: "#e8a1a1", road: "#9db4c0", car: "#e9c46a", tree: "#7fb77e",
    line: "none", lw: 0, filter: "vp-wash", dash: null, opacity: 0.8,
  },
  {
    key: "pixel", label: "Pixel 8-bit", bg: "#0f380f", grid: "#1b5a1b",
    building: "#8bac0f", road: "#306230", car: "#e0f8cf", tree: "#9bbc0f",
    line: "#0f380f", lw: 2, filter: null, dash: null, square: true,
  },
  {
    key: "noir", label: "Ink noir", bg: "#f4f1ea", grid: null,
    building: "url(#vp-hatch)", road: "#222", car: "#000", tree: "#555",
    line: "#000", lw: 2, filter: null, dash: null,
  },
  {
    key: "neon", label: "Neon night", bg: "#0b0720", grid: "#1d1547",
    building: "#1a0b3d", road: "#120a30", car: "#ffe600", tree: "#0a2a22",
    line: "#ff2bd6", lw: 1.6, filter: "vp-glow", dash: null, treeLine: "#2bffb0",
  },
  {
    key: "sketch", label: "Pencil sketch", bg: "#fffdf7", grid: null,
    building: "#f1ece0", road: "#ece7da", car: "#f6efd8", tree: "#e8efdc",
    line: "#3a3a3a", lw: 1.1, filter: "vp-wobble", dash: null,
  },
];

export function StyleDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <filter id="vp-wash" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.4" />
        </filter>
        <filter id="vp-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="vp-wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
        <pattern id="vp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#f4f1ea" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="2" />
        </pattern>
      </defs>
    </svg>
  );
}

export function StyledItem({ item, s }) {
  const { type, x, y, rot } = item;
  const t = `translate(${x} ${y}) rotate(${rot})`;
  const fill = s[type];
  const stroke = type === "tree" && s.treeLine ? s.treeLine : s.line;
  const common = { fill, stroke, strokeWidth: s.lw };
  if (type === "tree") {
    return (
      <g transform={t}>
        {s.square ? (
          <rect x={-item.r} y={-item.r} width={item.r * 2} height={item.r * 2} {...common} />
        ) : (
          <circle r={item.r} {...common} />
        )}
      </g>
    );
  }
  if (type === "car") {
    return (
      <g transform={t}>
        <rect x={-9} y={-4.5} width={18} height={9} rx={s.square ? 0 : 2.5} {...common} />
      </g>
    );
  }
  if (type === "road") {
    return (
      <g transform={t}>
        <rect x={-30} y={-8} width={60} height={16} {...common} />
        <line x1={-26} x2={26} y1={0} y2={0} stroke={s.key === "blueprint" ? s.line : "#fde68a"} strokeWidth={1.2} strokeDasharray="6 5" opacity={0.8} />
      </g>
    );
  }
  return (
    <g transform={t}>
      <rect x={-item.w / 2} y={-item.d / 2} width={item.w} height={item.d} {...common} />
      {s.key === "blueprint" && (
        <path d={`M${-item.w / 2} ${-item.d / 2}L${item.w / 2} ${item.d / 2}M${item.w / 2} ${-item.d / 2}L${-item.w / 2} ${item.d / 2}`} stroke={s.line} strokeWidth={0.6} opacity={0.6} />
      )}
    </g>
  );
}
