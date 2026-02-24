import { analyticsQueue } from '../config/redis';
import prisma from '../config/database';

export class QueueService {
  static initialize() {
    // Process read tracking
    analyticsQueue.process('track-read', async (job) => {
      const { articleId, readerId, timestamp } = job.data;
      
      try {
        // Create read log
        await prisma.readLog.create({
          data: {
            articleId,
            readerId,
            readAt: timestamp
          }
        });

        // Queue for aggregation
        await analyticsQueue.add('aggregate-daily', {
          articleId,
          date: this.getGMTDate(timestamp)
        });

      } catch (error) {
        console.error('Failed to track read:', error);
      }
    });

    // Process daily aggregation
    analyticsQueue.process('aggregate-daily', async (job) => {
      const { articleId, date } = job.data;

      try {
        // Count reads for this article on this date
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const count = await prisma.readLog.count({
          where: {
            articleId,
            readAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        // Upsert daily analytics
        await prisma.dailyAnalytics.upsert({
          where: {
            articleId_date: {
              articleId,
              date: startOfDay
            }
          },
          update: {
            viewCount: count
          },
          create: {
            articleId,
            date: startOfDay,
            viewCount: count
          }
        });

      } catch (error) {
        console.error('Failed to aggregate daily analytics:', error);
      }
    });

    // Schedule daily aggregation at midnight GMT
    analyticsQueue.add('schedule-daily-aggregation', {}, {
      repeat: { cron: '0 0 * * *' }
    });

    analyticsQueue.process('schedule-daily-aggregation', async () => {
      console.log('Running daily analytics aggregation...');
      // This would trigger aggregation for all articles
    });
  }

  private static getGMTDate(timestamp: Date): Date {
    const date = new Date(timestamp);
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  }
}