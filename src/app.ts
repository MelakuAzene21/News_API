import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import articleRoutes from './routes/articleRoutes';
import readerRoutes from './routes/readerRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import database
import prisma from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/author/articles', articleRoutes); // Author article management routes
app.use('/api', readerRoutes);  // Public reader routes
app.use('/api/author', dashboardRoutes); // Author dashboard

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed');
  });
});

export default app;