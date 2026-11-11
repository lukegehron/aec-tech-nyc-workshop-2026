"use client";

import Link from "next/link";
import { baseplatesByNavOrder } from "@/lib/baseplates";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          AEC Tech Starter
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start on Flat. Your first brick is a nametag. Your branch is your
          initials. One new folder per PR — facilitators merge. After a
          merge: <code className="text-sm">git pull origin main</code>, keep
          both.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {baseplatesByNavOrder.map((baseplate) => {
          const Icon = baseplate.icon;
          return (
            <Link
              key={baseplate.id}
              href={`/baseplates/${baseplate.id}`}
              data-baseplate-color={baseplate.color}
            >
              <Card className="h-full border-t-4 border-t-baseplate transition-colors hover:border-baseplate/40 hover:bg-baseplate/5">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-baseplate/10 text-baseplate">
                    {Icon ? <Icon className="size-5" /> : null}
                  </div>
                  <CardTitle>{baseplate.label}</CardTitle>
                  <CardDescription>{baseplate.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}


      </div>
    </main>
  );
}
