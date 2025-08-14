const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseHandler');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Validation rules
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const registerValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'supervisor', 'user'])
    .withMessage('Invalid role')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, asyncHandler(async (req, res) => {

  const { username, password } = req.body;

  // Find user
  const user = await database.get(
    'SELECT * FROM users WHERE username = ? AND is_active = 1',
    [username]
  );

  if (!user) {
    logger.logAuth('login_failed', null, { username, reason: 'user_not_found', ip: req.ip });
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    logger.logAuth('login_failed', user.id, { username, reason: 'invalid_password', ip: req.ip });
    throw new AppError('Invalid credentials', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Update last login
  await database.run(
    'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [user.id]
  );

  logger.logAuth('login_success', user.id, { username, ip: req.ip });

  sendSuccess(res, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  }, 'Login successful');
}));

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (or Admin only in production)
router.post('/register', registerValidation, handleValidationErrors, asyncHandler(async (req, res) => {

  const { username, email, password, role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = await database.get(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const result = await database.run(
    `INSERT INTO users (username, email, password_hash, role) 
     VALUES (?, ?, ?, ?)`,
    [username, email, passwordHash, role]
  );

  const newUser = await database.get(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [result.id]
  );

  logger.logAuth('user_registered', newUser.id, { username, email, role, ip: req.ip });

  sendSuccess(res, {
    user: newUser
  }, 'User registered successfully', 201);
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verify user still exists and is active
    const user = await database.get(
      'SELECT id, username, email, role FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    logger.logAuth('token_refreshed', user.id, { ip: req.ip });

    sendSuccess(res, {
      user,
      tokens
    }, 'Token refreshed successfully');
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid refresh token', 401);
    }
    throw error;
  }
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just log the logout event
  
  logger.logAuth('logout', req.user.id, { ip: req.ip });
  
  sendSuccess(res, null, 'Logged out successfully');
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await database.get(
    'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
    [req.user.id]
  );

  sendSuccess(res, { user }, 'User profile retrieved');
}));

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, changePasswordValidation, handleValidationErrors, asyncHandler(async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  // Get current user with password
  const user = await database.get(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.user.id]
  );

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await database.run(
    'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newPasswordHash, req.user.id]
  );

  logger.logAuth('password_changed', req.user.id, { ip: req.ip });

  sendSuccess(res, null, 'Password changed successfully');
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { email } = req.body;
  const updates = [];
  const values = [];

  if (email) {
    // Check if email is already taken by another user
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    updates.push('email = ?');
    values.push(email);
  }

  if (updates.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.user.id);

  await database.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  const updatedUser = await database.get(
    'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
    [req.user.id]
  );

  logger.logAuth('profile_updated', req.user.id, { changes: { email }, ip: req.ip });

  sendSuccess(res, { user: updatedUser }, 'Profile updated successfully');
}));

module.exports = router;