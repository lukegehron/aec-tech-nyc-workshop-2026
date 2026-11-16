"use client";

// ─── TICKET STUB ─────────────────────────────────────────────────────────────
// A perforated admit-one ticket. name = label, title = event, seat = row,
// toolkit = venue. Portrait from GitHub, falling back to initials.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const USER = {
  name: "Reza",
  initials: "RE",
  title: "Agent Operator",
  github: "@rh-6",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · JavaScript · Python · Claude",
  sticker: "🤖",
};

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  const handle = USER.github.replace(/^@/, "");
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900 font-heading font-semibold text-neutral-300"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {failed ? (
        USER.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://github.com/${handle}.png`}
          alt={USER.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-neutral-400">
        {label}
      </p>
      <p className="text-sm font-medium leading-snug text-neutral-300 break-words">{children}</p>
    </div>
  );
}

// ── Orientation ─────────────────────────────────────────────────────────────
// The ticket lives inside a permanent 180° flip, so with no spin it reads
// upside down. A spin of (180°, 180°) cancels that flip: net rotation is the
// identity and the ticket reads right side up.
// Balloons launch once the card is at least 85% of the way to perfectly right
// side up. Worst possible error on an axis is 180 degrees, so 85% accurate
// means within 15% of 180 = 27 degrees on both axes (not necessarily perfect).
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3;

const BALLOON_ACCURACY = 0.85;
const BALLOON_TOLERANCE = (1 - BALLOON_ACCURACY) * 180;

// The kaleidoscope appears once the card has been turned 30% of the way to
// right side up (0.3 * 180 = 54 degrees) from its starting position, on either
// axis. Balloons come later, at 85% of the way (see BALLOON_TOLERANCE).
const KALEIDO_THRESHOLD = 0.3 * 180;

function turnedFarEnough(spin) {
  return (
    Math.abs(spin.x) > KALEIDO_THRESHOLD || Math.abs(spin.y) > KALEIDO_THRESHOLD
  );
}

// Nearest equivalent of 180° (180 + 360k) — avoids a long spin-back on snap.
const nearestHalfTurn = (deg) => Math.round((deg - 180) / 360) * 360 + 180;

function isNearUpright(spin) {
  return (
    Math.abs(spin.x - nearestHalfTurn(spin.x)) <= BALLOON_TOLERANCE &&
    Math.abs(spin.y - nearestHalfTurn(spin.y)) <= BALLOON_TOLERANCE
  );
}

// ── Kaleidoscope (sits BEHIND the card, on a white backdrop) ───────────────
function Kaleidoscope({ show }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg bg-white transition-opacity duration-500"
      style={{ opacity: show ? 1 : 0 }}
    >
      <div
        className="ticketRE-kaleido-a absolute"
        style={{
          inset: "-100%",
          opacity: 0.9,
          background:
            "repeating-conic-gradient(from 0deg at 50% 50%, #ff7ab8 0deg, #ffe066 15deg, #6fe7ff 30deg, #b18cff 45deg, #6fe7ff 60deg, #ffe066 75deg, #ff7ab8 90deg)",
        }}
      />
      <div
        className="ticketRE-kaleido-b absolute mix-blend-multiply"
        style={{
          inset: "-100%",
          opacity: 0.6,
          background:
            "repeating-conic-gradient(from 0deg at 50% 50%, #ffffff 0deg, #8affc9 10deg, #ffffff 20deg, #9aa0ff 30deg, #ffffff 40deg)",
        }}
      />
    </div>
  );
}

// ── Balloons (portalled to <body> so they float over the whole screen) ─────
const BALLOON_COLORS = [
  "#ff4d6d",
  "#ffd23f",
  "#3fa7ff",
  "#5be37d",
  "#b86bff",
  "#ff8c42",
];

function makeBalloons() {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: 4 + Math.random() * 90, // vw
    size: 44 + Math.random() * 40, // px
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    duration: 5 + Math.random() * 4, // s
    delay: Math.random() * 1.8, // s
    sway: 12 + Math.random() * 28, // px
  }));
}

function Balloons({ balloons }) {
  if (balloons.length === 0 || typeof document === "undefined") return null;
  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {balloons.map((b) => (
        <div
          key={b.id}
          className="ticketRE-balloon absolute"
          style={{
            left: `${b.left}vw`,
            bottom: `-${b.size * 2}px`,
            width: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--sway": `${b.sway}px`,
          }}
        >
          <div
            style={{
              width: b.size,
              height: b.size * 1.2,
              borderRadius: "50% 50% 50% 50% / 58% 58% 42% 42%",
              background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.75), ${b.color} 45%, rgba(0,0,0,0.35) 120%)`,
              boxShadow: "inset -4px -6px 10px rgba(0,0,0,0.2)",
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              margin: "-1px auto 0",
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `7px solid ${b.color}`,
            }}
          />
          <div
            style={{
              width: 1,
              height: b.size * 1.1,
              margin: "0 auto",
              background: "rgba(220,220,220,0.7)",
            }}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
}

const TICKET_KEYFRAMES = `
@keyframes ticketRE-spin { to { transform: rotate(360deg); } }
@keyframes ticketRE-spin-rev { to { transform: rotate(-360deg) scale(1.2); } }
@keyframes ticketRE-rise {
  0%   { transform: translate3d(0, 0, 0); }
  25%  { transform: translate3d(var(--sway), -30vh, 0); }
  50%  { transform: translate3d(calc(var(--sway) * -1), -65vh, 0); }
  75%  { transform: translate3d(var(--sway), -100vh, 0); }
  100% { transform: translate3d(0, -135vh, 0); }
}
@keyframes ticketRE-marquee-x { to { transform: translateX(-50%); } }
@keyframes ticketRE-marquee-y { to { transform: translateY(-50%); } }
.ticketRE-marquee-x { animation: ticketRE-marquee-x 80s linear infinite; }
.ticketRE-marquee-y { animation: ticketRE-marquee-y 80s linear infinite; }
.ticketRE-marquee-rev { animation-direction: reverse; }
.ticketRE-kaleido-a { animation: ticketRE-spin 24s linear infinite; }
.ticketRE-kaleido-b { animation: ticketRE-spin-rev 36s linear infinite; }
.ticketRE-balloon {
  animation-name: ticketRE-rise;
  animation-timing-function: ease-in-out;
  animation-fill-mode: both;
}
@media (prefers-reduced-motion: reduce) {
  .ticketRE-kaleido-a, .ticketRE-kaleido-b,
  .ticketRE-marquee-x, .ticketRE-marquee-y { animation: none; }
}
`;

// ── Hand cursors at double the native size (browser cursors can't be scaled) ──────────────────────
const HAND_SIZE = 40; // px; the native hand is ~20px
const handCursor = (paths) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${HAND_SIZE}" height="${HAND_SIZE}" viewBox="0 0 24 24" ` +
    `fill="white" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
    paths.map((d) => `<path d="${d}"/>`).join("") +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${HAND_SIZE / 2} ${HAND_SIZE / 2}`;
};
const CURSOR_GRAB = `${handCursor([
  "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2",
  "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2",
  "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8",
  "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
])}, grab`;
const CURSOR_GRABBING = `${handCursor([
  "M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4",
  "M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2",
  "M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5",
  "M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2",
  "M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0",
])}, grabbing`;

// ── Bright yellow "CLICK TO CONTROL AND READ" frame around the viewer ────────────────────────────────
const FRAME = 13; // border thickness, px
const CLICK_TEXT = "CLICK TO CONTROL AND READ • ".repeat(40);

function ClickFrame() {
  const strip =
    "absolute flex items-center overflow-hidden whitespace-nowrap bg-yellow-200 text-[7px] font-bold uppercase leading-none tracking-[0.15em] text-black";
  const font = { fontFamily: '"Courier New", Courier, monospace' };
  // Each strip scrolls its text; it circulates around the frame (top and right
  // run one way, bottom and left the other).
  const run = (cls) => (
    <span className={`inline-block ${cls}`}>{CLICK_TEXT}</span>
  );
  return (
    <div
      aria-hidden
      // The viewer is flipped 180°, so flip the frame back to read upright.
      className="pointer-events-none absolute inset-0 z-20 rotate-180 rounded-sm border-yellow-200"
      style={{ borderWidth: FRAME, borderStyle: "solid" }}
    >
      <div
        className={strip}
        style={{ ...font, top: -FRAME, left: -FRAME, right: -FRAME, height: FRAME }}
      >
        {run("ticketRE-marquee-x")}
      </div>
      <div
        className={strip}
        style={{ ...font, bottom: -FRAME, left: -FRAME, right: -FRAME, height: FRAME }}
      >
        {run("ticketRE-marquee-x ticketRE-marquee-rev")}
      </div>
      <div
        className={strip}
        style={{
          ...font,
          top: 0,
          bottom: 0,
          left: -FRAME,
          width: FRAME,
          writingMode: "vertical-rl",
        }}
      >
        {run("ticketRE-marquee-y ticketRE-marquee-rev")}
      </div>
      <div
        className={strip}
        style={{
          ...font,
          top: 0,
          bottom: 0,
          right: -FRAME,
          width: FRAME,
          writingMode: "vertical-rl",
        }}
      >
        {run("ticketRE-marquee-y")}
      </div>
    </div>
  );
}

function TicketCard({ expanded }) {
  // Hologram: nearly invisible at rest; hovering reveals the ticket and the
  // pointer position tilts it in 3D, sweeping an iridescent sheen across it.
  // Click and drag grabs the card and spins it freely in 3D; the spin sticks
  // after release. Double-click snaps it flat and resets the zoom.
  const [tilt, setTilt] = useState(null); // { x, y } in -0.5..0.5, null = idle
  const [spin, setSpin] = useState({ x: 0, y: 0 }); // degrees, from dragging
  const [grabbing, setGrabbing] = useState(false);
  const [last, setLast] = useState(null); // last pointer position while dragging
  const [balloons, setBalloons] = useState([]);
  const [balloonTimer, setBalloonTimer] = useState(null);
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef(null);
  const pinching = useRef(false);

  // Two fingers up/down zoom the ticket in/out: a trackpad two-finger scroll
  // (wheel events; pinch arrives as ctrl+wheel) or two fingers on a touch
  // screen. Native non-passive listeners are needed so the page doesn't scroll.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const clamp = (z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

    const onWheel = (e) => {
      e.preventDefault();
      // Fingers up (deltaY < 0 with natural scrolling off) = zoom in.
      setZoom((z) => clamp(z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.003))));
    };

    let lastY = null;
    const midY = (t) => (t[0].clientY + t[1].clientY) / 2;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinching.current = true;
        lastY = midY(e.touches);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || lastY === null) return;
      e.preventDefault();
      const y = midY(e.touches);
      setZoom((z) => clamp(z * Math.exp((lastY - y) * 0.008)));
      lastY = y;
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        lastY = null;
        if (e.touches.length === 0) pinching.current = false;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  function onMove(e) {
    if (grabbing && last && !pinching.current) {
      // The ticket sits inside a 180° flip, so screen axes are inverted.
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const next = { x: spin.x + dy * 0.5, y: spin.y - dx * 0.5 };
      setSpin(next);
      // Balloons fire the moment the card gets within 85% of upright.
      if (isNearUpright(next) && !isNearUpright(spin)) launchBalloons();
      setLast({ x: e.clientX, y: e.clientY });
    }
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  }

  function onDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setGrabbing(true);
    setLast({ x: e.clientX, y: e.clientY });
  }

  function onUp(e) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setGrabbing(false);
    setLast(null);
  }

  function launchBalloons() {
    setBalloons(makeBalloons());
    clearTimeout(balloonTimer);
    setBalloonTimer(setTimeout(() => setBalloons([]), 11000));
  }

  const kaleidoscopeOn = turnedFarEnough(spin);
  const active = tilt !== null || grabbing;
  const hoverX = tilt && !grabbing ? -tilt.y * 18 : 0;
  const hoverY = tilt && !grabbing ? tilt.x * 18 : 0;
  const sheenAngle = tilt ? 90 + tilt.x * 360 + spin.y : 115;

  return (
    <div
      ref={viewportRef}
      className="relative flex h-full rotate-180 items-center p-9 justify-center select-none"
      style={{
        perspective: 900,
        cursor: grabbing ? CURSOR_GRABBING : CURSOR_GRAB,
        touchAction: "none",
      }}
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => {
        if (!grabbing) setTilt(null);
      }}
      onDoubleClick={() => {
        setSpin({ x: 0, y: 0 });
        setZoom(1);
      }}
    >
      <style>{TICKET_KEYFRAMES}</style>
      <ClickFrame />
      <Balloons balloons={balloons} />
      <Kaleidoscope show={kaleidoscopeOn} />
      <div
        className={`relative z-10 isolate flex w-full items-stretch overflow-hidden rounded-lg border-2 bg-black transition-[opacity,transform,border-color,filter] ease-out ${
          grabbing ? "duration-75" : "duration-300"
        } ${
          active ? "border-neutral-700" : "border-neutral-900"
        } ${expanded ? "max-w-3xl" : "max-w-xl"}`}
        style={{
          opacity: active ? 1 : 0.12,
          filter: active ? "none" : "blur(1px)",
          transform: `scale(${zoom.toFixed(3)}) rotateX(${(spin.x + hoverX).toFixed(2)}deg) rotateY(${(spin.y + hoverY).toFixed(2)}deg)`,
        }}
      >
        {/* Holographic sheen — the only thing that shows at rest, barely */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 mix-blend-screen transition-opacity duration-300"
          style={{
            opacity: active ? 0.35 : 0.9,
            background: `linear-gradient(${sheenAngle}deg, transparent 0%, rgba(0,255,220,0.7) 25%, rgba(160,80,255,0.7) 50%, rgba(255,80,160,0.7) 75%, transparent 100%)`,
          }}
        />
        {/* Main stub */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-300">
            Admit One
          </p>
          <div className="flex items-center gap-3">
            <Portrait size={expanded ? 72 : 52} />
            <div className="min-w-0">
              <p
                className={`font-heading font-semibold tracking-tight text-neutral-300 ${
                  expanded ? "text-3xl" : "text-xl"
                }`}
              >
                {USER.name}
              </p>
              <p className="text-xs text-neutral-400">{USER.github}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event">{USER.title}</Field>
            <Field label="Row">{USER.seat}</Field>
          </div>
          <Field label="Venue">{USER.toolkit}</Field>
        </div>

        {/* Tear line */}
        <div
          aria-hidden
          className="relative w-0 self-stretch border-l-2 border-dashed border-neutral-700"
        >
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-neutral-700 bg-background" />
          <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 border-neutral-700 bg-background" />
        </div>

        {/* Tear-off stub */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-between gap-2 p-3">
          <span className="text-3xl" role="img" aria-label="sticker">
            {USER.sticker}
          </span>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400"
            style={{ writingMode: "vertical-rl" }}
          >
            Admit One · {USER.initials}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ticketRE = {
  id: "ticket-RE",
  label: "Ticket",
  cards: [
    {
      id: "ticket-card",
      label: "Reza",
      order: 90,
      span: 2,
      hint: "@rh-6",
      Card: TicketCard,
    },
  ],
};
