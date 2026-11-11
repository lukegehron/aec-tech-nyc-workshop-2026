"use client";

// ─── THE OFFICE DOG ──────────────────────────────────────────────────────────
// A blue merle Australian Shepherd, drawn in plain SVG because this baseplate
// has no libraries and an <img> of a dog would be a network request that can
// fail on venue Wi-Fi. Tri-colour: merle body, white blaze and chest, copper
// cheeks and legs, one blue eye and one brown — which is very Aussie.
//
// `className` lets the caller size her; everything scales from the viewBox.

export function AussieShepherd({ className = "size-10", title = "Australian Shepherd" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>

      {/* Merle speckles live in a pattern so the coat reads as merle, not grey */}
      <defs>
        <pattern
          id="aussie-me-merle"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="8" fill="#7d8a99" />
          <circle cx="2" cy="2" r="1.6" fill="#2f3845" />
          <circle cx="6.5" cy="5" r="1.1" fill="#2f3845" />
          <circle cx="4" cy="7" r="0.8" fill="#c8d0d8" />
        </pattern>
      </defs>

      {/* Tail — the nub, because many Aussies have one */}
      <ellipse cx="13" cy="42" rx="3.4" ry="2.6" fill="url(#aussie-me-merle)" />

      {/* Haunch and body, sitting */}
      <path
        d="M16 52c-2-9 1-17 8-20l14-2c7 1 11 7 11 14 0 4-1 7-3 8z"
        fill="url(#aussie-me-merle)"
      />

      {/* Copper front leg + white paw */}
      <path d="M40 44c3 0 5 3 5 8h-6c-1-4-1-6 1-8z" fill="#b5703a" />
      <ellipse cx="42" cy="52.5" rx="3.6" ry="2" fill="#f5f1ea" />

      {/* White chest blaze running down the front */}
      <path d="M36 32c4 2 6 7 5 13l-6 1c-2-6-2-11 1-14z" fill="#f5f1ea" />

      {/* Head */}
      <path
        d="M30 14c7-2 14 2 15 9 1 6-3 11-9 12s-12-2-13-8c-1-6 1-11 7-13z"
        fill="url(#aussie-me-merle)"
      />

      {/* Copper cheek patch */}
      <path d="M29 28c3 3 8 4 12 2-1 4-5 6-9 5-2-1-3-4-3-7z" fill="#b5703a" />

      {/* White muzzle and blaze up the forehead */}
      <path d="M33 22l5-9 4 9c0 5-2 8-5 8s-4-3-4-8z" fill="#f5f1ea" />

      {/* Dropped ears */}
      <path d="M27 13c-3 0-5 3-5 7l6-3z" fill="#2f3845" />
      <path d="M45 15c3-1 6 2 6 6l-7-3z" fill="#2f3845" />

      {/* Eyes — one blue, one brown. The Aussie signature. */}
      <circle cx="33" cy="22" r="2.1" fill="#f5f1ea" />
      <circle cx="33" cy="22" r="1.3" fill="#4a9bd1" />
      <circle cx="43" cy="23" r="2.1" fill="#f5f1ea" />
      <circle cx="43" cy="23" r="1.3" fill="#6b4423" />

      {/* Nose and smile */}
      <ellipse cx="38" cy="29" rx="2.4" ry="1.8" fill="#1b2029" />
      <path
        d="M38 31v2m0 0c-1.5 0-2.5-.8-3-1.6m3 1.6c1.5 0 2.5-.8 3-1.6"
        stroke="#1b2029"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
