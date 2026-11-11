"use client";

const USER = {
  name: "Nicholas",
  initials: "NI",
  title: "AEC AI Scout",
  github: "@nwright234",
  seat: "Developer",
  toolkit: "Excel · Rhino · Revit · Grasshopper · Claude · ChatGPT",
  sticker: "🏗️",
};

// Hand-placed dirt/rock pixels [x, y, colour] for the underground cutaway.
const SPECKLES = [
  [2, 5, "#5b3d22"], [7, 2, "#9a6b3f"], [10, 6, "#5b3d22"], [17, 4, "#9a6b3f"],
  [27, 6, "#5b3d22"], [36, 3, "#9a6b3f"], [39, 7, "#5b3d22"], [45, 2, "#9a6b3f"],
  [58, 7, "#5b3d22"], [62, 3, "#9a6b3f"], [3, 23, "#8b7355"], [11, 22, "#3f2f25"],
  [19, 24, "#8b7355"], [26, 22, "#3f2f25"], [33, 24, "#8b7355"], [41, 22, "#3f2f25"],
  [49, 24, "#8b7355"], [57, 22, "#3f2f25"], [5, 22, "#a8a29e"], [44, 24, "#a8a29e"],
];

function PunchCard({ expanded }) {
  return (
    <div
      className="relative flex h-full flex-col gap-2 overflow-hidden rounded-md border-2 border-dashed border-teal-900/50 bg-teal-100 p-3 text-teal-950 shadow-inner"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(20,100,110,.12) 0, transparent 35%), radial-gradient(circle at 85% 90%, rgba(20,100,110,.15) 0, transparent 40%)",
      }}
    >
      {/* Header: the offer */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`font-heading font-bold uppercase leading-tight tracking-wide ${
              expanded ? "text-xl" : "text-sm"
            }`}
          >
            Design technology builds the future
          </p>
          <p className="truncate text-[11px] italic text-teal-900/70">
            {USER.name} · {USER.seat} · {USER.github}
          </p>
        </div>
        <span className="-rotate-12 text-2xl" aria-hidden>
          {USER.sticker}
        </span>
      </div>

      {/* Building site: crane hoists a load up and down while floors go up */}
      <style>{`
        @keyframes punch-ni-hoist{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
        @keyframes punch-ni-reel{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.27)}}
        @keyframes punch-ni-floor{0%,20%{opacity:0}35%,100%{opacity:1}}
        @keyframes punch-ni-sway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}
        .punch-ni-load{animation:punch-ni-hoist 3.2s ease-in-out infinite}
        .punch-ni-cable{transform-origin:126px 10px;animation:punch-ni-reel 3.2s ease-in-out infinite}
        .punch-ni-floor-a{animation:punch-ni-floor 6.4s linear infinite}
        .punch-ni-floor-b{animation:punch-ni-floor 6.4s linear infinite;animation-delay:1.6s}
        .punch-ni-floor-c{animation:punch-ni-floor 6.4s linear infinite;animation-delay:3.2s}
        .punch-ni-jib{transform-origin:150px 10px;animation:punch-ni-sway 6.4s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){.punch-ni-load,.punch-ni-cable,.punch-ni-floor-a,.punch-ni-floor-b,.punch-ni-floor-c,.punch-ni-jib{animation:none}}
      `}</style>
      <svg
        viewBox="0 0 200 64"
        role="img"
        aria-label="A building under construction with a crane lifting a load"
        className="h-14 w-full shrink-0 text-teal-900/70"
      >
        {/* ground */}
        <line x1="4" y1="60" x2="196" y2="60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* building frame: columns + floor slabs */}
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          <rect x="40" y="38" width="60" height="22" fill="rgba(20,100,110,.15)" />
          <line x1="40" y1="38" x2="40" y2="14" />
          <line x1="70" y1="38" x2="70" y2="14" />
          <line x1="100" y1="38" x2="100" y2="14" />
        </g>
        <g stroke="currentColor" strokeWidth="1.5" fill="rgba(20,100,110,.15)">
          <rect className="punch-ni-floor-a" x="40" y="26" width="60" height="12" />
          <rect className="punch-ni-floor-b" x="40" y="14" width="60" height="12" />
          <rect className="punch-ni-floor-c" x="40" y="4" width="60" height="10" />
        </g>
        {/* crane: tower, counterweight, swaying jib */}
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          <path d="M146 60 V10 M154 60 V10 M146 60 L154 48 M154 60 L146 48 M146 48 L154 36 M154 48 L146 36 M146 36 L154 24 M154 36 L146 24 M146 24 L154 10 M154 24 L146 10" strokeWidth="1" />
        </g>
        <g className="punch-ni-jib" stroke="currentColor" strokeWidth="1.5">
          <line x1="120" y1="10" x2="182" y2="10" />
          <path d="M150 10 L150 2 L120 10 M150 2 L182 10" fill="none" strokeWidth="1" />
          <rect x="176" y="10" width="8" height="6" fill="currentColor" />
          {/* hoisted load on a cable */}
          <line className="punch-ni-cable" x1="126" y1="10" x2="126" y2="40" strokeWidth="1" />
          <g className="punch-ni-load">
            <rect x="120" y="40" width="12" height="7" fill="#b45309" stroke="none" />
          </g>
        </g>
      </svg>

      {/* Cutaway: pixel underground, subway passing through */}
      <style>{`
        @keyframes punch-ni-subway{from{transform:translateX(-40px)}to{transform:translateX(66px)}}
        .punch-ni-subway{animation:punch-ni-subway 7s steps(53) infinite}
        @media (prefers-reduced-motion: reduce){.punch-ni-subway{animation:none;transform:translateX(14px)}}
      `}</style>
      <svg
        viewBox="0 0 64 26"
        role="img"
        aria-label="Pixel cutaway of the ground under the site with a subway train passing through a tunnel"
        className="w-full shrink-0 border-y-2 border-teal-950/60"
        shapeRendering="crispEdges"
      >
        {/* soil layers */}
        <rect width="64" height="26" fill="#7a5230" />
        <rect width="64" height="3" fill="#5b3d22" />
        <rect y="21" width="64" height="5" fill="#5f4a3a" />
        {/* speckles: fixed positions so server and client agree */}
        {SPECKLES.map(([x, y, c], i) => (
          <rect key={i} x={x} y={y} width="1" height="1" fill={c} />
        ))}
        {/* foundation piles under the building */}
        <g fill="#9ca3af">
          <rect x="13" y="0" width="2" height="8" />
          <rect x="22" y="0" width="2" height="8" />
          <rect x="31" y="0" width="2" height="8" />
          <rect x="13" y="0" width="20" height="1" fill="#6b7280" />
        </g>
        {/* utility pipe + manhole shaft */}
        <rect x="40" y="4" width="24" height="2" fill="#b45309" />
        <rect x="40" y="4" width="24" height="1" fill="#d97706" />
        <rect x="50" y="0" width="2" height="5" fill="#b45309" />
        {/* tunnel with stepped arch corners */}
        <rect x="0" y="9" width="64" height="11" fill="#1f2937" />
        <rect x="0" y="8" width="64" height="1" fill="#4b5563" />
        <rect x="0" y="20" width="64" height="1" fill="#4b5563" />
        {/* ceiling lamps */}
        {[6, 20, 34, 48, 60].map((x) => (
          <rect key={x} x={x} y="9" width="2" height="1" fill="#fde047" />
        ))}
        {/* rails and sleepers */}
        <rect x="0" y="18" width="64" height="1" fill="#9ca3af" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={i * 4 + 1} y="19" width="2" height="1" fill="#78350f" />
        ))}
        {/* the subway: three cars, steps() makes it move pixel by pixel */}
        <g className="punch-ni-subway">
          {[0, 12, 24].map((x) => (
            <g key={x}>
              <rect x={x} y="11" width="11" height="7" fill="#e5e7eb" />
              <rect x={x} y="15" width="11" height="1" fill="#2dd4bf" />
              <rect x={x} y="11" width="11" height="1" fill="#9ca3af" />
              <rect x={x + 1} y="12" width="2" height="2" fill="#fde68a" />
              <rect x={x + 4} y="12" width="2" height="2" fill="#fde68a" />
              <rect x={x + 7} y="12" width="2" height="2" fill="#fde68a" />
              <rect x={x + 1} y="17" width="2" height="1" fill="#111827" />
              <rect x={x + 8} y="17" width="2" height="1" fill="#111827" />
            </g>
          ))}
          {/* headlight on the lead car */}
          <rect x="36" y="16" width="1" height="1" fill="#fef08a" />
        </g>
      </svg>

      {/* Toolkit, as plain print on the card */}
      <p className="text-center text-[10px] uppercase tracking-widest text-teal-900/70">
        {USER.toolkit}
      </p>
    </div>
  );
}

export const punchCardNI = {
  id: "punch-card-NI",
  label: "Punch card",
  cards: [
    {
      id: "punch-card",
      label: USER.name,
      order: 92,
      span: 1,
      hint: USER.github,
      Card: PunchCard,
    },
  ],
};
