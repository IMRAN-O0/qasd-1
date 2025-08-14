const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { database } = require('../config/database');
const { asyncHandler, AppError, sendSuccess, sendPaginatedResponse, formatValidationErrors } = require('../middleware/errorHandler');
const { authorize, checkPermission } = require('../middleware/auth');
const logger = require('../utils/logger');
const moment = require('moment');

const router = express.Router();

// Helper function to generate incident number
const generateIncidentNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INC${year}`;
  
  const lastIncident = await database.get(
    'SELECT incident_number FROM safety_incidents WHERE incident_number LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );
  
  let nextNumber = 1;
  if (lastIncident) {
    const lastNumber = parseInt(lastIncident.incident_number.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

// Helper function to calculate incident severity score
const calculateSeverityScore = (severity, injuryType, workDaysLost = 0) => {
  let baseScore = 0;
  
  switch (severity) {
    case 'low': baseScore = 1; break;
    case 'medium': baseScore = 3; break;
    case 'high': baseScore = 5; break;
    case 'critical': baseScore = 10; break;
    default: baseScore = 1;
  }
  
  // Adjust for injury type
  const injuryMultiplier = {
    'none': 1,
    'first_aid': 1.2,
    'medical_treatment': 1.5,
    'lost_time': 2,
    'fatality': 10
  };
  
  const multiplier = injuryMultiplier[injuryType] || 1;
  
  // Add work days lost factor
  const daysLostFactor = Math.min(workDaysLost * 0.1, 2);
  
  return Math.round((baseScore * multiplier + daysLostFactor) * 10) / 10;
};

// ============ SAFETY INCIDENTS ROUTES ============

// @route   GET /api/safety/incidents
// @desc    Get all safety incidents with pagination and search
// @access  Private
router.get('/incidents',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
    query('status').optional().isIn(['open', 'investigating', 'resolved', 'closed']).withMessage('Invalid status'),
    query('injury_type').optional().isIn(['none', 'first_aid', 'medical_treatment', 'lost_time', 'fatality']).withMessage('Invalid injury type'),
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
    const search = req.query.search || '';
    const { severity, status, injury_type, date_from, date_to, department } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (si.incident_number LIKE ? OR si.description LIKE ? OR si.location LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (severity) {
      whereClause += ' AND si.severity = ?';
      params.push(severity);
    }

    if (status) {
      whereClause += ' AND si.status = ?';
      params.push(status);
    }

    if (injury_type) {
      whereClause += ' AND si.injury_type = ?';
      params.push(injury_type);
    }

    if (date_from) {
      whereClause += ' AND DATE(si.incident_date) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(si.incident_date) <= ?';
      params.push(date_to);
    }

    if (department) {
      whereClause += ' AND e.department = ?';
      params.push(department);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM safety_incidents si 
      LEFT JOIN employees e ON si.employee_id = e.id 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get incidents
    const incidentsQuery = `
      SELECT si.*, e.name as employee_name, e.code as employee_code, e.department,
             u.username as reported_by_name
      FROM safety_incidents si
      LEFT JOIN employees e ON si.employee_id = e.id
      LEFT JOIN users u ON si.reported_by = u.id
      ${whereClause}
      ORDER BY si.incident_date DESC, si.severity_score DESC
      LIMIT ? OFFSET ?
    `;
    
    const incidents = await database.all(incidentsQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, incidents, { page, limit, total });
  })
);

// @route   GET /api/safety/incidents/:id
// @desc    Get safety incident by ID
// @access  Private
router.get('/incidents/:id',
  checkPermission('read_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid incident ID')
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

    const incident = await database.get(
      `SELECT si.*, e.name as employee_name, e.code as employee_code, e.department,
              u.username as reported_by_name
       FROM safety_incidents si
       LEFT JOIN employees e ON si.employee_id = e.id
       LEFT JOIN users u ON si.reported_by = u.id
       WHERE si.id = ?`,
      [req.params.id]
    );

    if (!incident) {
      throw new AppError('Safety incident not found', 404);
    }

    // Get incident actions
    const actions = await database.all(
      `SELECT sia.*, u.username as assigned_to_name
       FROM safety_incident_actions sia
       LEFT JOIN users u ON sia.assigned_to = u.id
       WHERE sia.incident_id = ?
       ORDER BY sia.due_date ASC`,
      [req.params.id]
    );

    // Get incident updates/notes
    const updates = await database.all(
      `SELECT siu.*, u.username as created_by_name
       FROM safety_incident_updates siu
       LEFT JOIN users u ON siu.created_by = u.id
       WHERE siu.incident_id = ?
       ORDER BY siu.created_at DESC`,
      [req.params.id]
    );

    sendSuccess(res, { 
      incident,
      actions,
      updates
    });
  })
);

// @route   POST /api/safety/incidents
// @desc    Create new safety incident
// @access  Private
router.post('/incidents',
  checkPermission('create_all'),
  [
    body('incident_date').isISO8601().withMessage('Valid incident date is required'),
    body('location').notEmpty().withMessage('Location is required').trim(),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
    body('injury_type').isIn(['none', 'first_aid', 'medical_treatment', 'lost_time', 'fatality']).withMessage('Invalid injury type'),
    body('employee_id').optional().isInt({ min: 1 }).withMessage('Invalid employee ID'),
    body('witnesses').optional().trim(),
    body('immediate_action').optional().trim(),
    body('work_days_lost').optional().isInt({ min: 0 }).withMessage('Work days lost must be positive'),
    body('equipment_involved').optional().trim(),
    body('environmental_factors').optional().trim()
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
      incident_date, location, description, severity, injury_type,
      employee_id, witnesses, immediate_action, work_days_lost = 0,
      equipment_involved, environmental_factors
    } = req.body;

    // Verify employee exists if provided
    if (employee_id) {
      const employee = await database.get(
        'SELECT id FROM employees WHERE id = ? AND is_active = 1',
        [employee_id]
      );
      if (!employee) {
        throw new AppError('Employee not found or inactive', 404);
      }
    }

    // Generate incident number
    const incidentNumber = await generateIncidentNumber();

    // Calculate severity score
    const severityScore = calculateSeverityScore(severity, injury_type, work_days_lost);

    const result = await database.run(
      `INSERT INTO safety_incidents 
       (incident_number, incident_date, location, description, severity, injury_type,
        employee_id, witnesses, immediate_action, work_days_lost, equipment_involved,
        environmental_factors, severity_score, reported_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incidentNumber, incident_date, location, description, severity, injury_type,
        employee_id, witnesses, immediate_action, work_days_lost, equipment_involved,
        environmental_factors, severityScore, req.user.id
      ]
    );

    const incident = await database.get(
      `SELECT si.*, e.name as employee_name, e.code as employee_code
       FROM safety_incidents si
       LEFT JOIN employees e ON si.employee_id = e.id
       WHERE si.id = ?`,
      [result.id]
    );

    logger.logBusiness('safety_incident_created', {
      incidentId: incident.id,
      incidentNumber: incident.incident_number,
      severity: severity,
      injuryType: injury_type,
      severityScore: severityScore,
      employeeId: employee_id,
      userId: req.user.id
    });

    sendSuccess(res, { incident }, 'Safety incident created successfully', 201);
  })
);

// @route   PUT /api/safety/incidents/:id/status
// @desc    Update incident status
// @access  Private
router.put('/incidents/:id/status',
  checkPermission('update_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid incident ID'),
    body('status').isIn(['open', 'investigating', 'resolved', 'closed']).withMessage('Invalid status'),
    body('resolution_notes').optional().trim(),
    body('closed_date').optional().isISO8601().withMessage('Invalid closed date')
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

    const incidentId = req.params.id;
    const { status, resolution_notes, closed_date } = req.body;

    // Get current incident
    const incident = await database.get(
      'SELECT * FROM safety_incidents WHERE id = ?',
      [incidentId]
    );

    if (!incident) {
      throw new AppError('Safety incident not found', 404);
    }

    // Prepare update fields
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];

    if (resolution_notes) {
      updates.push('resolution_notes = ?');
      values.push(resolution_notes);
    }

    if (status === 'closed' && closed_date) {
      updates.push('closed_date = ?');
      values.push(closed_date);
    } else if (status === 'closed' && !closed_date) {
      updates.push('closed_date = CURRENT_TIMESTAMP');
    }

    values.push(incidentId);

    // Update incident
    await database.run(
      `UPDATE safety_incidents SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Add status update record
    await database.run(
      `INSERT INTO safety_incident_updates (incident_id, update_type, notes, created_by)
       VALUES (?, ?, ?, ?)`,
      [incidentId, 'status_change', `Status changed to: ${status}${resolution_notes ? '. ' + resolution_notes : ''}`, req.user.id]
    );

    // Get updated incident
    const updatedIncident = await database.get(
      `SELECT si.*, e.name as employee_name, e.code as employee_code
       FROM safety_incidents si
       LEFT JOIN employees e ON si.employee_id = e.id
       WHERE si.id = ?`,
      [incidentId]
    );

    logger.logBusiness('safety_incident_status_updated', {
      incidentId: updatedIncident.id,
      incidentNumber: updatedIncident.incident_number,
      oldStatus: incident.status,
      newStatus: status,
      userId: req.user.id
    });

    sendSuccess(res, { incident: updatedIncident }, 'Incident status updated successfully');
  })
);

// @route   POST /api/safety/incidents/:id/actions
// @desc    Add corrective action to incident
// @access  Private
router.post('/incidents/:id/actions',
  checkPermission('create_all'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid incident ID'),
    body('action_type').isIn(['immediate', 'corrective', 'preventive']).withMessage('Invalid action type'),
    body('description').notEmpty().withMessage('Action description is required').trim(),
    body('assigned_to').isInt({ min: 1 }).withMessage('Valid assigned user ID is required'),
    body('due_date').isISO8601().withMessage('Valid due date is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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

    const incidentId = req.params.id;
    const { action_type, description, assigned_to, due_date, priority } = req.body;

    // Verify incident exists
    const incident = await database.get(
      'SELECT id FROM safety_incidents WHERE id = ?',
      [incidentId]
    );

    if (!incident) {
      throw new AppError('Safety incident not found', 404);
    }

    // Verify assigned user exists
    const assignedUser = await database.get(
      'SELECT id, username FROM users WHERE id = ? AND is_active = 1',
      [assigned_to]
    );

    if (!assignedUser) {
      throw new AppError('Assigned user not found or inactive', 404);
    }

    const result = await database.run(
      `INSERT INTO safety_incident_actions 
       (incident_id, action_type, description, assigned_to, due_date, priority, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [incidentId, action_type, description, assigned_to, due_date, priority, req.user.id]
    );

    const action = await database.get(
      `SELECT sia.*, u.username as assigned_to_name
       FROM safety_incident_actions sia
       LEFT JOIN users u ON sia.assigned_to = u.id
       WHERE sia.id = ?`,
      [result.id]
    );

    logger.logBusiness('safety_action_created', {
      incidentId: incidentId,
      actionId: action.id,
      actionType: action_type,
      assignedTo: assigned_to,
      priority: priority,
      userId: req.user.id
    });

    sendSuccess(res, { action }, 'Corrective action added successfully', 201);
  })
);

// ============ SAFETY TRAINING ROUTES ============

// @route   GET /api/safety/training
// @desc    Get safety training records
// @access  Private
router.get('/training',
  checkPermission('read_all'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('employee_id').optional().isInt({ min: 1 }).withMessage('Invalid employee ID'),
    query('training_type').optional().isString().trim(),
    query('status').optional().isIn(['scheduled', 'completed', 'expired', 'cancelled']).withMessage('Invalid status'),
    query('expiring_soon').optional().isBoolean()
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
    const { employee_id, training_type, status, expiring_soon } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (employee_id) {
      whereClause += ' AND st.employee_id = ?';
      params.push(employee_id);
    }

    if (training_type) {
      whereClause += ' AND st.training_type = ?';
      params.push(training_type);
    }

    if (status) {
      whereClause += ' AND st.status = ?';
      params.push(status);
    }

    if (expiring_soon === 'true') {
      whereClause += ' AND st.expiry_date <= date(\'now\', \'+30 days\') AND st.status = \'completed\'';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM safety_training st 
      LEFT JOIN employees e ON st.employee_id = e.id 
      ${whereClause}
    `;
    const { total } = await database.get(countQuery, params);

    // Get training records
    const trainingQuery = `
      SELECT st.*, e.name as employee_name, e.code as employee_code, e.department
      FROM safety_training st
      LEFT JOIN employees e ON st.employee_id = e.id
      ${whereClause}
      ORDER BY st.training_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const training = await database.all(trainingQuery, [...params, limit, offset]);

    sendPaginatedResponse(res, training, { page, limit, total });
  })
);

// @route   POST /api/safety/training
// @desc    Record safety training
// @access  Private
router.post('/training',
  checkPermission('create_all'),
  [
    body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
    body('training_type').notEmpty().withMessage('Training type is required').trim(),
    body('training_date').isISO8601().withMessage('Valid training date is required'),
    body('trainer').notEmpty().withMessage('Trainer name is required').trim(),
    body('duration_hours').isFloat({ min: 0.1 }).withMessage('Duration must be positive'),
    body('expiry_date').optional().isISO8601().withMessage('Invalid expiry date'),
    body('certificate_number').optional().trim(),
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

    const {
      employee_id, training_type, training_date, trainer,
      duration_hours, expiry_date, certificate_number, notes
    } = req.body;

    // Verify employee exists
    const employee = await database.get(
      'SELECT id, name, code FROM employees WHERE id = ? AND is_active = 1',
      [employee_id]
    );

    if (!employee) {
      throw new AppError('Employee not found or inactive', 404);
    }

    const result = await database.run(
      `INSERT INTO safety_training 
       (employee_id, training_type, training_date, trainer, duration_hours,
        expiry_date, certificate_number, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id, training_type, training_date, trainer, duration_hours,
        expiry_date, certificate_number, notes, 'completed'
      ]
    );

    const training = await database.get(
      `SELECT st.*, e.name as employee_name, e.code as employee_code
       FROM safety_training st
       LEFT JOIN employees e ON st.employee_id = e.id
       WHERE st.id = ?`,
      [result.id]
    );

    logger.logBusiness('safety_training_recorded', {
      trainingId: training.id,
      employeeId: employee_id,
      employeeCode: employee.code,
      trainingType: training_type,
      duration: duration_hours,
      userId: req.user.id
    });

    sendSuccess(res, { training }, 'Safety training recorded successfully', 201);
  })
);

// @route   GET /api/safety/dashboard
// @desc    Get safety dashboard statistics
// @access  Private
router.get('/dashboard',
  checkPermission('read_all'),
  asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = moment().format('YYYY-MM');

    // Incident statistics
    const incidentStats = await database.get(
      `SELECT 
         COUNT(*) as total_incidents,
         SUM(CASE WHEN strftime('%Y', incident_date) = ? THEN 1 ELSE 0 END) as incidents_this_year,
         SUM(CASE WHEN strftime('%Y-%m', incident_date) = ? THEN 1 ELSE 0 END) as incidents_this_month,
         SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_incidents,
         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_incidents,
         AVG(severity_score) as avg_severity_score
       FROM safety_incidents`,
      [currentYear.toString(), currentMonth]
    );

    // Training statistics
    const trainingStats = await database.get(
      `SELECT 
         COUNT(*) as total_training_records,
         SUM(CASE WHEN expiry_date <= date('now', '+30 days') AND status = 'completed' THEN 1 ELSE 0 END) as expiring_soon,
         SUM(CASE WHEN expiry_date < date('now') AND status = 'completed' THEN 1 ELSE 0 END) as expired_training
       FROM safety_training`
    );

    // Recent incidents
    const recentIncidents = await database.all(
      `SELECT si.id, si.incident_number, si.incident_date, si.severity, si.description,
              e.name as employee_name, e.department
       FROM safety_incidents si
       LEFT JOIN employees e ON si.employee_id = e.id
       ORDER BY si.incident_date DESC
       LIMIT 5`
    );

    // Pending actions
    const pendingActions = await database.all(
      `SELECT sia.id, sia.description, sia.due_date, sia.priority,
              si.incident_number, u.username as assigned_to_name
       FROM safety_incident_actions sia
       LEFT JOIN safety_incidents si ON sia.incident_id = si.id
       LEFT JOIN users u ON sia.assigned_to = u.id
       WHERE sia.status = 'pending' AND sia.due_date >= date('now')
       ORDER BY sia.due_date ASC
       LIMIT 10`
    );

    // Monthly incident trend
    const monthlyTrend = await database.all(
      `SELECT 
         strftime('%Y-%m', incident_date) as month,
         COUNT(*) as incident_count,
         AVG(severity_score) as avg_severity
       FROM safety_incidents
       WHERE incident_date >= date('now', '-12 months')
       GROUP BY strftime('%Y-%m', incident_date)
       ORDER BY month ASC`
    );

    sendSuccess(res, {
      incident_statistics: incidentStats,
      training_statistics: trainingStats,
      recent_incidents: recentIncidents,
      pending_actions: pendingActions,
      monthly_trend: monthlyTrend
    });
  })
);

module.exports = router;