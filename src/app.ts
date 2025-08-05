import express, { Application, Request, Response, NextFunction } from 'express';
import expenseRouter from './router/expense.router';
import authRouter from './router/authentication.router';
import categoryRouter from './router/categories.router';
import ownerRouter from './router/owner.router';
import cookieParser from 'cookie-parser'; // 👈 Import

import cors from 'cors';

const API_URL = process.env.API_URL;
const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials
  })
);
app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON bodies

app.use(`${API_URL}/expenses`, expenseRouter);
app.use(`${API_URL}/auth`, authRouter);
app.use(`${API_URL}/categories`, categoryRouter);
app.use(`${API_URL}/owner`, ownerRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World from Express with TypeScript!');
});

export default app;
