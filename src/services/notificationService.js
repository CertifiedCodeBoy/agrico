class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notify(listeners) {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.notify();
    return newNotification.id;
  }

  markAsRead(notificationId) {
    this.notifications = this.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notify();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notify();
  }

  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notify();
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Specific notification types for your irrigation system
  addCriticalWaterAlert(fieldName, waterLevel) {
    return this.addNotification({
      type: 'critical',
      title: 'Critical Water Level',
      message: `${fieldName} water level at ${waterLevel}%. Immediate action required.`,
      fieldId: fieldName.toLowerCase().replace(' ', '-')
    });
  }

  addPumpAlert(pumpId, issue) {
    return this.addNotification({
      type: 'warning',
      title: 'Pump Alert',
      message: `Pump ${pumpId}: ${issue}`,
      fieldId: null
    });
  }

  addWeatherAlert(message) {
    return this.addNotification({
      type: 'info',
      title: 'Weather Update',
      message: message,
      fieldId: null
    });
  }

  addAIRecommendation(fieldName, recommendation) {
    return this.addNotification({
      type: 'success',
      title: 'AI Recommendation',
      message: `${fieldName}: ${recommendation}`,
      fieldId: fieldName.toLowerCase().replace(' ', '-')
    });
  }

  addMaintenanceReminder(equipment, daysOverdue) {
    return this.addNotification({
      type: 'warning',
      title: 'Maintenance Due',
      message: `${equipment} maintenance overdue by ${daysOverdue} days.`,
      fieldId: null
    });
  }
}

export const notificationService = new NotificationService();