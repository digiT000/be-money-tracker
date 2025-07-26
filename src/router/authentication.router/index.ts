import express from 'express';
import { AuthenticationController } from '../../controller/authentication.controller/index';
import { registrationChecking } from '../../middleware/auth.middleware';

const authController = new AuthenticationController();

const authRouter = express.Router();

authRouter.post(
  '/register-user',
  registrationChecking,
  authController.register.bind(authController)
);
authRouter.put(
  '/verify-email',
  authController.verifyEmail.bind(authController)
);
authRouter.post('/login', authController.login.bind(authController));

export default authRouter;
