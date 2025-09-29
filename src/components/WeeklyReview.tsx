import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Plus, Edit3, Clock, Trash2, Network } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks } from 'date-fns';
import type { WeeklyTask } from '../types';
import GoldenThread from './GoldenThread';

function WeeklyReview() {
  const { state, dispatch } = useApp();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);
  const [goldenThreadTaskId, setGoldenThreadTaskId] = useState<string | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    quarterlyGoalId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedHours: 1,
  });

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const weekTasks = state.weeklyTasks.filter(task =>
    isWithinInterval(task.weekOf, { start: weekStart, end: weekEnd })
  );

  // Get weekly review data for this week
  const weekReview = state.weeklyReviews.find(review =>
    isWithinInterval(review.weekOf, { start: weekStart, end: weekEnd })
  );

  // Debug: Log weekly review data when it changes
  useEffect(() => {
    if (weekReview) {
      console.log('📋 Weekly Review Data:', {
        weekOf: weekReview.weekOf,
        hasClarityResponses: !!weekReview.clarityResponses,
        clarityResponsesKeys: weekReview.clarityResponses ? Object.keys(weekReview.clarityResponses) : [],
        clarityResponsesData: weekReview.clarityResponses,
        hasWinsReflection: !!weekReview.winsReflection,
        hasGapsAnalysis: !!weekReview.gapsAnalysis,
        hasKeyLesson: !!weekReview.keyLesson
      });
    }
  }, [weekReview]);

  const currentQuarterGoals = state.quarterlyGoals.filter(
    goal => goal.quarter === state.currentQuarter && 
           goal.year === state.currentYear &&
           goal.status !== 'completed'
  );

  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      quarterlyGoalId: '',
      priority: 'medium',
      estimatedHours: 1,
    });
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskFormData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const taskData: WeeklyTask = {
        id: editingTask?.id || crypto.randomUUID(),
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim(),
        quarterlyGoalId: taskFormData.quarterlyGoalId,
        priority: taskFormData.priority,
        estimatedHours: taskFormData.estimatedHours,
        actualHours: editingTask?.actualHours || 0,
        completed: editingTask?.completed || false,
        status: editingTask?.status || (editingTask?.completed ? 'done' : 'todo'), // Preserve existing status or set default
        weekOf: weekStart,
        roadblocks: editingTask?.roadblocks || [],
        notes: editingTask?.notes || '',
      };

      if (editingTask) {
        dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: taskData });
      } else {
        dispatch({ type: 'ADD_WEEKLY_TASK', payload: taskData });
      }

      resetTaskForm();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = weekTasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: updatedTask });
    }
  };

  const editTask = (task: WeeklyTask) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description,
      quarterlyGoalId: task.quarterlyGoalId,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
    });
    setShowTaskForm(true);
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_WEEKLY_TASK', payload: taskId });
    }
  };

  const completedCount = weekTasks.filter(task => task.completed).length;

  return (
    <div className="component-container">
      <div className="component-title">
        <CheckSquare size={32} />
        Weekly Execution Review
      </div>
      <p className="component-description">
        Your most important accountability loop. Plan tasks, track progress, identify roadblocks, 
        and set priorities for strategic execution.
      </p>

      {/* Week Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        background: '#f7fafc',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <button 
          className="btn btn-secondary"
          onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
        >
          ← Previous Week
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Tasks: {completedCount}/{weekTasks.length} completed
          </div>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
        >
          Next Week →
        </button>
      </div>

      {/* Weekly Review Summary */}
      {weekReview && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }}>

          <h3 style={{ 
            margin: '0 0 1.5rem 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'white'
          }}>
            🔍 Weekly Review Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'white'
              }}>
                ⭐ Biggest Wins
              </h4>
              {weekReview.winsReflection ? (
                <p style={{ margin: '0', opacity: 0.9, lineHeight: '1.4' }}>
                  {weekReview.winsReflection}
                </p>
              ) : weekReview.learnings.length > 0 ? (
                <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                  {weekReview.learnings.map((learning, index) => (
                    <li key={index} style={{ marginBottom: '0.3rem' }}>{learning}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: '0', opacity: 0.8 }}>No wins recorded</p>
              )}
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'white'
              }}>
                🚧 Gaps & Roadblocks
              </h4>
              {weekReview.gapsAnalysis ? (
                <p style={{ margin: '0', opacity: 0.9, lineHeight: '1.4' }}>
                  {weekReview.gapsAnalysis}
                </p>
              ) : weekReview.roadblocks.length > 0 ? (
                <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                  {weekReview.roadblocks.map((roadblock, index) => (
                    <li key={index} style={{ marginBottom: '0.3rem' }}>{roadblock}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: '0', opacity: 0.8 }}>No gaps or roadblocks recorded</p>
              )}
            </div>
          </div>

          {/* Key Lessons and Mindset/Clarity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'white'
              }}>
                💡 Key Lesson
              </h4>
              {weekReview.keyLesson ? (
                <p style={{ margin: '0', opacity: 0.9, lineHeight: '1.4' }}>
                  {weekReview.keyLesson}
                </p>
              ) : (
                <p style={{ margin: '0', opacity: 0.8 }}>No key lesson recorded</p>
              )}
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'white'
              }}>
                🧠 Mindset & Clarity
              </h4>
              {weekReview.clarityResponses && Object.keys(weekReview.clarityResponses).length > 0 ? (
                <div style={{ opacity: 0.9 }}>
                  {Object.entries(weekReview.clarityResponses).map(([question, answer], index) => (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.2rem' }}>
                        {question}
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>
                        {answer}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: '0', opacity: 0.8 }}>No mindset reflections recorded</p>
              )}
            </div>
          </div>
          
          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {weekReview.overallProgress}%
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Overall Progress
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {'⭐'.repeat(weekReview.satisfaction)}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Satisfaction
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {'⚡'.repeat(weekReview.energyLevel)}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Energy Level
              </div>
            </div>
          </div>
          
          {weekReview.strategicCheckIn && (
            <div style={{ 
              marginTop: '1.5rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'white'
              }}>
                🎯 Strategic Focus
              </h4>
              <p style={{ margin: '0', opacity: 0.9 }}>
                {weekReview.strategicCheckIn}
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Review Message */}
      {!weekReview && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          background: '#f7fafc',
          border: '2px dashed #cbd5e0',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>
            📝 No Weekly Review Found
          </h3>
          <p style={{ margin: '0', color: '#718096' }}>
            Complete a Weekly Command Huddle for this week to see your review summary here.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowTaskForm(true)}
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f7fafc' }}>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="What needs to be done?"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Link to Quarterly Goal</label>
                <select
                  className="form-input"
                  value={taskFormData.quarterlyGoalId}
                  onChange={(e) => setTaskFormData({ ...taskFormData, quarterlyGoalId: e.target.value })}
                >
                  <option value="">No specific goal</option>
                  {currentQuarterGoals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Task details, context, or notes..."
                style={{ minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetTaskForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Tasks for This Week</h3>
        {weekTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <Clock size={32} style={{ color: '#cbd5e0', margin: '0 auto 1rem' }} />
            <p style={{ color: '#718096' }}>No tasks planned for this week.</p>
          </div>
        ) : (
          <div className="grid grid-1" style={{ gap: '1rem' }}>
            {weekTasks.map(task => {
              const linkedGoal = currentQuarterGoals.find(g => g.id === task.quarterlyGoalId);
              return (
                <div key={task.id} className="card" style={{ 
                  background: task.completed ? '#f0fff4' : 'white',
                  border: task.completed ? '2px solid #48bb78' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        style={{ marginTop: '0.25rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: 0, 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? '#666' : '#2d3748',
                          marginBottom: '0.5rem'
                        }}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p style={{ margin: '0 0 0.5rem 0', color: '#4a5568', fontSize: '0.9rem' }}>
                            {task.description}
                          </p>
                        )}
                        
                        {linkedGoal && (
                          <p style={{ margin: 0, color: '#667eea', fontSize: '0.9rem' }}>
                            → {linkedGoal.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => setGoldenThreadTaskId(task.id)}
                        style={{ padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#ffd700', color: '#8b4513' }}
                        title="See Context - Trace to Life Goals"
                      >
                        <Network size={14} />
                        Context
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => editTask(task)}
                        style={{ padding: '0.5rem' }}
                        title="Edit task"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => deleteTask(task.id)}
                        style={{ padding: '0.5rem', color: '#f56565' }}
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Golden Thread Modal */}
      {goldenThreadTaskId && (
        <GoldenThread
          taskId={goldenThreadTaskId}
          onClose={() => setGoldenThreadTaskId(null)}
          onNavigate={(section, id) => {
            console.log(`Navigate to ${section}`, id);
            // TODO: Add actual navigation
          }}
        />
      )}
    </div>
  );
}

export default WeeklyReview;
