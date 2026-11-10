"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { baseplatesByNavOrder } from "@/lib/baseplates";
import { writeOccupantPayload } from "@/baseplates/flat/layout";
import { Button } from "@/components/ui/button";
import BrickMark from "@/components/BrickMark";
import { cn } from "@/lib/utils";

export default function Nav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2">
        {/* The mark is the wordmark. `aria-label` carries the name the
            lettering used to, so the link still says where it goes. */}
        <Link
          href="/"
          aria-label="Home"
          className="mr-4 flex items-center rounded-md p-0.5 transition-opacity hover:opacity-60"
        >
          <BrickMark className="size-12" />
        </Link>
        {baseplatesByNavOrder.map((baseplate) => {
          const href = `/baseplates/${baseplate.id}`;
          const active = pathname === href;
          const Icon = baseplate.icon;
          return (
            <Link
              key={baseplate.id}
              href={href}
              data-baseplate-color={baseplate.color}
              draggable={baseplate.id !== "flat"}
              onDragStart={(event) => {
                if (baseplate.id === "flat") return;
                writeOccupantPayload(event.dataTransfer, {
                  type: "baseplate",
                  id: baseplate.id,
                });
                event.dataTransfer.effectAllowed = "copy";
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-baseplate/10 hover:text-foreground",
                active && "bg-baseplate/10 text-foreground",
              )}
            >
              {/* The icon carries the baseplate's colour whether or not it's the
                  active tab — that's what makes "we're the blue team" stick. */}
              {Icon ? <Icon className="size-4 text-baseplate" /> : null}
              {baseplate.label}
            </Link>
          );
        })}

        {/* Which icon shows is decided by CSS, not by React state. A
            `mounted` flag would be the usual way, but it means setState in an
            effect — which this repo's lint rules reject, and which causes a
            flash of the wrong icon anyway. */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle light or dark"
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </nav>
    </header>
  );
}
