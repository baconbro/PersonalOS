import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Plus, Edit3, Trash2, Calendar, Heart, Brain, Briefcase, DollarSign, Activity, Users, Compass, Building, Plane, Gift, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import type { AnnualGoal, LifeGoalCategory } from '../types';
import AISuggestions from './AISuggestions';
import GoldenThread from './GoldenThread';

const categoryIcons: Record<LifeGoalCategory, React.ComponentType<any>> = {
  'Creativity & Passion': Heart,
  'Mind': Brain,
  'Career': Briefcase,
  'Finance': DollarSign,
  'Health': Activity,
  'Relationships': Users,
  'Spirit': Compass,
  'Community': Building,
  'Travel': Plane,
  'Giving Back': Gift
};

const categoryColors: Record<LifeGoalCategory, string> = {
  'Creativity & Passion': '#e74c3c',
  'Mind': '#9b59b6',
  'Career': '#3498db',
  'Finance': '#f39c12',
  'Health': '#2ecc71',
  'Relationships': '#e91e63',
  'Spirit': '#795548',
  'Community': '#607d8b',
  'Travel': '#00bcd4',
  'Giving Back': '#4caf50'
};

function AnnualPlan() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AnnualGoal | null>(null);
  const [showGoldenThread, setShowGoldenThread] = useState(false);
  const [selectedThreadGoal, setSelectedThreadGoal] = useState<AnnualGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lifeGoalId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    targetDate: '',
  });

  const currentYearGoals = state.annualGoals.filter(goal => goal.year === state.currentYear);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      lifeGoalId: '',
      priority: 'medium',
      targetDate: '',
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const goalData: AnnualGoal = {
        id: editingGoal?.id || crypto.randomUUID(),
        type: 'annual',
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: 'Annual Goal', // Set a default category for Annual Goals
        priority: formData.priority,
        status: editingGoal?.status || 'not-started',
        createdAt: editingGoal?.createdAt || new Date(),
        targetDate: new Date(formData.targetDate),
        progress: editingGoal?.progress || 0,
        year: state.currentYear,
        lifeGoalId: formData.lifeGoalId || undefined,
        quarterlyGoals: editingGoal?.quarterlyGoals || [],
      };

      console.log('Saving annual goal:', goalData);

      if (editingGoal) {
        dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: goalData });
        console.log('Updated annual goal');
      } else {
        dispatch({ type: 'ADD_ANNUAL_GOAL', payload: goalData });
        console.log('Added new annual goal');
      }

      alert(editingGoal ? 'Goal updated successfully!' : 'Goal created successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving goal. Please try again.');
    }
  };

  const handleEdit = (goal: AnnualGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      lifeGoalId: goal.lifeGoalId || '',
      priority: goal.priority,
      targetDate: format(goal.targetDate, 'yyyy-MM-dd'),
    });
    setShowForm(true);
  };

  const handleDelete = (goalId: string) => {
    if (confirm('Are you sure you want to delete this annual goal? This will also affect related quarterly goals.')) {
      dispatch({ type: 'DELETE_ANNUAL_GOAL', payload: goalId });
    }
  };

  const handleShowGoldenThread = (goal: AnnualGoal) => {
    setSelectedThreadGoal(goal);
    setShowGoldenThread(true);
  };

  const updateProgress = (goalId: string, progress: number) => {
    const goal = currentYearGoals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = { ...goal, progress };
      if (progress === 100 && goal.status !== 'completed') {
        updatedGoal.status = 'completed';
      } else if (progress > 0 && goal.status === 'not-started') {
        updatedGoal.status = 'in-progress';
      }
      dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: updatedGoal });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f56565';
      case 'medium': return '#ed8936';
      case 'low': return '#48bb78';
      default: return '#4a5568';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#48bb78';
      case 'in-progress': return '#4299e1';
      case 'on-hold': return '#ed8936';
      default: return '#a0aec0';
    }
  };

  return (
    <div className="component-container">
      <div className="component-title">
        <Target size={32} />
        Annual Flight Plan {state.currentYear}
      </div>
      <p className="component-description">
        Set 2-3 high-level strategic goals that will define your year. These should be significant achievements
        that align with your long-term vision and can be broken down into quarterly objectives.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <strong>Current Goals: </strong>
          <span style={{ color: '#667eea' }}>{currentYearGoals.length}/3</span>
          <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Completed: {currentYearGoals.filter(g => g.status === 'completed').length}
          </span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={currentYearGoals.length >= 3}
        >
          <Plus size={20} />
          Add Annual Goal
        </button>
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f7fafc' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Goal Title *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Achieve Stanford AI Certificate"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what success looks like and why this goal matters..."
                required
              />
            </div>

            {/* AI Suggestions for Annual Goals */}
            {formData.lifeGoalId && (
              <AISuggestions
                type="annual-goals"
                sourceData={state.lifeGoals.find(lg => lg.id === formData.lifeGoalId)}
                onSuggestionSelect={(suggestion) => {
                  if (!formData.title.trim()) {
                    setFormData({ ...formData, title: suggestion });
                  } else if (!formData.description.trim()) {
                    setFormData({ ...formData, description: suggestion });
                  }
                }}
                className="ai-suggestions-section"
              />
            )}

            {!formData.lifeGoalId && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#0369a1',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💡 Select a Life Goal above to get AI-powered suggestions for breaking it down into annual goals.
              </div>
            )}

            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Linked Life Goal (Optional)</label>
                <select
                  className="form-input"
                  value={formData.lifeGoalId}
                  onChange={(e) => setFormData({ ...formData, lifeGoalId: e.target.value })}
                >
                  <option value="">No life goal selected</option>
                  {state.lifeGoals.map((lifeGoal) => (
                    <option key={lifeGoal.id} value={lifeGoal.id}>
                      {lifeGoal.title} ({lifeGoal.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {currentYearGoals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Target size={48} style={{ color: '#cbd5e0', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#4a5568', marginBottom: '1rem' }}>No Annual Goals Set</h3>
          <p style={{ color: '#718096', marginBottom: '2rem' }}>
            Start by creating your first strategic goal for {state.currentYear}. 
            Think big picture - what significant achievement would make this year a success?
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-1" style={{ gap: '1.5rem' }}>
          {currentYearGoals.map((goal) => (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>{goal.title}</h3>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: getPriorityColor(goal.priority) + '20',
                      color: getPriorityColor(goal.priority)
                    }}>
                      {goal.priority.toUpperCase()}
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(goal.status) + '20',
                      color: getStatusColor(goal.status)
                    }}>
                      {goal.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#4a5568', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
                    {goal.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
                    {goal.lifeGoalId && (() => {
                      const linkedLifeGoal = state.lifeGoals.find(lg => lg.id === goal.lifeGoalId);
                      if (linkedLifeGoal) {
                        const Icon = categoryIcons[linkedLifeGoal.category];
                        const color = categoryColors[linkedLifeGoal.category];
                        return (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icon size={16} style={{ color }} />
                            <strong>Life Goal:</strong> {linkedLifeGoal.title}
                          </span>
                        );
                      }
                      return null;
                    })()}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={16} />
                      Target: {format(goal.targetDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleShowGoldenThread(goal)}
                    style={{ padding: '0.5rem', backgroundColor: '#ffd700', color: '#8b4513' }}
                    title="See Context - Trace this goal to your life vision"
                  >
                    <GitBranch size={16} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(goal)}
                    style={{ padding: '0.5rem' }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDelete(goal.id)}
                    style={{ padding: '0.5rem', color: '#f56565' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' }}>
                    Progress: {goal.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                    style={{ width: '150px' }}
                  />
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {goal.quarterlyGoals.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>
                    Linked Quarterly Goals: {goal.quarterlyGoals.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Break this annual goal into quarterly objectives in the 90-Day Sprint section.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentYearGoals.length >= 3 && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#fed7d7', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#c53030', fontWeight: '500' }}>
            You've reached the recommended limit of 3 annual goals. 
            Focus on executing these effectively before adding more.
          </p>
        </div>
      )}

      {/* Golden Thread Modal */}
      {showGoldenThread && selectedThreadGoal && (
        <GoldenThread
          annualGoalId={selectedThreadGoal.id}
          onClose={() => {
            setShowGoldenThread(false);
            setSelectedThreadGoal(null);
          }}
          onNavigate={(target, goalId) => {
            console.log(`Navigate to ${target} for goal ${goalId}`);
            // TODO: Implement navigation logic
          }}
        />
      )}
    </div>
  );
}

export default AnnualPlan;
