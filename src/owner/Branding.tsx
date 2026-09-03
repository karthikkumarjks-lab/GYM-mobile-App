import { useEffect, useState } from "react";
import { db } from "../lib/db";
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
          Logo upload comes with the real backend. For now the initials + your colour stand in.
        </div>
      </div>
    </div>
  );
}
