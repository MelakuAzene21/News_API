import request from 'supertest';
import app from '../app';
import { mockPrisma, mockJwt } from './setup';

describe('Dashboard Endpoints', () => {
  const authToken = 'Bearer valid-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/author/dashboard', () => {
    it('should get author dashboard successfully', async () => {
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

      const response = await request(app)
        .get('/api/author/dashboard')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body.Success).toBe(true);
      expect(response.body.Object).toHaveLength(2);
      expect(response.body.Object[0]).toMatchObject({
        id: 'article-1',
        title: 'Article 1',
        totalViews: 25 // 10 + 15
      });
      expect(response.body.Object[1]).toMatchObject({
        id: 'article-2',
        title: 'Article 2',
        totalViews: 5
      });
      expect(response.body.PageNumber).toBe(1);
      expect(response.body.PageSize).toBe(10);
      expect(response.body.TotalSize).toBe(2);
    });

    it('should exclude soft-deleted articles', async () => {
      mockPrisma.article.findMany.mockResolvedValue([]);
      mockPrisma.article.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/author/dashboard')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null
          })
        })
      );
    });

    it('should support pagination', async () => {
      mockPrisma.article.findMany.mockResolvedValue([]);
      mockPrisma.article.count.mockResolvedValue(25);

      const response = await request(app)
        .get('/api/author/dashboard?page=2&limit=5')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body.PageNumber).toBe(2);
      expect(response.body.PageSize).toBe(5);
      expect(response.body.TotalSize).toBe(25);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/author/dashboard');

      expect(response.status).toBe(401);
    });

    it('should require author role', async () => {
      // Mock the JWT verification to return a reader role
      mockJwt.verify.mockReturnValue({ sub: 'user-123', role: 'reader' });

      const response = await request(app)
        .get('/api/author/dashboard')
        .set('Authorization', authToken);

      expect(response.status).toBe(403);
    });
  });
});
