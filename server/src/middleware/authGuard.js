const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const authGuard = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      // Allow token in query parameter specifically for browser preview / direct download streams
      token = req.query.token;
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication required. No token provided.', 'NO_TOKEN');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Session expired. Please log in again.', 'TOKEN_EXPIRED');
      }
      return ApiResponse.unauthorized(res, 'Invalid authentication token.', 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.unauthorized(res, 'User account associated with token no longer exists.', 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Authentication verification failed', 500, 'AUTH_ERROR');
  }
};

module.exports = authGuard;
