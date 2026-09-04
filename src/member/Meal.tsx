import { useEffect, useRef, useState } from "react";
import { db } from "../lib/db";
import type { Meal as MealRow, Session } from "../lib/types";
import { Loading } from "../components/ui";

type Draft = { label: string; kcal: string; protein_g: string; carbs_g: string; fat_g: string };
const emptyDraft: Draft = { label: "", kcal: "", protein_g: "", carbs_g: "", fat_g: "" };

// Downscale a picked image to <=1024px JPEG so the upload stays small.
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1024;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
const num = (s: string) => Math.max(0, Math.round(Number(s) || 0));

export default function Meal({ session }: { session: Session }) {
  const mid = session.member_id!;
  const [meals, setMeals] = useState<MealRow[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [source, setSource] = useState<"ai" | "manual" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => db.listMeals(mid).then(setMeals);
  useEffect(() => {
    load();
  }, [mid]);
  if (!meals) return <Loading />;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      const est = await db.scanMeal(await shrink(file));
      if (est.configured && est.label && !est.error) {
        setDraft({
          label: est.label,
          kcal: String(est.kcal ?? ""),
          protein_g: String(est.protein_g ?? ""),
          carbs_g: String(est.carbs_g ?? ""),
          fat_g: String(est.fat_g ?? ""),
        });
        setSource("ai");
        setNote("AI estimate — adjust the portion if it looks off, then log it.");
      } else {
        setDraft(emptyDraft);
        setSource("manual");
        setNote(
          est.error
            ? "Couldn't read that photo. Type what you ate instead."
            : "Photo reading isn't switched on for your gym yet — type what you ate below.",
        );
      }
    } catch {
      setDraft(emptyDraft);
      setSource("manual");
      setNote("Couldn't open that image. Type what you ate below.");
    }
    setBusy(false);
  }

  function startManual() {
    setDraft(emptyDraft);
    setSource("manual");
    setNote(null);
  }

  async function logIt() {
    if (!draft || !draft.label.trim()) return;
    await db.logMeal(mid, {
      label: draft.label.trim(),
      kcal: num(draft.kcal),
      protein_g: num(draft.protein_g),
      carbs_g: num(draft.carbs_g),
      fat_g: num(draft.fat_g),
    });
    setDraft(null);
    setSource(null);
    setNote(null);
    await load();
  }

  const today = meals.filter((m) => new Date(m.at).toDateString() === new Date().toDateString());
  const sum = (k: keyof MealRow) => today.reduce((n, m) => n + (Number(m[k]) || 0), 0);
  const f = (k: keyof Draft, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <div className="flex flex-col gap-4 pt-1">
      <h1 className="text-xl font-extrabold">Meal log</h1>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-2xl h-32 grid place-items-center text-white text-sm font-bold bg-dark disabled:opacity-70"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Reading the plate…" : "📷  Photo"}
        </button>
        <button
          className="flex-1 rounded-2xl h-32 grid place-items-center text-ink text-sm font-bold bg-card border border-line"
          onClick={startManual}
        >
          ✍️  Type it
        </button>
      </div>
      {note && <p className="text-xs text-muted -mt-1">{note}</p>}

      {draft && (
        <div className="card p-4 flex flex-col gap-3">
          {source === "ai" && (
            <span className="pill bg-accent-soft text-accent self-start">AI estimate · edit before logging</span>
          )}
          <input
            className="field"
            placeholder="What did you eat?"
            value={draft.label}
            onChange={(e) => f("label", e.target.value)}
            autoFocus={source === "manual"}
          />
          <div className="grid grid-cols-4 gap-2">
            <Field label="kcal" value={draft.kcal} onChange={(v) => f("kcal", v)} />
            <Field label="protein" value={draft.protein_g} onChange={(v) => f("protein_g", v)} suffix="g" />
            <Field label="carbs" value={draft.carbs_g} onChange={(v) => f("carbs_g", v)} suffix="g" />
            <Field label="fat" value={draft.fat_g} onChange={(v) => f("fat_g", v)} suffix="g" />
          </div>
          <div className="flex gap-2">
            <button className="btn flex-1" disabled={!draft.label.trim()} onClick={logIt}>
              Add to today's log
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setDraft(null);
                setSource(null);
                setNote(null);
              }}
            >
              Cancel
            </button>
          </div>
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

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] text-muted font-semibold text-center">{label}</span>
      <div className="field !px-2 !py-1.5 flex items-center justify-center gap-0.5">
        <input
          className="w-full bg-transparent outline-none text-sm font-bold text-center"
          inputMode="numeric"
          placeholder="—"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        />
        {suffix && value && <span className="text-[10px] text-muted">{suffix}</span>}
      </div>
    </label>
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
