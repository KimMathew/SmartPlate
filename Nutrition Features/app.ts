import express from 'express';
import cors from 'cors';
import { nutritionRouter } from './features/nutrition/nutrition.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/nutrition', nutritionRouter);

export default app;