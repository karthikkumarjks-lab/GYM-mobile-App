// Send a WhatsApp message via the WhatsApp Cloud API (Meta).
// Needs secrets: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID.
// Without them, returns {configured:false} and the caller keeps its simulated outbox.
// Deployed with verify_jwt = true.
//
// body: { to: "+9198...", body?: string, template?: string, lang?: string, params?: string[] }
//  - template given  -> template message (works anytime; needs Meta approval, except
//                       the built-in "hello_world" which every account has)
//  - body only       -> free-form text (only delivers within 24h of the user messaging you)

const TOKEN = Deno.env.get("WHATSAPP_TOKEN");
const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID");

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
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
