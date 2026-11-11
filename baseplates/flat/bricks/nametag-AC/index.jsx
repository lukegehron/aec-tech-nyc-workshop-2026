"use client";

// A nerdy guy wearing a "HELLO my name is" nametag with a big, clear name.

function NerdWithNametag({ className }) {
  return (
    <svg
      viewBox="0 0 240 270"
      className={className}
      role="img"
      aria-label="A nerdy guy wearing a nametag that says A-A-Ron"
    >
      {/* torso / shirt */}
      <path d="M20 270 C20 205 45 160 90 150 L150 150 C195 160 220 205 220 270 Z" fill="#e5e7eb" stroke="#1f2937" strokeWidth="3" />
      {/* neck */}
      <rect x="102" y="112" width="36" height="42" fill="#f1c9a5" stroke="#1f2937" strokeWidth="3" />
      {/* collar */}
      <path d="M90 150 L120 182 L108 148 Z M150 150 L120 182 L132 148 Z" fill="#fff" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
      {/* pocket protector with pens */}
      <rect x="168" y="168" width="34" height="30" rx="3" fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
      <rect x="173" y="156" width="5" height="22" rx="2" fill="#2563eb" stroke="#1f2937" strokeWidth="1.5" />
      <rect x="181" y="152" width="5" height="26" rx="2" fill="#dc2626" stroke="#1f2937" strokeWidth="1.5" />
      <rect x="189" y="158" width="5" height="20" rx="2" fill="#16a34a" stroke="#1f2937" strokeWidth="1.5" />
      {/* head */}
      <ellipse cx="120" cy="70" rx="46" ry="52" fill="#f1c9a5" stroke="#1f2937" strokeWidth="3" />
      {/* ears */}
      <ellipse cx="74" cy="76" rx="7" ry="11" fill="#f1c9a5" stroke="#1f2937" strokeWidth="3" />
      <ellipse cx="166" cy="76" rx="7" ry="11" fill="#f1c9a5" stroke="#1f2937" strokeWidth="3" />
      {/* neat side-parted hair */}
      <path d="M75 62 C70 24 100 10 125 14 C152 14 170 30 165 62 C150 44 120 36 95 40 C86 42 79 50 75 62 Z" fill="#3f2a1d" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
      {/* big round glasses */}
      <circle cx="100" cy="74" r="17" fill="#fff" stroke="#1f2937" strokeWidth="4" />
      <circle cx="140" cy="74" r="17" fill="#fff" stroke="#1f2937" strokeWidth="4" />
      <path d="M117 72 Q120 68 123 72" fill="none" stroke="#1f2937" strokeWidth="4" />
      <path d="M83 72 L76 70 M157 72 L164 70" stroke="#1f2937" strokeWidth="4" />
      <circle cx="102" cy="76" r="4" fill="#1f2937" />
      <circle cx="138" cy="76" r="4" fill="#1f2937" />
      {/* glare */}
      <path d="M91 66 L97 62" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      <path d="M131 66 L137 62" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      {/* nose + buck-toothed smile */}
      <path d="M120 82 Q116 94 122 96" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 108 Q120 122 140 108" fill="#fff" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
      <path d="M118 114 L118 120 M122 114 L122 120" stroke="#1f2937" strokeWidth="1.5" />

      {/* the nametag, pinned to his chest */}
      <g transform="rotate(-3 100 210)">
        <rect x="22" y="178" width="150" height="78" rx="6" fill="#fff" stroke="#b91c1c" strokeWidth="3" />
        <path d="M25 181 H169 a3 3 0 0 1 3 3 V204 H22 V184 a3 3 0 0 1 3 -3 Z" fill="#dc2626" />
        <text x="97" y="193" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="13" letterSpacing="3" fill="#fff">
          HELLO
        </text>
        <text x="97" y="203" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="8" letterSpacing="1.5" fill="#fff">
          MY NAME IS
        </text>
        <text x="97" y="239" textAnchor="middle" textLength="130" lengthAdjust="spacingAndGlyphs" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="32" fill="#111827">
          A-A-Ron
        </text>
        <circle cx="32" cy="190" r="2.5" fill="#fff" opacity="0.8" />
      </g>
    </svg>
  );
}

function NametagCard({ expanded }) {
  return (
    <div className="flex h-full items-center justify-center p-2">
      <NerdWithNametag className={expanded ? "w-full max-w-xl" : "w-full max-w-[16rem]"} />
    </div>
  );
}

export const nametagAC = {
  id: "nametag-AC",
  label: "A-A-Ron",
  cards: [
    {
      id: "nametag",
      label: "A-A-Ron",
      order: 30,
      span: 1,
      hint: "hello!",
      Card: NametagCard,
    },
  ],
};
