import { fetchResultFile, generateImage, runModel } from "@/lib/fal";

// Recraft vectorize / Hunyuan 3D can sit in the queue for a while.
export const maxDuration = 300;

// POST /api/fal
// Body, either:
//   { prompt: string, model?: string }                  — original text-to-image
//   { model: string, input: object, fetchFile?: bool }  — any fal endpoint
// Runs on the server so the FAL key stays private.
export async function POST(request) {
  if (!process.env.FAL_KEY) {
    return Response.json(
      {
        error:
          "FAL_KEY is not set. Put the room's fal key in .env.local as FAL_KEY and restart `npm run dev`.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const model = body.model || "fal-ai/flux/schnell";
    const input =
      body.input && typeof body.input === "object"
        ? body.input
        : body.prompt
          ? { prompt: body.prompt }
          : null;

    if (!input) {
      return Response.json(
        { error: "Body must include `input` or `prompt`." },
        { status: 400 }
      );
    }

    const data = body.input
      ? await runModel(model, input)
      : await generateImage(input.prompt, { model });

    if (!body.fetchFile) return Response.json({ data });

    const file = await fetchResultFile(data);
    return Response.json({ data, file });
  } catch (err) {
    return Response.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
