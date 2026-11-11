"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DON'T CLICK THIS BUTTON — a toolbar tool with one job.
 *
 * Clicking it covers the whole viewport with an empty black layer: no text, no
 * error, nothing to click. Reloading the page is the only way back.
 */
function DontClickToolbar() {
  const [blank, setBlank] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 rounded-md border p-0.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => setBlank(true)}
          title="Please don't"
        >
          <TriangleAlert className="size-3.5" />
          Don&apos;t click this button
        </Button>
      </div>

      {blank
        ? createPortal(
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483647,
                background: "#000",
                cursor: "none",
              }}
            />,
            document.body
          )
        : null}
    </>
  );
}

/**
 * The brick starts hidden in the "Add to this surface" tray (initialed ids are
 * off by default), and that chip is rendered by the shared KitTray, which a
 * brick cannot give its own onClick. So the brick listens for a click on that
 * chip itself and blanks the screen on the very first click.
 *
 * The chip's text is exactly "Don't click"; the toolbar button reads "Don't
 * click this button", so the two cannot be confused. Registered once per page.
 */
function blankScreen() {
  if (document.getElementById("dont-click-RH-blank")) return;
  const layer = document.createElement("div");
  layer.id = "dont-click-RH-blank";
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    background: "#000",
    cursor: "none",
  });
  document.body.appendChild(layer);
}

if (typeof document !== "undefined" && !window.__dontClickRHListener) {
  window.__dontClickRHListener = true;
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target instanceof Element
        ? event.target.closest("button")
        : null;
      if (button && button.textContent.trim() === "Don't click") blankScreen();
    },
    true
  );
}

export const dontClickBrick = {
  id: "dont-click-RH",
  label: "Don't click",
  hint: "Please don't",
  order: 90,
  Toolbar: DontClickToolbar,
};
