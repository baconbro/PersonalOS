import { useState, useMemo, useEffect } from 'react';
import { X, Heart, Zap, Brain, Search, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CheckIn } from '../types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const moodEmojis = ['😴', '😞', '😐', '🙂', '😊', '🤩'];
const moodLabels = ['Exhausted', 'Low', 'Neutral', 'Good', 'Great', 'Amazing'];

function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const { dispatch, logActivity, createActivityLog, state } = useApp();
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [focusLevel, setFocusLevel] = useState<number>(3);
  const [moodIndex, setMoodIndex] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');
  const [goalSearchTerm, setGoalSearchTerm] = useState<string>('');
  const [showGoalDropdown, setShowGoalDropdown] = useState<boolean>(false);

  // Combine all goals (life, annual, quarterly) into a single array
  const allGoals = useMemo(() => {
    const goals: Array<{id: string, title: string, type: string, lastModified: Date}> = [];
    
    // Add life goals
    state.lifeGoals.forEach(goal => {
      goals.push({
        id: goal.id,
        title: goal.title,
        type: 'Life Goal',
        lastModified: new Date(goal.createdAt) // Ensure it's a proper Date object
      });
    });
    
    // Add annual goals
    state.annualGoals.forEach(goal => {
      goals.push({
        id: goal.id,
        title: goal.title,
        type: 'Annual Goal',
        lastModified: new Date(goal.createdAt) // Ensure it's a proper Date object
      });
    });
    
    // Add quarterly goals
    state.quarterlyGoals.forEach(goal => {
      goals.push({
        id: goal.id,
        title: goal.title,
        type: 'Quarterly Goal',
        lastModified: new Date(goal.createdAt) // Ensure it's a proper Date object
      });
    });
    
    // Sort by last modified date (most recent first)
    return goals.sort((a, b) => {
      const dateA = a.lastModified.getTime();
      const dateB = b.lastModified.getTime();
      return dateB - dateA;
    });
  }, [state.lifeGoals, state.annualGoals, state.quarterlyGoals]);

  // Filter goals based on search term
  const filteredGoals = useMemo(() => {
    if (!goalSearchTerm.trim()) {
      // Return 3 most recent goals by default
      return allGoals.slice(0, 3);
    }
    
    // Filter by search term
    return allGoals.filter(goal => 
      goal.title.toLowerCase().includes(goalSearchTerm.toLowerCase())
    );
  }, [allGoals, goalSearchTerm]);

  // Get selected goal info
  const selectedGoal = useMemo(() => {
    return allGoals.find(goal => goal.id === linkedGoalId);
  }, [allGoals, linkedGoalId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-goal-dropdown]')) {
        setShowGoalDropdown(false);
      }
    };

    if (showGoalDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGoalDropdown]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const checkIn: CheckIn = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        energyLevel,
        focusLevel,
        mood: moodEmojis[moodIndex],
        notes: notes.trim() || undefined,
        linkedGoalId: linkedGoalId || undefined,
      };

      // Add the check-in to state
      dispatch({ type: 'ADD_CHECK_IN', payload: checkIn });

      // Create activity log
      const activityLog = createActivityLog(
        'CHECK_IN_LOGGED',
        'Check-in logged',
        `Energy: ${energyLevel}/5 • Focus: ${focusLevel}/5 • Mood: ${moodEmojis[moodIndex]}${selectedGoal ? ` • Linked to: ${selectedGoal.title}` : ''}${notes ? ` • Notes: ${notes}` : ''}`,
        checkIn.id,
        'check_in',
        {
          energyLevel,
          focusLevel,
          mood: moodEmojis[moodIndex],
          moodLabel: moodLabels[moodIndex],
          notes: notes.trim() || undefined,
          linkedGoalId: linkedGoalId || undefined,
          linkedGoalTitle: selectedGoal?.title
        }
      );

      logActivity(activityLog);

      // Reset form
      setEnergyLevel(3);
      setFocusLevel(3);
      setMoodIndex(3);
      setNotes('');
      setLinkedGoalId('');
      setGoalSearchTerm('');
      setShowGoalDropdown(false);
      
      onClose();
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={24} />
            Check-In
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: 1.5 }}>
            Take a moment to check in with yourself. How are you feeling right now?
          </p>

          {/* Energy Level */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              <Zap size={16} />
              Energy Level: {energyLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Focus Level */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              <Brain size={16} />
              Focus Level: {focusLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={focusLevel}
              onChange={(e) => setFocusLevel(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              <span>Scattered</span>
              <span>Laser-focused</span>
            </div>
          </div>

          {/* Mood Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              Mood: {moodEmojis[moodIndex]} {moodLabels[moodIndex]}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)', 
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMoodIndex(index)}
                  style={{
                    padding: '0.75rem',
                    border: moodIndex === index ? '3px solid #667eea' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    background: moodIndex === index ? '#f7fafc' : 'white',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              <span>Exhausted</span>
              <span>Amazing</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Goal Linking */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              <Target size={16} />
              What's having the biggest impact on your check-in? (optional)
            </label>
            
            <div style={{ position: 'relative' }} data-goal-dropdown>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af' 
                    }} 
                  />
                  <input
                    type="text"
                    value={goalSearchTerm}
                    onChange={(e) => setGoalSearchTerm(e.target.value)}
                    onFocus={() => setShowGoalDropdown(true)}
                    placeholder="Search goals or select from recent..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                {linkedGoalId && (
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedGoalId('');
                      setGoalSearchTerm('');
                    }}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Selected Goal Display */}
              {selectedGoal && (
                <div style={{
                  padding: '0.75rem',
                  background: '#f0f9ff',
                  border: '2px solid #0ea5e9',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <Target size={14} style={{ color: '#0ea5e9' }} />
                    <span style={{ fontWeight: '600', color: '#0c4a6e' }}>
                      {selectedGoal.title}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {selectedGoal.type}
                    </span>
                  </div>
                </div>
              )}

              {/* Goal Dropdown */}
              {showGoalDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {filteredGoals.length === 0 ? (
                    <div style={{ 
                      padding: '1rem', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {goalSearchTerm ? 'No goals found matching your search' : 'No recent goals found'}
                    </div>
                  ) : (
                    <>
                      {!goalSearchTerm && (
                        <div style={{ 
                          padding: '0.5rem 1rem', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          3 Most Recently Modified Goals
                        </div>
                      )}
                      {filteredGoals.map(goal => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => {
                            setLinkedGoalId(goal.id);
                            setShowGoalDropdown(false);
                            setGoalSearchTerm('');
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            border: 'none',
                            background: linkedGoalId === goal.id ? '#f0f9ff' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            borderBottom: '1px solid #f3f4f6'
                          }}
                          onMouseEnter={(e) => {
                            if (linkedGoalId !== goal.id) {
                              e.currentTarget.style.background = '#f9fafb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (linkedGoalId !== goal.id) {
                              e.currentTarget.style.background = 'white';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={14} style={{ color: '#6b7280' }} />
                            <span style={{ fontWeight: '500' }}>{goal.title}</span>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: '#6b7280',
                              marginLeft: 'auto'
                            }}>
                              {goal.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: isSubmitting ? '#94a3b8' : '#667eea',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Check-in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckInModal;
