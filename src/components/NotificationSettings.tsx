import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Clock, 
  Calendar, 
  Target, 
  Star, 
  Volume2, 
  VolumeX,
  Smartphone
} from 'lucide-react';
import { notificationService, type NotificationSettings as NotificationSettingsType } from '../services/notificationService';
import './NotificationSettings.css';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettingsType>(notificationService.getSettings());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleSettingChange = (path: string, value: any) => {
    const newSettings = { ...settings };
    const keys = path.split('.');
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    notificationService.updateSettings(settings);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setSettings(notificationService.getSettings());
    setHasChanges(false);
    onClose();
  };

  const handleTestNotification = () => {
    notificationService.scheduleNotification({
      id: `test-${Date.now()}`,
      title: "🧪 Test Notification",
      message: "This is a test notification to check your settings. Everything looks good!",
      type: 'reminder',
      priority: 'medium',
      scheduledFor: new Date(),
      actionButton: {
        text: "Got it!",
        action: "dismiss"
      }
    });
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  if (!isOpen) return null;

  return (
    <div className="notification-settings-overlay">
      <div className="notification-settings-modal">
        <div className="settings-header">
          <h2>
            <Settings size={24} />
            Notification Settings
          </h2>
          <p>Configure your strategic rhythm notifications</p>
        </div>

        <div className="settings-content">
          {/* Master Toggle */}
          <section className="settings-section">
            <div className="section-header">
              <Bell size={20} />
              <h3>Master Controls</h3>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Enable Notifications</label>
                <span>Turn on/off all Personal OS notifications</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Browser Notifications</label>
                <span>Show notifications even when Personal OS is not active</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.browserNotifications}
                  onChange={(e) => handleSettingChange('browserNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Sound Notifications</label>
                <span>Play notification sounds</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </div>
          </section>

          {/* Weekly Huddle Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Target size={20} />
              <h3>Weekly Command Huddle</h3>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Enable Weekly Huddle Notifications</label>
                <span>Remind you to do your 15-minute strategic session</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.weeklyHuddle.enabled}
                  onChange={(e) => handleSettingChange('weeklyHuddle.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.weeklyHuddle.enabled && (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Huddle Day</label>
                    <span>Which day to schedule your weekly huddle</span>
                  </div>
                  <select
                    value={settings.weeklyHuddle.dayOfWeek}
                    onChange={(e) => handleSettingChange('weeklyHuddle.dayOfWeek', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label>Huddle Time</label>
                    <span>When to schedule your weekly huddle</span>
                  </div>
                  <select
                    value={settings.weeklyHuddle.time}
                    onChange={(e) => handleSettingChange('weeklyHuddle.time', e.target.value)}
                    className="setting-select"
                  >
                    {timeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label>Reminder (minutes before)</label>
                    <span>How early to remind you before the huddle</span>
                  </div>
                  <select
                    value={settings.weeklyHuddle.reminderMinutes}
                    onChange={(e) => handleSettingChange('weeklyHuddle.reminderMinutes', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={0}>No reminder</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </>
            )}
          </section>

          {/* Quarterly Planning Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Calendar size={20} />
              <h3>Quarterly Sprint Planning</h3>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Enable Quarterly Planning Notifications</label>
                <span>Remind you to plan your next 90-day sprint</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.quarterlyPlanning.enabled}
                  onChange={(e) => handleSettingChange('quarterlyPlanning.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.quarterlyPlanning.enabled && (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Days Before Quarter End</label>
                    <span>How many days before quarter ends to remind you</span>
                  </div>
                  <select
                    value={settings.quarterlyPlanning.daysBefore}
                    onChange={(e) => handleSettingChange('quarterlyPlanning.daysBefore', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={3}>3 days</option>
                    <option value={7}>1 week</option>
                    <option value={14}>2 weeks</option>
                    <option value={21}>3 weeks</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label>Planning Time</label>
                    <span>Preferred time for quarterly planning</span>
                  </div>
                  <select
                    value={settings.quarterlyPlanning.time}
                    onChange={(e) => handleSettingChange('quarterlyPlanning.time', e.target.value)}
                    className="setting-select"
                  >
                    {timeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </section>

          {/* Annual Review Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Clock size={20} />
              <h3>Annual Flight Plan Review</h3>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Enable Annual Review Notifications</label>
                <span>Remind you to review and plan your annual goals</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.annualReview.enabled}
                  onChange={(e) => handleSettingChange('annualReview.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.annualReview.enabled && (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Days Before Year End</label>
                    <span>How many days before year ends to remind you</span>
                  </div>
                  <select
                    value={settings.annualReview.daysBefore}
                    onChange={(e) => handleSettingChange('annualReview.daysBefore', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={7}>1 week</option>
                    <option value={14}>2 weeks</option>
                    <option value={30}>1 month</option>
                    <option value={60}>2 months</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label>Review Time</label>
                    <span>Preferred time for annual review</span>
                  </div>
                  <select
                    value={settings.annualReview.time}
                    onChange={(e) => handleSettingChange('annualReview.time', e.target.value)}
                    className="setting-select"
                  >
                    {timeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </section>

          {/* Celebration Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Star size={20} />
              <h3>Celebrations & Achievements</h3>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Enable Celebration Notifications</label>
                <span>Celebrate your achievements and milestones</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.celebrations.enabled}
                  onChange={(e) => handleSettingChange('celebrations.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.celebrations.enabled && (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Goal Completions</label>
                    <span>Celebrate when you complete goals</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.celebrations.goalCompletions}
                      onChange={(e) => handleSettingChange('celebrations.goalCompletions', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label>Streak Milestones</label>
                    <span>Celebrate weekly review streaks (4, 8, 12+ weeks)</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.celebrations.streakMilestones}
                      onChange={(e) => handleSettingChange('celebrations.streakMilestones', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="settings-footer">
          <div className="test-section">
            <button 
              className="test-button"
              onClick={handleTestNotification}
              disabled={!settings.enabled}
            >
              <Smartphone size={16} />
              Test Notification
            </button>
          </div>
          
          <div className="action-buttons">
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className="save-button" 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
