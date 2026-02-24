import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/articleService';
import { AnalyticsService } from '../services/analyticsService';
import { formatResponse, formatPaginatedResponse } from '../utils/responseFormatter';

const articleService = new ArticleService();
const analyticsService = new AnalyticsService();

export class ArticleController {
  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await articleService.createArticle(
        req.user!.id,
        req.body
      );

      res.status(201).json(formatResponse(
        'Article created successfully',
        article
      ));
    } catch (error) {
      next(error);
    }
  }

  async getMyArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const includeDeleted = req.query.includeDeleted === 'true';

      const articles = await articleService.getAuthorArticles(
        req.user!.id,
        includeDeleted
      );

      // Manual pagination since we need to include deleted option
      const start = (page - 1) * limit;
      const paginatedArticles = articles.slice(start, start + limit);

      res.json(formatPaginatedResponse(
        'Articles retrieved successfully',
        paginatedArticles,
        page,
        limit,
        articles.length
      ));
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await articleService.updateArticle(
        id,
        req.user!.id,
        req.body
      );

      res.json(formatResponse(
        'Article updated successfully',
        article
      ));
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await articleService.softDeleteArticle(
        id,
        req.user!.id
      );

      res.json(formatResponse(
        'Article deleted successfully',
        article
      ));
    } catch (error) {
      next(error);
    }
  }
}