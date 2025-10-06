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
  Play,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import type { WeeklyTask, ActivityType } from '../types';
import WeeklyCommandHuddle from './WeeklyCommandHuddle';
import GoldenThread from './GoldenThread';
import { getIncompleteTasksForWeek, getPreviousWeek, performManualTaskRollover } from '../utils/taskRollover';
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    estimatedHours: 2
  });
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [addTaskForm, setAddTaskForm] = useState({
    title: '',
    description: '',
    quarterlyGoalId: '',
    estimatedHours: 2
  });
  const [isRolloverLoading, setIsRolloverLoading] = useState(false);
  const [rolloverMessage, setRolloverMessage] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 1 });

  // Handle clicking outside to close dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.priority-actions')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

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

  // Organize by status for Kanban board - use original tasks with normalized status
  const todoTasks = thisWeekTasks.filter(task => {
    const status = task.status || (task.completed ? 'done' : 'todo');
    return status === 'todo';
  });
  const inProgressTasks = thisWeekTasks.filter(task => {
    const status = task.status || (task.completed ? 'done' : 'todo');
    return status === 'in-progress';
  });
  const doneTasks = thisWeekTasks.filter(task => {
    const status = task.status || (task.completed ? 'done' : 'todo');
    return status === 'done';
  });

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

  // Task menu functions
  const toggleTaskMenu = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleEditTask = (task: WeeklyTask) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      estimatedHours: task.estimatedHours
    });
    setOpenMenuId(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = thisWeekTasks.find(t => t.id === taskId);
    if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
      dispatch({ type: 'DELETE_WEEKLY_TASK', payload: taskId });
      
      // Log the deletion activity
      const activityLog = createActivityLog(
        'WEEKLY_TASK_DELETED',
        `Task "${task.title}" deleted`,
        `Deleted weekly task from ${task.status} column`,
        taskId,
        'weekly_task',
        {
          taskTitle: task.title,
          status: task.status,
          estimatedHours: task.estimatedHours
        }
      );
      logActivity(activityLog);
    }
    setOpenMenuId(null);
  };

  const handleSaveEdit = () => {
    if (editingTask && editForm.title.trim()) {
      const updatedTask: WeeklyTask = {
        ...editingTask,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        estimatedHours: editForm.estimatedHours
      };
      
      dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: updatedTask });
      
      // Log the update activity
      const activityLog = createActivityLog(
        'WEEKLY_TASK_UPDATED',
        `Task "${updatedTask.title}" updated`,
        `Updated task details and estimates`,
        updatedTask.id,
        'weekly_task',
        {
          taskTitle: updatedTask.title,
          estimatedHours: updatedTask.estimatedHours
        }
      );
      logActivity(activityLog);
      
      setEditingTask(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditForm({ title: '', description: '', estimatedHours: 2 });
  };

  const resetAddTaskForm = () => {
    setAddTaskForm({
      title: '',
      description: '',
      quarterlyGoalId: '',
      estimatedHours: 2
    });
    setShowAddTaskForm(false);
  };

  const handleManualRollover = async () => {
    setIsRolloverLoading(true);
    setRolloverMessage(null);
    
    try {
      // Check for incomplete tasks before rollover
      const previousWeek = getPreviousWeek();
      const incompleteTasks = getIncompleteTasksForWeek(state.weeklyTasks, previousWeek);
      
      console.log(`🔍 Manual rollover check:`, { 
        previousWeek: previousWeek.toISOString(),
        totalTasks: state.weeklyTasks.length,
        incompleteTasks: incompleteTasks.length,
        incompleteTaskTitles: incompleteTasks.map(t => t.title)
      });
      
      if (incompleteTasks.length === 0) {
        setRolloverMessage('No incomplete tasks found from previous week');
        return;
      }
      
      // Use manual rollover function that bypasses timing restrictions
      const { shouldRollover, rolledOverTasks } = performManualTaskRollover(state.weeklyTasks);
      
      console.log(`🔄 Rollover result:`, { 
        shouldRollover, 
        rolledOverTasksCount: rolledOverTasks.length,
        rolledOverTaskTitles: rolledOverTasks.map(t => t.title)
      });
      
      if (shouldRollover && rolledOverTasks.length > 0) {
        // First, remove the original incomplete tasks from previous week
        incompleteTasks.forEach(originalTask => {
          console.log(`🗑️ Removing original task from previous week: "${originalTask.title}" with ID: ${originalTask.id}`);
          dispatch({ type: 'DELETE_WEEKLY_TASK', payload: originalTask.id });
        });
        
        // Then add each rolled over task to current week
        rolledOverTasks.forEach(task => {
          console.log(`📝 Dispatching ADD_WEEKLY_TASK for: "${task.title}" with ID: ${task.id}`);
          dispatch({ type: 'ADD_WEEKLY_TASK', payload: task });
        });
        
        setRolloverMessage(`✅ Successfully rolled over ${rolledOverTasks.length} task${rolledOverTasks.length === 1 ? '' : 's'}`);
        
        // Log manual rollover activity
        const activityLog = createActivityLog(
          'SYSTEM_ROLLOVER',
          'Manual task rollover from dashboard',
          `User manually triggered rollover - ${rolledOverTasks.length} tasks processed`,
          undefined,
          'system', 
          { manualTrigger: true, taskCount: rolledOverTasks.length, source: 'dashboard' }
        );
        logActivity(activityLog);
      } else {
        console.log(`⚠️ No rollover performed - shouldRollover: ${shouldRollover}, tasks: ${rolledOverTasks.length}`);
        setRolloverMessage('No tasks needed to be rolled over');
      }
      
    } catch (error) {
      console.error('Manual rollover failed:', error);
      setRolloverMessage('❌ Rollover failed - please try again');
    } finally {
      setIsRolloverLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setRolloverMessage(null), 5000);
    }
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addTaskForm.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const newTask: WeeklyTask = {
        id: crypto.randomUUID(),
        title: addTaskForm.title.trim(),
        description: addTaskForm.description.trim(),
        quarterlyGoalId: addTaskForm.quarterlyGoalId,
        estimatedHours: addTaskForm.estimatedHours,
        actualHours: 0,
        completed: false,
        status: 'todo',
        weekOf: weekStart,
        roadblocks: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({ type: 'ADD_WEEKLY_TASK', payload: newTask });
      
      // Log the activity
      const activityLog = createActivityLog(
        'WEEKLY_TASK_CREATED',
        `Task "${newTask.title}" created`,
        `Added new weekly task with ${newTask.estimatedHours}h estimate`,
        newTask.id,
        'weekly_task',
        {
          taskTitle: newTask.title,
          estimatedHours: newTask.estimatedHours
        }
      );
      logActivity(activityLog);

      resetAddTaskForm();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Get current quarter goals for the add task form
  const currentQuarterGoals = state.quarterlyGoals.filter(
    goal => goal.quarter === state.currentQuarter && 
           goal.year === state.currentYear &&
           goal.status !== 'completed'
  );

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
            {isCurrentWeek ? 'This Week' : 'Week View'}
          </h1>
          <p className="week-range">
            Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </p>
        </div>

        {/* Week Navigation */}
        <div className="week-navigation">
          <button 
            className="nav-btn"
            onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
            title="Previous Week"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            className="nav-btn this-week-btn"
            onClick={() => setSelectedWeek(new Date())}
            disabled={isCurrentWeek}
            title="Go to This Week"
          >
            This Week
          </button>
          
          <button 
            className="nav-btn"
            onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
            title="Next Week"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Week Stats */}
        <div className="week-stats">
          <div className="stat-card">
            <div className="stat-value">{thisWeekTasks.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doneTasks.length}</div>
            <div className="stat-label">Done</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Progress</div>
          </div>
        </div>
      </div>

        <div className="week-actions">
          <button 
            className="weekly-huddle-btn"
            onClick={() => setShowCommandHuddle(true)}
          >
            <Target size={20} />
            Weekly Huddle
          </button>
          
          <button 
            className="rollover-btn"
            onClick={handleManualRollover}
            disabled={isRolloverLoading}
            title="Check and rollover incomplete tasks from previous week"
          >
            {isRolloverLoading ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Rolling over...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Check Rollover
              </>
            )}
          </button>
        </div>
        
        {rolloverMessage && (
          <div className={`rollover-message ${rolloverMessage.startsWith('✅') ? 'success' : rolloverMessage.startsWith('❌') ? 'error' : 'info'}`}>
            {rolloverMessage}
          </div>
        )}

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
              {weeklyPriorities.slice(0, 25).map((priority, index) => {
                const linkedOKR = getLinkedOKR(priority.linkedOKRId);
                return (
                  <div key={priority.id} className={`priority-card ${priority.status}`}>
                    <div className="priority-header">
                      <div className="priority-title-row">
                        <div className="priority-number">{index + 1}</div>
                        <h3>{priority.title}</h3>
                      </div>
                      <div className="priority-actions">
                        <button 
                          className="golden-thread-btn"
                          onClick={() => handleGoldenThreadClick(priority.id)}
                          title="View Golden Thread"
                        >
                          <Link2 size={16} />
                        </button>
                        <button 
                          className="priority-menu"
                          onClick={() => toggleTaskMenu(priority.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === priority.id && (
                          <div className="task-menu-dropdown">
                            <button 
                              className="menu-item"
                              onClick={() => handleEditTask(thisWeekTasks.find(t => t.id === priority.id)!)}
                            >
                              <Edit size={14} />
                              Edit Task
                            </button>
                            <button 
                              className="menu-item delete"
                              onClick={() => handleDeleteTask(priority.id)}
                            >
                              <Trash2 size={14} />
                              Delete Task
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="priority-content">
                      {linkedOKR && (
                        <div className="linked-okr">
                          <Target size={14} />
                          <span>{linkedOKR.title}</span>
                        </div>
                      )}
                      
                      {priority.description && (
                        <p className="priority-description">{priority.description}</p>
                      )}
                      
                      <div className="priority-footer">
                        <div className={`status-badge ${priority.status}`}>
                          {priority.status === 'todo' && 'To Do'}
                          {priority.status === 'in-progress' && 'In Progress'}
                          {priority.status === 'done' && 'Done'}
                        </div>
                        <div className="time-estimate">
                          <Clock size={14} />
                          <span>{priority.estimatedHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {weeklyPriorities.length < 25 && (
                <div className="add-priority-card" onClick={() => setShowAddTaskForm(true)}>
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

      {/* Add Task Form Modal */}
      {showAddTaskForm && (
        <div className="modal-overlay" onClick={resetAddTaskForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Priority</h3>
              <button className="modal-close" onClick={resetAddTaskForm}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddTaskSubmit} className="modal-body">
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="add-title">Task Title *</label>
                  <input
                    id="add-title"
                    type="text"
                    value={addTaskForm.title}
                    onChange={(e) => setAddTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-goal">Link to Quarterly Goal</label>
                  <select
                    id="add-goal"
                    value={addTaskForm.quarterlyGoalId}
                    onChange={(e) => setAddTaskForm(prev => ({ ...prev, quarterlyGoalId: e.target.value }))}
                  >
                    <option value="">No specific goal</option>
                    {currentQuarterGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="add-description">Description</label>
                <textarea
                  id="add-description"
                  value={addTaskForm.description}
                  onChange={(e) => setAddTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task details, context, or notes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="add-hours">Estimated Hours</label>
                  <input
                    id="add-hours"
                    type="number"
                    min="0.5"
                    max="40"
                    step="0.5"
                    value={addTaskForm.estimatedHours}
                    onChange={(e) => setAddTaskForm(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetAddTaskForm}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!addTaskForm.title.trim()}
                >
                  Add Priority
                </button>
              </div>
            </form>
          </div>
        </div>
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

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="modal-close" onClick={handleCancelEdit}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-title">Task Title</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-hours">Estimated Hours</label>
                <input
                  id="edit-hours"
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={editForm.estimatedHours}
                  onChange={(e) => setEditForm(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveEdit}
                disabled={!editForm.title.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThisWeekDashboard;
