interface Macronutrients {
    protein: number;
    fats: number;
    carbohydrates: number;
}

interface Meal {
    name: string;
    calories: number;
    macronutrients: Macronutrients;
    vitamins?: Record<string, string>;
    minerals?: Record<string, string>;
}

class NutritionTracker {
    private meals: Meal[] = [];
    
    addMeal(
        name: string,
        calories: number,
        protein: number,
        fats: number,
        carbs: number,
        vitamins?: Record<string, string>,
        minerals?: Record<string, string>
    ): Meal {
        const meal: Meal = {
            name,
            calories,
            macronutrients: {
                protein,
                fats,
                carbohydrates: carbs
            },
            vitamins,
            minerals
        };
        this.meals.push(meal);
        return meal;
    }
    
    getMealNutrition(mealName: string): Meal | undefined {
        return this.meals.find(meal => meal.name.toLowerCase() === mealName.toLowerCase());
    }
    
    displayMealNutrition(mealName: string): void {
        const meal = this.getMealNutrition(mealName);
        if (!meal) {
            console.log(`Meal '${mealName}' not found.`);
            return;
        }
            
        console.log(`\nNutritional Information for ${meal.name}:`);
        console.log(`Calories: ${meal.calories} kcal`);
        console.log("\nMacronutrients:");
        console.log(`  Protein: ${meal.macronutrients.protein}g`);
        console.log(`  Fats: ${meal.macronutrients.fats}g`);
        console.log(`  Carbohydrates: ${meal.macronutrients.carbohydrates}g`);
        
        if (meal.vitamins) {
            console.log("\nVitamins:");
            for (const [vitamin, amount] of Object.entries(meal.vitamins)) {
                console.log(`  ${vitamin}: ${amount}`);
            }
        }
                
        if (meal.minerals) {
            console.log("\nMinerals:");
            for (const [mineral, amount] of Object.entries(meal.minerals)) {
                console.log(`  ${mineral}: ${amount}`);
            }
        }
    }
}

// Example usage
const tracker = new NutritionTracker();
    
// Add some meals with nutritional data
tracker.addMeal(
    "Chicken Salad",
    350,
    30,
    12,
    20,
    {"Vitamin A": "15%", "Vitamin C": "45%"},
    {"Iron": "10%", "Calcium": "8%"}
);

tracker.addMeal(
    "Vegetable Stir Fry",
    280,
    8,
    10,
    35,
    {"Vitamin A": "60%", "Vitamin K": "120%"}
);

// Display nutrition for meals
tracker.displayMealNutrition("Chicken Salad");
tracker.displayMealNutrition("Vegetable Stir Fry");