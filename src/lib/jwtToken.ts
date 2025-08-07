import jwt from 'jsonwebtoken';
import { AUTH_ERROR } from '../service/authentication.service';
import { ErrorHelper } from './utils';

export class JwttokenUtils {
  async generateAccessToken(
    isVerified: boolean,
    email: string
  ): Promise<string> {
    const token = jwt.sign(
      {
        email: email,
        isVerified: isVerified,
      },
      process.env.JWT_SECRET_ACCESS_TOKEN as string,
      {
        expiresIn: '15m',
      }
    );
    return token;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign(
      {
        userId: userId,
      },
      process.env.JWT_SECRET_REFRESH_TOKEN as string,
      {
        expiresIn: '7d', // 7 days
        algorithm: 'HS256',
        issuer: 'refresh', // Optional: specify the issuer
      }
    );
    return token;
  }

  async generateEmailToken(email: string): Promise<string> {
    const token = jwt.sign(
      {
        email: email,
      },
      process.env.JWT_SECRET_EMAIL as string,
      {
        expiresIn: '1h',
      }
    );
    return token;
  }

  async verifyEmailToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_EMAIL as string);
      return decoded as { email: string };
    } catch (error) {
      console.log(error);
      throw ErrorHelper.from(AUTH_ERROR.FORMAT_TOKEN_INVALID);
    }
  }
}
