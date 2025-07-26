import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma';
import { ErrorHelper } from '../../lib/utils';

export class OwnerService {
  async createOwner(name: string, email: string) {
    try {
      // Check if the user exist
      const checkUser = await prisma.user.findUnique({
        where: { email },
      });
      if (!checkUser) {
        throw new ErrorHelper('Owner already exists', 400);
      }

      // Check if the user have already has 2 owner
      const ownerCount = await prisma.ownerExpnse.count({
        where: {
          user: {
            id: checkUser.id,
          },
        },
      });

      if (ownerCount >= 2) {
        throw new ErrorHelper('You can only have 2 owners', 400);
      }

      const createOwner = await prisma.ownerExpnse.create({
        data: {
          name: name,
          userId: checkUser.id,
        },
      });

      return {
        name: createOwner.name,
        id: createOwner.id,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`Owner not created: ${error.message}`);
      } else if (error instanceof ErrorHelper) {
        throw new ErrorHelper(`Owner failed to create: ${error.message}`, 400);
      }
    }
  }

  async updateOwner(email: string, ownerId: string, name: string) {
    try {
      // Check if the user exist
      const checkUser = await prisma.user.findUnique({
        where: { email },
      });
      if (!checkUser) {
        throw new ErrorHelper('Owner does not exist', 400);
      }
      // Update Owner
      const updateOwner = await prisma.ownerExpnse.update({
        where: {
          id: ownerId,
          userId: checkUser.id,
        },
        data: {
          name: name,
        },
      });

      return {
        name: updateOwner.name,
        id: updateOwner.id,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`Owner not updated: ${error.message}`);
      } else if (error instanceof ErrorHelper) {
        throw new ErrorHelper(`Owner failed to update: ${error.message}`, 400);
      }
    }
  }
}
