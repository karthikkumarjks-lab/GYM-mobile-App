// Meal photo -> dish name (+ rough macros) via a vision model.
// Free path: set GEMINI_API_KEY (free tier at https://aistudio.google.com/apikey).
// Paid path: set ANTHROPIC_API_KEY instead (Claude vision).
// With neither key: {configured:false} and the member types the dish name.
// The client always re-checks the name against the local food table, so the
// numbers a member sees come from the table whenever the dish is known —
// the model's job is mainly to name the dish. verify_jwt = true.

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "content-type": "application/json" } });
const clampInt = (v: unknown, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
};
const stripFence = (s: string) =>
  s.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();

const PROMPT =
  "You identify a meal from a photo, tuned for Indian food but covering world cuisine. " +
  "Name the main dish and any clear side dishes together in the label, e.g. " +
  '"chicken biryani + raita" or "masala dosa + sambar". ' +
  "Reply with ONLY a compact JSON object, no prose, no code fence: " +
  '{"label": string, "kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number}. ' +
  "Numbers are a rough estimate for one typical serving. " +
  'If the image is not food, use label "Not a meal" and zeros.';

function normalise(parsed: Record<string, unknown>) {
  return {
    configured: true,
    label: String(parsed.label ?? "Meal").slice(0, 100),
    kcal: clampInt(parsed.kcal, 3000),
    protein_g: clampInt(parsed.protein_g, 200),
    carbs_g: clampInt(parsed.carbs_g, 400),
    fat_g: clampInt(parsed.fat_g, 200),
  };
}

async function viaGemini(media_type: string, data: string) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    GEMINI_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: media_type, data } },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return normalise(JSON.parse(stripFence(text)));
}

async function viaClaude(media_type: string, data: string) {
  const Anthropic = (await import("npm:@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type, data } },
          { type: "text", text: "Identify this meal." },
        ],
      },
    ],
  });
  const text = res.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
  return normalise(JSON.parse(stripFence(text)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!GEMINI_KEY && !ANTHROPIC_KEY) return json({ configured: false });

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

  try {
    const out = GEMINI_KEY ? await viaGemini(media_type, data) : await viaClaude(media_type, data);
    return json(out);
  } catch (e) {
    return json({ configured: true, error: String(e instanceof Error ? e.message : e) }, 502);
  }
});
