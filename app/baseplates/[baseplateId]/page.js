"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseplate } from "@/lib/baseplates";

// One route for every baseplate. In Next.js 16 `params` is async, so we unwrap
// it with React's `use()`. Beginners never need to touch this file — adding a
// baseplate to the registry makes its route appear automatically.
export default function BaseplatePage({ params }) {
  const { baseplateId } = use(params);
  const baseplate = getBaseplate(baseplateId);

  if (!baseplate) notFound();

  const { Screen, label, description } = baseplate;

  return (
    // `data-baseplate-color` scopes this baseplate's colour to the whole page,
    // so the baseplate and every brick on it can use `text-baseplate` /
    // `bg-baseplate/10` without knowing which colour they are.
    <main
      className="mx-auto max-w-6xl px-4 py-8"
      data-baseplate-color={baseplate.color}
    >
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All baseplates
        </Link>
        <h1 className="mt-2 flex items-center gap-2.5 text-3xl font-bold tracking-tight">
          <span aria-hidden className="h-6 w-1.5 rounded-full bg-baseplate" />
          {label}
        </h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Screen />
    </main>
  );
}
