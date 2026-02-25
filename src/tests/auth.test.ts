import request from 'supertest';
import app from '../app';
import { mockPrisma } from './setup';

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'author'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.Success).toBe(true);
      expect(response.body.Message).toBeTruthy();
      expect(response.body.Object).toHaveProperty('token');
      expect(response.body.Object.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'author'
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: userData.email
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body);
      expect(response.body.Success).toBe(false);
      expect(response.body.Errors).toContain('Email already registered');
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body);
      expect(response.body.Success).toBe(false);
      expect(Array.isArray(response.body.Errors)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: loginData.email,
        role: 'author',
        password: 'hashed-password'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body);
      expect(response.body.Success).toBe(true);
      expect(response.body.Object).toHaveProperty('token');
      expect(response.body.Object.user).toMatchObject({
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      });
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrong-password'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body);
      expect(response.body.Success).toBe(false);
      expect(response.body.Errors).toContain('Invalid credentials');
    });

    it('should return validation errors for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body);
      expect(response.body.Success).toBe(false);
      expect(Array.isArray(response.body.Errors)).toBe(true);
    });
  });
});
