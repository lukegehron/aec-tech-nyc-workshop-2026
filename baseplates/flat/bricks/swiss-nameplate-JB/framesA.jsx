import { RED, INK, GREY, mv } from "./shared";

// Each frame is a function of the pointer: x, y in -1..1 across the tile,
// px, py in the 0..40 SVG space, and h (pointer is over the tile).

// 01 PLAN — the red void is a lens that follows the cursor inside the solid;
// a white ring trails it at half speed, like a light well seen in plan.
function Plan({ x, y, h }) {
  return (
    <>
      <rect x="6" y="6" width="28" height="28" fill={INK} />
      <circle
        cx="20" cy="20" r="11" fill="none" stroke="#fff" strokeWidth="0.6"
        style={mv(`translate(${x * 2.5}px, ${y * 2.5}px) scale(${h ? 1 : 0.7})`, { ms: 800, opacity: h ? 0.8 : 0 })}
      />
      <circle
        cx="20" cy="20" r="8" fill={RED}
        style={mv(`translate(${x * 4.5}px, ${y * 4.5}px) scale(${h ? 1.15 : 1})`, { ms: 350 })}
      />
    </>
  );
}

// 02 FINS — brise-soleil: fins nearest the cursor widen like louvres
// closing, and flush red as they do.
const FINS = [[6, 4], [11, 2], [16, 4], [23, 2], [30, 4]];
function Fins({ px, h }) {
  return (
    <>
      {FINS.map(([fx, w], i) => {
        const prox = h ? Math.max(0, 1 - Math.abs(fx + w / 2 - px) / 12) : 0;
        const isRed = i === 3;
        return (
          <rect
            key={fx} x={fx} y={isRed ? 12 : 6} width={w} height={isRed ? 22 : 28}
            fill={isRed || prox > 0.5 ? RED : INK}
            style={mv(`scaleX(${1 + prox * 1.8})`, { ms: 300 })}
          />
        );
      })}
    </>
  );
}

// 03 STAIR — the flight fans open horizontally with the cursor and each
// tread climbs a little more than the one below it (staggered).
function Stair({ x, y, h }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i} x={6 + i * 5.6} y={34 - (i + 1) * 5.6} width="5.6" height={(i + 1) * 5.6}
          fill={i === 4 ? RED : INK}
          style={mv(
            `translate(${x * (i - 2) * 1.5}px, ${h ? -i * 0.9 + y * (i - 2) * 0.5 : 0}px)`,
            { ms: 600, delay: i * 35, origin: "50% 100%" }
          )}
        />
      ))}
    </>
  );
}

// 04 ARCH — the red sun roams the opening and can rise out over the wall;
// an inner arch draws itself in as a second reveal.
function Arch({ x, y, h }) {
  return (
    <>
      <rect x="6" y="6" width="28" height="28" fill={GREY} />
      <path d="M12 34V20a8 8 0 0 1 16 0v14z" fill={INK} />
      <path
        d="M15.5 34V20a4.5 4.5 0 0 1 9 0v14" fill="none" stroke="#fff" strokeWidth="0.6"
        style={mv(`scale(${h ? 1 : 0.7})`, { origin: "50% 100%", ms: 700, opacity: h ? 0.85 : 0 })}
      />
      <circle
        cx="20" cy="14" r="2.5" fill={RED}
        style={mv(`translate(${x * 2.6}px, ${y * 8 + (h ? 2 : 0)}px) scale(${h ? 1.2 : 1})`, { ms: 450 })}
      />
    </>
  );
}

// 05 FACADE — windows light up as the cursor passes, swelling with
// proximity. The lit one at the edge stays lit.
function Facade({ px, py, h }) {
  return (
    <>
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => {
          const cx = 7 + c * 9.5 + 3.5;
          const cy = 7 + r * 9.5 + 3.5;
          const near = h ? Math.max(0, 1 - Math.hypot(cx - px, cy - py) / 13) : 0;
          return (
            <rect
              key={`${r}${c}`} x={7 + c * 9.5} y={7 + r * 9.5} width="7" height="7"
              fill={(r === 1 && c === 2) || near > 0.4 ? RED : INK}
              style={mv(`scale(${1 + near * 0.35})`, { ms: 300 })}
            />
          );
        })
      )}
    </>
  );
}

export const framesA = [Plan, Fins, Stair, Arch, Facade];
