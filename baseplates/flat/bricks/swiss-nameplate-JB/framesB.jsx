import { RED, INK, GREY, mv } from "./shared";

// 06 AXONOMETRIC — the cube explodes into its three planes, which slide in
// parallax against each other as the cursor moves.
function Cube({ x, y, h }) {
  return (
    <>
      <polygon
        points="20,6 33,13 20,20 7,13" fill={GREY}
        style={mv(`translate(${x * 2}px, ${(h ? -3 : 0) + y * 1.5}px)`, { ms: 650 })}
      />
      <polygon
        points="7,13 20,20 20,35 7,28" fill={INK}
        style={mv(`translate(${(h ? -1.8 : 0) + x * 0.8}px, ${h ? 1.2 : 0}px)`, { ms: 650 })}
      />
      <polygon
        points="33,13 20,20 20,35 33,28" fill={RED}
        style={mv(`translate(${(h ? 1.8 : 0) + x * 0.8}px, ${h ? 1.2 : 0}px)`, { ms: 650 })}
      />
    </>
  );
}

// 07 PITCHED ROOF — the roof tilts toward the cursor on its eaves and lifts,
// while the door swings open to reveal a red interior.
function Roof({ x, h }) {
  return (
    <>
      <rect x="9" y="18" width="22" height="16" fill={INK} />
      <rect x="17" y="24" width="6" height="10" fill={RED} />
      <rect
        x="17" y="24" width="6" height="10" fill="#fff"
        style={mv(`scaleX(${h ? 0.2 : 1})`, { origin: "0% 50%", ms: 600 })}
      />
      <polygon
        points="6,18 20,6 34,18" fill={RED}
        style={mv(`translateY(${h ? -2 : 0}px) rotate(${x * 7}deg)`, { origin: "50% 100%", ms: 450 })}
      />
    </>
  );
}

// 08 NESTED SQUARES — the inner squares unscrew in opposite directions to a
// diamond; the cursor adds a twist and the red core swells.
function Nested({ x, y, h }) {
  return (
    <>
      <rect x="6" y="6" width="28" height="28" fill={INK} />
      <rect
        x="11" y="11" width="18" height="18" fill="#fff"
        style={mv(`rotate(${h ? 45 + x * 20 : 0}deg)`, { ms: 800 })}
      />
      <rect
        x="16" y="16" width="8" height="8" fill={RED}
        style={mv(`rotate(${h ? -45 - x * 20 : 0}deg) scale(${h ? 1.2 + (y + 1) * 0.3 : 1})`, { ms: 800 })}
      />
    </>
  );
}

// 09 COLONNADE — columns slide at different depths against the beam
// (parallax), and each casts a shadow that widens as the cursor moves right.
function Colonnade({ x, h }) {
  return (
    <>
      <rect x="5" y="34" width="30" height="2" fill={GREY} />
      {[8, 16, 24, 32].map((cx, i) => (
        <g key={cx}>
          <rect
            x={cx + 1.5} y="12" width="5" height="22" fill={GREY}
            style={mv(`translateX(${x * (i - 1.5)}px) scaleX(${h ? 0.3 + (x + 1) * 0.35 : 0})`, { origin: "0% 50%", ms: 600, delay: i * 40 })}
          />
          <rect
            x={cx - 1.5} y="12" width="3" height="22" fill={i === 2 ? RED : INK}
            style={mv(`translateX(${x * (i - 1.5)}px)`, { ms: 600, delay: i * 40 })}
          />
        </g>
      ))}
      <rect x="5" y="8" width="30" height="4" fill={INK} style={mv(`translateX(${-x * 1.5}px)`, { ms: 600 })} />
    </>
  );
}

export const framesB = [Cube, Roof, Nested, Colonnade];
