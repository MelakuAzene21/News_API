import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { formatPaginatedResponse } from '../utils/responseFormatter';

const analyticsService = new AnalyticsService();

export class DashboardController {
  async getAuthorDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await analyticsService.getAuthorDashboard(
        req.user!.id,
        page,
        limit
      );

      res.json(formatPaginatedResponse(
        'Dashboard data retrieved successfully',
        result.articles,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      ));
    } catch (error) {
      next(error);
    }
  }
}