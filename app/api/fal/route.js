import { generateImage } from "@/lib/fal";

// POST /api/fal
// Body: { prompt: string, model?: string }
// Runs on the server so the FAL key stays private. Returns FAL's raw result
// (usually { images: [{ url }], ... }).
export async function POST(request) {
  if (!process.env.FAL_KEY) {
    return Response.json(
      { error: "FAL_KEY is not set. See .env.local.example." },
      { status: 500 }
    );
  }

  try {
    const { prompt, model } = await request.json();
    if (!prompt) {
      return Response.json({ error: "Body must include a `prompt`." }, { status: 400 });
    }
    const data = await generateImage(prompt, model ? { model } : undefined);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
