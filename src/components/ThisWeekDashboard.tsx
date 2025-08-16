import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Target, 
  Clock, 
  CheckSquare, 
  MoreHorizontal,
  Plus,
  Link2,
  Play
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { WeeklyTask, ActivityType } from '../types';
import WeeklyCommandHuddle from './WeeklyCommandHuddle';
import GoldenThread from './GoldenThread';
import './ThisWeekDashboard.css';

interface WeeklyPriorityCard {
  id: string;
  title: string;
  description: string;
  linkedOKRId: string;
  status: 'todo' | 'in-progress' | 'done';
  estimatedHours: number;
  actualHours: number;
}

const ThisWeekDashboard: React.FC = () => {
  const { state, dispatch, logActivity, createActivityLog } = useApp();
  const [showCommandHuddle, setShowCommandHuddle] = useState(false);
  const [showGoldenThread, setShowGoldenThread] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);

  const currentWeek = new Date();
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Get this week's tasks
  const thisWeekTasks = state.weeklyTasks.filter(task =>
    isWithinInterval(task.weekOf, { start: weekStart, end: weekEnd })
  );

  // Convert tasks to priority cards format for better UX
  const weeklyPriorities: WeeklyPriorityCard[] = thisWeekTasks.map(task => {
    // Ensure consistent status field - migrate old data on the fly
    const normalizedStatus = task.status || (task.completed ? 'done' : 'todo');
    
    // Debug logging to understand data state
    if (task.status !== normalizedStatus) {
      console.log(`🔄 Migrating task "${task.title}" status from ${task.status} to ${normalizedStatus}`);
    }
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      linkedOKRId: task.quarterlyGoalId || '',
      status: normalizedStatus,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours || 0
    };
  });

  // Organize by status for Kanban board
  const todoTasks = weeklyPriorities.filter(p => p.status === 'todo');
  const inProgressTasks = weeklyPriorities.filter(p => p.status === 'in-progress');
  const doneTasks = weeklyPriorities.filter(p => p.status === 'done');

  // Check if user needs to do weekly huddle
  const hasCurrentWeekReview = state.weeklyReviews.some(review =>
    isWithinInterval(review.weekOf, { start: weekStart, end: weekEnd })
  );

  const shouldShowHuddlePrompt = !hasCurrentWeekReview && thisWeekTasks.length === 0;

  useEffect(() => {
    if (shouldShowHuddlePrompt) {
      // Auto-prompt for weekly huddle on Sunday evening or Monday morning
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();
      
      if ((dayOfWeek === 0 && hour >= 18) || (dayOfWeek === 1 && hour <= 10)) {
        setShowCommandHuddle(true);
      }
    }
  }, [shouldShowHuddlePrompt]);

  const updateTaskStatus = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    const task = thisWeekTasks.find(t => t.id === taskId);
    if (task) {
      const currentStatus = task.status || (task.completed ? 'done' : 'todo');
      console.log(`🔄 Updating task ${taskId} from ${currentStatus} to ${newStatus}`);
      
      const updatedTask: WeeklyTask = {
        ...task,
        status: newStatus,
        completed: newStatus === 'done'
      };
      
      console.log('📝 Updated task data:', { id: updatedTask.id, status: updatedTask.status, completed: updatedTask.completed });
      dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: updatedTask });
      
      // Log activity for status changes
      if (currentStatus !== newStatus) {
        // Determine the activity type based on the status change
        let activityType: ActivityType;
        if (newStatus === 'done') {
          activityType = 'WEEKLY_TASK_COMPLETED';
        } else {
          activityType = 'WEEKLY_TASK_UPDATED';
        }
        
        const activityLog = createActivityLog(
          activityType,
          `Task "${task.title}" moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in-progress' ? 'In Progress' : 'Done'}`,
          `Status changed from ${currentStatus === 'todo' ? 'To Do' : currentStatus === 'in-progress' ? 'In Progress' : 'Done'} to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in-progress' ? 'In Progress' : 'Done'}`,
          task.id,
          'weekly_task',
          {
            previousStatus: currentStatus,
            newStatus: newStatus,
            taskTitle: task.title
          }
        );
        
        logActivity(activityLog);
      }
      
      // Trigger celebration animation when task is completed
      if (newStatus === 'done') {
        setCelebratingTask(taskId);
        // Clear celebration after animation
        setTimeout(() => {
          setCelebratingTask(null);
        }, 2000); // 2 second celebration
      }
    } else {
      console.error('❌ Task not found:', taskId);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'todo' | 'in-progress' | 'done') => {
    e.preventDefault();
    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
    
    if (draggedTask) {
      updateTaskStatus(draggedTask, newStatus);
    }
    setDraggedTask(null);
  };

  const getLinkedOKR = (okrId: string) => {
    return state.quarterlyGoals.find(okr => okr.id === okrId);
  };

  const handleGoldenThreadClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowGoldenThread(true);
  };

  const completionRate = thisWeekTasks.length > 0 
    ? Math.round((doneTasks.length / thisWeekTasks.length) * 100)
    : 0;

  return (
    <div className="this-week-dashboard">
      {/* Header */}
      <div className="week-header">
        <div className="week-info">
          <h1>
            <Calendar size={28} />
            This Week
          </h1>
          <p className="week-range">
            Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </p>
        </div>
        
        <div className="week-stats">
          <div className="stat-card">
            <div className="stat-value">{thisWeekTasks.length}</div>
            <div className="stat-label">Total Priorities</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doneTasks.length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Progress</div>
          </div>
        </div>

        <button 
          className="weekly-huddle-btn"
          onClick={() => setShowCommandHuddle(true)}
        >
          <Target size={20} />
          Weekly Huddle
        </button>
      </div>

      {/* Command Huddle Prompt */}
      {shouldShowHuddlePrompt && (
        <div className="huddle-prompt">
          <div className="prompt-content">
            <h2>Ready for your Weekly Command Huddle?</h2>
            <p>Your 15-minute strategic session to review, re-align, and plan your week.</p>
            <button 
              className="start-huddle-btn"
              onClick={() => setShowCommandHuddle(true)}
            >
              <Play size={20} />
              Start Weekly Huddle
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {thisWeekTasks.length === 0 && !shouldShowHuddlePrompt ? (
        <div className="empty-week">
          <Target size={64} />
          <h2>No priorities set for this week</h2>
          <p>Start your Weekly Command Huddle to define your focus areas</p>
          <button 
            className="start-planning-btn"
            onClick={() => setShowCommandHuddle(true)}
          >
            Plan This Week
          </button>
        </div>
      ) : (
        <>
          {/* Priority Focus Area */}
          <div className="priority-focus-area">
            <h2>Your Weekly Priorities</h2>
            <div className="priorities-grid">
              {weeklyPriorities.slice(0, 5).map((priority, index) => {
                const linkedOKR = getLinkedOKR(priority.linkedOKRId);
                return (
                  <div key={priority.id} className={`priority-card ${priority.status}`}>
                    <div className="priority-header">
                      <div className="priority-number">{index + 1}</div>
                      <div className="priority-actions">
                        <button 
                          className="golden-thread-btn"
                          onClick={() => handleGoldenThreadClick(priority.id)}
                          title="View Golden Thread"
                        >
                          <Link2 size={16} />
                        </button>
                        <button className="priority-menu">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="priority-content">
                      <h3>{priority.title}</h3>
                      {priority.description && (
                        <p className="priority-description">{priority.description}</p>
                      )}
                      
                      {linkedOKR && (
                        <div className="linked-okr">
                          <Target size={14} />
                          <span>{linkedOKR.title}</span>
                        </div>
                      )}
                      
                      <div className="priority-meta">
                        <div className="time-estimate">
                          <Clock size={14} />
                          <span>{priority.estimatedHours}h estimated</span>
                        </div>
                        <div className={`status-badge ${priority.status}`}>
                          {priority.status === 'todo' && 'To Do'}
                          {priority.status === 'in-progress' && 'In Progress'}
                          {priority.status === 'done' && 'Done'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {weeklyPriorities.length < 5 && (
                <div className="add-priority-card" onClick={() => setShowCommandHuddle(true)}>
                  <Plus size={24} />
                  <span>Add Priority</span>
                </div>
              )}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="kanban-board">
            <h2>Weekly Progress Board</h2>
            <div className="kanban-columns">
              {/* To Do Column */}
              <div 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'todo')}
              >
                <div className="column-header">
                  <h3>To Do</h3>
                  <span className="task-count">{todoTasks.length}</span>
                </div>
                <div className="column-content">
                  {todoTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`kanban-task ${draggedTask === task.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="task-header">
                        <h4>{task.title}</h4>
                        <button 
                          className="golden-thread-btn small"
                          onClick={() => handleGoldenThreadClick(task.id)}
                        >
                          <Link2 size={12} />
                        </button>
                      </div>
                      <div className="task-meta">
                        <span className="time-estimate">
                          <Clock size={12} />
                          {task.estimatedHours}h
                        </span>
                      </div>
                    </div>
                  ))}
                  {todoTasks.length === 0 && (
                    <div className="empty-column">
                      No tasks to do
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'in-progress')}
              >
                <div className="column-header">
                  <h3>In Progress</h3>
                  <span className="task-count">{inProgressTasks.length}</span>
                </div>
                <div className="column-content">
                  {inProgressTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`kanban-task in-progress ${draggedTask === task.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="task-header">
                        <h4>{task.title}</h4>
                        <button 
                          className="golden-thread-btn small"
                          onClick={() => handleGoldenThreadClick(task.id)}
                        >
                          <Link2 size={12} />
                        </button>
                      </div>
                      <div className="task-meta">
                        <span className="time-estimate">
                          <Clock size={12} />
                          {task.estimatedHours}h
                        </span>
                      </div>
                    </div>
                  ))}
                  {inProgressTasks.length === 0 && (
                    <div className="empty-column">
                      No tasks in progress
                    </div>
                  )}
                </div>
              </div>

              {/* Done Column */}
              <div 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'done')}
              >
                <div className="column-header">
                  <h3>Done</h3>
                  <span className="task-count">{doneTasks.length}</span>
                </div>
                <div className="column-content">
                  {doneTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`kanban-task done ${draggedTask === task.id ? 'dragging' : ''} ${celebratingTask === task.id ? 'celebrating' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="task-header">
                        <h4>{task.title}</h4>
                        <CheckSquare size={16} className="done-icon" />
                      </div>
                      <div className="task-meta">
                        <span className="time-estimate">
                          <Clock size={12} />
                          {task.estimatedHours}h
                        </span>
                      </div>
                      {celebratingTask === task.id && (
                        <div className="celebration-overlay">
                          <div className="celebration-confetti">
                            <div className="confetti-piece"></div>
                            <div className="confetti-piece"></div>
                            <div className="confetti-piece"></div>
                            <div className="confetti-piece"></div>
                            <div className="confetti-piece"></div>
                            <div className="confetti-piece"></div>
                          </div>
                          <div className="celebration-text">🎉 Well Done!</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {doneTasks.length === 0 && (
                    <div className="empty-column">
                      No completed tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Weekly Command Huddle Modal */}
      <WeeklyCommandHuddle
        isOpen={showCommandHuddle}
        onClose={() => setShowCommandHuddle(false)}
        onComplete={() => {
          setShowCommandHuddle(false);
          // The component will automatically refresh with new data
        }}
      />

      {/* Golden Thread Modal */}
      {showGoldenThread && selectedTaskId && (
        <GoldenThread
          onClose={() => setShowGoldenThread(false)}
          taskId={selectedTaskId}
        />
      )}
    </div>
  );
};

export default ThisWeekDashboard;
