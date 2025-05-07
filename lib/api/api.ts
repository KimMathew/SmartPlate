interface RecipeResponse {
    data: {
      recipes: any[]; // Replace `any` with the actual recipe type
    };
    error?: string;
  }
  
  export async function fetchRecipes({
    ingredients,
    cuisine,
    dietary,
  }: {
    ingredients: string[];
    cuisine: string;
    dietary?: string;
  }) {
    // Validate input parameters
    if (!ingredients || ingredients.length === 0) {
      throw new Error("Ingredients cannot be empty");
    }
    if (!cuisine) {
      throw new Error("Cuisine is required");
    }
  
    try {
      // Construct the request body, excluding undefined fields
      const body = { ingredients, cuisine, ...(dietary && { dietary }) };
  
      const res = await fetch("/api/generate-recipes", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Handle non-OK responses
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          throw new Error("Failed to fetch recipes and could not parse error response");
        }
        throw new Error(errorData.error || "Failed to fetch recipes");
      }
  
      // Parse and return the response
      let data: RecipeResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error("Failed to parse response JSON");
      }
  
      return data.data.recipes;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  }