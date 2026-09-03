import type { ReactNode } from "react";

export function Pill({
  children,
  tone = "mut",
}: {
  children: ReactNode;
  tone?: "mut" | "acc" | "pos" | "warn";
}) {
  const map = {
    mut: "bg-paper text-muted",
    acc: "bg-accent-soft text-accent",
    pos: "bg-pos-soft text-pos",
    warn: "bg-warn-soft text-warn",
  };
  return <span className={`pill ${map[tone]}`}>{children}</span>;
}

export function Avatar({ name, tone = "acc" }: { name: string; tone?: "acc" | "pos" | "warn" | "blue" }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const map = {
    acc: "bg-accent-soft text-accent",
    pos: "bg-pos-soft text-pos",
    warn: "bg-warn-soft text-warn",
    blue: "bg-[#E8EEFB] text-[#3B6FE0]",
  };
  return (
    <div className={`h-10 w-10 flex-none rounded-full grid place-items-center text-sm font-extrabold ${map[tone]}`}>
      {initials}
    </div>
  );
}

export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="card p-3.5">
      <div className={`text-2xl font-extrabold tracking-tight ${tone ?? ""}`}>{value}</div>
      <div className="text-[11px] font-semibold text-muted mt-0.5">{label}</div>
    </div>
  );
}

export function Loading() {
  return <div className="p-8 text-center text-sm text-muted">Loading…</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card p-6 text-center text-sm text-muted">{children}</div>;
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const d = Math.floor((Date.now() - +new Date(iso)) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
