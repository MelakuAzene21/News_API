import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { requireAuthor } from '../middleware/roleGuard';
import { validate } from '../middleware/validation';
import { validatePagination } from '../utils/validators';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate, requireAuthor);
router.get(
  '/dashboard',
  validate(validatePagination),
  dashboardController.getAuthorDashboard
);

export default router;