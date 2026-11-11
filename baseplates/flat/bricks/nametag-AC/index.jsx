"use client";

// A "HELLO my name is" nametag, name written by hand with a pencil-sketched house.

const HANDWRITING =
  '"Segoe Script", "Bradley Hand", "Brush Script MT", "Comic Sans MS", "Apple Chancery", cursive';

// Slightly wobbly strokes so the house looks drawn, not rendered.
function HouseSketch({ className }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      fill="none"
      stroke="#1f2937"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Sketch of a house"
      role="img"
    >
      {/* walls */}
      <path d="M22 50 C21 61 23 74 22 88 C40 89 75 87 98 89 C97 76 99 62 98 50" />
      {/* roof */}
      <path d="M10 53 C28 38 45 24 60 12 C75 25 93 39 111 52" />
      {/* chimney */}
      <path d="M82 33 C82 26 82 20 81 16 C86 15 90 16 92 15 C92 22 93 30 93 42" />
      {/* door */}
      <path d="M52 89 C51 79 52 70 51 63 C56 62 63 63 68 62 C69 70 68 80 69 88" />
      <circle cx="64" cy="76" r="1.2" fill="#1f2937" />
      {/* window */}
      <path d="M30 58 C35 57 39 58 43 57 C44 62 43 67 44 71 C39 72 34 71 30 72 C31 67 29 62 30 58 Z" />
      <path d="M37 57 C37 62 36 67 37 72 M30 65 C34 64 39 65 44 64" strokeWidth="1.6" />
      {/* smoke */}
      <path d="M87 11 C83 7 90 5 86 1 M93 9 C90 6 96 4 93 0" strokeWidth="1.4" opacity="0.6" />
      {/* ground and grass */}
      <path d="M4 91 C30 93 70 90 116 92" strokeWidth="1.8" />
      <path d="M10 91 L8 86 M13 91 L14 85 M106 92 L104 87 M109 92 L111 86" strokeWidth="1.5" />
    </svg>
  );
}

function NametagCard({ expanded }) {
  return (
    <div className="flex h-full items-center justify-center p-2">
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-lg border-2 border-red-700 bg-white shadow-sm">
        <div className="bg-red-600 px-3 py-2 text-center">
          <p
            className={`font-heading font-bold uppercase tracking-widest text-white ${
              expanded ? "text-3xl" : "text-lg"
            }`}
          >
            Hello
          </p>
          <p
            className={`uppercase tracking-wide text-white/90 ${
              expanded ? "text-base" : "text-[10px]"
            }`}
          >
            my name is
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 px-3 py-4">
          <p
            className={`-rotate-3 leading-none text-blue-900 ${
              expanded ? "text-6xl" : "text-3xl"
            }`}
            style={{ fontFamily: HANDWRITING, fontStyle: "italic" }}
          >
            A-A-Ron
          </p>
          <HouseSketch className={expanded ? "w-32" : "w-16"} />
        </div>
      </div>
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
