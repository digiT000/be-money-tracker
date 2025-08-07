import { Request } from '../../types/express';
import { Response } from 'express';
import {
  AuthenticationService,
  UserModel,
} from '../../service/authentication.service';
import transporter from '../../config/nodemailer';
import { ErrorHelper } from '../../lib/utils';
import { OnboardingDataModel } from '../../interface/auth.interface';

const authenticationService = new AuthenticationService();

export class AuthenticationController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userData: UserModel = {
        email,
        password,
      };

      // REGISTRATION
      const user = await authenticationService.register(userData);

      const emailToken = await authenticationService.requestVerifyEmail(email);
      await this.sendingEmailVerification(email, emailToken);

      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          errorCode: error.errorCode,
          message: error.message,
          status: error.status,
        });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      console.log({ token });
      const result = await authenticationService.verifyUserEmail(
        token as string
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          errorCode: error.errorCode,
          message: error.message,
          status: error.status,
        });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const loginUser = await authenticationService.login(email, password);

      const refreshTokenExpiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      res
        .cookie('session_token', loginUser.refreshToken, {
          httpOnly: true,
          maxAge: refreshTokenExpiresInMs,
          path: '/',
          secure: false,
          sameSite: 'lax',
        })
        .send({
          message: 'Login successful',
          accessToken: loginUser.accessToken,
          user: loginUser.user,
        });
    } catch (error: unknown) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          errorCode: error.errorCode,
          message: error.message,
          status: error.status,
        });
      } else {
        console.log(error);
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async generateAccesToken(req: Request, res: Response) {
    try {
      console.log(req.cookies);
      const { session_token } = req.cookies;

      if (!session_token) {
        return res.status(401).json({ error: 'Refresh token is required' });
      }

      const newData =
        await authenticationService.generateAccesToken(session_token);

      res.status(200).json(newData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async sendingEmailVerification(email: string, emailToken: string) {
    let mailOptions = {
      from: 'fareldeksano000@gmail.com',
      to: email,
      subject: 'Nodemailer Project',
      text: `Hi from your nodemailer project, https://localhost:3000/email-verification?token=${emailToken}`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
    return { message: 'Email sent successfully' };
  }

  async validateUser(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const user = await authenticationService.validateUser(email);
      res.status(200).json(user);
    } catch (error: unknown) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          errorCode: error.errorCode,
          message: error.message,
          status: error.status,
        });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async onboardingSubmission(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { dateReset, partner, user } = req.body;
      const dataOnboarding: OnboardingDataModel = {
        dateReset,
        partner,
        user,
      };

      const userOnboarding = await authenticationService.onboardingSubmission(
        email,
        dataOnboarding
      );
      res.status(200).json(userOnboarding);
    } catch (error: unknown) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({
          errorCode: error.errorCode,
          message: error.message,
          status: error.status,
        });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }
}
