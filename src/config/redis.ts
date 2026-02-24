import Redis from 'ioredis';
import Queue from 'bull';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl);

export const analyticsQueue = new Queue('analytics processing', redisUrl);

export const readRateLimiter = new Queue('rate limiter', redisUrl);