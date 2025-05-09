import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import MealLogRow from "./MealLogRow";

// Example meal log data with food items for each meal
const mealLogData = [
  {
    name: "Breakfast",
    time: "08:00",
    calories: 450,
    carbs: 60,
    protein: 30,
    fat: 15,
    foodItems: [
      { name: "Oatmeal with Berries", quantity: "1 bowl", calories: 280 },
      { name: "Greek Yogurt", quantity: "1 cup", calories: 170 },
    ],
  },
  {
    name: "Lunch",
    time: "12:30",
    calories: 650,
    carbs: 80,
    protein: 45,
    fat: 20,
    foodItems: [
      { name: "Grilled Chicken", quantity: "1 breast", calories: 300 },
      { name: "Brown Rice", quantity: "1 cup", calories: 200 },
      { name: "Steamed Broccoli", quantity: "1 cup", calories: 50 },
    ],
  },
  {
    name: "Snack",
    time: "16:00",
    calories: 200,
    carbs: 25,
    protein: 15,
    fat: 8,
    foodItems: [{ name: "Protein Bar", quantity: "1 bar", calories: 200 }],
  },
  {
    name: "Dinner",
    time: "19:00",
    calories: 150,
    carbs: 15,
    protein: 35,
    fat: 2,
    foodItems: [{ name: "Salmon", quantity: "1 fillet", calories: 150 }],
  },
];

const MealLogCard: React.FC = () => (
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
      {mealLogData.map((meal) => (
        <MealLogRow
          key={meal.name}
          name={meal.name}
          time={meal.time}
          calories={meal.calories}
          carbs={meal.carbs}
          protein={meal.protein}
          fat={meal.fat}
          foodItems={meal.foodItems}
        />
      ))}
    </CardContent>
  </Card>
);

export default MealLogCard;
