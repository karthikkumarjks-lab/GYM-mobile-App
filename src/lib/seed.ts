import type { Gym, Member, Checkin, Message, Plan, Meal } from "./types";

const uid = () =>
  (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now());

const GYM_ID = "demo-gym";

export const seedGym: Gym = {
  id: GYM_ID,
  code: "IRONHOUSE",
  name: "Iron House Gym",
  city: "Bengaluru",
  logo_url: null,
  accent: "#F5533D",
};

const NAMES = [
  "Arjun Menon", "Sana Kapoor", "Rohit Verma", "Divya Nair", "Karan Pillai",
  "Priya Das", "Mohit Iyer", "Tara Shetty", "Nikhil Bose", "Meera Rao",
  "Sameer Thakur", "Aisha Khan", "Vikram Patel", "Neha Gupta", "Rahul Mehta",
  "Sara Lobo", "Kavya Varma", "Dev Anand", "Ishita Sen", "Farhan Ali",
  "Ananya Roy", "Yash Joshi", "Pooja Hegde", "Manav Desai",
];
const PLANS = ["Monthly", "Quarterly", "Half-yearly", "Annual"];

function daysAgo(n: number, hour = 7): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 55), 0, 0);
  return d.toISOString();
}

export function buildSeed() {
  const members: Member[] = NAMES.map((full_name, i) => ({
    id: `m${i + 1}`,
    gym_id: GYM_ID,
    full_name,
    phone: `+9198${String(10000000 + i * 111111).slice(0, 8)}`,
    plan: PLANS[i % PLANS.length],
    joined_on: daysAgo(30 + i * 4).slice(0, 10),
    status: "active",
  }));

  const checkins: Checkin[] = [];
  members.forEach((m, i) => {
    // 6 members go quiet: last visit 7–17 days ago. Rest are current.
    const fading = i < 6;
    const perWeek = fading ? 3 : 2 + (i % 4);
    const stopBefore = fading ? 7 + i * 2 : 0;
    for (let day = 35; day >= stopBefore; day--) {
      if (Math.random() < perWeek / 7) {
        const inAt = daysAgo(day, 6 + Math.floor(Math.random() * 3));
        const out = new Date(inAt);
        out.setMinutes(out.getMinutes() + 40 + Math.floor(Math.random() * 40));
        checkins.push({
          id: uid(),
          gym_id: GYM_ID,
          member_id: m.id,
          at: inAt,
          out_at: out.toISOString(),
          method: ["qr", "pin", "staff", "face"][Math.floor(Math.random() * 4)] as Checkin["method"],
        });
      }
    }
  });

  const plans: Plan[] = members.slice(0, 8).map((m, i) => ({
    id: uid(),
    gym_id: GYM_ID,
    member_id: m.id,
    title: ["Push day", "Pull day", "Leg day", "Full body"][i % 4],
    day_label: "Week 3",
    assigned_by: "Coach Neha",
    exercises: [
      { name: "Barbell bench press", sets: 4, reps: "8" },
      { name: "Incline dumbbell press", sets: 3, reps: "10" },
      { name: "Shoulder press", sets: 3, reps: "10" },
      { name: "Lateral raises", sets: 3, reps: "15" },
    ],
  }));

  const messages: Message[] = [];
  const meals: Meal[] = [];
  return { gym: seedGym, members, checkins, plans, messages, meals };
}
