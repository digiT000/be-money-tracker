import { capitalizeFirstLetter } from '../../lib/capitilizeFIrstLetter';
import prisma from '../../lib/prisma';
import { ErrorHelper } from '../../lib/utils';
import { AuthenticationService } from '../authentication.service';

export class CategoriesService {
  private authenticationService = new AuthenticationService();

  async createCategories(email: string, name: string, budgetCategory: number) {
    const user = await this.authenticationService.checkUserExists(email);

    if (!user) {
      throw new ErrorHelper('', 'User does not exist', 400);
    }

    const createCategory = await prisma.categoryExpense.create({
      data: {
        name: capitalizeFirstLetter(name),
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

  async getCategories(email: string) {
    const user = await this.authenticationService.checkUserExists(email);

    if (!user) {
      throw new ErrorHelper('', 'User does not exist', 400);
    }

    const categories = await prisma.categoryExpense.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        budgetCategory: true,
      },
    });

    return categories;
  }
}
