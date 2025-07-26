import prisma from '../../lib/prisma';
import { ErrorHelper } from '../../lib/utils';
import { AuthenticationService } from '../authentication.service';

export class CategoriesService {
  private authenticationService = new AuthenticationService();

  async createCategories(email: string, name: string, budgetCategory: number) {
    const user = await this.authenticationService.checkUserExists(email);

    if (!user) {
      throw new ErrorHelper('User does not exist', 400);
    }

    const createCategory = await prisma.categoryExpense.create({
      data: {
        name: name,
        budgetCategory: budgetCategory,
        userId: user.id,
      },
    });

    return {
      id: createCategory.id,
      name: createCategory.name,
      budgetCategory: createCategory.budgetCategory,
    };
  }
}
