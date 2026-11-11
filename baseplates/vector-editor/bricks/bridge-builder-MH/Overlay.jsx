"use client";

import { useAtomValue } from "jotai";
import { polylineSubPaths, toPathD } from "../../geometry";
import { formatLength } from "../../model";
import { cursorAtom, draftAtom, elementsAtom, styleAtom, viewportAtom } from "../../atoms";
import { snapPoint } from "../../toolContext";
import { bridgeSettingsAtom } from "./atoms";
import { collectJoints, pieceWidth, resolveEnd, supportTriangle, typeLabel } from "./bridge";
import { presetPieces } from "./pieces";
import { ModeChrome, SnapMarker, paletteHit } from "./Mode";

const INK = "#854d0e";

/** The piece being dragged out: one member, or a whole preset bridge. */
function DraftPreview({ draft, zoom, doc, style, opts }) {
  if (draft.preset) {
    const { layout, geometry, pieces } = presetPieces(draft.a, draft.b, doc, style, opts);
    return (
      <g>
        <g opacity={0.7}>
          {pieces
            .filter((piece) => piece.type === "path")
            .map((piece, i) => (
              <path
                key={i}
                d={toPathD(piece.subPaths)}
                fill={piece.style.fill}
                stroke={piece.style.stroke}
                strokeWidth={piece.style.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
        </g>
        {Array.from({ length: layout.bays + 1 }, (_, i) => (
          <circle
            key={i}
            cx={layout.x0 + i * layout.bay}
            cy={layout.y0}
            r={5 / zoom}
            fill="var(--color-primary)"
          />
        ))}
        <text
          x={(layout.x0 + layout.x1) / 2}
          y={layout.y0 - geometry.height - 16 / zoom}
          textAnchor="middle"
          fontSize={13 / zoom}
          fill={INK}
        >
          {`${typeLabel(opts.type)} · ${layout.bays} bays · ${formatLength(layout.span * doc.mmPerUnit)}`}
        </text>
      </g>
    );
  }

  const length = Math.hypot(draft.b.x - draft.a.x, draft.b.y - draft.a.y);
  return (
    <g>
      <path
        d={toPathD(polylineSubPaths([draft.a, draft.b]))}
        fill="none"
        stroke={style.stroke}
        strokeWidth={style.strokeWidth * pieceWidth(opts.piece)}
        strokeLinecap="round"
        opacity={0.7}
      />
      <SnapMarker p={draft.a} zoom={zoom} onJoint={draft.aOnJoint} />
      <SnapMarker p={draft.b} zoom={zoom} onJoint={draft.bOnJoint} />
      <text
        x={(draft.a.x + draft.b.x) / 2}
        y={(draft.a.y + draft.b.y) / 2 - 12 / zoom}
        textAnchor="middle"
        fontSize={12 / zoom}
        fill={INK}
      >
        {formatLength(length * doc.mmPerUnit)}
      </text>
    </g>
  );
}

/** Before a drag: show where the next piece will start. */
function HoverPreview({ cursor, zoom, doc, style, opts, elements }) {
  const gridPoint = doc.snap ? snapPoint(cursor, doc.grid) : cursor;
  const end =
    opts.piece === "preset"
      ? { p: gridPoint, onJoint: false }
      : resolveEnd(cursor, gridPoint, elements, zoom);
  return (
    <g>
      {opts.piece === "support" ? (
        <path
          d={toPathD(polylineSubPaths(supportTriangle(end.p, doc.grid), true))}
          fill={style.stroke}
          opacity={0.5}
        />
      ) : null}
      <SnapMarker p={end.p} zoom={zoom} onJoint={end.onJoint} />
    </g>
  );
}

export default function BridgeOverlay({ zoom, doc }) {
  const draft = useAtomValue(draftAtom);
  const cursor = useAtomValue(cursorAtom);
  const style = useAtomValue(styleAtom);
  const elements = useAtomValue(elementsAtom);
  const opts = useAtomValue(bridgeSettingsAtom);
  const viewport = useAtomValue(viewportAtom);
  const overPalette = Boolean(paletteHit(cursor, viewport));
  const hasDraft = Boolean(draft?.a && draft?.b);

  return (
    <g pointerEvents="none">
      {/* Every joint a new piece can connect to */}
      {collectJoints(elements).map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={7 / zoom}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={0.6}
          strokeWidth={1.5 / zoom}
        />
      ))}
      {hasDraft ? <DraftPreview draft={draft} zoom={zoom} doc={doc} style={style} opts={opts} /> : null}
      {!hasDraft && cursor && !overPalette ? (
        <HoverPreview cursor={cursor} zoom={zoom} doc={doc} style={style} opts={opts} elements={elements} />
      ) : null}
      <ModeChrome viewport={viewport} opts={opts} />
    </g>
  );
}
