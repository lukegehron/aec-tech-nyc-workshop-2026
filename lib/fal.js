import { fal } from "@fal-ai/client";

// SERVER-ONLY. Configures the FAL client with the room's API key. Never import
// this file (or @fal-ai/client) into a client component — use it only inside
// app/api/**/route.js so the key stays off the browser.
fal.config({ credentials: process.env.FAL_KEY });

export { fal };

// Example helper: text-to-image. Swap the model / inputs for your brick.
export async function generateImage(prompt, { model = "fal-ai/flux/schnell" } = {}) {
  const result = await fal.subscribe(model, {
    input: { prompt },
  });
  return result.data;
}
