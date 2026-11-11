"use client";

import { useState } from "react";

// Everyone with a name card on this baseplate today. Bricks can't import each
// other, so name, initials and GitHub are copied from their cards. Add a row
// as new name cards land.
export const PEOPLE = [
  { initials: "DY", name: "Dylan", github: "dylanbquan88", color: "#7c3aed" },
  { initials: "LG", name: "Luke G", github: "pwluke", color: "#059669" },
  { initials: "CR", name: "Craig", github: "dcdixon", color: "#d97706" },
  { initials: "MH", name: "Marshall", github: "Marshall-SC", color: "#2563eb" },
];

export const byInitials = Object.fromEntries(PEOPLE.map((p) => [p.initials, p]));

// Their name-card portrait (GitHub avatar); initials if it fails to load.
export function Avatar({ person, size = 22, ring = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      title={`${person.name} (${person.initials})`}
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white"
      style={{
        width: size,
        height: size,
        background: person.color,
        boxShadow: ring ? `0 0 0 2px white, 0 0 0 4px ${person.color}` : undefined,
      }}
    >
      {failed ? (
        person.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://github.com/${person.github}.png`}
          alt={person.initials}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
