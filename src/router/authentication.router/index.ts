import express from 'express';
import { AuthenticationController } from '../../controller/authentication.controller/index';
import {
  onboardingMiddleware,
  registrationChecking,
} from '../../middleware/auth.middleware';
import { TokenMiddleware } from '../../middleware/token.middleware';

const authController = new AuthenticationController();
const tokenMiddleware = new TokenMiddleware();

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

authRouter.post(
  '/get-session',
  authController.generateAccesToken.bind(authController)
);

authRouter.get(
  '/validate-user',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  authController.validateUser.bind(authController)
);

authRouter.post(
  '/onboarding-submission',
  tokenMiddleware.tokenValidation.bind(tokenMiddleware),
  onboardingMiddleware,
  authController.onboardingSubmission.bind(authController)
);

authRouter.post('/logout', authController.logout.bind(authController));

export default authRouter;
