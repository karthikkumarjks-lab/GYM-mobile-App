export type Role = "owner" | "co-owner" | "admin" | "staff" | "member";

export const STAFF_ROLES: Role[] = ["owner", "co-owner", "admin", "staff"];
export const isStaff = (r?: string | null) => !!r && (STAFF_ROLES as string[]).includes(r);

export const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  "co-owner": "Co-owner",
  admin: "Admin",
  staff: "Staff",
  member: "Gym member",
};
// roles the owner can assign when adding someone
export const ADDABLE_ROLES: { value: Role; label: string }[] = [
  { value: "member", label: "Gym member" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "co-owner", label: "Co-owner" },
];

export interface Gym {
  id: string;
  code: string;
  name: string;
  city?: string;
  logo_url?: string | null;
  accent: string;
  webhook_secret?: string;
  fee_monthly_paise: number;
  fee_quarterly_paise: number;
  fee_half_paise: number;
  fee_annual_paise: number;
}

export const PLAN_FEE_FIELD: Record<string, keyof Gym> = {
  Monthly: "fee_monthly_paise",
  Quarterly: "fee_quarterly_paise",
  "Half-yearly": "fee_half_paise",
  Annual: "fee_annual_paise",
};
export const PLAN_LABELS = ["Monthly", "Quarterly", "Half-yearly", "Annual"] as const;

export interface Product {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  category: string;
  price_paise: number;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price_paise: number;
  qty: number;
}

export interface Order {
  id: string;
  gym_id: string;
  member_id: string;
  items: OrderItem[];
  total_paise: number;
  status: "pending" | "paid" | "collected" | "cancelled";
  payment_id: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string | null;
  amount_paise: number;
  purpose: string | null;
  provider: string;
  provider_ref: string | null;
  status: "created" | "paid" | "failed" | "simulated";
  link_url: string | null;
  created_at: string;
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

export interface TeamMember {
  id: string; // profile id
  full_name: string;
  role: Role;
}

/** A member row enriched with attendance signals, computed for the owner views. */
export interface MemberWithSignal extends Member {
  last_visit: string | null;
  days_since: number | null;
  visits_30d: number;
  risk: "ok" | "slipping" | "at_risk";
}
