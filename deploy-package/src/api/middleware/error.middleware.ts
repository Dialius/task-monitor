/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('API Error', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      details: error.message
    });
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    res.status(409).json({
      error: 'Duplicate entry',
      details: 'Resource already exists'
    });
    return;
  }

  // Default error
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
};
