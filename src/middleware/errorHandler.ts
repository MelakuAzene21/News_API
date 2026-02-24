import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { formatResponse } from '../utils/responseFormatter';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(
      formatResponse(
        err.message,
        null,
        err.errors
      )
    );
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatResponse(
        err.message,
        null,
        err.isOperational ? [err.message] : ['Internal server error']
      )
    );
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json(
      formatResponse('Database error', null, ['Database operation failed'])
    );
  }

  // Default error
  return res.status(500).json(
    formatResponse(
      'Internal server error',
      null,
      process.env.NODE_ENV === 'development' ? [err.message] : ['An unexpected error occurred']
    )
  );
};