import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma';
import { AuthenticationService } from '../authentication.service';
import { ErrorHelper } from '../../lib/utils';
import { useAmp } from 'next/amp';
import {
  ExpenseCreateModel,
  FilterExpense,
  SortExpense,
  UpdateExpenseModel,
} from '../../interface/expense.interface';

export class ExpenseService {
  private authenticationService = new AuthenticationService();

  async createExpense(expenseData: ExpenseCreateModel, email: string) {
    try {
      const checkUser = await this.authenticationService.checkUserExists(email);
      if (!checkUser) {
        throw new ErrorHelper('', 'User does not exist', 401);
      }

      // Create Expense
      const createExpense = await prisma.expense.create({
        data: {
          amount: expenseData.totalExpense,
          categoryId: expenseData.categoryId,
          description: expenseData.description,
          userId: checkUser.id,
          ownerId: expenseData.ownerId,
        },
        include: {
          ownerExpense: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return {
        id: createExpense.id,
        amount: createExpense.amount,
        categoryId: createExpense.categoryId,
        description: createExpense.description,
        owner: {
          id: createExpense.ownerExpense.id,
          name: createExpense.ownerExpense.name,
        },
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ErrorHelper('', `Expense not created :${error.message}`, 400);
      } else if (error instanceof ErrorHelper) {
        throw error;
      }
    }
  }

  async getExpense(
    email: string,
    filter: FilterExpense,
    sort: SortExpense,
    take: number = 10,
    currentCursor?: string
  ) {
    try {
      const checkUser = await this.authenticationService.checkUserExists(email);
      if (!checkUser) {
        throw new ErrorHelper('', 'User does not exist', 401);
      }

      const whereConditions: FilterExpense = {};

      if (filter.categoryId) {
        whereConditions.categoryId = filter.categoryId;
      }
      if (filter.ownerId) {
        whereConditions.ownerId = filter.ownerId;
      }

      const sortCondition: SortExpense = {
        sortBased: sort.sortBased || 'date',
        sortType: sort.sortType || 'desc',
      };

      const expenses = await prisma.expense.findMany({
        take,
        skip: currentCursor ? 1 : 0, // Skip the cursor if provided
        where: {
          userId: checkUser.id,
          ...whereConditions,
        },
        cursor: currentCursor ? { id: currentCursor } : undefined,
        orderBy: {
          [sortCondition.sortBased]: sortCondition.sortType,
        },
        select: {
          id: true,
          amount: true,
          description: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          ownerExpense: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // ✅ Gracefully handle cases with no results
      let nextCursor: string | null = null;
      if (expenses.length > 0) {
        const lastPostInResults = expenses[expenses.length - 1];
        nextCursor = lastPostInResults.id;
      }

      return { data: expenses || [], nextCursor };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ErrorHelper(
          '',
          `Error fetching expenses: ${error.message}`,
          400
        );
      } else if (error instanceof ErrorHelper) {
        throw error;
      }
      throw new ErrorHelper('', 'An unexpected error occurred', 500);
    }
  }

  async deleteExpense(expenseId: string, email: string) {
    try {
      const checkUser = await this.authenticationService.checkUserExists(email);
      if (!checkUser) {
        throw new ErrorHelper('', 'User does not exist', 401);
      }

      // Check if the expense exists and belongs to the user
      const expense = await prisma.expense.findUnique({
        where: {
          id: expenseId,
          userId: checkUser.id,
        },
      });

      if (!expense) {
        throw new ErrorHelper(
          '',
          'Expense not found or does not belong to user',
          404
        );
      }

      // Delete the expense
      await prisma.expense.delete({
        where: {
          id: expenseId,
        },
      });

      return { message: 'Expense deleted successfully' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ErrorHelper(
          '',
          `Error deleting expense: ${error.message}`,
          400
        );
      } else if (error instanceof ErrorHelper) {
        throw error;
      }
    }
  }

  async updateExpense(
    email: string,
    expenseId: string,
    expenseData: UpdateExpenseModel
  ) {
    try {
      const checkUser = await this.authenticationService.checkUserExists(email);
      if (!checkUser) {
        throw new ErrorHelper('', 'User does not exist', 401);
      }
      // Check if the expense exists and belongs to the user
      const expense = await prisma.expense.findUnique({
        where: {
          id: expenseId,
          userId: checkUser.id,
        },
      });
      if (!expense) {
        throw new ErrorHelper(
          '',
          'Expense not found or does not belong to user',
          404
        );
      }
      // Update the expense
      let updatedData = {};
      if (expenseData.totalExpense) {
        updatedData = {
          ...updatedData,
          amount: expenseData.totalExpense,
        };
      }

      const updatedExpense = await prisma.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          ...updatedData,
        },
        select: {
          id: true,
          amount: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          ownerExpense: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedExpense;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ErrorHelper(
          '',
          `Error deleting expense: ${error.message}`,
          400
        );
      } else if (error instanceof ErrorHelper) {
        throw error;
      }
    }
  }
}
