import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { db } from "./lib/db";
import type { Session } from "./lib/types";

import OwnerShell from "./owner/OwnerShell";
import Dashboard from "./owner/Dashboard";
import Members from "./owner/Members";
import WinBack from "./owner/WinBack";
import Payments from "./owner/Payments";
import Branding from "./owner/Branding";

import MemberShell from "./member/MemberShell";
import Home from "./member/Home";
import CheckIn from "./member/CheckIn";
import Meal from "./member/Meal";

const DEMO_MEMBERS = ["Arjun", "Sana", "Rohit", "Divya", "Karan", "Priya", "Mohit", "Tara"];

export default function App() {
  const [session, setSession] = useState<Session | null>(db.getSession());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    db.bootstrap().then((s) => {
      setSession(s);
      setReady(true);
    });
    const off = db.onAuthChange(setSession);
    return off;
  }, []);

  if (!ready)
    return <div className="min-h-full grid place-items-center text-sm text-muted">Loading…</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/owner"
          element={session?.role === "owner" ? <OwnerShell onSignOut={() => setSession(null)} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="winback" element={<WinBack />} />
          <Route path="payments" element={<Payments />} />
          <Route path="branding" element={<Branding />} />
        </Route>

        <Route
          path="/m"
          element={session?.role === "member" ? <MemberShell onSignOut={() => setSession(null)} /> : <Navigate to="/login" />}
        >
          <Route index element={<Home session={session!} />} />
          <Route path="checkin" element={<CheckIn session={session!} />} />
          <Route path="meal" element={<Meal session={session!} />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={session ? (session.role === "owner" ? "/owner" : "/m") : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function Login() {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function go(who: string, dest: string) {
    setBusy(who);
    setErr(null);
    try {
      await db.demoLogin(who);
      location.assign(dest);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(null);
    }
  }

  return (
    <div className="min-h-full grid place-items-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div>
          <div className="h-14 w-14 rounded-2xl bg-accent grid place-items-center text-white text-2xl font-black">
            IH
          </div>
          <h1 className="text-2xl font-extrabold mt-4">Iron House Gym</h1>
          <p className="text-sm text-muted mt-1">
            Test build — pick who to sign in as, no password needed.
            {db.backend === "mock" && " Data is stored in this browser only."}
          </p>
        </div>

        {err && <div className="card p-3 text-sm text-accent font-semibold">{err}</div>}

        <button className="btn" disabled={!!busy} onClick={() => go("owner", "/owner")}>
          {busy === "owner" ? "…" : "Sign in as the gym owner"}
        </button>

        <div>
          <div className="eyebrow mb-2">…or as a member</div>
          <div className="card divide-y divide-line">
            {DEMO_MEMBERS.map((first) => (
              <button
                key={first}
                disabled={!!busy}
                className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-paper disabled:opacity-50"
                onClick={() => go(first, "/m")}
              >
                {busy === first ? "…" : first}
              </button>
            ))}
          </div>
        </div>

        {db.backend === "mock" && (
          <button
            className="text-xs text-muted underline"
            onClick={() => {
              db.resetDemo();
              location.reload();
            }}
          >
            Reset demo data
          </button>
        )}
      </div>
    </div>
  );
}
