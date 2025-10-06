import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, Edit3, Trash2, Target, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { QuarterlyGoal, KeyResult } from '../types';
import { validateGoalTitle, validateGoalDescription, sanitizeText, logSecurityEvent } from '../utils/security';
import { RichTextEditor } from './ui/RichTextEditor';

function QuarterlySprint() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuarterlyGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    annualGoalId: '',
    category: '',
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
        status: editingGoal?.status || 'not-started',
        createdAt: editingGoal?.createdAt || new Date(),
        targetDate: currentQuarterDates.end,
        progress,
        quarter: state.currentQuarter,
        year: state.currentYear,
        annualGoalId: formData.annualGoalId,
        keyResults: formData.keyResults,
        weeklyTasks: editingGoal?.weeklyTasks || [],
        updatedAt: new Date(),
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
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="What will you accomplish this quarter?"
                minHeight="150px"
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {currentQuarterGoals.map((goal) => (
            <div key={goal.id} style={{
              background: 'linear-gradient(135deg, #fff 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              overflow: 'hidden'
            }}
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
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: '#1a202c',
                      lineHeight: '1.3',
                      marginBottom: '0.5rem'
                    }}>
                      {goal.title}
                    </h3>
                    
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      {goal.annualGoalId && (
                        <span style={{ 
                          padding: '0.375rem 0.875rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: '#667eea15',
                          color: '#667eea',
                          border: '1px solid #667eea30',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <Target size={14} />
                          LINKED TO ANNUAL GOAL
                        </span>
                      )}
                      <span style={{ 
                        padding: '0.375rem 0.875rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: goal.status === 'completed' ? '#c6f6d515' : 
                                       goal.status === 'in-progress' ? '#bee3f815' : '#e2e8f015',
                        color: goal.status === 'completed' ? '#2f855a' : 
                               goal.status === 'in-progress' ? '#2b6cb0' : '#4a5568',
                        border: `1px solid ${goal.status === 'completed' ? '#c6f6d530' : 
                                             goal.status === 'in-progress' ? '#bee3f830' : '#e2e8f030'}`
                      }}>
                        {goal.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(goal)}
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
                      onClick={() => handleDelete(goal.id)}
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

              {/* Linked Annual Goal Details */}
              {goal.annualGoalId && (() => {
                const linkedAnnualGoal = state.annualGoals.find(ag => ag.id === goal.annualGoalId);
                if (linkedAnnualGoal) {
                  return (
                    <div style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)',
                      borderRadius: '8px',
                      border: '1px solid #bee3f8',
                      marginBottom: '1.25rem'
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
                        Connected Annual Goal
                      </div>
                      <div style={{ 
                        fontSize: '0.95rem', 
                        color: '#1a202c',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {linkedAnnualGoal.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                        This quarterly objective contributes to your annual strategic goal.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Progress Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' }}>
                    Overall Progress
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
              </div>

              {/* Key Results */}
              {goal.keyResults.length > 0 && (
                <div style={{
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    marginBottom: '1.25rem', 
                    color: '#1a202c', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '700'
                  }}>
                    <TrendingUp size={20} style={{ color: '#667eea' }} />
                    Key Results
                    <span style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: '#667eea15',
                      color: '#667eea',
                      border: '1px solid #667eea30'
                    }}>
                      {goal.keyResults.filter(kr => kr.completed).length}/{goal.keyResults.length} COMPLETED
                    </span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {goal.keyResults.map((kr, index) => {
                      const progress = kr.targetValue > 0 ? Math.min((kr.currentValue / kr.targetValue) * 100, 100) : 0;
                      return (
                        <div key={kr.id} style={{ 
                          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
                          padding: '1.25rem', 
                          borderRadius: '10px',
                          border: kr.completed ? '2px solid #48bb78' : '1px solid #cbd5e0',
                          boxShadow: kr.completed 
                            ? '0 4px 6px -1px rgba(72, 187, 120, 0.1)' 
                            : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: '600', 
                                marginBottom: '0.5rem',
                                color: '#1a202c',
                                fontSize: '0.95rem'
                              }}>
                                {kr.description}
                              </div>
                              <div style={{ 
                                fontSize: '0.9rem', 
                                color: '#718096',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <span style={{ fontWeight: '600', color: '#4a5568' }}>
                                  {kr.currentValue}
                                </span>
                                <span>/</span>
                                <span>{kr.targetValue}</span>
                                <span style={{ 
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#e2e8f0',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  {kr.unit}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <input
                                type="number"
                                value={kr.currentValue}
                                onChange={(e) => updateGoalKeyResult(goal.id, index, 'currentValue', parseFloat(e.target.value) || 0)}
                                style={{ 
                                  width: '80px', 
                                  padding: '0.5rem', 
                                  border: '1px solid #cbd5e0', 
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                              />
                              <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: kr.completed ? '#38a169' : '#4a5568',
                                cursor: 'pointer'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={kr.completed}
                                  onChange={(e) => updateGoalKeyResult(goal.id, index, 'completed', e.target.checked)}
                                  style={{ 
                                    width: '16px', 
                                    height: '16px',
                                    accentColor: '#38a169'
                                  }}
                                />
                                {kr.completed ? '✅ Done' : 'Mark Done'}
                              </label>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a5568' }}>
                                Progress
                              </span>
                              <span style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: '700', 
                                color: progress >= 100 ? '#38a169' : progress >= 75 ? '#38a169' : progress >= 50 ? '#ed8936' : '#e53e3e'
                              }}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '6px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: progress >= 100 
                                  ? 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)'
                                  : progress >= 75 
                                  ? 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)'
                                  : progress >= 50
                                  ? 'linear-gradient(90deg, #ed8936 0%, #f6ad55 100%)'
                                  : 'linear-gradient(90deg, #e53e3e 0%, #fc8181 100%)',
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
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
