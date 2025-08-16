import React from 'react';
import { X, Clock, User, Target, CheckSquare, Calendar, Star, TrendingUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { ActivityType } from '../types';
import './ActivityLogDrawer.css';

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'LIFE_GOAL_CREATED':
    case 'LIFE_GOAL_UPDATED':
    case 'LIFE_GOAL_DELETED':
      return <Star size={16} />;
    case 'QUARTERLY_GOAL_CREATED':
    case 'QUARTERLY_GOAL_UPDATED':
    case 'QUARTERLY_GOAL_DELETED':
    case 'QUARTERLY_GOAL_COMPLETED':
      return <Target size={16} />;
    case 'WEEKLY_TASK_CREATED':
    case 'WEEKLY_TASK_UPDATED':
    case 'WEEKLY_TASK_COMPLETED':
    case 'WEEKLY_TASK_DELETED':
      return <CheckSquare size={16} />;
    case 'WEEKLY_REVIEW_COMPLETED':
    case 'WEEKLY_HUDDLE_COMPLETED':
      return <Calendar size={16} />;
    case 'KEY_RESULT_UPDATED':
      return <TrendingUp size={16} />;
    case 'GOLDEN_THREAD_CREATED':
      return <Target size={16} />;
    case 'USER_LOGIN':
    case 'USER_LOGOUT':
      return <User size={16} />;
    default:
      return <Clock size={16} />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'LIFE_GOAL_CREATED':
    case 'QUARTERLY_GOAL_CREATED':
    case 'WEEKLY_TASK_CREATED':
    case 'GOLDEN_THREAD_CREATED':
      return '#10b981'; // Green for creation
    case 'LIFE_GOAL_UPDATED':
    case 'QUARTERLY_GOAL_UPDATED':
    case 'WEEKLY_TASK_UPDATED':
    case 'KEY_RESULT_UPDATED':
      return '#f59e0b'; // Amber for updates
    case 'LIFE_GOAL_DELETED':
    case 'QUARTERLY_GOAL_DELETED':
    case 'WEEKLY_TASK_DELETED':
      return '#ef4444'; // Red for deletion
    case 'QUARTERLY_GOAL_COMPLETED':
    case 'WEEKLY_TASK_COMPLETED':
    case 'WEEKLY_REVIEW_COMPLETED':
    case 'WEEKLY_HUDDLE_COMPLETED':
      return '#8b5cf6'; // Purple for completion
    case 'USER_LOGIN':
      return '#3b82f6'; // Blue for login
    case 'USER_LOGOUT':
      return '#6b7280'; // Gray for logout
    default:
      return '#6b7280'; // Gray default
  }
};

const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({ isOpen, onClose }) => {
  const { state } = useApp();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="activity-drawer-overlay"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`activity-drawer ${isOpen ? 'open' : ''}`}>
        <div className="activity-drawer-header">
          <div className="activity-drawer-title">
            <Clock size={24} />
            <h2>Activity Log</h2>
          </div>
          <button 
            className="activity-drawer-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="activity-drawer-content">
          {!state.activityLogs || state.activityLogs.length === 0 ? (
            <div className="no-activities">
              <Clock size={48} style={{ color: '#cbd5e0' }} />
              <h3>No Activities Yet</h3>
              <p>Your activities will appear here as you use the app</p>
            </div>
          ) : (
            <div className="activity-list">
              {state.activityLogs.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div 
                    className="activity-icon"
                    style={{ backgroundColor: getActivityColor(activity.type) }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4 className="activity-title">{activity.title}</h4>
                      <span className="activity-time">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="activity-description">{activity.description}</p>
                    
                    <div className="activity-meta">
                      <span className="activity-timestamp">
                        {format(new Date(activity.timestamp), 'MMM dd, yyyy · HH:mm')}
                      </span>
                      {activity.entityType && (
                        <span className="activity-entity-type">
                          {activity.entityType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="activity-drawer-footer">
          <p className="activity-count">
            Showing last {state.activityLogs.length} of 30 recent activities
          </p>
        </div>
      </div>
    </>
  );
};

export default ActivityLogDrawer;
