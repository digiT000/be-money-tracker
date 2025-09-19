import { CategoriesController } from '../../controller/categories.controller';
import express from 'express';
import { TokenMiddleware } from '../../middleware/token.middleware';

const categoryController = new CategoriesController();
const tokenMiddleware = new TokenMiddleware();

const categoryRouter = express.Router();

categoryRouter.post(
  '/',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  categoryController.createCategories.bind(categoryController)
);

categoryRouter.get(
  '/',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  categoryController.getCategories.bind(categoryController)
);

export default categoryRouter;
