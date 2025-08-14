const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError, sendSuccess, sendPaginatedResponse, formatValidationErrors } = require('../middleware/errorHandler');
const { authorize, checkPermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Helper function to generate production batch number
const generateBatchNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `PB${year}`;
  
  const lastBatch = await database.get(
    'SELECT number FROM production_batches WHERE number LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );
  
  let nextNumber = 1;
  if (lastBatch) {
    const lastNumber = parseInt(lastBatch.number.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

// Helper function to update material stock for production
const updateMaterialStock = async (materialId, quantity, operation = 'consume') => {
  const multiplier = operation === 'consume' ? -1 : 1;
  
  await database.run(
    'UPDATE materials SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity * multiplier, materialId]
  );
  
  // Record stock movement
  await database.run(
    `INSERT INTO stock_movements 
     (item_type, item_id, quantity, movement_type, reference_type, reference_id, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'material',
      materialId,
      Math.abs(quantity),
      operation === 'consume' ? 'out' : 'in',
      'production',
      null,
      `Material ${operation} for production`
    ]
  );
};

// Helper function to update product stock for production
const updateProductStock = async (productId, quantity, batchId, userId) => {
  await database.run(
    'UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, productId]
  );
  
  // Record stock movement
  await database.run(
    `INSERT INTO stock_movements 
     (item_type, item_id, quantity, movement_type, reference_type, reference_id, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'product',
      productId,
      quantity,
      'in',
      'production',
      batchId,
      'Production output',
      userId
    ]
  );
};

// ============ PRODUCTION BATCHES ROUTES ============

// @route   GET /api/production/batches
// @desc    Get all production batches with pagination and search
// @access  Private
router.get('/batches',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['planned', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('product_id').optional().isInt({ min: 1 }).withMessage('Invalid product ID'),
    query('date_from').optional().isISO8601().withMessage('Invalid date format'),
    query('date_to').optional().isISO8601().withMessage('Invalid date format')
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
    const { status, product_id, date_from, date_to } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (pb.number LIKE ? OR p.name LIKE ? OR pb.notes LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      whereClause += ' AND pb.status = ?';
      params.push(status);
    }

    if (product_id) {
      whereClause += ' AND pb.product_id = ?';
      params.push(product_id);
    }

    if (date_from) {
      whereClause += ' AND DATE(pb.start_date) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(pb.start_date) <= ?';
      params.push(date_to);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM production_batches pb 
      LEFT JOIN products p ON pb.product_id = p.id 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get batches
    const batchesQuery = `
      SELECT pb.*, p.name as product_name, p.code as product_code, p.unit as product_unit,
             e.name as equipment_name, u.username as created_by_name
      FROM production_batches pb
      LEFT JOIN products p ON pb.product_id = p.id
      LEFT JOIN equipment e ON pb.equipment_id = e.id
      LEFT JOIN users u ON pb.created_by = u.id
      ${whereClause}
      ORDER BY pb.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const batches = await database.all(batchesQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, batches, { page, limit, total });
  })
);

// @route   GET /api/production/batches/:id
// @desc    Get production batch by ID
// @access  Private
router.get('/batches/:id',
  checkPermission('read_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid batch ID')
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

    const batch = await database.get(
      `SELECT pb.*, p.name as product_name, p.code as product_code, p.unit as product_unit,
              e.name as equipment_name, u.username as created_by_name
       FROM production_batches pb
       LEFT JOIN products p ON pb.product_id = p.id
       LEFT JOIN equipment e ON pb.equipment_id = e.id
       LEFT JOIN users u ON pb.created_by = u.id
       WHERE pb.id = ?`,
      [req.params.id]
    );

    if (!batch) {
      throw new AppError('Production batch not found', 404);
    }

    // Get batch materials
    const materials = await database.all(
      `SELECT pbm.*, m.name as material_name, m.code as material_code, m.unit as material_unit
       FROM production_batch_materials pbm
       LEFT JOIN materials m ON pbm.material_id = m.id
       WHERE pbm.batch_id = ?`,
      [req.params.id]
    );

    // Get quality checks
    const qualityChecks = await database.all(
      `SELECT pqc.*, u.username as checked_by_name
       FROM production_quality_checks pqc
       LEFT JOIN users u ON pqc.checked_by = u.id
       WHERE pqc.batch_id = ?
       ORDER BY pqc.check_date DESC`,
      [req.params.id]
    );

    sendSuccess(res, { 
      batch,
      materials,
      quality_checks: qualityChecks
    });
  })
);

// @route   POST /api/production/batches
// @desc    Create new production batch
// @access  Private
router.post('/batches',
  checkPermission('create_all'),
  [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('planned_quantity').isFloat({ min: 0.01 }).withMessage('Planned quantity must be positive'),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('expected_end_date').optional().isISO8601().withMessage('Invalid expected end date'),
    body('equipment_id').optional().isInt({ min: 1 }).withMessage('Invalid equipment ID'),
    body('notes').optional().trim(),
    body('materials').optional().isArray().withMessage('Materials must be an array'),
    body('materials.*.material_id').optional().isInt({ min: 1 }).withMessage('Invalid material ID'),
    body('materials.*.quantity_required').optional().isFloat({ min: 0.01 }).withMessage('Material quantity must be positive')
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

    const {
      product_id, planned_quantity, start_date, expected_end_date,
      equipment_id, notes, materials = []
    } = req.body;

    // Verify product exists
    const product = await database.get(
      'SELECT id, name, code FROM products WHERE id = ? AND is_active = 1',
      [product_id]
    );
    if (!product) {
      throw new AppError('Product not found or inactive', 404);
    }

    // Verify equipment exists if provided
    if (equipment_id) {
      const equipment = await database.get(
        'SELECT id FROM equipment WHERE id = ? AND is_active = 1',
        [equipment_id]
      );
      if (!equipment) {
        throw new AppError('Equipment not found or inactive', 404);
      }
    }

    // Generate batch number
    const batchNumber = await generateBatchNumber();

    // Create batch
    const result = await database.run(
      `INSERT INTO production_batches 
       (number, product_id, planned_quantity, start_date, expected_end_date, equipment_id, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [batchNumber, product_id, planned_quantity, start_date, expected_end_date, equipment_id, notes, req.user.id]
    );

    const batchId = result.id;

    // Add materials if provided
    if (materials.length > 0) {
      for (const material of materials) {
        // Verify material exists
        const materialExists = await database.get(
          'SELECT id FROM materials WHERE id = ? AND is_active = 1',
          [material.material_id]
        );
        if (!materialExists) {
          throw new AppError(`Material with ID ${material.material_id} not found or inactive`, 404);
        }

        await database.run(
          `INSERT INTO production_batch_materials (batch_id, material_id, quantity_required)
           VALUES (?, ?, ?)`,
          [batchId, material.material_id, material.quantity_required]
        );
      }
    }

    // Get created batch with details
    const batch = await database.get(
      `SELECT pb.*, p.name as product_name, p.code as product_code
       FROM production_batches pb
       LEFT JOIN products p ON pb.product_id = p.id
       WHERE pb.id = ?`,
      [batchId]
    );

    logger.logBusiness('production_batch_created', {
      batchId: batch.id,
      batchNumber: batch.number,
      productId: product_id,
      productCode: product.code,
      plannedQuantity: planned_quantity,
      userId: req.user.id
    });

    sendSuccess(res, { batch }, 'Production batch created successfully', 201);
  })
);

// @route   PUT /api/production/batches/:id/status
// @desc    Update production batch status
// @access  Private
router.put('/batches/:id/status',
  checkPermission('update_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid batch ID'),
    body('status').isIn(['planned', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('actual_quantity').optional().isFloat({ min: 0 }).withMessage('Actual quantity must be positive'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date'),
    body('notes').optional().trim()
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

    const batchId = req.params.id;
    const { status, actual_quantity, end_date, notes } = req.body;

    // Get current batch
    const batch = await database.get(
      'SELECT * FROM production_batches WHERE id = ?',
      [batchId]
    );

    if (!batch) {
      throw new AppError('Production batch not found', 404);
    }

    // Prepare update fields
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];

    if (actual_quantity !== undefined) {
      updates.push('actual_quantity = ?');
      values.push(actual_quantity);
    }

    if (end_date) {
      updates.push('end_date = ?');
      values.push(end_date);
    }

    if (notes) {
      updates.push('notes = ?');
      values.push(notes);
    }

    values.push(batchId);

    // Update batch
    await database.run(
      `UPDATE production_batches SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // If completed, update product stock
    if (status === 'completed' && actual_quantity > 0) {
      await updateProductStock(batch.product_id, actual_quantity, batchId, req.user.id);
      
      // Consume materials
      const batchMaterials = await database.all(
        'SELECT * FROM production_batch_materials WHERE batch_id = ?',
        [batchId]
      );
      
      for (const material of batchMaterials) {
        await updateMaterialStock(material.material_id, material.quantity_required, 'consume');
      }
    }

    // Get updated batch
    const updatedBatch = await database.get(
      `SELECT pb.*, p.name as product_name, p.code as product_code
       FROM production_batches pb
       LEFT JOIN products p ON pb.product_id = p.id
       WHERE pb.id = ?`,
      [batchId]
    );

    logger.logBusiness('production_batch_status_updated', {
      batchId: updatedBatch.id,
      batchNumber: updatedBatch.number,
      oldStatus: batch.status,
      newStatus: status,
      actualQuantity: actual_quantity,
      userId: req.user.id
    });

    sendSuccess(res, { batch: updatedBatch }, 'Production batch status updated successfully');
  })
);

// ============ EQUIPMENT ROUTES ============

// @route   GET /api/production/equipment
// @desc    Get all equipment with pagination and search
// @access  Private
router.get('/equipment',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['active', 'maintenance', 'inactive']).withMessage('Invalid status'),
    query('type').optional().isString().trim()
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
    const { status, type } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM equipment ${whereClause}`;
    const { total } = await database.get(countQuery, params);

    // Get equipment
    const equipmentQuery = `
      SELECT * FROM equipment 
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    
    const equipment = await database.all(equipmentQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, equipment, { page, limit, total });
  })
);

// @route   POST /api/production/equipment
// @desc    Create new equipment
// @access  Private
router.post('/equipment',
  checkPermission('create_all'),
  [
    body('name').notEmpty().withMessage('Equipment name is required').trim(),
    body('code').notEmpty().withMessage('Equipment code is required').trim(),
    body('type').notEmpty().withMessage('Equipment type is required').trim(),
    body('description').optional().trim(),
    body('capacity').optional().isFloat({ min: 0 }).withMessage('Capacity must be positive'),
    body('location').optional().trim(),
    body('purchase_date').optional().isISO8601().withMessage('Invalid purchase date'),
    body('purchase_cost').optional().isFloat({ min: 0 }).withMessage('Purchase cost must be positive'),
    body('maintenance_schedule').optional().trim()
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

    const {
      name, code, type, description, capacity, location,
      purchase_date, purchase_cost, maintenance_schedule
    } = req.body;

    const result = await database.run(
      `INSERT INTO equipment 
       (name, code, type, description, capacity, location, purchase_date, purchase_cost, maintenance_schedule)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, code, type, description, capacity, location, purchase_date, purchase_cost, maintenance_schedule]
    );

    const equipment = await database.get(
      'SELECT * FROM equipment WHERE id = ?',
      [result.id]
    );

    logger.logBusiness('equipment_created', {
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      userId: req.user.id
    });

    sendSuccess(res, { equipment }, 'Equipment created successfully', 201);
  })
);

// @route   POST /api/production/batches/:id/quality-check
// @desc    Add quality check to production batch
// @access  Private
router.post('/batches/:id/quality-check',
  checkPermission('create_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid batch ID'),
    body('check_type').notEmpty().withMessage('Check type is required').trim(),
    body('result').isIn(['pass', 'fail', 'conditional']).withMessage('Invalid result'),
    body('notes').optional().trim(),
    body('checked_quantity').optional().isFloat({ min: 0 }).withMessage('Checked quantity must be positive')
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

    const batchId = req.params.id;
    const { check_type, result, notes, checked_quantity } = req.body;

    // Verify batch exists
    const batch = await database.get(
      'SELECT id FROM production_batches WHERE id = ?',
      [batchId]
    );

    if (!batch) {
      throw new AppError('Production batch not found', 404);
    }

    const checkResult = await database.run(
      `INSERT INTO production_quality_checks 
       (batch_id, check_type, result, notes, checked_quantity, checked_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [batchId, check_type, result, notes, checked_quantity, req.user.id]
    );

    const qualityCheck = await database.get(
      `SELECT pqc.*, u.username as checked_by_name
       FROM production_quality_checks pqc
       LEFT JOIN users u ON pqc.checked_by = u.id
       WHERE pqc.id = ?`,
      [checkResult.id]
    );

    logger.logBusiness('quality_check_added', {
      batchId: batchId,
      checkType: check_type,
      result: result,
      userId: req.user.id
    });

    sendSuccess(res, { quality_check: qualityCheck }, 'Quality check added successfully', 201);
  })
);

module.exports = router;