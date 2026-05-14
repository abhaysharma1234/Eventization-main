import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError, catchAsync } from './errorHandler.js';

export const authenticate = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, env.jwtSecret);

  // 3) Check if user still exists (this would require a user model, for now we'll skip)
  // const currentUser = await User.findById(decoded.id);
  // if (!currentUser) {
  //   return next(new AppError('The user belonging to this token no longer exists.', 401));
  // }

  // 4) Check if user changed password after the token was issued (would require password change tracking)
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(new AppError('User recently changed password! Please log in again.', 401));
  // }

  // Grant access to protected route
  req.user = decoded;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};


