import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight
} from 'lucide-react';
import { notificationService, type Notification } from '../services/notificationService';
import './NotificationBanner.css';

interface NotificationBannerProps {
  onAction?: (action: string) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ onAction }) => {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Load initial notifications
    setActiveNotifications(notificationService.getActiveNotifications());

    // Listen for new notifications
    const unsubscribe = notificationService.addListener((notification) => {
      setActiveNotifications(prev => [...prev, notification]);
      
      // Auto-expand when new notification arrives
      setIsMinimized(false);
      
      // Play sound if enabled
      const settings = notificationService.getSettings();
      if (settings.soundEnabled) {
        playNotificationSound(notification.type);
      }
    });

    // Check for notifications every minute
    const interval = setInterval(() => {
      setActiveNotifications(notificationService.getActiveNotifications());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const playNotificationSound = (type: Notification['type']) => {
    // Create audio context for notification sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different tones for different notification types
    switch (type) {
      case 'weekly-huddle':
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        break;
      case 'quarterly-planning':
        oscillator.frequency.setValueAtTime(1047, audioContext.currentTime); // C6
        break;
      case 'celebration':
        // Happy chord progression
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        break;
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleDismiss = (notificationId: string) => {
    notificationService.dismissNotification(notificationId);
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionButton && onAction) {
      onAction(notification.actionButton.action);
    }
    handleDismiss(notification.id);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'weekly-huddle':
        return <Target size={20} />;
      case 'quarterly-planning':
        return <Calendar size={20} />;
      case 'annual-review':
        return <TrendingUp size={20} />;
      case 'reminder':
        return <Clock size={20} />;
      case 'celebration':
        return <Star size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getPriorityClass = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  };

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`notification-banner ${isMinimized ? 'minimized' : ''}`}>
      <div className="notification-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="notification-indicator">
          <Bell size={16} />
          <span className="notification-count">{activeNotifications.length}</span>
        </div>
        <span className="notification-label">
          {activeNotifications.length === 1 ? 'Notification' : 'Notifications'}
        </span>
        <ChevronRight 
          size={16} 
          className={`expand-icon ${isMinimized ? '' : 'expanded'}`}
        />
      </div>

      {!isMinimized && (
        <div className="notification-list">
          {activeNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${getPriorityClass(notification.priority)} ${notification.type}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                
                {notification.actionButton && (
                  <button 
                    className="notification-action"
                    onClick={() => handleAction(notification)}
                  >
                    {notification.actionButton.text}
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
              
              <button 
                className="notification-dismiss"
                onClick={() => handleDismiss(notification.id)}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBanner;
