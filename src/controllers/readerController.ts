import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/articleService';
import { AnalyticsService } from '../services/analyticsService';
import { formatResponse, formatPaginatedResponse } from '../utils/responseFormatter';
import { redis } from '../config/redis';

const articleService = new ArticleService();
const analyticsService = new AnalyticsService();

export class ReaderController {
  async getPublishedArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, author, q, page, limit } = req.query;
      
      const result = await articleService.getPublishedArticles({
        category: category as string,
        author: author as string,
        q: q as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json(formatPaginatedResponse(
        'Articles retrieved successfully',
        result.articles,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      ));
    } catch (error) {
      next(error);
    }
  }

  async getArticleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Check rate limit using Redis
      const rateLimitKey = `read:${userId || req.ip}:${id}`;
      const reads = await redis.incr(rateLimitKey);
      
      if (reads === 1) {
        await redis.expire(rateLimitKey, 10); // 10 seconds window
      }

      if (reads > 5) {
        return res.status(429).json(formatResponse(
          'Rate limit exceeded',
          null,
          ['Too many reads in short time']
        ));
      }

      // Get article
      const article = await articleService.getArticleById(id);

      // Track read asynchronously
      const trackResult = await analyticsService.trackRead(id, userId);

      res.json(formatResponse(
        'Article retrieved successfully',
        {
          ...article,
          readTracked: trackResult.tracked
        }
      ));
    } catch (error) {
      next(error);
    }
  }
}