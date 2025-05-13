import express from 'express';
import { NutritionService } from './nutrition.service';

const router = express.Router();

router.get('/:userId/daily/:date', async (req, res) => {
  try {
    const data = await NutritionService.getDailyNutrition(
      req.params.userId, 
      req.params.date
    );
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export const nutritionRouter = router;