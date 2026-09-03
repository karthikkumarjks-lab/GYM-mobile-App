import { useEffect, useRef, useState } from "react";
import { db } from "../lib/db";
import type { Meal as MealRow, Session } from "../lib/types";
import { Loading } from "../components/ui";

// Stand-in for the vision model. The real build sends the photo to an API;
// here we pick a plausible Indian-plate estimate so the flow is demonstrable.
const SAMPLES = [
  { label: "Dal, rice, salad, 2 rotis", kcal: 620, protein_g: 24, carbs_g: 82, fat_g: 16 },
  { label: "Paneer bhurji, 2 rotis", kcal: 540, protein_g: 28, carbs_g: 40, fat_g: 28 },
  { label: "Chicken curry, rice", kcal: 700, protein_g: 38, carbs_g: 74, fat_g: 22 },
  { label: "Curd rice, papad", kcal: 430, protein_g: 12, carbs_g: 66, fat_g: 12 },
  { label: "Egg bhurji, oats", kcal: 410, protein_g: 26, carbs_g: 34, fat_g: 18 },
];

export default function Meal({ session }: { session: Session }) {
  const mid = session.member_id!;
  const [meals, setMeals] = useState<MealRow[] | null>(null);
  const [scan, setScan] = useState<(typeof SAMPLES)[number] | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => db.listMeals(mid).then(setMeals);
  useEffect(() => {
    load();
  }, [mid]);
  if (!meals) return <Loading />;

  function pickPhoto() {
    setScanning(true);
    setScan(null);
    setTimeout(() => {
      setScan(SAMPLES[Math.floor(Math.random() * SAMPLES.length)]);
      setScanning(false);
    }, 900);
  }

  async function logIt() {
    if (!scan) return;
    await db.logMeal(mid, scan);
    setScan(null);
    await load();
  }

  const today = meals.filter((m) => new Date(m.at).toDateString() === new Date().toDateString());
  const sum = (k: keyof MealRow) => today.reduce((n, m) => n + (Number(m[k]) || 0), 0);

  return (
    <div className="flex flex-col gap-4 pt-1">
      <h1 className="text-xl font-extrabold">Meal scan</h1>

      <button
        className="rounded-2xl h-44 grid place-items-center text-white text-sm font-bold bg-dark"
        onClick={pickPhoto}
      >
        {scanning ? "Reading the plate…" : "📷  Take / choose a photo"}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" />
      <p className="text-[11px] text-muted -mt-2">
        Estimate only. In this test build the photo isn't uploaded — a sample result is shown.
      </p>

      {scan && (
        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm">{scan.label}</div>
            <span className="pill bg-accent-soft text-accent">~{scan.kcal} kcal</span>
          </div>
          <Bar label="Protein" v={scan.protein_g} max={60} color="var(--accent)" />
          <Bar label="Carbs" v={scan.carbs_g} max={120} color="#3B6FE0" />
          <Bar label="Fat" v={scan.fat_g} max={50} color="#B7791F" />
          <button className="btn" onClick={logIt}>
            Add to today's log
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <Tile v={sum("kcal")} k="kcal" />
        <Tile v={`${sum("protein_g")}g`} k="protein" />
        <Tile v={`${sum("carbs_g")}g`} k="carbs" />
        <Tile v={`${sum("fat_g")}g`} k="fat" />
      </div>

      <div>
        <div className="eyebrow mb-2">Logged today</div>
        <div className="card divide-y divide-line">
          {today.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{m.label}</span>
              <span className="text-xs text-muted">{m.kcal} kcal</span>
            </div>
          ))}
          {today.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">Nothing logged yet today.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Bar({ label, v, max, color }: { label: string; v: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-bold w-14">{label}</span>
      <span className="flex-1 h-2 rounded bg-paper overflow-hidden">
        <i className="block h-full rounded" style={{ width: `${Math.min(100, (v / max) * 100)}%`, background: color }} />
      </span>
      <span className="text-xs font-extrabold w-10 text-right">{v} g</span>
    </div>
  );
}
function Tile({ v, k }: { v: React.ReactNode; k: string }) {
  return (
    <div className="card p-2.5 text-center">
      <div className="text-sm font-extrabold">{v}</div>
      <div className="text-[10px] text-muted font-semibold">{k}</div>
    </div>
  );
}
