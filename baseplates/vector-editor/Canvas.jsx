"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useStore } from "jotai";
import {
  activeToolIdAtom,
  canvasSizeAtom,
  cursorAtom,
  docAtom,
  draftAtom,
  elementsAtom,
  hoveredIdAtom,
  selectionAtom,
  viewportAtom,
  zoomAtAtom,
} from "./atoms";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { getTool } from "./bricks/bricks";
import { makeToolContext, snapPoint } from "./toolContext";
import ElementView from "./ElementView";

/**
 * The canvas stage: coordinate conversion, viewport, and event routing.
 *
 * It deliberately knows nothing about *tools*. It converts a pointer event
 * into a `ctx` and hands it to whichever tool is active — so adding a tool
 * never means editing this file.
 */

const ZOOM_SENSITIVITY = 0.0015;

export default function Canvas({ className }) {
  const store = useStore();
  const svgRef = useRef(null);
  const panRef = useRef(null);

  const elements = useAtomValue(elementsAtom);
  const selection = useAtomValue(selectionAtom);
  const hoveredId = useAtomValue(hoveredIdAtom);
  const viewport = useAtomValue(viewportAtom);
  const doc = useAtomValue(docAtom);
  const activeToolId = useAtomValue(activeToolIdAtom);
  // Subscribed to purely so the overlay re-renders mid-gesture.
  useAtomValue(draftAtom);
  const hidden = useAtomValue(hiddenBrickKeysAtom);

  const tool = getTool(activeToolId, hidden);
  const selected = new Set(selection);

  // --- coordinates ---------------------------------------------------------

  const toScreen = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const toWorld = (event) => {
    const screen = toScreen(event);
    const vp = store.get(viewportAtom);
    return { x: (screen.x - vp.x) / vp.zoom, y: (screen.y - vp.y) / vp.zoom };
  };

  const snap = (point) => {
    const current = store.get(docAtom);
    return current.snap ? snapPoint(point, current.grid) : point;
  };

  const hitIdFrom = (event) =>
    event.target?.closest?.("[data-element-id]")?.dataset?.elementId ?? null;

  const contextFor = (event) =>
    makeToolContext(store, { event, rawPoint: toWorld(event), hitId: hitIdFrom(event) });

  // --- viewport ------------------------------------------------------------

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    // Registered by hand because React's onWheel is passive — it can't call
    // preventDefault, and without that the page scrolls while you zoom.
    const onWheel = (event) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      store.set(zoomAtAtom, Math.exp(-event.deltaY * ZOOM_SENSITIVITY), {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [store]);

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) store.set(canvasSizeAtom, { width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [store]);

  // --- pointer routing -----------------------------------------------------

  const onPointerDown = (event) => {
    const panning = event.button === 1 || (event.button === 0 && tool.pans);
    if (panning) {
      event.currentTarget.setPointerCapture(event.pointerId);
      const vp = store.get(viewportAtom);
      panRef.current = { screen: toScreen(event), origin: vp };
      return;
    }
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    tool.onPointerDown?.(contextFor(event));
  };

  const onPointerMove = (event) => {
    const world = toWorld(event);
    store.set(cursorAtom, world);

    if (panRef.current) {
      const screen = toScreen(event);
      const { origin, screen: from } = panRef.current;
      store.set(viewportAtom, {
        ...origin,
        x: origin.x + (screen.x - from.x),
        y: origin.y + (screen.y - from.y),
      });
      return;
    }

    const hitId = hitIdFrom(event);
    if (store.get(hoveredIdAtom) !== hitId) store.set(hoveredIdAtom, hitId);
    tool.onPointerMove?.(
      makeToolContext(store, { event, rawPoint: world, hitId })
    );
  };

  const onPointerUp = (event) => {
    if (panRef.current) {
      panRef.current = null;
      return;
    }
    tool.onPointerUp?.(contextFor(event));
  };

  const onPointerLeave = () => {
    store.set(cursorAtom, null);
    store.set(hoveredIdAtom, null);
  };

  // --- render --------------------------------------------------------------

  const { zoom } = viewport;
  const hairline = 1 / zoom;
  const showMinorGrid = doc.showGrid && doc.grid * zoom > 5;
  const majorGrid = doc.grid * 5;
  const Overlay = tool.Overlay;

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{ cursor: tool.cursor ?? "default", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      onContextMenu={(event) => event.preventDefault()}
    >
      <defs>
        <pattern id="ve-grid-minor" width={doc.grid} height={doc.grid} patternUnits="userSpaceOnUse">
          <path
            d={`M ${doc.grid} 0 L 0 0 0 ${doc.grid}`}
            fill="none"
            stroke="#94a3b8"
            strokeOpacity={0.35}
            strokeWidth={hairline}
          />
        </pattern>
        <pattern id="ve-grid-major" width={majorGrid} height={majorGrid} patternUnits="userSpaceOnUse">
          {showMinorGrid ? <rect width={majorGrid} height={majorGrid} fill="url(#ve-grid-minor)" /> : null}
          <path
            d={`M ${majorGrid} 0 L 0 0 0 ${majorGrid}`}
            fill="none"
            stroke="#64748b"
            strokeOpacity={0.5}
            strokeWidth={hairline}
          />
        </pattern>
      </defs>

      <g transform={`translate(${viewport.x} ${viewport.y}) scale(${zoom})`}>
        {/* The sheet stays white in both themes — it's paper, not chrome. */}
        <rect
          x={0}
          y={0}
          width={doc.width}
          height={doc.height}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={hairline}
        />
        {doc.showGrid ? (
          <rect
            x={0}
            y={0}
            width={doc.width}
            height={doc.height}
            fill="url(#ve-grid-major)"
            pointerEvents="none"
          />
        ) : null}

        {elements.map((element) => (
          <ElementView
            key={element.id}
            element={element}
            zoom={zoom}
            mmPerUnit={doc.mmPerUnit}
            interactive
            hovered={hoveredId === element.id}
            selected={selected.has(element.id)}
          />
        ))}

        {Overlay ? <Overlay zoom={zoom} toWorld={toWorld} snap={snap} doc={doc} /> : null}
      </g>
    </svg>
  );
}
