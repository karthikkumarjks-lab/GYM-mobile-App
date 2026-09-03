export type Role = "owner" | "staff" | "member";

export interface Gym {
  id: string;
  code: string;
  name: string;
  city?: string;
  logo_url?: string | null;
  accent: string;
}

export interface Member {
  id: string;
  gym_id: string;
  full_name: string;
  phone?: string | null;
  plan?: string | null;
  joined_on: string;
  status: "active" | "frozen" | "expired";
}

export interface Checkin {
  id: string;
  gym_id: string;
  member_id: string;
  at: string;
  out_at?: string | null;
  method: "qr" | "pin" | "staff" | "face" | "fingerprint";
}

export interface Message {
  id: string;
  gym_id: string;
  member_id: string;
  channel: string;
  template?: string | null;
  body: string;
  status: "queued" | "sent" | "simulated";
  created_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}
export interface Plan {
  id: string;
  gym_id: string;
  member_id: string;
  title: string;
  day_label?: string | null;
  exercises: Exercise[];
  assigned_by?: string | null;
}

export interface Meal {
  id: string;
  gym_id: string;
  member_id: string;
  at: string;
  label?: string | null;
  kcal?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}

export interface Session {
  role: Role;
  gym_id: string;
  member_id?: string | null;
  full_name: string;
}

/** A member row enriched with attendance signals, computed for the owner views. */
export interface MemberWithSignal extends Member {
  last_visit: string | null;
  days_since: number | null;
  visits_30d: number;
  risk: "ok" | "slipping" | "at_risk";
}
