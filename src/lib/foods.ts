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
  ["Veg biryani (plate)", 450, 10, 68, 15, "vegetable biryani", "veg biriyani", "veg briyani"],
  ["Chicken biryani (plate)", 600, 28, 70, 22, "murgh biryani", "chicken biriyani", "chicken briyani", "chiken biryani"],
  ["Mutton biryani (plate)", 700, 30, 72, 32, "mutton biriyani", "mutton briyani", "lamb biryani"],
  ["Egg biryani (plate)", 520, 18, 68, 18, "egg biriyani", "anda biryani"],
  ["Hyderabadi biryani (plate)", 650, 27, 72, 26, "hyderabadi biriyani"],
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
  ["Kheer / payasam (bowl)", 280, 7, 45, 8, "kheer", "payasam", "paal payasam"],
  ["Halwa (bowl)", 350, 4, 45, 18, "sooji halwa", "sheera"],
  ["Gajar halwa (bowl)", 380, 5, 44, 20, "carrot halwa"],
  ["Moong dal halwa (bowl)", 420, 8, 45, 24],
  ["Ice cream (1 scoop)", 140, 2, 17, 7, "icecream"],
  ["Rasmalai (2)", 260, 8, 34, 11, "ras malai"],
  ["Mysore pak (1 pc)", 200, 2, 20, 13, "mysore pak"],
  ["Kaju katli (2 pc)", 160, 3, 16, 9, "kaju barfi", "cashew barfi"],
  ["Sandesh (2)", 150, 6, 20, 5],
  ["Kalakand (1 pc)", 180, 5, 20, 9],
  ["Soan papdi (2 pc)", 180, 2, 24, 9, "son papdi"],
  ["Coconut ladoo (2)", 220, 2, 24, 13, "nariyal ladoo"],
  ["Boondi ladoo (1)", 190, 3, 26, 8],
  ["Modak (2)", 200, 3, 32, 7, "kozhukattai"],
  ["Malpua (2)", 300, 4, 42, 13],
  ["Shrikhand (bowl)", 260, 8, 34, 10],
  ["Basundi (bowl)", 280, 8, 34, 12],
  ["Kulfi (1)", 200, 4, 22, 10, "malai kulfi", "matka kulfi"],
  ["Falooda (glass)", 350, 7, 58, 9],
  ["Double ka meetha (bowl)", 400, 7, 48, 20, "shahi tukda"],
  ["Mishti doi (bowl)", 200, 5, 34, 4, "mishti dahi"],
  ["Peda (2)", 180, 4, 24, 8],

  // --- More South Indian ---
  ["Neer dosa (2)", 180, 4, 34, 3],
  ["Kanchipuram idli (2)", 190, 5, 32, 4],
  ["Podi idli (plate)", 260, 6, 36, 10, "idli podi", "gunpowder idli"],
  ["Mini idli sambar (bowl)", 300, 9, 46, 9, "idli sambar", "sambar idli"],
  ["Mysore bonda (3)", 260, 5, 32, 12, "bonda", "mysore bajji"],
  ["Curd vada (2)", 300, 7, 30, 16, "thayir vada", "dahi vada", "perugu vada"],
  ["Sambar vada (2)", 320, 9, 36, 15],
  ["Puliyogare (plate)", 340, 6, 56, 10, "tamarind rice", "pulihora", "puliyodarai"],
  ["Vangi bath (plate)", 340, 7, 52, 11, "brinjal rice"],
  ["Poriyal (bowl)", 120, 3, 12, 7, "thoran", "beans poriyal", "cabbage poriyal"],
  ["Kootu (bowl)", 160, 6, 18, 7],
  ["Avial (bowl)", 200, 4, 14, 14],
  ["Keerai masiyal (bowl)", 90, 5, 9, 3, "keerai", "spinach masiyal"],
  ["Kara kuzhambu (bowl)", 180, 4, 16, 11],
  ["Mor kuzhambu (bowl)", 150, 5, 12, 9, "majjige huli"],
  ["Chow chow bath (plate)", 380, 7, 58, 13, "khara bath kesari bath"],
  ["Ragi mudde (2)", 220, 5, 46, 1, "ragi ball", "ragi sangati"],
  ["Ragi dosa", 180, 5, 32, 4],
  ["Akki roti (2)", 240, 5, 42, 6],
  ["Bisi bele bath (plate)", 400, 12, 58, 13, "bisibelebath", "bisi bele huli anna"],
  ["Kal dosa with kurma (plate)", 380, 9, 54, 13, "parotta kurma"],
  ["Chicken sukka (bowl)", 320, 30, 8, 19, "kori sukka"],
  ["Fish fry Andhra style (2 pc)", 320, 28, 10, 18, "apollo fish"],
  ["Gongura mutton (bowl)", 420, 28, 8, 30, "gongura mamsam"],
  ["Pesarattu upma (plate)", 340, 12, 46, 11, "MLA pesarattu"],

  // --- More North Indian ---
  ["Dal fry (bowl)", 240, 11, 28, 9],
  ["Dhaba dal (bowl)", 280, 12, 26, 13],
  ["Chana dal (bowl)", 230, 12, 30, 6],
  ["Kadhi pakora (bowl)", 260, 8, 22, 15, "kadhi"],
  ["Dum aloo (bowl)", 280, 5, 26, 17],
  ["Jeera aloo (bowl)", 200, 4, 26, 9],
  ["Aloo matar (bowl)", 220, 6, 24, 11],
  ["Methi malai matar", 300, 8, 18, 22],
  ["Bhindi do pyaza", 210, 4, 16, 14],
  ["Lauki sabzi (bowl)", 130, 3, 12, 8, "bottle gourd sabzi"],
  ["Mushroom masala (bowl)", 240, 7, 14, 17],
  ["Soya chunk curry (bowl)", 260, 18, 18, 12, "soya curry", "meal maker curry"],
  ["Egg bhurji (2 eggs)", 220, 14, 4, 16, "anda bhurji"],
  ["Chicken kadai (bowl)", 350, 30, 10, 21, "kadai chicken"],
  ["Chicken korma (bowl)", 400, 28, 12, 26],
  ["Chicken do pyaza (bowl)", 360, 30, 12, 21],
  ["Chicken lababdar (bowl)", 420, 29, 14, 28],
  ["Chicken handi (bowl)", 400, 30, 12, 26],
  ["Chicken seekh kebab (2)", 260, 22, 4, 17, "seekh kebab"],
  ["Chicken malai tikka (6 pc)", 340, 30, 6, 22, "malai tikka"],
  ["Fish tikka (6 pc)", 260, 30, 4, 13],
  ["Amritsari fish (2 pc)", 320, 26, 12, 19],
  ["Mutton keema (bowl)", 380, 26, 8, 28, "keema", "kheema matar"],
  ["Mutton seekh (2)", 300, 22, 4, 22],
  ["Nihari (bowl)", 450, 30, 12, 32],
  ["Haleem (bowl)", 380, 24, 30, 18],
  ["Paya soup (bowl)", 220, 18, 6, 14, "paya", "trotters soup"],

  // --- More breads ---
  ["Missi roti (1)", 160, 5, 24, 5],
  ["Rumali roti (1)", 120, 4, 22, 2],
  ["Aloo kulcha (1)", 300, 7, 44, 10],
  ["Paneer kulcha (1)", 330, 12, 42, 13],
  ["Thepla (2)", 220, 6, 30, 9, "methi thepla"],
  ["Khakhra (2)", 120, 3, 20, 3],
  ["Bajra roti (1)", 120, 3, 22, 2, "bajra bhakri"],
  ["Jowar roti (1)", 110, 3, 22, 1, "jowar bhakri", "jonna rotte"],

  // --- More biryani & rice ---
  ["Kolkata biryani (plate)", 620, 26, 74, 24],
  ["Lucknowi biryani (plate)", 640, 26, 74, 26, "awadhi biryani"],
  ["Malabar biryani (plate)", 650, 27, 74, 27, "thalassery biryani"],
  ["Ambur biryani (plate)", 640, 28, 72, 26],
  ["Prawn biryani (plate)", 600, 26, 72, 22, "shrimp biryani"],
  ["Fish biryani (plate)", 590, 27, 70, 22],
  ["Paneer biryani (plate)", 560, 16, 70, 22],
  ["Curd rice (small)", 240, 6, 34, 8, "thayir sadam small"],
  ["Ghee podi rice (plate)", 360, 7, 52, 14, "podi rice"],
  ["Kashmiri pulao (plate)", 380, 7, 60, 12],
  ["Rajma chawal (plate)", 480, 16, 74, 12, "rajma rice"],
  ["Dal chawal (plate)", 400, 13, 66, 8, "dal rice"],
  ["Chicken fried rice (plate)", 500, 22, 62, 18],
  ["Egg fried rice (plate)", 440, 14, 62, 15],
  ["Schezwan chicken rice (plate)", 520, 22, 64, 20],
  ["Curd rice with pickle (plate)", 350, 8, 50, 12],

  // --- More street food ---
  ["Dabeli (1)", 280, 6, 40, 11],
  ["Ragda pattice (plate)", 360, 11, 50, 13, "ragda patties"],
  ["Sev usal (plate)", 380, 13, 48, 15],
  ["Kachori chaat (plate)", 380, 8, 46, 18],
  ["Papdi chaat (plate)", 340, 7, 44, 15],
  ["Aloo chaat (plate)", 260, 4, 38, 10],
  ["Samosa chaat (plate)", 400, 8, 46, 20],
  ["Chana chaat (bowl)", 240, 11, 34, 6, "chatpata chana"],
  ["Corn chaat (bowl)", 200, 5, 32, 6, "masala corn"],
  ["Bread pakora (2)", 300, 6, 34, 15],
  ["Mirchi bajji (2)", 220, 4, 24, 12, "mirapakaya bajji"],
  ["Onion pakora (plate)", 260, 6, 26, 15, "onion bhaji", "pakoda"],
  ["Cheese pav bhaji (plate)", 540, 14, 56, 28],
  ["Kathi roll (1)", 320, 12, 34, 15, "egg roll", "kolkata roll"],
  ["Chicken kathi roll (1)", 380, 20, 36, 17],
  ["Frankie (1)", 340, 10, 42, 14],
  ["Momos veg (6)", 260, 8, 44, 6, "veg momo", "dumpling"],
  ["Momos chicken (6)", 300, 16, 40, 8, "chicken momo"],
  ["Fried momos (6)", 360, 12, 42, 16],
  ["Maggi masala (1 plate)", 380, 8, 54, 14, "masala maggi"],
  ["Chinese bhel (plate)", 320, 7, 44, 13],
  ["Egg puff (1)", 260, 7, 26, 14, "veg puff"],
  ["Chicken puff (1)", 290, 10, 26, 16],

  // --- Coffee & tea ---
  ["Espresso", 5, 0, 1, 0],
  ["Americano", 10, 0, 2, 0, "black coffee"],
  ["Cappuccino", 120, 6, 10, 6, "capuccino"],
  ["Latte", 190, 10, 15, 10, "cafe latte"],
  ["Flat white", 170, 9, 13, 9],
  ["Mocha", 290, 9, 35, 12, "cafe mocha"],
  ["Cold coffee", 320, 8, 45, 12, "iced coffee frappe"],
  ["Iced latte", 130, 7, 12, 6],
  ["Cappuccino skim milk", 80, 7, 11, 0],
  ["Hot chocolate", 300, 9, 40, 12],
  ["Masala chai (cup)", 100, 3, 14, 4, "masala tea", "chai", "tea"],
  ["Black tea (cup)", 5, 0, 1, 0, "black tea", "green tea", "lemon tea"],
  ["Filter coffee (cup)", 90, 3, 11, 4, "filter kaapi", "degree coffee"],
  ["Boost / Horlicks (glass)", 180, 8, 26, 5, "health drink"],

  // --- Cafe food ---
  ["Veg sandwich", 250, 8, 34, 9, "vegetable sandwich"],
  ["Grilled cheese sandwich", 380, 13, 34, 21],
  ["Bombay masala sandwich", 320, 9, 40, 14, "masala toast sandwich"],
  ["Chicken sandwich", 350, 22, 34, 14],
  ["Paneer sandwich", 340, 15, 36, 15],
  ["Club sandwich", 480, 24, 44, 24],
  ["Veg burger", 400, 11, 50, 17],
  ["Chicken burger", 500, 25, 46, 24],
  ["Paneer burger", 460, 18, 48, 22],
  ["Aloo tikki burger", 380, 9, 52, 15],
  ["Veg wrap", 350, 10, 44, 15],
  ["Chicken wrap", 420, 24, 42, 17],
  ["Paneer wrap", 400, 16, 44, 18],
  ["Margherita pizza (2 slices)", 400, 16, 50, 15, "cheese pizza"],
  ["Veggie pizza (2 slices)", 420, 16, 52, 16],
  ["Paneer pizza (2 slices)", 480, 20, 52, 20],
  ["Chicken pizza (2 slices)", 500, 24, 50, 22, "pepperoni pizza"],
  ["White sauce pasta (plate)", 520, 15, 62, 24, "alfredo pasta"],
  ["Red sauce pasta (plate)", 420, 13, 66, 12, "arrabbiata pasta", "marinara pasta"],
  ["Pink sauce pasta (plate)", 480, 14, 64, 18],
  ["Mac and cheese (bowl)", 480, 17, 48, 24],
  ["Chicken pasta (plate)", 560, 28, 62, 22],
  ["Garlic bread (2)", 220, 5, 28, 9],
  ["Cheese garlic bread (2)", 320, 10, 30, 17],
  ["French fries (medium)", 340, 4, 44, 17, "fries"],
  ["Peri peri fries (medium)", 370, 4, 46, 18],
  ["Masala fries (medium)", 360, 5, 46, 17],
  ["Potato wedges (medium)", 320, 4, 42, 15],
  ["Onion rings (6)", 300, 4, 34, 16],
  ["Nachos with cheese (plate)", 500, 12, 48, 28],
  ["Cheese quesadilla", 400, 16, 38, 21],
  ["Chicken quesadilla", 460, 26, 38, 23],
  ["Veg spring rolls (4)", 260, 6, 34, 11],
  ["Chicken spring rolls (4)", 300, 12, 32, 14],
  ["Chilli paneer (plate)", 420, 18, 24, 27],
  ["Chilli chicken (plate)", 440, 30, 24, 24],
  ["Chicken lollipop (5)", 380, 28, 14, 22],
  ["Manchow soup (bowl)", 140, 5, 18, 5],
  ["Hot and sour soup (bowl)", 120, 5, 16, 4],
  ["Sweet corn soup (bowl)", 130, 4, 22, 3],
  ["Tomato soup (bowl)", 110, 3, 18, 3],
  ["Lemon coriander soup (bowl)", 90, 3, 14, 2],

  // --- Continental / Asian ---
  ["Pad thai (plate)", 480, 16, 62, 18],
  ["Thai green curry with rice", 520, 16, 58, 24],
  ["Sushi roll (6 pc)", 250, 9, 40, 5],
  ["Ramen bowl", 500, 20, 62, 18],
  ["Buddha bowl", 420, 16, 52, 16],
  ["Falafel wrap", 420, 13, 50, 18],
  ["Hummus with pita", 300, 10, 34, 14, "hummus"],
  ["Shakshuka", 280, 15, 16, 18],
  ["Grilled fish with veg", 300, 34, 8, 14],
  ["Chicken steak with veg", 380, 40, 12, 18],

  // --- Smoothies, bowls, health ---
  ["Banana smoothie", 260, 8, 46, 5],
  ["Mango smoothie", 250, 6, 50, 3],
  ["Berry smoothie", 220, 6, 40, 4, "mixed berry smoothie"],
  ["Peanut butter banana smoothie", 360, 14, 44, 15, "pb banana smoothie"],
  ["Chocolate protein smoothie", 300, 28, 30, 8],
  ["Green smoothie", 180, 6, 32, 3, "spinach smoothie"],
  ["Acai bowl", 380, 8, 62, 12],
  ["Granola bowl with yogurt", 350, 12, 48, 12, "granola yogurt"],
  ["Yogurt parfait", 280, 12, 38, 8],
  ["Overnight oats", 300, 12, 44, 9],
  ["Oatmeal with fruit", 280, 9, 48, 6, "porridge"],
  ["Chia pudding", 240, 8, 26, 12],
  ["Smoothie bowl", 340, 10, 54, 10],
  ["Protein bar (1)", 220, 20, 22, 7, "energy bar"],
  ["Trail mix (handful)", 180, 5, 16, 12],
  ["Peanut chikki (1)", 200, 6, 22, 10, "chikki"],

  // --- Salads ---
  ["Caesar salad", 360, 12, 14, 28],
  ["Greek salad", 240, 7, 14, 18],
  ["Quinoa salad (bowl)", 320, 11, 44, 11, "quinoa bowl"],
  ["Chickpea salad (bowl)", 260, 12, 34, 8, "chana salad"],
  ["Kachumber salad (bowl)", 70, 2, 10, 2, "kachumber"],
  ["Corn and beans salad (bowl)", 180, 8, 28, 4],
  ["Paneer salad (bowl)", 280, 16, 12, 18],
  ["Egg salad (bowl)", 240, 14, 6, 18],
  ["Tuna salad (bowl)", 260, 26, 8, 13],

  // --- Proteins & basics ---
  ["Tofu bhurji (bowl)", 220, 18, 8, 13, "tofu scramble"],
  ["Grilled tofu (150g)", 180, 18, 4, 10],
  ["Soya chunks (bowl, cooked)", 180, 22, 12, 4, "soya nuggets"],
  ["Paneer cubes (100g)", 260, 18, 4, 20, "raw paneer"],
  ["Egg white omelette (3)", 90, 16, 2, 1, "egg white omelette"],
  ["Grilled prawns (100g)", 120, 22, 2, 3],
  ["Tandoori chicken leg (1)", 180, 22, 2, 9],
  ["Boiled egg whites (3)", 51, 11, 1, 0],
  ["Roasted chana (handful)", 120, 7, 16, 2, "roasted chickpeas", "bhuna chana"],
  ["Makhana roasted (bowl)", 130, 4, 24, 2, "fox nuts", "phool makhana"],
  ["Peanut butter (2 tbsp)", 190, 7, 8, 16],
  ["Almond butter (2 tbsp)", 200, 7, 6, 18],
  ["Ghee (1 tsp)", 45, 0, 0, 5],
  ["Butter (1 tsp)", 36, 0, 0, 4],
  ["Sugar (1 tsp)", 16, 0, 4, 0],
  ["Honey (1 tbsp)", 64, 0, 17, 0],
  ["Olive oil (1 tbsp)", 120, 0, 0, 14],
  ["Papad (2)", 70, 3, 10, 2, "papadum", "appalam"],
  ["Pickle (1 tbsp)", 30, 0, 2, 2, "achar"],

  // --- Fruits ---
  ["Mango (1)", 200, 3, 50, 1],
  ["Orange (1)", 62, 1, 15, 0],
  ["Papaya (bowl)", 60, 1, 15, 0],
  ["Watermelon (bowl)", 45, 1, 11, 0],
  ["Grapes (handful)", 60, 1, 16, 0],
  ["Pomegranate (bowl)", 130, 3, 29, 2, "anar"],
  ["Guava (1)", 110, 4, 24, 2, "amrood"],
  ["Chikoo (2)", 140, 1, 34, 2, "sapota"],
  ["Pineapple (bowl)", 80, 1, 21, 0],
  ["Dates (4)", 90, 1, 24, 0, "khajur"],
  ["Sweet lime (1)", 55, 1, 14, 0, "mosambi"],
  ["Muskmelon (bowl)", 55, 1, 13, 0],
  ["Coconut water (glass)", 45, 2, 9, 0, "nariyal pani"],

  // --- Nuts & snacks ---
  ["Almonds (handful, ~15)", 105, 4, 4, 9, "badam"],
  ["Walnuts (handful)", 130, 3, 3, 13, "akhrot"],
  ["Cashews (handful)", 155, 5, 9, 12, "kaju"],
  ["Peanuts (handful)", 160, 7, 6, 14, "moongphali", "groundnut"],
  ["Pistachios (handful)", 120, 4, 6, 10, "pista"],
  ["Popcorn (bowl)", 120, 3, 22, 3],
  ["Bhujia / namkeen (bowl)", 250, 6, 24, 15, "sev", "mixture", "namkeen"],
  ["Banana chips (handful)", 200, 1, 20, 13, "kela chips"],
  ["Murukku (2)", 180, 3, 20, 10, "chakli", "murmura"],
  ["Chivda / poha namkeen (bowl)", 230, 5, 28, 11],
  ["Protein cookie (1)", 180, 12, 18, 7],
  ["Digestive biscuits (3)", 140, 2, 20, 6, "biscuits", "marie biscuit"],

  // --- Beverages ---
  ["Orange juice (glass)", 110, 2, 26, 0, "mosambi juice"],
  ["Sugarcane juice (glass)", 180, 0, 45, 0, "ganne ka ras"],
  ["Nimbu pani (glass)", 90, 0, 22, 0, "lemonade", "shikanji", "lemon water"],
  ["Buttermilk spiced (glass)", 60, 3, 6, 3, "spiced chaas"],
  ["Salt lassi (glass)", 120, 6, 10, 6, "namkeen lassi"],
  ["Mango lassi (glass)", 320, 8, 52, 9],
  ["Cola (can)", 140, 0, 39, 0, "soft drink", "pepsi", "coke"],
  ["Energy drink (can)", 110, 0, 28, 0, "red bull"],
  ["Coconut milk shake (glass)", 260, 4, 34, 12],
  ["Badam milk (glass)", 200, 8, 24, 8, "almond milk drink"],
  ["Green juice (glass)", 90, 3, 18, 1, "ash gourd juice"],

  // --- Western breakfast / bakery ---
  ["Pancakes (2)", 350, 8, 52, 12],
  ["Waffle (1)", 300, 7, 40, 12],
  ["French toast (2)", 320, 12, 34, 15],
  ["Scrambled eggs (2)", 200, 13, 2, 15],
  ["Croissant (1)", 270, 5, 30, 14],
  ["Butter croissant (1)", 300, 6, 30, 17],
  ["Chocolate croissant (1)", 340, 6, 38, 18, "pain au chocolat"],
  ["Muffin (1)", 380, 6, 50, 18, "blueberry muffin", "chocolate chip muffin"],
  ["Blueberry muffin (1)", 380, 5, 52, 17],
  ["Brownie (1)", 320, 4, 40, 17, "chocolate brownie"],
  ["Chocolate cake (slice)", 400, 5, 52, 20],
  ["Red velvet cake (slice)", 420, 5, 54, 21],
  ["Cheesecake (slice)", 400, 7, 34, 26],
  ["Donut (1)", 280, 4, 34, 15, "doughnut"],
  ["Cookie (1 large)", 220, 3, 30, 10, "chocolate chip cookie"],
  ["Banana bread (slice)", 260, 4, 38, 10],
  ["Cinnamon roll (1)", 340, 5, 50, 14],
  ["Danish pastry (1)", 300, 5, 34, 16],
  ["Scone (1)", 280, 6, 38, 12],
  ["Eclair (1)", 260, 5, 24, 16],
  ["Tiramisu (slice)", 350, 6, 32, 22],
  ["Macaron (2)", 180, 3, 24, 8],
  ["Fruit tart (1)", 280, 4, 34, 15],
  ["Swiss roll (slice)", 220, 3, 32, 9],
  ["Apple pie (slice)", 300, 3, 43, 14],
  ["Carrot cake (slice)", 380, 5, 46, 20],
  ["Lemon tart (slice)", 320, 5, 40, 16],
  ["Panna cotta", 300, 5, 26, 20],
  ["Creme brulee", 320, 5, 28, 21],
  ["Profiteroles (3)", 340, 6, 30, 22],
  ["Baklava (2 pc)", 330, 5, 38, 18],
  ["Churros (4)", 340, 4, 42, 17],
  ["Mochi (2)", 220, 2, 48, 3],
  ["Portuguese egg tart (1)", 200, 4, 22, 10, "egg tart"],
  ["Banoffee pie (slice)", 420, 5, 48, 24],
  ["Pavlova (slice)", 260, 3, 44, 8],
  ["Trifle (bowl)", 320, 5, 44, 14],
  ["Bread pudding (bowl)", 300, 7, 42, 11],
  ["Kunafa (slice)", 380, 7, 42, 20, "knafeh", "kunafeh"],

  // --- Chocolate & candy ---
  ["Milk chocolate (bar, 45g)", 240, 3, 26, 14, "dairy milk", "chocolate bar", "chocolate"],
  ["Dark chocolate (30g)", 170, 2, 13, 12, "70% dark chocolate"],
  ["Chocolate truffle (2)", 150, 2, 15, 9],
  ["Snickers bar (1)", 250, 4, 33, 12],
  ["KitKat (4 finger)", 210, 3, 27, 11, "kit kat"],
  ["Ferrero Rocher (3)", 220, 3, 17, 16],
  ["M&M's (small pack)", 170, 2, 24, 7, "candy chocolate buttons"],
  ["Bounty bar (1)", 270, 2, 30, 15],
  ["Nutella (2 tbsp)", 200, 2, 22, 12],
  ["Gummy bears (handful)", 140, 3, 33, 0, "jelly sweets", "gummies"],
  ["Lollipop (1)", 60, 0, 15, 0],
  ["Hard candy (3)", 70, 0, 18, 0, "toffee"],
  ["Caramel toffee (3)", 160, 1, 26, 6],
  ["Marshmallows (4)", 90, 1, 23, 0],
  ["Fudge (1 pc)", 130, 1, 21, 5],

  // --- Global mains ---
  ["Cheeseburger (1)", 550, 28, 40, 30],
  ["Double cheeseburger (1)", 760, 40, 42, 46],
  ["Chicken nuggets (6)", 280, 15, 16, 17],
  ["Hot dog (1)", 300, 11, 24, 18],
  ["Fried chicken (2 pc)", 480, 34, 18, 30, "kfc chicken", "broast"],
  ["Chicken shawarma (1)", 480, 28, 42, 22, "shawarma", "chicken kebab roll"],
  ["Beef taco (2)", 340, 18, 30, 16, "tacos"],
  ["Chicken burrito (1)", 620, 30, 70, 24, "burrito"],
  ["Nachos supreme (plate)", 620, 20, 54, 36],
  ["Enchiladas (2)", 520, 24, 48, 26],
  ["Lasagna (slice)", 480, 24, 40, 24],
  ["Spaghetti bolognese (plate)", 520, 24, 62, 18],
  ["Spaghetti carbonara (plate)", 600, 22, 64, 28],
  ["Risotto (plate)", 480, 12, 62, 18],
  ["Gnocchi (plate)", 440, 12, 66, 14],
  ["Fish and chips (plate)", 780, 34, 72, 40],
  ["Grilled salmon (fillet)", 360, 34, 0, 24],
  ["Roast chicken (2 pc)", 400, 44, 0, 24],
  ["Beef steak (200g)", 460, 46, 0, 30, "sirloin steak"],
  ["Pork chop (1)", 360, 38, 0, 22],
  ["Meatballs (4)", 320, 22, 10, 22],
  ["Shepherd's pie (plate)", 500, 24, 44, 26],
  ["Pho bowl", 420, 28, 52, 8],
  ["Bibimbap (bowl)", 560, 20, 78, 18],
  ["Korean fried chicken (5 pc)", 500, 30, 34, 26],
  ["Bulgogi with rice (plate)", 600, 32, 66, 22],
  ["Teriyaki chicken with rice", 620, 34, 74, 18],
  ["Chicken katsu curry (plate)", 720, 28, 90, 28, "katsu curry"],
  ["Sushi platter (10 pc)", 420, 18, 66, 8],
  ["California roll (8 pc)", 340, 10, 52, 9],
  ["Gyoza (6)", 300, 12, 34, 13, "japanese dumplings"],
  ["Sweet and sour chicken (plate)", 560, 26, 62, 22],
  ["Kung pao chicken (plate)", 480, 30, 30, 26],
  ["Beef chow mein (plate)", 520, 24, 60, 20, "chow mein"],
  ["Singapore noodles (plate)", 500, 18, 64, 18],
  ["Nasi goreng (plate)", 540, 18, 70, 20],
  ["Pad see ew (plate)", 540, 18, 68, 20],
  ["Massaman curry with rice", 620, 22, 62, 32],
  ["Butter chicken with naan", 780, 38, 62, 42],
  ["Greek gyro (1)", 500, 26, 44, 24],
  ["Moussaka (slice)", 460, 20, 28, 30],
  ["Paella (plate)", 560, 26, 68, 18],
  ["Couscous with vegetables (bowl)", 380, 11, 62, 9],
  ["Tabbouleh (bowl)", 200, 4, 24, 10],
  ["Poke bowl", 480, 28, 52, 16],
  ["Burrito bowl", 560, 26, 64, 22],
  ["Avocado toast", 320, 9, 32, 18],
  ["Bagel with cream cheese", 380, 12, 56, 12],
  ["Full English breakfast", 800, 35, 45, 52, "english breakfast"],
  ["Eggs benedict (2)", 550, 24, 30, 38],
  ["Three-egg cheese omelette", 380, 24, 3, 30],

  // --- Juices & drinks (worldwide) ---
  ["Apple juice (glass)", 115, 0, 28, 0],
  ["Pineapple juice (glass)", 130, 1, 32, 0],
  ["Cranberry juice (glass)", 120, 0, 30, 0],
  ["Grape juice (glass)", 150, 1, 37, 0],
  ["Pomegranate juice (glass)", 135, 0, 33, 0, "anar juice"],
  ["Watermelon juice (glass)", 90, 2, 21, 0],
  ["Carrot juice (glass)", 95, 2, 22, 0],
  ["ABC juice (glass)", 110, 2, 25, 0, "apple beetroot carrot juice"],
  ["Green detox juice (glass)", 100, 3, 20, 1],
  ["Amla juice (shot)", 20, 0, 4, 0],
  ["Wheatgrass shot", 15, 1, 2, 0],
  ["Tender coconut (1)", 60, 2, 12, 0, "tender coconut water"],
  ["Buttermilk (glass)", 40, 3, 5, 1, "chaas", "majjige", "moru"],
  ["Sweet lassi (glass)", 260, 8, 42, 7],
  ["Vanilla milkshake (glass)", 350, 10, 50, 12, "vanilla shake"],
  ["Chocolate milkshake (glass)", 400, 11, 56, 14, "chocolate shake"],
  ["Strawberry milkshake (glass)", 360, 10, 52, 12],
  ["Oreo shake (glass)", 450, 11, 62, 18],
  ["Mixed fruit smoothie (glass)", 240, 5, 48, 3],
  ["Iced tea (glass)", 90, 0, 23, 0, "lemon iced tea"],
  ["Matcha latte (glass)", 190, 8, 24, 7],
  ["Chai latte (glass)", 200, 7, 30, 6],
  ["Kombucha (glass)", 60, 0, 14, 0],
  ["Sports drink (bottle)", 130, 0, 34, 0, "gatorade", "electral"],
  ["Fresh lime soda (glass)", 110, 0, 27, 0, "lime soda"],
  ["Milk (glass)", 150, 8, 12, 8, "full cream milk"],
  ["Skimmed milk (glass)", 85, 8, 12, 0],
  ["Soy milk (glass)", 100, 7, 8, 4],
  ["Almond milk (glass)", 40, 1, 3, 3],
  ["Beer (pint)", 210, 2, 17, 0],
  ["Wine (glass)", 125, 0, 4, 0, "red wine", "white wine"],
  ["Whisky (peg 30ml)", 70, 0, 0, 0, "whiskey", "vodka", "rum"],
  ["Orange soda (can)", 160, 0, 43, 0, "fanta", "mirinda"],
  ["Diet cola (can)", 2, 0, 0, 0, "diet coke", "coke zero"],
  ["Lemonade (glass)", 120, 0, 30, 0],
];

interface Food extends FoodMacros {
  aliases: string[];
}
const FOODS: Food[] = TABLE.map(([label, kcal, protein_g, carbs_g, fat_g, ...aliases]) => ({
  label, kcal, protein_g, carbs_g, fat_g, aliases,
}));

const norm = (s: string) =>
  s.toLowerCase().replace(/[().,/+&-]/g, " ").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

// words to ignore: fillers, portion/quantity words, and bare quantities like "500g", "2", "1kg"
const STOP = new Set([
  "with", "and", "the", "a", "an", "of", "in", "plate", "bowl", "serving", "servings",
  "pc", "pcs", "piece", "pieces", "half", "full", "large", "small", "medium", "regular",
  "cup", "cups", "glass", "spoon", "gm", "gms", "grams", "gram", "some", "one", "two",
]);
const isQty = (t: string) => /^\d+$/.test(t) || /^\d+(g|kg|ml|l|gm|gms|oz|pc|pcs)$/.test(t);
const tokens = (s: string) =>
  norm(s).split(" ").filter((t) => t.length >= 2 && !STOP.has(t) && !isQty(t));

// small Levenshtein for fuzzy token matching (biriyani ~ biryani, panner ~ paneer)
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 3;
  const d = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = d[j];
      d[j] = Math.min(
        d[j] + 1,
        d[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return d[n];
}
function tokenMatch(t: string, n: string): boolean {
  if (t === n || n.startsWith(t) || t.startsWith(n)) return true;
  if (t.length >= 4 && n.length >= 4 && lev(t, n) <= (Math.max(t.length, n.length) >= 7 ? 2 : 1)) return true;
  return false;
}

/** Best-match a free-text dish name to the built-in table. */
export function lookupFood(query: string): FoodMacros | null {
  const q = norm(query);
  if (q.length < 2) return null;
  const out = (f: Food): FoodMacros => ({
    label: f.label, kcal: f.kcal, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g,
  });

  // 1. exact label or alias
  for (const f of FOODS) {
    if (norm(f.label) === q || f.aliases.some((a) => norm(a) === q)) return out(f);
  }

  const qt = tokens(query);
  if (!qt.length) return null;
  const qset = new Set(qt);

  let best: Food | null = null;
  let bestScore = 0;
  let bestMatched = 0;
  for (const f of FOODS) {
    for (const name of [f.label, ...f.aliases]) {
      const nt = tokens(name);
      if (!nt.length) continue;
      const matched = nt.filter((n) => qt.some((t) => tokenMatch(t, n))).length;
      if (!matched) continue;
      // fraction of the candidate's words we hit + fraction of the query's words used
      const coverage = matched / nt.length;
      const usage = nt.filter((n) => qset.has(n)).length / qt.length;
      const score = matched + coverage + usage * 0.5;
      if (score > bestScore) {
        bestScore = score;
        best = f;
        bestMatched = matched;
      }
    }
  }
  // need a solid word match — and for a long query, one weak word isn't enough
  // (stops "random thai noodle thing" fuzzy-matching "masala chai").
  if (best && bestScore >= 1.3 && (qt.length < 3 || bestMatched >= 2)) return out(best);

  // 3. no table hit — estimate from category keywords so any real food still
  //    returns numbers the member can adjust. Marked "(estimate)" so it's honest.
  return estimateFood(query, qt);
}

// keyword -> [kcal, protein, carbs, fat] for one typical serving. First match wins,
// so order most-specific first.
const CATEGORIES: [test: RegExp, macros: [number, number, number, number]][] = [
  [/\b(protein shake|whey|mass gainer)\b/, [200, 25, 15, 3]],
  [/\b(biryani|pulao|fried rice|pilaf|risotto)\b/, [560, 22, 68, 20]],
  [/\b(curry|masala|gravy|korma|kuzhambu|kulambu|kadai|makhani|butter)\b/, [330, 18, 16, 22]],
  [/\b(burger|cheeseburger|whopper)\b/, [520, 25, 44, 27]],
  [/\b(pizza)\b/, [430, 17, 52, 17]],
  [/\b(pasta|noodles?|spaghetti|macaroni|chow mein|hakka|ramen|maggi)\b/, [480, 16, 62, 18]],
  [/\b(sandwich|wrap|roll|sub|burrito|shawarma|kathi|frankie)\b/, [370, 15, 40, 16]],
  [/\b(sushi|maki|nigiri)\b/, [350, 12, 55, 8]],
  [/\b(soup|shorba|rasam|broth)\b/, [130, 5, 17, 4]],
  [/\b(salad|slaw)\b/, [260, 9, 20, 16]],
  [/\b(smoothie|milkshake|shake|lassi|frappe)\b/, [300, 9, 46, 9]],
  [/\b(juice|nectar)\b/, [115, 1, 28, 0]],
  [/\b(soda|cola|pepsi|coke|soft drink|lemonade|sherbet|sharbat)\b/, [130, 0, 33, 0]],
  [/\b(coffee|latte|cappuccino|americano|espresso|macchiato)\b/, [120, 5, 12, 6]],
  [/\b(tea|chai|kahwa)\b/, [40, 1, 7, 1]],
  [/\b(beer|wine|whisky|whiskey|vodka|rum|gin|cocktail|tequila)\b/, [150, 0, 6, 0]],
  [/\b(cake|pastry|brownie|cheesecake|tart|pie|pudding|tiramisu|mousse)\b/, [350, 5, 42, 18]],
  [/\b(ice cream|gelato|kulfi|sundae|falooda)\b/, [230, 4, 28, 12]],
  [/\b(chocolate|candy|toffee|fudge|truffle|praline)\b/, [220, 3, 24, 13]],
  [/\b(cookie|biscuit|muffin|croissant|donut|doughnut|bun|scone|waffle|pancake)\b/, [280, 5, 38, 12]],
  [/\b(halwa|kheer|payasam|barfi|burfi|ladoo|laddu|jalebi|mysore pak|rasgulla|gulab jamun|sweet|mithai|dessert)\b/, [320, 5, 46, 13]],
  [/\b(dosa|uttapam|cheela|chilla|pancake)\b/, [250, 7, 40, 8]],
  [/\b(idli|idly|dhokla|appam|puttu)\b/, [160, 5, 30, 2]],
  [/\b(paratha|thepla|puri|poori|bhatura|kulcha)\b/, [280, 7, 38, 12]],
  [/\b(roti|chapati|chapathi|naan|phulka|bhakri|rumali)\b/, [110, 3, 20, 3]],
  [/\b(rice|pongal|khichdi|khichuri)\b/, [260, 6, 52, 3]],
  [/\b(dal|daal|dhal|sambar|sambhar|rasam|lentil|kootu)\b/, [200, 11, 26, 6]],
  [/\b(paneer|tofu|cottage cheese)\b/, [300, 16, 12, 22]],
  [/\b(chicken|mutton|lamb|beef|pork|fish|prawn|shrimp|egg|kebab|tikka|meat|seafood)\b/, [330, 30, 8, 20]],
  [/\b(fries|chips|nachos|wedges|pakora|bhaji|bajji|vada|bonda|samosa|fried|fritter|tempura|cutlet)\b/, [320, 6, 34, 17]],
  [/\b(chaat|bhel|sev puri|pani puri|golgappa|puchka)\b/, [300, 7, 42, 12]],
  [/\b(sabzi|sabji|bhaji|poriyal|thoran|stir fry|greens|vegetable|veg)\b/, [160, 5, 16, 9]],
  [/\b(nuts|almond|cashew|walnut|pista|peanut|makhana|seeds|trail mix)\b/, [160, 6, 8, 13]],
  [/\b(fruit|apple|banana|mango|orange|grapes|papaya|melon|berries|berry)\b/, [90, 1, 22, 0]],
  [/\b(yogurt|curd|dahi|raita|parfait)\b/, [150, 8, 16, 6]],
  [/\b(oats|oatmeal|porridge|muesli|granola|cereal|cornflakes)\b/, [230, 8, 40, 5]],
  [/\b(bar|energy bar|granola bar|snack)\b/, [190, 8, 26, 7]],
];

function estimateFood(query: string, qt: string[]): FoodMacros | null {
  // ignore pure noise: need a word with a vowel
  if (!qt.some((t) => t.length >= 3 && /[aeiou]/.test(t))) return null;
  const q = norm(query);
  const hit = CATEGORIES.find(([re]) => re.test(q));
  const [kcal, protein_g, carbs_g, fat_g] = hit ? hit[1] : [350, 12, 40, 14]; // generic mixed meal
  const title = query.trim().replace(/\s+/g, " ");
  return {
    label: `${title.charAt(0).toUpperCase()}${title.slice(1)} (estimate)`,
    kcal, protein_g, carbs_g, fat_g,
  };
}

export const FOOD_COUNT = FOODS.length;
