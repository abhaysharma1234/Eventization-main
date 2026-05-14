import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { sanitizeInput } from './middleware/validation.js';
import { 
  apiLimiter, 
  authLimiter, 
  registrationLimiter, 
  reviewLimiter, 
  eventCreationLimiter,
  securityHeaders,
  uploadLimiter,
  blockSuspiciousRequests
} from './middleware/security.js';
import { requestLogger, errorLogger } from './utils/logger.js';
import { monitoring } from './utils/monitoring.js';
import { connectDB } from './config/db.js';
import { initSocket } from './services/socket.js';
import ModelInitializer from './services/modelInitializer.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Security & utils
app.use(helmet());
app.use(securityHeaders); // Custom security headers
app.use(blockSuspiciousRequests); // Block suspicious requests
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(morgan('combined')); // Changed to 'combined' for production logging
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(sanitizeInput); // Add input sanitization
app.use(requestLogger); // Add request logging

// Apply rate limiting
app.use('/api', apiLimiter); // General API rate limiting

// Static posters
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes with specific rate limiting
app.get('/api/health', (req, res) => res.json(monitoring.getHealthStatus()));
app.get('/api/metrics', (req, res) => res.json(monitoring.getMetrics()));
app.use('/api/auth', authLimiter, authRoutes);
app.post('/api/events', eventCreationLimiter); // Only rate-limit event creation (POST)
app.use('/api/events', eventRoutes);
app.post('/api/registrations/:id/register', registrationLimiter); // Only rate-limit registration action
app.use('/api/registrations', registrationRoutes);
app.post('/api/reviews/:id', reviewLimiter); // Only rate-limit review submission
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error logging middleware (before global error handler)
app.use(errorLogger);

// Global error handler
app.use(globalErrorHandler);

async function start() {
  await connectDB();
  
  // Initialize AI models
  await ModelInitializer.initializeModels();
  
  initSocket(server, env.clientUrl);
  server.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

start();


