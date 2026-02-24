import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { formatResponse } from '../utils/responseFormatter';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      
      const result = await authService.signup({
        name,
        email,
        password,
        role
      });

      res.status(201).json(formatResponse(
        'User created successfully',
        {
          user: result.user,
          token: result.token
        }
      ));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);

      res.json(formatResponse(
        'Login successful',
        {
          user: result.user,
          token: result.token
        }
      ));
    } catch (error) {
      next(error);
    }
  }
}