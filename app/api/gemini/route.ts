import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Helper: Generate the meal plan prompt
interface UserPreferences {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: string;
  goal_type?: string;
  target_weight?: number;
  diet_type?: string;
  meals_per_day?: number;
  allergens?: string[];
  disliked_ingredients?: string[];
  preferred_cuisines?: string[];
  prep_time_limit?: number;
  budget_preference?: string;
  target_calories?: number;
  protein_preference?: string;
  carb_preference?: string;
  fat_preference?: string;
}

function buildMealPlanPrompt({ days = 3, user = {} as UserPreferences, search = "" }) {
  // Add user preferences and search query to the prompt if available
  return `
    Recommend 6 recipes in JSON format. Each recipe should have:
    - name, description, ingredients (with amounts), instructions (steps)
    - nutrition: calories, protein, carbs, fats
    - prepTime, difficulty, cuisine_type
    User preferences:
    - Gender: ${user.gender || "unspecified"}, Age: ${user.age || "unspecified"}
    - Height: ${user.height || "unspecified"}cm, Weight: ${user.weight || "unspecified"}kg
    - Activity Level: ${user.activity_level || "moderate"}, Goal: ${user.goal_type || "balanced"} (Target: ${user.target_weight || "not specified"}kg)
    - Diet: ${user.diet_type || "balanced"}, Meals/day: ${user.meals_per_day || 3}
    - Allergies: ${user.allergens?.join(", ") || "none"}, Dislikes: ${user.disliked_ingredients?.join(", ") || "none"}
    - Cuisines: ${user.preferred_cuisines?.join(", ") || "any"}
    - Prep Time Limit: ${user.prep_time_limit || "no limit"} mins, Budget: ${user.budget_preference || "moderate"}
    - Calories/day: ${user.target_calories || "auto"}, Protein: ${user.protein_preference || "moderate"}, Carbs: ${user.carb_preference || "moderate"}, Fats: ${user.fat_preference || "moderate"}
    ${search ? `The recipes MUST be about: ${search}. Only return recipes that match this search.` : ""}
    Output JSON only, no markdown or explanation.
    Example:
    [
      {
        "name": "Oatmeal Bowl",
        "description": "A healthy oatmeal breakfast...",
        "ingredients": ["1 cup oats", "1 banana", "1 tbsp honey"],
        "instructions": ["Cook oats", "Add banana", "Drizzle honey"],
        "nutrition": { "calories": 300, "protein": 8, "carbs": 50, "fats": 5 },
        "prepTime": 10,
        "difficulty": "easy",
        "cuisine_type": "american"
      },
      // ...5 more recipes
    ]
    `;
}

// Helper: Generate the recipe search prompt
function buildRecipeSearchPrompt({ ingredients = [], prepTime = '', cuisine = '', user = {} as UserPreferences }) {
  // Compose constraints for Gemini
  let constraints = [];
  if (ingredients.length > 0) constraints.push(`ONLY use these ingredients: ${ingredients.join(", ")}`);
  if (prepTime) constraints.push(`Prep time must be under ${prepTime} minutes`);
  if (cuisine) constraints.push(`Cuisine type must be: ${cuisine}`);

  return `
    Recommend 6 recipes in JSON format. Each recipe should have:
    - name, description, ingredients (with amounts), instructions (steps)
    - nutrition: calories, protein, carbs, fats
    - prepTime, difficulty, cuisine_type
    User preferences:
    - Gender: ${user.gender || "unspecified"}, Age: ${user.age || "unspecified"}
    - Height: ${user.height || "unspecified"}cm, Weight: ${user.weight || "unspecified"}kg
    - Activity Level: ${user.activity_level || "moderate"}, Goal: ${user.goal_type || "balanced"} (Target: ${user.target_weight || "not specified"}kg)
    - Diet: ${user.diet_type || "balanced"}, Meals/day: ${user.meals_per_day || 3}
    - Allergies: ${user.allergens?.join(", ") || "none"}, Dislikes: ${user.disliked_ingredients?.join(", ") || "none"}
    - Cuisines: ${user.preferred_cuisines?.join(", ") || "any"}
    - Prep Time Limit: ${user.prep_time_limit || "no limit"} mins, Budget: ${user.budget_preference || "moderate"}
    - Calories/day: ${user.target_calories || "auto"}, Protein: ${user.protein_preference || "moderate"}, Carbs: ${user.carb_preference || "moderate"}, Fats: ${user.fat_preference || "moderate"}
    ${constraints.length > 0 ? `STRICTLY enforce these constraints: ${constraints.join('; ')}` : ''}
    Output JSON only, no markdown or explanation.
    Example:
    [
      {
        "name": "Oatmeal Bowl",
        "description": "A healthy oatmeal breakfast...",
        "ingredients": ["1 cup oats", "1 banana", "1 tbsp honey"],
        "instructions": ["Cook oats", "Add banana", "Drizzle honey"],
        "nutrition": { "calories": 300, "protein": 8, "carbs": 50, "fats": 5 },
        "prepTime": 10,
        "difficulty": "easy",
        "cuisine_type": "american"
      },
      // ...5 more recipes
    ]
    `;
}

// Helper: Clean and parse Gemini's response
function cleanAndParseGeminiResponse(responseText: string) {
  let cleaned = responseText.trim();
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/```json|```/g, "").trim();

  // Find the first [ or { and last ] or }
  const firstArray = cleaned.indexOf("[");
  const firstObj = cleaned.indexOf("{");
  const lastArray = cleaned.lastIndexOf("]");
  const lastObj = cleaned.lastIndexOf("}");

  let jsonCandidate = cleaned;
  if (firstArray !== -1 && (firstArray < firstObj || firstObj === -1) && lastArray !== -1) {
    // Looks like an array
    jsonCandidate = cleaned.substring(firstArray, lastArray + 1);
  } else if (firstObj !== -1 && lastObj !== -1) {
    // Looks like an object
    jsonCandidate = cleaned.substring(firstObj, lastObj + 1);
  }

  // Remove trailing commas before ] or }
  jsonCandidate = jsonCandidate.replace(/,\s*([}\]])/g, '$1');
  // Replace single quotes with double quotes
  jsonCandidate = jsonCandidate.replace(/'/g, '"');

  try {
    return JSON.parse(jsonCandidate);
  } catch (e) {
    // As a last resort, try to fix unquoted keys (not common in Gemini, but just in case)
    jsonCandidate = jsonCandidate.replace(/(\w+)\s*:/g, '"$1":');
    return JSON.parse(jsonCandidate);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients = [], prepTime = '', cuisine = '', userId } = await req.json();
    // Fetch user preferences from Supabase Users table if userId is provided
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let user: UserPreferences = {};
    if (userId) {
      const { data, error } = await supabase.from("Users").select("*").eq("id", userId).single();
      if (!error && data) {
        user = data;
      }
    }
    const prompt = buildRecipeSearchPrompt({ ingredients, prepTime, cuisine, user });
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    let mealPlan;
    try {
      mealPlan = cleanAndParseGeminiResponse(text);
      console.log('Parsed Gemini recipe JSON:', mealPlan);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Failed to parse AI response", details: String(e), raw: text }, { status: 500 });
    }
    return NextResponse.json({ success: true, mealPlan });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
