import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { db } from "../lib/db";
import type { Gym } from "../lib/types";

const tabs = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/members", label: "Members" },
  { to: "/owner/winback", label: "Win-back" },
  { to: "/owner/branding", label: "Branding" },
];

export default function OwnerShell({ onSignOut }: { onSignOut: () => void }) {
  const nav = useNavigate();
  const [gym, setGym] = useState<Gym | null>(null);
  useEffect(() => {
    db.getGym().then(setGym);
  }, []);

  return (
    <div className="min-h-full">
      <header className="bg-card border-b border-line">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-black"
            style={{ background: gym?.accent ?? "#F5533D" }}
          >
            {(gym?.name ?? "IH").slice(0, 2).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-[11px] text-muted font-semibold">owner</div>
            <div className="text-sm font-extrabold">{gym?.name ?? "…"}</div>
          </div>
          <div className="flex-1" />
          <button
            className="text-xs text-muted hover:text-ink"
            onClick={() => {
              db.signOut();
              onSignOut();
              nav("/login");
            }}
          >
            Sign out
          </button>
        </div>
        <nav className="mx-auto max-w-4xl px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `px-3 py-2.5 text-sm font-bold border-b-2 -mb-px whitespace-nowrap ${
                  isActive ? "border-accent text-accent" : "border-transparent text-muted"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
