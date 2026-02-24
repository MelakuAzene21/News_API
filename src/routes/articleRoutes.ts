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

router.post('/', validate(validateArticle), articleController.createArticle);
router.get('/me', validate(validatePagination), articleController.getMyArticles);
router.put('/:id', validate(validateArticle), articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

export default router;