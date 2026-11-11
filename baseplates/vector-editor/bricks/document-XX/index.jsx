"use client";

import { useAtom, useAtomValue } from "jotai";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { docAtom, elementsAtom } from "../../atoms";
import { formatLength } from "../../model";

/**
 * Everything here is a property of the *sheet*, not of the geometry. Changing
 * the scale doesn't move a single point — it only changes what the dimension
 * labels say a unit is worth, which is exactly how a drawing scale behaves.
 */

// 1 unit = N mm. At 1:100 on a 2 mm grid, one unit is a centimetre.
const SCALES = [
  { value: 1, label: "1 unit = 1 mm (detail)" },
  { value: 10, label: "1 unit = 10 mm (plan)" },
  { value: 100, label: "1 unit = 100 mm (site)" },
];

const GRIDS = [
  { value: 10, label: "fine" },
  { value: 25, label: "medium" },
  { value: 50, label: "coarse" },
  { value: 100, label: "very coarse" },
];

function DocumentPanel() {
  const [doc, setDoc] = useAtom(docAtom);
  const elements = useAtomValue(elementsAtom);
  const patch = (next) => setDoc({ ...doc, ...next });

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-2">
        <Label className="text-xs" htmlFor="ve-doc-name">
          Drawing name
        </Label>
        <Input
          id="ve-doc-name"
          value={doc.name}
          onChange={(event) => patch({ name: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Scale</Label>
        <NativeSelect
          className="w-full"
          value={doc.mmPerUnit}
          onChange={(event) => patch({ mmPerUnit: Number(event.target.value) })}
          aria-label="Drawing scale"
        >
          {SCALES.map((scale) => (
            <NativeSelectOption key={scale.value} value={scale.value}>
              {scale.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p className="text-xs text-muted-foreground">
          Sheet is {formatLength(doc.width * doc.mmPerUnit)} ×{" "}
          {formatLength(doc.height * doc.mmPerUnit)}. Dimensions and the exported
          file both follow this.
        </p>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs" htmlFor="ve-show-grid">
          Show grid
        </Label>
        <Switch
          id="ve-show-grid"
          checked={doc.showGrid}
          onCheckedChange={(checked) => patch({ showGrid: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs" htmlFor="ve-snap">
          Snap to grid
        </Label>
        <Switch
          id="ve-snap"
          checked={doc.snap}
          onCheckedChange={(checked) => patch({ snap: checked })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Grid spacing</Label>
        <NativeSelect
          className="w-full"
          value={doc.grid}
          onChange={(event) => patch({ grid: Number(event.target.value) })}
          aria-label="Grid spacing"
        >
          {GRIDS.map((grid) => (
            <NativeSelectOption key={grid.value} value={grid.value}>
              {formatLength(grid.value * doc.mmPerUnit)} — {grid.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
        <dt>Elements</dt>
        <dd className="text-right font-mono text-foreground">{elements.length}</dd>
        <dt>Dimensions</dt>
        <dd className="text-right font-mono text-foreground">
          {elements.filter((e) => e.type === "dimension").length}
        </dd>
        <dt>Hidden</dt>
        <dd className="text-right font-mono text-foreground">
          {elements.filter((e) => e.hidden).length}
        </dd>
      </dl>
    </div>
  );
}

export const documentBrick = {
  id: "document-XX",
  label: "Sheet",
  panels: [{ id: "document", label: "Sheet", order: 30, Panel: DocumentPanel }],
};
