import Anthropic from "npm:@anthropic-ai/sdk";

// Meal photo -> macro estimate via Claude vision.
// Needs the ANTHROPIC_API_KEY secret. Without it, returns {configured:false} and the
// frontend falls back to a sample estimate so the demo never breaks.
// Deployed with verify_jwt = true (members call it signed in).
//
// Model note: uses claude-opus-5. For cheaper/faster meal photos, change `model` to
// "claude-haiku-4-5" (~5x cheaper, still has vision).

const KEY = Deno.env.get("ANTHROPIC_API_KEY");

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });

const clampInt = (v: unknown, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!KEY) return json({ configured: false });

  let image = "";
  try {
    ({ image = "" } = await req.json());
  } catch {
    return json({ error: "bad body" }, 400);
  }
  if (!image) return json({ error: "no image" }, 400);

  let media_type = "image/jpeg";
  let data = image;
  const m = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/s);
  if (m) {
    media_type = m[1];
    data = m[2];
  }

  const anthropic = new Anthropic({ apiKey: KEY });

  try {
    const res = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 300,
      output_config: { effort: "low" },
      system:
        "You estimate nutrition from a photo of a meal, tuned for Indian food. " +
        "Reply with ONLY a compact JSON object, no prose, no code fence: " +
        '{"label": string (short dish description), "kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number}. ' +
        'Estimate a single typical serving. If the image is not food, use label "Not a meal" and zeros.',
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type, data } },
            { type: "text", text: "Estimate the macros for this meal." },
          ],
        },
      ],
    });

    const text = res.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
    const parsed = JSON.parse(text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());

    return json({
      configured: true,
      label: String(parsed.label ?? "Meal").slice(0, 80),
      kcal: clampInt(parsed.kcal, 3000),
      protein_g: clampInt(parsed.protein_g, 200),
      carbs_g: clampInt(parsed.carbs_g, 400),
      fat_g: clampInt(parsed.fat_g, 200),
    });
  } catch (e) {
    return json({ configured: true, error: String(e instanceof Error ? e.message : e) }, 502);
  }
});
