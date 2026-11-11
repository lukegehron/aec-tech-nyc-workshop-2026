"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useCardState } from "../../storage";

/**
 * Paste anything — meeting notes, a brief, a messy email — and Claude returns
 * a short summary. The last run is remembered on this machine via useCardState.
 */

const SYSTEM = [
  "You summarize text for a design workshop.",
  "Reply with a tight title line, then 4–8 bullet points of the substance,",
  "then one line of 'open questions' if any are implied.",
  "No preamble. No markdown fences.",
].join(" ");

function SummarizerCard({ expanded }) {
  const [saved, setSaved] = useCardState("ai-summarizer-LG", {
    source: "",
    summary: "",
  });
  const [source, setSource] = useState(saved.source || "");
  const [summary, setSummary] = useState(saved.summary || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const summarize = async () => {
    const text = source.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM,
          messages: [{ role: "user", content: text }],
          maxTokens: 1024,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      const next = (data.text || "").trim();
      if (!next) throw new Error("Claude returned an empty summary.");
      setSummary(next);
      setSaved({ source: text, summary: next });
    } catch (err) {
      setError(String(err.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <Textarea
        value={source}
        onChange={(event) => setSource(event.target.value)}
        placeholder="Paste notes, a brief, or a messy thread…"
        className="min-h-24 resize-none text-sm"
        rows={expanded ? 8 : 5}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            summarize();
          }
        }}
      />
      <Button size="sm" onClick={summarize} disabled={busy || !source.trim()}>
        {busy ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
        {busy ? "Summarizing…" : "Summarize"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {summary ? (
        <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-sans text-sm leading-relaxed">
          {summary}
        </pre>
      ) : (
        <p className="text-xs text-muted-foreground">
          Uses the same Claude key as the Vector Editor. ⌘Enter to run.
        </p>
      )}
    </div>
  );
}

export const aiSummarizerBrick = {
  id: "ai-summarizer-LG",
  label: "AI summarizer",
  cards: [
    {
      id: "ai-summarizer",
      label: "AI summarizer",
      order: 40,
      span: 2,
      hint: "Claude, this machine",
      Card: SummarizerCard,
    },
  ],
};
