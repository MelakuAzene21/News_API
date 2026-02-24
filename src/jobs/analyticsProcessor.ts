import '../config/redis'; // Initialize Redis connection
import { QueueService } from '../services/queueService';
import prisma from '../config/database';

console.log('Analytics processor started');

QueueService.initialize();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down analytics processor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down analytics processor...');
  await prisma.$disconnect();
  process.exit(0);
});