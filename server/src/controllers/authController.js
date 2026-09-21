const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const env = require('../config/env');

function generateToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return ApiResponse.badRequest(res, 'Please provide name, email, and password');
      }

      if (password.length < 6) {
        return ApiResponse.badRequest(res, 'Password must be at least 6 characters long');
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return ApiResponse.conflict(res, 'An account with this email already exists', 'EMAIL_IN_USE');
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password
      });

      const token = generateToken(user._id);

      return ApiResponse.created(res, {
        token,
        user: user.toSafeObject()
      }, 'User registered successfully');
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.badRequest(res, 'Please provide email and password');
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return ApiResponse.unauthorized(res, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const token = generateToken(user._id);

      return ApiResponse.success(res, {
        token,
        user: user.toSafeObject()
      }, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  async getMe(req, res) {
    return ApiResponse.success(res, {
      user: req.user.toSafeObject()
    });
  }

  async updateProfile(req, res, next) {
    try {
      const { name, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      if (name) {
        user.name = name.trim();
      }

      if (newPassword) {
        if (!currentPassword) {
          return ApiResponse.badRequest(res, 'Current password is required to set a new password');
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return ApiResponse.badRequest(res, 'Current password is incorrect');
        }
        if (newPassword.length < 6) {
          return ApiResponse.badRequest(res, 'New password must be at least 6 characters long');
        }
        user.password = newPassword;
      }

      await user.save();

      return ApiResponse.success(res, {
        user: user.toSafeObject()
      }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
