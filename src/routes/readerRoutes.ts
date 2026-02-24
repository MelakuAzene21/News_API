import { Router } from 'express';
import { ReaderController } from '../controllers/readerController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { validateArticleFilters, validatePagination } from '../utils/validators';
import { articleReadLimiter } from '../middleware/rateLimiter';

const router = Router();
const readerController = new ReaderController();

// Public routes (some may require optional auth)
router.get(
  '/articles',
  validate([...validateArticleFilters, ...validatePagination]),
  readerController.getPublishedArticles
);

router.get(
  '/articles/:id',
  articleReadLimiter,
  authenticate, // Optional auth - user may or may not be logged in
  readerController.getArticleById
);

export default router;