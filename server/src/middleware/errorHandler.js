const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const env = require('../config/env');

// Centralized error handler
const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  // Multer Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.badRequest(
        res,
        `File is too large. Maximum allowed size is ${env.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
        'FILE_TOO_LARGE'
      );
    }
    return ApiResponse.badRequest(res, err.message, 'UPLOAD_ERROR');
  }

  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.badRequest(res, messages.join(', '), 'VALIDATION_ERROR', err.errors);
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.badRequest(res, `Invalid resource identifier: ${err.value}`, 'INVALID_ID');
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.conflict(res, `A record with this ${field} already exists.`, 'DUPLICATE_KEY');
  }

  // General Error Fallback
  const statusCode = err.statusCode || 500;
  const message = err.isOperational || env.NODE_ENV !== 'production' ? err.message : 'An unexpected server error occurred';

  return ApiResponse.error(res, message, statusCode, err.code || 'INTERNAL_SERVER_ERROR');
};

module.exports = errorHandler;
