import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import MealLogRow from "./MealLogRow";

interface FoodItem {
  name: string;
  quantity?: string;
  calories?: number;
}

interface MealLogCardProps {
  recentMeals: any[];
}

const MealLogCard: React.FC<MealLogCardProps> = ({ recentMeals }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-xl">Meal Log</CardTitle>
        <CardDescription>
          View your meal history and nutritional records.
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-2 pt-2">
      {recentMeals.length === 0 ? (
        <div className="text-gray-500">No recent meals found.</div>
      ) : (
        recentMeals.map((meal, idx) => (
          <MealLogRow
            key={meal.id || meal.meal_id || idx}
            name={meal.item || meal.meal_type || meal.name || "Meal"}
            time={meal.meal_time || meal.time || ""}
            calories={meal.calories}
            carbs={meal.carbs}
            protein={meal.protein}
            fat={meal.fat}
            foodItems={[
              {
                name: meal.meal_name || meal.item || meal.plan_name || meal.name || meal.meal_type || "Meal",
                quantity: meal.quantity || "1 serving",
                calories: meal.calories
              }
            ]}
          />
        ))
      )}
    </CardContent>
  </Card>
);

export default MealLogCard;
