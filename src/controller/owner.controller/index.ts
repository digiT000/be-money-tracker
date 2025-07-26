import { Request } from '../../types/express';
import { Response } from 'express';
import { OwnerService } from '../../service/owner.service';
import { ErrorHelper } from '../../lib/utils';

export class OwnerController {
  private ownerService = new OwnerService();

  async createOwner(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { name } = req.body as { name: string };
      const owner = await this.ownerService.createOwner(name, email);
      res.status(201).json(owner);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({
          error: 'An unexpected error occurred while creating the owner.',
        });
      }
    }
  }
  async updateOwner(req: Request, res: Response) {
    try {
      const { email } = req.user as { email: string };
      const { ownerId } = req.params;
      const { name } = req.body as { name: string };
      const updatedOwner = await this.ownerService.updateOwner(
        email,
        ownerId,
        name
      );
      res.status(200).json(updatedOwner);
    } catch (error) {
      if (error instanceof ErrorHelper) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({
          error: 'An unexpected error occurred while updating the owner.',
        });
      }
    }
  }
}
