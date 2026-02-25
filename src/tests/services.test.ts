import { ArticleService } from '../services/articleService';
import { AnalyticsService } from '../services/analyticsService';
import { mockPrisma, mockRedis, mockAnalyticsQueue } from './setup';
import { ArticleStatus } from '@prisma/client';

describe('Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ArticleService', () => {
    let articleService: ArticleService;

    beforeEach(() => {
      articleService = new ArticleService();
    });

    describe('createArticle', () => {
      it('should create article successfully', async () => {
        const articleData = {
          title: 'Test Article',
          content: 'Test content that meets minimum length requirement',
          category: 'Tech',
          status: ArticleStatus.Draft
        };

        const mockCreatedArticle = {
          id: 'article-123',
          ...articleData,
          authorId: 'author-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: 'author-123',
            name: 'John Doe',
            email: 'john@example.com'
          }
        };

        mockPrisma.article.create.mockResolvedValue(mockCreatedArticle);

        const result = await articleService.createArticle('author-123', articleData);

        expect(result).toEqual(mockCreatedArticle);
        expect(mockPrisma.article.create).toHaveBeenCalledWith({
          data: {
            ...articleData,
            authorId: 'author-123',
            status: articleData.status
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
      });

      it('should default status to Draft when not provided', async () => {
        const articleData = {
          title: 'Test Article',
          content: 'Test content that meets minimum length requirement',
          category: 'Tech'
        };

        mockPrisma.article.create.mockResolvedValue({
          id: 'article-123',
          ...articleData,
          authorId: 'author-123',
          status: 'Draft'
        });

        await articleService.createArticle('author-123', articleData);

        expect(mockPrisma.article.create).toHaveBeenCalledWith({
          data: {
            ...articleData,
            authorId: 'author-123',
            status: 'Draft'
          },
          include: expect.any(Object)
        });
      });
    });

    describe('updateArticle', () => {
      it('should update article successfully', async () => {
        const updateData = {
          title: 'Updated Title',
          content: 'Updated content'
        };

        const mockExistingArticle = {
          id: 'article-123',
          authorId: 'author-123',
          deletedAt: null
        };

        const mockUpdatedArticle = {
          id: 'article-123',
          ...updateData,
          authorId: 'author-123',
          author: {
            id: 'author-123',
            name: 'John Doe'
          }
        };

        mockPrisma.article.findUnique.mockResolvedValue(mockExistingArticle);
        mockPrisma.article.update.mockResolvedValue(mockUpdatedArticle);

        const result = await articleService.updateArticle('article-123', 'author-123', updateData);

        expect(result).toEqual(mockUpdatedArticle);
        expect(mockPrisma.article.update).toHaveBeenCalledWith({
          where: { id: 'article-123' },
          data: updateData,
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
      });

      it('should throw error when trying to update another author\'s article', async () => {
        const mockArticle = {
          id: 'article-123',
          authorId: 'different-author',
          deletedAt: null
        };

        mockPrisma.article.findUnique.mockResolvedValue(mockArticle);

        await expect(
          articleService.updateArticle('article-123', 'author-123', { title: 'Updated' })
        ).rejects.toThrow('You can only edit your own articles');
      });

      it('should throw error for deleted article', async () => {
        const mockArticle = {
          id: 'article-123',
          authorId: 'author-123',
          deletedAt: new Date()
        };

        mockPrisma.article.findUnique.mockResolvedValue(mockArticle);

        await expect(
          articleService.updateArticle('article-123', 'author-123', { title: 'Updated' })
        ).rejects.toThrow('Article not found');
      });
    });

    describe('softDeleteArticle', () => {
      it('should soft delete article successfully', async () => {
        const mockArticle = {
          id: 'article-123',
          authorId: 'author-123',
          deletedAt: null
        };

        const mockDeletedArticle = {
          id: 'article-123',
          authorId: 'author-123',
          deletedAt: new Date(),
          author: {
            id: 'author-123',
            name: 'John Doe'
          }
        };

        mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
        mockPrisma.article.update.mockResolvedValue(mockDeletedArticle);

        const result = await articleService.softDeleteArticle('article-123', 'author-123');

        expect(result).toEqual(mockDeletedArticle);
        expect(mockPrisma.article.update).toHaveBeenCalledWith({
          where: { id: 'article-123' },
          data: { deletedAt: expect.any(Date) },
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
      });
    });
  });

  describe('AnalyticsService', () => {
    let analyticsService: AnalyticsService;

    beforeEach(() => {
      analyticsService = new AnalyticsService();
    });

    describe('trackRead', () => {
      it('should track read successfully when not recently read', async () => {
        mockRedis.get.mockResolvedValue(null);
        mockRedis.setex.mockResolvedValue('OK');
        mockAnalyticsQueue.add.mockResolvedValue({});

        const result = await analyticsService.trackRead('article-123', 'user-123');

        expect(result).toEqual({ tracked: true });
        expect(mockRedis.get).toHaveBeenCalledWith('recent-read:user-123:article-123');
        expect(mockRedis.setex).toHaveBeenCalledWith('recent-read:user-123:article-123', 60, '1');
        expect(mockAnalyticsQueue.add).toHaveBeenCalledWith('track-read', {
          articleId: 'article-123',
          readerId: 'user-123',
          timestamp: expect.any(Date)
        });
      });

      it('should not track read when recently read', async () => {
        mockRedis.get.mockResolvedValue('1');

        const result = await analyticsService.trackRead('article-123', 'user-123');

        expect(result).toEqual({ tracked: false, reason: 'recent_read' });
        expect(mockRedis.setex).not.toHaveBeenCalled();
        expect(mockAnalyticsQueue.add).not.toHaveBeenCalled();
      });

      it('should handle guest reads', async () => {
        mockRedis.get.mockResolvedValue(null);
        mockRedis.setex.mockResolvedValue('OK');
        mockAnalyticsQueue.add.mockResolvedValue({});

        const result = await analyticsService.trackRead('article-123');

        expect(result).toEqual({ tracked: true });
        expect(mockRedis.get).toHaveBeenCalledWith('recent-read:guest:article-123');
        expect(mockRedis.setex).toHaveBeenCalledWith('recent-read:guest:article-123', 60, '1');
        expect(mockAnalyticsQueue.add).toHaveBeenCalledWith('track-read', {
          articleId: 'article-123',
          readerId: undefined,
          timestamp: expect.any(Date)
        });
      });
    });

    describe('getAuthorDashboard', () => {
      it('should get author dashboard with total views', async () => {
        const mockArticles = [
          {
            id: 'article-1',
            title: 'Article 1',
            createdAt: new Date(),
            status: 'Published',
            category: 'Tech',
            analytics: [
              { viewCount: 10 },
              { viewCount: 15 }
            ]
          },
          {
            id: 'article-2',
            title: 'Article 2',
            createdAt: new Date(),
            status: 'Draft',
            category: 'Sports',
            analytics: [
              { viewCount: 5 }
            ]
          }
        ];

        mockPrisma.article.findMany.mockResolvedValue(mockArticles);
        mockPrisma.article.count.mockResolvedValue(2);

        const result = await analyticsService.getAuthorDashboard('author-123', 1, 10);

        expect(result).toEqual({
          articles: [
            {
              ...mockArticles[0],
              totalViews: 25
            },
            {
              ...mockArticles[1],
              totalViews: 5
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            pages: 1
          }
        });
      });

      it('should exclude deleted articles', async () => {
        mockPrisma.article.findMany.mockResolvedValue([]);
        mockPrisma.article.count.mockResolvedValue(0);

        await analyticsService.getAuthorDashboard('author-123', 1, 10);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
          where: {
            authorId: 'author-123',
            deletedAt: null
          },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object)
        });
      });
    });
  });
});
