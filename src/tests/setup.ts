import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  article: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  readLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  dailyAnalytics: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('../config/database', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  del: jest.fn(),
};

const mockAnalyticsQueue = {
  add: jest.fn(),
  process: jest.fn(),
};

const mockReadRateLimiter = {
  add: jest.fn(),
  process: jest.fn(),
};

jest.mock('../config/redis', () => ({
  __esModule: true,
  redis: mockRedis,
  analyticsQueue: mockAnalyticsQueue,
  readRateLimiter: mockReadRateLimiter,
}));

// Mock JWT
const mockJwt = {
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ sub: 'user-123', role: 'author' })),
};

jest.mock('jsonwebtoken', () => mockJwt);

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379';

// Export mocks for use in tests
export { mockPrisma, mockRedis, mockAnalyticsQueue, mockReadRateLimiter, mockJwt };
