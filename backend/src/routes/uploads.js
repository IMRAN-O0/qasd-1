const express = require('express');
const multer = require('multer');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError, sendSuccess, sendPaginatedResponse, formatValidationErrors } = require('../middleware/errorHandler');
const { authorize, checkPermission } = require('../middleware/auth');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// File upload configuration
const uploadDir = process.env.UPLOAD_PATH || './uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
const allowedFileTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt,csv').split(',');

// Ensure upload directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(err => {
  logger.logError('Failed to create upload directory', { error: err.message });
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const category = req.body.category || 'general';
    const categoryDir = path.join(uploadDir, category);
    
    try {
      await fs.mkdir(categoryDir, { recursive: true });
      cb(null, categoryDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type .${ext} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`, 400), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 10 // Maximum 10 files per request
  },
  fileFilter: fileFilter
});

// Helper function to calculate file hash
const calculateFileHash = async (filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  } catch (error) {
    logger.logError('Failed to calculate file hash', { filePath, error: error.message });
    return null;
  }
};

// Helper function to get file MIME type
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.csv': 'text/csv'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============ FILE UPLOAD ROUTES ============

// @route   POST /api/uploads/single
// @desc    Upload single file
// @access  Private
router.post('/single',
  checkPermission('create_all'),
  upload.single('file'),
  [
    body('category').optional().isIn(['general', 'documents', 'images', 'reports', 'templates', 'logos']).withMessage('Invalid category'),
    body('description').optional().trim(),
    body('entity_type').optional().isIn(['customer', 'product', 'material', 'employee', 'quotation', 'invoice', 'batch', 'incident']).withMessage('Invalid entity type'),
    body('entity_id').optional().isInt({ min: 1 }).withMessage('Invalid entity ID')
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

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { category = 'general', description, entity_type, entity_id } = req.body;
    const file = req.file;

    // Calculate file hash
    const fileHash = await calculateFileHash(file.path);

    // Check for duplicate files
    if (fileHash) {
      const existingFile = await database.get(
        'SELECT id, original_name FROM files WHERE file_hash = ?',
        [fileHash]
      );

      if (existingFile) {
        // Delete the uploaded file since it's a duplicate
        await fs.unlink(file.path).catch(() => {});
        
        throw new AppError(`File already exists: ${existingFile.original_name}`, 409);
      }
    }

    // Store file information in database
    const result = await database.run(
      `INSERT INTO files 
       (original_name, filename, file_path, file_size, mime_type, file_hash,
        category, description, entity_type, entity_id, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.originalname,
        file.filename,
        file.path,
        file.size,
        getMimeType(file.originalname),
        fileHash,
        category,
        description,
        entity_type,
        entity_id,
        req.user.id
      ]
    );

    const uploadedFile = await database.get(
      `SELECT f.*, u.username as uploaded_by_name
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.id = ?`,
      [result.id]
    );

    logger.logBusiness('file_uploaded', {
      fileId: uploadedFile.id,
      originalName: file.originalname,
      filename: file.filename,
      fileSize: file.size,
      category: category,
      entityType: entity_type,
      entityId: entity_id,
      userId: req.user.id
    });

    sendSuccess(res, {
      file: {
        ...uploadedFile,
        file_size_formatted: formatFileSize(uploadedFile.file_size),
        download_url: `/api/uploads/download/${uploadedFile.id}`
      }
    }, 'File uploaded successfully', 201);
  })
);

// @route   POST /api/uploads/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple',
  checkPermission('create_all'),
  upload.array('files', 10),
  [
    body('category').optional().isIn(['general', 'documents', 'images', 'reports', 'templates', 'logos']).withMessage('Invalid category'),
    body('description').optional().trim(),
    body('entity_type').optional().isIn(['customer', 'product', 'material', 'employee', 'quotation', 'invoice', 'batch', 'incident']).withMessage('Invalid entity type'),
    body('entity_id').optional().isInt({ min: 1 }).withMessage('Invalid entity ID')
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

    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const { category = 'general', description, entity_type, entity_id } = req.body;
    const files = req.files;
    const uploadedFiles = [];
    const errors_list = [];

    // Start transaction
    await database.run('BEGIN TRANSACTION');

    try {
      for (const file of files) {
        try {
          // Calculate file hash
          const fileHash = await calculateFileHash(file.path);

          // Check for duplicate files
          if (fileHash) {
            const existingFile = await database.get(
              'SELECT id, original_name FROM files WHERE file_hash = ?',
              [fileHash]
            );

            if (existingFile) {
              // Delete the uploaded file since it's a duplicate
              await fs.unlink(file.path).catch(() => {});
              errors_list.push({
                filename: file.originalname,
                error: `File already exists: ${existingFile.original_name}`
              });
              continue;
            }
          }

          // Store file information in database
          const result = await database.run(
            `INSERT INTO files 
             (original_name, filename, file_path, file_size, mime_type, file_hash,
              category, description, entity_type, entity_id, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              file.originalname,
              file.filename,
              file.path,
              file.size,
              getMimeType(file.originalname),
              fileHash,
              category,
              description,
              entity_type,
              entity_id,
              req.user.id
            ]
          );

          const uploadedFile = await database.get(
            `SELECT f.*, u.username as uploaded_by_name
             FROM files f
             LEFT JOIN users u ON f.uploaded_by = u.id
             WHERE f.id = ?`,
            [result.id]
          );

          uploadedFiles.push({
            ...uploadedFile,
            file_size_formatted: formatFileSize(uploadedFile.file_size),
            download_url: `/api/uploads/download/${uploadedFile.id}`
          });
        } catch (error) {
          // Delete the uploaded file on error
          await fs.unlink(file.path).catch(() => {});
          errors_list.push({
            filename: file.originalname,
            error: error.message
          });
        }
      }

      await database.run('COMMIT');

      logger.logBusiness('multiple_files_uploaded', {
        uploadedCount: uploadedFiles.length,
        errorCount: errors_list.length,
        category: category,
        entityType: entity_type,
        entityId: entity_id,
        userId: req.user.id
      });

      sendSuccess(res, {
        uploaded_files: uploadedFiles,
        errors: errors_list,
        summary: {
          total_files: files.length,
          uploaded_successfully: uploadedFiles.length,
          failed: errors_list.length
        }
      }, 'Files upload completed', 201);
    } catch (error) {
      await database.run('ROLLBACK');
      
      // Clean up uploaded files on transaction failure
      for (const file of files) {
        await fs.unlink(file.path).catch(() => {});
      }
      
      throw error;
    }
  })
);

// ============ FILE MANAGEMENT ROUTES ============

// @route   GET /api/uploads
// @desc    Get all files with pagination and filtering
// @access  Private
router.get('/',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('category').optional().isIn(['general', 'documents', 'images', 'reports', 'templates', 'logos']).withMessage('Invalid category'),
    query('entity_type').optional().isIn(['customer', 'product', 'material', 'employee', 'quotation', 'invoice', 'batch', 'incident']).withMessage('Invalid entity type'),
    query('entity_id').optional().isInt({ min: 1 }).withMessage('Invalid entity ID'),
    query('mime_type').optional().isString().trim()
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const { category, entity_type, entity_id, mime_type } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (f.original_name LIKE ? OR f.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (category) {
      whereClause += ' AND f.category = ?';
      params.push(category);
    }

    if (entity_type) {
      whereClause += ' AND f.entity_type = ?';
      params.push(entity_type);
    }

    if (entity_id) {
      whereClause += ' AND f.entity_id = ?';
      params.push(entity_id);
    }

    if (mime_type) {
      whereClause += ' AND f.mime_type LIKE ?';
      params.push(`${mime_type}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM files f 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get files
    const filesQuery = `
      SELECT f.*, u.username as uploaded_by_name
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const files = await database.all(filesQuery, [...params, limit, offset]);

    // Add formatted file size and download URL
    const formattedFiles = files.map(file => ({
      ...file,
      file_size_formatted: formatFileSize(file.file_size),
      download_url: `/api/uploads/download/${file.id}`,
      is_image: file.mime_type.startsWith('image/')
    }));

    sendPaginatedResponse(res, formattedFiles, { page, limit, total });
  })
);

// @route   GET /api/uploads/:id
// @desc    Get file details by ID
// @access  Private
router.get('/:id',
  checkPermission('read_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid file ID')
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

    const file = await database.get(
      `SELECT f.*, u.username as uploaded_by_name
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.id = ?`,
      [req.params.id]
    );

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check if file exists on disk
    let fileExists = false;
    try {
      await fs.access(file.file_path);
      fileExists = true;
    } catch (error) {
      logger.logError('File not found on disk', {
        fileId: file.id,
        filePath: file.file_path,
        error: error.message
      });
    }

    sendSuccess(res, {
      file: {
        ...file,
        file_size_formatted: formatFileSize(file.file_size),
        download_url: `/api/uploads/download/${file.id}`,
        is_image: file.mime_type.startsWith('image/'),
        file_exists: fileExists
      }
    });
  })
);

// @route   GET /api/uploads/download/:id
// @desc    Download file by ID
// @access  Private
router.get('/download/:id',
  checkPermission('read_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid file ID')
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

    const file = await database.get(
      'SELECT * FROM files WHERE id = ?',
      [req.params.id]
    );

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check if file exists on disk
    try {
      await fs.access(file.file_path);
    } catch (error) {
      logger.logError('File not found on disk', {
        fileId: file.id,
        filePath: file.file_path,
        error: error.message
      });
      throw new AppError('File not found on disk', 404);
    }

    // Update download count
    await database.run(
      'UPDATE files SET download_count = download_count + 1, last_downloaded = CURRENT_TIMESTAMP WHERE id = ?',
      [file.id]
    );

    logger.logBusiness('file_downloaded', {
      fileId: file.id,
      originalName: file.original_name,
      userId: req.user.id
    });

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Length', file.file_size);

    // Stream the file
    const fileStream = require('fs').createReadStream(file.file_path);
    fileStream.pipe(res);
  })
);

// @route   PUT /api/uploads/:id
// @desc    Update file metadata
// @access  Private
router.put('/:id',
  checkPermission('update_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid file ID'),
    body('description').optional().trim(),
    body('category').optional().isIn(['general', 'documents', 'images', 'reports', 'templates', 'logos']).withMessage('Invalid category'),
    body('entity_type').optional().isIn(['customer', 'product', 'material', 'employee', 'quotation', 'invoice', 'batch', 'incident']).withMessage('Invalid entity type'),
    body('entity_id').optional().isInt({ min: 1 }).withMessage('Invalid entity ID')
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

    const fileId = req.params.id;
    const { description, category, entity_type, entity_id } = req.body;

    // Get current file
    const currentFile = await database.get(
      'SELECT * FROM files WHERE id = ?',
      [fileId]
    );

    if (!currentFile) {
      throw new AppError('File not found', 404);
    }

    // Prepare update fields
    const updates = ['updated_at = CURRENT_TIMESTAMP'];
    const values = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }

    if (entity_type !== undefined) {
      updates.push('entity_type = ?');
      values.push(entity_type);
    }

    if (entity_id !== undefined) {
      updates.push('entity_id = ?');
      values.push(entity_id);
    }

    if (updates.length === 1) {
      throw new AppError('No fields to update', 400);
    }

    values.push(fileId);

    // Update file
    await database.run(
      `UPDATE files SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated file
    const updatedFile = await database.get(
      `SELECT f.*, u.username as uploaded_by_name
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.id = ?`,
      [fileId]
    );

    logger.logBusiness('file_metadata_updated', {
      fileId: updatedFile.id,
      originalName: updatedFile.original_name,
      changes: req.body,
      userId: req.user.id
    });

    sendSuccess(res, {
      file: {
        ...updatedFile,
        file_size_formatted: formatFileSize(updatedFile.file_size),
        download_url: `/api/uploads/download/${updatedFile.id}`,
        is_image: updatedFile.mime_type.startsWith('image/')
      }
    }, 'File metadata updated successfully');
  })
);

// @route   DELETE /api/uploads/:id
// @desc    Delete file
// @access  Private
router.delete('/:id',
  checkPermission('delete_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid file ID')
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

    const fileId = req.params.id;

    const file = await database.get(
      'SELECT * FROM files WHERE id = ?',
      [fileId]
    );

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Delete file from database
    await database.run('DELETE FROM files WHERE id = ?', [fileId]);

    // Delete file from disk
    try {
      await fs.unlink(file.file_path);
    } catch (error) {
      logger.logError('Failed to delete file from disk', {
        fileId: file.id,
        filePath: file.file_path,
        error: error.message
      });
      // Continue even if file deletion fails
    }

    logger.logBusiness('file_deleted', {
      fileId: file.id,
      originalName: file.original_name,
      filePath: file.file_path,
      userId: req.user.id
    });

    sendSuccess(res, null, 'File deleted successfully');
  })
);

// ============ FILE STATISTICS ============

// @route   GET /api/uploads/stats/summary
// @desc    Get file upload statistics
// @access  Private
router.get('/stats/summary',
  checkPermission('read_all'),
  asyncHandler(async (req, res) => {
    // Overall statistics
    const overallStats = await database.get(
      `SELECT 
         COUNT(*) as total_files,
         SUM(file_size) as total_size,
         AVG(file_size) as avg_file_size,
         SUM(download_count) as total_downloads
       FROM files`
    );

    // Statistics by category
    const categoryStats = await database.all(
      `SELECT 
         category,
         COUNT(*) as file_count,
         SUM(file_size) as total_size,
         AVG(file_size) as avg_size
       FROM files
       GROUP BY category
       ORDER BY file_count DESC`
    );

    // Statistics by file type
    const typeStats = await database.all(
      `SELECT 
         mime_type,
         COUNT(*) as file_count,
         SUM(file_size) as total_size
       FROM files
       GROUP BY mime_type
       ORDER BY file_count DESC
       LIMIT 10`
    );

    // Recent uploads
    const recentUploads = await database.all(
      `SELECT f.original_name, f.file_size, f.category, f.created_at,
              u.username as uploaded_by_name
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       ORDER BY f.created_at DESC
       LIMIT 10`
    );

    // Most downloaded files
    const mostDownloaded = await database.all(
      `SELECT f.original_name, f.download_count, f.category,
              u.username as uploaded_by_name
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.download_count > 0
       ORDER BY f.download_count DESC
       LIMIT 10`
    );

    sendSuccess(res, {
      overall: {
        ...overallStats,
        total_size_formatted: formatFileSize(overallStats.total_size || 0),
        avg_file_size_formatted: formatFileSize(overallStats.avg_file_size || 0)
      },
      by_category: categoryStats.map(stat => ({
        ...stat,
        total_size_formatted: formatFileSize(stat.total_size),
        avg_size_formatted: formatFileSize(stat.avg_size)
      })),
      by_type: typeStats.map(stat => ({
        ...stat,
        total_size_formatted: formatFileSize(stat.total_size)
      })),
      recent_uploads: recentUploads.map(file => ({
        ...file,
        file_size_formatted: formatFileSize(file.file_size)
      })),
      most_downloaded: mostDownloaded
    });
  })
);

module.exports = router;