"use client";

// ─── THE STUB ────────────────────────────────────────────────────────────────
// A working card that shows the time. It is NOT registered yet — snapping it on
// is your job, and it takes two lines. See the README next to this file.
//
// This is the baseplate with nothing moulded into it and no libraries at all,
// which makes it the fastest place in the repo to get something on screen.

import { useEffect, useState } from "react";

function YourCard({ expanded }) {
  const [now, setNow] = useState(null);

  // `null` first, then a value from an interval — never setting state directly
  // in the effect body. Rendering the same thing on the server and the client
  // and then updating is the pattern; reading the clock during render is not.
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <p
        className={`font-heading tabular-nums font-semibold tracking-tight text-baseplate ${
          expanded ? "text-6xl" : "text-3xl"
        }`}
      >
        {now ? now.toLocaleTimeString() : "—:—:—"}
      </p>
      <p className="text-xs text-muted-foreground">
        this card is yours — start here
      </p>
    </div>
  );
}

export const yourBrick = {
  // Two things, one name: this id and the folder. Swap `_your-brick-here-XX`
  // for `<something>-<your initials>`. Your git branch is your GitHub username.
  id: "_your-brick-here-XX",
  label: "Your card",
  cards: [
    {
      // Ids INSIDE the brick stay plain — they belong to the baseplate's
      // contract, not to you. Only the brick id carries your initials.
      id: "your-card",
      label: "Your card",
      order: 90,
      span: 1,
      hint: "change me",
      Card: YourCard,
    },
  ],
};
