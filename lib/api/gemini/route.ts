import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Validate API key
if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
  throw new Error("Google API key is missing. Please set NEXT_PUBLIC_GOOGLE_API_KEY in your environment.");
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

export async function POST(req: Request) {
  try {
    // Parse user input from request body
    const { ingredients, cuisine, dietary } = await req.json();

    // Validate input parameters
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ingredients must be a non-empty array." },
        { status: 400 }
      );
    }
    if (!cuisine || typeof cuisine !== "string") {
      return NextResponse.json(
        { success: false, error: "Cuisine must be a non-empty string." },
        { status: 400 }
      );
    }

    // Construct the prompt
    const sanitizedIngredients = ingredients.map((i) => i.replace(/[^a-zA-Z0-9, ]/g, ""));
    const sanitizedCuisine = cuisine.replace(/[^a-zA-Z0-9 ]/g, "");
    const sanitizedDietary = dietary ? dietary.replace(/[^a-zA-Z0-9 ]/g, "") : "None";

    const prompt = `
You are a helpful culinary assistant.

Using the following information:
- Ingredients: ${sanitizedIngredients.join(", ")}
- Cuisine preference: ${sanitizedCuisine}
- Dietary restrictions: ${sanitizedDietary}

Generate 3 detailed recipe suggestions. For each recipe, include:
1. Name
2. Preparation time
3. Cooking time
4. Ingredients list
5. Step-by-step instructions
6. Nutrition facts per serving (calories, protein, carbs, fat)
7. Serving size

Format the response as a valid JSON object using the following structure:

{
  "recipes": [
    {
      "name": "string",
      "prep_time": "string",
      "cook_time": "string",
      "ingredients": ["string", ...],
      "instructions": ["string", ...],
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      },
      "serving_size": "string"
    }
  ]
}

Only respond with valid JSON. Do not include any explanations, notes, or Markdown formatting.
`;

    // Use Gemini model to generate content
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Clean and parse the JSON response
    let recipes;
    try {
      const cleanedResponse = response.replace(/```json|```/g, "").trim();
      recipes = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      return NextResponse.json(
        { success: false, error: "Failed to parse recipe data from the AI response." },
        { status: 500 }
      );
    }

    // Validate the structure of the parsed response
    if (!recipes || !Array.isArray(recipes.recipes)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipe data format received from the AI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: recipes });
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recipes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}