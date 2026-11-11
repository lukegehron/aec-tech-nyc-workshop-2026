import Anthropic from "@anthropic-ai/sdk";

// SERVER-ONLY. This wraps the Anthropic SDK and reads the API key from the
// environment. Never import this file (or @anthropic-ai/sdk) into a client
// component — it must only be used inside app/api/**/route.js so the key
// never ships to the browser.

// ---------------------------------------------------------------------------
// One key, two jobs
// ---------------------------------------------------------------------------
// The room runs on OpenRouter, and the card each attendee is handed has ONE key
// on it (starting `sk-or-`) with a hard spend cap. That single key has to do
// two different things:
//
//   1. authenticate **Claude Code**, the CLI — it reads ANTHROPIC_AUTH_TOKEN
//      and ANTHROPIC_BASE_URL from the environment, which .devcontainer sets
//   2. authenticate **this app's own** Claude calls — /api/claude, which the
//      Vector Editor uses — which is what the code below is for
//
// So we accept the key from either place. ANTHROPIC_API_KEY is what someone
// working on their laptop puts in `.env.local`; ANTHROPIC_AUTH_TOKEN is what
// Codespaces injects from the secret prompt. The `||` matters: in a Codespace
// ANTHROPIC_API_KEY is deliberately set to an *empty string* (so Claude Code
// can't silently fall back to a cached Anthropic login and dodge the spend
// cap), and empty is falsy, so we fall through to the auth token.
//
// A plain Anthropic key (`sk-ant-…`) in ANTHROPIC_API_KEY still works exactly
// as it always did — nothing below fires unless the key says `sk-or-`.
export const apiKey =
  process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || "";

// OpenRouter speaks the Anthropic Messages API at /api/v1/messages, and the
// SDK appends `/v1/messages` to whatever baseURL it's given — so the base is
// `/api`, NOT `/api/v1` (that's the OpenAI-compatible path, and it 404s here).
const OPENROUTER_BASE_URL = "https://openrouter.ai/api";

export const isOpenRouter = apiKey.startsWith("sk-or-");

export const anthropic = new Anthropic({
  apiKey,
  ...(isOpenRouter ? { baseURL: OPENROUTER_BASE_URL } : {}),
});

// Default to the latest capable Claude model. See CLAUDE.md before changing.
// Written in Anthropic's own form; `toModelId` below namespaces it when we're
// routing through OpenRouter, so nothing else in the repo has to care which
// backend it's talking to.
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

// OpenRouter requires namespaced model ids, and it writes the version with a
// dot: Anthropic's `claude-sonnet-5-5` is OpenRouter's
// `anthropic/claude-sonnet-5.5`. Ids that already carry a namespace (or name a
// different vendor, e.g. `openai/gpt-6.1-sol`) are passed through untouched.
export function toModelId(model) {
  if (!isOpenRouter || model.includes("/")) return model;
  return `anthropic/${model.replace(/-(\d+)-(\d+)$/, "-$1.$2")}`;
}

export async function askClaude(messages, { model = DEFAULT_MODEL, system, maxTokens = 4096 } = {}) {
  const response = await anthropic.messages.create({
    model: toModelId(model),
    max_tokens: maxTokens,
    system,
    messages,
  });
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
