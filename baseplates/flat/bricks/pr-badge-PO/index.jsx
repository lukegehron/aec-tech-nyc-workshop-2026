"use client";

// Polina's badge: name, cat icon, and a button that sets a cartoon cat loose.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cat } from "lucide-react";

const NAME = "Polina";

// Pick a random spot (in %) that keeps the cat on screen.
function randomSpot() {
  return { x: 5 + Math.random() * 85, y: 10 + Math.random() * 75 };
}

// A cartoon cat that hops from spot to spot across the whole viewport.
function JumpingCat() {
  const [spot, setSpot] = useState(randomSpot);
  const hopRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setSpot(randomSpot());
      hopRef.current?.animate(
        [
          { transform: "translateY(0) rotate(0deg) scale(1, 1)" },
          { transform: "translateY(-90px) rotate(-15deg) scale(0.9, 1.15)", offset: 0.5 },
          { transform: "translateY(0) rotate(10deg) scale(1.2, 0.8)", offset: 0.9 },
          { transform: "translateY(0) rotate(0deg) scale(1, 1)" },
        ],
        { duration: 700, easing: "ease-in-out" },
      );
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] transition-[left,top] duration-700 ease-in-out"
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
    >
      <span ref={hopRef} className="block select-none text-6xl leading-none">
        🐱
      </span>
    </div>
  );
}

function PrBadgeCard() {
  const [jumping, setJumping] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-[#ff00ff] bg-black p-3 text-[#ff00ff]">
      <Cat className="size-10" aria-label="cat" />
      <p className="font-heading text-xl font-semibold">{NAME}</p>
      <button
        type="button"
        onClick={() => setJumping((j) => !j)}
        className="rounded-md bg-[#ff00ff] px-3 py-1 text-xs font-semibold text-black hover:bg-[#ff66ff]"
      >
        click me
      </button>
      {jumping && createPortal(<JumpingCat />, document.body)}
    </div>
  );
}

export const prBadgePO = {
  id: "pr-badge-PO",
  label: "PR badge",
  cards: [
    {
      id: "pr-badge",
      label: "Polina",
      order: 91,
      span: 1,
      Card: PrBadgeCard,
    },
  ],
};
