import { Router } from 'express';
import { ReaderController } from '../controllers/readerController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { validateArticleFilters, validatePagination } from '../utils/validators';
import { articleReadLimiter } from '../middleware/rateLimiter';

const router = Router();
const readerController = new ReaderController();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     tags: [Articles - Public]
 *     summary: Get published articles
 *     description: Retrieve a paginated list of published articles with filtering options
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Politics, Tech, Sports, Health]
 *         description: Filter by article category
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author name (partial match, case insensitive)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search in title and content (case insensitive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               Success: true
 *               Message: "Articles retrieved successfully"
 *               Object:
 *                 - id: "article-123"
 *                   title: "Breaking Tech News"
 *                   content: "Article content here..."
 *                   category: "Tech"
 *                   status: "Published"
 *                   author:
 *                     id: "author-123"
 *                     name: "John Doe"
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *               PageNumber: 1
 *               PageSize: 10
 *               TotalSize: 25
 *               Errors: null
 */
router.get(
  '/articles',
  validate([...validateArticleFilters, ...validatePagination]),
  readerController.getPublishedArticles
);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     tags: [Articles - Public]
 *     summary: Get article by ID
 *     description: Retrieve a specific article by its ID. Supports both authenticated and guest readers.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Article ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     Object:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Article'
 *                         - type: object
 *                           properties:
 *                             readTracked:
 *                               type: boolean
 *                               description: "Whether this read was tracked for analytics"
 *                   example:
 *                     Success: true
 *                     Message: "Article retrieved successfully"
 *                     Object:
 *                       id: "article-123"
 *                       title: "Breaking Tech News"
 *                       content: "Article content here..."
 *                       category: "Tech"
 *                       status: "Published"
 *                       author:
 *                         id: "author-123"
 *                         name: "John Doe"
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *                       readTracked: true
 *                     Errors: null
 *       404:
 *         description: Article not found or deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/articles/:id',
  articleReadLimiter,
  authenticate, // Optional auth - user may or may not be logged in
  readerController.getArticleById
);

export default router;