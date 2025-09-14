import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Plus, 
  Edit,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Heart,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './GoalDetails.css';

interface GoalDetailsProps {
  goalId: string;
  goalType: 'life' | 'annual' | 'quarterly' | 'weekly';
  onBack: () => void;
}

const GoalDetails: React.FC<GoalDetailsProps> = ({ goalId, goalType, onBack }) => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'about' | 'updates' | 'learnings' | 'risks' | 'decisions'>('updates');
  const [newUpdate, setNewUpdate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('on-track');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Oct-Dec');
  const [datePickerTab, setDatePickerTab] = useState<'quarter' | 'month' | 'day'>('quarter');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11); // December (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(31);

  const statusOptions = [
    { value: 'pending', label: 'PENDING', color: '#6b7280' },
    { value: 'on-track', label: 'ON TRACK', color: '#22c55e' },
    { value: 'at-risk', label: 'AT RISK', color: '#f59e0b' },
    { value: 'off-track', label: 'OFF TRACK', color: '#ef4444' },
    { value: 'completed', label: 'COMPLETED', color: '#6b7280' },
    { value: 'paused', label: 'PAUSED', color: '#6b7280' },
    { value: 'cancelled', label: 'CANCELLED', color: '#6b7280' }
  ];

  const quarters = [
    { value: 'Jan-Mar', label: 'Jan-Mar', quarter: 'Q1' },
    { value: 'Apr-Jun', label: 'Apr-Jun', quarter: 'Q2' },
    { value: 'Jul-Sep', label: 'Jul-Sep', quarter: 'Q3' },
    { value: 'Oct-Dec', label: 'Oct-Dec', quarter: 'Q4' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth + 1, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const daysFromPrevMonth = getDaysInMonth(selectedMonth, selectedYear);
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysFromPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }
    
    // Next month's leading days
    const remainingSlots = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }
    
    return days;
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDay(day);
      const date = new Date(selectedYear, selectedMonth, day);
      setSelectedDate(date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Find the goal based on type and ID
  const getGoal = () => {
    switch (goalType) {
      case 'life':
        return state.lifeGoals.find(goal => goal.id === goalId);
      case 'annual':
        return state.annualGoals.find(goal => goal.id === goalId);
      case 'quarterly':
        return state.quarterlyGoals.find(goal => goal.id === goalId);
      case 'weekly':
        return state.weeklyTasks.find(task => task.id === goalId);
      default:
        return null;
    }
  };

  const goal = getGoal();

  const mockSubGoals = [
    {
      id: 'sub-1',
      title: 'Expand AlpacaTravel market share',
      status: 'on-track',
      progress: 75,
      type: 'sub-goal'
    },
    {
      id: 'sub-2',
      title: 'Improve SEO funnel by 15%',
      status: 'at-risk',
      progress: 45,
      type: 'sub-goal'
    }
  ];

  const mockComments = [
    {
      id: 'comment-1',
      author: 'John Doe',
      authorAvatar: 'JD',
      timestamp: new Date('2025-02-05'),
      content: 'Great progress on this goal! The team is doing excellent work.'
    },
    {
      id: 'comment-2',
      author: 'Sarah Smith',
      authorAvatar: 'SS',
      timestamp: new Date('2025-02-04'),
      content: 'Thanks for the update. Let me know if you need any additional resources.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'on-track':
        return '#22c55e';
      case 'at-risk':
        return '#f59e0b';
      case 'blocked':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} />;
      case 'on-track':
        return <TrendingUp size={16} />;
      case 'at-risk':
        return <AlertTriangle size={16} />;
      case 'blocked':
        return <Circle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!goal) {
    return (
      <div className="goal-details-error">
        <h2>Goal not found</h2>
        <button onClick={onBack} className="btn-primary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="goal-details">
      {/* Header */}
      <div className="goal-details-header">
        <div className="goal-header-top">
          <div className="breadcrumb">
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={20} />
            </button>
            <span className="breadcrumb-text">Goals</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-text">{goalType.charAt(0).toUpperCase() + goalType.slice(1)} Goals</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{goal.title}</span>
          </div>
          <div className="header-actions">
            <button className="more-btn">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div className="goal-title-section">
          <div className="goal-icon">
            <Target size={24} />
          </div>
          <div className="goal-title-content">
            <h1 className="goal-title">{goal.title}</h1>
            <div className="goal-meta">
              <span className="goal-due-date">
                <Calendar size={14} />
                Next update due {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="goal-nav-tabs">
        {['about', 'updates', 'learnings', 'risks', 'decisions'].map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'updates' && <span className="tab-count">2</span>}
            {tab === 'learnings' && <span className="tab-count">1</span>}
            {tab === 'risks' && <span className="tab-count">1</span>}
            {tab === 'decisions' && <span className="tab-count">1</span>}
          </button>
        ))}
      </div>

      <div className="goal-content">
        {/* Main Content */}
        <div className="goal-main-content">
          {activeTab === 'updates' && (
            <div className="updates-section">
              {/* Status Update Form */}
              <div className="status-update-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>What is the current status?</label>
                    <div className="status-dropdown-container">
                      <button 
                        className="status-dropdown-trigger"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      >
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: statusOptions.find(opt => opt.value === selectedStatus)?.color,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}
                        >
                          {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                        </span>
                        <ChevronDown size={16} />
                      </button>
                      
                      {showStatusDropdown && (
                        <div className="status-dropdown-menu">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              className="status-option"
                              onClick={() => {
                                setSelectedStatus(option.value);
                                setShowStatusDropdown(false);
                              }}
                              style={{
                                backgroundColor: option.color,
                                color: 'white'
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-field">
                    <label>When will it be done?</label>
                    <div className="date-dropdown-container">
                      <button 
                        className="date-dropdown-trigger"
                        onClick={() => setShowDateDropdown(!showDateDropdown)}
                      >
                        <Calendar size={16} />
                        <span>{selectedDate}</span>
                        <ChevronDown size={16} />
                      </button>

                      {showDateDropdown && (
                        <div className="date-dropdown-menu">
                          <div className="date-picker-header">
                            <h4>Target date</h4>
                            <p>Help your followers understand when you're aiming to have achieved the desired outcome.</p>
                          </div>

                          <div className="date-picker-tabs">
                            <button 
                              className={`tab ${datePickerTab === 'day' ? 'active' : ''}`}
                              onClick={() => setDatePickerTab('day')}
                            >
                              Day
                            </button>
                            <button 
                              className={`tab ${datePickerTab === 'month' ? 'active' : ''}`}
                              onClick={() => setDatePickerTab('month')}
                            >
                              Month
                            </button>
                            <button 
                              className={`tab ${datePickerTab === 'quarter' ? 'active' : ''}`}
                              onClick={() => setDatePickerTab('quarter')}
                            >
                              Quarter
                            </button>
                          </div>

                          <div className="year-selector">
                            <button onClick={() => setSelectedYear(selectedYear - 1)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                              </svg>
                            </button>
                            <span className="year">{selectedYear}</span>
                            <button onClick={() => setSelectedYear(selectedYear + 1)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                              </svg>
                            </button>
                          </div>

                          {datePickerTab === 'quarter' && (
                            <div className="quarters-grid">
                              {quarters.map((quarter) => (
                                <button
                                  key={quarter.value}
                                  className={`quarter-option ${selectedDate === quarter.value ? 'selected' : ''}`}
                                  onClick={() => setSelectedDate(quarter.value)}
                                >
                                  {quarter.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {datePickerTab === 'month' && (
                            <div className="months-grid">
                              {months.map((month) => (
                                <button
                                  key={month}
                                  className={`month-option ${selectedDate === month ? 'selected' : ''}`}
                                  onClick={() => setSelectedDate(month)}
                                >
                                  {month}
                                </button>
                              ))}
                            </div>
                          )}

                          {datePickerTab === 'day' && (
                            <div className="calendar-container">
                              <div className="calendar-header">
                                <button onClick={() => navigateMonth('prev')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                  </svg>
                                </button>
                                <button onClick={() => navigateMonth('prev')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="11,17 6,12 11,7"></polyline>
                                    <polyline points="18,17 13,12 18,7"></polyline>
                                  </svg>
                                </button>
                                <span className="calendar-month-year">
                                  {monthNames[selectedMonth]} {selectedYear}
                                </span>
                                <button onClick={() => navigateMonth('next')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="13,17 18,12 13,7"></polyline>
                                    <polyline points="6,17 11,12 6,7"></polyline>
                                  </svg>
                                </button>
                                <button onClick={() => navigateMonth('next')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="calendar-grid">
                                <div className="calendar-day-headers">
                                  {dayNames.map(day => (
                                    <div key={day} className="day-header">{day}</div>
                                  ))}
                                </div>
                                
                                <div className="calendar-days">
                                  {generateCalendarDays().map((dayObj, index) => (
                                    <button
                                      key={index}
                                      className={`calendar-day ${
                                        !dayObj.isCurrentMonth ? 'other-month' : ''
                                      } ${
                                        dayObj.isCurrentMonth && dayObj.day === selectedDay ? 'selected' : ''
                                      }`}
                                      onClick={() => handleDayClick(dayObj.day, dayObj.isCurrentMonth)}
                                    >
                                      {dayObj.day}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="date-picker-actions">
                            <button 
                              className="confirm-btn"
                              onClick={() => setShowDateDropdown(false)}
                            >
                              Confirm
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={() => setShowDateDropdown(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="update-textarea-container">
                  <textarea
                    placeholder="Write your 280 character update. Type /last to copy your last update, and ! to add more elements"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    className="update-textarea-enhanced"
                    rows={4}
                  />
                  <div className="char-count">
                    {newUpdate.length}/280
                  </div>
                </div>

                {/* Progress Section */}
                <div className="progress-form-section">
                  <h4>Progress</h4>
                  <div className="progress-input-row">
                    <span className="currency-symbol">$</span>
                    <label>CAPEX Spend target</label>
                    <input 
                      type="text" 
                      value="738"
                      className="progress-input"
                    />
                    <span className="currency-label">CAD</span>
                    <span className="separator">/</span>
                    <span className="target-amount">6,392 CAD</span>
                  </div>
                  <div className="progress-indicator">
                    <span className="progress-percentage">11.5%</span>
                  </div>
                </div>

                <div className="form-toolbar">
                  <div className="toolbar-icons">
                    <button className="toolbar-btn" title="Add attachment">📎</button>
                    <button className="toolbar-btn" title="Add image">🖼️</button>
                    <button className="toolbar-btn" title="Add emoji">😊</button>
                    <button className="toolbar-btn" title="Add table">📊</button>
                  </div>
                  <div className="form-actions">
                    <span className="help-text">
                      💡 Who will see this? <button className="help-link">ℹ️</button>
                    </span>
                    <button className="btn-primary-large">Post</button>
                  </div>
                </div>

                {/* Notice */}
                <div className="update-notice">
                  <span className="notice-icon">⚠️</span>
                  We've noticed you're posting an update early this month and have a missed update from last month. If this post is for last month, update last month's entry instead.
                </div>
              </div>

              {/* Latest Update Section */}
              <div className="latest-update-section">
                <h3>Latest update</h3>
                <div className="update-item-enhanced">
                  <div className="update-header">
                    <div className="update-author">
                      <div className="author-avatar">FG</div>
                      <div className="author-info">
                        <span className="author-name">Frederic Gouverneur</span>
                        <span className="update-time">
                          8 Sep 2025 Last updated about 2 months ago
                        </span>
                      </div>
                    </div>
                    <div className="update-status">
                      <div className="status-indicator on-track">
                        <span className="status-text">11.5%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="no-update-message">
                    <p>No update was posted</p>
                    <button className="add-update-btn">Add update</button>
                  </div>

                  <div className="update-actions">
                    <button className="add-update-action">
                      <Plus size={16} />
                      Add update
                    </button>
                    <button className="comment-action">
                      💬 Add a comment... encourage them to keep going
                    </button>
                  </div>
                </div>
              </div>

              {/* Previous Updates */}
              <div className="previous-updates-section">
                <h3>Previous updates</h3>
                <div className="update-item-enhanced">
                  <div className="update-header">
                    <div className="update-author">
                      <div className="author-avatar">FG</div>
                      <div className="author-info">
                        <span className="author-name">Frederic Gouverneur</span>
                        <span className="update-time">
                          about 2 months ago • 2 people viewed
                        </span>
                      </div>
                    </div>
                    <div className="update-status">
                      <div className="status-indicator on-track">
                        <span className="status-badge-small on-track">ON TRACK</span>
                        <span className="date-badge">📅 Oct-Dec</span>
                      </div>
                    </div>
                  </div>

                  <div className="update-content-enhanced">
                    <p>New numbers in:</p>
                    
                    <div className="progress-change">
                      <span className="change-label">Progress changed</span>
                      <div className="change-flow">
                        <span className="old-value">435 CAD</span>
                        <span className="arrow">→</span>
                        <span className="new-value">738 CAD</span>
                      </div>
                    </div>

                    <div className="update-actions-footer">
                      <button className="action-btn">Share</button>
                      <button className="action-btn">Edit</button>
                      <button className="action-btn">🔗</button>
                      <button className="action-btn">💙</button>
                      <button className="action-btn">👀</button>
                      <button className="action-btn">💬</button>
                      <button className="action-btn">⋯</button>
                    </div>
                  </div>

                  <div className="comment-section-inline">
                    <div className="comment-composer-inline">
                      <div className="author-avatar">FG</div>
                      <input 
                        type="text" 
                        placeholder="Add a comment... encourage them to keep going"
                        className="comment-input-inline"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              {/* Description */}
              <div className="goal-description">
                <h3>Description</h3>
                <div className="description-content">
                  {goal.description ? (
                    <p>{goal.description}</p>
                  ) : (
                    <p className="description-placeholder">
                      Briefly describe why this goal is important and how success is measured, so you can provide followers a common understanding.
                    </p>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h3>Comments</h3>
                
                {/* Comment Composer */}
                <div className="comment-composer">
                  <div className="composer-avatar">
                    <div className="avatar-circle user-avatar">FG</div>
                  </div>
                  <div className="composer-input">
                    <textarea
                      placeholder="Add a comment... ask if the team needs any help"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-textarea"
                      rows={2}
                    />
                    {newComment.trim() && (
                      <div className="composer-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => setNewComment('')}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={() => {
                            // Handle comment submission
                            setNewComment('');
                          }}
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Existing Comments */}
                <div className="comments-list">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">
                        <div className="avatar-circle">{comment.authorAvatar}</div>
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-time">
                            {Math.floor((Date.now() - comment.timestamp.getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        </div>
                        <div className="comment-text">{comment.content}</div>
                        <div className="comment-actions">
                          <button className="comment-action">
                            <Heart size={14} />
                            Like
                          </button>
                          <button className="comment-action">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learnings' && (
            <div className="learnings-section">
              <h2>What have we learned?</h2>
              
              {/* Learning Creation Form */}
              <div className="learning-form">
                <div className="learning-form-header">
                  <div className="lightbulb-icon">💡</div>
                  <input 
                    type="text" 
                    placeholder="What's the summary of your learning?"
                    className="learning-title-input"
                  />
                </div>
                
                <div className="rich-text-toolbar">
                  <select className="text-style-dropdown">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button className="toolbar-btn" title="More">⋯</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Text color">A</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bullet list">• ▪</button>
                    <button className="toolbar-btn" title="Numbered list">1. 2.</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Checkbox">☑</button>
                    <button className="toolbar-btn" title="Link">🔗</button>
                    <button className="toolbar-btn" title="Image">🖼️</button>
                    <button className="toolbar-btn" title="Mention">@</button>
                    <button className="toolbar-btn" title="Emoji">😊</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Table">⊞</button>
                    <button className="toolbar-btn" title="Layout">⊡</button>
                  </div>
                  <button className="toolbar-btn more-options" title="More options">+</button>
                </div>
                
                <textarea 
                  className="learning-content-textarea"
                  placeholder="Use this space to share your learning with your 1 follower"
                  rows={6}
                ></textarea>
                
                <div className="learning-form-actions">
                  <button className="btn-primary">Save</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>

              {/* Existing Learnings */}
              <div className="existing-learnings">
                <div className="learning-item">
                  <div className="learning-header">
                    <div className="lightbulb-icon">💡</div>
                    <h3>test</h3>
                    <button className="expand-btn">⌃</button>
                  </div>
                  
                  <div className="learning-content">
                    <p>test</p>
                  </div>
                  
                  <div className="learning-footer">
                    <div className="learning-meta">
                      <div className="author-avatar-small">FG</div>
                      <span className="learning-author">Learning created by Frederic Gouverneur less than a minute ago</span>
                    </div>
                    
                    <div className="learning-reactions">
                      <button className="reaction-btn" title="Thumbs up">👍</button>
                      <button className="reaction-btn" title="Clap">👏</button>
                      <button className="reaction-btn" title="Pin">📌</button>
                      <button className="reaction-btn" title="Heart">❤️</button>
                      <button className="reaction-btn" title="Eyes">👀</button>
                      <button className="reaction-btn" title="Refresh">🔄</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="risks-section">
              <h2>What risks do we need to manage?</h2>
              
              {/* Risk Creation Form */}
              <div className="risk-form">
                <div className="risk-form-header">
                  <div className="risk-icon">⚠️</div>
                  <input 
                    type="text" 
                    placeholder="What's the summary of your risk?"
                    className="risk-title-input"
                  />
                </div>
                
                <div className="rich-text-toolbar">
                  <select className="text-style-dropdown">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button className="toolbar-btn" title="More">⋯</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Text color">A</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bullet list">• ▪</button>
                    <button className="toolbar-btn" title="Numbered list">1. 2.</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Checkbox">☑</button>
                    <button className="toolbar-btn" title="Link">🔗</button>
                    <button className="toolbar-btn" title="Image">🖼️</button>
                    <button className="toolbar-btn" title="Mention">@</button>
                    <button className="toolbar-btn" title="Emoji">😊</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Table">⊞</button>
                    <button className="toolbar-btn" title="Layout">⊡</button>
                  </div>
                  <button className="toolbar-btn more-options" title="More options">+</button>
                </div>
                
                <textarea 
                  className="risk-content-textarea"
                  placeholder="Use this space to share risk details with your 1 follower"
                  rows={6}
                ></textarea>
                
                <div className="risk-form-actions">
                  <button className="btn-primary">Save</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>

              {/* Existing Risks */}
              <div className="existing-risks">
                <div className="risk-item">
                  <div className="risk-header">
                    <div className="risk-icon">⚠️</div>
                    <h3>Budget constraints may impact timeline</h3>
                    <button className="expand-btn">⌃</button>
                  </div>
                  
                  <div className="risk-content">
                    <p>Current budget limitations might require us to extend the project timeline by 2-3 months.</p>
                  </div>
                  
                  <div className="risk-footer">
                    <div className="risk-meta">
                      <div className="author-avatar-small">FG</div>
                      <span className="risk-author">Risk identified by Frederic Gouverneur 2 days ago</span>
                    </div>
                    
                    <div className="risk-reactions">
                      <button className="reaction-btn" title="Acknowledge">👍</button>
                      <button className="reaction-btn" title="Concern">😟</button>
                      <button className="reaction-btn" title="Pin">📌</button>
                      <button className="reaction-btn" title="Heart">❤️</button>
                      <button className="reaction-btn" title="Eyes">👀</button>
                      <button className="reaction-btn" title="Alert">🚨</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'decisions' && (
            <div className="decisions-section">
              <h2>What decisions have we made?</h2>
              
              {/* Decision Creation Form */}
              <div className="decision-form">
                <div className="decision-form-header">
                  <div className="decision-icon">✅</div>
                  <input 
                    type="text" 
                    placeholder="What's the summary of your decision?"
                    className="decision-title-input"
                  />
                </div>
                
                <div className="rich-text-toolbar">
                  <select className="text-style-dropdown">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button className="toolbar-btn" title="More">⋯</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Text color">A</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bullet list">• ▪</button>
                    <button className="toolbar-btn" title="Numbered list">1. 2.</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Checkbox">☑</button>
                    <button className="toolbar-btn" title="Link">🔗</button>
                    <button className="toolbar-btn" title="Image">🖼️</button>
                    <button className="toolbar-btn" title="Mention">@</button>
                    <button className="toolbar-btn" title="Emoji">😊</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Table">⊞</button>
                    <button className="toolbar-btn" title="Layout">⊡</button>
                  </div>
                  <button className="toolbar-btn more-options" title="More options">+</button>
                </div>
                
                <textarea 
                  className="decision-content-textarea"
                  placeholder="Use this space to share decision details with your 1 follower"
                  rows={6}
                ></textarea>
                
                <div className="decision-form-actions">
                  <button className="btn-primary">Save</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>

              {/* Existing Decisions */}
              <div className="existing-decisions">
                <div className="decision-item">
                  <div className="decision-header">
                    <div className="decision-icon">✅</div>
                    <h3>Approved additional budget allocation</h3>
                    <button className="expand-btn">⌃</button>
                  </div>
                  
                  <div className="decision-content">
                    <p>Management has approved an additional $50k budget to ensure project completion by target date.</p>
                  </div>
                  
                  <div className="decision-footer">
                    <div className="decision-meta">
                      <div className="author-avatar-small">FG</div>
                      <span className="decision-author">Decision made by Frederic Gouverneur 1 week ago</span>
                    </div>
                    
                    <div className="decision-reactions">
                      <button className="reaction-btn" title="Approve">✅</button>
                      <button className="reaction-btn" title="Celebrate">🎉</button>
                      <button className="reaction-btn" title="Pin">📌</button>
                      <button className="reaction-btn" title="Heart">❤️</button>
                      <button className="reaction-btn" title="Eyes">👀</button>
                      <button className="reaction-btn" title="Check">☑️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="goal-sidebar">
          {/* Progress */}
          <div className="sidebar-section">
            <h4>
              Progress
              <button className="add-btn">
                <Plus size={14} />
              </button>
            </h4>
            <div className="progress-section">
              <div className="progress-visual">
                <div className="progress-circle">
                  <span className="progress-percentage">
                    {Math.round(
                      'progress' in goal ? goal.progress || 0 : 
                      (goalType === 'weekly' && 'completed' in goal && goal.completed) ? 100 : 0
                    )}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Goal */}
          {goalType !== 'life' && (
            <div className="sidebar-section">
              <h4>Parent goal</h4>
              <div className="parent-goal">
                <Target size={16} />
                <span>Expand AlpacaTravel market share</span>
                <button className="edit-link-btn">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Sub-goals */}
          <div className="sidebar-section">
            <h4>
              Sub-goals 
              <span className="count">{mockSubGoals.length}</span>
              <button className="add-btn">
                <Plus size={14} />
              </button>
            </h4>
            <div className="sub-goals-list">
              {mockSubGoals.map((subGoal) => (
                <div key={subGoal.id} className="sub-goal-item">
                  <div className="sub-goal-icon" style={{ color: getStatusColor(subGoal.status) }}>
                    {getStatusIcon(subGoal.status)}
                  </div>
                  <div className="sub-goal-content">
                    <span className="sub-goal-title">{subGoal.title}</span>
                    <div className="sub-goal-progress">
                      <div 
                        className="progress-bar"
                        style={{ 
                          backgroundColor: getStatusColor(subGoal.status),
                          width: `${subGoal.progress}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="sidebar-section">
            <h4>
              Start date
              <button className="edit-link-btn">
                <Edit size={14} />
              </button>
            </h4>
            <div className="start-date">
              {formatDate(
                'createdAt' in goal ? goal.createdAt : 
                'weekOf' in goal ? goal.weekOf : 
                new Date()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetails;
