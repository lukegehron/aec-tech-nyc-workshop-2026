import { askClaude, apiKey } from "@/lib/claude";

// POST /api/claude
// Body: { messages: [{ role, content }], system?: string, model?: string }
// This runs on the server — the API key never reaches the browser.
export async function POST(request) {
  // `apiKey` is ANTHROPIC_API_KEY or, in a Codespace, ANTHROPIC_AUTH_TOKEN —
  // lib/claude.js explains why there are two.
  if (!apiKey) {
    return Response.json(
      {
        error:
          "No Claude key found. In a Codespace this means the ANTHROPIC_AUTH_TOKEN " +
          "secret is missing — see the banner in your terminal. On a laptop, put " +
          "your sk-or- key in .env.local as ANTHROPIC_API_KEY and restart " +
          "`npm run dev`. See .env.local.example.",
      },
      { status: 500 }
    );
  }

  try {
    const { messages, system, model } = await request.json();
    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Body must include a `messages` array." },
        { status: 400 }
      );
    }
    const text = await askClaude(messages, { system, model });
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
