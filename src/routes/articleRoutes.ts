import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { authenticate } from '../middleware/auth';
import { requireAuthor } from '../middleware/roleGuard';
import { validate } from '../middleware/validation';
import { validateArticle, validatePagination } from '../utils/validators';

const router = Router();
const articleController = new ArticleController();

// All article management routes require authentication and author role
router.use(authenticate, requireAuthor);

/**
 * @swagger
 * /api/author/articles:
 *   post:
 *     tags: [Articles - Author]
 *     summary: Create a new article
 *     description: Create a new article. Requires authentication and author role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArticleRequest'
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     Object:
 *                       $ref: '#/components/schemas/Article'
 *                   example:
 *                     Success: true
 *                     Message: "Article created successfully"
 *                     Object:
 *                       id: "article-123"
 *                       title: "Breaking Tech News"
 *                       content: "Article content here..."
 *                       category: "Tech"
 *                       status: "Draft"
 *                       author:
 *                         id: "author-123"
 *                         name: "John Doe"
 *                         email: "john@example.com"
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *                     Errors: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires author role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(validateArticle), articleController.createArticle);

/**
 * @swagger
 * /api/author/articles/me:
 *   get:
 *     tags: [Articles - Author]
 *     summary: Get my articles
 *     description: Retrieve a paginated list of articles belonging to the authenticated author. Includes soft-deleted articles when specified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include soft-deleted articles
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires author role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', validate(validatePagination), articleController.getMyArticles);

/**
 * @swagger
 * /api/author/articles/{id}:
 *   put:
 *     tags: [Articles - Author]
 *     summary: Update article
 *     description: Update an existing article. Only the article author can update their own articles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArticleRequest'
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     Object:
 *                       $ref: '#/components/schemas/Article'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - can only edit own articles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validate(validateArticle), articleController.updateArticle);

/**
 * @swagger
 * /api/author/articles/{id}:
 *   delete:
 *     tags: [Articles - Author]
 *     summary: Delete article
 *     description: Soft delete an article. Only the article author can delete their own articles. The article is not permanently removed but marked as deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article deleted successfully
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
 *                             deletedAt:
 *                               type: string
 *                               format: date-time
 *                               description: "Soft deletion timestamp"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - can only delete own articles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', articleController.deleteArticle);

export default router;