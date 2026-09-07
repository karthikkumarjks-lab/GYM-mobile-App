import { useEffect, useRef, useState } from "react";
import { db } from "../lib/db";
import type { DietPlan, Meal as MealRow, Session } from "../lib/types";
import { Loading } from "../components/ui";

type Draft = { label: string; kcal: string; protein_g: string; carbs_g: string; fat_g: string };
const emptyDraft: Draft = { label: "", kcal: "", protein_g: "", carbs_g: "", fat_g: "" };
type Source = "ai" | "list" | "manual";

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
function dataUrlToFile(dataUrl: string): File {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], `meal-${Date.now()}.jpg`, { type: mime });
}
const num = (s: string) => Math.max(0, Math.round(Number(s) || 0));

export default function Meal({ session }: { session: Session }) {
  const mid = session.member_id!;
  const [meals, setMeals] = useState<MealRow[] | null>(null);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [photo, setPhoto] = useState<string | null>(null); // data URL, shown + uploaded on log
  const [source, setSource] = useState<Source | null>(null);
  const [origin, setOrigin] = useState<"ai" | "list" | "estimate" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const lastLookup = useRef("");
  const timer = useRef<number | undefined>(undefined);

  const load = () => db.listMeals(mid).then(setMeals);
  useEffect(() => {
    load();
    db.getDietPlan(mid).then(setPlan);
  }, [mid]);

  // auto-lookup ~600ms after the member stops typing, while macros are still blank
  useEffect(() => {
    if (!draft || source === "ai" || draft.kcal) return;
    const name = draft.label.trim();
    if (name.length < 3 || name === lastLookup.current) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void lookup(name), 600);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.label, draft?.kcal, source]);

  if (!meals) return <Loading />;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      const dataUrl = await shrink(file);
      setPhoto(dataUrl);
      const est = await db.scanMeal(dataUrl);
      if (est.configured && est.label && !est.error) {
        setDraft({
          label: est.label,
          kcal: String(est.kcal ?? ""),
          protein_g: String(est.protein_g ?? ""),
          carbs_g: String(est.carbs_g ?? ""),
          fat_g: String(est.fat_g ?? ""),
        });
        setSource("ai");
        setOrigin("ai");
        lastLookup.current = est.label;
        setNote("Read from your photo — fix the dish name if it's wrong, or adjust the portion, then log it.");
      } else {
        setDraft(emptyDraft);
        setSource("manual");
        setOrigin(null);
        setNote(
          est.error
            ? "Couldn't read that photo. Type the dish name below and we'll look up the nutrition."
            : "Photo attached. Type the dish name and the nutrition fills in automatically.",
        );
      }
    } catch {
      setDraft(emptyDraft);
      setSource("manual");
      setNote("Couldn't open that image. Type the dish name below.");
    }
    setBusy(false);
  }

  function startTyping() {
    setPhoto(null);
    setDraft(emptyDraft);
    setSource("manual");
    setOrigin(null);
    setNote("Type the dish name — the nutrition fills in automatically.");
  }

  async function lookup(rawName: string): Promise<Draft | null> {
    const name = rawName.trim();
    if (name.length < 3) return null;
    lastLookup.current = name;
    setLooking(true);
    let filled: Draft | null = null;
    try {
      const est = await db.lookupDish(name);
      if (est.configured && (est.kcal ?? 0) > 0) {
        filled = {
          label: name,
          kcal: String(est.kcal ?? ""),
          protein_g: String(est.protein_g ?? ""),
          carbs_g: String(est.carbs_g ?? ""),
          fat_g: String(est.fat_g ?? ""),
        };
        setDraft(filled);
        setSource("list");
        setOrigin(est.source === "ai" ? "ai" : est.source === "estimate" ? "estimate" : "list");
        setNote(`Matched “${est.label}” · one serving — adjust the numbers for your portion.`);
      } else {
        setSource("manual");
        setOrigin(null);
        setNote("Not in our food list — type the calories and macros yourself.");
      }
    } catch {
      setSource("manual");
      setOrigin(null);
      setNote("Couldn't look that up — enter the values yourself.");
    }
    setLooking(false);
    return filled;
  }

  function reset() {
    setDraft(null);
    setPhoto(null);
    setSource(null);
    setOrigin(null);
    setNote(null);
  }

  async function logIt() {
    if (!draft || !draft.label.trim()) return;
    let final = draft;
    if (num(final.kcal) === 0) {
      const found = await lookup(final.label);
      if (found) final = found;
      else if (!confirm("No nutrition found for this — log it with 0 calories anyway?")) return;
    }
    setBusy(true);
    let photo_url: string | undefined;
    if (photo) {
      try {
        photo_url = await db.uploadAsset(dataUrlToFile(photo));
      } catch {
        /* log without the photo rather than fail */
      }
    }
    await db.logMeal(mid, {
      label: final.label.trim(),
      kcal: num(final.kcal),
      protein_g: num(final.protein_g),
      carbs_g: num(final.carbs_g),
      fat_g: num(final.fat_g),
      photo_url,
    });
    setBusy(false);
    reset();
    await load();
  }

  const today = meals.filter((m) => new Date(m.at).toDateString() === new Date().toDateString());
  const sum = (k: keyof MealRow) => today.reduce((n, m) => n + (Number(m[k]) || 0), 0);
  const f = (k: keyof Draft, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const planTargets = plan && (plan.daily_kcal || plan.protein_g || plan.carbs_g || plan.fat_g);

  return (
    <div className="flex flex-col gap-4 pt-1">
      <h1 className="text-xl font-extrabold">Meal log</h1>

      {plan && (
        <div className="card p-4 flex flex-col gap-2">
          <button className="flex items-center gap-2 text-left" onClick={() => setPlanOpen((v) => !v)}>
            <span className="eyebrow flex-1">Your diet plan{plan.assigned_by ? ` · from ${plan.assigned_by}` : ""}</span>
            <span className="text-muted text-sm">{planOpen ? "▲" : "▼"}</span>
          </button>
          {planTargets && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["kcal", plan.daily_kcal, sum("kcal")],
                ["protein", plan.protein_g, sum("protein_g")],
                ["carbs", plan.carbs_g, sum("carbs_g")],
                ["fat", plan.fat_g, sum("fat_g")],
              ].map(([k, target, got]) => (
                <div key={k as string}>
                  <div className="text-sm font-extrabold">
                    {got}
                    <span className="text-muted font-semibold text-xs"> / {target ?? "—"}</span>
                  </div>
                  <div className="text-[10px] text-muted font-semibold">{k as string}</div>
                </div>
              ))}
            </div>
          )}
          {planOpen && (
            <div className="flex flex-col gap-2 pt-1">
              {plan.meals.map((m) => (
                <div key={m.slot} className="text-sm">
                  <span className="font-bold">{m.slot}: </span>
                  <span className="text-muted">{m.items}</span>
                </div>
              ))}
              {plan.notes && (
                <p className="text-xs text-muted bg-paper rounded-lg p-2 mt-1">{plan.notes}</p>
              )}
            </div>
          )}
        </div>
      )}

      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      <input ref={galRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div className="grid grid-cols-3 gap-2">
        <button
          className="rounded-2xl h-28 flex flex-col items-center justify-center gap-1 text-white text-xs font-bold bg-dark disabled:opacity-70"
          disabled={busy}
          onClick={() => camRef.current?.click()}
        >
          <span className="text-lg">📷</span>
          {busy ? "Reading…" : "Take photo"}
        </button>
        <button
          className="rounded-2xl h-28 flex flex-col items-center justify-center gap-1 text-ink text-xs font-bold bg-card border border-line disabled:opacity-70"
          disabled={busy}
          onClick={() => galRef.current?.click()}
        >
          <span className="text-lg">🖼️</span>
          Upload image
        </button>
        <button
          className="rounded-2xl h-28 flex flex-col items-center justify-center gap-1 text-ink text-xs font-bold bg-card border border-line"
          onClick={startTyping}
        >
          <span className="text-lg">✍️</span>
          Type the dish
        </button>
      </div>
      {note && <p className="text-xs text-muted -mt-1">{note}</p>}

      {draft && (
        <div className="card p-4 flex flex-col gap-3">
          {photo && (
            <img src={photo} alt="meal" className="w-full h-40 object-cover rounded-xl" />
          )}
          {source === "ai" && (
            <span className="pill bg-accent-soft text-accent self-start">
              Detected from photo · fix the name below if it's wrong
            </span>
          )}
          {source === "list" && (
            <span className="pill bg-accent-soft text-accent self-start">From our food list · edit if needed</span>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <input
                className="field flex-1"
                placeholder="e.g. chicken curry + rice, dosa + sambar"
                value={draft.label}
                onChange={(e) => f("label", e.target.value)}
                onBlur={() => {
                  const n = draft.label.trim();
                  if (n.length >= 3 && n !== lastLookup.current) void lookup(n);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void lookup(draft.label);
                  }
                }}
                autoFocus={source === "manual"}
              />
              <button
                type="button"
                className="btn-ghost whitespace-nowrap"
                disabled={looking}
                onClick={() => lookup(draft.label)}
              >
                {looking ? "…" : "Get nutrition"}
              </button>
            </div>
            <p className="text-[10px] text-muted">
              Add a side dish with “+” — e.g. “2 roti + dal” — and we’ll add up the nutrition.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Field label="kcal" value={draft.kcal} onChange={(v) => f("kcal", v)} />
            <Field label="protein" value={draft.protein_g} onChange={(v) => f("protein_g", v)} suffix="g" />
            <Field label="carbs" value={draft.carbs_g} onChange={(v) => f("carbs_g", v)} suffix="g" />
            <Field label="fat" value={draft.fat_g} onChange={(v) => f("fat_g", v)} suffix="g" />
          </div>

          {origin && <SourceLine origin={origin} />}

          <div className="flex gap-2">
            <button className="btn flex-1" disabled={busy || !draft.label.trim()} onClick={logIt}>
              {busy ? "Saving…" : "Add to today's log"}
            </button>
            <button className="btn-ghost" onClick={reset}>
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
            <div key={m.id} className="px-4 py-3 flex items-center gap-3">
              {m.photo_url ? (
                <img src={m.photo_url} alt="" className="h-10 w-10 rounded-lg object-cover flex-none" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-paper grid place-items-center text-xs flex-none">🍽️</div>
              )}
              <span className="text-sm font-semibold flex-1">{m.label}</span>
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
function SourceLine({ origin }: { origin: "ai" | "list" | "estimate" }) {
  const text =
    origin === "ai"
      ? "Source: read from your photo by AI (Claude vision). Always sense-check the portion."
      : origin === "list"
        ? "Source: Momentum food list — standard per-serving values compiled from public nutrition data (IFCT 2017 · ICMR–NIN and USDA FoodData Central). Adjust for your portion."
        : "Rough estimate from the dish type — not a database match. Please correct the numbers before logging.";
  return (
    <p
      className={`text-[10px] leading-snug rounded-lg px-2 py-1.5 ${
        origin === "estimate" ? "bg-accent-soft text-accent" : "bg-paper text-muted"
      }`}
    >
      {text}
    </p>
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
