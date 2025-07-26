import express, { Application, Request, Response, NextFunction } from 'express';
import expenseRouter from './router/expense.router';
import authRouter from './router/authentication.router';
import categoryRouter from './router/categories.router';
import ownerRouter from './router/owner.router';

const API_URL = process.env.API_URL;
const app: Application = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.use(`${API_URL}/expenses`, expenseRouter);
app.use(`${API_URL}/auth`, authRouter);
app.use(`${API_URL}/categories`, categoryRouter);
app.use(`${API_URL}/owner`, ownerRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World from Express with TypeScript!');
});

export default app;
