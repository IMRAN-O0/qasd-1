// Notification Service - Comprehensive notification management
import CryptoJS from 'crypto-js';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.subscriptions = new Map();
    this.templates = new Map();
    this.channels = {
      push: { enabled: false, subscription: null },
      email: { enabled: true, endpoint: '/api/notifications/email' },
      sms: { enabled: false, endpoint: '/api/notifications/sms' },
      inApp: { enabled: true, storage: 'localStorage' },
      webhook: { enabled: false, endpoints: [] }
    };

    this.settings = {
      maxNotifications: 1000,
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      batchSize: 10,
      retryAttempts: 3,
      retryDelay: 5000,
      enableSound: true,
      enableVibration: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    this.queue = [];
    this.processing = false;
    this.retryQueue = [];

    this.initializeService();
    this.setupTemplates();
  }

  // Initialize notification service
  async initializeService() {
    try {
      // Load saved notifications
      await this.loadNotifications();

      // Setup push notifications
      await this.setupPushNotifications();

      // Setup service worker messaging
      this.setupServiceWorkerMessaging();

      // Setup notification processing
      this.startNotificationProcessor();

      // Setup cleanup
      this.setupCleanup();

      // Load user preferences
      this.loadUserPreferences();

      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Setup notification templates
  setupTemplates() {
    // System templates
    this.templates.set('system_alert', {
      title: 'System Alert',
      body: '{message}',
      icon: '/icons/alert.png',
      badge: '/icons/badge.png',
      priority: 'high',
      category: 'system'
    });

    this.templates.set('security_warning', {
      title: 'Security Warning',
      body: 'Security event detected: {event}',
      icon: '/icons/security.png',
      badge: '/icons/badge.png',
      priority: 'urgent',
      category: 'security',
      requireInteraction: true
    });

    this.templates.set('production_update', {
      title: 'Production Update',
      body: 'Production status: {status}',
      icon: '/icons/production.png',
      badge: '/icons/badge.png',
      priority: 'normal',
      category: 'production'
    });

    this.templates.set('quality_alert', {
      title: 'Quality Alert',
      body: 'Quality issue detected: {issue}',
      icon: '/icons/quality.png',
      badge: '/icons/badge.png',
      priority: 'high',
      category: 'quality'
    });

    this.templates.set('maintenance_reminder', {
      title: 'Maintenance Reminder',
      body: 'Scheduled maintenance: {equipment} at {time}',
      icon: '/icons/maintenance.png',
      badge: '/icons/badge.png',
      priority: 'normal',
      category: 'maintenance'
    });

    this.templates.set('training_due', {
      title: 'Training Due',
      body: 'Training required: {training} due {date}',
      icon: '/icons/training.png',
      badge: '/icons/badge.png',
      priority: 'normal',
      category: 'training'
    });

    this.templates.set('document_approval', {
      title: 'Document Approval',
      body: 'Document requires approval: {document}',
      icon: '/icons/document.png',
      badge: '/icons/badge.png',
      priority: 'normal',
      category: 'workflow'
    });

    this.templates.set('audit_reminder', {
      title: 'Audit Reminder',
      body: 'Upcoming audit: {audit} on {date}',
      icon: '/icons/audit.png',
      badge: '/icons/badge.png',
      priority: 'normal',
      category: 'compliance'
    });

    // Email templates
    this.templates.set('email_system_alert', {
      subject: 'QASD System Alert - {severity}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc3545; margin: 0;">System Alert</h2>
            <p style="margin: 10px 0 0 0; color: #6c757d;">QASD Manufacturing System</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">Alert Details</h3>
            <p><strong>Message:</strong> {message}</p>
            <p><strong>Severity:</strong> <span style="color: {severityColor};">{severity}</span></p>
            <p><strong>Time:</strong> {timestamp}</p>
            <p><strong>Source:</strong> {source}</p>
            
            {details}
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #6c757d;">
                Please log into the QASD system to view more details and take appropriate action.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>This is an automated message from QASD Manufacturing System</p>
          </div>
        </div>
      `,
      priority: 'high'
    });

    this.templates.set('email_weekly_report', {
      subject: 'QASD Weekly Report - {week}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Weekly Report</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Week of {week}</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-top: none;">
            <h3 style="color: #495057; margin-top: 0;">Production Summary</h3>
            {productionSummary}
            
            <h3 style="color: #495057;">Quality Metrics</h3>
            {qualityMetrics}
            
            <h3 style="color: #495057;">Key Achievements</h3>
            {achievements}
            
            <h3 style="color: #495057;">Action Items</h3>
            {actionItems}
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
            <a href="{reportUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Full Report
            </a>
          </div>
        </div>
      `,
      priority: 'normal'
    });
  }

  // Setup push notifications
  async setupPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        this.channels.push.subscription = existingSubscription;
        this.channels.push.enabled = true;
        console.log('Push notifications already enabled');
      }

      // Listen for push subscription updates
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'PUSH_SUBSCRIPTION_CHANGE') {
          this.handlePushSubscriptionChange(event.data.subscription);
        }
      });
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  // Enable push notifications
  async enablePushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      this.channels.push.subscription = subscription;
      this.channels.push.enabled = true;

      console.log('Push notifications enabled');
      return subscription;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      throw error;
    }
  }

  // Disable push notifications
  async disablePushNotifications() {
    try {
      if (this.channels.push.subscription) {
        await this.channels.push.subscription.unsubscribe();
        await this.removeSubscriptionFromServer(this.channels.push.subscription);

        this.channels.push.subscription = null;
        this.channels.push.enabled = false;

        console.log('Push notifications disabled');
      }
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      throw error;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer(subscription) {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  // Handle push subscription change
  handlePushSubscriptionChange(newSubscription) {
    if (newSubscription) {
      this.sendSubscriptionToServer(newSubscription);
      this.channels.push.subscription = newSubscription;
    } else {
      this.channels.push.enabled = false;
      this.channels.push.subscription = null;
    }
  }

  // Setup service worker messaging
  setupServiceWorkerMessaging() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.notification);
        } else if (event.data.type === 'NOTIFICATION_CLOSE') {
          this.handleNotificationClose(event.data.notification);
        }
      });
    }
  }

  // Handle notification click
  handleNotificationClick(notification) {
    // Mark as read
    this.markAsRead(notification.id);

    // Handle action
    if (notification.action) {
      this.executeNotificationAction(notification.action, notification.data);
    }

    // Focus window
    if (window.focus) {
      window.focus();
    }
  }

  // Handle notification close
  handleNotificationClose(notification) {
    // Log dismissal
    this.logNotificationEvent('dismissed', notification.id);
  }

  // Execute notification action
  executeNotificationAction(action, data) {
    switch (action) {
      case 'view_alert':
        window.location.href = `/alerts/${data.alertId}`;
        break;
      case 'view_production':
        window.location.href = '/production';
        break;
      case 'view_quality':
        window.location.href = '/quality';
        break;
      case 'view_maintenance':
        window.location.href = '/maintenance';
        break;
      case 'approve_document':
        this.approveDocument(data.documentId);
        break;
      default:
        console.warn('Unknown notification action:', action);
    }
  }

  // Send notification
  async sendNotification(notification) {
    try {
      // Validate notification
      this.validateNotification(notification);

      // Check quiet hours
      if (this.isQuietHours()) {
        notification.priority = 'low';
      }

      // Generate notification ID
      const id = this.generateNotificationId();

      // Create notification object
      const notificationObj = {
        id,
        ...notification,
        timestamp: Date.now(),
        read: false,
        delivered: false,
        channels: notification.channels || ['inApp'],
        retryCount: 0
      };

      // Add to queue
      this.queue.push(notificationObj);

      // Process queue
      this.processQueue();

      return id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Send notification from template
  async sendFromTemplate(templateId, data, options = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Merge template with data
    const notification = {
      ...template,
      ...options,
      title: this.interpolateTemplate(template.title, data),
      body: this.interpolateTemplate(template.body, data)
    };

    // Handle email templates
    if (template.html) {
      notification.html = this.interpolateTemplate(template.html, data);
    }

    if (template.subject) {
      notification.subject = this.interpolateTemplate(template.subject, data);
    }

    return this.sendNotification(notification);
  }

  // Interpolate template
  interpolateTemplate(template, data) {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Validate notification
  validateNotification(notification) {
    if (!notification.title && !notification.subject) {
      throw new Error('Notification must have a title or subject');
    }

    if (!notification.body && !notification.html) {
      throw new Error('Notification must have a body or html content');
    }

    if (notification.channels) {
      const validChannels = Object.keys(this.channels);
      const invalidChannels = notification.channels.filter(ch => !validChannels.includes(ch));

      if (invalidChannels.length > 0) {
        throw new Error(`Invalid channels: ${invalidChannels.join(', ')}`);
      }
    }
  }

  // Generate notification ID
  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Check if it's quiet hours
  isQuietHours() {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Start notification processor
  startNotificationProcessor() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    this.processQueue();
  }

  // Process notification queue
  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    const batch = this.queue.splice(0, this.settings.batchSize);

    for (const notification of batch) {
      try {
        await this.deliverNotification(notification);
      } catch (error) {
        console.error('Failed to deliver notification:', error);
        this.handleDeliveryFailure(notification, error);
      }
    }

    // Continue processing
    setTimeout(() => this.processQueue(), 100);
  }

  // Deliver notification
  async deliverNotification(notification) {
    const deliveryPromises = [];

    for (const channel of notification.channels) {
      if (this.channels[channel]?.enabled) {
        deliveryPromises.push(this.deliverToChannel(notification, channel));
      }
    }

    await Promise.allSettled(deliveryPromises);

    // Mark as delivered
    notification.delivered = true;
    notification.deliveredAt = Date.now();

    // Add to notifications list
    this.notifications.unshift(notification);

    // Limit notifications array
    if (this.notifications.length > this.settings.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.settings.maxNotifications);
    }

    // Save notifications
    this.saveNotifications();

    // Emit event
    window.dispatchEvent(
      new CustomEvent('notification-delivered', {
        detail: notification
      })
    );

    // Log delivery
    this.logNotificationEvent('delivered', notification.id);
  }

  // Deliver to specific channel
  async deliverToChannel(notification, channel) {
    switch (channel) {
      case 'push':
        return this.deliverPushNotification(notification);
      case 'email':
        return this.deliverEmailNotification(notification);
      case 'sms':
        return this.deliverSMSNotification(notification);
      case 'inApp':
        return this.deliverInAppNotification(notification);
      case 'webhook':
        return this.deliverWebhookNotification(notification);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  // Deliver push notification
  async deliverPushNotification(notification) {
    if (!this.channels.push.enabled || !this.channels.push.subscription) {
      throw new Error('Push notifications not enabled');
    }

    // For browser push notifications, we'll show them directly
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico',
        tag: notification.id,
        data: notification.data,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.priority === 'low'
      };

      if (notification.actions) {
        options.actions = notification.actions;
      }

      const browserNotification = new Notification(notification.title, options);

      browserNotification.onclick = () => {
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      browserNotification.onclose = () => {
        this.handleNotificationClose(notification);
      };

      // Auto-close after delay (except for urgent notifications)
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      }

      // Play sound if enabled
      if (this.settings.enableSound && notification.priority !== 'low') {
        this.playNotificationSound();
      }

      // Vibrate if enabled and supported
      if (this.settings.enableVibration && 'vibrate' in navigator && notification.priority === 'urgent') {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }

  // Deliver email notification
  async deliverEmailNotification(notification) {
    if (!this.channels.email.enabled) {
      throw new Error('Email notifications not enabled');
    }

    const emailData = {
      to: notification.to || (await this.getUserEmail()),
      subject: notification.subject || notification.title,
      html: notification.html || this.generateEmailHTML(notification),
      priority: notification.priority,
      attachments: notification.attachments
    };

    const response = await fetch(this.channels.email.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`Email delivery failed: ${response.statusText}`);
    }
  }

  // Deliver SMS notification
  async deliverSMSNotification(notification) {
    if (!this.channels.sms.enabled) {
      throw new Error('SMS notifications not enabled');
    }

    const smsData = {
      to: notification.phone || (await this.getUserPhone()),
      message: `${notification.title}: ${notification.body}`,
      priority: notification.priority
    };

    const response = await fetch(this.channels.sms.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(smsData)
    });

    if (!response.ok) {
      throw new Error(`SMS delivery failed: ${response.statusText}`);
    }
  }

  // Deliver in-app notification
  async deliverInAppNotification(notification) {
    // This is handled by adding to the notifications array
    // The UI will display these notifications
    return Promise.resolve();
  }

  // Deliver webhook notification
  async deliverWebhookNotification(notification) {
    if (!this.channels.webhook.enabled || this.channels.webhook.endpoints.length === 0) {
      throw new Error('Webhook notifications not configured');
    }

    const webhookData = {
      notification,
      timestamp: Date.now(),
      source: 'qasd-system'
    };

    const promises = this.channels.webhook.endpoints.map(endpoint =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-QASD-Signature': this.generateWebhookSignature(webhookData)
        },
        body: JSON.stringify(webhookData)
      })
    );

    await Promise.allSettled(promises);
  }

  // Generate webhook signature
  generateWebhookSignature(data) {
    const secret = process.env.REACT_APP_WEBHOOK_SECRET || 'default-secret';
    const payload = JSON.stringify(data);
    return CryptoJS.HmacSHA256(payload, secret).toString();
  }

  // Handle delivery failure
  handleDeliveryFailure(notification, error) {
    notification.retryCount = (notification.retryCount || 0) + 1;

    if (notification.retryCount < this.settings.retryAttempts) {
      // Add to retry queue
      setTimeout(() => {
        this.queue.push(notification);
      }, this.settings.retryDelay * notification.retryCount);

      console.warn(
        `Notification delivery failed, retrying (${notification.retryCount}/${this.settings.retryAttempts}):`,
        error
      );
    } else {
      console.error('Notification delivery failed permanently:', error);

      // Log failure
      this.logNotificationEvent('failed', notification.id, { error: error.message });
    }
  }

  // Generate email HTML
  generateEmailHTML(notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #495057; margin: 0;">${notification.title}</h2>
          <p style="margin: 10px 0 0 0; color: #6c757d;">QASD Manufacturing System</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
          <p>${notification.body}</p>
          
          ${
  notification.data
    ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
              <h4 style="margin-top: 0;">Additional Information</h4>
              <pre style="font-size: 12px; color: #6c757d;">${JSON.stringify(notification.data, null, 2)}</pre>
            </div>
          `
    : ''
}
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>This is an automated message from QASD Manufacturing System</p>
        </div>
      </div>
    `;
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.warn('Notification sound not available:', error);
    }
  }

  // Get user email
  async getUserEmail() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.email || 'admin@qasd.com';
    } catch (error) {
      return 'admin@qasd.com';
    }
  }

  // Get user phone
  async getUserPhone() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.phone || null;
    } catch (error) {
      return null;
    }
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = Date.now();

      this.saveNotifications();
      this.logNotificationEvent('read', notificationId);

      // Emit event
      window.dispatchEvent(
        new CustomEvent('notification-read', {
          detail: notification
        })
      );
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    let count = 0;

    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = Date.now();
        count++;
      }
    });

    if (count > 0) {
      this.saveNotifications();
      this.logNotificationEvent('bulk_read', null, { count });

      // Emit event
      window.dispatchEvent(
        new CustomEvent('notifications-bulk-read', {
          detail: { count }
        })
      );
    }

    return count;
  }

  // Delete notification
  deleteNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = this.notifications.splice(index, 1)[0];
      this.saveNotifications();
      this.logNotificationEvent('deleted', notificationId);

      // Emit event
      window.dispatchEvent(
        new CustomEvent('notification-deleted', {
          detail: notification
        })
      );

      return notification;
    }
    return null;
  }

  // Clear all notifications
  clearAllNotifications() {
    const count = this.notifications.length;
    this.notifications = [];
    this.saveNotifications();
    this.logNotificationEvent('bulk_delete', null, { count });

    // Emit event
    window.dispatchEvent(
      new CustomEvent('notifications-cleared', {
        detail: { count }
      })
    );

    return count;
  }

  // Get notifications
  getNotifications(filter = {}) {
    let notifications = [...this.notifications];

    // Apply filters
    if (filter.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    if (filter.category) {
      notifications = notifications.filter(n => n.category === filter.category);
    }

    if (filter.priority) {
      notifications = notifications.filter(n => n.priority === filter.priority);
    }

    if (filter.since) {
      notifications = notifications.filter(n => n.timestamp >= filter.since);
    }

    // Apply sorting
    if (filter.sortBy) {
      notifications.sort((a, b) => {
        const aVal = a[filter.sortBy];
        const bVal = b[filter.sortBy];

        if (filter.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Apply pagination
    if (filter.limit) {
      const offset = filter.offset || 0;
      notifications = notifications.slice(offset, offset + filter.limit);
    }

    return notifications;
  }

  // Get notification statistics
  getNotificationStats() {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.read).length;
    const byCategory = {};
    const byPriority = {};

    this.notifications.forEach(notification => {
      // Count by category
      const category = notification.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;

      // Count by priority
      const priority = notification.priority || 'normal';
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    });

    return {
      total,
      unread,
      read: total - unread,
      byCategory,
      byPriority
    };
  }

  // Subscribe to notifications
  subscribe(callback, filter = {}) {
    const subscription = {
      id: this.generateSubscriptionId(),
      callback,
      filter
    };

    this.subscriptions.set(subscription.id, subscription);

    return {
      unsubscribe: () => {
        this.subscriptions.delete(subscription.id);
      }
    };
  }

  // Generate subscription ID
  generateSubscriptionId() {
    return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Notify subscribers
  notifySubscribers(notification) {
    this.subscriptions.forEach(subscription => {
      try {
        // Check if notification matches filter
        if (this.matchesFilter(notification, subscription.filter)) {
          subscription.callback(notification);
        }
      } catch (error) {
        console.error('Subscription callback error:', error);
      }
    });
  }

  // Check if notification matches filter
  matchesFilter(notification, filter) {
    if (filter.category && notification.category !== filter.category) {
      return false;
    }

    if (filter.priority && notification.priority !== filter.priority) {
      return false;
    }

    if (filter.minPriority) {
      const priorities = ['low', 'normal', 'high', 'urgent'];
      const notifPriorityIndex = priorities.indexOf(notification.priority || 'normal');
      const minPriorityIndex = priorities.indexOf(filter.minPriority);

      if (notifPriorityIndex < minPriorityIndex) {
        return false;
      }
    }

    return true;
  }

  // Load notifications from storage
  async loadNotifications() {
    try {
      const stored = localStorage.getItem('qasd_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);

        // Clean up old notifications
        const cutoff = Date.now() - this.settings.retentionPeriod;
        this.notifications = this.notifications.filter(n => n.timestamp >= cutoff);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to storage
  saveNotifications() {
    try {
      localStorage.setItem('qasd_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load user preferences
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem('qasd_notification_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.settings = { ...this.settings, ...preferences };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  // Save user preferences
  saveUserPreferences() {
    try {
      localStorage.setItem('qasd_notification_preferences', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveUserPreferences();

    // Emit event
    window.dispatchEvent(
      new CustomEvent('notification-settings-updated', {
        detail: this.settings
      })
    );
  }

  // Setup cleanup
  setupCleanup() {
    // Clean up old notifications daily
    setInterval(
      () => {
        this.cleanupOldNotifications();
      },
      24 * 60 * 60 * 1000
    ); // 24 hours
  }

  // Clean up old notifications
  cleanupOldNotifications() {
    const cutoff = Date.now() - this.settings.retentionPeriod;
    const originalLength = this.notifications.length;

    this.notifications = this.notifications.filter(n => n.timestamp >= cutoff);

    const cleaned = originalLength - this.notifications.length;
    if (cleaned > 0) {
      this.saveNotifications();
      console.log(`Cleaned up ${cleaned} old notifications`);
    }
  }

  // Log notification event
  logNotificationEvent(event, notificationId, data = {}) {
    const logEntry = {
      timestamp: Date.now(),
      event,
      notificationId,
      data
    };

    // Store in a simple log array (in a real app, this might go to a logging service)
    const logs = JSON.parse(localStorage.getItem('qasd_notification_logs') || '[]');
    logs.unshift(logEntry);

    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs.splice(1000);
    }

    localStorage.setItem('qasd_notification_logs', JSON.stringify(logs));
  }

  // Get notification logs
  getNotificationLogs(limit = 100) {
    try {
      const logs = JSON.parse(localStorage.getItem('qasd_notification_logs') || '[]');
      return logs.slice(0, limit);
    } catch (error) {
      console.error('Failed to get notification logs:', error);
      return [];
    }
  }

  // Approve document (example action)
  async approveDocument(documentId) {
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        this.sendNotification({
          title: 'Document Approved',
          body: `Document ${documentId} has been approved`,
          category: 'workflow',
          priority: 'normal',
          channels: ['inApp']
        });
      }
    } catch (error) {
      console.error('Failed to approve document:', error);
    }
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Get service status
  getServiceStatus() {
    return {
      initialized: true,
      channels: Object.keys(this.channels).reduce((acc, key) => {
        acc[key] = this.channels[key].enabled;
        return acc;
      }, {}),
      notifications: {
        total: this.notifications.length,
        unread: this.notifications.filter(n => !n.read).length
      },
      queue: {
        pending: this.queue.length,
        processing: this.processing
      },
      settings: this.settings
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
