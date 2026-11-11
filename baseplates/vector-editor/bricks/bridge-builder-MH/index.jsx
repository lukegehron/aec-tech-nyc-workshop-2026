"use client";

import { getDefaultStore } from "jotai";
import { Waypoints } from "lucide-react";
import { bridgeSettingsAtom } from "./atoms";
import { PIECES, applyPick, constrain45, layoutSpan, pieceLabel, resolveEnd } from "./bridge";
import { commitPieces, linePiece, presetPieces, supportPiece } from "./pieces";
import { TOOL_ID, TOOL_KEY, TOOL_LABEL, modeKeys, paletteHit } from "./Mode";
import BridgeOverlay from "./Overlay";
import BridgePanel from "./Panel";

/**
 * Bridge builder: one tool, one mode.
 *
 * Pick the Bridge tool (G) and the editor is in BRIDGE MODE (Mode.jsx): the
 * canvas turns yellow, the other tools grey out, and a piece palette appears
 * on the canvas. A bridge is a set of PIECES (pieces.js), each its own
 * element. Pick a piece, then drag from joint to joint to add it. The fifth
 * piece is a whole preset bridge, which arrives already split into pieces.
 */

const store = () => getDefaultStore();
const settings = () => store().get(bridgeSettingsAtom);
const pick = (value) => store().set(bridgeSettingsAtom, applyPick(value, settings()));

export const bridgeTool = {
  id: TOOL_ID,
  label: TOOL_LABEL,
  icon: Waypoints,
  shortcut: TOOL_KEY,
  order: 75,
  cursor: "crosshair",
  snaps: true,
  hint: "Bridge mode · pick a piece on the canvas or with 1–5 · drag joint to joint · ends snap to joints, then the grid · Shift locks 45° · Esc exits",
  Overlay: BridgeOverlay,

  onPointerDown(ctx) {
    // A click on the on-canvas palette picks a piece instead of placing one.
    const chip = paletteHit(ctx.rawPoint, ctx.viewport);
    if (chip) {
      pick(chip);
      return;
    }
    const opts = settings();
    if (opts.piece === "preset") {
      ctx.setDraft({ a: ctx.point, b: ctx.point, preset: true });
      return;
    }
    const end = resolveEnd(ctx.rawPoint, ctx.point, ctx.elements, ctx.viewport.zoom);
    if (opts.piece === "support") {
      commitPieces(ctx, [supportPiece(end.p, ctx.doc.grid, ctx.style)], [], opts);
      return;
    }
    ctx.setDraft({ a: end.p, b: end.p, aOnJoint: end.onJoint, bOnJoint: end.onJoint });
  },

  onPointerMove(ctx) {
    const draft = ctx.draft;
    if (!draft?.a || !ctx.event.buttons) return;
    if (draft.preset) {
      ctx.setDraft({ ...draft, b: ctx.point });
      return;
    }
    const end = ctx.event.shiftKey
      ? { p: constrain45(draft.a, ctx.point), onJoint: false }
      : resolveEnd(ctx.rawPoint, ctx.point, ctx.elements, ctx.viewport.zoom);
    ctx.setDraft({ ...draft, b: end.p, bOnJoint: end.onJoint });
  },

  onPointerUp(ctx) {
    const draft = ctx.draft;
    ctx.setDraft(null);
    if (!draft?.a || !draft?.b) return;
    const opts = settings();
    if (draft.preset) {
      if (layoutSpan(draft.a, draft.b, ctx.doc.grid, opts).tooShort) return;
      const { pieces, jointPoints } = presetPieces(draft.a, draft.b, ctx.doc, ctx.style, opts);
      commitPieces(ctx, pieces, jointPoints, opts);
      return;
    }
    if (Math.hypot(draft.b.x - draft.a.x, draft.b.y - draft.a.y) < 1) return;
    const piece = linePiece([draft.a, draft.b], opts.piece, ctx.style, pieceLabel(opts.piece));
    commitPieces(ctx, [piece], [draft.a, draft.b], opts);
  },

  onKeyDown(ctx) {
    const piece = PIECES[Number(ctx.event.key) - 1];
    if (/^[1-9]$/.test(ctx.event.key) && piece) {
      pick(piece.value);
      return true;
    }
    return modeKeys(ctx);
  },

  onDeactivate(ctx) {
    ctx.setDraft(null);
  },
};

export const bridgeBuilderMH = {
  id: "bridge-builder-MH",
  label: "Bridge builder",
  tools: [bridgeTool],
  panels: [{ id: "bridge", label: "Bridge", order: 60, Panel: BridgePanel }],
};
