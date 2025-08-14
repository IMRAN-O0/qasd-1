const { body, query, param } = require('express-validator');

const getCustomers = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('active').optional().isBoolean(),
];

const getCustomerById = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
];

const createCustomer = [
  body('name').notEmpty().withMessage('Customer name is required').trim(),
  body('code').notEmpty().withMessage('Customer code is required').trim(),
  body('contact_person').optional().trim(),
  // Relax phone validation to accept common numeric formats rather than strict locale-specific format
  body('phone').optional().matches(/^[0-9+\-()\s]{6,20}$/).withMessage('Invalid phone number').trim(),
  body('email').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('credit_limit').optional().isFloat({ min: 0 }).withMessage('Credit limit must be positive'),
  body('payment_terms').optional().isInt({ min: 0 }).withMessage('Payment terms must be positive'),
  body('vat_number').optional().trim(),
];

const updateCustomer = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('name').optional().notEmpty().withMessage('Customer name cannot be empty').trim(),
  body('contact_person').optional().trim(),
  // Relax phone validation similar to createCustomer
  body('phone').optional().matches(/^[0-9+\-()\s]{6,20}$/).withMessage('Invalid phone number').trim(),
  body('email').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('credit_limit').optional().isFloat({ min: 0 }).withMessage('Credit limit must be positive'),
  body('payment_terms').optional().isInt({ min: 0 }).withMessage('Payment terms must be positive'),
  body('vat_number').optional().trim(),
];

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
};