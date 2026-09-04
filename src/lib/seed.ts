import type { Gym, Member, Checkin, Message, Plan, Meal, Product } from "./types";

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
  webhook_secret: "demo-webhook-secret",
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
  const products: Product[] = [
    ["Whey Protein 1 kg", "24g protein per scoop, chocolate", "Supplements", 249000, 18],
    ["Creatine Monohydrate 250 g", "Micronised, unflavoured", "Supplements", 89900, 25],
    ["Pre-workout 300 g", "Fruit punch", "Supplements", 159900, 6],
    ["Iron House training tee", "Dri-fit, black", "Apparel", 79900, 30],
    ["Steel shaker bottle", "700 ml", "Accessories", 49900, 40],
    ["Lifting straps", "Cotton, pair", "Accessories", 39900, 12],
  ].map(([name, description, category, price_paise, stock]) => ({
    id: uid(), gym_id: GYM_ID, name: name as string, description: description as string,
    category: category as string, price_paise: price_paise as number, stock: stock as number,
    image_url: null, active: true, created_at: new Date().toISOString(),
  }));

  return { gym: seedGym, members, checkins, plans, messages, meals, products };
}
