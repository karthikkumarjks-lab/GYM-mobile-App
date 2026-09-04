// Send a WhatsApp message via the WhatsApp Cloud API. Needs WHATSAPP_TOKEN + WHATSAPP_PHONE_ID.
// Without them: {configured:false}. verify_jwt = true.
// body: { to, body?, template?, lang?, params? }

const TOKEN = Deno.env.get("WHATSAPP_TOKEN");
const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID");
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!TOKEN || !PHONE_ID) return json({ configured: false });

  let p: Record<string, unknown> = {};
  try {
    p = await req.json();
  } catch {
    return json({ error: "bad body" }, 400);
  }
  const to = String(p.to ?? "").replace(/[^\d]/g, "");
  if (!to) return json({ error: "missing 'to'" }, 400);

  let message: Record<string, unknown>;
  if (p.template) {
    const params = Array.isArray(p.params) ? p.params : [];
    message = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: String(p.template),
        language: { code: String(p.lang ?? "en_US") },
        ...(params.length
          ? { components: [{ type: "body", parameters: params.map((t) => ({ type: "text", text: String(t) })) }] }
          : {}),
      },
    };
  } else {
    message = { messaging_product: "whatsapp", to, type: "text", text: { body: String(p.body ?? "") } };
  }

  const r = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(message),
  });
  const out = await r.json();
  if (!r.ok) return json({ configured: true, ok: false, status: r.status, error: out }, 502);
  return json({ configured: true, ok: true, id: out?.messages?.[0]?.id ?? null });
});
