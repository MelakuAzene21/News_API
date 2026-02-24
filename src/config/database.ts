import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Soft delete middleware
prisma.$use(async (params, next) => {
  // Check if this is a find operation and should exclude deleted records
  if (params.model === 'Article') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Add deletedAt null check
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }
    if (params.action === 'findMany') {
      if (!params.args.where?.deletedAt) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }
    }
  }
  return next(params);
});

export default prisma;