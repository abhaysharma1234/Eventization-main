import validator from 'validator';
import { AppError } from './errorHandler.js';

export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.escape(req.query[key]);
      }
    });
  }

  next();
};

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, and one number', 400);
  }
  
  return true;
};

export const validateMongoId = (id) => {
  if (!validator.isMongoId(id)) {
    throw new AppError('Invalid ID format', 400);
  }
  return true;
};

export const validateEventInput = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!data.date || !validator.isISO8601(data.date)) {
    errors.push('Valid date is required');
  }

  if (!data.location || data.location.trim().length < 3) {
    errors.push('Location must be at least 3 characters long');
  }

  if (!data.category || !['conference', 'workshop', 'meetup', 'webinar', 'social', 'other'].includes(data.category)) {
    errors.push('Valid category is required');
  }

  if (data.maxAttendees && (isNaN(data.maxAttendees) || data.maxAttendees < 1)) {
    errors.push('Max attendees must be a positive number');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  return true;
};

export const validateRegistrationInput = (data) => {
  const errors = [];

  if (!data.eventId || !validator.isMongoId(data.eventId)) {
    errors.push('Valid event ID is required');
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || !validator.isMobilePhone(data.phone, 'any', { strictMode: false })) {
    errors.push('Valid phone number is required');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  return true;
};

export const validateReviewInput = (data) => {
  const errors = [];

  if (!data.eventId || !validator.isMongoId(data.eventId)) {
    errors.push('Valid event ID is required');
  }

  if (!data.rating || isNaN(data.rating) || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!data.comment || data.comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters long');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  return true;
};
