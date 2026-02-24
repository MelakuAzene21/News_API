import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { validateSignup, validateLogin } from '../utils/validators';

const router = Router();
const authController = new AuthController();

router.post('/signup', validate(validateSignup), authController.signup);
router.post('/login', validate(validateLogin), authController.login);

export default router;