import prisma from '../config/database';
import { analyticsQueue } from '../config/redis';

export class AnalyticsService {
  async trackRead(articleId: string, readerId?: string) {
    // Create read log asynchronously
    analyticsQueue.add('track-read', {
      articleId,
      readerId,
      timestamp: new Date()
    });

    // Return immediately without waiting
    return { tracked: true };
  }

  async getArticleViews(articleId: string): Promise<number> {
    const result = await prisma.dailyAnalytics.aggregate({
      where: { articleId },
      _sum: { viewCount: true }
    });

    return result._sum.viewCount || 0;
  }

  async getAuthorDashboard(authorId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const articles = await prisma.article.findMany({
      where: {
        authorId,
        deletedAt: null
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        category: true,
        analytics: {
          select: {
            viewCount: true
          }
        }
      }
    });

    const total = await prisma.article.count({
      where: {
        authorId,
        deletedAt: null
      }
    });

    // Calculate total views for each article
    const articlesWithViews = articles.map(article => ({
      ...article,
      totalViews: article.analytics.reduce((sum, day) => sum + day.viewCount, 0)
    }));

    return {
      articles: articlesWithViews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getArticlePerformance(articleId: string, authorId: string) {
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        authorId,
        deletedAt: null
      },
      include: {
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!article) {
      return null;
    }

    const totalViews = article.analytics.reduce((sum, day) => sum + day.viewCount, 0);

    return {
      ...article,
      totalViews,
      dailyViews: article.analytics
    };
  }
}