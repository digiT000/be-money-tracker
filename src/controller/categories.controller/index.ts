import { Request } from '../../types/express';
import { Response } from 'express';
import { CategoriesService } from '../../service/categories.service';
import { ErrorHelper } from '../../lib/utils';

export class CategoriesController {
  private categoriesService = new CategoriesService();

  async createCategories(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { name, budgetCategory } = req.body;
      const categories = await this.categoriesService.createCategories(
        email,
        name,
        budgetCategory
      );
      res.status(201).json(categories);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({ error: error.message });
      }
    }
  }
}
