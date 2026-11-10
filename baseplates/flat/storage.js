"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The one service this baseplate offers: state that survives a reload.
 *
 * A note-taking app whose notes vanish on refresh isn't a note-taking app, and
 * the alternative — wiring every card into the shared database — is a much
 * bigger idea than most bricks here need. So: `localStorage`, on this machine,
 * yours alone. No account, no network, nothing to configure.
 *
 *   const [notes, setNotes] = useCardState("notes-XX", []);
 *
 * `key` should be your brick id, so two bricks can never collide.
 *
 * Reading `window` in the initialiser is safe *here* because this baseplate's
 * Screen is loaded with `ssr: false` — nothing under it ever renders on the
 * server, so there is no server markup to disagree with. The `typeof window`
 * guard is belt and braces.
 *
 * If you want the same data in another brick, publish an artifact from
 * `lib/artifacts.js` instead.
 */
function read(storageKey, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    // Private browsing, or something else wrote junk under this key. A card
    // that can't remember is still a card that works.
    return fallback;
  }
}

export const CARD_STATE_PREFIX = "flat:";
export const CARD_STATE_IMPORTED_EVENT = "flat:card-state-imported";

export function readAllCardState() {
  if (typeof window === "undefined") return {};
  const out = {};
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(CARD_STATE_PREFIX)) continue;
      const brickKey = key.slice(CARD_STATE_PREFIX.length);
      try {
        out[brickKey] = JSON.parse(window.localStorage.getItem(key));
      } catch {
        // Skip junk written under a flat: key — export should still succeed.
      }
    }
  } catch {
    return out;
  }
  return out;
}

export function writeAllCardState(cardState) {
  if (typeof window === "undefined" || !cardState) return;
  try {
    for (const [key, value] of Object.entries(cardState)) {
      window.localStorage.setItem(
        `${CARD_STATE_PREFIX}${key}`,
        JSON.stringify(value)
      );
    }
  } catch {
    // Quota or private mode. The layout still imported; contents may not have.
  }
  window.dispatchEvent(new Event(CARD_STATE_IMPORTED_EVENT));
}

export function useCardState(key, fallback) {
  const storageKey = `${CARD_STATE_PREFIX}${key}`;
  const [value, setValue] = useState(() => read(storageKey, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Out of quota. Keep the in-memory value; the session still works.
    }
  }, [storageKey, value]);

  useEffect(() => {
    const onImport = () => setValue(read(storageKey, fallback));
    window.addEventListener(CARD_STATE_IMPORTED_EVENT, onImport);
    return () => window.removeEventListener(CARD_STATE_IMPORTED_EVENT, onImport);
    // `fallback` is the brick's default, not something that should retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const clear = useCallback(() => {
    setValue(fallback);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Nothing to do — the state is already back to the fallback.
    }
    // `fallback` is deliberately not a dependency: a brick that passes a fresh
    // `[]` every render would otherwise get a new `clear` on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return [value, setValue, clear];
}
