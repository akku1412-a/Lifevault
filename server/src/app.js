const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Health-Check & Database Connectivity Endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  return ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    database: {
      status: mongoStatus,
      host: mongoose.connection.host || 'embedded-memory'
    }
  }, 'LifeVault Backend API is operational');
});

// Mount Core Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

// Catch 404 for unhandled API routes
app.use('/api/*', (req, res) => {
  return ApiResponse.notFound(res, `API route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND');
});

// Centralized error handling middleware
app.use(errorHandler);

// Server startup lifecycle
let server = null;

async function startServer(port = env.PORT) {
  try {
    await connectDB();

    server = app.listen(port, () => {
      logger.info(`=========================================`);
      logger.info(`  LifeVault API Server (Phase 1) running`);
      logger.info(`  Port: ${port}`);
      logger.info(`  Environment: ${env.NODE_ENV}`);
      logger.info(`  Health Check: http://localhost:${port}/api/health`);
      logger.info(`=========================================`);
    });

    return server;
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
