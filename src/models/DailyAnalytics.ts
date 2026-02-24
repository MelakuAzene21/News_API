import { IReadLog } from './ReadLog';

export interface IDailyAnalytics {
  id: string;
  articleId: string;
  viewCount: number;
  date: Date;
}

export interface IDailyAnalyticsWithArticle extends IDailyAnalytics {
  article?: {
    id: string;
    title: string;
    category: string;
    authorId: string;
    author?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface IAnalyticsSummary {
  totalViews: number;
  dailyAverage: number;
  peakDay: {
    date: Date;
    views: number;
  };
  categoryBreakdown?: Record<string, number>;
}

export class DailyAnalytics {
  id: string;
  articleId: string;
  viewCount: number;
  date: Date;

  constructor(data: IDailyAnalytics) {
    this.id = data.id;
    this.articleId = data.articleId;
    this.viewCount = data.viewCount;
    this.date = data.date;
  }

  // Format date in GMT
  getDateGMT(): string {
    return this.date.toISOString().split('T')[0];
  }

  // Check if analytics is for today
  isToday(): boolean {
    const today = new Date();
    const todayGMT = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ));
    return this.date.getTime() === todayGMT.getTime();
  }

  // Merge with another analytics record (for aggregation)
  merge(other: DailyAnalytics): DailyAnalytics {
    if (this.articleId !== other.articleId) {
      throw new Error('Cannot merge analytics for different articles');
    }
    if (this.date.getTime() !== other.date.getTime()) {
      throw new Error('Cannot merge analytics for different dates');
    }
    
    return new DailyAnalytics({
      ...this,
      viewCount: this.viewCount + other.viewCount
    });
  }
}

export type CreateDailyAnalyticsDTO = {
  articleId: string;
  viewCount: number;
  date: Date;
};

export type UpdateDailyAnalyticsDTO = Partial<CreateDailyAnalyticsDTO>;

export type DailyAnalyticsResponse = IDailyAnalytics;

// For batch processing
export interface AnalyticsBatchJob {
  jobId: string;
  date: Date;
  articlesProcessed: number;
  totalViewsProcessed: number;
  completedAt?: Date;
  error?: string;
}

export class AnalyticsAggregator {
  static aggregateDaily(readLogs: IReadLog[]): Map<string, Map<string, number>> {
    const aggregation = new Map<string, Map<string, number>>();
    
    for (const log of readLogs) {
      const date = new Date(log.readAt);
      const dateKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
      
      if (!aggregation.has(log.articleId)) {
        aggregation.set(log.articleId, new Map<string, number>());
      }
      
      const articleMap = aggregation.get(log.articleId)!;
      articleMap.set(dateKey, (articleMap.get(dateKey) || 0) + 1);
    }
    
    return aggregation;
  }

  static calculateGrowth(previousDay: number, currentDay: number): number {
    if (previousDay === 0) return currentDay > 0 ? 100 : 0;
    return ((currentDay - previousDay) / previousDay) * 100;
  }
}

// For dashboard display
export interface ArticlePerformanceMetrics {
  articleId: string;
  title: string;
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  averageDailyViews: number;
  growthRate: number;
  lastUpdated: Date;
}

export class PerformanceCalculator {
  static calculateMetrics(
    article: { id: string; title: string },
    analytics: IDailyAnalytics[]
  ): ArticlePerformanceMetrics {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setUTCDate(oneWeekAgo.getUTCDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1);

    let totalViews = 0;
    let viewsToday = 0;
    let viewsThisWeek = 0;
    let viewsThisMonth = 0;
    let daysWithData = 0;

    for (const day of analytics) {
      totalViews += day.viewCount;
      
      if (day.date.getTime() === today.getTime()) {
        viewsToday = day.viewCount;
      }
      
      if (day.date >= oneWeekAgo) {
        viewsThisWeek += day.viewCount;
      }
      
      if (day.date >= oneMonthAgo) {
        viewsThisMonth += day.viewCount;
      }
      
      daysWithData++;
    }

    // Calculate growth rate (compare last 7 days to previous 7 days)
    const previousWeekStart = new Date(oneWeekAgo);
    previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);
    
    let previousWeekViews = 0;
    for (const day of analytics) {
      if (day.date >= previousWeekStart && day.date < oneWeekAgo) {
        previousWeekViews += day.viewCount;
      }
    }
    
    const growthRate = AnalyticsAggregator.calculateGrowth(previousWeekViews, viewsThisWeek);

    return {
      articleId: article.id,
      title: article.title,
      totalViews,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      averageDailyViews: daysWithData > 0 ? totalViews / daysWithData : 0,
      growthRate,
      lastUpdated: new Date()
    };
  }
}