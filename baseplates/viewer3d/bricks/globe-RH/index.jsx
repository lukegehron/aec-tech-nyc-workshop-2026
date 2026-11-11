"use client";

import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { viewModeAtom } from "../../atoms";
import { placedLandmarksAtom } from "./atoms";
import { makeEarthTexture } from "./earth";
import { GENERIC_PARTS, findLandmark, geocode } from "./landmarks";
import Landmark from "./Landmark";
import { generateLandmark } from "./generate";

const BRICK_ID = "globe-RH";

/**
 * GLOBE — a cartoon Earth with oversized landmarks.
 *
 * A VIEW MODE (it owns the mode button and returns no boxes, so the site
 * massing steps aside) that also carries a Toolbar (type a landmark) and a
 * Scene3d (the globe). Everything is procedural: the earth texture is drawn on
 * a canvas and the landmarks are primitives, so nothing inside <Canvas> can
 * suspend.
 *
 * Z-up: the north pole is +Z, lon 0 / lat 0 is +X, east is +Y.
 */

function GlobeScene({ framing }) {
  const mode = useAtomValue(viewModeAtom);
  const placed = useAtomValue(placedLandmarksAtom);
  const [texture] = useState(() => makeEarthTexture());
  if (mode !== BRICK_ID) return null;

  // Sized from the site framing, resting on the ground plane.
  const radius = framing.span * 0.38;
  return (
    <group position={[framing.center[0], framing.center[1], radius + 0.05]}>
      {/* SphereGeometry's poles are on Y; a quarter turn puts them on Z. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[radius, 96, 64]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
      {placed.map((item) => (
        <Landmark key={item.id} item={item} radius={radius} />
      ))}
    </group>
  );
}

function GlobeToolbar() {
  const mode = useAtomValue(viewModeAtom);
  const [placed, setPlaced] = useAtom(placedLandmarksAtom);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (mode !== BRICK_ID) return null;

  const add = (item) =>
    setPlaced((list) => [...list.filter((l) => l.id !== item.id), item]);

  async function generate(event) {
    event.preventDefault();
    const query = text.trim();
    if (!query) return;
    const known = findLandmark(query);
    if (known) {
      add({ id: known.key, ...known });
      setMessage(`${known.name} placed at ${known.lat.toFixed(2)}°, ${known.lon.toFixed(2)}°`);
      setText("");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      // Not in the catalogue: have Claude design a model live.
      try {
        const made = await generateLandmark(query);
        add(made);
        setMessage(
          `${made.name} generated at ${made.lat.toFixed(2)}°, ${made.lon.toFixed(2)}°` +
            (made.generic ? " (generic shape)" : "")
        );
        setText("");
        return;
      } catch (genError) {
        setMessage(`Generation failed (${genError.message}) — trying a map lookup…`);
      }
      const hit = await geocode(query);
      if (!hit) {
        setMessage(`Couldn't find "${query}".`);
      } else {
        add({
          id: `geo-${hit.lat.toFixed(3)}-${hit.lon.toFixed(3)}`,
          name: hit.name,
          lat: hit.lat,
          lon: hit.lon,
          height: 0.2,
          parts: GENERIC_PARTS,
        });
        setMessage(`${hit.name} placed (generic monument) at ${hit.lat.toFixed(2)}°, ${hit.lon.toFixed(2)}°`);
        setText("");
      }
    } catch (error) {
      setMessage(`Lookup failed — ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={generate} className="flex items-center gap-1 rounded-md border p-0.5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Eiffel Tower, Statue of Liberty…"
          className="h-7 w-56 border-0 text-xs shadow-none focus-visible:ring-0"
          aria-label="Landmark name"
        />
        <Button type="submit" size="sm" className="h-7 px-2.5 text-xs" disabled={busy || !text.trim()}>
          {busy ? "Generating…" : "Generate"}
        </Button>
        {placed.length > 0 ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => {
                const last = placed[placed.length - 1];
                setPlaced(placed.slice(0, -1));
                setMessage(`Removed ${last.name}`);
              }}
              title="Remove the most recently added landmark"
            >
              <Undo2 className="size-3.5" />
              Undo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => {
                setPlaced([]);
                setMessage("");
              }}
              title="Remove every landmark"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          </>
        ) : null}
      </form>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}

export const globeBrick = {
  id: BRICK_ID,
  label: "Landmarks on Globe",
  hint: "A cartoon Earth — type a landmark to plant an oversized one in the right place",
  order: 100,
  supportsLevels: false,
  buildBoxes() {
    return [];
  },
  Toolbar: GlobeToolbar,
  Scene3d: GlobeScene,
};
