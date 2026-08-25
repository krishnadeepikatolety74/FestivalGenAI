export type FestivalPlanInput = {
  festival: string;
  city: string;
  familySize: number;
  budget: number;
  language: string;
  preferences: string[];
};

const languageInstructions: Record<string, string> = {
  English: "Write all user-facing content in English using Latin script.",
  Hindi: "Write all user-facing content in Hindi using Devanagari script. Do not use Tamil, Telugu, Malayalam, or Bengali script.",
  Telugu: "Write all user-facing content in Telugu using Telugu script (Unicode U+0C00-U+0C7F). Do not use Tamil, Malayalam, Kannada, Hindi, or Bengali script. Do not mix scripts. English is allowed only for fixed schema enum category values.",
  Tamil: "Write all user-facing content in Tamil using Tamil script (Unicode U+0B80-U+0BFF). Do not use Telugu, Malayalam, Kannada, Hindi, or Bengali script. Do not mix scripts. English is allowed only for fixed schema enum category values.",
  Bengali: "Write all user-facing content in Bengali using Bengali script. Do not use Tamil, Telugu, Malayalam, Kannada, or Hindi script.",
};

export type GeneratedFestivalPlan = {
  summary: string;
  specialItems: string[];
  decorations: string[];
  shoppingList: Array<{ item: string; category: string; quantity: string; estimatedPrice: number }>;
  budget: Array<{ category: string; amount: number; percentage: number }>;
  recipes: Array<{ name: string; category: string; cookTime: string; ingredients: string[]; steps: string[]; servings: number; description: string; tips: string[]; rating: number }>;
  rituals: Array<{ stepNumber: number; title: string; materials: string[]; procedure: string[]; purpose: string; duration: string; mantra: string | null }>;
  invitations: Array<{ type: string; title: string; content: string }>;
  timeline: Array<{ dayDate: string; title: string; description: string; status: "Completed" | "In Progress" | "Upcoming" }>;
};

const festivalFocus: Record<string, string> = {
  Diwali: "Lakshmi-Ganesha puja, diyas, rangoli, lanterns, gifts, chakli and laddoo",
  Holi: "Holika Dahan, natural colors, water play, gujiya, thandai and dahi vada",
  Pongal: "Surya worship, Pongal pot, sugarcane, kolam, Sakkarai Pongal, Mattu Pongal and Kaanum Pongal",
  "Krishna Janmashtami": "midnight Krishna birth puja, Krishna idol, makhan, flute, jhula and Dahi Handi",
  "Ganesh Chaturthi": "Ganesha sthapana, durva grass, modak, flowers, mandap and visarjan",
  Onam: "Pookalam, Onam Sadya, banana leaves, Vallam Kali and traditional Kerala customs",
  Navratri: "kalash sthapana, garba, dandiya, vrat foods and devotional decorations",
  "Durga Puja": "Durga worship, dhak, flowers, pandal traditions, sindoor khela and bhog",
  Dussehra: "Ram Lila, Shami leaves, Ayudha Puja and the victory of good over evil",
  Eid: "Eid prayer, dates, biryani, sheer khurma, new clothes and sharing with community",
  "Eid-ul-Fitr": "Eid prayer, dates, biryani, sheer khurma, new clothes and sharing with community",
  "Eid-al-Adha": "Eid prayer, sacrifice traditions handled respectfully, biryani, dates and community sharing",
  "Makar Sankranti": "Surya worship, til-gul, kites and regional harvest customs",
  Lohri: "bonfire, rewri, gajak, peanuts, bhangra and Punjabi harvest customs",
  Ugadi: "Ugadi pachadi, neem and mango leaves, oil bath, panchanga reading and Telugu-Kannada New Year customs",
  "Gudi Padwa": "gudi flag, neem and jaggery, rangoli, shrikhand-puri and Marathi New Year customs",
  "Rath Yatra": "Jagannath chariot devotion, mahaprasad, chariot decorations and Odisha traditions",
  "Jagannath Rath Yatra": "Jagannath chariot devotion, mahaprasad, chariot decorations and Odisha traditions",
  "Guru Nanak Jayanti": "Gurdwara visit, kirtan, langar, Prabhat Pheri and Sikh traditions",
  Christmas: "Christmas tree, crib, carols, fruit cake, midnight mass and community sharing",
};

const festivalRecipeCatalog: Record<string, string[]> = {
  Diwali: ["Kaju Katli", "Besan Laddu", "Chakli", "Shankarpali", "Poha Chivda"],
  Holi: ["Gujiya", "Thandai", "Dahi Vada", "Malpua", "Kanji Vada"],
  Pongal: ["Sakkarai Pongal", "Ven Pongal", "Medu Vada", "Avial", "Payasam"],
  "Krishna Janmashtami": ["Makhan Mishri", "Panakam", "Poha", "Dhaniya Panjiri", "Sabudana Khichdi"],
  "Ganesh Chaturthi": ["Ukadiche Modak", "Puran Poli", "Patoli", "Kothimbir Vadi", "Shrikhand"],
  Onam: ["Avial", "Parippu Curry", "Olan", "Paal Payasam", "Banana Chips"],
  Navratri: ["Sabudana Khichdi", "Kuttu Puri", "Singhare Halwa", "Aloo Jeera", "Makhana Kheer"],
  "Durga Puja": ["Khichuri Bhog", "Luchi", "Aloor Dum", "Payesh", "Begun Bhaja"],
  Dussehra: ["Puran Poli", "Chana Sundal", "Kheer", "Jalebi", "Poori Sabzi"],
  Eid: ["Mutton Biryani", "Sheer Khurma", "Samosa", "Shami Kebab", "Phirni"],
  "Eid-ul-Fitr": ["Chicken Biryani", "Sheer Khurma", "Haleem", "Samosa", "Fruit Custard"],
  "Eid-al-Adha": ["Mutton Biryani", "Korma", "Seekh Kebab", "Sheer Khurma", "Nihari"],
  "Makar Sankranti": ["Tilgul Ladoo", "Puran Poli", "Pongal", "Undhiyu", "Khichdi"],
  Lohri: ["Sarson Saag", "Makki Roti", "Gajak", "Rewri", "Pinni"],
  Ugadi: ["Ugadi Pachadi", "Obbattu", "Pulihora", "Mango Rice", "Payasam"],
  "Gudi Padwa": ["Shrikhand Puri", "Puran Poli", "Batata Bhaji", "Kothimbir Vadi", "Basundi"],
  "Rath Yatra": ["Mahaprasad Khichdi", "Dalma", "Khechudi", "Chhena Poda", "Pitha"],
  "Jagannath Rath Yatra": ["Mahaprasad Khichdi", "Dalma", "Khechudi", "Chhena Poda", "Pitha"],
  "Guru Nanak Jayanti": ["Karah Prasad", "Langar Dal", "Aloo Gobhi", "Kheer", "Puri Chole"],
  Christmas: ["Fruit Cake", "Plum Cake", "Roast Vegetables", "Christmas Pudding", "Ginger Cookies"],
};

function getFestivalFocus(festival: string) {
  return festivalFocus[festival] || `Use practices, foods, items, decorations and timings that are genuinely specific to ${festival}; do not substitute Diwali content.`;
}

const planSchema = {
  name: "festival_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "specialItems", "decorations", "shoppingList", "budget", "recipes", "rituals", "invitations", "timeline"],
    properties: {
      summary: { type: "string" },
      specialItems: { type: "array", items: { type: "string" } },
      decorations: { type: "array", items: { type: "string" } },
      shoppingList: { type: "array", items: { type: "object", additionalProperties: false, required: ["item", "category", "quantity", "estimatedPrice"], properties: { item: { type: "string" }, category: { type: "string" }, quantity: { type: "string" }, estimatedPrice: { type: "number" } } } },
      budget: { type: "array", items: { type: "object", additionalProperties: false, required: ["category", "amount", "percentage"], properties: { category: { type: "string" }, amount: { type: "number" }, percentage: { type: "number" } } } },
      recipes: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["name", "category", "cookTime", "ingredients", "steps", "servings", "description", "tips", "rating"], properties: { name: { type: "string" }, category: { type: "string", enum: ["Main Course", "Dessert", "Sweet", "Drink"] }, cookTime: { type: "string" }, ingredients: { type: "array", items: { type: "string" } }, steps: { type: "array", minItems: 1, items: { type: "string" } }, servings: { type: "number" }, description: { type: "string" }, tips: { type: "array", minItems: 1, items: { type: "string" } }, rating: { type: "number" } } } },
      rituals: { type: "array", items: { type: "object", additionalProperties: false, required: ["stepNumber", "title", "materials", "procedure", "purpose", "duration", "mantra"], properties: { stepNumber: { type: "number" }, title: { type: "string" }, materials: { type: "array", items: { type: "string" } }, procedure: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } }, purpose: { type: "string" }, duration: { type: "string" }, mantra: { type: ["string", "null"] } } } },
      invitations: { type: "array", items: { type: "object", additionalProperties: false, required: ["type", "title", "content"], properties: { type: { type: "string" }, title: { type: "string" }, content: { type: "string" } } } },
      timeline: { type: "array", items: { type: "object", additionalProperties: false, required: ["dayDate", "title", "description", "status"], properties: { dayDate: { type: "string" }, title: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["Completed", "In Progress", "Upcoming"] } } } },
    },
  },
} as const;

type GroqResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

export async function generateAndPersistFestivalPlan(input: FestivalPlanInput, userId?: number) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.35,
      max_tokens: 4500,
      response_format: { type: "json_schema", json_schema: planSchema },
      messages: [
        {
          role: "system",
          content: "You are UtsavMitra, an expert Indian festival planner. Return only valid JSON matching the provided schema. Every field must be specific to the requested festival and regional customs. Generate a genuine step-by-step ritual procedure: each step must explain what to do, how to do it, what materials are needed, and what comes next. Prioritize 2-5 unique physical actions per step over devotional text. Do not repeat the same mantra, slokam, prayer, or sentence across steps. Include a mantra only when specifically relevant; otherwise return mantra as null. Make recommendations practical, culturally respectful, family-friendly, and specific to the requested city, budget, family size, language, region, and festival. Follow the requested language instruction exactly and never mix writing systems.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Create a complete festival plan",
            ...input,
            festivalFocus: getFestivalFocus(input.festival),
            outputRequirements: `Return exactly five different recipes for this festival, using these festival-appropriate recipe names as inspiration: ${(festivalRecipeCatalog[input.festival] || []).join(", ")}. Assign exactly two recipes to category Main Course, one to Dessert, one to Sweet, and one to Drink. Use only those exact category values. Every recipe must include ingredients, complete preparation steps, servings, description, three recipe-specific tips, cooking time and rating. Return festival-specific specialItems, decorations, shoppingList, rituals, and timeline. Each ritual must include materials, 2-5 unique actionable procedure instructions, a purpose, duration, and mantra null unless genuinely required at that exact step. Never repeat a mantra or procedure between ritual steps. Never include image fields or image URLs.`,
            preferences: input.preferences.join(", "),
            languageInstruction: languageInstructions[input.language] || `Write all user-facing content in ${input.language}. Use one consistent script and do not mix languages.`,
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errorText.slice(0, 240)}`);
  }

  const payload = (await response.json()) as GroqResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Groq returned no structured plan content");
  const plan = JSON.parse(content) as GeneratedFestivalPlan;
  const seenMantras = new Set<string>();
  for (const ritual of plan.rituals) {
    const mantra = ritual.mantra?.trim().toLocaleLowerCase();
    if (!mantra || seenMantras.has(mantra)) ritual.mantra = null;
    else seenMantras.add(mantra);
  }
  const categoryCounts = plan.recipes.reduce<Record<string, number>>((counts, recipe) => { counts[recipe.category] = (counts[recipe.category] || 0) + 1; return counts; }, {});
  if (plan.recipes.length !== 5 || categoryCounts["Main Course"] !== 2 || categoryCounts.Dessert !== 1 || categoryCounts.Sweet !== 1 || categoryCounts.Drink !== 1) throw new Error("Groq returned a plan without the required recipe structure");

  const { createFestivalPlan } = await import("./db");
  const saved = await createFestivalPlan({
    userId: userId ?? null,
    festival: input.festival,
    city: input.city,
    familySize: input.familySize,
    budget: input.budget,
    language: input.language,
    preferences: JSON.stringify(input.preferences),
    planJson: JSON.stringify(plan),
  });

  return { id: saved?.id, input, plan };
}
