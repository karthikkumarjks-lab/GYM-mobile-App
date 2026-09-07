// Built-in nutrition table for common Indian dishes — per one typical restaurant/home
// serving. Used so "type a dish name" always returns an estimate with no API key.
// Values are rounded approximations; the member can adjust before logging.

export interface FoodMacros {
  label: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

type Row = [name: string, kcal: number, p: number, c: number, f: number, ...aliases: string[]];

const TABLE: Row[] = [
  // --- South Indian ---
  ["Plain dosa", 170, 4, 30, 4, "dosa", "sada dosa"],
  ["Masala dosa", 385, 8, 55, 14, "masala dose"],
  ["Rava dosa", 300, 6, 40, 12],
  ["Set dosa (2)", 260, 7, 42, 7],
  ["Ghee roast dosa", 480, 8, 55, 24],
  ["Idli (2)", 140, 4, 28, 1, "idly"],
  ["Idli vada combo", 330, 8, 45, 12, "idli vada"],
  ["Medu vada (2)", 280, 7, 30, 14, "vada", "vadai", "uzhunnu vada"],
  ["Uttapam", 330, 8, 48, 11, "uthappam", "onion uttapam"],
  ["Pongal (ven pongal)", 330, 9, 45, 12, "ven pongal"],
  ["Upma", 250, 6, 38, 8, "uppuma"],
  ["Rava kesari", 300, 4, 45, 12, "kesari bath"],
  ["Pesarattu", 230, 11, 30, 7],
  ["Curd rice", 330, 8, 48, 11, "thayir sadam", "bagala bath"],
  ["Lemon rice", 320, 6, 50, 10, "chitranna"],
  ["Tomato rice", 340, 6, 52, 11],
  ["Bisi bele bath", 380, 11, 55, 12, "bisibelebath"],
  ["Sambar rice", 350, 10, 58, 8, "sambar sadam"],
  ["Rasam rice", 260, 7, 45, 5],
  ["Coconut chutney (serving)", 90, 1, 4, 8, "chutney"],
  ["Sambar (bowl)", 130, 6, 18, 4, "sambhar"],
  ["Filter coffee", 90, 3, 11, 4, "filter kaapi"],
  ["Chicken Chettinad", 350, 30, 8, 22],
  ["Fish curry (South Indian)", 250, 24, 6, 14, "meen kuzhambu"],
  ["Kerala parotta (1)", 260, 5, 38, 10, "parotta", "malabar parotta"],
  ["Appam (2)", 220, 4, 42, 4, "aappam"],
  ["Puttu with kadala", 380, 12, 60, 9, "puttu kadala"],
  ["Kal dosa (2)", 230, 6, 40, 5],

  // --- North Indian breads ---
  ["Roti / chapati (1)", 110, 3, 20, 2, "chapati", "phulka", "roti", "tawa roti"],
  ["Butter roti (1)", 150, 3, 20, 6],
  ["Tandoori roti (1)", 130, 4, 24, 2],
  ["Naan (1)", 260, 7, 45, 6, "plain naan"],
  ["Butter naan (1)", 320, 7, 45, 12],
  ["Garlic naan (1)", 300, 8, 44, 10],
  ["Lachha paratha (1)", 290, 5, 36, 14],
  ["Aloo paratha (1)", 300, 6, 40, 13, "alu paratha"],
  ["Paneer paratha (1)", 330, 12, 38, 15],
  ["Plain paratha (1)", 260, 5, 34, 11, "paratha"],
  ["Poori (2)", 280, 5, 34, 14, "puri"],
  ["Bhatura (1)", 300, 6, 40, 13, "bhature"],
  ["Kulcha (1)", 280, 7, 46, 7],

  // --- North Indian mains ---
  ["Dal tadka (bowl)", 220, 11, 26, 8, "dal", "dal fry", "yellow dal"],
  ["Dal makhani (bowl)", 330, 12, 30, 18],
  ["Rajma (bowl)", 280, 13, 38, 8, "rajma masala"],
  ["Chana masala (bowl)", 290, 13, 40, 9, "chole", "chana", "chhole"],
  ["Chole bhature (plate)", 700, 18, 90, 28],
  ["Paneer butter masala", 380, 16, 16, 28, "paneer makhani"],
  ["Palak paneer", 300, 16, 12, 21, "saag paneer"],
  ["Kadai paneer", 350, 17, 14, 25],
  ["Shahi paneer", 400, 15, 18, 30],
  ["Matar paneer", 320, 15, 18, 21, "mutter paneer"],
  ["Paneer bhurji", 300, 18, 8, 22],
  ["Mixed veg curry (bowl)", 220, 6, 20, 13, "mix veg", "sabzi", "vegetable curry"],
  ["Bhindi masala", 200, 4, 16, 13, "okra", "bhindi fry"],
  ["Aloo gobi", 210, 5, 24, 11],
  ["Baingan bharta", 220, 4, 16, 15],
  ["Malai kofta (2)", 420, 12, 30, 28],
  ["Chicken curry (bowl)", 280, 26, 8, 16, "chicken gravy", "murgh curry"],
  ["Butter chicken", 420, 30, 12, 28, "murgh makhani"],
  ["Chicken tikka masala", 400, 32, 14, 24],
  ["Kadai chicken", 350, 30, 10, 21],
  ["Chicken 65 (plate)", 380, 28, 16, 22],
  ["Tandoori chicken (2 pc)", 300, 35, 4, 16],
  ["Chicken tikka (6 pc)", 280, 34, 6, 13, "chicken tikka"],
  ["Mutton curry (bowl)", 380, 28, 8, 26, "mutton gravy", "lamb curry"],
  ["Mutton rogan josh", 400, 28, 8, 28, "rogan josh"],
  ["Egg curry (2 eggs)", 300, 16, 10, 22, "anda curry"],
  ["Fish fry (2 pc)", 300, 28, 8, 17],
  ["Prawn masala (bowl)", 260, 24, 8, 14, "shrimp curry"],

  // --- Rice & biryani ---
  ["Steamed rice (1 cup)", 200, 4, 45, 0, "white rice", "plain rice", "rice"],
  ["Jeera rice (1 cup)", 250, 4, 45, 6],
  ["Ghee rice (1 cup)", 300, 4, 45, 12],
  ["Veg pulao (plate)", 350, 8, 55, 11, "pulao", "pilaf"],
  ["Veg biryani (plate)", 450, 10, 68, 15, "vegetable biryani"],
  ["Chicken biryani (plate)", 600, 28, 70, 22, "murgh biryani"],
  ["Mutton biryani (plate)", 700, 30, 72, 32],
  ["Egg biryani (plate)", 520, 18, 68, 18],
  ["Hyderabadi biryani (plate)", 650, 27, 72, 26],
  ["Curd / raita (bowl)", 90, 4, 8, 4, "raita", "curd", "dahi"],

  // --- Snacks & street food ---
  ["Samosa (1)", 260, 4, 30, 14, "singara"],
  ["Kachori (1)", 250, 5, 28, 13],
  ["Vada pav (1)", 300, 7, 42, 12],
  ["Pav bhaji (plate)", 450, 9, 55, 22],
  ["Misal pav (plate)", 400, 14, 50, 16],
  ["Pani puri (6)", 180, 4, 32, 5, "golgappa", "puchka", "gol gappe"],
  ["Bhel puri (plate)", 280, 6, 44, 9, "bhelpuri"],
  ["Sev puri (plate)", 320, 6, 40, 15],
  ["Dahi puri (plate)", 300, 7, 40, 12],
  ["Aloo tikki (2)", 260, 5, 34, 12],
  ["Dhokla (4 pc)", 200, 7, 30, 6, "khaman"],
  ["Khandvi (serving)", 180, 6, 20, 8],
  ["Poha (plate)", 250, 5, 40, 8, "aval", "avalakki"],
  ["Sabudana khichdi", 320, 5, 48, 12, "sago khichdi"],
  ["Maggi (1 pack)", 350, 8, 50, 13, "maggi noodles", "instant noodles"],
  ["Veg sandwich", 250, 8, 34, 9, "sandwich"],
  ["Grilled cheese sandwich", 350, 12, 34, 18],
  ["Bread omelette", 320, 16, 26, 17],
  ["Egg bhurji (2 eggs)", 220, 14, 4, 16, "anda bhurji", "scrambled eggs"],
  ["Boiled eggs (2)", 155, 13, 1, 11, "boiled egg", "egg"],
  ["Omelette (2 eggs)", 220, 13, 2, 17, "omelet"],
  ["Cutlet (2)", 260, 6, 30, 13, "veg cutlet"],
  ["Spring roll (2)", 240, 6, 30, 11],
  ["Gobi manchurian (plate)", 350, 8, 40, 17, "manchurian"],
  ["Chilli paneer (plate)", 400, 18, 20, 27],
  ["Chilli chicken (plate)", 420, 30, 22, 24],
  ["Veg fried rice (plate)", 400, 8, 62, 13, "fried rice"],
  ["Chicken fried rice (plate)", 500, 22, 62, 18],
  ["Veg hakka noodles (plate)", 400, 9, 58, 14, "hakka noodles", "chow mein"],
  ["Chicken noodles (plate)", 480, 22, 58, 18],
  ["Schezwan fried rice", 450, 10, 64, 16],

  // --- Breakfast / global ---
  ["Oats with milk (bowl)", 220, 8, 33, 6, "oats", "oatmeal"],
  ["Masala oats (bowl)", 200, 7, 32, 5],
  ["Cornflakes with milk", 210, 7, 38, 4, "cornflakes"],
  ["Muesli with milk", 260, 9, 40, 7],
  ["Paratha with curd", 360, 8, 44, 16],
  ["Toast with butter (2)", 200, 5, 26, 8, "bread toast", "toast"],
  ["Peanut butter toast (2)", 320, 12, 30, 18],
  ["Banana", 105, 1, 27, 0],
  ["Apple", 95, 0, 25, 0],
  ["Milk (1 glass)", 150, 8, 12, 8, "milk"],
  ["Buttermilk (1 glass)", 60, 3, 5, 3, "chaas", "chhaas", "majjige"],
  ["Lassi (sweet, 1 glass)", 260, 8, 40, 8, "lassi"],
  ["Protein shake (1 scoop)", 130, 24, 4, 2, "whey shake", "protein"],
  ["Sprouts salad (bowl)", 150, 10, 22, 2, "sprouts", "moong salad"],
  ["Green salad (bowl)", 60, 2, 10, 1, "salad"],
  ["Fruit bowl", 130, 2, 32, 1, "fruit salad"],
  ["Chicken salad (bowl)", 250, 28, 10, 11],
  ["Paneer tikka (6 pc)", 320, 20, 10, 22, "paneer tikka"],
  ["Grilled chicken breast (150g)", 250, 46, 0, 6, "grilled chicken", "chicken breast"],
  ["Boiled chana (bowl)", 220, 12, 32, 4, "boiled chickpeas", "kala chana"],
  ["Curd (bowl)", 100, 6, 8, 4, "yogurt", "greek yogurt"],

  // --- Sweets ---
  ["Gulab jamun (2)", 300, 4, 45, 12, "gulab jamun"],
  ["Rasgulla (2)", 190, 4, 40, 1, "rasgulla"],
  ["Jalebi (100g)", 380, 3, 60, 15, "jalebi"],
  ["Ladoo (1)", 190, 3, 24, 9, "laddu", "besan ladoo", "motichoor ladoo"],
  ["Barfi (1 pc)", 170, 3, 20, 9, "barfi", "kaju katli"],
  ["Kheer / payasam (bowl)", 280, 7, 45, 8, "kheer", "payasam"],
  ["Halwa (bowl)", 350, 4, 45, 18, "gajar halwa", "sooji halwa"],
  ["Ice cream (1 scoop)", 140, 2, 17, 7, "icecream"],
];

interface Food extends FoodMacros {
  aliases: string[];
}
const FOODS: Food[] = TABLE.map(([label, kcal, protein_g, carbs_g, fat_g, ...aliases]) => ({
  label, kcal, protein_g, carbs_g, fat_g, aliases,
}));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set(["with", "and", "the", "a", "of", "plate", "bowl", "serving", "pc", "pcs", "piece"]);
const tokens = (s: string) => norm(s).split(" ").filter((t) => t && !STOP.has(t));

/** Best-match a free-text dish name to the built-in table. */
export function lookupFood(query: string): FoodMacros | null {
  const q = norm(query);
  if (q.length < 2) return null;

  // 1. exact label or alias
  for (const f of FOODS) {
    if (norm(f.label) === q || f.aliases.some((a) => norm(a) === q)) {
      return { label: f.label, kcal: f.kcal, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g };
    }
  }

  // 2. token-overlap score
  const qt = tokens(query);
  if (!qt.length) return null;
  let best: Food | null = null;
  let bestScore = 0;
  for (const f of FOODS) {
    const names = [f.label, ...f.aliases];
    let score = 0;
    for (const name of names) {
      const nt = tokens(name);
      const overlap = qt.filter((t) => nt.some((n) => n === t || n.startsWith(t) || t.startsWith(n))).length;
      if (!overlap) continue;
      // reward matching a bigger share of the candidate's own words
      score = Math.max(score, overlap + overlap / nt.length);
    }
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  if (best && bestScore >= 1) {
    return { label: best.label, kcal: best.kcal, protein_g: best.protein_g, carbs_g: best.carbs_g, fat_g: best.fat_g };
  }
  return null;
}

export const FOOD_COUNT = FOODS.length;
