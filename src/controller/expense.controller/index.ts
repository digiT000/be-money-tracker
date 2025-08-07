import { Request } from '../../types/express';
import { Response } from 'express';
import { ExpenseService } from '../../service/expense.service';
import { ErrorHelper } from '../../lib/utils';
import {
  ExpenseCreateModel,
  SortExpense,
} from '../../interface/expense.interface';

export class ExpenseController {
  private expenseService = new ExpenseService();

  async createExpense(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { totalExpense, categoryId, description, ownerId } = req.body;
      const expenseData: ExpenseCreateModel = {
        categoryId,
        totalExpense,
        description,
        ownerId,
      };
      console.log('EMAIL', email);
      console.log({ expenseData });
      const expense = await this.expenseService.createExpense(
        expenseData,
        email
      );
      res.status(201).json({
        data: expense,
      });
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: error,
        });
      }
    }
  }

  async getExpense(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };

      const {
        sortBased,
        sortType,
        categoryId,
        ownerId,
        take,
        isFirst,
        cursor,
      } = req.query;
      const sort: SortExpense = {
        sortBased: (sortBased as 'amount' | 'date') || 'date',
        sortType: (sortType as 'asc' | 'desc') || 'desc',
      };
      const filter = {
        categoryId: (categoryId as string) || '',
        ownerId: (ownerId as string) || '',
      };
      const takeNumber = parseInt(take as string) || 10;
      const isFirstPage = isFirst === 'true' ? true : false;
      const currentCursor = cursor ? (cursor as string) : '';

      const expense = await this.expenseService.getExpense(
        email,
        filter,
        sort,
        takeNumber,
        currentCursor
      );
      res.status(200).json({
        expense,
      });
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: error,
        });
      }
    }
  }
  async deleteExpense(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { id } = req.params;
      const deletedExpense = await this.expenseService.deleteExpense(id, email);
      res.status(200).json(deletedExpense);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: error,
        });
      }
    }
  }

  async updateExpense(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { id } = req.params;
      const expenseData = req.body;
      const updatedExpense = await this.expenseService.updateExpense(
        email,
        id,
        expenseData
      );
      res.status(200).json(updatedExpense);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: error,
        });
      }
    }
  }
}
