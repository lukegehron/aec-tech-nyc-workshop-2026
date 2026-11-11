"use client";

// Speech-bubble sticker: name = sender, title = message, toolkit = reactions.
// Set in a nature scene: mountains, meadow, a flowing stream, and bears
// walking across the horizon. All styling lives in this file.

const PERSON = {
  name: "Ashlyn",
  title: "Agent Operator",
  github: "winslow52",
  seat: "Engineer",
  toolkit: ["Excel", "Revit", "Grasshopper", "JavaScript", "ChatGPT", "Claude"],
  initials: "AW",
};

// Bears walking the horizon. `dir` 1 = left to right, -1 = right to left.
// `width` is the bear's size, `dur` one full crossing, `delay` negative so they
// are already mid-walk on load, `step` the leg-swing period.
const BEARS = [
  { width: "7rem", fur: "#5b3a24", dir: 1, dur: "26s", delay: "-6s", step: "0.9s", bottom: "31%" },
  { width: "5rem", fur: "#3f2a1c", dir: -1, dur: "34s", delay: "-20s", step: "0.8s", bottom: "35%" },
  { width: "4rem", fur: "#8a6038", dir: 1, dur: "42s", delay: "-33s", step: "0.7s", bottom: "37%" },
];

const KEYFRAMES = `
@keyframes bubble-walk-right {
  from { left: -35%; }
  to { left: 110%; }
}
@keyframes bubble-walk-left {
  from { left: 110%; }
  to { left: -35%; }
}
@keyframes bubble-leg-a {
  0%, 100% { transform: rotate(-24deg); }
  50% { transform: rotate(24deg); }
}
@keyframes bubble-leg-b {
  0%, 100% { transform: rotate(24deg); }
  50% { transform: rotate(-24deg); }
}
@keyframes bubble-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2.5%); }
}
@keyframes bubble-ripple {
  to { stroke-dashoffset: -60; }
}
@keyframes bubble-cloud {
  from { transform: translateX(-60px); }
  to { transform: translateX(340px); }
}
.bubble-walker { position: absolute; animation-timing-function: linear; animation-iteration-count: infinite; }
.bubble-bob { animation: bubble-bob var(--step) ease-in-out infinite; }
.bubble-leg { transform-box: fill-box; transform-origin: 50% 8%; animation-duration: var(--step); animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
.bubble-leg-a { animation-name: bubble-leg-a; }
.bubble-leg-b { animation-name: bubble-leg-b; }
.bubble-ripple { stroke-dasharray: 14 46; animation: bubble-ripple 2.4s linear infinite; }
.bubble-cloud { animation: bubble-cloud 70s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .bubble-walker, .bubble-bob, .bubble-leg, .bubble-ripple, .bubble-cloud { animation: none !important; }
  .bubble-walker { left: 40%; }
}
`;

// A full bear in side profile, facing right. Legs swing from the hip.
function Bear({ fur, step }) {
  const dark = "#2b1b10";
  return (
    <svg viewBox="0 0 150 96" aria-hidden="true" className="block w-full" style={{ "--step": step }}>
      {/* ground shadow */}
      <ellipse cx="72" cy="90" rx="52" ry="4" fill="#000" opacity="0.18" />
      <g className="bubble-bob">
        {/* far legs (darker) */}
        <rect className="bubble-leg bubble-leg-b" x="30" y="52" width="13" height="36" rx="6" fill={dark} opacity="0.85" />
        <rect className="bubble-leg bubble-leg-a" x="96" y="52" width="13" height="36" rx="6" fill={dark} opacity="0.85" />
        {/* tail */}
        <circle cx="17" cy="42" r="5" fill={fur} />
        {/* body with shoulder hump */}
        <path
          d="M16 48 C18 26 42 20 66 24 C84 20 100 28 108 40 C112 54 100 74 66 74 C34 74 14 64 16 48 Z"
          fill={fur}
        />
        {/* fur highlight */}
        <path d="M30 34 C48 24 72 24 92 32" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* head */}
        <circle cx="116" cy="40" r="18" fill={fur} />
        <circle cx="106" cy="25" r="6" fill={fur} />
        <circle cx="106" cy="25" r="3" fill={dark} opacity="0.5" />
        {/* snout */}
        <ellipse cx="131" cy="46" rx="11" ry="8" fill="#c9a27a" />
        <ellipse cx="138" cy="43" rx="3.6" ry="2.8" fill={dark} />
        <path d="M128 51 C132 53 136 52 138 49" stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* eye */}
        <circle cx="122" cy="34" r="2.2" fill="#111" />
        <circle cx="122.7" cy="33.3" r="0.7" fill="#fff" />
        {/* near legs */}
        <rect className="bubble-leg bubble-leg-a" x="42" y="52" width="14" height="38" rx="7" fill={fur} />
        <rect className="bubble-leg bubble-leg-b" x="86" y="52" width="14" height="38" rx="7" fill={fur} />
      </g>
    </svg>
  );
}

function Scene() {
  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="bs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5aa9e6" />
          <stop offset="100%" stopColor="#cfeaff" />
        </linearGradient>
        <linearGradient id="bs-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fa7c4" />
          <stop offset="100%" stopColor="#b9cbe0" />
        </linearGradient>
        <linearGradient id="bs-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5f7f9d" />
          <stop offset="100%" stopColor="#8aa6c0" />
        </linearGradient>
        <linearGradient id="bs-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cc063" />
          <stop offset="100%" stopColor="#2f7d3a" />
        </linearGradient>
        <linearGradient id="bs-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9dcf5" />
          <stop offset="100%" stopColor="#3a93c9" />
        </linearGradient>
      </defs>

      <rect width="300" height="200" fill="url(#bs-sky)" />

      {/* drifting clouds */}
      <g className="bubble-cloud" fill="#fff" opacity="0.85">
        <ellipse cx="0" cy="88" rx="22" ry="6" />
        <ellipse cx="-12" cy="84" rx="12" ry="6" />
        <ellipse cx="10" cy="83" rx="13" ry="7" />
      </g>

      {/* mountains, far then near */}
      <path d="M0 128 L38 92 L62 112 L100 80 L142 118 L180 90 L226 122 L262 96 L300 120 L300 140 L0 140 Z" fill="url(#bs-far)" />
      <path d="M100 80 L88 94 L97 91 L104 98 L110 90 L118 96 Z" fill="#fff" opacity="0.8" />
      <path d="M0 134 L46 108 L84 128 L128 104 L170 130 L214 110 L258 130 L300 112 L300 146 L0 146 Z" fill="url(#bs-near)" />

      {/* distant tree line */}
      <g fill="#2f6b3d" opacity="0.9">
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M${i * 10 + 2} 138 L${i * 10 + 6} ${128 - (i % 4) * 2} L${i * 10 + 10} 138 Z`} />
        ))}
      </g>

      {/* meadow */}
      <path d="M0 134 C60 126 110 140 170 132 S270 128 300 134 L300 200 L0 200 Z" fill="url(#bs-grass)" />

      {/* stream: narrow at the horizon, widening toward the viewer */}
      <path
        d="M142 134 C150 146 118 152 100 166 C88 176 66 188 50 200 L232 200 C214 188 210 178 196 166 C182 154 168 146 160 134 Z"
        fill="url(#bs-water)"
      />
      {/* bank edges */}
      <path d="M142 134 C150 146 118 152 100 166 C88 176 66 188 50 200" stroke="#9fd18a" strokeWidth="2" fill="none" />
      <path d="M160 134 C168 146 182 154 196 166 C210 178 214 188 232 200" stroke="#9fd18a" strokeWidth="2" fill="none" />
      {/* flowing ripples */}
      <g fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <path className="bubble-ripple" d="M151 138 C150 150 128 156 112 170 C100 180 88 190 78 200" />
        <path className="bubble-ripple" style={{ animationDuration: "3.1s" }} d="M156 138 C158 150 168 158 180 168 C192 178 198 188 206 200" />
        <path className="bubble-ripple" style={{ animationDuration: "2.8s" }} d="M154 140 C148 152 140 164 134 176 C130 186 128 194 128 200" />
      </g>

      {/* stones along the bank */}
      <g fill="#8d8d8d">
        <ellipse cx="96" cy="170" rx="5" ry="3" />
        <ellipse cx="104" cy="173" rx="3" ry="2" />
        <ellipse cx="198" cy="171" rx="5" ry="3" />
        <ellipse cx="60" cy="190" rx="6" ry="3.5" />
      </g>

      {/* foreground grass tufts */}
      <g stroke="#1f5e2b" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M20 200 L18 188 M24 200 L26 186 M28 200 L32 190" />
        <path d="M260 200 L258 188 M264 200 L267 186 M268 200 L272 191" />
        <path d="M236 200 L234 192 M240 200 L243 190" />
      </g>
    </svg>
  );
}

function Avatar() {
  return (
    <div
      role="img"
      aria-label={`${PERSON.name} (bear avatar)`}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl ring-2 ring-white"
    >
      🐻
    </div>
  );
}

function BubbleCard({ expanded }) {
  return (
    <div className="relative flex h-full min-h-72 flex-col justify-start gap-2 overflow-hidden rounded-2xl bg-sky-200 p-3">
      <style>{KEYFRAMES}</style>
      <Scene />

      {/* bears walking the horizon */}
      {BEARS.map((b, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="bubble-walker pointer-events-none"
          style={{
            width: b.width,
            bottom: b.bottom,
            animationName: b.dir === 1 ? "bubble-walk-right" : "bubble-walk-left",
            animationDuration: b.dur,
            animationDelay: b.delay,
          }}
        >
          <div style={{ transform: b.dir === 1 ? "none" : "scaleX(-1)" }}>
            <Bear fur={b.fur} step={b.step} />
          </div>
        </div>
      ))}

      <div className="relative flex items-end gap-2">
        <Avatar />
        <div className="min-w-0">
          <p className="mb-0.5 ml-3 text-[11px] font-medium text-white drop-shadow">
            {PERSON.name} · {PERSON.seat}
          </p>
          <div
            className={`rounded-3xl rounded-bl-md bg-blue-600 px-4 py-2.5 font-medium text-white shadow-md ${
              expanded ? "text-2xl" : "text-base"
            }`}
          >
            {PERSON.title}
          </div>
        </div>
      </div>
      <ul className="relative ml-11 flex flex-wrap gap-1.5">
        {PERSON.toolkit.map((tool) => (
          <li
            key={tool}
            className="rounded-full bg-white/85 px-2.5 py-0.5 text-xs text-sky-950 shadow-sm ring-1 ring-sky-300"
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const bubbleAW = {
  id: "bubble-AW",
  label: "Bubble sticker",
  cards: [
    {
      id: "bubble-card",
      label: "Ashlyn",
      order: 95,
      span: 1,
      hint: "@winslow52",
      Card: BubbleCard,
    },
  ],
};
