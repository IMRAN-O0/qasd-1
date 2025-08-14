const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { database } = require('../config/database');
const logger = require('./logger');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user details from database
        const user = await database.get(
          'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
          [decoded.id]
        );

        if (!user) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        logger.logError('Socket authentication failed', {
          error: error.message,
          socketId: socket.id
        });
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.IO server initialized');
    return this.io;
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    logger.logAuth('user_connected_websocket', {
      userId: userId,
      username: user.username,
      socketId: socket.id,
      role: user.role
    });

    // Join user to their personal room
    socket.join(`user_${userId}`);
    
    // Join user to role-based rooms
    socket.join(`role_${user.role}`);
    
    // Join user to department rooms if applicable
    if (user.department) {
      socket.join(`department_${user.department}`);
    }

    // Send welcome message with connection info
    socket.emit('connected', {
      message: 'Connected to QASD Management System',
      userId: userId,
      username: user.username,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle user status updates
    socket.on('update_status', (data) => {
      this.handleStatusUpdate(socket, data);
    });

    // Handle joining specific rooms
    socket.on('join_room', (data) => {
      this.handleJoinRoom(socket, data);
    });

    // Handle leaving specific rooms
    socket.on('leave_room', (data) => {
      this.handleLeaveRoom(socket, data);
    });

    // Handle real-time chat/messaging
    socket.on('send_message', (data) => {
      this.handleMessage(socket, data);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Notify other users about new connection (admin/manager only)
    if (user.role === 'admin' || user.role === 'manager') {
      socket.to('role_admin').to('role_manager').emit('user_connected', {
        userId: userId,
        username: user.username,
        role: user.role,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleStatusUpdate(socket, data) {
    const { status, message } = data;
    const userId = socket.userId;
    const user = socket.user;

    // Validate status
    const validStatuses = ['online', 'away', 'busy', 'offline'];
    if (!validStatuses.includes(status)) {
      socket.emit('error', { message: 'Invalid status' });
      return;
    }

    // Broadcast status update to relevant users
    socket.to(`role_${user.role}`).emit('user_status_update', {
      userId: userId,
      username: user.username,
      status: status,
      message: message,
      timestamp: new Date().toISOString()
    });

    logger.logBusiness('user_status_updated', {
      userId: userId,
      status: status,
      message: message
    });
  }

  handleJoinRoom(socket, data) {
    const { room, password } = data;
    const userId = socket.userId;
    const user = socket.user;

    // Validate room access based on user role and permissions
    if (this.canJoinRoom(user, room)) {
      socket.join(room);
      socket.emit('room_joined', {
        room: room,
        message: `Joined room: ${room}`,
        timestamp: new Date().toISOString()
      });

      // Notify other room members
      socket.to(room).emit('user_joined_room', {
        userId: userId,
        username: user.username,
        room: room,
        timestamp: new Date().toISOString()
      });

      logger.logBusiness('user_joined_room', {
        userId: userId,
        room: room
      });
    } else {
      socket.emit('error', {
        message: 'Access denied to room',
        room: room
      });
    }
  }

  handleLeaveRoom(socket, data) {
    const { room } = data;
    const userId = socket.userId;
    const user = socket.user;

    socket.leave(room);
    socket.emit('room_left', {
      room: room,
      message: `Left room: ${room}`,
      timestamp: new Date().toISOString()
    });

    // Notify other room members
    socket.to(room).emit('user_left_room', {
      userId: userId,
      username: user.username,
      room: room,
      timestamp: new Date().toISOString()
    });

    logger.logBusiness('user_left_room', {
      userId: userId,
      room: room
    });
  }

  handleMessage(socket, data) {
    const { room, message, type = 'text' } = data;
    const userId = socket.userId;
    const user = socket.user;

    if (!message || message.trim().length === 0) {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }

    const messageData = {
      id: Date.now().toString(),
      userId: userId,
      username: user.username,
      role: user.role,
      message: message.trim(),
      type: type,
      room: room,
      timestamp: new Date().toISOString()
    };

    // Send to specific room or broadcast
    if (room) {
      socket.to(room).emit('new_message', messageData);
    } else {
      socket.broadcast.emit('new_message', messageData);
    }

    // Confirm message sent
    socket.emit('message_sent', {
      messageId: messageData.id,
      timestamp: messageData.timestamp
    });

    logger.logBusiness('message_sent', {
      userId: userId,
      room: room,
      messageType: type,
      messageLength: message.length
    });
  }

  handleDisconnection(socket, reason) {
    const userId = socket.userId;
    const user = socket.user;

    if (userId) {
      // Remove user from tracking
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      logger.logAuth('user_disconnected_websocket', {
        userId: userId,
        username: user?.username,
        socketId: socket.id,
        reason: reason
      });

      // Notify other users about disconnection (admin/manager only)
      if (user && (user.role === 'admin' || user.role === 'manager')) {
        socket.to('role_admin').to('role_manager').emit('user_disconnected', {
          userId: userId,
          username: user.username,
          role: user.role,
          reason: reason,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  canJoinRoom(user, room) {
    // Define room access rules
    const roomPermissions = {
      'admin_only': ['admin'],
      'management': ['admin', 'manager'],
      'production': ['admin', 'manager', 'production_manager', 'production_user'],
      'sales': ['admin', 'manager', 'sales_manager', 'sales_user'],
      'hr': ['admin', 'manager', 'hr_manager', 'hr_user'],
      'safety': ['admin', 'manager', 'safety_manager', 'safety_user'],
      'inventory': ['admin', 'manager', 'inventory_manager', 'inventory_user'],
      'general': ['admin', 'manager', 'user']
    };

    // Check if room has specific permissions
    if (roomPermissions[room]) {
      return roomPermissions[room].includes(user.role);
    }

    // Allow access to user-specific rooms
    if (room.startsWith(`user_${user.id}`)) {
      return true;
    }

    // Allow access to role-based rooms
    if (room === `role_${user.role}`) {
      return true;
    }

    // Allow access to department rooms
    if (user.department && room === `department_${user.department}`) {
      return true;
    }

    // Default deny
    return false;
  }

  // ============ NOTIFICATION METHODS ============

  // Send notification to specific user
  notifyUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // Send notification to multiple users
  notifyUsers(userIds, event, data) {
    if (!Array.isArray(userIds)) return false;
    
    let notifiedCount = 0;
    userIds.forEach(userId => {
      if (this.notifyUser(userId, event, data)) {
        notifiedCount++;
      }
    });
    return notifiedCount;
  }

  // Send notification to users with specific role
  notifyRole(role, event, data) {
    if (this.io) {
      this.io.to(`role_${role}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // Send notification to all connected users
  notifyAll(event, data) {
    if (this.io) {
      this.io.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // Send notification to specific room
  notifyRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // ============ BUSINESS EVENT NOTIFICATIONS ============

  // Notify about new quotation
  notifyNewQuotation(quotation, createdBy) {
    this.notifyRole('admin', 'new_quotation', {
      type: 'quotation_created',
      quotation: quotation,
      createdBy: createdBy,
      message: `New quotation ${quotation.number} created by ${createdBy.username}`
    });

    this.notifyRole('manager', 'new_quotation', {
      type: 'quotation_created',
      quotation: quotation,
      createdBy: createdBy,
      message: `New quotation ${quotation.number} created`
    });
  }

  // Notify about production batch status change
  notifyProductionUpdate(batch, updatedBy) {
    this.notifyRoom('production', 'production_update', {
      type: 'batch_status_updated',
      batch: batch,
      updatedBy: updatedBy,
      message: `Production batch ${batch.number} status updated to ${batch.status}`
    });
  }

  // Notify about safety incident
  notifySafetyIncident(incident, reportedBy) {
    this.notifyRole('admin', 'safety_incident', {
      type: 'safety_incident_reported',
      incident: incident,
      reportedBy: reportedBy,
      message: `Safety incident ${incident.incident_number} reported`,
      priority: 'high'
    });

    this.notifyRoom('safety', 'safety_incident', {
      type: 'safety_incident_reported',
      incident: incident,
      reportedBy: reportedBy,
      message: `New safety incident reported`
    });
  }

  // Notify about low stock
  notifyLowStock(item, currentStock, minStock) {
    this.notifyRole('admin', 'low_stock_alert', {
      type: 'low_stock',
      item: item,
      currentStock: currentStock,
      minStock: minStock,
      message: `Low stock alert: ${item.name} (${currentStock}/${minStock})`,
      priority: 'medium'
    });

    this.notifyRoom('inventory', 'low_stock_alert', {
      type: 'low_stock',
      item: item,
      currentStock: currentStock,
      minStock: minStock,
      message: `Low stock: ${item.name}`
    });
  }

  // Notify about system backup
  notifySystemBackup(backupInfo) {
    this.notifyRole('admin', 'system_backup', {
      type: 'backup_completed',
      backup: backupInfo,
      message: `System backup completed: ${backupInfo.filename}`
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list (admin only)
  getConnectedUsers() {
    const users = [];
    this.connectedUsers.forEach((socketId, userId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.user) {
        users.push({
          userId: userId,
          username: socket.user.username,
          role: socket.user.role,
          socketId: socketId,
          connectedAt: socket.handshake.time
        });
      }
    });
    return users;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const socketManager = new SocketManager();

module.exports = socketManager;