"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ImageUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  addElementsAtom,
  addPathsFromDataAtom,
  docAtom,
  fitViewAtom,
} from "../../atoms";
import { parsePathD } from "../../geometry";
import { parseSvg } from "../../svgIo";

/**
 * Three ways onto the sheet, all landing as normal editable elements:
 *
 *   Claude          — JSON-wrapped SVG path data in this drawing's coordinates
 *   Recraft text    — fal-ai/recraft/v4.1/text-to-vector
 *   Recraft image   — fal-ai/recraft/vectorize
 *
 * Keys stay on the server (`/api/claude`, `/api/fal`). This panel only POSTs.
 */

const MODES = [
  { id: "claude", label: "Claude" },
  { id: "text", label: "Text → SVG" },
  { id: "image", label: "Image → SVG" },
];

const CLAUDE_EXAMPLES = [
  "A 3-bay steel portal frame, elevation",
  "A double-leaf entry door with swing arcs",
  "A spiral stair, plan view",
  "A parking layout: 12 bays and an aisle",
];

const TEXT_EXAMPLES = [
  "a simple isometric office building, flat vector illustration",
  "a clean line-art floor plan of a studio apartment",
  "a logo-style architectural column, 2D vector",
];

function systemPrompt(doc) {
  return [
    "You generate 2D architectural line drawings as SVG path data.",
    `The drawing area is ${doc.width} x ${doc.height} units with the origin at the top-left; y grows downward.`,
    `One unit is ${doc.mmPerUnit} mm, so the sheet is ${(doc.width * doc.mmPerUnit) / 1000} m by ${(doc.height * doc.mmPerUnit) / 1000} m.`,
    "Reply with JSON only — no prose, no markdown fence. Shape:",
    '{"elements":[{"name":"Exterior wall","d":"M 200 200 L 1800 200","fill":"none","stroke":"#1f2937","strokeWidth":8}]}',
    "Rules: use absolute commands; keep every coordinate inside the drawing area;",
    "prefer 6-12 separate elements with descriptive names over one giant path;",
    "use fill \"none\" for linework; stroke widths between 2 and 20.",
  ].join(" ");
}

/** Models like to wrap JSON in a fence even when told not to. Be forgiving. */
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Claude didn't return any JSON.");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function fileToPngDataUrl(file, { minDim = 256, maxDim = 4096 } = {}) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that image."));
      el.src = objectUrl;
    });
    const longest = Math.max(image.width, image.height);
    const shortest = Math.min(image.width, image.height);
    let scale = 1;
    if (shortest < minDim) scale = minDim / shortest;
    if (longest * scale > maxDim) scale = maxDim / longest;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function AiPanel() {
  const doc = useAtomValue(docAtom);
  const addPaths = useSetAtom(addPathsFromDataAtom);
  const addElements = useSetAtom(addElementsAtom);
  const fitView = useSetAtom(fitViewAtom);

  const [mode, setMode] = useState("claude");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const dropSvg = (svgText, name) => {
    const parsed = parseSvg(svgText, {
      fit: { width: doc.width, height: doc.height, padding: doc.width * 0.08 },
    });
    if (!parsed.length) throw new Error("No drawable geometry in that SVG — try a simpler image or prompt.");
    addElements(
      parsed.map((element, index) => ({
        ...element,
        name: element.name && element.name !== "Path" ? element.name : `${name} ${index + 1}`,
      }))
    );
    fitView();
    return parsed.length;
  };

  const generateClaude = async (ask) => {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: systemPrompt(doc),
        messages: [{ role: "user", content: ask }],
        maxTokens: 8192,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");

    const parsed = extractJson(data.text);
    const paths = (parsed.elements ?? [])
      .map((element) => ({
        name: element.name,
        subPaths: parsePathD(element.d),
        style: {
          fill: element.fill ?? "none",
          stroke: element.stroke ?? "#1f2937",
          strokeWidth: Number(element.strokeWidth) || 6,
        },
      }))
      .filter((element) => element.subPaths.length);

    if (!paths.length) throw new Error("No usable geometry came back — try rephrasing.");
    addPaths(paths);
    fitView();
    return `Added ${paths.length} element${paths.length === 1 ? "" : "s"}.`;
  };

  const generateTextVector = async (ask) => {
    const response = await fetch("/api/fal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "fal-ai/recraft/v4.1/text-to-vector",
        input: { prompt: ask, image_size: "square_hd" },
        fetchFile: true,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    if (!data.file?.text) throw new Error("Recraft didn't return an SVG.");
    const count = dropSvg(data.file.text, "Recraft");
    return `Added ${count} element${count === 1 ? "" : "s"} from Recraft.`;
  };

  const generateImageVector = async (file) => {
    const imageUrl = await fileToPngDataUrl(file);
    const response = await fetch("/api/fal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "fal-ai/recraft/vectorize",
        input: { image_url: imageUrl },
        fetchFile: true,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    if (!data.file?.text) throw new Error("Recraft didn't return an SVG.");
    const count = dropSvg(data.file.text, file.name.replace(/\.[^.]+$/, "") || "Vectorized");
    return `Vectorized into ${count} element${count === 1 ? "" : "s"}.`;
  };

  const run = async (text) => {
    const ask = (text ?? prompt).trim();
    if (mode !== "image" && !ask) return;
    if (busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const message =
        mode === "text" ? await generateTextVector(ask) : await generateClaude(ask);
      setResult(message);
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  const onImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await generateImageVector(file));
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  const examples = mode === "text" ? TEXT_EXAMPLES : CLAUDE_EXAMPLES;
  const busyLabel = mode === "text" ? "Vectorizing…" : "Drawing…";

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex rounded-md border p-0.5">
        {MODES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            disabled={busy}
            onClick={() => {
              setMode(entry.id);
              setError(null);
              setResult(null);
            }}
            className={`flex-1 rounded-sm px-1.5 py-1 text-[11px] leading-tight transition-colors disabled:opacity-50 ${
              mode === entry.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {mode === "claude" ? (
        <p className="text-xs text-muted-foreground">
          Describe geometry and Claude returns SVG path data in this drawing&rsquo;s
          coordinates. Everything it adds is a normal element — editable, and
          undoable with ⌘Z.
        </p>
      ) : null}
      {mode === "text" ? (
        <p className="text-xs text-muted-foreground">
          Recraft V4.1 turns a prompt into a real SVG (via fal), then we drop the
          paths onto this sheet so you can edit them.
        </p>
      ) : null}
      {mode === "image" ? (
        <p className="text-xs text-muted-foreground">
          Upload a PNG, JPG or WEBP. Recraft vectorizes it and the paths land on
          the sheet. Shortest side needs to be at least 256 px — we&rsquo;ll
          upscale if it isn&rsquo;t.
        </p>
      ) : null}

      {mode !== "image" ? (
        <>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={
              mode === "text"
                ? "e.g. a cute isometric cabin, flat vector"
                : "e.g. a 3-bay steel portal frame, elevation"
            }
            rows={3}
            className="text-sm"
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) run();
            }}
          />

          <Button size="sm" onClick={() => run()} disabled={busy || !prompt.trim()}>
            {busy ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
            {busy ? busyLabel : "Generate"}
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<label />}
          disabled={busy}
        >
          {busy ? <Spinner className="size-4" /> : <ImageUp className="size-4" />}
          {busy ? "Vectorizing…" : "Upload image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            hidden
            disabled={busy}
            onChange={onImage}
          />
        </Button>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {result ? <p className="text-xs text-muted-foreground">{result}</p> : null}

      {mode !== "image" ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Try one of these</span>
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              disabled={busy}
              onClick={() => {
                setPrompt(example);
                run(example);
              }}
              className="rounded-md border border-dashed px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-solid hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const aiBrick = {
  id: "ai-XX",
  label: "AI",
  panels: [{ id: "ai", label: "AI", order: 40, Panel: AiPanel }],
};
