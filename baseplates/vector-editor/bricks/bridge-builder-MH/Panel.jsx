"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { activeToolIdAtom, docAtom, elementsAtom, setToolAtom } from "../../atoms";
import { formatLength } from "../../model";
import { bridgeSettingsAtom } from "./atoms";
import { BRIDGE_TYPES, PIECES, bayGridFor, collectJoints } from "./bridge";

/** The Bridge tab: enter bridge mode, pick the piece to place, and set up preset bridges. */
export default function BridgePanel() {
  const [opts, setOpts] = useAtom(bridgeSettingsAtom);
  const doc = useAtomValue(docAtom);
  const elements = useAtomValue(elementsAtom);
  const activeToolId = useAtomValue(activeToolIdAtom);
  const setTool = useSetAtom(setToolAtom);
  const patch = (next) => setOpts({ ...opts, ...next });
  const inMode = activeToolId === "member" || activeToolId === "bridge";
  const count = (kind) => elements.filter((element) => element.bridge === kind).length;
  const bayMm = doc.grid * bayGridFor(opts) * doc.mmPerUnit;
  const heightMm = doc.grid * opts.heightGrid * doc.mmPerUnit;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant={inMode ? "outline" : "default"}
          onClick={() => setTool(inMode ? "select" : "member")}
        >
          {inMode ? "Exit bridge mode (Esc)" : "Start building (M)"}
        </Button>
        <p className="text-xs text-muted-foreground">
          In bridge mode the canvas turns yellow and the other tools are greyed out. Drag from
          joint to joint to add a piece. Ends snap to existing joints, then to the grid.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Piece to add</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {PIECES.map((piece, i) => (
            <Button
              key={piece.value}
              size="sm"
              variant={opts.piece === piece.value ? "secondary" : "outline"}
              aria-pressed={opts.piece === piece.value}
              onClick={() => {
                patch({ piece: piece.value });
                setTool("member");
              }}
            >
              {`${i + 1} · ${piece.label}`}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {`On the sheet: ${count("member")} members · ${count("deck")} deck · ${count("cable")} cables · ${count("support")} supports · ${collectJoints(elements).length} joints`}
        </p>
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground">
        Or drop a whole preset with the Bridge tool (G). It arrives as separate pieces you can
        delete or add to.
      </p>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Preset type</Label>
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
          Joint dots
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
