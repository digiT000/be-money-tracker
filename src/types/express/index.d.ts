// src/types/express/index.d.ts
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
  user?: {
    email: string;
  };
}
