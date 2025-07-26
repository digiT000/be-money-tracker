import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function registrationChecking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, name } = req.body;
  console.log('Registration checking middleware called', {
    email,
    password,
    name,
  });
  if (!email || !password || !name) {
    res.status(400).json({
      error: 'email, password, and name are required',
    });
  } else {
    next();
  }
}
