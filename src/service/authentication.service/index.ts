import { v4 as uuidv4 } from 'uuid';
import { JwttokenUtils } from '../../lib/jwtToken';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { ErrorHelper, generateUnhashedToken } from '../../lib/utils';
import { OnboardingDataModel } from '../../interface/auth.interface';

export const AUTH_ERROR = {
  USER_NOT_FOUND: {
    errorCode: 'AUTH_01',
    message: 'User not found',
    status: 404,
  },
  USER_NOT_VERIFIED: {
    errorCode: 'AUTH_02',
    message: 'User not verified',
    status: 401,
  },
  USER_INVALID_PASSWORD: {
    errorCode: 'AUTH_03',
    message: 'User invalid password',
    status: 401,
  },
  USER_ALREADY_EXIST: {
    errorCode: 'AUTH_04',
    message: 'User already exist',
    status: 400,
  },
  FAILED_CREATE: {
    errorCode: 'AUTH_05',
    message: 'Failed to create user',
    status: 400,
  },
  USER_ALREADY_VERIFIED: {
    errorCode: 'AUTH_06',
    message: 'User already verified',
    status: 400,
  },
  EMAIL_TOKEN_EXPIRED: {
    errorCode: 'AUTH_07',
    message: 'Verification token has expired',
    status: 400,
  },
  FORMAT_TOKEN_INVALID: {
    errorCode: 'AUTH_08',
    message: 'Verification token format is invalid',
    status: 400,
  },
};

const saltRounds = 10;

export interface UserModel {
  email: string;
  password: string;
}

export class AuthenticationService {
  private JwttokenUtils = new JwttokenUtils();

  async register(userData: UserModel) {
    // Check if user already exists by checking email
    const existingUser = await this.checkUserExists(userData.email);
    if (existingUser) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_ALREADY_EXIST.errorCode,
        AUTH_ERROR.USER_ALREADY_EXIST.message,
        AUTH_ERROR.USER_ALREADY_EXIST.status
      );
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      try {
        const createUser = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash: hashedPassword,
          },
        });
        return {
          id: createUser.id,
          email: createUser.email,
          emailVerified: createUser.emailVerified,
          createdAt: createUser.createdAt,
        };
      } catch (error) {
        throw new ErrorHelper(
          AUTH_ERROR.FAILED_CREATE.errorCode,
          AUTH_ERROR.FAILED_CREATE.message,
          AUTH_ERROR.FAILED_CREATE.status
        );
      }
    }
  }

  async requestVerifyEmail(email: string) {
    // Check if the email exists
    // Check if the user is not yet verified

    const user = await this.checkUserExists(email);
    if (!user) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_NOT_FOUND.errorCode,
        AUTH_ERROR.USER_NOT_FOUND.message,
        AUTH_ERROR.USER_NOT_FOUND.status
      );
    }
    if (user.emailVerified) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_ALREADY_VERIFIED.errorCode,
        AUTH_ERROR.USER_ALREADY_VERIFIED.message,
        AUTH_ERROR.USER_ALREADY_VERIFIED.status
      );
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
    console.log({ verifyToken });
    // Check if the token matches
    const decodedEmail = await this.JwttokenUtils.verifyEmailToken(verifyToken);
    console.log(decodedEmail);

    // Check if the user exists
    const user = await this.checkUserExists(decodedEmail.email);
    if (!user) {
      throw ErrorHelper.from(AUTH_ERROR.USER_NOT_FOUND);
    }

    // Check if the user is already verified
    if (user.emailVerified) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_ALREADY_VERIFIED.errorCode,
        AUTH_ERROR.USER_ALREADY_VERIFIED.message,
        AUTH_ERROR.USER_ALREADY_VERIFIED.status
      );
    }

    // Check if the token is expired
    const tokenCreatedAt = user.tokenEmailVerifiedCreatedAt;
    if (tokenCreatedAt) {
      const tokenExpiresAt = new Date(tokenCreatedAt.getTime() + 3600000); // 1 hour expiration
      if (new Date() > tokenExpiresAt) {
        throw new ErrorHelper(
          AUTH_ERROR.EMAIL_TOKEN_EXPIRED.errorCode,
          AUTH_ERROR.EMAIL_TOKEN_EXPIRED.message,
          AUTH_ERROR.EMAIL_TOKEN_EXPIRED.status
        );
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
      throw new ErrorHelper(
        AUTH_ERROR.USER_NOT_FOUND.errorCode,
        AUTH_ERROR.USER_NOT_FOUND.message,
        AUTH_ERROR.USER_NOT_FOUND.status
      );
    }
    if (!user.emailVerified) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_NOT_VERIFIED.errorCode,
        AUTH_ERROR.USER_NOT_VERIFIED.message,
        AUTH_ERROR.USER_NOT_VERIFIED.status
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_INVALID_PASSWORD.errorCode,
        AUTH_ERROR.USER_INVALID_PASSWORD.message,
        AUTH_ERROR.USER_INVALID_PASSWORD.status
      );
    }

    const idToken = uuidv4(); // Generate a unique ID for the refresh token
    const unhashedToken = generateUnhashedToken();
    const refreshToken = `${idToken}.${unhashedToken}`;
    const hashedToken = await bcrypt.hash(unhashedToken, saltRounds);

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
    const partnerData = this.findPartner(user.owner);

    return {
      accessToken: accesToken,
      refreshToken: refreshToken,
      user: {
        email: user.email,
        name: user.name,
        isVerified: user.emailVerified,
        isCompleteOnboarding: user.completeOnboarding,
        partner: partnerData,
      },
    };
  }

  async generateAccesToken(refreshToken: string) {
    const [idToken, unhashedToken] = refreshToken.split('.');
    if (!idToken || !unhashedToken) {
      throw new ErrorHelper(
        AUTH_ERROR.FORMAT_TOKEN_INVALID.errorCode,
        AUTH_ERROR.FORMAT_TOKEN_INVALID.message,
        AUTH_ERROR.FORMAT_TOKEN_INVALID.status
      );
    }

    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { id: idToken },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
            name: true,
            completeOnboarding: true,
            owner: {
              select: {
                id: true,
                name: true,
                isPrimaryUser: true,
              },
            },
          },
        },
      },
    });

    if (!refreshTokenRecord) {
      throw new Error('Refresh token not found');
    }

    const isValid = await bcrypt.compare(
      unhashedToken,
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

    const partnerData = this.findPartner(refreshTokenRecord.user.owner);
    const mainPartner = this.findPartner(refreshTokenRecord.user.owner, true);

    return {
      accessToken: accessToken,
      user: {
        email: refreshTokenRecord.user.email,
        name: refreshTokenRecord.user.name,
        mainPartner: mainPartner,
        partner: partnerData,
        isVerified: refreshTokenRecord.user.emailVerified,
        isCompleteOnboarding: refreshTokenRecord.user.completeOnboarding,
      },
    };
  }

  async checkUserExists(email: string) {
    return await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // TODO : Validate token and return user detail for frontend needed
  async validateUser(email: string) {
    const user = await this.checkUserExists(email);
    if (!user) {
      throw new ErrorHelper('', 'User does not exist', 404);
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      completeOnboarding: user.completeOnboarding,
    };
  }

  async onboardingSubmission(
    email: string,
    dataOnboarding: OnboardingDataModel
  ) {
    const user = await this.checkUserExists(email);
    if (!user) {
      throw new ErrorHelper(
        AUTH_ERROR.USER_NOT_FOUND.errorCode,
        AUTH_ERROR.USER_NOT_FOUND.message,
        AUTH_ERROR.USER_NOT_FOUND.status
      );
    }

    // make it as transaction, updating user onboarding and create new owner
    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            name: dataOnboarding.user, // Update the user's name
            completeOnboarding: true,
            completeOnboardingDate: new Date(),
            dateResetExpense: dataOnboarding.dateReset,
          },
        });

        // Next, create both "payers" in a single database call
        await prisma.ownerExpnse.createMany({
          data: [
            {
              name: dataOnboarding.user,
              userId: user.id,
              isPrimaryUser: true,
            },
            {
              name: dataOnboarding.partner,
              userId: user.id,
              isPrimaryUser: false,
            },
          ],
        });
      });

      return {
        id: user.id,
        email: user.email,
        completeOnboarding: user.completeOnboarding,
      };
    } catch (error) {
      console.error(error);
      throw new ErrorHelper('', `An error occurred ${error}`, 500);
    }

    // TODO: Implement logout functionality

    //TODO: IMPLEMENT ONBOARDING SUBMISSION
  }
  async logout(token: string) {
    if (!token) {
      return { message: 'User is already logged out.' };
    }

    const splitToken = token.split('.');
    const idToken = splitToken[0];

    try {
      // Directly attempt to delete the token.
      // This is the only action that matters for logout.
      await prisma.refreshToken.delete({
        where: {
          id: idToken,
        },
      });
    } catch (error) {
      // It's good practice to handle the case where the token is already invalid.
      // Prisma throws a P2025 error if the record to delete is not found.
      // In this case, the user is effectively logged out, so we can ignore the error.
      console.log(`Attempted to log out with an invalid token ID: ${idToken}`);
    }

    return {
      message: 'Logout successful',
    };
  }

  findPartner(listOwner: any, isMain: boolean = false) {
    const partner = listOwner.find((user: any) => {
      if (isMain) {
        return user.isPrimaryUser === true;
      } else {
        return user.isPrimaryUser === false;
      }
    });

    return partner ? { id: partner.id, name: partner.name } : null; // or undefined
  }
}
