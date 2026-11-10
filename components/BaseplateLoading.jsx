import { Spinner } from "@/components/ui/spinner";

/**
 * Fallback shown while a baseplate's Screen (and its client-only libraries
 * like three.js, p5, or pdf.js) is being loaded on the client.
 */
export default function BaseplateLoading({ label }) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-6" />
      <p className="text-sm">Loading {label ? `${label}…` : "baseplate…"}</p>
    </div>
  );
}
