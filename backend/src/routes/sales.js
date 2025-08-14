const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginatedResponse } = require('../utils/responseHandler');
const { formatValidationErrors } = require('../utils/errorFormatter');
const { authorize, checkPermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const customerValidators = require('../validators/customerValidators');
const logger = require('../utils/logger');

const router = express.Router();

// Helper function to generate next number
const generateNextNumber = async (type, prefix) => {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  
  let query, table;
  if (type === 'quotation') {
    table = 'quotations';
    query = `SELECT number FROM ${table} WHERE number LIKE ? ORDER BY number DESC LIMIT 1`;
  } else if (type === 'invoice') {
    table = 'invoices';
    query = `SELECT number FROM ${table} WHERE number LIKE ? ORDER BY number DESC LIMIT 1`;
  }
  
  const pattern = `${prefix}${yearSuffix}%`;
  const lastRecord = await database.get(query, [pattern]);
  
  let nextNumber = 1;
  if (lastRecord) {
    const lastNumber = parseInt(lastRecord.number.slice(-4));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${yearSuffix}${nextNumber.toString().padStart(4, '0')}`;
};

// ============ CUSTOMERS ROUTES ============

// @route   GET /api/sales/customers
// @desc    Get all customers with pagination and search
// @access  Private
router.get('/customers', 
  // authorize, 
  checkPermission('read_all'),
  customerValidators.getCustomers,
  handleValidationErrors,
  asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const active = req.query.active;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR code LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
    const { total } = await database.get(countQuery, params);

    // Get customers
    const customersQuery = `
      SELECT id, name, code, contact_person, phone, email, address, city, 
             credit_limit, payment_terms, vat_number, is_active, created_at, updated_at
      FROM customers 
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    
    const customers = await database.all(customersQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, { customers }, { page, limit, total });
  })
);

// @route   GET /api/sales/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get('/customers/:id',
  // authorize, 
  checkPermission('read_all'),
  customerValidators.getCustomerById,
  handleValidationErrors,
  asyncHandler(async (req, res) => {

    const customer = await database.get(
      'SELECT * FROM customers WHERE id = ?',
      [req.params.id]
    );

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    sendSuccess(res, { customer });
  })
);

// @route   POST /api/sales/customers
// @desc    Create new customer
// @access  Private
router.post('/customers',
  // authorize, 
  checkPermission('create_all'),
  customerValidators.createCustomer,
  handleValidationErrors,
  asyncHandler(async (req, res) => {

    const {
      name, code, contact_person, phone, email, address, city,
      country = 'Saudi Arabia', credit_limit = 0, payment_terms = 30, vat_number
    } = req.body;

    // Debug logging
    console.log('Customer creation request:', { name, code, contact_person, phone, email, address, city, country, credit_limit, payment_terms, vat_number });
    console.log('User context:', req.user);

    try {
      const result = await database.run(
        `INSERT INTO customers 
         (name, code, contact_person, phone, email, address, city, country, credit_limit, payment_terms, vat_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, code, contact_person, phone, email, address, city, country, credit_limit, payment_terms, vat_number]
      );

      console.log('Database insert result:', result);

      const customer = await database.get(
        'SELECT * FROM customers WHERE code = ?',
        [code]
      );

      console.log('Retrieved customer:', customer);

      if (!customer) {
        throw new AppError('Failed to retrieve created customer', 500);
      }

      logger.logBusiness('customer_created', {
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.name,
        userId: req.user?.id || null
      });

      sendSuccess(res, { customer }, 'Customer created successfully', 201);
    } catch (error) {
      console.error('Customer creation error:', error);
      throw error;
    }
  })
);

// @route   PUT /api/sales/customers/:id
// @desc    Update customer
// @access  Private
router.put('/customers/:id',
  // authorize, 
  checkPermission('update_all'),
  customerValidators.updateCustomer,
  handleValidationErrors,
  asyncHandler(async (req, res) => {

    const customerId = req.params.id;
    
    // Check if customer exists
    const existingCustomer = await database.get(
      'SELECT * FROM customers WHERE id = ?',
      [customerId]
    );

    if (!existingCustomer) {
      throw new AppError('Customer not found', 404);
    }

    const updates = [];
    const values = [];
    const allowedFields = [
      'name', 'contact_person', 'phone', 'email', 'address', 'city',
      'country', 'credit_limit', 'payment_terms', 'vat_number', 'is_active'
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
    values.push(customerId);

    await database.run(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedCustomer = await database.get(
      'SELECT * FROM customers WHERE id = ?',
      [customerId]
    );

    logger.logBusiness('customer_updated', {
      customerId: updatedCustomer.id,
      customerCode: updatedCustomer.code,
      changes: req.body,
      userId: req.user.id
    });

    sendSuccess(res, { customer: updatedCustomer }, 'Customer updated successfully');
  })
);

// @route   DELETE /api/sales/customers/:id
// @desc    Delete customer (soft delete)
// @access  Private
router.delete('/customers/:id',
  checkPermission('delete_own'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid customer ID')
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

    const customerId = req.params.id;
    
    const customer = await database.get(
      'SELECT * FROM customers WHERE id = ?',
      [customerId]
    );

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Check if customer has related records
    const hasQuotations = await database.get(
      'SELECT COUNT(*) as count FROM quotations WHERE customer_id = ?',
      [customerId]
    );

    const hasInvoices = await database.get(
      'SELECT COUNT(*) as count FROM invoices WHERE customer_id = ?',
      [customerId]
    );

    if (hasQuotations.count > 0 || hasInvoices.count > 0) {
      // Soft delete
      await database.run(
        'UPDATE customers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [customerId]
      );
      
      logger.logBusiness('customer_deactivated', {
        customerId,
        customerCode: customer.code,
        reason: 'has_related_records',
        userId: req.user.id
      });
      
      sendSuccess(res, null, 'Customer deactivated successfully');
    } else {
      // Hard delete
      await database.run('DELETE FROM customers WHERE id = ?', [customerId]);
      
      logger.logBusiness('customer_deleted', {
        customerId,
        customerCode: customer.code,
        userId: req.user.id
      });
      
      sendSuccess(res, null, 'Customer deleted successfully');
    }
  })
);

// ============ QUOTATIONS ROUTES ============

// @route   GET /api/sales/quotations
// @desc    Get all quotations with pagination and search
// @access  Private
router.get('/quotations',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['draft', 'sent', 'accepted', 'rejected', 'expired']).withMessage('Invalid status'),
    query('customer_id').optional().isInt({ min: 1 }).withMessage('Invalid customer ID')
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
    const status = req.query.status;
    const customerId = req.query.customer_id;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (q.number LIKE ? OR c.name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (status) {
      whereClause += ' AND q.status = ?';
      params.push(status);
    }

    if (customerId) {
      whereClause += ' AND q.customer_id = ?';
      params.push(customerId);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM quotations q 
      JOIN customers c ON q.customer_id = c.id 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get quotations
    const quotationsQuery = `
      SELECT q.*, c.name as customer_name, c.code as customer_code,
             u.username as created_by_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const quotations = await database.all(quotationsQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, { quotations }, { page, limit, total });
  })
);

// @route   POST /api/sales/quotations
// @desc    Create new quotation
// @access  Private
router.post('/quotations',
  checkPermission('create_all'),
  [
    body('customer_id').isInt({ min: 1 }).withMessage('Valid customer ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('valid_until').optional().isISO8601().withMessage('Valid until date must be valid'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be positive'),
    body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
    body('discount_amount').optional().isFloat({ min: 0 }).withMessage('Discount must be positive'),
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

    const { customer_id, date, valid_until, items, discount_amount = 0, notes } = req.body;

    // Verify customer exists
    const customer = await database.get(
      'SELECT id FROM customers WHERE id = ? AND is_active = 1',
      [customer_id]
    );

    if (!customer) {
      throw new AppError('Customer not found or inactive', 404);
    }

    // Generate quotation number
    const number = await generateNextNumber('quotation', 'QT');

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      item.total_price = item.quantity * item.unit_price;
      subtotal += item.total_price;
    }

    const tax_amount = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax_amount - discount_amount;

    // Create quotation
    const result = await database.run(
       `INSERT INTO quotations 
        (number, customer_id, date, valid_until, subtotal, tax_amount, discount_amount, total, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       [number, customer_id, date, valid_until, subtotal, tax_amount, discount_amount, total, notes, req.user.id]
     );
     // Fetch the inserted quotation id via its unique number (works across DBs)
     const createdQuotationRow = await database.get(
     'SELECT id FROM quotations WHERE number = ?',
     [number]
     );
     const quotationId = createdQuotationRow ? createdQuotationRow.id : 0;

    // Create quotation items
    for (const item of items) {
      await database.run(
        `INSERT INTO quotation_items 
         (quotation_id, product_id, quantity, unit_price, total_price, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quotationId, item.product_id, item.quantity, item.unit_price, item.total_price, item.description || null]
      );
    }

    // Get complete quotation with items
    const quotation = await database.get(
      `SELECT q.*, c.name as customer_name 
       FROM quotations q 
       JOIN customers c ON q.customer_id = c.id 
       WHERE q.id = ?`,
      [quotationId]
    );

    const quotationItems = await database.all(
      `SELECT qi.*, p.name as product_name, p.code as product_code
       FROM quotation_items qi
       JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = ?`,
      [quotationId]
    );

    logger.logBusiness('quotation_created', {
      quotationId,
      quotationNumber: number,
      customerId: customer_id,
      total,
      userId: req.user.id
    });

    sendSuccess(res, {
      quotation: {
        ...quotation,
        items: quotationItems
      }
    }, 'Quotation created successfully', 201);
  })
);

module.exports = router;