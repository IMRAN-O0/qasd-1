const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError, sendSuccess, formatValidationErrors } = require('../middleware/errorHandler');
const { authorize, checkPermission } = require('../middleware/auth');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Helper function to validate setting category
const validateCategory = (category) => {
  const validCategories = [
    'company', 'system', 'email', 'backup', 'security',
    'notifications', 'printing', 'inventory', 'production',
    'sales', 'hr', 'safety', 'reports'
  ];
  return validCategories.includes(category);
};

// Helper function to validate setting data type
const validateDataType = (dataType, value) => {
  switch (dataType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(parseFloat(value));
    case 'boolean':
      return value === 'true' || value === 'false' || typeof value === 'boolean';
    case 'json':
      try {
        JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    default:
      return true;
  }
};

// Helper function to convert value based on data type
const convertValue = (dataType, value) => {
  switch (dataType) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === 'true' || value === true;
    case 'json':
      return typeof value === 'string' ? JSON.parse(value) : value;
    default:
      return value;
  }
};

// ============ SETTINGS MANAGEMENT ============

// @route   GET /api/settings
// @desc    Get all settings or filter by category
// @access  Private (Admin/Manager)
router.get('/',
  authorize(['admin', 'manager']),
  [
    query('category').optional().isString().trim(),
    query('key').optional().isString().trim()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array())
      });
    }

    const { category, key } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
      if (!validateCategory(category)) {
        throw new AppError('Invalid category', 400);
      }
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (key) {
      whereClause += ' AND key = ?';
      params.push(key);
    }

    const settings = await database.all(
      `SELECT * FROM settings ${whereClause} ORDER BY category, key`,
      params
    );

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      
      // Convert value based on data type
      let convertedValue = setting.value;
      try {
        convertedValue = convertValue(setting.data_type, setting.value);
      } catch (error) {
        logger.logError('Setting value conversion failed', {
          settingId: setting.id,
          key: setting.key,
          dataType: setting.data_type,
          value: setting.value,
          error: error.message
        });
      }

      acc[setting.category][setting.key] = {
        id: setting.id,
        value: convertedValue,
        data_type: setting.data_type,
        description: setting.description,
        is_public: setting.is_public,
        updated_at: setting.updated_at
      };
      
      return acc;
    }, {});

    sendSuccess(res, { settings: groupedSettings });
  })
);

// @route   GET /api/settings/public
// @desc    Get public settings (accessible without authentication)
// @access  Public
router.get('/public',
  asyncHandler(async (req, res) => {
    const settings = await database.all(
      'SELECT category, key, value, data_type FROM settings WHERE is_public = 1 ORDER BY category, key'
    );

    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      
      let convertedValue = setting.value;
      try {
        convertedValue = convertValue(setting.data_type, setting.value);
      } catch (error) {
        // Silently handle conversion errors for public settings
        convertedValue = setting.value;
      }

      acc[setting.category][setting.key] = convertedValue;
      return acc;
    }, {});

    sendSuccess(res, { settings: groupedSettings });
  })
);

// @route   POST /api/settings
// @desc    Create new setting
// @access  Private (Admin only)
router.post('/',
  authorize(['admin']),
  [
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('key').notEmpty().withMessage('Key is required').trim(),
    body('value').notEmpty().withMessage('Value is required'),
    body('data_type').isIn(['string', 'number', 'boolean', 'json', 'email', 'url']).withMessage('Invalid data type'),
    body('description').optional().trim(),
    body('is_public').optional().isBoolean().withMessage('is_public must be boolean')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array())
      });
    }

    const { category, key, value, data_type, description, is_public = false } = req.body;

    // Validate category
    if (!validateCategory(category)) {
      throw new AppError('Invalid category', 400);
    }

    // Validate value against data type
    if (!validateDataType(data_type, value)) {
      throw new AppError(`Invalid value for data type ${data_type}`, 400);
    }

    // Check if setting already exists
    const existingSetting = await database.get(
      'SELECT id FROM settings WHERE category = ? AND key = ?',
      [category, key]
    );

    if (existingSetting) {
      throw new AppError('Setting with this category and key already exists', 409);
    }

    // Convert and store value
    const storedValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();

    const result = await database.run(
      `INSERT INTO settings (category, key, value, data_type, description, is_public)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category, key, storedValue, data_type, description, is_public ? 1 : 0]
    );

    const setting = await database.get(
      'SELECT * FROM settings WHERE id = ?',
      [result.id]
    );

    logger.logBusiness('setting_created', {
      settingId: setting.id,
      category: category,
      key: key,
      dataType: data_type,
      isPublic: is_public,
      userId: req.user.id
    });

    sendSuccess(res, { setting }, 'Setting created successfully', 201);
  })
);

// @route   PUT /api/settings/:id
// @desc    Update setting
// @access  Private (Admin only)
router.put('/:id',
  authorize(['admin']),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid setting ID'),
    body('value').notEmpty().withMessage('Value is required'),
    body('description').optional().trim(),
    body('is_public').optional().isBoolean().withMessage('is_public must be boolean')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array())
      });
    }

    const settingId = req.params.id;
    const { value, description, is_public } = req.body;

    // Get current setting
    const currentSetting = await database.get(
      'SELECT * FROM settings WHERE id = ?',
      [settingId]
    );

    if (!currentSetting) {
      throw new AppError('Setting not found', 404);
    }

    // Validate value against data type
    if (!validateDataType(currentSetting.data_type, value)) {
      throw new AppError(`Invalid value for data type ${currentSetting.data_type}`, 400);
    }

    // Convert and store value
    const storedValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();

    // Prepare update fields
    const updates = ['value = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [storedValue];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (is_public !== undefined) {
      updates.push('is_public = ?');
      values.push(is_public ? 1 : 0);
    }

    values.push(settingId);

    await database.run(
      `UPDATE settings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedSetting = await database.get(
      'SELECT * FROM settings WHERE id = ?',
      [settingId]
    );

    logger.logBusiness('setting_updated', {
      settingId: updatedSetting.id,
      category: updatedSetting.category,
      key: updatedSetting.key,
      oldValue: currentSetting.value,
      newValue: storedValue,
      userId: req.user.id
    });

    sendSuccess(res, { setting: updatedSetting }, 'Setting updated successfully');
  })
);

// @route   DELETE /api/settings/:id
// @desc    Delete setting
// @access  Private (Admin only)
router.delete('/:id',
  authorize(['admin']),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid setting ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array())
      });
    }

    const settingId = req.params.id;

    const setting = await database.get(
      'SELECT * FROM settings WHERE id = ?',
      [settingId]
    );

    if (!setting) {
      throw new AppError('Setting not found', 404);
    }

    await database.run('DELETE FROM settings WHERE id = ?', [settingId]);

    logger.logBusiness('setting_deleted', {
      settingId: setting.id,
      category: setting.category,
      key: setting.key,
      userId: req.user.id
    });

    sendSuccess(res, null, 'Setting deleted successfully');
  })
);

// ============ BULK SETTINGS OPERATIONS ============

// @route   PUT /api/settings/bulk
// @desc    Update multiple settings at once
// @access  Private (Admin only)
router.put('/bulk',
  authorize(['admin']),
  [
    body('settings').isArray({ min: 1 }).withMessage('Settings array is required'),
    body('settings.*.id').isInt({ min: 1 }).withMessage('Valid setting ID is required'),
    body('settings.*.value').notEmpty().withMessage('Value is required for each setting')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array())
      });
    }

    const { settings } = req.body;
    const updatedSettings = [];
    const updateLog = [];

    // Start transaction
    await database.run('BEGIN TRANSACTION');

    try {
      for (const settingUpdate of settings) {
        const { id, value } = settingUpdate;

        // Get current setting
        const currentSetting = await database.get(
          'SELECT * FROM settings WHERE id = ?',
          [id]
        );

        if (!currentSetting) {
          throw new AppError(`Setting with ID ${id} not found`, 404);
        }

        // Validate value against data type
        if (!validateDataType(currentSetting.data_type, value)) {
          throw new AppError(`Invalid value for setting ${currentSetting.key} (${currentSetting.data_type})`, 400);
        }

        // Convert and store value
        const storedValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();

        await database.run(
          'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [storedValue, id]
        );

        const updatedSetting = await database.get(
          'SELECT * FROM settings WHERE id = ?',
          [id]
        );

        updatedSettings.push(updatedSetting);
        updateLog.push({
          settingId: id,
          category: currentSetting.category,
          key: currentSetting.key,
          oldValue: currentSetting.value,
          newValue: storedValue
        });
      }

      await database.run('COMMIT');

      logger.logBusiness('settings_bulk_updated', {
        updatedCount: updatedSettings.length,
        updates: updateLog,
        userId: req.user.id
      });

      sendSuccess(res, { settings: updatedSettings }, 'Settings updated successfully');
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  })
);

// ============ SYSTEM CONFIGURATION ============

// @route   GET /api/settings/system/info
// @desc    Get system information
// @access  Private (Admin/Manager)
router.get('/system/info',
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Database info
    const dbInfo = await database.get(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );

    const tableCount = await database.get(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'"
    );

    // Get database file size
    let dbSize = 0;
    try {
      const stats = await fs.stat(process.env.DATABASE_PATH || './data/qasd.db');
      dbSize = stats.size;
    } catch (error) {
      logger.logError('Failed to get database size', { error: error.message });
    }

    const databaseInfo = {
      table_count: tableCount.count,
      size_bytes: dbSize,
      size_mb: (dbSize / (1024 * 1024)).toFixed(2)
    };

    sendSuccess(res, {
      system: systemInfo,
      database: databaseInfo,
      timestamp: new Date().toISOString()
    });
  })
);

// @route   POST /api/settings/system/backup
// @desc    Create database backup
// @access  Private (Admin only)
router.post('/system/backup',
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const backupDir = process.env.BACKUP_PATH || './backups';
    const dbPath = process.env.DATABASE_PATH || './data/qasd.db';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `qasd_backup_${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Copy database file
      await fs.copyFile(dbPath, backupPath);

      // Get backup file size
      const stats = await fs.stat(backupPath);

      logger.logBusiness('database_backup_created', {
        backupFileName: backupFileName,
        backupPath: backupPath,
        sizeBytes: stats.size,
        userId: req.user.id
      });

      sendSuccess(res, {
        backup_file: backupFileName,
        backup_path: backupPath,
        size_bytes: stats.size,
        size_mb: (stats.size / (1024 * 1024)).toFixed(2),
        created_at: new Date().toISOString()
      }, 'Database backup created successfully');
    } catch (error) {
      logger.logError('Database backup failed', {
        error: error.message,
        backupPath: backupPath,
        userId: req.user.id
      });
      throw new AppError('Failed to create database backup', 500);
    }
  })
);

// @route   GET /api/settings/system/backups
// @desc    List available backups
// @access  Private (Admin only)
router.get('/system/backups',
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const backupDir = process.env.BACKUP_PATH || './backups';

    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = [];

      for (const file of files) {
        if (file.endsWith('.db')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backupFiles.push({
            filename: file,
            size_bytes: stats.size,
            size_mb: (stats.size / (1024 * 1024)).toFixed(2),
            created_at: stats.birthtime,
            modified_at: stats.mtime
          });
        }
      }

      // Sort by creation date (newest first)
      backupFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      sendSuccess(res, { backups: backupFiles });
    } catch (error) {
      if (error.code === 'ENOENT') {
        sendSuccess(res, { backups: [] });
      } else {
        logger.logError('Failed to list backups', { error: error.message });
        throw new AppError('Failed to list backup files', 500);
      }
    }
  })
);

// ============ COMPANY PROFILE ============

// @route   GET /api/settings/company
// @desc    Get company profile settings
// @access  Private
router.get('/company',
  checkPermission('read_all'),
  asyncHandler(async (req, res) => {
    const companySettings = await database.all(
      "SELECT key, value, data_type FROM settings WHERE category = 'company' ORDER BY key"
    );

    const profile = companySettings.reduce((acc, setting) => {
      let convertedValue = setting.value;
      try {
        convertedValue = convertValue(setting.data_type, setting.value);
      } catch (error) {
        convertedValue = setting.value;
      }
      acc[setting.key] = convertedValue;
      return acc;
    }, {});

    sendSuccess(res, { company: profile });
  })
);

// @route   PUT /api/settings/company
// @desc    Update company profile
// @access  Private (Admin/Manager)
router.put('/company',
  authorize(['admin', 'manager']),
  [
    body('name').optional().trim(),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('tax_number').optional().trim(),
    body('registration_number').optional().trim(),
    body('currency').optional().trim(),
    body('timezone').optional().trim()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array())
      });
    }

    const allowedFields = [
      'name', 'address', 'phone', 'email', 'website',
      'tax_number', 'registration_number', 'currency', 'timezone'
    ];

    const updates = [];
    const updateLog = [];

    await database.run('BEGIN TRANSACTION');

    try {
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key) && value !== undefined) {
          // Check if setting exists
          const existingSetting = await database.get(
            "SELECT id, value FROM settings WHERE category = 'company' AND key = ?",
            [key]
          );

          if (existingSetting) {
            // Update existing setting
            await database.run(
              'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [value.toString(), existingSetting.id]
            );
            updateLog.push({ key, oldValue: existingSetting.value, newValue: value });
          } else {
            // Create new setting
            await database.run(
              "INSERT INTO settings (category, key, value, data_type, description, is_public) VALUES ('company', ?, ?, 'string', ?, 1)",
              [key, value.toString(), `Company ${key}`]
            );
            updateLog.push({ key, oldValue: null, newValue: value });
          }
          
          updates.push(key);
        }
      }

      await database.run('COMMIT');

      logger.logBusiness('company_profile_updated', {
        updatedFields: updates,
        changes: updateLog,
        userId: req.user.id
      });

      // Get updated company profile
      const companySettings = await database.all(
        "SELECT key, value, data_type FROM settings WHERE category = 'company' ORDER BY key"
      );

      const profile = companySettings.reduce((acc, setting) => {
        let convertedValue = setting.value;
        try {
          convertedValue = convertValue(setting.data_type, setting.value);
        } catch (error) {
          convertedValue = setting.value;
        }
        acc[setting.key] = convertedValue;
        return acc;
      }, {});

      sendSuccess(res, { company: profile }, 'Company profile updated successfully');
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  })
);

module.exports = router;