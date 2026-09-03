import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { functionsUrl } from "../lib/supabase";
import type { Gym } from "../lib/types";
import { Loading } from "../components/ui";

const COLOURS = ["#F5533D", "#2F7DE1", "#15A24A", "#7A3FF2", "#E0A800", "#111111"];

export default function Branding() {
  const [gym, setGym] = useState<Gym | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.getGym().then(setGym);
  }, []);
  if (!gym) return <Loading />;

  async function patch(p: Partial<Gym>) {
    const g = await db.updateGym(p);
    setGym(g);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <h2 className="text-xl font-extrabold">Your branding</h2>
      <p className="text-sm text-muted">
        One app on the stores. Members only ever see your gym's name, logo and colour.
        {saved && <span className="text-pos font-semibold"> Saved.</span>}
      </p>

      <div className="card p-4 flex flex-col gap-3">
        <label className="eyebrow">Gym name (shown to members)</label>
        <input
          className="field"
          value={gym.name}
          onChange={(e) => setGym({ ...gym, name: e.target.value })}
          onBlur={() => patch({ name: gym.name })}
        />
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <label className="eyebrow">City</label>
        <input
          className="field"
          value={gym.city ?? ""}
          onChange={(e) => setGym({ ...gym, city: e.target.value })}
          onBlur={() => patch({ city: gym.city })}
        />
      </div>

      <div className="card p-4">
        <label className="eyebrow">Accent colour</label>
        <div className="flex gap-2.5 mt-3">
          {COLOURS.map((c) => (
            <button
              key={c}
              aria-label={c}
              onClick={() => patch({ accent: c })}
              className="h-7 w-7 rounded-lg border-2 border-white"
              style={{
                background: c,
                boxShadow: gym.accent === c ? `0 0 0 2px ${c}` : "0 0 0 1px #E7E9EE",
              }}
            />
          ))}
        </div>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <div
          className="h-16 w-16 rounded-2xl grid place-items-center text-white text-xl font-black flex-none"
          style={{ background: gym.accent }}
        >
          {gym.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-sm text-muted">
          Logo upload comes with file storage. For now the initials + your colour stand in.
        </div>
      </div>

      <h2 className="text-xl font-extrabold mt-4">Biometric device</h2>
      <p className="text-sm text-muted">
        Point your ESSL / ZKTeco cloud push (or middleware like CAMS) at this URL. Each punch
        becomes a check-in. Match members by their device enrol id, phone, or member id.
      </p>
      <div className="card p-4 flex flex-col gap-3 text-xs">
        <div>
          <div className="eyebrow mb-1">Webhook URL</div>
          <code className="block bg-paper rounded-lg p-2 break-all">
            {functionsUrl}/device-checkin
          </code>
        </div>
        <div>
          <div className="eyebrow mb-1">Headers</div>
          <code className="block bg-paper rounded-lg p-2 break-all">
            x-gym-code: {gym.code}
            <br />
            x-webhook-secret: {gym.webhook_secret ?? "—"}
          </code>
        </div>
        <div>
          <div className="eyebrow mb-1">Test it</div>
          <code className="block bg-paper rounded-lg p-2 break-all whitespace-pre-wrap">
{`curl -X POST ${functionsUrl}/device-checkin \\
 -H "x-gym-code: ${gym.code}" \\
 -H "x-webhook-secret: ${gym.webhook_secret ?? "SECRET"}" \\
 -d '{"biometric_id":"ENROLL-0003","method":"fingerprint"}'`}
          </code>
        </div>
      </div>
    </div>
  );
}
