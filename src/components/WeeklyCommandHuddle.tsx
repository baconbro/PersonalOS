import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Target, 
  Calendar, 
  X,
  ArrowLeft,
  ArrowRight,
  Star,
  AlertTriangle,
  TrendingUp,
  Link2
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns';
import type { WeeklyReviewData, QuarterlyGoal, WeeklyTask } from '../types';
import './WeeklyCommandHuddle.css';

interface WeeklyCommandHuddleProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface LastWeekPriority {
  id: string;
  title: string;
  completed: boolean;
}

interface WeeklyPriority {
  id: string;
  title: string;
  description: string;
  linkedOKRId: string;
  status: 'todo' | 'in-progress' | 'done';
  calendarBlocked: boolean;
}

type Phase = 'review' | 'realign' | 'plan';

const WeeklyCommandHuddle: React.FC<WeeklyCommandHuddleProps> = ({ isOpen, onClose, onComplete }) => {
  const { state, dispatch } = useApp();
  const [currentPhase, setCurrentPhase] = useState<Phase>('review');
  const [selectedOKR, setSelectedOKR] = useState<QuarterlyGoal | null>(null);
  
  // Phase 1: Review data
  const [lastWeekPriorities, setLastWeekPriorities] = useState<LastWeekPriority[]>([]);
  const [biggestWin, setBiggestWin] = useState('');
  const [biggestRoadblock, setBiggestRoadblock] = useState('');
  
  // Phase 3: Plan data
  const [weeklyPriorities, setWeeklyPriorities] = useState<WeeklyPriority[]>([]);
  const [priorityInput, setPriorityInput] = useState('');

  const currentWeek = new Date();
  const lastWeek = subWeeks(currentWeek, 1);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(lastWeek, { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });

  const currentQuarterOKRs = state.quarterlyGoals.filter(
    goal => goal.quarter === state.currentQuarter && 
           goal.year === state.currentYear &&
           goal.status !== 'completed'
  );

  // Load last week's tasks and reviews on component mount
  useEffect(() => {
    if (isOpen) {
      const lastWeekTasks = state.weeklyTasks.filter(task =>
        isWithinInterval(task.weekOf, { start: lastWeekStart, end: lastWeekEnd })
      );
      
      const lastWeekReview = state.weeklyReviews.find(review =>
        isWithinInterval(review.weekOf, { start: lastWeekStart, end: lastWeekEnd })
      );

      // Convert last week's tasks to priorities format
      const priorities: LastWeekPriority[] = lastWeekTasks.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed
      }));

      setLastWeekPriorities(priorities);
      
      // Pre-fill wins and roadblocks if they exist
      if (lastWeekReview) {
        setBiggestWin(lastWeekReview.learnings[0] || '');
        setBiggestRoadblock(lastWeekReview.roadblocks[0] || '');
      }
    }
  }, [isOpen, state.weeklyTasks, state.weeklyReviews, lastWeekStart, lastWeekEnd]);

  const togglePriorityComplete = (priorityId: string) => {
    setLastWeekPriorities(prev => 
      prev.map(p => p.id === priorityId ? { ...p, completed: !p.completed } : p)
    );
  };

  const selectOKR = (okr: QuarterlyGoal) => {
    setSelectedOKR(okr);
  };

  const addWeeklyPriority = () => {
    if (priorityInput.trim() && weeklyPriorities.length < 5 && selectedOKR) {
      const newPriority: WeeklyPriority = {
        id: crypto.randomUUID(),
        title: priorityInput.trim(),
        description: '',
        linkedOKRId: selectedOKR.id,
        status: 'todo',
        calendarBlocked: false
      };
      setWeeklyPriorities(prev => [...prev, newPriority]);
      setPriorityInput('');
    }
  };

  const removeWeeklyPriority = (priorityId: string) => {
    setWeeklyPriorities(prev => prev.filter(p => p.id !== priorityId));
  };

  const nextPhase = () => {
    if (currentPhase === 'review') {
      setCurrentPhase('realign');
    } else if (currentPhase === 'realign') {
      setCurrentPhase('plan');
    }
  };

  const prevPhase = () => {
    if (currentPhase === 'realign') {
      setCurrentPhase('review');
    } else if (currentPhase === 'plan') {
      setCurrentPhase('realign');
    }
  };

  const completeHuddle = () => {
    // Save the review data
    const reviewData: WeeklyReviewData = {
      id: crypto.randomUUID(),
      weekOf: lastWeekStart,
      completedTasks: lastWeekPriorities.filter(p => p.completed).map(p => p.id),
      roadblocks: biggestRoadblock ? [biggestRoadblock] : [],
      learnings: biggestWin ? [biggestWin] : [],
      nextWeekPriorities: weeklyPriorities.map(p => p.title),
      lastWeekGoals: lastWeekPriorities.map(p => p.title),
      lastWeekResults: lastWeekPriorities.filter(p => p.completed).map(p => p.title),
      strategicCheckIn: `Focused on ${selectedOKR?.title || 'strategic objectives'} this week.`,
      overallProgress: Math.round((lastWeekPriorities.filter(p => p.completed).length / Math.max(lastWeekPriorities.length, 1)) * 100),
      energyLevel: 3,
      satisfaction: lastWeekPriorities.filter(p => p.completed).length >= lastWeekPriorities.length * 0.7 ? 4 : 3,
      notes: ''
    };

    dispatch({ type: 'ADD_WEEKLY_REVIEW', payload: reviewData });

    // Convert weekly priorities to tasks
    weeklyPriorities.forEach(priority => {
      const taskData: WeeklyTask = {
        id: priority.id,
        title: priority.title,
        description: priority.description,
        quarterlyGoalId: priority.linkedOKRId,
        priority: 'high',
        estimatedHours: 2,
        actualHours: 0,
        completed: false,
        status: 'todo', // Set default status for Kanban board
        weekOf: weekStart,
        roadblocks: [],
        notes: ''
      };
      dispatch({ type: 'ADD_WEEKLY_TASK', payload: taskData });
    });

    onComplete();
  };

  const canProceedFromReview = biggestWin.trim() !== '' && biggestRoadblock.trim() !== '';
  const canProceedFromRealign = selectedOKR !== null;
  const canCompleteHuddle = weeklyPriorities.length >= 3 && weeklyPriorities.length <= 5;

  if (!isOpen) return null;

  return (
    <div className="command-huddle-overlay" onClick={onClose}>
      <div 
        className="command-huddle-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-huddle-header">
          <div className="huddle-progress">
            <div className={`progress-step ${currentPhase === 'review' ? 'active' : 'completed'}`}>
              <div className="step-number">1</div>
              <span>Review</span>
            </div>
            <div className={`progress-step ${currentPhase === 'realign' ? 'active' : currentPhase === 'plan' ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <span>Re-align</span>
            </div>
            <div className={`progress-step ${currentPhase === 'plan' ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Plan</span>
            </div>
          </div>
          <button className="huddle-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="command-huddle-content">
          {/* Phase 1: Review */}
          {currentPhase === 'review' && (
            <div className="huddle-phase">
              <div className="phase-header">
                <h2>🔍 Weekly Review</h2>
                <p>Let's look back at your priorities from last week</p>
              </div>

              <div className="last-week-priorities">
                <h3>Last Week's Priorities</h3>
                <p className="week-range">Week of {format(lastWeekStart, 'MMM dd')} - {format(lastWeekEnd, 'MMM dd, yyyy')}</p>
                
                {lastWeekPriorities.length === 0 ? (
                  <div className="no-priorities">
                    <Target size={48} style={{ color: '#cbd5e0' }} />
                    <p>No priorities were set for last week.</p>
                  </div>
                ) : (
                  <div className="priorities-checklist">
                    {lastWeekPriorities.map(priority => (
                      <div key={priority.id} className="priority-item">
                        <label className="priority-checkbox">
                          <input
                            type="checkbox"
                            checked={priority.completed}
                            onChange={() => togglePriorityComplete(priority.id)}
                          />
                          <span className="checkmark"></span>
                          <span className={`priority-title ${priority.completed ? 'completed' : ''}`}>
                            {priority.title}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="reflection-questions">
                <div className="question-group">
                  <label className="question-label">
                    <Star size={20} />
                    What was your biggest win this week?
                  </label>
                  <textarea
                    className="reflection-input"
                    defaultValue={biggestWin}
                    onChange={(e) => setBiggestWin(e.target.value)}
                    placeholder="Describe your most significant achievement or breakthrough..."
                    rows={3}
                  />
                </div>

                <div className="question-group">
                  <label className="question-label">
                    <AlertTriangle size={20} />
                    What was your biggest roadblock?
                  </label>
                  <textarea
                    className="reflection-input"
                    defaultValue={biggestRoadblock}
                    onChange={(e) => setBiggestRoadblock(e.target.value)}
                    placeholder="What slowed you down or prevented progress..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Re-align */}
          {currentPhase === 'realign' && (
            <div className="huddle-phase">
              <div className="phase-header">
                <h2>🎯 Strategic Re-alignment</h2>
                <p>Looking at your quarterly objectives, where do you need to make the most impact this week?</p>
              </div>

              <div className="okr-selection">
                <h3>Your Q{state.currentQuarter} {state.currentYear} Objectives</h3>
                
                {currentQuarterOKRs.length === 0 ? (
                  <div className="no-okrs">
                    <Calendar size={48} style={{ color: '#cbd5e0' }} />
                    <p>No quarterly objectives found. Create some OKRs first.</p>
                  </div>
                ) : (
                  <div className="okr-grid">
                    {currentQuarterOKRs.map(okr => (
                      <div 
                        key={okr.id} 
                        className={`okr-card ${selectedOKR?.id === okr.id ? 'selected' : ''}`}
                        onClick={() => selectOKR(okr)}
                      >
                        <div className="okr-header">
                          <h4>{okr.title}</h4>
                          <div className="okr-progress">
                            <span>{okr.progress}%</span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${okr.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <p className="okr-description">{okr.description}</p>
                        
                        <div className="key-results">
                          <h5>Key Results:</h5>
                          <ul>
                            {okr.keyResults.map((kr, index) => (
                              <li key={index} className={kr.completed ? 'completed' : ''}>
                                {kr.description}
                                <span className="kr-progress">
                                  {kr.currentValue}/{kr.targetValue} {kr.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {selectedOKR?.id === okr.id && (
                          <div className="selection-indicator">
                            <CheckSquare size={20} />
                            Selected Focus Area
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase 3: Plan */}
          {currentPhase === 'plan' && (
            <div className="huddle-phase">
              <div className="phase-header">
                <h2>📋 Weekly Planning</h2>
                <p>Define 3-5 needle-moving priorities for this week</p>
                {selectedOKR && (
                  <div className="focused-okr">
                    <span>Focused on:</span>
                    <strong>{selectedOKR.title}</strong>
                  </div>
                )}
              </div>

              <div className="priority-planning">
                <div className="add-priority">
                  <div className="priority-input-group">
                    <input
                      type="text"
                      className="priority-input"
                      value={priorityInput}
                      onChange={(e) => setPriorityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWeeklyPriority()}
                      placeholder="Enter a high-impact priority for this week..."
                      disabled={weeklyPriorities.length >= 5}
                    />
                    <button 
                      className="add-priority-btn"
                      onClick={addWeeklyPriority}
                      disabled={!priorityInput.trim() || weeklyPriorities.length >= 5}
                    >
                      Add Priority
                    </button>
                  </div>
                  <div className="priority-counter">
                    {weeklyPriorities.length}/5 priorities
                    {weeklyPriorities.length < 3 && (
                      <span className="min-requirement">Minimum 3 required</span>
                    )}
                  </div>
                </div>

                <div className="weekly-priorities-list">
                  {weeklyPriorities.map((priority, index) => (
                    <div key={priority.id} className="weekly-priority-card">
                      <div className="priority-content">
                        <div className="priority-number">{index + 1}</div>
                        <div className="priority-details">
                          <h4>{priority.title}</h4>
                          <div className="priority-meta">
                            <div className="okr-link">
                              <Link2 size={14} />
                              <span>Supports: {selectedOKR?.title}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          className="remove-priority"
                          onClick={() => removeWeeklyPriority(priority.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {weeklyPriorities.length === 0 && (
                  <div className="empty-priorities">
                    <TrendingUp size={48} style={{ color: '#cbd5e0' }} />
                    <p>Add your first priority to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="command-huddle-footer">
          <div className="navigation-buttons">
            {currentPhase !== 'review' && (
              <button className="nav-button secondary" onClick={prevPhase}>
                <ArrowLeft size={20} />
                Back
              </button>
            )}
            
            <div className="spacer" />
            
            {currentPhase === 'review' && (
              <button 
                className="nav-button primary"
                onClick={nextPhase}
                disabled={!canProceedFromReview}
              >
                Continue to Re-align
                <ArrowRight size={20} />
              </button>
            )}
            
            {currentPhase === 'realign' && (
              <button 
                className="nav-button primary"
                onClick={nextPhase}
                disabled={!canProceedFromRealign}
              >
                Continue to Planning
                <ArrowRight size={20} />
              </button>
            )}
            
            {currentPhase === 'plan' && (
              <button 
                className="nav-button primary complete"
                onClick={completeHuddle}
                disabled={!canCompleteHuddle}
              >
                Complete Weekly Huddle
                <CheckSquare size={20} />
              </button>
            )}
          </div>
          
          {!canProceedFromReview && currentPhase === 'review' && (
            <p className="requirement-note">Please reflect on your biggest win and roadblock to continue</p>
          )}
          {!canProceedFromRealign && currentPhase === 'realign' && (
            <p className="requirement-note">Please select an OKR to focus on this week</p>
          )}
          {!canCompleteHuddle && currentPhase === 'plan' && (
            <p className="requirement-note">Define 3-5 priorities to complete your weekly huddle</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCommandHuddle;
