"use client";

const USER = {
  name: "Jeff",
  initials: "JB",
  title: "AEC AI Scout",
  github: "@JFFBLY3",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · Grasshopper · ChatGPT · Claude",
};

// Mid-century Swiss (International Typographic Style): strict grid, flush-left
// ragged-right sans-serif, one red accent, white ground, heavy rules, no ornament.
const RED = "#e30613";
const INK = "#111111";
const GREY = "#c8c8c8";
const FONT = '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif';


// Contact sheet: nine abstract architectural studies on a 40x40 module.
// Plan, elevation, section and axonometric, reduced to black, grey and one red.
const FRAMES = [
  // 01 plan: square with a circular void
  <>
    <rect x="6" y="6" width="28" height="28" fill={INK} />
    <circle cx="20" cy="20" r="8" fill={RED} />
  </>,
  // 02 elevation: vertical fins
  <>
    {[6, 11, 16, 23, 30].map((x, i) => (
      <rect key={x} x={x} y={i === 3 ? 12 : 6} width={i % 2 ? 2 : 4} height={i === 3 ? 22 : 28} fill={i === 3 ? RED : INK} />
    ))}
  </>,
  // 03 section: stair
  <>
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={6 + i * 5.6} y={34 - (i + 1) * 5.6} width="5.6" height={(i + 1) * 5.6} fill={i === 4 ? RED : INK} />
    ))}
  </>,
  // 04 elevation: arch
  <>
    <rect x="6" y="6" width="28" height="28" fill={GREY} />
    <path d="M12 34V20a8 8 0 0 1 16 0v14z" fill={INK} />
    <circle cx="20" cy="14" r="2.5" fill={RED} />
  </>,
  // 05 facade: window grid, one lit
  <>
    {[0, 1, 2].flatMap((r) =>
      [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={7 + c * 9.5} y={7 + r * 9.5} width="7" height="7" fill={r === 1 && c === 2 ? RED : INK} />
      ))
    )}
  </>,
  // 06 axonometric: cube
  <>
    <polygon points="20,6 33,13 20,20 7,13" fill={GREY} />
    <polygon points="7,13 20,20 20,35 7,28" fill={INK} />
    <polygon points="33,13 20,20 20,35 33,28" fill={RED} />
  </>,
  // 07 elevation: pitched roof
  <>
    <polygon points="6,18 20,6 34,18" fill={RED} />
    <rect x="9" y="18" width="22" height="16" fill={INK} />
    <rect x="17" y="24" width="6" height="10" fill="#fff" />
  </>,
  // 08 plan: nested squares
  <>
    <rect x="6" y="6" width="28" height="28" fill={INK} />
    <rect x="11" y="11" width="18" height="18" fill="#fff" />
    <rect x="16" y="16" width="8" height="8" fill={RED} />
  </>,
  // 09 elevation: colonnade
  <>
    <rect x="5" y="8" width="30" height="4" fill={INK} />
    {[8, 16, 24, 32].map((x, i) => (
      <rect key={x} x={x - 1.5} y="12" width="3" height="22" fill={i === 2 ? RED : INK} />
    ))}
    <rect x="5" y="34" width="30" height="2" fill={GREY} />
  </>,
];

function ContactSheet() {
  return (
    <div className="grid w-full grid-cols-3 gap-1.5" role="img" aria-label="Contact sheet of architectural compositions">
      {FRAMES.map((frame, i) => (
        <div key={i}>
          <svg viewBox="0 0 40 40" className="block aspect-square w-full bg-neutral-100" aria-hidden>
            {frame}
          </svg>
          <p className="mt-0.5 text-[8px] font-bold tabular-nums leading-none tracking-widest">
            {String(i + 1).padStart(2, "0")}
          </p>
        </div>
      ))}
    </div>
  );
}

function SwissNameplate({ expanded }) {
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div
      className="flex h-full min-h-48 flex-col bg-white p-4"
      style={{ fontFamily: FONT, color: INK }}
    >
      {/* Heavy top rule + running head */}
      <div className="flex items-baseline justify-between border-t-[6px] border-[#111] pt-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
        <span>{USER.seat}</span>
        <span style={{ color: RED }}>{USER.initials}</span>
      </div>

      {/* 12-col grid: name spans 8, contact sheet spans 4 */}
      <div className="mt-3 grid flex-1 grid-cols-12 gap-x-3">
        <div className="col-span-8 flex flex-col justify-between">
          <h2
            className={`font-bold leading-[0.9] tracking-tighter ${
              expanded ? "text-8xl" : "text-5xl"
            }`}
          >
            {USER.name}
          </h2>
          <div>
            <div className="mb-2 h-1 w-10" style={{ background: RED }} />
            <p
              className={`font-medium leading-tight ${
                expanded ? "text-2xl" : "text-base"
              }`}
            >
              {USER.title}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">{USER.github}</p>
          </div>
        </div>

        <div className="col-span-4">
          <ContactSheet />
        </div>
      </div>

      {/* Toolkit: thin rule, small caps-style list aligned to the grid */}
      <div className="mt-3 grid grid-cols-12 gap-x-3 border-t border-[#111] pt-1.5">
        <p className="col-span-4 text-[10px] font-bold uppercase tracking-[0.2em]">
          Toolkit
        </p>
        <ul className="col-span-8 text-xs leading-snug">
          {toolkit.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const swissNameplateJB = {
  id: "swiss-nameplate-JB",
  label: "Swiss nameplate",
  cards: [
    {
      id: "swiss-nameplate",
      label: USER.name,
      order: 93,
      span: 2,
      hint: USER.github,
      Card: SwissNameplate,
    },
  ],
};
