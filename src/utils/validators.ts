import { body, param, query } from 'express-validator';

export const validateSignup = [
  body('name')
    .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only alphabets and spaces'),
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  body('role')
    .isIn(['author', 'reader']).withMessage('Role must be either author or reader')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

export const validateArticle = [
  body('title')
    .isLength({ min: 1, max: 150 }).withMessage('Title must be between 1 and 150 characters'),
  body('content')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('category')
    .isIn(['Politics', 'Tech', 'Sports', 'Health']).withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['Draft', 'Published']).withMessage('Status must be Draft or Published')
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];

export const validateArticleFilters = [
  query('category').optional().isIn(['Politics', 'Tech', 'Sports', 'Health']),
  query('author').optional().isString(),
  query('q').optional().isString()
];