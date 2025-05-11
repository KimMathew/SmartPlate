import { Schema, model, Document } from 'mongoose';

interface INutrition extends Document {
  userId: string;
  date: Date;
  meals: {
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }[];
}

const schema = new Schema<INutrition>({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  meals: [{
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    carbs: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true }
  }]
});

export const NutritionModel = model<INutrition>('Nutrition', schema);