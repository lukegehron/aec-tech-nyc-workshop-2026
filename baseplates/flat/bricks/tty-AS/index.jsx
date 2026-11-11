"use client";

import { useEffect, useState } from "react";

const PERSON = {
  name: "Asbiel",
  initials: "AS",
  title: "Computational Designer",
  github: "@asbielsamaniego",
  seat: "Architect",
  toolkit: "Excel · Rhino · Revit · Grasshopper · ChatGPT",
  sticker: "🟢",
};

function TtyCard({ expanded }) {
  const [now, setNow] = useState(null);
  const [portraitFailed, setPortraitFailed] = useState(false);

  // Mount first, then read the clock — never during render.
  useEffect(() => {
    const id = setTimeout(() => setNow(new Date()), 0);
    return () => clearTimeout(id);
  }, []);

  const handle = PERSON.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${handle}.png`;
  const tools = PERSON.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);
  const user = PERSON.name.toLowerCase();
  const lastLogin = now
    ? `${now.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} ${now.toLocaleTimeString([], { hour12: false })}`
    : "---";

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-950 font-mono text-neutral-200 ${
        expanded ? "text-base" : "text-xs"
      }`}
    >
      <style>{`@keyframes tty-as-blink{0%,49%{opacity:1}50%,100%{opacity:0}}.tty-as-cursor{animation:tty-as-blink 1s step-end infinite}`}</style>

      <div className="flex items-center gap-1.5 border-b border-neutral-800 bg-neutral-900 px-3 py-1.5">
        <span className="size-2 rounded-full bg-red-500/80" />
        <span className="size-2 rounded-full bg-yellow-500/80" />
        <span className="size-2 rounded-full bg-green-500/80" />
        <span className="ml-2 text-[10px] text-neutral-500">
          tty1 — {user}@{handle}
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-auto p-3 leading-relaxed">
        <p className="text-neutral-500">Last login: {lastLogin} on tty1</p>

        <div className="flex items-start gap-3 pt-1">
          <div className="min-w-0 flex-1 space-y-1">
            <p>
              <span className="text-green-400">$</span> whoami
            </p>
            <p className="pl-3 text-white">{PERSON.name}</p>

            <p>
              <span className="text-green-400">$</span> groups
            </p>
            <p className="pl-3 text-white">{PERSON.title}</p>
          </div>

          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-700 bg-neutral-900 text-green-400">
            {portraitFailed ? (
              <span className="text-lg font-semibold">{PERSON.initials}</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`${PERSON.name} portrait`}
                className="size-full object-cover"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
        </div>

        <p>
          <span className="text-green-400">$</span> ls
        </p>
        <ul className="flex flex-wrap gap-x-4 pl-3 text-cyan-300">
          {tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>

        <p>
          <span className="text-green-400">$</span>{" "}
          <span className="tty-as-cursor inline-block h-[1em] w-[0.6em] translate-y-[2px] bg-green-400" />
          <span className="ml-3 text-neutral-600">{PERSON.sticker}</span>
        </p>
      </div>
    </div>
  );
}

export const ttyAS = {
  id: "tty-AS",
  label: "TTY login banner",
  cards: [
    {
      id: "tty-login",
      label: PERSON.name,
      order: 92,
      span: 1,
      hint: PERSON.github,
      Card: TtyCard,
    },
  ],
};
