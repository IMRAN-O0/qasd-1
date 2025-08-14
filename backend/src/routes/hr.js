const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError, sendSuccess, sendPaginatedResponse, formatValidationErrors } = require('../middleware/errorHandler');
const { authorize, checkPermission } = require('../middleware/auth');
const logger = require('../utils/logger');
const moment = require('moment');

const router = express.Router();

// Helper function to generate employee code
const generateEmployeeCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `EMP${year}`;
  
  const lastEmployee = await database.get(
    'SELECT code FROM employees WHERE code LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );
  
  let nextNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.code.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

// Helper function to calculate working hours
const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const start = moment(checkIn);
  const end = moment(checkOut);
  const duration = moment.duration(end.diff(start));
  
  return Math.max(0, duration.asHours());
};

// Helper function to calculate overtime
const calculateOvertime = (workingHours, standardHours = 8) => {
  return Math.max(0, workingHours - standardHours);
};

// ============ EMPLOYEES ROUTES ============

// @route   GET /api/hr/employees
// @desc    Get all employees with pagination and search
// @access  Private
router.get('/employees',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('department').optional().isString().trim(),
    query('position').optional().isString().trim(),
    query('active').optional().isBoolean(),
    query('employment_type').optional().isIn(['full_time', 'part_time', 'contract', 'intern']).withMessage('Invalid employment type')
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
    const { department, position, active, employment_type } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR code LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (department) {
      whereClause += ' AND department = ?';
      params.push(department);
    }

    if (position) {
      whereClause += ' AND position = ?';
      params.push(position);
    }

    if (active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    if (employment_type) {
      whereClause += ' AND employment_type = ?';
      params.push(employment_type);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM employees ${whereClause}`;
    const { total } = await database.get(countQuery, params);

    // Get employees (excluding sensitive data)
    const employeesQuery = `
      SELECT id, code, name, email, phone, department, position, employment_type,
             hire_date, salary, is_active, created_at, updated_at
      FROM employees 
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    
    const employees = await database.all(employeesQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, employees, { page, limit, total });
  })
);

// @route   GET /api/hr/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/employees/:id',
  checkPermission('read_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid employee ID')
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

    const employee = await database.get(
      `SELECT id, code, name, email, phone, address, department, position, 
              employment_type, hire_date, salary, emergency_contact, emergency_phone,
              is_active, created_at, updated_at
       FROM employees WHERE id = ?`,
      [req.params.id]
    );

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Get recent attendance
    const recentAttendance = await database.all(
      `SELECT * FROM attendance 
       WHERE employee_id = ? 
       ORDER BY date DESC 
       LIMIT 10`,
      [req.params.id]
    );

    // Get current month stats
    const currentMonth = moment().format('YYYY-MM');
    const monthlyStats = await database.get(
      `SELECT 
         COUNT(*) as days_worked,
         SUM(working_hours) as total_hours,
         SUM(overtime_hours) as total_overtime,
         AVG(working_hours) as avg_hours
       FROM attendance 
       WHERE employee_id = ? AND strftime('%Y-%m', date) = ?`,
      [req.params.id, currentMonth]
    );

    sendSuccess(res, { 
      employee,
      recent_attendance: recentAttendance,
      monthly_stats: monthlyStats
    });
  })
);

// @route   POST /api/hr/employees
// @desc    Create new employee
// @access  Private
router.post('/employees',
  checkPermission('create_all'),
  [
    body('name').notEmpty().withMessage('Employee name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('address').optional().trim(),
    body('department').notEmpty().withMessage('Department is required').trim(),
    body('position').notEmpty().withMessage('Position is required').trim(),
    body('employment_type').isIn(['full_time', 'part_time', 'contract', 'intern']).withMessage('Invalid employment type'),
    body('hire_date').isISO8601().withMessage('Valid hire date is required'),
    body('salary').isFloat({ min: 0 }).withMessage('Salary must be positive'),
    body('emergency_contact').optional().trim(),
    body('emergency_phone').optional().trim()
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
      name, email, phone, address, department, position, employment_type,
      hire_date, salary, emergency_contact, emergency_phone
    } = req.body;

    // Check if email already exists
    const existingEmployee = await database.get(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );

    if (existingEmployee) {
      throw new AppError('Employee with this email already exists', 400);
    }

    // Generate employee code
    const employeeCode = await generateEmployeeCode();

    const result = await database.run(
      `INSERT INTO employees 
       (code, name, email, phone, address, department, position, employment_type, 
        hire_date, salary, emergency_contact, emergency_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeCode, name, email, phone, address, department, position, 
        employment_type, hire_date, salary, emergency_contact, emergency_phone
      ]
    );

    const employee = await database.get(
      `SELECT id, code, name, email, phone, department, position, employment_type,
              hire_date, salary, is_active, created_at
       FROM employees WHERE id = ?`,
      [result.id]
    );

    logger.logBusiness('employee_created', {
      employeeId: employee.id,
      employeeCode: employee.code,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      userId: req.user.id
    });

    sendSuccess(res, { employee }, 'Employee created successfully', 201);
  })
);

// @route   PUT /api/hr/employees/:id
// @desc    Update employee
// @access  Private
router.put('/employees/:id',
  checkPermission('update_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid employee ID'),
    body('name').optional().notEmpty().withMessage('Employee name cannot be empty').trim(),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional().notEmpty().withMessage('Phone number cannot be empty').trim(),
    body('address').optional().trim(),
    body('department').optional().notEmpty().withMessage('Department cannot be empty').trim(),
    body('position').optional().notEmpty().withMessage('Position cannot be empty').trim(),
    body('employment_type').optional().isIn(['full_time', 'part_time', 'contract', 'intern']).withMessage('Invalid employment type'),
    body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be positive'),
    body('emergency_contact').optional().trim(),
    body('emergency_phone').optional().trim(),
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

    const employeeId = req.params.id;
    
    // Check if employee exists
    const existingEmployee = await database.get(
      'SELECT * FROM employees WHERE id = ?',
      [employeeId]
    );

    if (!existingEmployee) {
      throw new AppError('Employee not found', 404);
    }

    // Check email uniqueness if email is being updated
    if (req.body.email && req.body.email !== existingEmployee.email) {
      const emailExists = await database.get(
        'SELECT id FROM employees WHERE email = ? AND id != ?',
        [req.body.email, employeeId]
      );
      if (emailExists) {
        throw new AppError('Employee with this email already exists', 400);
      }
    }

    const updates = [];
    const values = [];
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'department', 'position',
      'employment_type', 'salary', 'emergency_contact', 'emergency_phone', 'is_active'
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
    values.push(employeeId);

    await database.run(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedEmployee = await database.get(
      `SELECT id, code, name, email, phone, department, position, employment_type,
              hire_date, salary, is_active, created_at, updated_at
       FROM employees WHERE id = ?`,
      [employeeId]
    );

    logger.logBusiness('employee_updated', {
      employeeId: updatedEmployee.id,
      employeeCode: updatedEmployee.code,
      changes: req.body,
      userId: req.user.id
    });

    sendSuccess(res, { employee: updatedEmployee }, 'Employee updated successfully');
  })
);

// ============ ATTENDANCE ROUTES ============

// @route   GET /api/hr/attendance
// @desc    Get attendance records with pagination and filters
// @access  Private
router.get('/attendance',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('employee_id').optional().isInt({ min: 1 }).withMessage('Invalid employee ID'),
    query('date_from').optional().isISO8601().withMessage('Invalid date format'),
    query('date_to').optional().isISO8601().withMessage('Invalid date format'),
    query('department').optional().isString().trim()
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
    const { employee_id, date_from, date_to, department } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (employee_id) {
      whereClause += ' AND a.employee_id = ?';
      params.push(employee_id);
    }

    if (date_from) {
      whereClause += ' AND a.date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND a.date <= ?';
      params.push(date_to);
    }

    if (department) {
      whereClause += ' AND e.department = ?';
      params.push(department);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM attendance a 
      LEFT JOIN employees e ON a.employee_id = e.id 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get attendance records
    const attendanceQuery = `
      SELECT a.*, e.name as employee_name, e.code as employee_code, e.department
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      ${whereClause}
      ORDER BY a.date DESC, e.name ASC
      LIMIT ? OFFSET ?
    `;
    
    const attendance = await database.all(attendanceQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, attendance, { page, limit, total });
  })
);

// @route   POST /api/hr/attendance/check-in
// @desc    Record employee check-in
// @access  Private
router.post('/attendance/check-in',
  checkPermission('create_all'),
  [
    body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
    body('check_in_time').optional().isISO8601().withMessage('Invalid check-in time format')
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

    const { employee_id, check_in_time } = req.body;
    const today = moment().format('YYYY-MM-DD');
    const checkInTime = check_in_time || moment().toISOString();

    // Verify employee exists
    const employee = await database.get(
      'SELECT id, name, code FROM employees WHERE id = ? AND is_active = 1',
      [employee_id]
    );

    if (!employee) {
      throw new AppError('Employee not found or inactive', 404);
    }

    // Check if already checked in today
    const existingAttendance = await database.get(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existingAttendance) {
      throw new AppError('Employee already checked in today', 400);
    }

    // Create attendance record
    const result = await database.run(
      `INSERT INTO attendance (employee_id, date, check_in_time)
       VALUES (?, ?, ?)`,
      [employee_id, today, checkInTime]
    );

    const attendance = await database.get(
      `SELECT a.*, e.name as employee_name, e.code as employee_code
       FROM attendance a
       LEFT JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [result.id]
    );

    logger.logBusiness('employee_check_in', {
      employeeId: employee_id,
      employeeCode: employee.code,
      date: today,
      checkInTime: checkInTime,
      userId: req.user.id
    });

    sendSuccess(res, { attendance }, 'Check-in recorded successfully', 201);
  })
);

// @route   PUT /api/hr/attendance/check-out
// @desc    Record employee check-out
// @access  Private
router.put('/attendance/check-out',
  checkPermission('update_all'),
  [
    body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
    body('check_out_time').optional().isISO8601().withMessage('Invalid check-out time format')
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

    const { employee_id, check_out_time } = req.body;
    const today = moment().format('YYYY-MM-DD');
    const checkOutTime = check_out_time || moment().toISOString();

    // Find today's attendance record
    const attendance = await database.get(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (!attendance) {
      throw new AppError('No check-in record found for today', 404);
    }

    if (attendance.check_out_time) {
      throw new AppError('Employee already checked out today', 400);
    }

    // Calculate working hours and overtime
    const workingHours = calculateWorkingHours(attendance.check_in_time, checkOutTime);
    const overtimeHours = calculateOvertime(workingHours);

    // Update attendance record
    await database.run(
      `UPDATE attendance 
       SET check_out_time = ?, working_hours = ?, overtime_hours = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [checkOutTime, workingHours, overtimeHours, attendance.id]
    );

    const updatedAttendance = await database.get(
      `SELECT a.*, e.name as employee_name, e.code as employee_code
       FROM attendance a
       LEFT JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [attendance.id]
    );

    logger.logBusiness('employee_check_out', {
      employeeId: employee_id,
      date: today,
      checkOutTime: checkOutTime,
      workingHours: workingHours,
      overtimeHours: overtimeHours,
      userId: req.user.id
    });

    sendSuccess(res, { attendance: updatedAttendance }, 'Check-out recorded successfully');
  })
);

// @route   GET /api/hr/payroll
// @desc    Generate payroll report
// @access  Private
router.get('/payroll',
  authorize(['admin', 'hr_manager']),
  [
    query('month').isISO8601().withMessage('Valid month (YYYY-MM) is required'),
    query('employee_id').optional().isInt({ min: 1 }).withMessage('Invalid employee ID'),
    query('department').optional().isString().trim()
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

    const { month, employee_id, department } = req.query;

    let whereClause = 'WHERE e.is_active = 1';
    const params = [month];

    if (employee_id) {
      whereClause += ' AND e.id = ?';
      params.push(employee_id);
    }

    if (department) {
      whereClause += ' AND e.department = ?';
      params.push(department);
    }

    const payrollQuery = `
      SELECT 
        e.id, e.code, e.name, e.department, e.position, e.employment_type, e.salary,
        COUNT(a.id) as days_worked,
        COALESCE(SUM(a.working_hours), 0) as total_hours,
        COALESCE(SUM(a.overtime_hours), 0) as total_overtime,
        ROUND(e.salary / 30 * COUNT(a.id), 2) as basic_pay,
        ROUND(COALESCE(SUM(a.overtime_hours), 0) * (e.salary / 30 / 8) * 1.5, 2) as overtime_pay,
        ROUND((e.salary / 30 * COUNT(a.id)) + (COALESCE(SUM(a.overtime_hours), 0) * (e.salary / 30 / 8) * 1.5), 2) as total_pay
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id AND strftime('%Y-%m', a.date) = ?
      ${whereClause}
      GROUP BY e.id, e.code, e.name, e.department, e.position, e.employment_type, e.salary
      ORDER BY e.department, e.name
    `;

    const payroll = await database.all(payrollQuery, params);

    // Calculate totals
    const totals = payroll.reduce((acc, emp) => {
      acc.total_employees += 1;
      acc.total_basic_pay += parseFloat(emp.basic_pay || 0);
      acc.total_overtime_pay += parseFloat(emp.overtime_pay || 0);
      acc.total_pay += parseFloat(emp.total_pay || 0);
      acc.total_hours += parseFloat(emp.total_hours || 0);
      acc.total_overtime += parseFloat(emp.total_overtime || 0);
      return acc;
    }, {
      total_employees: 0,
      total_basic_pay: 0,
      total_overtime_pay: 0,
      total_pay: 0,
      total_hours: 0,
      total_overtime: 0
    });

    logger.logBusiness('payroll_generated', {
      month: month,
      totalEmployees: totals.total_employees,
      totalPay: totals.total_pay,
      userId: req.user.id
    });

    sendSuccess(res, {
      month,
      payroll,
      summary: totals
    });
  })
);

module.exports = router;