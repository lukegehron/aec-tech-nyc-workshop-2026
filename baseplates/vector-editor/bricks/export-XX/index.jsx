"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Check, Copy, Download, FolderOpen, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { docAtom, elementsAtom, fitViewAtom, loadSceneAtom } from "../../atoms";
import { downloadText, elementsToSvg, parseSvg } from "../../svgIo";

const SAMPLE = "/sample-data/floor-plan.svg";

function ExportPanel() {
  const elements = useAtomValue(elementsAtom);
  const doc = useAtomValue(docAtom);
  const loadScene = useSetAtom(loadSceneAtom);
  const fitView = useSetAtom(fitViewAtom);

  const [fitToSheet, setFitToSheet] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const fitOption = fitToSheet
    ? { width: doc.width, height: doc.height, padding: doc.width * 0.05 }
    : null;

  const openSample = async () => {
    setError(null);
    try {
      const response = await fetch(SAMPLE);
      if (!response.ok) throw new Error(`Couldn't load ${SAMPLE}`);
      // The sample is authored at the sheet's own coordinates, so it drops in
      // one-to-one — no fitting, no rescaling of line weights.
      loadScene(parseSvg(await response.text()), { name: "Sample floor plan" });
      fitView();
    } catch (err) {
      setError(String(err.message ?? err));
    }
  };

  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // let the same file be picked twice
    if (!file) return;
    setError(null);
    try {
      const parsed = parseSvg(await file.text(), { fit: fitOption });
      if (!parsed.length) throw new Error("No drawable geometry found in that file.");
      loadScene(parsed, { name: file.name.replace(/\.svg$/i, "") });
      fitView();
    } catch (err) {
      setError(String(err.message ?? err));
    }
  };

  const svg = () => elementsToSvg(elements, doc);

  const exportFile = () => downloadText(`${doc.name || "drawing"}.svg`, svg());

  const copySource = async () => {
    await navigator.clipboard.writeText(svg());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={openSample}>
          <FolderOpen className="size-4" />
          Sample plan
        </Button>
        {/* Base UI has no `asChild`. `render` + `nativeButton={false}` is how
            you make a Button that is really a <label> wrapping a file input. */}
        <Button variant="outline" size="sm" nativeButton={false} render={<label />}>
          <Upload className="size-4" />
          Import SVG
          <input type="file" accept=".svg,image/svg+xml" hidden onChange={importFile} />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs" htmlFor="ve-fit-import">
          Fit imports to the sheet
        </Label>
        <Switch id="ve-fit-import" checked={fitToSheet} onCheckedChange={setFitToSheet} />
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Separator />

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={exportFile} disabled={!elements.length}>
          <Download className="size-4" />
          Export SVG
        </Button>
        <Button variant="outline" size="sm" onClick={copySource} disabled={!elements.length}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy source"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Exported files carry a real-world <code className="font-mono">width</code>/
        <code className="font-mono">height</code> in millimetres as well as the
        viewBox, so they open at true scale.
      </p>

      <Button
        variant="ghost"
        size="sm"
        className="justify-start px-0 text-xs text-muted-foreground"
        onClick={() => setSource(source ? null : svg())}
        disabled={!elements.length}
      >
        {source ? "Hide" : "Show"} SVG source
      </Button>
      {source ? (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-[11px] leading-relaxed">
          {source}
        </pre>
      ) : null}

      <Separator />

      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => loadScene([])}
        disabled={!elements.length}
      >
        <Trash2 className="size-4" />
        Clear drawing
      </Button>
    </div>
  );
}

export const exportBrick = {
  id: "export-XX",
  label: "File",
  panels: [{ id: "file", label: "File", order: 50, Panel: ExportPanel }],
};
