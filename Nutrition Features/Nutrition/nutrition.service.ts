import { NutritionModel } from './nutrition.model';
import { DailyNutritionResponse } from './nutrition.types';

export class NutritionService {
  static async getDailyNutrition(userId: string, date: string): Promise<DailyNutritionResponse> {
    const data = await NutritionModel.findOne({ userId, date: new Date(date) });
    
    if (!data) throw new Error('No data found');
    
    return {
      date: data.date.toISOString(),
      totalCalories: data.meals.reduce((sum, meal) => sum + meal.calories, 0),
      calorieGoal: 2000, // Default goal
      macros: {
        carbs: { 
          consumed: data.meals.reduce((sum, meal) => sum + meal.carbs, 0), 
          goal: 225 
        },
        protein: { 
          consumed: data.meals.reduce((sum, meal) => sum + meal.protein, 0), 
          goal: 90 
        },
        fat: { 
          consumed: data.meals.reduce((sum, meal) => sum + meal.fat, 0), 
          goal: 60 
        }
      },
      meals: data.meals
    };
  }
}