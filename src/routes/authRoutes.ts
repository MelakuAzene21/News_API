import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { validateSignup, validateLogin } from '../utils/validators';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     Object:
 *                       $ref: '#/components/schemas/AuthResponse'
 *                   example:
 *                     Success: true
 *                     Message: "User created successfully"
 *                     Object:
 *                       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       user:
 *                         id: "user-123"
 *                         name: "John Doe"
 *                         email: "john@example.com"
 *                         role: "author"
 *                         createdAt: "2023-01-01T00:00:00.000Z"
 *                     Errors: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/signup', validate(validateSignup), authController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     Object:
 *                       $ref: '#/components/schemas/AuthResponse'
 *                   example:
 *                     Success: true
 *                     Message: "Login successful"
 *                     Object:
 *                       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       user:
 *                         id: "user-123"
 *                         name: "John Doe"
 *                         email: "john@example.com"
 *                         role: "author"
 *                         createdAt: "2023-01-01T00:00:00.000Z"
 *                     Errors: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', validate(validateLogin), authController.login);

export default router;