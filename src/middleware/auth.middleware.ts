import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OnboardingDataModel } from '../interface/auth.interface';

export function registrationChecking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;
  console.log('Registration checking middleware called', {
    email,
    password,
  });
  if (!email || !password) {
    res.status(400).json({
      error: 'email and password are required',
    });
  } else {
    next();
  }
}

export function onboardingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { dateReset, partner, user } = req.body as OnboardingDataModel;

  console.log('Onboarding middleware called', {
    dateReset,
    partner,
    user,
  });

  if (!dateReset || !partner || !user) {
    res.status(400).json({
      error: 'dateReset, firstOwnerName, and secondOwnerName are required',
    });
  } else {
    next();
  }
}
