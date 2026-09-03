import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { db } from "./lib/db";
import type { Member, Session } from "./lib/types";

import OwnerShell from "./owner/OwnerShell";
import Dashboard from "./owner/Dashboard";
import Members from "./owner/Members";
import WinBack from "./owner/WinBack";
import Branding from "./owner/Branding";

import MemberShell from "./member/MemberShell";
import Home from "./member/Home";
import CheckIn from "./member/CheckIn";
import Meal from "./member/Meal";

export default function App() {
  const [session, setSession] = useState<Session | null>(db.getSession());
  const refresh = () => setSession(db.getSession());

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onDone={refresh} />} />

        <Route
          path="/owner"
          element={session?.role === "owner" ? <OwnerShell onSignOut={refresh} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="winback" element={<WinBack />} />
          <Route path="branding" element={<Branding />} />
        </Route>

        <Route
          path="/m"
          element={session?.role === "member" ? <MemberShell onSignOut={refresh} /> : <Navigate to="/login" />}
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

function Login({ onDone }: { onDone: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    db.listMembers().then(setMembers);
  }, []);

  async function asOwner() {
    await db.signInOwner("Gym owner");
    onDone();
    location.assign("/owner");
  }
  async function asMember(id: string) {
    await db.signInMember(id);
    onDone();
    location.assign("/m");
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
            Test build — pick who to sign in as, no password.
            {db.backend === "mock" && " Data is stored in this browser only."}
          </p>
        </div>

        <button className="btn" onClick={asOwner}>
          Sign in as the gym owner
        </button>

        <div>
          <div className="eyebrow mb-2">…or as a member</div>
          <div className="card divide-y divide-line max-h-64 overflow-auto">
            {members.slice(0, 8).map((m) => (
              <button
                key={m.id}
                className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-paper"
                onClick={() => asMember(m.id)}
              >
                {m.full_name}
                <span className="block text-xs font-normal text-muted">{m.plan}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="text-xs text-muted underline"
          onClick={() => {
            db.resetDemo();
            db.listMembers().then(setMembers);
          }}
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}
