"use client";

// One stylized version of the source image, drawn to its own canvas.

import { useEffect, useRef } from "react";

export function Tile({ style, src, amount, big }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    canvas.width = src.width;
    canvas.height = src.height;
    const pixels = style.run(src, amount);
    canvas.getContext("2d").putImageData(new ImageData(pixels, src.width, src.height), 0, 0);
  }, [style, src, amount]);

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stylized-${style.key}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <figure className="flex flex-col gap-1">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${style.label} version`}
        className={`w-full rounded-md border bg-muted ${big ? "max-h-[70vh] object-contain" : ""}`}
      />
      <figcaption className="flex items-center justify-between text-xs">
        <span className="font-medium">{style.label}</span>
        <button type="button" onClick={download} className="rounded border bg-background px-1.5 py-0.5 hover:bg-muted">
          Save PNG
        </button>
      </figcaption>
    </figure>
  );
}
