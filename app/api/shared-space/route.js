// GET  /api/shared-space?since=<version>  → { version, items, presence }
// POST /api/shared-space  body: { op, ... }
//   op "add"      { item }            add a text / line / icon item
//   op "remove"   { id }              remove one item
//   op "clear"    {}                  wipe the board
//   op "presence" { who }             heartbeat: "I'm here" (initials)
//
// The board lives in this server's memory, so everyone who opens the same
// running app (one Codespace's forwarded port) shares it. It resets when the
// dev server restarts. Proposed by shared-space-DY; needs facilitator approval.

export const dynamic = "force-dynamic";

const MAX_ITEMS = 2000;
const KINDS = new Set(["text", "line", "icon"]);

const store = (globalThis.__sharedSpaceDY ??= {
  version: 0,
  items: [],
  presence: {},
});

function snapshot() {
  const cutoff = Date.now() - 10_000;
  const presence = Object.entries(store.presence)
    .filter(([, seen]) => seen > cutoff)
    .map(([who]) => who);
  return { version: store.version, items: store.items, presence };
}

function clean(item) {
  if (!item || !KINDS.has(item.kind)) return null;
  const num = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(1000, n)) : 0);
  const str = (s, max) => String(s ?? "").slice(0, max);
  return {
    id: str(item.id, 40) || crypto.randomUUID(),
    kind: item.kind,
    author: str(item.author, 4),
    color: /^#[0-9a-f]{6}$/i.test(item.color) ? item.color : "#1e293b",
    x: num(item.x),
    y: num(item.y),
    x2: num(item.x2),
    y2: num(item.y2),
    text: str(item.text, 280),
  };
}

export async function GET() {
  return Response.json(snapshot());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  switch (body?.op) {
    case "add": {
      const item = clean(body.item);
      if (!item) return Response.json({ error: "Bad item." }, { status: 400 });
      store.items = [...store.items, item].slice(-MAX_ITEMS);
      break;
    }
    case "remove":
      store.items = store.items.filter((item) => item.id !== body.id);
      break;
    case "clear":
      store.items = [];
      break;
    case "presence":
      if (typeof body.who === "string" && body.who.length <= 4) {
        store.presence[body.who] = Date.now();
      }
      return Response.json(snapshot());
    default:
      return Response.json({ error: "Unknown op." }, { status: 400 });
  }

  store.version += 1;
  return Response.json(snapshot());
}
