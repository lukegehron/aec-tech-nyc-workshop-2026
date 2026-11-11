"use client";

import { useState } from "react";

function PullRequestCard() {
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <article className="mx-auto flex h-full w-full max-w-xl flex-col justify-center p-4 sm:p-6">
      <div className="overflow-hidden rounded-lg bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-600 p-px shadow-sm">
        <div className="overflow-hidden rounded-[7px] bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 text-white">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 px-4 py-4">
            <h1 className="text-xl font-semibold leading-tight">June Deng</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-100">
              <span className="rounded border border-white/50 px-1.5 py-0.5 text-xs font-semibold text-white">PR</span>
              <span>Open pull request</span>
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              {portraitFailed ? (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-blue-800">
                  JD
                </div>
              ) : (
                <img
                  alt="June Deng"
                  className="size-10 shrink-0 rounded-full bg-blue-100 object-cover"
                  onError={() => setPortraitFailed(true)}
                  src="https://github.com/placeholder.png"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold leading-tight text-white sm:text-xl">
                  Brand New, Brave
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  <span className="font-medium text-white">June Deng</span> wants to merge this pull request
                </p>
              </div>
            </div>

            <a
              className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-900 transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href="https://www.linkedin.com/in/june-yun-zhu-deng/"
              rel="noreferrer"
              target="_blank"
            >
              Connect
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export const prBadgeJD = {
  id: "pr-badge-JD",
  label: "June Deng",
  cards: [
    {
      id: "pr-badge-JD",
      label: "June Deng",
      order: 90,
      span: 1,
      hint: "@swiftynimbus",
      Card: PullRequestCard,
    },
  ],
};