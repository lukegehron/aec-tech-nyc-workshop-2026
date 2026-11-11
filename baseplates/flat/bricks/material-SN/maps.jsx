"use client";

// Texture-map slots: one row per PBR map, each with its own upload, a thumbnail
// and a remove button. Files dropped on "Add maps" are routed to a slot by name.

export const SLOTS = [
  { key: "map", label: "Albedo / colour", match: /(albedo|diffuse|basecolou?r|base_colou?r|colou?r|diff|col)(?![a-z])/i },
  { key: "normalMap", label: "Normal", match: /(normal|nrm|nor)(?![a-z])/i },
  { key: "roughnessMap", label: "Roughness", match: /(rough|rgh)/i },
  { key: "metalnessMap", label: "Metalness", match: /(metal|mtl)/i },
  { key: "aoMap", label: "Ambient occlusion", match: /(\bao\b|_ao|occlusion|ambient)/i },
  { key: "bumpMap", label: "Height / bump", match: /(height|bump|disp|displacement)/i },
];

// Picks a slot for a file name; null when nothing matches.
export function slotFor(name) {
  // normal first: "normal" would otherwise be caught by the looser colour match
  const order = ["normalMap", "roughnessMap", "metalnessMap", "aoMap", "bumpMap", "map"];
  return order.find((k) => SLOTS.find((s) => s.key === k).match.test(name)) ?? null;
}

export function MapSlots({ urls, onFiles, onSlotFile, onRemove, note }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="cursor-pointer rounded-md border border-baseplate bg-baseplate px-2.5 py-1.5 text-center text-xs font-medium text-white hover:opacity-90">
        Add maps (several at once)
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            onFiles([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Files are matched by name (…_normal, …_rough, …_ao, …_height). Anything unnamed becomes the colour map.
      </p>
      {SLOTS.map((s) => (
        <div key={s.key} className="flex items-center gap-2 rounded-md border p-1.5 text-xs">
          <span
            className="size-9 shrink-0 rounded border bg-muted bg-cover bg-center"
            style={urls[s.key] ? { backgroundImage: `url(${urls[s.key]})` } : undefined}
          />
          <span className="min-w-0 flex-1 truncate">{s.label}</span>
          <label className="cursor-pointer rounded border bg-background px-1.5 py-0.5 hover:bg-muted">
            {urls[s.key] ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) onSlotFile(s.key, f);
              }}
            />
          </label>
          {urls[s.key] && (
            <button type="button" aria-label={`Remove ${s.label}`} onClick={() => onRemove(s.key)} className="rounded border bg-background px-1.5 py-0.5 hover:bg-muted">
              ✕
            </button>
          )}
        </div>
      ))}
      {note && <p className="text-[11px] text-red-600">{note}</p>}
    </div>
  );
}
