import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../hooks/useRouter';
import { Target, Plus, Edit3, Trash2, Calendar, Heart, Brain, Briefcase, DollarSign, Activity, Users, Compass, Building, Plane, Gift, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import type { AnnualGoal, LifeGoalCategory } from '../types';
import AISuggestions from './AISuggestions';
import GoldenThread from './GoldenThread';
import { RichTextEditor } from './ui/RichTextEditor';

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
  'Giving Back': Gift,
  'Other': Target
};

const categoryColors: Record<LifeGoalCategory, string> = {
  'Creativity & Passion': 'var(--mood-inspired)',
  'Mind': 'var(--chart-2)',
  'Career': 'var(--ocean-deep-blue)',
  'Finance': 'var(--warning)',
  'Health': 'var(--success)',
  'Relationships': 'var(--mood-confident)',
  'Spirit': 'var(--mood-calm)',
  'Community': 'var(--chart-4)',
  'Travel': 'var(--chart-3)',
  'Giving Back': 'var(--mood-determined)',
  'Other': 'var(--ocean-surface-blue)'
};

function AnnualPlan() {
  const { state, dispatch } = useApp();
  const { navigateTo } = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AnnualGoal | null>(null);
  const [showGoldenThread, setShowGoldenThread] = useState(false);
  const [selectedThreadGoal, setSelectedThreadGoal] = useState<AnnualGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lifeGoalId: '',
    targetDate: '',
  });

  const currentYearGoals = state.annualGoals.filter(goal => goal.year === state.currentYear);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      lifeGoalId: '',
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
        status: editingGoal?.status || 'not-started',
        createdAt: editingGoal?.createdAt || new Date(),
        targetDate: new Date(formData.targetDate),
        progress: editingGoal?.progress || 0,
        year: state.currentYear,
        lifeGoalId: formData.lifeGoalId || undefined,
        quarterlyGoals: editingGoal?.quarterlyGoals || [],
        updatedAt: new Date(),
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

  const handleGoalClick = (goalId: string) => {
    navigateTo('goals-table', false, { goalType: 'annual', goalId });
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
        Set strategic goals that will define your year. These should be significant achievements
        that align with your long-term vision and can be broken down into quarterly objectives.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <strong>Current Goals: </strong>
          <span style={{ color: '#667eea' }}>{currentYearGoals.length}</span>
          <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Completed: {currentYearGoals.filter(g => g.status === 'completed').length}
          </span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
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
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Describe what success looks like and why this goal matters..."
                minHeight="150px"
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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {currentYearGoals.map((goal) => (
            <div 
              key={goal.id} 
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => handleGoalClick(goal.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
            >
              {/* Header Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    lineHeight: '1.3'
                  }}>
                    {goal.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowGoldenThread(goal);
                      }}
                      style={{ 
                        padding: '0.5rem', 
                        backgroundColor: '#ffd700', 
                        color: '#8b4513',
                        border: 'none',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                      title="See Context - Trace this goal to your life vision"
                    >
                      <GitBranch size={16} />
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(goal);
                      }}
                      style={{ 
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#e2e8f0',
                        color: '#4a5568',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(goal.id);
                      }}
                      style={{ 
                        padding: '0.5rem', 
                        color: '#f56565',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#fed7d7',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Status and Priority Badges */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ 
                    padding: '0.375rem 0.875rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(goal.status) + '15',
                    color: getStatusColor(goal.status),
                    border: `1px solid ${getStatusColor(goal.status)}30`
                  }}>
                    {goal.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ 
                color: '#4a5568', 
                margin: '0 0 1.25rem 0', 
                lineHeight: '1.6',
                fontSize: '0.95rem'
              }}>
                {goal.description}
              </p>

              {/* Metadata Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                {goal.lifeGoalId && (() => {
                  const linkedLifeGoal = state.lifeGoals.find(lg => lg.id === goal.lifeGoalId);
                  if (linkedLifeGoal) {
                    const Icon = categoryIcons[linkedLifeGoal.category];
                    const color = categoryColors[linkedLifeGoal.category];
                    return (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: color + '10',
                        borderRadius: '8px',
                        border: `1px solid ${color}20`
                      }}>
                        <Icon size={18} style={{ color }} />
                        <span style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '500' }}>
                          <strong>Life Goal:</strong> {linkedLifeGoal.title}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  <Calendar size={16} />
                  <span><strong>Target:</strong> {format(goal.targetDate, 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Progress Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' }}>
                    Progress
                  </span>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    color: goal.progress >= 75 ? '#38a169' : goal.progress >= 50 ? '#ed8936' : '#e53e3e'
                  }}>
                    {goal.progress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${goal.progress}%`,
                    height: '100%',
                    background: goal.progress >= 75 
                      ? 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)'
                      : goal.progress >= 50
                      ? 'linear-gradient(90deg, #ed8936 0%, #f6ad55 100%)'
                      : 'linear-gradient(90deg, #e53e3e 0%, #fc8181 100%)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
                  Auto-calculated from quarterly goals
                </div>
              </div>

              {/* Quarterly Goals Link */}
              {goal.quarterlyGoals.length > 0 && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)', 
                  borderRadius: '8px',
                  border: '1px solid #bee3f8'
                }}>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: '#2b6cb0', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Target size={16} />
                    Linked Quarterly Goals: {goal.quarterlyGoals.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                    Break this annual goal into quarterly objectives in the 90-Day Sprint section.
                  </div>
                </div>
              )}
            </div>
          ))}
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
