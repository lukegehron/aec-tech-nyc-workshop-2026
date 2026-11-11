"use client";

// Weekend-pass lanyard: an Arizona-sunset, holographic conference badge on a swinging
// strap with a hole punch. Avatar, name, title, barcode.
// Toolkit chips and check-in sit on the front. State survives reload via useCardState.

import { useState } from "react";
import { useCardState } from "../../storage";

const USER = {
  name: "Melissa",
  initials: "ME",
  title: "All-In Subscriber",
  github: "@melissa-wastell",
  seat: "Other",
  toolkit: "Excel · Revit · Claude · ChatGPT",
  sticker: "💎",
  passNo: "0042",
};

const STICKERS = ["💎", "🚀", "🏗️", "✨", "🦄", "🔥", "🌊"];

const CHIP_COLORS = [
  "border-lime-400 bg-lime-400 text-black",
  "border-cyan-300 bg-cyan-300 text-black",
  "border-yellow-300 bg-yellow-300 text-black",
  "border-pink-400 bg-pink-400 text-black",
  "border-orange-400 bg-orange-400 text-black",
];

const SEAT_COLORS = {
  developer: "bg-indigo-500",
  designer: "bg-pink-500",
  architect: "bg-orange-500",
  engineer: "bg-sky-500",
  other: "bg-fuchsia-500",
};

// Solid extruded edge (card thickness) + drop shadow + neon glow.
const EDGE = [1, 2, 3, 4, 5, 6, 7, 8]
  .map((n) => `${n}px ${n}px 0 ${n < 8 ? "#4d7c0f" : "#365314"}`)
  .concat(["14px 22px 28px rgba(0,0,0,.9)", "0 0 26px rgba(163,230,53,.45)"])
  .join(",");

// Arizona sunset: mesa + saguaro silhouette over a glowing sun and dusk sky.
const SILHOUETTE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100' preserveAspectRatio='none'><path fill='%23190a2e' d='M0 100V72H40L50 56H110L120 72H150V64H190L200 50H260L268 64H300V76H340L350 60H400V100Z'/><path fill='%23190a2e' d='M312 100V45Q316 38 320 45V100ZM312 70H304V55Q307 52 309 55V66H312ZM320 62H328V48Q331 45 333 48V68H320Z'/></svg>\")";
const SUNSET = [
  `${SILHOUETTE} bottom / 100% 26% no-repeat`,
  "radial-gradient(circle at 50% 74%, #fff7ae 0 6%, rgba(253,224,71,.75) 12%, rgba(251,146,60,.35) 34%, transparent 58%)",
  "linear-gradient(to bottom, #1e1b4b 0%, #581c87 22%, #be185d 44%, #f97316 66%, #fbbf24 82%, #fde68a 100%)",
].join(",");

const DEFAULT_STATE = {
  sticker: 0,
};

const CSS = `
@keyframes lanyard-me-swing{0%,100%{transform:rotate(-2.2deg)}50%{transform:rotate(2.2deg)}}
@keyframes lanyard-me-sheen{0%{transform:translateX(-130%) skewX(-20deg)}55%,100%{transform:translateX(330%) skewX(-20deg)}}
@keyframes lanyard-me-spark{0%{opacity:1;transform:translate(0,0) scale(.4)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.3) rotate(120deg)}}
.lanyard-me-swing{transform-origin:50% 0;animation:lanyard-me-swing 5s ease-in-out infinite}
.lanyard-me-swing:hover{animation-play-state:paused}
.lanyard-me-sheen{animation:lanyard-me-sheen 4.5s ease-in-out infinite}
.lanyard-me-spark{animation:lanyard-me-spark .9s ease-out forwards}
@media (prefers-reduced-motion:reduce){.lanyard-me-swing,.lanyard-me-sheen{animation:none}}
`;

function splitToolkit(toolkit) {
  return Array.isArray(toolkit)
    ? toolkit.map((tool) => String(tool))
    : String(toolkit ?? "")
        .split("·")
        .map((tool) => tool.trim())
        .filter(Boolean);
}

// Decorative barcode: bar widths derived from the pass number + initials.
function barWidths(seed) {
  let h = 7;
  const out = [];
  for (let i = 0; i < 38; i += 1) {
    h = (h * 31 + seed.charCodeAt(i % seed.length) + i) % 9973;
    out.push((h % 3) + 1);
  }
  return out;
}

function Barcode({ seed }) {
  const bars = barWidths(seed);
  return (
    <div
      aria-hidden="true"
      className="flex h-7 items-stretch justify-center gap-px"
    >
      {bars.map((w, i) => (
        <span
          key={i}
          className={i % 2 === 0 ? "bg-slate-900" : "bg-transparent"}
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

function Portrait({ url, initials, size }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-zinc-800 font-heading font-bold text-lime-300`}
    >
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${initials} portrait`}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return {
    dx: `${Math.round(Math.cos(angle) * 52)}px`,
    dy: `${Math.round(Math.sin(angle) * 52)}px`,
    glyph: ["✨", "💎", "⭐", "🎉"][i % 4],
  };
});

// Avatar: portrait in a ring, sticker badge in the corner. Tap = sparkle.
// Tap the badge = next sticker.
function Avatar({ url, initials, sticker, size, burst, onBurst, onSticker }) {
  return (
    <div
      className="relative shrink-0"
      style={{ transform: "translateZ(50px)", filter: "drop-shadow(0 8px 6px rgba(0,0,0,.7))" }}
    >
      <button
        type="button"
        onClick={onBurst}
        aria-label="Sparkle"
        className="rounded-full bg-lime-400 p-[1.5cqw] ring-2 ring-cyan-300"
      >
        <Portrait url={url} initials={initials} size={size} />
      </button>
      <button
        type="button"
        onClick={onSticker}
        aria-label="Change sticker"
        className="absolute -right-[3cqw] -bottom-[3cqw] flex size-[12cqw] items-center justify-center rounded-full border-2 border-lime-400 bg-black text-[7cqw]"
      >
        {sticker}
      </button>
      {burst ? (
        <span key={burst} className="pointer-events-none absolute inset-0">
          {SPARKS.map((s, i) => (
            <span
              key={i}
              className="lanyard-me-spark absolute top-1/2 left-1/2 text-sm"
              style={{ "--dx": s.dx, "--dy": s.dy }}
            >
              {s.glyph}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

function LanyardPass({ expanded }) {
  const you = USER;
  const [saved, setSaved] = useCardState("lanyard-ME", DEFAULT_STATE);
  const state = { ...DEFAULT_STATE, ...saved };
  const update = (patch) => setSaved({ ...state, ...patch });

  const [tilt, setTilt] = useState({ x: 0, y: 0, mx: 50, my: 50 });
  const [burst, setBurst] = useState(0);
  const [lit, setLit] = useState([]);

  const github = (you.github || "").replace(/^@/, "");
  const portraitUrl = github ? `https://github.com/${github}.png` : null;
  const toolkit = splitToolkit(you.toolkit);
  const sticker = STICKERS[state.sticker % STICKERS.length] ?? you.sticker;
  const seatColor = SEAT_COLORS[you.seat.toLowerCase()] ?? SEAT_COLORS.other;

  const avatarProps = {
    url: portraitUrl,
    initials: you.initials,
    sticker,
    burst,
    onBurst: () => setBurst((n) => n + 1),
    onSticker: () => update({ sticker: (state.sticker + 1) % STICKERS.length }),
  };

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - py) * 24, y: (px - 0.5) * 28, mx: px * 100, my: py * 100 });
  }

  return (
    <div
      className="lanyard-me-root flex h-full flex-col items-center gap-2 overflow-hidden rounded-lg bg-black p-3"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 14px),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 14px)",
      }}
    >
      <style>{CSS}</style>

      <div className="lanyard-me-swing flex w-full flex-1 flex-col items-center">
        {/* Strap + hole punch */}
        <div className="flex flex-col items-center">
          <div className="h-5 w-3 bg-lime-400" />
          <div className="-mt-1 flex h-4 w-12 items-center justify-center rounded-t-lg border border-b-0 border-border bg-card">
            <span className="h-1.5 w-7 rounded-full border border-border bg-background" />
          </div>
        </div>

        {/* Tilt wrapper */}
        <div
          className={`-mt-2 flex w-full flex-1 ${expanded ? "max-w-md" : "max-w-xs"}`}
          style={{ perspective: 700 }}
          onMouseMove={onMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0, mx: 50, my: 50 })}
        >
          <div
            className="relative flex w-full flex-1 transition-transform duration-100 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            {/* Pass face */}
            <div
              className="grid w-full flex-1"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT */}
              <div
                className="relative flex flex-col rounded-lg border-2 border-lime-400 text-white [grid-area:1/1]"
                style={{
                  backfaceVisibility: "hidden",
                  containerType: "inline-size",
                  transformStyle: "preserve-3d",
                  boxShadow: EDGE,
                  background: SUNSET,
                }}
              >
                <div className="flex items-center justify-between rounded-t-md bg-lime-400 px-[4cqw] py-[1.5cqw] text-[5cqw] font-black uppercase tracking-wider text-black">
                  <span>Weekend Pass</span>
                  <span className="font-mono tracking-wider">No. {you.passNo} · {you.initials}</span>
                </div>

                {/* Seat ribbon (clipped in its own box so the card can stay 3D) */}
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                  style={{ transform: "translateZ(14px)" }}
                >
                <div
                  className={`${seatColor} absolute top-[11cqw] -right-[16cqw] w-[48cqw] rotate-45 py-[0.5cqw] text-center text-[5cqw] font-black uppercase tracking-widest text-black shadow`}
                >
                  {you.seat}
                </div>
                </div>

                <div
                  className="flex flex-1 flex-col items-center justify-center gap-[2.5cqw] p-[4cqw] text-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Avatar {...avatarProps} size="size-[32cqw] text-[12cqw]" />
                  <p
                    className="font-heading text-[20cqw] leading-none font-black tracking-tight text-white"
                    style={{ transform: "translateZ(34px)", textShadow: "0 3px 0 #831843, 0 6px 12px rgba(25,10,46,.9)" }}
                  >
                    {you.name}
                  </p>
                  <p
                    className="text-[9cqw] leading-tight font-bold text-white"
                    style={{ transform: "translateZ(22px)", textShadow: "0 2px 6px rgba(25,10,46,.95)" }}
                  >
                    {you.title}
                  </p>
                  <a
                    href={`https://github.com/${github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[8cqw] leading-tight font-bold text-yellow-100 [text-shadow:0_2px_6px_rgba(25,10,46,.95)] underline-offset-4 hover:underline"
                  >
                    {you.github}
                  </a>

                  <ul
                    className="mt-[1cqw] flex flex-wrap justify-center gap-[2cqw]"
                    style={{ transform: "translateZ(26px)" }}
                  >
                    {toolkit.map((tool, i) => {
                      const on = lit.includes(tool);
                      return (
                        <li key={tool}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => setLit(on ? lit.filter((t) => t !== tool) : [...lit, tool])}
                            className={`rounded-full border-2 px-[3.5cqw] py-[0.5cqw] text-[7cqw] leading-tight font-black transition-transform ${CHIP_COLORS[i % CHIP_COLORS.length]} ${on ? "scale-110 ring-2 ring-white" : "opacity-90 hover:opacity-100"}`}
                          >
                            {tool}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-border bg-white px-3 py-1.5">
                  <Barcode seed={`${you.passNo}${you.initials}${github}`} />
                </div>

                {/* Holographic sheen */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                  <div
                    className="lanyard-me-sheen absolute inset-y-0 w-1/3"
                    style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.55),rgba(167,243,208,.35),transparent)" }}
                  />
                  <div
                    className="absolute inset-0 mix-blend-soft-light"
                    style={{ background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%,rgba(255,255,255,.7),transparent 55%)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const lanyardME = {
  id: "lanyard-ME",
  label: "Weekend-pass lanyard",
  cards: [
    {
      id: "lanyard",
      label: "Melissa",
      order: 91,
      span: 1,
      hint: "@melissa-wastell",
      Card: LanyardPass,
    },
  ],
};
