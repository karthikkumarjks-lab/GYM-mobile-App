import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/db";
import type { DietMealSlot, DietPlan, Meal, Member } from "../lib/types";
import { Loading, timeAgo } from "../components/ui";

const SLOTS = ["Breakfast", "Lunch", "Snack", "Dinner"];

export default function MemberDetail() {
  const { id = "" } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [draft, setDraft] = useState<{
    daily_kcal: string;
    protein_g: string;
    carbs_g: string;
    fat_g: string;
    notes: string;
    meals: DietMealSlot[];
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db.listMembers().then((ms) => setMember(ms.find((m) => m.id === id) ?? null));
    db.listMeals(id).then(setMeals);
    db.getDietPlan(id).then((p) => {
      setPlan(p);
      setDraft({
        daily_kcal: p?.daily_kcal != null ? String(p.daily_kcal) : "",
        protein_g: p?.protein_g != null ? String(p.protein_g) : "",
        carbs_g: p?.carbs_g != null ? String(p.carbs_g) : "",
        fat_g: p?.fat_g != null ? String(p.fat_g) : "",
        notes: p?.notes ?? "",
        meals: p?.meals?.length ? p.meals : SLOTS.map((slot) => ({ slot, items: "" })),
      });
    });
  }, [id]);

  if (!member || !draft) return <Loading />;

  const int = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.round(Number(s) || 0)));

  async function savePlan() {
    setBusy(true);
    const p = await db.saveDietPlan(id, {
      daily_kcal: int(draft!.daily_kcal),
      protein_g: int(draft!.protein_g),
      carbs_g: int(draft!.carbs_g),
      fat_g: int(draft!.fat_g),
      notes: draft!.notes.trim() || null,
      meals: draft!.meals.filter((m) => m.items.trim()),
    });
    setPlan(p);
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const setMealSlot = (i: number, items: string) =>
    setDraft((d) => (d ? { ...d, meals: d.meals.map((m, j) => (j === i ? { ...m, items } : m)) } : d));

  const recent = meals.slice(0, 12);
  const todayKcal = meals
    .filter((m) => new Date(m.at).toDateString() === new Date().toDateString())
    .reduce((n, m) => n + (m.kcal || 0), 0);

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <Link to="/owner/members" className="text-xs text-muted">
        ← Members
      </Link>
      <div>
        <h2 className="text-xl font-extrabold">{member.full_name}</h2>
        <p className="text-sm text-muted">
          {member.plan} · joined {new Date(member.joined_on).toLocaleDateString()} · today {todayKcal} kcal logged
        </p>
      </div>

      {/* diet plan editor */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="eyebrow">
          Diet plan {saved && <span className="text-pos"> · saved</span>}
          {plan && <span className="text-muted font-normal"> · updated {timeAgo(plan.updated_at)}</span>}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(["daily_kcal", "protein_g", "carbs_g", "fat_g"] as const).map((k) => (
            <label key={k} className="flex flex-col gap-1">
              <span className="text-[10px] text-muted font-semibold">
                {k === "daily_kcal" ? "kcal/day" : k.replace("_g", "") + " g"}
              </span>
              <input
                className="field !px-2 !py-1.5 text-sm font-bold text-center"
                inputMode="numeric"
                placeholder="—"
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value.replace(/[^\d]/g, "") })}
              />
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {draft.meals.map((m, i) => (
            <div key={m.slot} className="flex gap-2 items-center">
              <span className="text-xs font-bold w-16 flex-none text-muted">{m.slot}</span>
              <input
                className="field flex-1 !py-2 text-sm"
                placeholder="what to eat"
                value={m.items}
                onChange={(e) => setMealSlot(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <textarea
          className="field text-sm min-h-[70px]"
          placeholder="Notes for the member (water, timing, what to avoid…)"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
        <button className="btn" disabled={busy} onClick={savePlan}>
          {busy ? "Saving…" : plan ? "Update plan" : "Assign plan"}
        </button>
        <p className="text-[11px] text-muted">The member sees this on their Meal screen.</p>
      </div>

      {/* their meals */}
      <div>
        <div className="eyebrow mb-2">Recent meals logged ({meals.length})</div>
        <div className="card divide-y divide-line">
          {recent.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-center gap-3">
              {m.photo_url ? (
                <img src={m.photo_url} alt="" className="h-11 w-11 rounded-lg object-cover flex-none" />
              ) : (
                <div className="h-11 w-11 rounded-lg bg-paper grid place-items-center flex-none">🍽️</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{m.label}</div>
                <div className="text-xs text-muted">
                  {new Date(m.at).toLocaleDateString()} · {new Date(m.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
              <div className="text-xs text-muted text-right">
                {m.kcal} kcal
                <br />
                {m.protein_g}p · {m.carbs_g}c · {m.fat_g}f
              </div>
            </div>
          ))}
          {meals.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">No meals logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
