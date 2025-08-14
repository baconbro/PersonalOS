// Notification Service for Personal OS
// Manages strategic rhythm notifications and reminders

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'weekly-huddle' | 'quarterly-planning' | 'annual-review' | 'reminder' | 'celebration';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor: Date;
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    dayOfWeek?: number; // 0-6, Sunday to Saturday
    dayOfMonth?: number; // 1-31
    dayOfQuarter?: number; // 1-90
  };
  actionButton?: {
    text: string;
    action: string;
  };
  dismissed: boolean;
  shown: boolean;
  createdAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  weeklyHuddle: {
    enabled: boolean;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday
    time: string; // "18:00" format
    reminderMinutes: number; // Minutes before to show reminder
  };
  quarterlyPlanning: {
    enabled: boolean;
    daysBefore: number; // Days before quarter ends
    time: string;
  };
  annualReview: {
    enabled: boolean;
    daysBefore: number; // Days before year ends
    time: string;
  };
  celebrations: {
    enabled: boolean;
    goalCompletions: boolean;
    streakMilestones: boolean;
  };
  browserNotifications: boolean;
  soundEnabled: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private settings: NotificationSettings;
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((notification: Notification) => void)[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.loadNotifications();
    this.requestPermission();
    this.startNotificationChecker();
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('personal-os-notification-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default settings
    return {
      enabled: true,
      weeklyHuddle: {
        enabled: true,
        dayOfWeek: 0, // Sunday
        time: "18:00",
        reminderMinutes: 15
      },
      quarterlyPlanning: {
        enabled: true,
        daysBefore: 7,
        time: "09:00"
      },
      annualReview: {
        enabled: true,
        daysBefore: 14,
        time: "09:00"
      },
      celebrations: {
        enabled: true,
        goalCompletions: true,
        streakMilestones: true
      },
      browserNotifications: true,
      soundEnabled: true
    };
  }

  private saveSettings(): void {
    localStorage.setItem('personal-os-notification-settings', JSON.stringify(this.settings));
  }

  private loadNotifications(): void {
    const saved = localStorage.getItem('personal-os-notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        scheduledFor: new Date(n.scheduledFor),
        createdAt: new Date(n.createdAt)
      }));
    }
  }

  private saveNotifications(): void {
    localStorage.setItem('personal-os-notifications', JSON.stringify(this.notifications));
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window && this.settings.browserNotifications) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }

  private startNotificationChecker(): void {
    // Check every minute for notifications
    this.checkInterval = setInterval(() => {
      this.checkPendingNotifications();
    }, 60000);

    // Also check immediately
    this.checkPendingNotifications();
  }

  private checkPendingNotifications(): void {
    if (!this.settings.enabled) return;

    const now = new Date();
    const pendingNotifications = this.notifications.filter(
      n => !n.shown && !n.dismissed && n.scheduledFor <= now
    );

    pendingNotifications.forEach(notification => {
      this.showNotification(notification);
    });
  }

  private showNotification(notification: Notification): void {
    // Mark as shown
    notification.shown = true;
    this.saveNotifications();

    // Show browser notification if enabled
    if (this.settings.browserNotifications && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: notification.priority === 'urgent',
        silent: !this.settings.soundEnabled
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionButton) {
          this.handleNotificationAction(notification.actionButton.action);
        }
        browserNotification.close();
      };

      // Auto-close after 10 seconds unless urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 10000);
      }
    }

    // Notify app listeners
    this.listeners.forEach(listener => listener(notification));
  }

  private handleNotificationAction(action: string): void {
    // Emit custom event for the app to handle
    window.dispatchEvent(new CustomEvent('notification-action', { detail: action }));
  }

  // Public methods

  public scheduleWeeklyHuddle(): void {
    if (!this.settings.weeklyHuddle.enabled) return;

    const nextWeeklyHuddle = this.getNextWeeklyHuddleDate();
    
    // Schedule main notification
    this.scheduleNotification({
      id: `weekly-huddle-${nextWeeklyHuddle.getTime()}`,
      title: "🎯 Weekly Command Huddle Time!",
      message: "It's time for your 15-minute strategic session. Ready to review, re-align, and plan your week?",
      type: 'weekly-huddle',
      priority: 'high',
      scheduledFor: nextWeeklyHuddle,
      actionButton: {
        text: "Start Weekly Huddle",
        action: "navigate-this-week"
      },
      recurring: {
        frequency: 'weekly',
        dayOfWeek: this.settings.weeklyHuddle.dayOfWeek
      }
    });

    // Schedule reminder notification
    if (this.settings.weeklyHuddle.reminderMinutes > 0) {
      const reminderTime = new Date(nextWeeklyHuddle.getTime() - (this.settings.weeklyHuddle.reminderMinutes * 60000));
      
      this.scheduleNotification({
        id: `weekly-huddle-reminder-${nextWeeklyHuddle.getTime()}`,
        title: "⏰ Weekly Huddle in 15 minutes",
        message: "Your strategic weekly session is coming up. Time to wrap up what you're doing and prepare for focused planning.",
        type: 'reminder',
        priority: 'medium',
        scheduledFor: reminderTime,
        actionButton: {
          text: "Get Ready",
          action: "prepare-huddle"
        }
      });
    }
  }

  public scheduleQuarterlyPlanning(): void {
    if (!this.settings.quarterlyPlanning.enabled) return;

    const quarterEndDate = this.getQuarterEndDate();
    const planningDate = new Date(quarterEndDate.getTime() - (this.settings.quarterlyPlanning.daysBefore * 24 * 60 * 60 * 1000));
    const [hours, minutes] = this.settings.quarterlyPlanning.time.split(':');
    planningDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    this.scheduleNotification({
      id: `quarterly-planning-${quarterEndDate.getTime()}`,
      title: "📅 Time to Plan Your Next 90-Day Sprint!",
      message: `It's the end of Q${this.getCurrentQuarter()}! Time to review progress and plan your next quarter's objectives and key results.`,
      type: 'quarterly-planning',
      priority: 'urgent',
      scheduledFor: planningDate,
      actionButton: {
        text: "Plan Next Quarter",
        action: "navigate-quarterly"
      },
      recurring: {
        frequency: 'quarterly'
      }
    });
  }

  public scheduleAnnualReview(): void {
    if (!this.settings.annualReview.enabled) return;

    const yearEnd = new Date(new Date().getFullYear(), 11, 31); // December 31st
    const reviewDate = new Date(yearEnd.getTime() - (this.settings.annualReview.daysBefore * 24 * 60 * 60 * 1000));
    const [hours, minutes] = this.settings.annualReview.time.split(':');
    reviewDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    this.scheduleNotification({
      id: `annual-review-${yearEnd.getFullYear()}`,
      title: "🎊 Annual Flight Plan Review Time!",
      message: `${yearEnd.getFullYear()} is almost over! Time to celebrate achievements and craft your strategic plan for ${yearEnd.getFullYear() + 1}.`,
      type: 'annual-review',
      priority: 'urgent',
      scheduledFor: reviewDate,
      actionButton: {
        text: "Review & Plan",
        action: "navigate-annual"
      },
      recurring: {
        frequency: 'annually'
      }
    });
  }

  public celebrateGoalCompletion(goalTitle: string, goalType: string): void {
    if (!this.settings.celebrations.enabled || !this.settings.celebrations.goalCompletions) return;

    this.scheduleNotification({
      id: `celebration-${Date.now()}`,
      title: `🎉 ${goalType} Goal Completed!`,
      message: `Congratulations! You've completed "${goalTitle}". This is a significant achievement in your strategic journey!`,
      type: 'celebration',
      priority: 'medium',
      scheduledFor: new Date(),
      actionButton: {
        text: "View Progress",
        action: "navigate-dashboard"
      }
    });
  }

  public celebrateStreak(streakCount: number, streakType: string): void {
    if (!this.settings.celebrations.enabled || !this.settings.celebrations.streakMilestones) return;

    const milestones = [4, 8, 12, 26, 52]; // weeks
    if (milestones.includes(streakCount)) {
      this.scheduleNotification({
        id: `streak-${streakType}-${streakCount}-${Date.now()}`,
        title: `🔥 ${streakCount}-Week ${streakType} Streak!`,
        message: `Amazing consistency! You've maintained your ${streakType.toLowerCase()} rhythm for ${streakCount} weeks. This kind of discipline builds extraordinary results.`,
        type: 'celebration',
        priority: 'medium',
        scheduledFor: new Date(),
        actionButton: {
          text: "Keep Going",
          action: "navigate-this-week"
        }
      });
    }
  }

  public scheduleNotification(notification: Omit<Notification, 'dismissed' | 'shown' | 'createdAt'>): void {
    const fullNotification: Notification = {
      ...notification,
      dismissed: false,
      shown: false,
      createdAt: new Date()
    };

    // Remove any existing notification with the same ID
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    
    // Add new notification
    this.notifications.push(fullNotification);
    this.saveNotifications();
  }

  public dismissNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      this.saveNotifications();
    }
  }

  public getActiveNotifications(): Notification[] {
    return this.notifications.filter(n => n.shown && !n.dismissed);
  }

  public getPendingNotifications(): Notification[] {
    return this.notifications.filter(n => !n.shown && !n.dismissed && n.scheduledFor > new Date());
  }

  public updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Reschedule recurring notifications
    this.scheduleWeeklyHuddle();
    this.scheduleQuarterlyPlanning();
    this.scheduleAnnualReview();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public addListener(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Helper methods

  private getNextWeeklyHuddleDate(): Date {
    const now = new Date();
    const targetDay = this.settings.weeklyHuddle.dayOfWeek;
    const [hours, minutes] = this.settings.weeklyHuddle.time.split(':');
    
    let nextDate = new Date(now);
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Calculate days until target day
    const currentDay = now.getDay();
    let daysUntilTarget = targetDay - currentDay;
    
    if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && now > nextDate)) {
      daysUntilTarget += 7; // Next week
    }
    
    nextDate.setDate(nextDate.getDate() + daysUntilTarget);
    return nextDate;
  }

  private getQuarterEndDate(): Date {
    const now = new Date();
    const quarter = this.getCurrentQuarter();
    const year = now.getFullYear();
    
    switch (quarter) {
      case 1: return new Date(year, 2, 31); // March 31
      case 2: return new Date(year, 5, 30); // June 30
      case 3: return new Date(year, 8, 30); // September 30
      case 4: return new Date(year, 11, 31); // December 31
      default: return new Date(year, 11, 31);
    }
  }

  private getCurrentQuarter(): number {
    const month = new Date().getMonth();
    return Math.ceil((month + 1) / 3);
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners = [];
  }
}

// Singleton instance
export const notificationService = new NotificationService();
