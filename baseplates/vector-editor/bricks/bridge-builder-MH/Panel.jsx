"use client";

import { useAtom, useAtomValue } from "jotai";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { docAtom } from "../../atoms";
import { formatLength } from "../../model";
import { bridgeSettingsAtom } from "./atoms";
import { BRIDGE_TYPES, bayGridFor } from "./bridge";

/** The Bridge tab: type, bay width, height, and what gets drawn. */
export default function BridgePanel() {
  const [opts, setOpts] = useAtom(bridgeSettingsAtom);
  const doc = useAtomValue(docAtom);
  const patch = (next) => setOpts({ ...opts, ...next });
  const bayMm = doc.grid * bayGridFor(opts) * doc.mmPerUnit;
  const heightMm = doc.grid * opts.heightGrid * doc.mmPerUnit;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-xs text-muted-foreground">
        Pick the Bridge tool (G), then drag from one abutment to the other. Nodes snap to the
        grid and the span rounds to whole bays.
      </p>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Type</Label>
        <NativeSelect
          className="w-full"
          value={opts.type}
          onChange={(event) => patch({ type: event.target.value })}
          aria-label="Bridge type"
        >
          {BRIDGE_TYPES.map((t, i) => (
            <NativeSelectOption key={t.value} value={t.value}>
              {`${i + 1} · ${t.label}`}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label className="text-xs" htmlFor="ve-bridge-bay">
            Bay (grid squares)
          </Label>
          <Input
            id="ve-bridge-bay"
            type="number"
            min={1}
            max={12}
            value={opts.bayGrid}
            onChange={(event) => patch({ bayGrid: Number(event.target.value) })}
          />
          <span className="text-xs text-muted-foreground">{formatLength(bayMm)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs" htmlFor="ve-bridge-height">
            Height (grid squares)
          </Label>
          <Input
            id="ve-bridge-height"
            type="number"
            min={1}
            max={20}
            value={opts.heightGrid}
            onChange={(event) => patch({ heightGrid: Number(event.target.value) })}
          />
          <span className="text-xs text-muted-foreground">{formatLength(heightMm)}</span>
        </div>
      </div>
      {opts.type === "warren" && bayGridFor(opts) !== Math.round(opts.bayGrid) ? (
        <p className="text-xs text-muted-foreground">
          A Warren needs an even bay so its top nodes stay on the grid, so it uses{" "}
          {bayGridFor(opts)}.
        </p>
      ) : null}

      <Separator />

      <div className="flex items-center justify-between">
        <Label className="text-xs" htmlFor="ve-bridge-dim">
          Span dimension
        </Label>
        <Switch
          id="ve-bridge-dim"
          checked={opts.dimension}
          onCheckedChange={(checked) => patch({ dimension: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs" htmlFor="ve-bridge-nodes">
          Node dots
        </Label>
        <Switch
          id="ve-bridge-nodes"
          checked={opts.nodes}
          onCheckedChange={(checked) => patch({ nodes: checked })}
        />
      </div>
      {!doc.snap ? (
        <p className="text-xs text-destructive">
          Snap is off in the Sheet panel, so the abutments won&apos;t land on grid nodes.
        </p>
      ) : null}
    </div>
  );
}
