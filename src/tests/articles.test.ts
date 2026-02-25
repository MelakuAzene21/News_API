import request from 'supertest';
import app from '../app';
import { mockPrisma, mockRedis, mockAnalyticsQueue } from './setup';

describe('Article Endpoints', () => {
  const authToken = 'Bearer valid-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Author Article Management', () => {
    describe('POST /api/author/articles', () => {
      it('should create a new article successfully', async () => {
        const articleData = {
          title: 'Test Article',
          content: 'This is a test article content that meets the minimum length requirement of 50 characters.',
          category: 'Tech',
          status: 'Draft'
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

        const response = await request(app)
          .post('/api/author/articles')
          .set('Authorization', authToken)
          .send(articleData);

        expect(response.status).toBe(201);
        expect(response.body);
        expect(response.body.Success).toBe(true);
        expect(response.body.Object).toMatchObject({
          title: articleData.title,
          content: articleData.content,
          category: articleData.category
        });
      });

      it('should return validation errors for invalid article data', async () => {
        const invalidData = {
          title: '',
          content: 'short',
          category: 'invalid',
          status: 'invalid'
        };

        const response = await request(app)
          .post('/api/author/articles')
          .set('Authorization', authToken)
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body);
        expect(response.body.Success).toBe(false);
        expect(Array.isArray(response.body.Errors)).toBe(true);
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/author/articles')
          .send({ title: 'Test', content: 'Valid content', category: 'Tech' });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/author/articles/me', () => {
      it('should get author\'s articles successfully', async () => {
        const mockArticles = [
          {
            id: 'article-1',
            title: 'Article 1',
            content: 'Content 1',
            category: 'Tech',
            status: 'Published',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          },
          {
            id: 'article-2',
            title: 'Article 2',
            content: 'Content 2',
            category: 'Sports',
            status: 'Draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          }
        ];

        mockPrisma.article.findMany.mockResolvedValue(mockArticles);

        const response = await request(app)
          .get('/api/author/articles/me')
          .set('Authorization', authToken);

        expect(response.status).toBe(200);
        expect(response.body);
        expect(response.body.Success).toBe(true);
        expect(response.body.Object).toHaveLength(2);
        expect(response.body.PageNumber).toBe(1);
        expect(response.body.PageSize).toBe(10);
      });

      it('should support pagination', async () => {
        mockPrisma.article.findMany.mockResolvedValue([]);
        mockPrisma.article.count.mockResolvedValue(25);

        const response = await request(app)
          .get('/api/author/articles/me?page=2&limit=5')
          .set('Authorization', authToken);

        expect(response.status).toBe(200);
        expect(response.body.PageNumber).toBe(2);
        expect(response.body.PageSize).toBe(5);
        expect(response.body.TotalSize).toBe(25);
      });
    });

    describe('PUT /api/author/articles/:id', () => {
      it('should update article successfully', async () => {
        const updateData = {
          title: 'Updated Title',
          content: 'Updated content that meets the minimum length requirement.',
          category: 'Sports'
        };

        const mockUpdatedArticle = {
          id: 'article-123',
          ...updateData,
          authorId: 'author-123',
          status: 'Published',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: 'author-123',
            name: 'John Doe'
          }
        };

        mockPrisma.article.findUnique.mockResolvedValue({
          id: 'article-123',
          authorId: 'author-123',
          deletedAt: null
        });
        mockPrisma.article.update.mockResolvedValue(mockUpdatedArticle);

        const response = await request(app)
          .put('/api/author/articles/article-123')
          .set('Authorization', authToken)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body);
        expect(response.body.Success).toBe(true);
        expect(response.body.Object.title).toBe(updateData.title);
      });

      it('should return error when trying to update another author\'s article', async () => {
        mockPrisma.article.findUnique.mockResolvedValue({
          id: 'article-123',
          authorId: 'different-author',
          deletedAt: null
        });

        const response = await request(app)
          .put('/api/author/articles/article-123')
          .set('Authorization', authToken)
          .send({ title: 'Updated' });

        expect(response.status).toBe(403);
        expect(response.body);
        expect(response.body.Success).toBe(false);
        expect(response.body.Errors).toContain('You can only edit your own articles');
      });
    });

    describe('DELETE /api/author/articles/:id', () => {
      it('should soft delete article successfully', async () => {
        const mockDeletedArticle = {
          id: 'article-123',
          title: 'Test Article',
          authorId: 'author-123',
          deletedAt: new Date(),
          author: {
            id: 'author-123',
            name: 'John Doe'
          }
        };

        mockPrisma.article.findUnique.mockResolvedValue({
          id: 'article-123',
          authorId: 'author-123',
          deletedAt: null
        });
        mockPrisma.article.update.mockResolvedValue(mockDeletedArticle);

        const response = await request(app)
          .delete('/api/author/articles/article-123')
          .set('Authorization', authToken);

        expect(response.status).toBe(200);
        expect(response.body);
        expect(response.body.Success).toBe(true);
        expect(response.body.Object.deletedAt).toBeTruthy();
      });

      it('should return error when trying to delete another author\'s article', async () => {
        mockPrisma.article.findUnique.mockResolvedValue({
          id: 'article-123',
          authorId: 'different-author',
          deletedAt: null
        });

        const response = await request(app)
          .delete('/api/author/articles/article-123')
          .set('Authorization', authToken);

        expect(response.status).toBe(403);
        expect(response.body);
        expect(response.body.Success).toBe(false);
        expect(response.body.Errors).toContain('You can only delete your own articles');
      });
    });
  });

  describe('Public Article Access', () => {
    describe('GET /api/articles', () => {
      it('should get published articles successfully', async () => {
        const mockArticles = [
          {
            id: 'article-1',
            title: 'Public Article 1',
            content: 'Content 1',
            category: 'Tech',
            status: 'Published',
            deletedAt: null,
            createdAt: new Date(),
            author: {
              id: 'author-1',
              name: 'John Doe'
            }
          }
        ];

        mockPrisma.article.findMany.mockResolvedValue(mockArticles);
        mockPrisma.article.count.mockResolvedValue(1);

        const response = await request(app)
          .get('/api/articles');

        expect(response.status).toBe(200);
        expect(response.body);
        expect(response.body.Success).toBe(true);
        expect(response.body.Object).toHaveLength(1);
      });

      it('should filter by category', async () => {
        mockPrisma.article.findMany.mockResolvedValue([]);
        mockPrisma.article.count.mockResolvedValue(0);

        const response = await request(app)
          .get('/api/articles?category=Tech');

        expect(response.status).toBe(200);
        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              category: 'Tech'
            })
          })
        );
      });

      it('should search by keyword', async () => {
        mockPrisma.article.findMany.mockResolvedValue([]);
        mockPrisma.article.count.mockResolvedValue(0);

        const response = await request(app)
          .get('/api/articles?q=javascript');

        expect(response.status).toBe(200);
        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  title: expect.objectContaining({
                    contains: 'javascript'
                  })
                }),
                expect.objectContaining({
                  content: expect.objectContaining({
                    contains: 'javascript'
                  })
                })
              ])
            })
          })
        );
      });

      it('should not return deleted articles', async () => {
        mockPrisma.article.findMany.mockResolvedValue([]);
        mockPrisma.article.count.mockResolvedValue(0);

        const response = await request(app)
          .get('/api/articles');

        expect(response.status).toBe(200);
        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: 'Published',
              deletedAt: null
            })
          })
        );
      });
    });

    describe('GET /api/articles/:id', () => {
      it('should get article by id successfully', async () => {
        const mockArticle = {
          id: 'article-123',
          title: 'Test Article',
          content: 'Test content',
          category: 'Tech',
          status: 'Published',
          deletedAt: null,
          createdAt: new Date(),
          author: {
            id: 'author-123',
            name: 'John Doe'
          }
        };

        mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
        mockRedis.get.mockResolvedValue(null);
        mockRedis.setex.mockResolvedValue('OK');
        mockAnalyticsQueue.add.mockResolvedValue({});

        const response = await request(app)
          .get('/api/articles/article-123');

        expect(response.status).toBe(200);
        expect(response.body);
        expect(response.body.Success).toBe(true);
        expect(response.body.Object.title).toBe(mockArticle.title);
        expect(response.body.Object.readTracked).toBe(true);
      });

      it('should not track read if recently read', async () => {
        const mockArticle = {
          id: 'article-123',
          title: 'Test Article',
          content: 'Test content',
          category: 'Tech',
          status: 'Published',
          deletedAt: null,
          createdAt: new Date(),
          author: {
            id: 'author-123',
            name: 'John Doe'
          }
        };

        mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
        mockRedis.get.mockResolvedValue('1'); // Recently read

        const response = await request(app)
          .get('/api/articles/article-123');

        expect(response.status).toBe(200);
        expect(response.body.Object.readTracked).toBe(false);
        expect(mockAnalyticsQueue.add).not.toHaveBeenCalled();
      });

      it('should return error for deleted article', async () => {
        mockPrisma.article.findUnique.mockResolvedValue({
          id: 'article-123',
          deletedAt: new Date()
        });

        const response = await request(app)
          .get('/api/articles/article-123');

        expect(response.status).toBe(404);
        expect(response.body);
        expect(response.body.Success).toBe(false);
        expect(response.body.Errors).toContain('News article no longer available');
      });

      it('should return error for non-existent article', async () => {
        mockPrisma.article.findUnique.mockResolvedValue(null);

        const response = await request(app)
          .get('/api/articles/non-existent');

        expect(response.status).toBe(404);
        expect(response.body);
        expect(response.body.Success).toBe(false);
        expect(response.body.Errors).toContain('News article no longer available');
      });

      it('should enforce rate limiting', async () => {
        mockPrisma.article.findUnique.mockResolvedValue({
          id: 'article-123',
          title: 'Test Article',
          deletedAt: null
        });
        mockRedis.incr.mockResolvedValue('6'); // Exceeds limit

        const response = await request(app)
          .get('/api/articles/article-123');

        expect(response.status).toBe(429);
        expect(response.body);
        expect(response.body.Success).toBe(false);
        expect(response.body.Errors).toContain('Too many reads in short time');
      });
    });
  });
});
