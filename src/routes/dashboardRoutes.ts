import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { requireAuthor } from '../middleware/roleGuard';
import { validate } from '../middleware/validation';
import { validatePagination } from '../utils/validators';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate, requireAuthor);

/**
 * @swagger
 * /api/author/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get author dashboard
 *     description: Retrieve author dashboard with article performance metrics including view counts. Excludes soft-deleted articles.
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
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               Success: true
 *               Message: "Dashboard data retrieved successfully"
 *               Object:
 *                 - id: "article-123"
 *                   title: "Breaking Tech News"
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   status: "Published"
 *                   category: "Tech"
 *                   totalViews: 150
 *                 - id: "article-456"
 *                   title: "Sports Update"
 *                   createdAt: "2023-01-02T00:00:00.000Z"
 *                   status: "Published"
 *                   category: "Sports"
 *                   totalViews: 75
 *               PageNumber: 1
 *               PageSize: 10
 *               TotalSize: 2
 *               Errors: null
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
router.get(
  '/dashboard',
  validate(validatePagination),
  dashboardController.getAuthorDashboard
);

export default router;