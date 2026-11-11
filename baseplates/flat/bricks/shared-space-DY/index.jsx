"use client";

import { useEffect, useState } from "react";
import { useCardState } from "../../storage";
import { Avatar, PEOPLE, byInitials } from "./people";
import { Board } from "./Board";

// A live board shared by everyone using this running app. Items live on the
// server in /api/shared-space (in memory); every client polls once a second.

const API = "/api/shared-space";
const ICONS = ["📌", "⚠️", "✅", "❓", "🏗️", "🧱", "📐", "💡", "🤖", "⭐"];
const TOOLS = ["text", "line", "icon", "erase"];

async function send(body) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`shared-space ${res.status}`);
  return res.json();
}

function SharedSpace({ expanded }) {
  const [me, setMe] = useCardState("shared-space-DY:me", "DY");
  const [tool, setTool] = useState("text");
  const [icon, setIcon] = useState(ICONS[0]);
  const [draft, setDraft] = useState("");
  const [board, setBoard] = useState({ items: [], presence: [] });
  const [online, setOnline] = useState(true);

  const person = byInitials[me] ?? PEOPLE[0];

  // Heartbeat + poll: tells the room who I am, returns the latest board.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const next = await send({ op: "presence", who: me });
        if (alive) {
          setBoard(next);
          setOnline(true);
        }
      } catch {
        if (alive) setOnline(false);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [me]);

  const apply = async (body) => {
    try {
      setBoard(await send(body));
      setOnline(true);
    } catch {
      setOnline(false);
    }
  };

  const add = (item) =>
    apply({
      op: "add",
      item: { id: crypto.randomUUID(), author: person.initials, color: person.color, ...item },
    });

  const place = ({ x, y }) => {
    if (tool === "icon") return add({ kind: "icon", x, y, text: icon });
    const text = draft.trim();
    if (!text) return;
    add({ kind: "text", x, y, text });
    setDraft("");
  };

  const here = new Set(board.presence);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 text-xs">
      {/* Roster: everyone's name-card portrait + initials; lit when online */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground">I am</span>
        {PEOPLE.map((p) => (
          <button
            key={p.initials}
            type="button"
            onClick={() => setMe(p.initials)}
            className={`flex items-center gap-1 rounded-full border py-0.5 pr-2 pl-0.5 ${
              p.initials === me ? "border-foreground bg-muted" : "border-transparent"
            } ${here.has(p.initials) ? "" : "opacity-40"}`}
          >
            <Avatar person={p} ring={p.initials === me} />
            <span className="font-semibold">{p.initials}</span>
          </button>
        ))}
        <span
          className={`ml-auto rounded px-1.5 py-0.5 ${
            online ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {online ? `${here.size} online` : "offline"}
        </span>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTool(t)}
            className={`rounded border px-2 py-1 capitalize ${
              tool === t ? "border-foreground bg-foreground text-background" : "border-border"
            }`}
          >
            {t}
          </button>
        ))}
        {tool === "text" && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type, then click the board"
            maxLength={280}
            className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1"
          />
        )}
        {tool === "icon" &&
          ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`rounded px-1 text-base ${icon === i ? "bg-muted ring-1 ring-foreground" : ""}`}
            >
              {i}
            </button>
          ))}
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear the shared board for everyone?")) apply({ op: "clear" });
          }}
          className="ml-auto rounded border border-border px-2 py-1 text-muted-foreground"
        >
          Clear all
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-white">
        <Board
          items={board.items}
          tool={tool}
          color={person.color}
          textSize={expanded ? 18 : 26}
          onPlace={place}
          onLine={(line) => add({ kind: "line", ...line })}
          onErase={(id) => apply({ op: "remove", id })}
        />
      </div>
    </div>
  );
}

export const sharedSpaceDY = {
  id: "shared-space-DY",
  label: "Shared space",
  cards: [
    {
      id: "shared-space",
      label: "Shared space",
      order: 93,
      span: 2,
      hint: "text · lines · icons — live for everyone on this app",
      Card: SharedSpace,
    },
  ],
};
