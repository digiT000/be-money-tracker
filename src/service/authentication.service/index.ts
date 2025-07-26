import { v4 as uuidv4 } from 'uuid';
import { JwttokenUtils } from '../../lib/jwtToken';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { generateUnhashedToken } from '../../lib/utils';

const saltRounds = 10;

export interface UserModel {
  email: string;
  name: string;
  password: string;
}

export class AuthenticationService {
  private JwttokenUtils = new JwttokenUtils();

  async register(userData: UserModel) {
    // Check if user already exists by checking email
    const existingUser = await this.checkUserExists(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      try {
        const createUser = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash: hashedPassword,
            name: userData.name,
          },
        });
        return {
          id: createUser.id,
          email: createUser.email,
          name: createUser.name,
          emailVerified: createUser.emailVerified,
          createdAt: createUser.createdAt,
        };
      } catch (error) {
        throw new Error('Failed to create user');
      }
    }
  }

  async requestVerifyEmail(email: string) {
    // Check if the email exists
    // Check if the user is not yet verified

    const user = await this.checkUserExists(email);
    if (!user) {
      throw new Error('User does not exist');
    }
    if (user.emailVerified) {
      throw new Error('User is already verified');
    }

    const token = await this.JwttokenUtils.generateEmailToken(email);

    // Save token to database
    await prisma.user.update({
      where: { email: email },
      data: {
        tokenEmailVerified: token,
        tokenEmailVerifiedCreatedAt: new Date(),
        tokenEmailVerifiedExpiresAt: new Date(Date.now() + 3600000), // 1 hour expiration
      },
    });

    return token;
  }

  async verifyUserEmail(verifyToken: string) {
    // Check if the token matches
    const decodedEmail = await this.JwttokenUtils.verifyEmailToken(verifyToken);

    // Check if the user exists
    const user = await this.checkUserExists(decodedEmail.email);
    if (!user) {
      throw new Error('User does not exist');
    }

    // Check if the user is already verified
    if (user.emailVerified) {
      throw new Error('User is already verified');
    }

    // Check if the token is expired
    const tokenCreatedAt = user.tokenEmailVerifiedCreatedAt;
    if (tokenCreatedAt) {
      const tokenExpiresAt = new Date(tokenCreatedAt.getTime() + 3600000); // 1 hour expiration
      if (new Date() > tokenExpiresAt) {
        throw new Error('Verification token has expired');
      }
    }

    // Update user to set email to true
    const updatedEmailUser = await prisma.user.update({
      where: { email: decodedEmail.email },
      data: {
        emailVerified: true,
        tokenEmailVerified: null,
        tokenEmailVerifiedCreatedAt: null,
        tokenEmailVerifiedExpiresAt: null,
      },
    });
    return {
      id: updatedEmailUser.id,
      email: updatedEmailUser.email,
      name: updatedEmailUser.name,
      emailVerified: updatedEmailUser.emailVerified,
    };
  }

  async login(email: string, password: string) {
    const user = await this.checkUserExists(email);

    if (!user) {
      throw new Error('User does not exist');
    }
    if (!user.emailVerified) {
      throw new Error('User email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const idToken = uuidv4(); // Generate a unique ID for the refresh token
    const unhashedToken = generateUnhashedToken();
    const refreshToken = `${idToken}.${unhashedToken}`;
    const hashedToken = await bcrypt.hash(refreshToken, saltRounds);

    // if valid create refreshToken
    await prisma.refreshToken.create({
      data: {
        id: idToken,
        expiresAt: new Date(Date.now() + 604800000), // 7 days expiration
        userId: user.id,
        token: hashedToken,
      },
    });

    const accesToken = await this.JwttokenUtils.generateAccessToken(
      user.emailVerified,
      user.email
    );

    return {
      accessToken: accesToken,
      refreshToken: refreshToken,
      user: {
        email: user.email,
        name: user.name,
        isVerified: user.emailVerified,
      },
    };
  }

  async generateAccesToken(refreshToken: string) {
    const [idToken, unhashedToken] = refreshToken.split('.');
    if (!idToken || !unhashedToken) {
      throw new Error('Invalid refresh token format');
    }

    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { id: idToken },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!refreshTokenRecord) {
      throw new Error('Refresh token not found');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      refreshTokenRecord.token
    );
    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    const currentTime = new Date();
    if (currentTime > refreshTokenRecord.expiresAt) {
      throw new Error('Refresh token has expired');
    }

    const accessToken = await this.JwttokenUtils.generateAccessToken(
      refreshTokenRecord.user.emailVerified,
      refreshTokenRecord.user.email
    );
    return accessToken;
  }

  async checkUserExists(email: string) {
    return await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }
}
