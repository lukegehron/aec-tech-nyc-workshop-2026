"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Trash2, UserPlus } from "lucide-react";
import { teamAtom } from "./atoms";
import { Avatar, ICON_BUTTON } from "./fluent";
import { EMAIL_PATTERN, HANDLE_PATTERN, handleOf } from "./mentions";

const FIELD =
  "h-8 w-full rounded-[4px] border border-[color:var(--f-stroke1)] border-b-[color:var(--f-fg3)] bg-[var(--f-bg1)] px-2 text-[14px] text-[color:var(--f-fg1)] outline-none placeholder:text-[color:var(--f-fg3)] focus:border-b-2 focus:border-b-[color:var(--f-brand-fg)]";

/** The Team section of the panel: add people by hand, remove them again. */
export function TeamEditor() {
  const [team, setTeam] = useAtom(teamAtom);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const add = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const handle = cleanName.replace(/\s+/g, "");
    if (!HANDLE_PATTERN.test(handle)) {
      setError("Name: use letters, numbers, . - or _ (e.g. Luke).");
    } else if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError("Enter a valid email address.");
    } else if (team.some((m) => handleOf(m).toLowerCase() === handle.toLowerCase())) {
      setError(`@${handle} is already on the team.`);
    } else {
      setTeam((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: cleanName, email: cleanEmail },
      ]);
      setName("");
      setEmail("");
      setError("");
    }
  };

  return (
    <section
      aria-label="Team"
      className="border-b border-[color:var(--f-stroke2)] bg-[var(--f-bg1)] px-4 py-3"
    >
      <h3 className="text-[14px] font-semibold leading-5">Team</h3>
      <p className="text-[12px] leading-4 text-[color:var(--f-fg3)]">
        Type @ in a comment to mention someone and email them.
      </p>

      <ul className="mt-2 flex flex-col gap-1">
        {team.length === 0 ? (
          <li className="text-[12px] leading-4 text-[color:var(--f-fg3)]">
            No one yet — add a teammate below.
          </li>
        ) : null}
        {team.map((member) => (
          <li key={member.id} className="flex items-center gap-2">
            <Avatar name={member.name} size={24} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] leading-5">{member.name}</span>
              <span className="block truncate text-[12px] leading-4 text-[color:var(--f-fg3)]">
                {member.email}
              </span>
            </span>
            <button
              type="button"
              className={ICON_BUTTON}
              onClick={() => setTeam((prev) => prev.filter((m) => m.id !== member.id))}
              title={`Remove ${member.name}`}
              aria-label={`Remove ${member.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-3 flex flex-col gap-2">
        <input
          className={FIELD}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (what you'll @)"
          aria-label="Teammate name"
        />
        <input
          className={FIELD}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Teammate email"
        />
        {error ? (
          <div role="alert" className="text-[12px] leading-4 text-[#b10e1c] dark:text-[#f1707b]">
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-8 items-center justify-center gap-1.5 self-start rounded-[4px] bg-[var(--f-brand-bg)] px-3 text-[14px] font-semibold text-white hover:bg-[var(--f-brand-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--f-fg1)]"
        >
          <UserPlus className="size-4" />
          Add to team
        </button>
      </form>
    </section>
  );
}
