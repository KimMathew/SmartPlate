import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";



// Use server-side environment variables for API credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use the server-side API key for Gemini - this should be a secret environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!);

// Define a type for the meal object
interface Meal {
  name: string;
  type?: string;
  description?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
    vitamins?: string | null;
  };
  ingredients?: string[];
  instructions?: string[];
  cuisine_type?: string;
  prepTime?: number;
  prep_time?: number;
  difficulty?: string;
  image_url?: string;
  source_url?: string;
}

export async function POST(req: Request) {
  let parsedResponse: any = null; // Declare parsedResponse at the function scope
  let mealPlanData: any = null;
  let formattedMealPlan: any = null;
  try {
    const { userId, days } = await req.json();

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

    // 1. Fetch user onboarding data with improved query handling and logging
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

    // Use the first user record if multiple were returned
    const user = users[0];
    console.log("User found:", user.email || "unknown email");

    // 2. Enhanced prompt with nutritional targets and structured output
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
        `;


    // 3. Run Gemini with better model configuration
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

    // 4. Clean and validate the response
    let parsedResponse;
    let formattedMealPlan = [];

    try {
      console.log("Raw AI response (first 200 chars):", response.substring(0, 200) + "...");

      // More robust JSON extraction
      let cleanedResponse = response.replace(/```json|```/g, '').trim();

      // Add fallback JSON detection if the AI didn't wrap with code blocks
      if (!response.includes('```json') && !response.includes('```')) {
        // Try to find JSON-like content by looking for opening brace
        const startBrace = cleanedResponse.indexOf('{');
        const endBrace = cleanedResponse.lastIndexOf('}');

        if (startBrace !== -1 && endBrace !== -1 && startBrace < endBrace) {
          cleanedResponse = cleanedResponse.substring(startBrace, endBrace + 1);
          console.log("Extracted JSON content using brace detection");
        }
      }

      console.log("Cleaned response (first 200 chars):", cleanedResponse.substring(0, 200) + "...");

      try {
        parsedResponse = JSON.parse(cleanedResponse);
        console.log("Successfully parsed JSON response");
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.log("Attempting to fix malformed JSON...");

        // Try to fix common JSON formatting issues (this is a simple approach)
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

      // Log the parsed structure to understand the format
      console.log("Parsed response structure:",
        Object.keys(parsedResponse).length + " top-level keys:",
        Object.keys(parsedResponse)
      );

    } catch (parseError) {
      console.error("Failed to parse or store Gemini response:", parseError);
      console.error("Error details:", parseError instanceof Error ? parseError.stack : String(parseError));

      // Instead of throwing, return a more user-friendly error
      return NextResponse.json({
        success: false,
        error: "We couldn't generate a proper meal plan format. Please try again.",
        details: process.env.NODE_ENV === 'development' ? parsedResponse : undefined
      }, { status: 500 });
    }

    // Log the parsed structure to understand the format
    console.log("Parsed response structure:",
      Object.keys(parsedResponse).length + " top-level keys:",
      Object.keys(parsedResponse)
    );

    // Adding detailed logging to debug the AI response parsing issue

    // Log the raw AI response for debugging
    console.log("Raw AI response:", response);

    // Log the cleaned response before parsing
    const cleanedResponse = response.replace(/```json|```/g, '').trim();
    console.log("Cleaned AI response:", cleanedResponse);

    // Log the parsed response structure if parsing succeeds
    if (parsedResponse) {
      console.log("Parsed AI response structure:", JSON.stringify(parsedResponse, null, 2));
    } else {
      console.warn("Parsed response is null or undefined.");
    }

    // Insert meal plan data into database using relational structure
    const now = new Date().toISOString();

    // Log the userId to ensure it is being passed correctly
    console.log("User ID for meal plan insertion:", userId);

    // Ensure the Supabase client is authenticated
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;
    if (session?.data?.session) {
      console.log("Authenticated user ID:", session.data.session.user.id);
    } else {
      console.warn("No authenticated session found.");
    }

    // 1. Create master meal plan record
    const { data, error: mealPlanError } = await supabase
      .from('meal_plan')
      .insert({
        user_id: userId,
        plan_name: `${days}-Day Meal Plan`,
        created_at: now,
        plan_type: user.diet_type || "balanced",
        days_covered: days
      })
      .select()
      .single();

    // Enhanced error logging for database operations
    if (mealPlanError) {
      console.error("Failed to create meal plan:", mealPlanError);
      return NextResponse.json({
        success: false,
        error: "Database error: Failed to store meal plan",
        details: {
          message: mealPlanError.message || "Unknown error",
          hint: mealPlanError.hint || "No hint provided",
          code: mealPlanError.code || "No code provided",
          details: mealPlanError.details || "No additional details"
        }
      }, { status: 500 });
    }

    // Store the meal plan data in our function scope variable
    mealPlanData = data;
    const mealPlanId = mealPlanData?.plan_id;

    if (!mealPlanId) {
      throw new Error("Failed to get meal plan ID after database insert");
    }

    console.log("Created meal plan with ID:", mealPlanId);

    // Process each day's meals and create a frontend-friendly format simultaneously
    formattedMealPlan = Object.entries(parsedResponse).map(([dayIndex, dayData]) => {
      if (!dayData) {
        console.warn(`Day data is null or undefined for ${dayIndex}`);
        return {
          day: `Day ${dayIndex.replace('day', '')}`,
          meals: []
        };
      }

      console.log(`Processing day: ${dayIndex}, data type: ${typeof dayData}`);

      let dayNumber = 1;
      try {
        dayNumber = parseInt(dayIndex.replace(/\D/g, '')) || 1;
      } catch (e) {
        console.warn(`Couldn't parse day number from ${dayIndex}, using 1`);
      }

      // Check if dayData has the expected structure
      if (!(dayData as any).meals) {
        console.warn(`No meals array found for ${dayIndex}, data:`, dayData);

        // Try to adapt to different possible AI response formats
        let dailyMeals = [];

        if (Array.isArray(dayData)) {
          // If the day itself is an array of meals
          dailyMeals = dayData;
          console.log(`Adapted: day data is directly an array of ${dailyMeals.length} meals`);
        } else if (typeof dayData === 'object') {
          // If meals are using a different property name or structure
          const possibleMealsProps = ['breakfast', 'lunch', 'dinner', 'snacks', 'food', 'items'];

          for (const prop of possibleMealsProps) {
            if ((dayData as any)[prop]) {
              const propValue = (dayData as any)[prop];
              if (Array.isArray(propValue)) {
                dailyMeals = propValue.map(item => ({
                  ...item,
                  type: prop // Use the property name as the meal type
                }));
                console.log(`Adapted: found meals in "${prop}" property`);
                break;
              } else if (typeof propValue === 'object') {
                // Single meal object
                dailyMeals = [{ ...propValue, type: prop }];
                console.log(`Adapted: found single meal in "${prop}"`);
                break;
              }
            }
          }

          if (dailyMeals.length === 0) {
            // As last resort, assume the object itself represents one meal
            dailyMeals = [{ ...dayData, type: "meal" }];
            console.log("Adapted: treating object as single meal");
          }
        }

        // Format day data for frontend
        const dayPlan = {
          day: `Day ${dayNumber}`,
          meals: dailyMeals.map((meal: Meal) => ({
            type: meal.type || 'meal',
            name: meal.name || 'Unnamed meal',
            description: meal.description || '',
            calories: meal.nutrition?.calories || 0,
            protein: meal.nutrition?.protein || 0
          }))
        };

        // Skip database storage for now in this error recovery path
        return dayPlan;
      }

      const dailyMeals = Array.isArray((dayData as any).meals) ? (dayData as any).meals : [];
      console.log(`Day ${dayNumber} has ${dailyMeals.length} meals`);

      // Format day data for frontend
      const dayPlan = {
        day: `Day ${dayNumber}`,
        meals: dailyMeals.map((meal: Meal) => ({
          type: meal.type || 'meal',
          name: meal.name || 'Unnamed meal',
          description: meal.description || '',
          calories: meal.nutrition?.calories || 0,
          protein: meal.nutrition?.protein || 0
        }))
      };

      // Process each meal for database storage
      dailyMeals.forEach(async (meal: Meal) => {
        try {
          // Validate required fields
          if (!meal.name) {
            console.warn("Meal missing name, skipping database insert");
            return;
          }

          // Create recipe record for each meal
          const { data: recipeData, error: recipeError } = await supabase
            .from('recipe')
            .insert({
              recipe_id: undefined, // Let the database generate the ID
              plan_id: mealPlanId,
              recipe_name: meal.name,
              description: meal.description || '',
              ingredients: meal.ingredients || [],
              instructions: Array.isArray(meal.instructions) ? meal.instructions : [],
              cuisine_type: meal.cuisine_type || null,
              prep_time: meal.prepTime || meal.prep_time || null,
              difficulty: meal.difficulty || 'medium',
              image_url: meal.image_url || null,
              source_url: meal.source_url || null,
              created_at: now,
              day_number: dayNumber,
              meal_type: meal.type || 'meal'
            })
            .select()
            .single();

          if (recipeError) {
            console.error(`Failed to create recipe for ${meal.name}:`, recipeError);
            return;
          }

          // Create nutrition record for this recipe
          if (meal.nutrition) {
            const { error: nutritionError } = await supabase
              .from('nutrition_info')
              .insert({
                nutrition_id: undefined, // Let the database generate the ID
                recipe_id: recipeData.recipe_id,
                calories: meal.nutrition.calories || 0,
                protein_g: meal.nutrition.protein || 0,
                carbs_g: meal.nutrition.carbs || 0,
                fats_g: meal.nutrition.fats || 0,
                fiber_g: meal.nutrition.fiber || 0,
                vitamins: meal.nutrition.vitamins || null
              });

            if (nutritionError) {
              console.error(`Failed to create nutrition info for ${meal.name}:`, nutritionError);
            }
          }
        } catch (err) {
          console.error(`Error processing meal ${meal?.name || 'unknown'}:`, err);
        }
      });

      return dayPlan;
    });

    // Log the formatted meal plan for frontend
    if (formattedMealPlan.length > 0) {
      console.log("Formatted meal plan for frontend:", JSON.stringify(formattedMealPlan, null, 2));
    } else {
      console.warn("Formatted meal plan is empty.");
    }

    console.log(`Formatted ${formattedMealPlan.length} days for frontend`);

  } catch (parseError) {
    console.error("Failed to parse or store Gemini response:", parseError);
    console.error("Error details:", parseError instanceof Error ? parseError.stack : String(parseError));

    // Instead of throwing, return a more user-friendly error
    return NextResponse.json({
      success: false,
      error: "We couldn't generate a proper meal plan format. Please try again.",
      details: process.env.NODE_ENV === 'development' ? Response : undefined
    }, { status: 500 });
  }

  if (!parsedResponse) {
    console.error("Parsed response is null or undefined.");
    return NextResponse.json({
      success: false,
      error: "AI response could not be parsed into a valid meal plan format.",
      details: process.env.NODE_ENV === 'development' ? Response : undefined
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      message: "Meal plan created successfully",
      plan_id: mealPlanData ? mealPlanData.plan_id : null,
      meal_plan: {
        days: formattedMealPlan
      }
    }
  });

  try {
    // Your preceding code here
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