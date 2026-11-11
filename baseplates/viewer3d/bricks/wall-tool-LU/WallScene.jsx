"use client";

import { useRef } from "react";
import { useAtomValue } from "jotai";
import { Html } from "@react-three/drei";
import {
  openingPreviewAtom,
  wallCursorAtom,
  wallDraftStartAtom,
  wallToolAtom,
  wallsAtom,
} from "./atoms";
import { MIN_WALL, WALL, wallLength } from "./model";
import { usePlacement } from "./usePlacement";
import { NO_RAYCAST, OpeningPreview, Wall } from "./Wall";

/** Rendered inside <Canvas>: the model, the draft wall and the opening preview. */
export function WallScene({ palette, framing }) {
  const tool = useAtomValue(wallToolAtom);
  const walls = useAtomValue(wallsAtom);
  const start = useAtomValue(wallDraftStartAtom);
  const cursor = useAtomValue(wallCursorAtom);
  const preview = useAtomValue(openingPreviewAtom);

  // Only committed walls live in here, so only they are pickable for openings.
  const wallsGroup = useRef(null);
  usePlacement(wallsGroup);

  const dot = Math.max(framing.span * 0.004, 0.12);

  const draft =
    tool === "wall" &&
    start &&
    cursor &&
    Math.hypot(cursor[0] - start[0], cursor[1] - start[1]) >= MIN_WALL
      ? { id: "draft", a: start, b: cursor, ...WALL, openings: [] }
      : null;

  const previewWall =
    tool && tool !== "wall" && preview ? walls.find((w) => w.id === preview.wallId) : null;

  return (
    <group>
      <group ref={wallsGroup}>
        {walls.map((wall) => (
          <Wall key={wall.id} wall={wall} palette={palette} />
        ))}
      </group>

      {tool === "wall" && start ? (
        <mesh position={[start[0], start[1], 0.02]} raycast={NO_RAYCAST}>
          <sphereGeometry args={[dot, 12, 12]} />
          <meshBasicMaterial color={palette.accent} />
        </mesh>
      ) : null}

      {draft ? (
        <>
          <Wall wall={draft} palette={palette} ghost />
          <Html
            position={[
              (draft.a[0] + draft.b[0]) / 2,
              (draft.a[1] + draft.b[1]) / 2,
              WALL.height + 0.4,
            ]}
            center
            zIndexRange={[20, 10]}
          >
            <div className="pointer-events-none rounded border bg-background/90 px-1.5 py-0.5 font-mono text-[11px] tabular-nums shadow-sm backdrop-blur">
              {wallLength(draft).toFixed(2)} m
            </div>
          </Html>
        </>
      ) : null}

      {previewWall ? (
        <OpeningPreview wall={previewWall} preview={preview} palette={palette} />
      ) : null}
    </group>
  );
}
