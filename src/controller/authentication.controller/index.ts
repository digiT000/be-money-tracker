import { Request, Response } from 'express';
import {
  AuthenticationService,
  UserModel,
} from '../../service/authentication.service';
import transporter from '../../config/nodemailer';

const authenticationService = new AuthenticationService();

export class AuthenticationController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const userData: UserModel = {
        email,
        password,
        name,
      };

      // REGISTRATION
      const user = await authenticationService.register(userData);

      const emailToken = await authenticationService.requestVerifyEmail(email);
      await this.sendingEmailVerification(email, emailToken);

      res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      const result = await authenticationService.verifyUserEmail(
        token as string
      );
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
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
        .status(200)
        .cookie('refresh_token', loginUser.refreshToken, {
          httpOnly: true,
          maxAge: refreshTokenExpiresInMs,
        })
        .send({
          message: 'Login successful',
          accessToken: loginUser.accessToken,
          user: loginUser.user,
        });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async generateAccesToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token is required' });
      }

      const newAccessToken =
        await authenticationService.generateAccesToken(refreshToken);

      res.status(200).json({ accessToken: newAccessToken });
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
      text: `Hi from your nodemailer project, https://localhost:3000/?token=${emailToken}`,
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
}
