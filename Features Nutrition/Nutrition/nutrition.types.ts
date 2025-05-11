export interface DailyNutritionResponse {
  date: string;
  totalCalories: number;
  calorieGoal: number;
  macros: {
    carbs: { consumed: number; goal: number };
    protein: { consumed: number; goal: number };
    fat: { consumed: number; goal: number };
  };
  meals: Meal[];
}

interface Meal {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}