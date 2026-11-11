"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useStore } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  commentArmedAtom,
  commentDraftAtom,
  commentPanelOpenAtom,
  commentSelectedAtom,
  commentsAtom,
} from "./atoms";
import { Composer, Pin } from "./Composer";
import { AUTHOR, BRAND_3D, FLUENT_FONT, FLUENT_VARS, SHADOW_8 } from "./fluent";
import { describeHit, targetsFrom, targetText } from "./targets";

// Below this many pixels of travel a press-and-release is a click; above it
// the user was orbiting.
const DRAG_SLOP = 4;
const noRaycast = () => null;

/** First real, visible, un-clipped mesh under the pointer — or null. */
function pick(event, { gl, camera, scene }, raycaster) {
  const rect = gl.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(scene.children, true).find(({ object, point }) => {
    if (!object.isMesh || !object.visible) return false;
    // Boxes the baseplate dimmed (other building / other floor) are not "there".
    if (object.material?.transparent && object.material.opacity < 0.2) return false;
    for (let o = object; o; o = o.parent) {
      if (o.userData?.commentsUi) return false; // this brick's own overlay
    }
    // The raycaster ignores clipping, so drop hits the Z slice has cut away.
    return gl.clippingPlanes.every((plane) => plane.distanceToPoint(point) >= 0);
  });
  return hit ?? null;
}

export function CommentScene({ data, palette }) {
  const store = useStore();
  const armed = useAtomValue(commentArmedAtom);
  const [comments, setComments] = useAtom(commentsAtom);
  const [draft, setDraft] = useAtom(commentDraftAtom);
  const [selected, setSelected] = useAtom(commentSelectedAtom);
  const setPanelOpen = useSetAtom(commentPanelOpenAtom);
  const [hover, setHover] = useState(null);
  const hoverId = useRef(null);

  useEffect(() => {
    if (!armed) return undefined;

    const el = store.getState().gl.domElement;
    const raycaster = new THREE.Raycaster();
    const targets = targetsFrom(data);
    const previousCursor = el.style.cursor;
    el.style.cursor = "crosshair";
    let downAt = null;

    const clearHover = () => {
      hoverId.current = null;
      setHover(null);
    };

    const onPointerMove = (event) => {
      if (event.buttons) return; // mid-orbit
      const hit = pick(event, store.getState(), raycaster);
      if (!hit) {
        if (hoverId.current !== null) clearHover();
        return;
      }
      const found = describeHit(hit, targets);
      if (found.target.id === hoverId.current) return; // same item — no re-render
      hoverId.current = found.target.id;
      setHover({ ...found, point: hit.point.toArray() });
    };

    const onPointerDown = (event) => {
      downAt = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      if (!downAt) return;
      const travelled = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      downAt = null;
      if (travelled > DRAG_SLOP) return; // that was an orbit
      const hit = pick(event, store.getState(), raycaster);
      if (!hit) return;
      setDraft({ point: hit.point.toArray(), target: describeHit(hit, targets).target });
      setSelected(null);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setDraft(null);
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", clearHover);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", clearHover);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      el.style.cursor = previousCursor;
      clearHover();
      setDraft(null);
    };
  }, [armed, store, data, setDraft, setSelected]);

  // Brand colour follows the theme through the palette, never `resolvedTheme`.
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(palette.ground).getHSL(hsl);
  const brand = hsl.l < 0.5 ? BRAND_3D.dark : BRAND_3D.light;

  const post = (text) => {
    const comment = {
      id: crypto.randomUUID(),
      text,
      author: AUTHOR,
      createdAt: Date.now(),
      resolved: false,
      point: draft.point,
      target: draft.target,
    };
    setComments((prev) => [...prev, comment]);
    setDraft(null);
    setSelected(comment.id);
    setPanelOpen(true);
  };

  const box = hover?.box;
  const tipAt = box
    ? [box.position[0], box.position[1], box.position[2] + box.size[2] / 2]
    : hover?.point;

  return (
    <group userData={{ commentsUi: true }}>
      {box ? (
        // Keyed so the outline is rebuilt for each item's geometry.
        <mesh key={hover.target.id} position={box.position} scale={1.004} raycast={noRaycast}>
          <boxGeometry args={box.size} />
          <meshBasicMaterial color={brand} transparent opacity={0.14} depthWrite={false} />
          <Edges color={brand} lineWidth={2} raycast={noRaycast} />
        </mesh>
      ) : null}

      {hover && !draft ? (
        // Never interactive: a tooltip that caught the pointer would flicker.
        <Html position={tipAt} center zIndexRange={[40, 30]} pointerEvents="none">
          <div
            className={`${FLUENT_VARS} -translate-y-6 whitespace-nowrap rounded-[4px] border border-[color:var(--f-stroke2)] bg-[var(--f-bg1)] px-2 py-1 text-[12px] leading-4 text-[color:var(--f-fg1)]`}
            style={{ fontFamily: FLUENT_FONT, boxShadow: SHADOW_8 }}
          >
            Comment on {targetText(hover.target)}
          </div>
        </Html>
      ) : null}

      {comments.map((comment, index) =>
        comment.resolved && comment.id !== selected ? null : (
          <Html key={comment.id} position={comment.point} zIndexRange={[30, 20]}>
            <div className="-translate-y-full">
              <Pin
                label={index + 1}
                title={`${targetText(comment.target)}: ${comment.text}`}
                resolved={comment.resolved}
                selected={comment.id === selected}
                onClick={() => {
                  setSelected(comment.id);
                  setPanelOpen(true);
                }}
              />
            </div>
          </Html>
        ),
      )}

      {draft ? (
        <Html position={draft.point} zIndexRange={[60, 50]}>
          <Composer target={draft.target} onSubmit={post} onDiscard={() => setDraft(null)} />
        </Html>
      ) : null}
    </group>
  );
}
