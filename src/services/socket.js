import React from 'react';
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect(token = null) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const socketOptions = {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    };

    // Add authentication token if provided
    if (token) {
      socketOptions.auth = {
        token: token
      };
    }

    const SOCKET_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL)
      ? import.meta.env.VITE_SOCKET_URL
      : (() => {
          try {
            const fromEnv = (typeof process !== 'undefined' && process.env && process.env.VITE_SOCKET_URL) ? process.env.VITE_SOCKET_URL : null;
            if (fromEnv) return fromEnv;
            const { protocol, hostname } = window.location;
            const port = '5000';
            return `${protocol}//${hostname}:${port}`;
          } catch {
            return 'http://localhost:5000';
          }
        })();

    this.socket = io(SOCKET_URL, socketOptions);

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket:connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socket:disconnected', { reason });
    });

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnection();
    });

    // Real-time event handlers
    this.setupEventHandlers();

    return this.socket;
  }

  // Setup real-time event handlers
  setupEventHandlers() {
    if (!this.socket) {
      return;
    }

    // Inventory updates
    this.socket.on('inventory:updated', data => {
      this.emit('inventory:updated', data);
    });

    this.socket.on('inventory:low_stock', data => {
      this.emit('inventory:low_stock', data);
    });

    // Production updates
    this.socket.on('production:batch_updated', data => {
      this.emit('production:batch_updated', data);
    });

    this.socket.on('production:equipment_alert', data => {
      this.emit('production:equipment_alert', data);
    });

    // Quality alerts
    this.socket.on('quality:non_conformance', data => {
      this.emit('quality:non_conformance', data);
    });

    // Safety incidents
    this.socket.on('safety:incident_reported', data => {
      this.emit('safety:incident_reported', data);
    });

    // System notifications
    this.socket.on('system:notification', data => {
      this.emit('system:notification', data);
    });

    // User activity
    this.socket.on('user:activity', data => {
      this.emit('user:activity', data);
    });

    // Backup status
    this.socket.on('backup:status', data => {
      this.emit('backup:status', data);
    });
  }

  // Handle reconnection logic
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('socket:max_reconnect_attempts');
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Emit event to server
  emit(event, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Listen to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback = null) {
    if (callback) {
      const eventListeners = this.listeners.get(event) || [];
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }

      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  // Join a room
  joinRoom(room) {
    this.emit('join_room', { room });
  }

  // Leave a room
  leaveRoom(room) {
    this.emit('leave_room', { room });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Subscribe to inventory updates for specific items
  subscribeToInventory(itemIds = []) {
    this.emit('subscribe:inventory', { itemIds });
  }

  // Subscribe to production updates for specific batches
  subscribeToProduction(batchIds = []) {
    this.emit('subscribe:production', { batchIds });
  }

  // Subscribe to user-specific notifications
  subscribeToUserNotifications(userId) {
    this.emit('subscribe:user_notifications', { userId });
  }

  // Send real-time message
  sendMessage(type, data) {
    this.emit('message', { type, data, timestamp: new Date().toISOString() });
  }

  // Notify about user activity
  notifyUserActivity(activity) {
    this.emit('user_activity', {
      activity,
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const socketService = new SocketService();

// React hook for using socket service
export const useSocket = () => {
  const [isConnected, setIsConnected] = React.useState(socketService.isConnected);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    // Listen to connection status changes
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('socket:connected', handleConnect);
    socketService.on('socket:disconnected', handleDisconnect);

    // Listen to system notifications
    const handleNotification = notification => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    };

    socketService.on('system:notification', handleNotification);

    return () => {
      socketService.off('socket:connected', handleConnect);
      socketService.off('socket:disconnected', handleDisconnect);
      socketService.off('system:notification', handleNotification);
    };
  }, []);

  return {
    socket: socketService,
    isConnected,
    notifications,
    clearNotifications: () => setNotifications([])
  };
};

export default socketService;

// Notification types for reference
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INVENTORY_LOW: 'inventory_low',
  PRODUCTION_ALERT: 'production_alert',
  QUALITY_ISSUE: 'quality_issue',
  SAFETY_INCIDENT: 'safety_incident',
  SYSTEM_UPDATE: 'system_update'
};

// Event types for reference
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Inventory
  INVENTORY_UPDATED: 'inventory:updated',
  INVENTORY_LOW_STOCK: 'inventory:low_stock',

  // Production
  PRODUCTION_BATCH_UPDATED: 'production:batch_updated',
  PRODUCTION_EQUIPMENT_ALERT: 'production:equipment_alert',

  // Quality
  QUALITY_NON_CONFORMANCE: 'quality:non_conformance',

  // Safety
  SAFETY_INCIDENT: 'safety:incident_reported',

  // System
  SYSTEM_NOTIFICATION: 'system:notification',
  USER_ACTIVITY: 'user:activity',
  BACKUP_STATUS: 'backup:status'
};
