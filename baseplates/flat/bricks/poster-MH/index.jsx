"use client";

import { useRef, useState } from "react";

const USER = {
  name: "Marshall",
  lastName: "Hayward",
  initials: "MH",
  title: "Agent Operator",
  github: "@Marshall-SC",
  seat: "Designer",
  toolkit: "Grasshopper · Rhino · Excel · Revit · Claude · Antigravity",
  sticker: "🤖",
};

// Toolkit as badges: a coloured monogram chip plus the program name.
const TOOLS = [
  { name: "Grasshopper", mark: "Gh", color: "#16a34a" },
  { name: "Rhino", mark: "Rh", color: "#1f2937" },
  { name: "Excel", mark: "X", color: "#15803d" },
  { name: "Revit", mark: "R", color: "#2563eb" },
  { name: "Claude", mark: "C", color: "#d97757" },
  { name: "Antigravity", mark: "A", color: "#7c3aed" },
];

// Sparks fly from the top edge of the button on hover.
const SPARKS = [
  { x: 8, dx: -22, dy: -26, delay: 0 },
  { x: 22, dx: -10, dy: -34, delay: 80 },
  { x: 38, dx: 6, dy: -30, delay: 30 },
  { x: 52, dx: -4, dy: -38, delay: 140 },
  { x: 66, dx: 14, dy: -32, delay: 60 },
  { x: 80, dx: 24, dy: -28, delay: 110 },
  { x: 92, dx: 30, dy: -20, delay: 20 },
  { x: 30, dx: 20, dy: -22, delay: 170 },
  { x: 4, dx: -30, dy: -18, delay: 50 },
  { x: 15, dx: -16, dy: -40, delay: 120 },
  { x: 28, dx: -6, dy: -24, delay: 200 },
  { x: 45, dx: 12, dy: -36, delay: 10 },
  { x: 58, dx: -12, dy: -28, delay: 160 },
  { x: 72, dx: 8, dy: -42, delay: 90 },
  { x: 86, dx: 18, dy: -34, delay: 180 },
  { x: 96, dx: 34, dy: -26, delay: 70 },
];

// How far the pupils can slide inside the eye whites (viewBox units).
const EYE_TRAVEL = 0.8;

const LINKEDIN_URL = "https://www.linkedin.com/in/marshallhayward/";

// Two typefaces only: font-heading (name, title) and font-mono (footer, caption).
function PosterCard({ expanded }) {
  const statueRef = useRef(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  // Point the pupils from the head toward the mouse (head sits at 28,48 in the
  // statue's 60x150 viewBox). Offsets are in viewBox units, capped at EYE_TRAVEL.
  const lookAt = (event) => {
    const svg = statueRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = rect.width / 60;
    const dx = event.clientX - (rect.left + 28 * scale);
    const dy = event.clientY - (rect.top + 48 * scale);
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, dist / (40 * scale));
    setGaze({ x: (dx / dist) * EYE_TRAVEL * reach, y: (dy / dist) * EYE_TRAVEL * reach });
  };
  return (
    <div className="relative flex h-full min-h-64 flex-col justify-between overflow-hidden bg-white p-5 text-black"
      onMouseMove={lookAt}
      onMouseLeave={() => setGaze({ x: 0, y: 0 })}
    >
      {/* Plane towing a banner, drawn first so it flies BEHIND the skyline and statue */}
      <style>{`@keyframes poster-mh-fly{from{left:-260px}to{left:100%}}.poster-mh-plane{position:absolute;top:34%;left:-260px;width:240px;pointer-events:none;animation:poster-mh-fly 6s linear infinite}@media (prefers-reduced-motion:reduce){.poster-mh-plane{animation:none;left:8%}}`}</style>
      <div className="poster-mh-plane" aria-hidden="true">
        <svg viewBox="0 0 240 44" className="w-full overflow-visible">
          {/* Banner: edges and free tail ripple (SMIL path morph); the text stays put */}
          <path d="M2 6C40 2 110 10 152 6L144 18L152 30C110 34 40 26 2 30L10 18Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round">
            <animate attributeName="d" dur="0.5s" repeatCount="indefinite" values="M2 6C40 2 110 10 152 6L144 18L152 30C110 34 40 26 2 30L10 18Z;M5 6C40 10 110 2 152 6L144 18L152 30C110 26 40 34 5 30L13 18Z;M2 6C40 2 110 10 152 6L144 18L152 30C110 34 40 26 2 30L10 18Z" />
          </path>
          <text x="78" y="21" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1" fill="#000000" fontFamily="var(--font-mono, monospace)">AECTech 2026</text>
          {/* Tow rope */}
          <path d="M152 18L186 20" stroke="#000000" strokeWidth="1" fill="none" />
          {/* Plane: fuselage, tail, wing, cockpit, propeller */}
          <path d="M186 20c0-3 4-5 14-5h18c6 0 9 2 9 5s-3 5-9 5h-18c-10 0-14-2-14-5z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
          <path d="M188 18l-5-9h6l6 8z" fill="#991b1b" />
          <path d="M200 23l10-3-3 12h-6z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="0.8" />
          <path d="M208 15c1-3 6-4 9-1l1 3h-10z" fill="#fecaca" stroke="#7f1d1d" strokeWidth="0.8" />
          <path d="M227 14v12" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Background: coloured NYC skyline (inline SVG, no network needed) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 120"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 w-full saturate-[0.7] contrast-[0.85] brightness-[1.1]"
      >
        <defs>
          {/* Lit windows, tiled over each building */}
          <pattern id="poster-mh-win" width="4" height="5" patternUnits="userSpaceOnUse">
            <rect x="1" y="1.2" width="1.8" height="2.4" fill="#ffffff" fillOpacity="0.4" />
          </pattern>
          <pattern id="poster-mh-win-warm" width="4" height="5" patternUnits="userSpaceOnUse">
            <rect x="1" y="1.2" width="1.8" height="2.4" fill="#fef08a" fillOpacity="0.6" />
          </pattern>
          <clipPath id="poster-mh-lowrise">
            <path d="M0 120V104h14V92h12v14h10V82h14v24h8V96h12v10h10V88h10v18h12V100h14v6h8V90h12v16h60V96h10v10h10V86h12v20h12V98h14v8h12V92h10v14h12V102h14v18z" />
          </clipPath>
        </defs>

        {/* Back row of low-rise blocks, solid, very faint windows, roof lines */}
        <path fill="#cbd5e1" stroke="#111827" strokeWidth="0.6" strokeLinejoin="round" d="M0 120V104h14V92h12v14h10V82h14v24h8V96h12v10h10V88h10v18h12V100h14v6h8V90h12v16h60V96h10v10h10V86h12v20h12V98h14v8h12V92h10v14h12V102h14v18z" />
        <g clipPath="url(#poster-mh-lowrise)">
          <rect x="0" y="82" width="300" height="38" fill="url(#poster-mh-win)" fillOpacity="0.25" />
          <path stroke="#111827" strokeOpacity="0.7" strokeWidth="0.5" fill="none" d="M14 92h12M36 82h14M58 96h12M80 88h10M102 100h14M124 90h12M196 96h10M216 86h12M240 98h14M266 92h10M288 102h12M7 104V120M20 92V120M43 82V120M64 96V120M85 88V120M109 100V120M130 90V120M166 106V120M246 98V120M271 92V120M295 102V120M0 112h14M14 100h12M36 94h14M58 104h12M102 110h14M124 100h12M142 106h54M216 96h12M240 108h14M266 102h10M288 112h12" />
        </g>

        {/* Infill rooftop details: antennas, tank, vents */}
        <g stroke="#111827" strokeOpacity="0.8" strokeWidth="0.5" fill="none">
          <path d="M20 92V85M20 87h-2M20 87h2M85 88V81M83 83h4M130 90V84M128.5 86h3M247 98V92M236.5 98V95" />
          <rect x="268" y="88" width="4" height="4" />
          <path d="M267 88h6M269 88l1-2 1 2" />
          <rect x="104" y="96" width="4" height="4" />
          <rect x="219" y="82" width="4" height="4" />
          <path d="M170 106v-3h6v3M184 106v-4h4v4" />
        </g>

        {/* Orange tower: shaded side, roof cap, antenna */}
        <rect x="30" y="60" width="16" height="60" fill="#f97316" />
        <rect x="40" y="60" width="6" height="60" fill="#c2410c" />
        <rect x="30" y="60" width="16" height="60" fill="url(#poster-mh-win)" />
        <rect x="29" y="58" width="18" height="2.5" fill="#9a3412" />
        <path stroke="#9a3412" strokeWidth="0.8" d="M38 58V48" />

        {/* Violet tower: setback crown and water tank */}
        <rect x="236" y="64" width="18" height="56" fill="#8b5cf6" />
        <rect x="248" y="64" width="6" height="56" fill="#6d28d9" />
        <rect x="239" y="58" width="12" height="6" fill="#7c3aed" />
        <rect x="236" y="64" width="18" height="56" fill="url(#poster-mh-win)" />
        <rect x="243" y="52" width="5" height="6" fill="#5b21b6" />
        <path fill="#4c1d95" d="M242.5 52h6l-3-3z" />

        {/* Teal tower: stepped top */}
        <rect x="262" y="72" width="20" height="48" fill="#14b8a6" />
        <rect x="275" y="72" width="7" height="48" fill="#0f766e" />
        <rect x="266" y="67" width="12" height="5" fill="#0d9488" />
        <rect x="269" y="63" width="6" height="4" fill="#0f766e" />
        <rect x="262" y="72" width="20" height="48" fill="url(#poster-mh-win)" />

        {/* Pink tower: rooftop box and vent */}
        <rect x="70" y="80" width="14" height="40" fill="#ec4899" />
        <rect x="79" y="80" width="5" height="40" fill="#be185d" />
        <rect x="73" y="76" width="7" height="4" fill="#9d174d" />
        <rect x="70" y="80" width="14" height="40" fill="url(#poster-mh-win)" />

        {/* Yellow tower: crown spire, warm windows */}
        <rect x="180" y="76" width="16" height="44" fill="#facc15" />
        <rect x="190" y="76" width="6" height="44" fill="#ca8a04" />
        <path fill="#a16207" d="M182 76l6-9 6 9z" />
        <path stroke="#a16207" strokeWidth="0.8" d="M188 67V60" />
        <rect x="180" y="76" width="16" height="44" fill="url(#poster-mh-win-warm)" fillOpacity="0.5" />

        {/* Empire State Building: shaded side, setbacks, mast bands */}
        <path fill="#2563eb" d="M96 120V62h6v-6h4v-8h3V30h2V12h1.5V30h2v18h3v8h4v6h6v58z" />
        <path fill="#1e3a8a" d="M105 120V62h-3v-6h4v-8h3V30h2V12h1.5V30h2v18h3v8h4v6h6v58z" fillOpacity="0.35" />
        <rect x="96" y="62" width="17" height="58" fill="url(#poster-mh-win)" />
        <rect x="102" y="56" width="10" height="6" fill="url(#poster-mh-win)" />
        <rect x="106" y="48" width="7" height="8" fill="url(#poster-mh-win)" />
        <path stroke="#bfdbfe" strokeWidth="0.6" d="M96 62h17M102 56h10M106 48h6M107 40h4M107.5 33h3" />
        <circle cx="108.75" cy="12" r="1" fill="#fca5a5" />

        {/* Chrysler tower: tiered silver arches and spire */}
        <rect x="150" y="70" width="16" height="50" fill="#94a3b8" />
        <rect x="160" y="70" width="6" height="50" fill="#64748b" />
        <rect x="150" y="70" width="16" height="50" fill="url(#poster-mh-win)" />
        <path fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" d="M151 70c0-8 3-12 7-16 4 4 7 8 7 16z" />
        <path fill="none" stroke="#64748b" strokeWidth="0.6" d="M153 70c0-6 2-9 5-12 3 3 5 6 5 12M155 70c0-4 1.5-6 3-8 1.5 2 3 4 3 8" />
        <path stroke="#64748b" strokeWidth="0.8" d="M158 54V44" />

        {/* One World Trade: tapered glass, split face, spire */}
        <path fill="#0ea5e9" d="M206 120V58l8-16 8 16v62z" />
        <path fill="#0369a1" d="M214 120V42l8 16v62z" />
        <rect x="206" y="58" width="16" height="62" fill="url(#poster-mh-win)" />
        <path stroke="#e0f2fe" strokeWidth="0.5" d="M206 58l8-16 8 16M206 80h16M206 100h16" />
        <path fill="#ef4444" d="M213.3 42V6h1.4v36z" />
        <circle cx="214" cy="6" r="1" fill="#fecaca" />

        {/* Fine black line work: outlines, floor lines, mast details */}
        <g stroke="#111827" strokeOpacity="0.75" strokeWidth="0.5" strokeLinejoin="round" fill="none">
          <path d="M30 120V60h16v60M29 58h18v2.5H29zM38 58V48M30 72h16M30 84h16M30 96h16M30 108h16" />
          <path d="M236 120V64h18v56M239 64v-6h12v6M243 58v-6h5v6M236 76h18M236 88h18M236 100h18M236 112h18" />
          <path d="M262 120V72h20v48M266 72v-5h12v5M269 67v-4h6v4M262 84h20M262 96h20M262 108h20" />
          <path d="M70 120V80h14v40M73 80v-4h7v4M70 92h14M70 104h14" />
          <path d="M180 120V76h16v44M182 76l6-9 6 9M188 67V60M180 88h16M180 100h16M180 112h16" />
          <path d="M96 120V62h6v-6h4v-8h3V30h2V12h1.5V30h2v18h3v8h4v6h6v58M102 62v58M113 62v58M96 80h17M96 98h17M96 112h17" />
          <path d="M150 120V70h16v50M151 70c0-8 3-12 7-16 4 4 7 8 7 16M158 54V44M150 82h16M150 94h16M150 106h16" />
          <path d="M206 120V58l8-16 8 16v62M214 42V120M213.3 42V6h1.4v36M206 72h16M206 90h16M206 108h16" />
        </g>
      </svg>

      {/* Statue of Liberty on the right, with a beam sweeping out of the torch */}
      <style>{`@keyframes poster-mh-sweep{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.poster-mh-beam{transform-box:view-box;transform-origin:40px 12px;animation:poster-mh-sweep 6s linear infinite}@media (prefers-reduced-motion:reduce){.poster-mh-beam{animation:none}}`}</style>
      <svg
        aria-hidden="true"
        ref={statueRef}
        viewBox="0 0 60 150"
        className="pointer-events-none absolute bottom-0 right-3 h-[85%] w-auto overflow-visible"
      >
        <defs>
          <linearGradient id="poster-mh-beam-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Rotating light: two opposed wedges from the flame */}
        <g className="poster-mh-beam">
          <path d="M40 12L160 -6V30z" fill="url(#poster-mh-beam-grad)" />
          <path d="M40 12L-80 30V-6z" fill="url(#poster-mh-beam-grad)" />
        </g>

        {/* Star-shaped fort base */}
        <path fill="#5b8f80" d="M2 150L8 138l4 2 4-6 6 4 6-6 6 6 6-4 4 6 4-2 6 12z" />
        {/* Pedestal: plinth, shaft, cornice */}
        <path fill="#8fb8aa" d="M10 138V130h40v8z" />
        <path fill="#7fae9f" d="M14 130V112h32v18z" />
        <path fill="#6aa392" d="M12 112V108h36v4z" />
        {/* Pedestal panels */}
        <path fill="none" stroke="#4f8776" strokeWidth="0.6" d="M18 116h24v10H18z M30 112v18" />

        {/* Robe */}
        <path fill="#6fb59f" d="M19 108L22 62l6-6h9l4 8 3 44z" />
        {/* Robe folds */}
        <path fill="none" stroke="#3f7f6c" strokeWidth="0.9" strokeLinecap="round" d="M24 66L22 106M28 64L27 107M32 64L33 107M36 66L38 106M40 72L41 104M25 80c3 2 8 2 14 0" />
        {/* Sash across the chest */}
        <path fill="#5aa38c" d="M23 62l16 10-1 4-16-10z" />
        {/* Feet and broken chain */}
        <path fill="#5aa38c" d="M20 108h12l2 3h-16z" />

        {/* Raised arm, sleeve and hand */}
        <path fill="#6fb59f" d="M33 62l4-8 3-30h3l-2 32-4 10z" />
        <path fill="#5aa38c" d="M37 56l5-2-1 5-5 1z" />
        {/* Torch: handle, gallery, flame cup */}
        <path fill="#5aa38c" d="M39 24h4l-.5-6h-3z" />
        <path fill="#8fb8aa" d="M36 18h10l-1.5-3h-7z" />
        <path fill="#fbbf24" d="M40 3c3.5 4 3.5 8 0 11.5-3.5-3.5-3.5-7.5 0-11.5z" />
        <path fill="#fde68a" d="M40 8c1.5 2 1.5 4 0 5.5-1.5-1.5-1.5-3.5 0-5.5z" />

        {/* Neck and head */}
        <path fill="#6fb59f" d="M25 54h6v5h-6z" />
        <ellipse cx="28" cy="49" rx="5" ry="6" fill="#7cc2ab" />
        {/* Face */}
        <ellipse cx="26.2" cy="48" rx="1.6" ry="1.2" fill="#f0fdf4" />
        <ellipse cx="29.8" cy="48" rx="1.6" ry="1.2" fill="#f0fdf4" />
        <circle cx={26.2 + gaze.x} cy={48 + gaze.y * 0.6} r="0.75" fill="#1f3d34" />
        <circle cx={29.8 + gaze.x} cy={48 + gaze.y * 0.6} r="0.75" fill="#1f3d34" />
        <path fill="none" stroke="#3f7f6c" strokeWidth="0.7" strokeLinecap="round" d="M28 49.5v2.2M26.5 53c1 .8 2 .8 3 0" />
        {/* Diadem band */}
        <path fill="#5aa38c" d="M22.6 44.5c2-2.5 8.8-2.5 10.8 0l-.4 1.8c-2-1.6-8-1.6-10 0z" />
        {/* Seven crown rays */}
        <path fill="none" stroke="#8fd0b8" strokeWidth="1.3" strokeLinecap="round" d="M22.5 43L16.5 41M23.2 40.5L18.5 36M25 38.5L22.5 32.5M28 37.5V30.5M31 38.5L33.5 32.5M32.8 40.5L37.5 36M33.5 43L39.5 41" />

        {/* Tablet arm and tablet */}
        <path fill="#6fb59f" d="M22 64l-5 6 1 12 5-6z" />
        <path fill="#5aa38c" d="M12 66l8-2 2 16-8 3z" />
        <path fill="none" stroke="#3f7f6c" strokeWidth="0.5" d="M14 69l5-1.2M14.4 72l5-1.2M14.8 75l5-1.2M15.2 78l5-1.2" />
      </svg>

      <style>{`@keyframes poster-mh-spark{0%{opacity:0;transform:translate(0,0) scale(1)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0.2)}}.poster-mh-spark{position:absolute;top:0;width:3px;height:3px;border-radius:9999px;background:#bfdbfe;box-shadow:0 0 6px 2px #60a5fa;opacity:0;pointer-events:none}.poster-mh-connect:hover .poster-mh-spark{animation:poster-mh-spark 0.7s ease-out infinite}@media (prefers-reduced-motion:reduce){.poster-mh-connect:hover .poster-mh-spark{animation:none}}`}</style>

      {/* Top rule: small title */}
      <div className="relative flex items-start">
        <p className="bg-white/90 px-2 py-1 font-heading text-xs font-medium uppercase tracking-widest shadow-sm">
          {USER.title}
        </p>
      </div>

      {/* Huge name */}
      <h2
        className={`relative font-heading font-black leading-[0.85] tracking-tighter ${
          expanded ? "text-8xl" : "text-4xl"
        }`}
      >
        <span className="block w-fit bg-white">{USER.name}</span>
        <span className="block w-fit bg-white">{USER.lastName}</span>
      </h2>

      {/* Caption + running footer */}
      <div className="relative flex flex-col items-start gap-3">
        <ul className="flex w-full max-w-sm flex-wrap gap-1" aria-label="Toolkit">
          {TOOLS.map((tool) => (
            <li
              key={tool.name}
              className="flex items-center gap-0.5 rounded-full bg-white/90 py-px pl-px pr-1.5 font-mono text-[8px] leading-none shadow-sm ring-1 ring-black/10"
            >
              <span
                className="flex size-3 shrink-0 items-center justify-center rounded-full text-[6px] font-bold text-white"
                style={{ backgroundColor: tool.color }}
              >
                {tool.mark}
              </span>
              {tool.name}
            </li>
          ))}
        </ul>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="poster-mh-connect relative inline-block bg-blue-600 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_18px_4px_rgba(59,130,246,0.75)]"
        >
          Connect on LinkedIn ↗
          {SPARKS.map((spark, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="poster-mh-spark"
              style={{ "--dx": `${spark.dx}px`, "--dy": `${spark.dy}px`, animationDelay: `${spark.delay}ms`, left: `${spark.x}%` }}
            />
          ))}
        </a>
        <div className="flex w-full items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
          <span className="bg-black px-2 py-1 font-bold text-white">{USER.seat}</span>
          <span className="border border-black bg-white/90 px-2 py-1 shadow-sm">{USER.github}</span>
          <span className="ml-auto bg-amber-400 px-2 py-1 font-bold text-black">{USER.initials}</span>
        </div>
      </div>
    </div>
  );
}

export const posterMH = {
  id: "poster-MH",
  label: "Poster",
  cards: [
    {
      id: "poster",
      label: `${USER.name} ${USER.lastName}`,
      order: 92,
      span: 1,
      hint: USER.github,
      Card: PosterCard,
    },
  ],
};
