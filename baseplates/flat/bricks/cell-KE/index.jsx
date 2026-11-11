"use client";

import { useState } from "react";

const USER = {
  name: "Kenny",
  initials: "KE",
  title: "Computational Designer",
  github: "@ktam-tt",
  seat: "Developer",
  toolkit: "Excel · Rhino · Revit · Grasshopper · JavaScript · Python",
  sticker: "🟢",
};

const COLUMNS = ["A", "B", "C"];

const gridCell = "border border-gray-300 px-2 py-1 text-left align-middle";
const rowHeader =
  "w-8 border border-gray-300 bg-gray-100 px-1 py-1 text-center font-normal text-gray-500";

function CellBadge({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div className="h-full overflow-auto">
      <table
        className={`w-full border-collapse bg-white font-mono text-gray-900 ${
          expanded ? "text-base" : "text-xs"
        }`}
      >
        <thead>
          <tr>
            <th className="w-8 border border-green-800 bg-green-700 px-1 py-1" />
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="border border-green-800 bg-green-700 px-2 py-1 text-center font-semibold text-white"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={rowHeader}>1</th>
            <td className={`${gridCell} font-semibold`}>
              <span className="flex items-center gap-2">
                {portraitFailed ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-700 text-[10px] font-semibold text-white">
                    {USER.initials}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portraitUrl}
                    alt={USER.name}
                    className="size-6 shrink-0 rounded-full object-cover"
                    onError={() => setPortraitFailed(true)}
                  />
                )}
                {USER.name}
              </span>
            </td>
            <td className={gridCell}>{USER.title}</td>
            <td className={gridCell}>
              {USER.sticker} {USER.seat}
            </td>
          </tr>
          {toolkit.map((tool, i) => (
            <tr key={tool} className={i % 2 === 0 ? "bg-green-50" : "bg-white"}>
              <th className={`${rowHeader} bg-green-100 text-green-800`}>
                {i + 2}
              </th>
              <td
                className={`${gridCell} border-l-4 border-l-green-600 font-semibold text-green-900`}
              >
                <span className="mr-2 text-green-600">✓</span>
                {tool}
              </td>
              <td className={gridCell} />
              <td className={gridCell} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const cellKE = {
  id: "cell-KE",
  label: "Cell badge",
  cards: [
    {
      id: "cell-badge",
      label: "Kenny",
      order: 92,
      span: 2,
      hint: "@ktam-tt",
      Card: CellBadge,
    },
  ],
};
