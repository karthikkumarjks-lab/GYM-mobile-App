import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { db } from "../lib/db";
import type { Gym } from "../lib/types";

const tabs = [
  { to: "/m", label: "Home", end: true },
  { to: "/m/checkin", label: "Check in" },
  { to: "/m/meal", label: "Meal" },
  { to: "/m/shop", label: "Shop" },
];

export default function MemberShell({ onSignOut }: { onSignOut: () => void }) {
  const nav = useNavigate();
  const [gym, setGym] = useState<Gym | null>(null);
  useEffect(() => {
    db.getGym().then(setGym);
  }, []);

  const accent = gym?.accent ?? "#F5533D";

  return (
    <div
      className="min-h-full mx-auto max-w-md flex flex-col bg-paper"
      style={{ ["--accent" as string]: accent }}
    >
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <div
          className="h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-black overflow-hidden"
          style={{ background: accent }}
        >
          {gym?.logo_url ? (
            <img src={gym.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (gym?.name ?? "IH").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="leading-tight">
          <div className="text-[11px] text-muted font-semibold">member</div>
          <div className="text-sm font-extrabold">{gym?.name ?? "…"}</div>
        </div>
        <div className="flex-1" />
        <button
          className="text-xs text-muted"
          onClick={() => {
            db.signOut();
            onSignOut();
            nav("/login");
          }}
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 px-5 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-line flex">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex-1 text-center py-3 text-xs font-bold ${isActive ? "text-accent" : "text-muted"}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
