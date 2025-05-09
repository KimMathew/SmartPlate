import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Use server-side environment variables for API credentials
const createSupabaseClient = (authToken?: string, useServiceRole = false) => {
  // If service role is requested but not available, log a warning and use anon key instead
  if (useServiceRole && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Falling back to anon key. You should add this to your environment variables.");
    useServiceRole = false;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: authToken && !useServiceRole
          ? {
            Authorization: `Bearer ${authToken}`,
          }
          : {},
      },
      db: {
        schema: 'public',
      },
    }
  );
};

// Use the server-side API key for Gemini - this should be a secret environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!);

// Define types for the meal plan data structure
interface MealNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  vitamins?: string | null;
}

interface Meal {
  name: string;
  type?: string;
  description?: string;
  nutrition?: MealNutrition;
  ingredients?: string[];
  instructions?: string[];
  cuisine_type?: string;
  prepTime?: number;
  prep_time?: number;
  difficulty?: string;
  image_url?: string;
  source_url?: string;
}

// Utility function to check if a table exists
async function getTableNames(supabase: ReturnType<typeof createSupabaseClient>) {
  const { data, error } = await supabase
    .rpc('get_all_tables'); // This assumes you have RPC access, otherwise use a different method

  if (error) {
    console.error("Error fetching table names:", error);
    return [];
  }

  return data || [];
}

// Utility to find the best matching table name
function findBestMatchingTable(tables: string[], baseName: string) {
  const lowerBaseName = baseName.toLowerCase();

  // Try exact match first
  if (tables.includes(baseName)) {
    return baseName;
  }

  // Try with common variations
  const variations = [
    baseName,
    baseName.toLowerCase(),
    baseName.toUpperCase(),
    baseName.replace('_', ''),
    baseName.replace('_', '') + 's',
    baseName + 's',
    baseName.slice(0, -1) // Remove potential trailing 's'
  ];

  for (const variation of variations) {
    if (tables.includes(variation)) {
      return variation;
    }
  }

  // Try partial matches
  for (const table of tables) {
    if (table.toLowerCase().includes(lowerBaseName)) {
      return table;
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { userId, days } = await req.json();
    const cookieStore = await cookies();
    let supabaseAuthToken = cookieStore.get('sb-access-token')?.value;

    // Fallback: check Authorization header for Bearer token
    if (!supabaseAuthToken) {
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        supabaseAuthToken = authHeader.replace('Bearer ', '').trim();
      }
    }

    // Initialize Supabase client with auth token if available
    const supabase = createSupabaseClient(supabaseAuthToken);

    // Debugging: Log auth token and authenticated user
    console.log("Auth token:", supabaseAuthToken);
    const { data: userInfo, error: userInfoError } = await supabase.auth.getUser();
    console.log("Supabase auth user:", userInfo);
    if (userInfoError) {
      console.error("Error fetching authenticated user:", userInfoError);
    }

    // Debugging: Test select from meal_plan
    const { data: selectTestData, error: selectTestError } = await supabase.from('meal_plan').select('*').limit(1);
    console.log("Select test:", selectTestData, selectTestError);

    console.log("API request received for userId:", userId, "days:", days);

    // Verify API key is configured
    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
      console.error("Missing Google API key in environment variables");
      return NextResponse.json({
        success: false,
        error: "Server configuration error: Missing API key"
      }, { status: 500 });
    }

    if (!userId) {
      console.error("Missing userId in request");
      return NextResponse.json({
        success: false,
        error: "Missing userId in request"
      }, { status: 400 });
    }

    // Get all available tables
    console.log("Fetching database schema information...");
    // Try direct method first
    let allTables = [];
    try {
      // This is a simple query that works with public schema
      const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (!error && data) {
        allTables = data.map(t => t.tablename);
        console.log("Available tables:", allTables);
      } else {
        // Fall back to the custom function
        allTables = await getTableNames(supabase);
      }
    } catch (e) {
      console.warn("Couldn't query schema, using direct table access:", e);
      // We'll proceed with default table names
    }

    // Find the actual table names based on what exists in the database
    const mealPlanTable = findBestMatchingTable(allTables, 'meal_plan') || 'meal_plan';
    const recipesTable = findBestMatchingTable(allTables, 'recipe') || 'recipe';
    const nutritionTable = findBestMatchingTable(allTables, 'nutrition_info') || 'nutrition_info';

    console.log("Using tables:", {
      mealPlanTable,
      recipesTable,
      nutritionTable
    });

    // 1. Fetch user onboarding data
    console.log("Fetching user data for ID:", userId);
    const { data: users, error: userError } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId);

    // Check for errors in the query
    if (userError) {
      console.error("Database error when fetching user:", userError);
      return NextResponse.json({
        success: false,
        error: `Database error: ${userError.message}`
      }, { status: 500 });
    }

    // Check if any users were found
    if (!users || users.length === 0) {
      console.error("No user found with ID:", userId);
      return NextResponse.json({
        success: false,
        error: "User not found. Please complete onboarding first."
      }, { status: 404 });
    }

    const user = users[0];
    console.log("User found:", user.email || "unknown email");

    // 2. Create the prompt for meal plan generation
    const prompt = `
        Create a ${days}-day personalized meal plan based on the user's profile and preferences.

        ## User Profile:
        - Gender: ${user.gender || "unspecified"}, Age: ${user.age || "unspecified"}
        - Height: ${user.height || "unspecified"}cm, Weight: ${user.weight || "unspecified"}kg
        - Activity Level: ${user.activity_level || "moderate"}, Goal: ${user.goal_type || "balanced"} (Target: ${user.target_weight || "not specified"}kg)

        ## Preferences:
        - Diet: ${user.diet_type || "balanced"}, Meals/day: ${user.meals_per_day || 3}
        - Allergies: ${user.allergens?.join(", ") || "none"}, Dislikes: ${user.disliked_ingredients?.join(", ") || "none"}
        - Cuisines: ${user.preferred_cuisines?.join(", ") || "any"}
        - Prep Time Limit: ${user.prep_time_limit || "no limit"} mins, Budget: ${user.budget_preference || "moderate"}

        ## Nutrition Goals:
        - Calories/day: ${user.target_calories || "auto"}, Protein: ${user.protein_preference || "moderate"}, Carbs: ${user.carb_preference || "moderate"}, Fats: ${user.fat_preference || "moderate"}

        ## Output (JSON format):
        For each day:
        - Meal type (breakfast/lunch/dinner/snack)
        - Name, description, ingredients (with amounts), instructions (steps)
        - Nutrition: calories, protein, carbs, fats
        - Prep time, difficulty
        - Daily totals: calories, protein, carbs, fats

        ### Constraints:
        - Exclude allergens: ${user.allergens?.join(", ") || "none"}
        - Avoid disliked ingredients: ${user.disliked_ingredients?.join(", ") || "none"}
        - Prioritize cuisines: ${user.preferred_cuisines?.join(", ") || "any"}
        
        Format the JSON as follows:
        {
          "day1": {
            "meals": [
              {
                "type": "breakfast",
                "name": "Meal name",
                "description": "Description",
                "ingredients": ["ingredient 1", "ingredient 2"],
                "instructions": ["step 1", "step 2"],
                "nutrition": {
                  "calories": 300,
                  "protein": 20,
                  "carbs": 30,
                  "fats": 10
                },
                "prepTime": 15,
                "difficulty": "easy",
                "cuisine_type": "mediterranean"
              }
            ],
            "totals": {
              "calories": 2000,
              "protein": 100,
              "carbs": 200,
              "fats": 70
            }
          }
        }
        `;

    // 3. Generate meal plan with Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000000
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // 4. Clean and parse the JSON response
    let parsedResponse;
    try {
      console.log("Raw AI response (first 200 chars):", response.substring(0, 200) + "...");

      // Clean up the response to extract JSON
      let cleanedResponse = response.replace(/```json|```/g, '').trim();

      // Try to find JSON-like content by looking for opening brace if needed
      if (!response.includes('```json') && !response.includes('```')) {
        const startBrace = cleanedResponse.indexOf('{');
        const endBrace = cleanedResponse.lastIndexOf('}');

        if (startBrace !== -1 && endBrace !== -1 && startBrace < endBrace) {
          cleanedResponse = cleanedResponse.substring(startBrace, endBrace + 1);
          console.log("Extracted JSON content using brace detection");
        }
      }

      try {
        parsedResponse = JSON.parse(cleanedResponse);
        console.log("Successfully parsed JSON response");
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.log("Attempting to fix malformed JSON...");

        // Try to fix common JSON formatting issues
        cleanedResponse = cleanedResponse
          .replace(/(\w+):/g, '"$1":') // Put quotes around keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes

        try {
          parsedResponse = JSON.parse(cleanedResponse);
          console.log("Successfully parsed JSON after fixing format issues");
        } catch (retryError) {
          console.error("Still failed to parse JSON after fixes:", retryError);
          throw new Error("Could not parse AI response as valid JSON");
        }
      }

      console.log("Parsed response structure:",
        Object.keys(parsedResponse).length + " top-level keys:",
        Object.keys(parsedResponse)
      );
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return NextResponse.json({
        success: false,
        error: "We couldn't generate a proper meal plan format. Please try again.",
        details: process.env.NODE_ENV === 'development' ? String(parseError) : undefined
      }, { status: 500 });
    }

    if (!parsedResponse) {
      return NextResponse.json({
        success: false,
        error: "AI response could not be parsed into a valid meal plan format."
      }, { status: 500 });
    }

    // 5. Insert meal plan, nutrition, and recipe for each meal in each day
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const daysCovered = Object.keys(parsedResponse).length;
    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + daysCovered - 1);
    const endDate = endDateObj.toISOString().slice(0, 10);

    // Create a separate client with service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(undefined, true);

    let mealPlanIds: any[] = [];
    let failedMeals: any[] = [];
    for (const [dayKey, dayData] of Object.entries(parsedResponse)) {
      // Insert nutrition_info for the day
      let nutrition_id = null;
      if ((dayData as { totals?: { calories?: number } }).totals) {
        const nutritionPayload = {
          calories: (dayData as { totals?: { calories?: number } }).totals?.calories ?? 0,
          protein_g: (dayData as { totals?: { protein?: number } }).totals?.protein ?? 0,
          carbs_g: (dayData as { totals?: { carbs?: number } }).totals?.carbs ?? 0,
          fats_g: (dayData as { totals?: { fats?: number } }).totals?.fats ?? 0,
          vitamins: null // Not in JSON
        };

        // Use service role client to bypass RLS for nutrition_info
        const { data: nutrition, error: nutritionError } = await supabaseAdmin
          .from('nutrition_info')
          .insert(nutritionPayload)
          .select('nutrition_id')
          .single();

        if (nutritionError) {
          console.error('Error inserting nutrition_info:', nutritionError);
          return NextResponse.json({
            success: false,
            error: 'Failed to insert nutrition_info',
            details: nutritionError
          }, { status: 500 });
        } else {
          nutrition_id = nutrition?.nutrition_id;
          console.log('Inserted nutrition_info:', nutrition);
        }
      }

      // Insert each meal as a recipe and then meal_plan
      for (const meal of (dayData as { meals?: Meal[] }).meals || []) {
        // Skip if required fields are missing
        if (!meal.name || !meal.type) {
          failedMeals.push({ day: dayKey, reason: 'Missing name or type', meal });
          continue;
        }
        // Insert recipe
        const recipePayload = {
          title: meal.name,
          ingredients: meal.ingredients ? JSON.stringify(meal.ingredients) : '[]',
          instruction: meal.instructions ? JSON.stringify(meal.instructions) : '[]',
          cuisine_type: meal.cuisine_type || null,
          prep_time: meal.prepTime || meal.prep_time || null,
          image_url: null,
          source_url: null
        };
        const supabaseServiceRole = createSupabaseClient(undefined, true);
        const { data: recipe, error: recipeError } = await supabaseServiceRole
          .from('recipe')
          .insert(recipePayload)
          .select('recipe_id')
          .single();
        if (recipeError || !recipe?.recipe_id) {
          console.error('Error inserting recipe:', recipeError);
          return NextResponse.json({
            success: false,
            error: 'Failed to insert recipe',
            details: recipeError
          }, { status: 500 });
        }
        const recipe_id = recipe.recipe_id;
        console.log('Inserted recipe:', recipe);

        // Insert meal_plan row
        const mealPlanPayload = {
          user_id: userId,
          nutrition_id,
          recipe_id,
          plan_type: meal.type,
          plan_name: meal.name,
          description: meal.description || '',
          start_date: startDate,
          end_date: endDate,
          days_covered: daysCovered
        };

        // Use service role client to bypass RLS for meal_plan table too
        const { data: mealPlanData, error: mealPlanError } = await supabaseAdmin
          .from(mealPlanTable)
          .insert(mealPlanPayload)
          .select('plan_id')
          .single();

        if (mealPlanError) {
          console.error('Error inserting meal_plan:', mealPlanError);
          return NextResponse.json({
            success: false,
            error: 'Failed to insert meal_plan',
            details: mealPlanError
          }, { status: 500 });
        } else {
          mealPlanIds.push(mealPlanData?.plan_id);
          console.log('Inserted meal_plan:', mealPlanData);
        }
      }
    }

    // 6. Process each day's meals for frontend only - skip database inserts for now
    let formattedMealPlan = Object.entries(parsedResponse).map(([dayIndex, dayData]) => {
      if (!dayData) {
        return {
          day: `Day ${dayIndex.replace('day', '')}`,
          meals: []
        };
      }

      // Extract day number
      let dayNumber = 1;
      try {
        dayNumber = parseInt(dayIndex.replace(/\D/g, '')) || 1;
      } catch (e) {
        console.warn(`Couldn't parse day number from ${dayIndex}, using 1`);
      }

      // Get meals array, handling different possible structures
      let dailyMeals = [];

      if ((dayData as any).meals && Array.isArray((dayData as any).meals)) {
        dailyMeals = (dayData as any).meals;
      } else if (Array.isArray(dayData)) {
        dailyMeals = dayData;
      } else if (typeof dayData === 'object') {
        // Try to find meals in common property names
        const possibleMealsProps = ['breakfast', 'lunch', 'dinner', 'snacks', 'food', 'items'];

        for (const prop of possibleMealsProps) {
          if ((dayData as any)[prop]) {
            const propValue = (dayData as any)[prop];
            if (Array.isArray(propValue)) {
              dailyMeals = propValue.map(item => ({
                ...item,
                type: prop
              }));
              break;
            } else if (typeof propValue === 'object') {
              dailyMeals = [{ ...propValue, type: prop }];
              break;
            }
          }
        }

        if (dailyMeals.length === 0) {
          dailyMeals = [{ ...dayData, type: "meal" }];
        }
      }

      // Format day data for frontend only
      return {
        day: `Day ${dayNumber}`,
        meals: dailyMeals.map((meal: Meal) => ({
          type: meal.type || 'meal',
          name: meal.name || 'Unnamed meal',
          description: meal.description || '',
          calories: meal.nutrition?.calories || 0,
          protein: meal.nutrition?.protein || 0,
          carbs: meal.nutrition?.carbs || 0,
          fats: meal.nutrition?.fats || 0,
          ingredients: meal.ingredients || [],
          instructions: meal.instructions || [],
          prepTime: meal.prepTime || meal.prep_time || 0,
          difficulty: meal.difficulty || 'medium'
        }))
      };
    });

    // 7. Return success response with formatted meal plan
    return NextResponse.json({
      success: true,
      data: {
        message: "Meal plan created successfully",
        plan_id: mealPlanIds,
        meal_plan: {
          days: formattedMealPlan
        }
      }
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || "Failed to generate meal plan",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, {
      status: 500
    });
  }
}