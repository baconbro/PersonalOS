import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, Edit3, Trash2, Target, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { QuarterlyGoal, KeyResult } from '../types';
import { validateGoalTitle, validateGoalDescription, sanitizeText, logSecurityEvent } from '../utils/security';

function QuarterlySprint() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuarterlyGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    annualGoalId: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    keyResults: [] as KeyResult[],
  });

  // Security validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const getQuarterDates = (quarter: number, year: number) => {
    const quarterStartDate = new Date(year, (quarter - 1) * 3, 1);
    const quarterEndDate = new Date(year, quarter * 3, 0);
    return {
      start: quarterStartDate,
      end: quarterEndDate
    };
  };

  const currentQuarterGoals = state.quarterlyGoals.filter(
    goal => goal.quarter === state.currentQuarter && goal.year === state.currentYear
  );

  const currentQuarterDates = getQuarterDates(state.currentQuarter, state.currentYear);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      annualGoalId: '',
      category: '',
      priority: 'medium',
      keyResults: [],
    });
    setTitleError('');
    setDescriptionError('');
    setEditingGoal(null);
    setShowForm(false);
  };

  const addKeyResult = () => {
    const newKeyResult: KeyResult = {
      id: crypto.randomUUID(),
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      completed: false,
    };
    setFormData({ 
      ...formData, 
      keyResults: [...formData.keyResults, newKeyResult] 
    });
  };

  const updateKeyResult = (index: number, field: keyof KeyResult, value: any) => {
    const updatedKeyResults = formData.keyResults.map((kr, i) => 
      i === index ? { ...kr, [field]: value } : kr
    );
    setFormData({ ...formData, keyResults: updatedKeyResults });
  };

  const removeKeyResult = (index: number) => {
    setFormData({ 
      ...formData, 
      keyResults: formData.keyResults.filter((_, i) => i !== index) 
    });
  };

  const calculateProgress = (keyResults: KeyResult[]) => {
    if (keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => {
      const progress = kr.targetValue > 0 ? Math.min((kr.currentValue / kr.targetValue) * 100, 100) : 0;
      return sum + progress;
    }, 0);
    return Math.round(totalProgress / keyResults.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setTitleError('');
    setDescriptionError('');

    // Validate inputs using security utilities
    let hasErrors = false;

    const titleValidation = validateGoalTitle(formData.title);
    if (!titleValidation.valid) {
      setTitleError(titleValidation.error || 'Invalid title');
      hasErrors = true;
    }

    const descriptionValidation = validateGoalDescription(formData.description);
    if (!descriptionValidation.valid) {
      setDescriptionError(descriptionValidation.error || 'Invalid description');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const progress = calculateProgress(formData.keyResults);
      
      // Sanitize inputs before submission
      const sanitizedData = {
        title: sanitizeText(formData.title),
        description: sanitizeText(formData.description),
        category: sanitizeText(formData.category) || 'General'
      };
      
      const goalData: QuarterlyGoal = {
        id: editingGoal?.id || crypto.randomUUID(),
        type: 'quarterly',
        title: sanitizedData.title,
        description: sanitizedData.description,
        category: sanitizedData.category,
        priority: formData.priority,
        status: editingGoal?.status || 'not-started',
        createdAt: editingGoal?.createdAt || new Date(),
        targetDate: currentQuarterDates.end,
        progress,
        quarter: state.currentQuarter,
        year: state.currentYear,
        annualGoalId: formData.annualGoalId,
        keyResults: formData.keyResults,
        weeklyTasks: editingGoal?.weeklyTasks || [],
      };

      console.log('Saving quarterly goal:', goalData);

      if (editingGoal) {
        dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: goalData });
        console.log('Updated quarterly goal');
        logSecurityEvent('QUARTERLY_GOAL_UPDATED', { goalId: editingGoal.id });
      } else {
        dispatch({ type: 'ADD_QUARTERLY_GOAL', payload: goalData });
        console.log('Added new quarterly goal');
        logSecurityEvent('QUARTERLY_GOAL_CREATED', { category: sanitizedData.category });
        
        // Link to annual goal if selected
        if (formData.annualGoalId) {
          const annualGoal = state.annualGoals.find(g => g.id === formData.annualGoalId);
          if (annualGoal) {
            const updatedAnnualGoal = {
              ...annualGoal,
              quarterlyGoals: [...annualGoal.quarterlyGoals, goalData.id]
            };
            dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: updatedAnnualGoal });
          }
        }
      }

      alert(editingGoal ? 'Quarterly goal updated successfully!' : 'Quarterly goal created successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving quarterly goal:', error);
      alert('Error saving goal. Please try again.');
    }
  };

  const handleEdit = (goal: QuarterlyGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      annualGoalId: goal.annualGoalId,
      category: goal.category,
      priority: goal.priority,
      keyResults: goal.keyResults,
    });
    setShowForm(true);
  };

  const handleDelete = (goalId: string) => {
    if (confirm('Are you sure you want to delete this quarterly goal?')) {
      dispatch({ type: 'DELETE_QUARTERLY_GOAL', payload: goalId });
    }
  };

  const updateGoalKeyResult = (goalId: string, keyResultIndex: number, field: keyof KeyResult, value: any) => {
    const goal = currentQuarterGoals.find(g => g.id === goalId);
    if (goal) {
      const updatedKeyResults = goal.keyResults.map((kr, i) => 
        i === keyResultIndex ? { ...kr, [field]: value } : kr
      );
      const progress = calculateProgress(updatedKeyResults);
      
      const updatedGoal = { 
        ...goal, 
        keyResults: updatedKeyResults,
        progress,
        status: progress === 100 ? 'completed' as const : 
                progress > 0 ? 'in-progress' as const : 
                'not-started' as const
      };
      dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: updatedGoal });
    }
  };

  const getQuarterName = (quarter: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[quarter - 1];
  };

  const navigateToPreviousQuarter = () => {
    if (state.currentQuarter === 1) {
      dispatch({ type: 'SET_CURRENT_QUARTER', payload: 4 });
      dispatch({ type: 'SET_CURRENT_YEAR', payload: state.currentYear - 1 });
    } else {
      dispatch({ type: 'SET_CURRENT_QUARTER', payload: (state.currentQuarter - 1) as 1 | 2 | 3 | 4 });
    }
  };

  const navigateToNextQuarter = () => {
    if (state.currentQuarter === 4) {
      dispatch({ type: 'SET_CURRENT_QUARTER', payload: 1 });
      dispatch({ type: 'SET_CURRENT_YEAR', payload: state.currentYear + 1 });
    } else {
      dispatch({ type: 'SET_CURRENT_QUARTER', payload: (state.currentQuarter + 1) as 1 | 2 | 3 | 4 });
    }
  };

  return (
    <div className="component-container">
      <div className="component-title">
        <Calendar size={32} />
        90-Day Sprint - {getQuarterName(state.currentQuarter)} {state.currentYear}
      </div>
      <p className="component-description">
        Break your annual goals into quarterly objectives with measurable key results (OKRs). 
        This creates short-term focus and momentum while maintaining strategic alignment.
      </p>

      <div style={{ 
        background: '#f7fafc', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong>Quarter Period:</strong>
            <button 
              onClick={navigateToPreviousQuarter}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4a5568'
              }}
              title="Previous Quarter"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ minWidth: '200px', textAlign: 'center' }}>
              {format(currentQuarterDates.start, 'MMM dd')} - {format(currentQuarterDates.end, 'MMM dd, yyyy')}
            </span>
            <button 
              onClick={navigateToNextQuarter}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4a5568'
              }}
              title="Next Quarter"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div>
          <strong>Active OKRs:</strong> <span style={{ color: '#667eea' }}>{currentQuarterGoals.length}</span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Add OKR
        </button>
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f7fafc' }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">OKR Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete AI Fundamentals Course"
                  required
                />
                {titleError && <div className="error-message">{titleError}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Link to Annual Goal</label>
                <select
                  className="form-input"
                  value={formData.annualGoalId}
                  onChange={(e) => setFormData({ ...formData, annualGoalId: e.target.value })}
                >
                  <option value="">Select Annual Goal (Optional)</option>
                  {state.annualGoals
                    .filter(goal => goal.year === state.currentYear)
                    .map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will you accomplish this quarter?"
                required
              />
              {descriptionError && <div className="error-message">{descriptionError}</div>}
            </div>

            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Learning, Career"
                />
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
                <label className="form-label">Key Results</label>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={addKeyResult}
                  style={{ width: '100%' }}
                >
                  <Plus size={16} />
                  Add Key Result
                </button>
              </div>
            </div>

            {/* Key Results */}
            {formData.keyResults.map((kr, index) => (
              <div key={kr.id} className="card" style={{ margin: '1rem 0', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Key Result Description</label>
                      <input
                        type="text"
                        className="form-input"
                        value={kr.description}
                        onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                        placeholder="e.g., Complete 10 practice projects"
                      />
                    </div>
                    <div className="grid grid-3">
                      <div className="form-group">
                        <label className="form-label">Target Value</label>
                        <input
                          type="number"
                          className="form-input"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Current Value</label>
                        <input
                          type="number"
                          className="form-input"
                          value={kr.currentValue}
                          onChange={(e) => updateKeyResult(index, 'currentValue', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Unit</label>
                        <input
                          type="text"
                          className="form-input"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          placeholder="projects, hours, %, etc."
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => removeKeyResult(index)}
                    style={{ padding: '0.5rem', color: '#f56565' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingGoal ? 'Update OKR' : 'Create OKR'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {currentQuarterGoals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={48} style={{ color: '#cbd5e0', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#4a5568', marginBottom: '1rem' }}>No Quarterly OKRs Set</h3>
          <p style={{ color: '#718096', marginBottom: '2rem' }}>
            Create quarterly objectives with key results to break down your annual goals 
            into manageable 90-day sprints.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Create Your First OKR
          </button>
        </div>
      ) : (
        <div className="grid grid-1" style={{ gap: '1.5rem' }}>
          {currentQuarterGoals.map((goal) => (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>{goal.title}</h3>
                    {goal.annualGoalId && (
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: '#667eea20',
                        color: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Target size={12} />
                        LINKED
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#4a5568', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
                    {goal.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' }}>
                    Overall Progress: {goal.progress}%
                  </span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: goal.status === 'completed' ? '#c6f6d5' : 
                                   goal.status === 'in-progress' ? '#bee3f8' : '#e2e8f0',
                    color: goal.status === 'completed' ? '#2f855a' : 
                           goal.status === 'in-progress' ? '#2b6cb0' : '#4a5568'
                  }}>
                    {goal.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Results */}
              {goal.keyResults.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '1rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} />
                    Key Results ({goal.keyResults.filter(kr => kr.completed).length}/{goal.keyResults.length} completed)
                  </h4>
                  <div className="grid grid-1" style={{ gap: '1rem' }}>
                    {goal.keyResults.map((kr, index) => {
                      const progress = kr.targetValue > 0 ? Math.min((kr.currentValue / kr.targetValue) * 100, 100) : 0;
                      return (
                        <div key={kr.id} style={{ 
                          background: '#f7fafc', 
                          padding: '1rem', 
                          borderRadius: '8px',
                          border: kr.completed ? '2px solid #48bb78' : '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{kr.description}</div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {kr.currentValue} / {kr.targetValue} {kr.unit}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <input
                                type="number"
                                value={kr.currentValue}
                                onChange={(e) => updateGoalKeyResult(goal.id, index, 'currentValue', parseFloat(e.target.value) || 0)}
                                style={{ width: '80px', padding: '0.25rem', border: '1px solid #cbd5e0', borderRadius: '4px' }}
                              />
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                <input
                                  type="checkbox"
                                  checked={kr.completed}
                                  onChange={(e) => updateGoalKeyResult(goal.id, index, 'completed', e.target.checked)}
                                />
                                Done
                              </label>
                            </div>
                          </div>
                          <div className="progress-bar" style={{ height: '6px' }}>
                            <div 
                              className="progress-fill" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuarterlySprint;
