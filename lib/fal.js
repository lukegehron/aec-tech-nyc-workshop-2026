import { fal } from "@fal-ai/client";

// SERVER-ONLY. Configures the FAL client with the room's API key. Never import
// this file (or @fal-ai/client) into a client component — use it only inside
// app/api/**/route.js so the key stays off the browser.
fal.config({ credentials: process.env.FAL_KEY });

export { fal };

/** Run any fal model with an arbitrary input payload. */
export async function runModel(model, input) {
  const result = await fal.subscribe(model, { input });
  return result.data;
}

// Example helper: text-to-image. Swap the model / inputs for your brick.
export async function generateImage(prompt, { model = "fal-ai/flux/schnell" } = {}) {
  return runModel(model, { prompt });
}

/** Pull the first file object ({ url, content_type, file_name }) out of a fal result. */
export function firstFile(data) {
  if (!data || typeof data !== "object") return null;
  const candidates = [
    data.image,
    data.model_glb,
    data.thumbnail,
    ...(Array.isArray(data.images) ? data.images : []),
  ];
  return candidates.find((item) => item && typeof item.url === "string") ?? null;
}

/**
 * Download the first file on the result when it's SVG (so the browser doesn't
 * have to fight CORS). Non-SVG files return metadata + url only — GLBs are
 * too large to proxy through this route.
 */
export async function fetchResultFile(data) {
  const file = firstFile(data);
  if (!file) return null;

  const contentType = file.content_type || "";
  const name = file.file_name || "";
  const isSvg =
    contentType.includes("svg") || name.endsWith(".svg") || /\.svg(\?|$)/i.test(file.url);

  if (!isSvg) {
    return { url: file.url, contentType, fileName: name };
  }

  const response = await fetch(file.url);
  if (!response.ok) {
    throw new Error(`Couldn't download the SVG (${response.status}).`);
  }
  return {
    url: file.url,
    contentType: contentType || "image/svg+xml",
    fileName: name,
    text: await response.text(),
  };
}
