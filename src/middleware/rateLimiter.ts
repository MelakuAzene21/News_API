import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';

export const articleReadLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5, // 5 reads per 10 seconds
  keyGenerator: (req) => {
    return req.user?.id || req.ip || 'anonymous';
  },
  message: {
    Success: false,
    Message: 'Too many read requests, please slow down',
    Object: null,
    Errors: ['Rate limit exceeded']
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    Success: false,
    Message: 'Too many requests, please try again later',
    Object: null,
    Errors: ['Rate limit exceeded']
  }
});