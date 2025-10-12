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
import { useApp } from '../context/AppContext';
import { LocalStorageService } from '../lib/localStorageService';
import { createExportBundle, downloadJson, validateExportBundle, toNormalizedState, mergeStates } from '../utils/exportImport';

import './NotificationSettings.css';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { state, dispatch, createActivityLog, logActivity } = useApp();
  const [settings, setSettings] = useState<NotificationSettingsType>(notificationService.getSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [importInfo, setImportInfo] = useState<{ preview: string; counts?: Record<string, number>; error?: string } | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'replace'>('merge');

  const [activeSection, setActiveSection] = useState<'general'|'weekly'|'quarterly'|'annual'|'celebrations'|'data'>('general');

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setHasChanges(false);
      setActiveSection('general');
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

  // app settings save immediately on toggle via handler
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

  // Export current data as JSON
  const handleExport = () => {
    const bundle = createExportBundle({
      lifeGoals: state.lifeGoals,
      annualGoals: state.annualGoals,
      quarterlyGoals: state.quarterlyGoals,
      weeklyTasks: state.weeklyTasks,
      weeklyReviews: state.weeklyReviews,
      activityLogs: state.activityLogs,
      checkIns: state.checkIns,
      goalUpdates: state.goalUpdates,
      learnings: state.learnings,
      roadblocks: state.roadblocks,
      decisions: state.decisions,
      wins: state.wins,
      bucketList: state.bucketList,
      currentYear: state.currentYear,
      currentQuarter: state.currentQuarter,
    });
    downloadJson(`personal-os-export-${new Date().toISOString().slice(0,10)}.json`, bundle);
    logActivity(createActivityLog(
      'DATA_EXPORTED',
      'Data exported',
      'Downloaded JSON backup'
    ));
  };

  // Import JSON file
  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateExportBundle(parsed);
      const normalized = toNormalizedState(parsed);
      const counts = {
        lifeGoals: normalized.lifeGoals.length,
        annualGoals: normalized.annualGoals.length,
        quarterlyGoals: normalized.quarterlyGoals.length,
        weeklyTasks: normalized.weeklyTasks.length,
        weeklyReviews: normalized.weeklyReviews.length,
        activityLogs: normalized.activityLogs.length,
        checkIns: normalized.checkIns.length,
      };
      setImportInfo({ preview: file.name, counts });
      // Stash normalized state on the element for apply step
      (window as any).__importNormalizedState = normalized;
    } catch (e: any) {
      setImportInfo({ preview: file.name, error: e?.message || 'Invalid file' });
    }
  };

  // Apply imported data
  const handleApplyImport = () => {
    const incoming = (window as any).__importNormalizedState;
    if (!incoming) return;
    const merged = mergeStates({
      lifeGoals: state.lifeGoals,
      annualGoals: state.annualGoals,
      quarterlyGoals: state.quarterlyGoals,
      weeklyTasks: state.weeklyTasks,
      weeklyReviews: state.weeklyReviews,
      activityLogs: state.activityLogs,
      checkIns: state.checkIns,
      goalUpdates: state.goalUpdates,
      learnings: state.learnings,
      roadblocks: state.roadblocks,
      decisions: state.decisions,
      wins: state.wins,
      bucketList: state.bucketList,
      currentYear: state.currentYear,
      currentQuarter: state.currentQuarter,
    }, incoming, mergeStrategy);

    // Persist via LocalStorageService and dispatch LOAD_STATE for immediate UI update
    LocalStorageService.save(merged);
    dispatch({ type: 'LOAD_STATE', payload: merged });
    logActivity(createActivityLog(
      'DATA_IMPORTED',
      'Data import applied',
      `Imported data (${mergeStrategy}) from backup`
    ));
    setImportInfo(null);
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

        <div className="settings-content" style={{display:'grid', gridTemplateColumns:'220px 1fr', gap:16}}>
          {/* Left nav */}
          <aside style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden'}}>
            <div className="section-header" style={{border:'none'}}>
              <h3 style={{fontSize:16, margin:0}}>Sections</h3>
            </div>
            <div style={{display:'flex', flexDirection:'column'}}>
              {[
                {key:'general', label:'Master Controls', icon:<Bell size={16}/>},
                {key:'weekly', label:'Weekly Huddle', icon:<Target size={16}/>},
                {key:'quarterly', label:'Quarterly Planning', icon:<Calendar size={16}/>},
                {key:'annual', label:'Annual Review', icon:<Clock size={16}/>},
                {key:'celebrations', label:'Celebrations', icon:<Star size={16}/>},
                {key:'data', label:'Export / Import', icon:<Settings size={16}/>},
              ].map((item:any) => (
                <button key={item.key} className="nav-item" style={{
                  textAlign:'left', padding:'12px 16px', background: activeSection===item.key ? '#eef2ff':'transparent',
                  border:'none', borderTop:'1px solid #f1f5f9', display:'flex', gap:8, alignItems:'center', cursor:'pointer'
                }} onClick={() => setActiveSection(item.key)}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Right pane */}
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            {activeSection==='data' && (
              <section className="settings-section">
                <div className="section-header">
                  <Settings size={20} />
                  <h3>Data Export & Import</h3>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Export your data</label>
                    <span>Download a JSON backup of all goals, tasks, reviews, activity logs, and check-ins.</span>
                  </div>
                  <button className="test-button" onClick={handleExport}>
                    Download JSON
                  </button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Import from JSON</label>
                    <span>Restore from a previously exported file. Choose merge to keep existing items, or replace to overwrite them.</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={mergeStrategy}
                      onChange={(e) => setMergeStrategy(e.target.value as 'merge' | 'replace')}
                      className="setting-select"
                    >
                      <option value="merge">Merge</option>
                      <option value="replace">Replace</option>
                    </select>
                    <label className="test-button" style={{ cursor: 'pointer' }}>
                      <input type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportFile(f);
                      }} />
                      Choose File
                    </label>
                  </div>
                </div>
                {importInfo && (
                  <div className="setting-item" style={{ background: '#fff' }}>
                    <div className="setting-info">
                      <label>Import Preview: {importInfo.preview}</label>
                      {importInfo.error ? (
                        <span style={{ color: '#ef4444' }}>Error: {importInfo.error}</span>
                      ) : (
                        <span>
                          {`Life Goals: ${importInfo.counts?.lifeGoals || 0}, Annual: ${importInfo.counts?.annualGoals || 0}, Quarterly: ${importInfo.counts?.quarterlyGoals || 0}, Tasks: ${importInfo.counts?.weeklyTasks || 0}, Reviews: ${importInfo.counts?.weeklyReviews || 0}, Activity: ${importInfo.counts?.activityLogs || 0}, Check-Ins: ${importInfo.counts?.checkIns || 0}`}
                        </span>
                      )}
                    </div>
                    {!importInfo.error && (
                      <button className="save-button" onClick={handleApplyImport}>Apply Import</button>
                    )}
                  </div>
                )}
              </section>
            )}

            {activeSection==='general' && (
              <section className="settings-section">
                <div className="section-header">
                  <Bell size={20} />
                  <h3>Master Controls</h3>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Enable Notifications</label>
                    <span>Turn on/off all LifePeak notifications</span>
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
                    <span>Show notifications even when LifePeak is not active</span>
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
            )}

            {activeSection==='weekly' && (
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
            )}

            {activeSection==='quarterly' && (
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
            )}

            {activeSection==='annual' && (
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
            )}

            {activeSection==='celebrations' && (
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
            )}

            
          </div>
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
