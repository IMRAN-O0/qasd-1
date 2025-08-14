const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError, sendSuccess, sendPaginatedResponse, formatValidationErrors } = require('../middleware/errorHandler');
const { authorize, checkPermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Helper function to record stock movement
const recordStockMovement = async (itemType, itemId, quantity, movementType, referenceType = null, referenceId = null, notes = null, userId = null) => {
  await database.run(
    `INSERT INTO stock_movements 
     (item_type, item_id, quantity, movement_type, reference_type, reference_id, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [itemType, itemId, quantity, movementType, referenceType, referenceId, notes, userId]
  );
};

// Helper function to update stock quantity
const updateStockQuantity = async (itemType, itemId, quantityChange) => {
  const table = itemType === 'product' ? 'products' : 'materials';
  const field = 'stock_quantity';
  
  await database.run(
    `UPDATE ${table} SET ${field} = ${field} + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [quantityChange, itemId]
  );
};

// ============ MATERIALS ROUTES ============

// @route   GET /api/inventory/materials
// @desc    Get all materials with pagination and search
// @access  Private
router.get('/materials',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('category').optional().isString().trim(),
    query('active').optional().isBoolean(),
    query('low_stock').optional().isBoolean()
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
    const category = req.query.category;
    const active = req.query.active;
    const lowStock = req.query.low_stock;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (m.name LIKE ? OR m.code LIKE ? OR m.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      whereClause += ' AND m.category = ?';
      params.push(category);
    }

    if (active !== undefined) {
      whereClause += ' AND m.is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    if (lowStock === 'true') {
      whereClause += ' AND m.stock_quantity <= m.min_stock_level';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM materials m 
      LEFT JOIN suppliers s ON m.supplier_id = s.id 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get materials
    const materialsQuery = `
      SELECT m.*, s.name as supplier_name, s.code as supplier_code
      FROM materials m
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      ${whereClause}
      ORDER BY m.name ASC
      LIMIT ? OFFSET ?
    `;
    
    const materials = await database.all(materialsQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, materials, { page, limit, total });
  })
);

// @route   GET /api/inventory/materials/:id
// @desc    Get material by ID
// @access  Private
router.get('/materials/:id',
  checkPermission('read_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid material ID')
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

    const material = await database.get(
      `SELECT m.*, s.name as supplier_name, s.code as supplier_code
       FROM materials m
       LEFT JOIN suppliers s ON m.supplier_id = s.id
       WHERE m.id = ?`,
      [req.params.id]
    );

    if (!material) {
      throw new AppError('Material not found', 404);
    }

    // Get recent stock movements
    const movements = await database.all(
      `SELECT sm.*, u.username as created_by_name
       FROM stock_movements sm
       LEFT JOIN users u ON sm.created_by = u.id
       WHERE sm.item_type = 'material' AND sm.item_id = ?
       ORDER BY sm.created_at DESC
       LIMIT 10`,
      [req.params.id]
    );

    sendSuccess(res, { 
      material,
      recent_movements: movements
    });
  })
);

// @route   POST /api/inventory/materials
// @desc    Create new material
// @access  Private
router.post('/materials',
  checkPermission('create_all'),
  [
    body('name').notEmpty().withMessage('Material name is required').trim(),
    body('code').notEmpty().withMessage('Material code is required').trim(),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('unit').notEmpty().withMessage('Unit is required').trim(),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be positive'),
    body('stock_quantity').optional().isFloat({ min: 0 }).withMessage('Stock quantity must be positive'),
    body('min_stock_level').optional().isFloat({ min: 0 }).withMessage('Min stock level must be positive'),
    body('max_stock_level').optional().isFloat({ min: 0 }).withMessage('Max stock level must be positive'),
    body('supplier_id').optional().isInt({ min: 1 }).withMessage('Invalid supplier ID')
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
      name, code, category, description, unit, cost,
      stock_quantity = 0, min_stock_level = 0, max_stock_level,
      supplier_id
    } = req.body;

    // Verify supplier exists if provided
    if (supplier_id) {
      const supplier = await database.get(
        'SELECT id FROM suppliers WHERE id = ? AND is_active = 1',
        [supplier_id]
      );
      if (!supplier) {
        throw new AppError('Supplier not found or inactive', 404);
      }
    }

    const result = await database.run(
      `INSERT INTO materials 
       (name, code, category, description, unit, cost, stock_quantity, min_stock_level, max_stock_level, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, code, category, description, unit, cost, stock_quantity, min_stock_level, max_stock_level, supplier_id]
    );

    const material = await database.get(
      `SELECT m.*, s.name as supplier_name
       FROM materials m
       LEFT JOIN suppliers s ON m.supplier_id = s.id
       WHERE m.id = ?`,
      [result.id]
    );

    // Record initial stock if any
    if (stock_quantity > 0) {
      await recordStockMovement(
        'material',
        result.id,
        stock_quantity,
        'in',
        'initial_stock',
        null,
        'Initial stock entry',
        req.user.id
      );
    }

    logger.logBusiness('material_created', {
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      initialStock: stock_quantity,
      userId: req.user.id
    });

    sendSuccess(res, { material }, 'Material created successfully', 201);
  })
);

// @route   PUT /api/inventory/materials/:id
// @desc    Update material
// @access  Private
router.put('/materials/:id',
  checkPermission('update_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid material ID'),
    body('name').optional().notEmpty().withMessage('Material name cannot be empty').trim(),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('unit').optional().notEmpty().withMessage('Unit cannot be empty').trim(),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be positive'),
    body('min_stock_level').optional().isFloat({ min: 0 }).withMessage('Min stock level must be positive'),
    body('max_stock_level').optional().isFloat({ min: 0 }).withMessage('Max stock level must be positive'),
    body('supplier_id').optional().isInt({ min: 1 }).withMessage('Invalid supplier ID'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean')
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

    const materialId = req.params.id;
    
    // Check if material exists
    const existingMaterial = await database.get(
      'SELECT * FROM materials WHERE id = ?',
      [materialId]
    );

    if (!existingMaterial) {
      throw new AppError('Material not found', 404);
    }

    // Verify supplier exists if provided
    if (req.body.supplier_id) {
      const supplier = await database.get(
        'SELECT id FROM suppliers WHERE id = ? AND is_active = 1',
        [req.body.supplier_id]
      );
      if (!supplier) {
        throw new AppError('Supplier not found or inactive', 404);
      }
    }

    const updates = [];
    const values = [];
    const allowedFields = [
      'name', 'category', 'description', 'unit', 'cost',
      'min_stock_level', 'max_stock_level', 'supplier_id', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(materialId);

    await database.run(
      `UPDATE materials SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedMaterial = await database.get(
      `SELECT m.*, s.name as supplier_name
       FROM materials m
       LEFT JOIN suppliers s ON m.supplier_id = s.id
       WHERE m.id = ?`,
      [materialId]
    );

    logger.logBusiness('material_updated', {
      materialId: updatedMaterial.id,
      materialCode: updatedMaterial.code,
      changes: req.body,
      userId: req.user.id
    });

    sendSuccess(res, { material: updatedMaterial }, 'Material updated successfully');
  })
);

// ============ PRODUCTS ROUTES ============

// @route   GET /api/inventory/products
// @desc    Get all products with pagination and search
// @access  Private
router.get('/products',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('category').optional().isString().trim(),
    query('active').optional().isBoolean(),
    query('low_stock').optional().isBoolean()
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
    const category = req.query.category;
    const active = req.query.active;
    const lowStock = req.query.low_stock;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    if (lowStock === 'true') {
      whereClause += ' AND stock_quantity <= min_stock_level';
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const { total } = await database.get(countQuery, params);

    // Get products
    const productsQuery = `
      SELECT id, name, code, category, description, unit, price, cost,
             stock_quantity, min_stock_level, max_stock_level, is_active,
             created_at, updated_at
      FROM products 
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    
    const products = await database.all(productsQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, products, { page, limit, total });
  })
);

// @route   POST /api/inventory/products
// @desc    Create new product
// @access  Private
router.post('/products',
  checkPermission('create_all'),
  [
    body('name').notEmpty().withMessage('Product name is required').trim(),
    body('code').notEmpty().withMessage('Product code is required').trim(),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('unit').notEmpty().withMessage('Unit is required').trim(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be positive'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be positive'),
    body('min_stock_level').optional().isInt({ min: 0 }).withMessage('Min stock level must be positive'),
    body('max_stock_level').optional().isInt({ min: 0 }).withMessage('Max stock level must be positive')
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
      name, code, category, description, unit, price, cost,
      stock_quantity = 0, min_stock_level = 0, max_stock_level
    } = req.body;

    const result = await database.run(
      `INSERT INTO products 
       (name, code, category, description, unit, price, cost, stock_quantity, min_stock_level, max_stock_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, code, category, description, unit, price, cost, stock_quantity, min_stock_level, max_stock_level]
    );

    const product = await database.get(
      'SELECT * FROM products WHERE id = ?',
      [result.id]
    );

    // Record initial stock if any
    if (stock_quantity > 0) {
      await recordStockMovement(
        'product',
        result.id,
        stock_quantity,
        'in',
        'initial_stock',
        null,
        'Initial stock entry',
        req.user.id
      );
    }

    logger.logBusiness('product_created', {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      initialStock: stock_quantity,
      userId: req.user.id
    });

    sendSuccess(res, { product }, 'Product created successfully', 201);
  })
);

// ============ STOCK MOVEMENTS ROUTES ============

// @route   GET /api/inventory/movements
// @desc    Get stock movements with pagination and filters
// @access  Private
router.get('/movements',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('item_type').optional().isIn(['product', 'material']).withMessage('Invalid item type'),
    query('item_id').optional().isInt({ min: 1 }).withMessage('Invalid item ID'),
    query('movement_type').optional().isIn(['in', 'out', 'adjustment']).withMessage('Invalid movement type'),
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
    const { item_type, item_id, movement_type, date_from, date_to } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (item_type) {
      whereClause += ' AND sm.item_type = ?';
      params.push(item_type);
    }

    if (item_id) {
      whereClause += ' AND sm.item_id = ?';
      params.push(item_id);
    }

    if (movement_type) {
      whereClause += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }

    if (date_from) {
      whereClause += ' AND DATE(sm.created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(sm.created_at) <= ?';
      params.push(date_to);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM stock_movements sm ${whereClause}`;
    const { total } = await database.get(countQuery, params);

    // Get movements
    const movementsQuery = `
      SELECT sm.*, 
             CASE 
               WHEN sm.item_type = 'product' THEN p.name
               WHEN sm.item_type = 'material' THEN m.name
             END as item_name,
             CASE 
               WHEN sm.item_type = 'product' THEN p.code
               WHEN sm.item_type = 'material' THEN m.code
             END as item_code,
             u.username as created_by_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.item_type = 'product' AND sm.item_id = p.id
      LEFT JOIN materials m ON sm.item_type = 'material' AND sm.item_id = m.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const movements = await database.all(movementsQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, movements, { page, limit, total });
  })
);

// @route   POST /api/inventory/movements
// @desc    Create stock movement (adjustment)
// @access  Private
router.post('/movements',
  checkPermission('create_all'),
  [
    body('item_type').isIn(['product', 'material']).withMessage('Invalid item type'),
    body('item_id').isInt({ min: 1 }).withMessage('Valid item ID is required'),
    body('quantity').isFloat().withMessage('Quantity is required'),
    body('movement_type').isIn(['in', 'out', 'adjustment']).withMessage('Invalid movement type'),
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

    const { item_type, item_id, quantity, movement_type, notes } = req.body;

    // Verify item exists
    const table = item_type === 'product' ? 'products' : 'materials';
    const item = await database.get(
      `SELECT id, name, code, stock_quantity FROM ${table} WHERE id = ? AND is_active = 1`,
      [item_id]
    );

    if (!item) {
      throw new AppError(`${item_type} not found or inactive`, 404);
    }

    // Check if there's enough stock for 'out' movements
    if (movement_type === 'out' && item.stock_quantity < Math.abs(quantity)) {
      throw new AppError('Insufficient stock quantity', 400);
    }

    // Calculate quantity change
    let quantityChange;
    if (movement_type === 'in') {
      quantityChange = Math.abs(quantity);
    } else if (movement_type === 'out') {
      quantityChange = -Math.abs(quantity);
    } else { // adjustment
      quantityChange = quantity;
    }

    // Record movement
    await recordStockMovement(
      item_type,
      item_id,
      Math.abs(quantity),
      movement_type,
      'manual_adjustment',
      null,
      notes,
      req.user.id
    );

    // Update stock quantity
    await updateStockQuantity(item_type, item_id, quantityChange);

    // Get updated item
    const updatedItem = await database.get(
      `SELECT * FROM ${table} WHERE id = ?`,
      [item_id]
    );

    logger.logBusiness('stock_movement_created', {
      itemType: item_type,
      itemId: item_id,
      itemCode: item.code,
      quantity: Math.abs(quantity),
      movementType: movement_type,
      oldStock: item.stock_quantity,
      newStock: updatedItem.stock_quantity,
      userId: req.user.id
    });

    sendSuccess(res, {
      movement: {
        item_type,
        item_id,
        item_name: item.name,
        item_code: item.code,
        quantity: Math.abs(quantity),
        movement_type,
        old_stock: item.stock_quantity,
        new_stock: updatedItem.stock_quantity,
        notes
      }
    }, 'Stock movement recorded successfully', 201);
  })
);

module.exports = router;