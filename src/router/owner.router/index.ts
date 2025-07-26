import express from 'express';
import { OwnerController } from '../../controller/owner.controller';
import { TokenMiddleware } from '../../middleware/token.middleware';

const ownerRouter = express.Router();
const ownerController = new OwnerController();
const tokenMiddleware = new TokenMiddleware();

// Route to create an owner
ownerRouter.post(
  '/',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  ownerController.createOwner.bind(ownerController)
);

ownerRouter.put(
  '/:ownerId',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  ownerController.updateOwner.bind(ownerController)
);

export default ownerRouter;
