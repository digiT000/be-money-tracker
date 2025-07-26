import express from 'express';
import { ExpenseController } from '../../controller/expense.controller/index';
import { TokenMiddleware } from '../../middleware/token.middleware';

const expenseController = new ExpenseController();
const tokenMiddleware = new TokenMiddleware();
const expenseRouter = express.Router();

expenseRouter.post(
  '/',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  expenseController.createExpense.bind(expenseController)
);

expenseRouter.get(
  '/',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  expenseController.getExpense.bind(expenseController)
);
expenseRouter.patch(
  '/:id',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  expenseController.updateExpense.bind(expenseController)
);
expenseRouter.delete(
  '/:id',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  expenseController.deleteExpense.bind(expenseController)
);

export default expenseRouter;
