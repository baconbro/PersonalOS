import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Target, 
  Calendar, 
  X,
  ArrowLeft,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval, addWeeks } from 'date-fns';
import type { WeeklyReviewData, QuarterlyGoal, WeeklyTask } from '../types';
import { taskRolloverService } from '../services/taskRolloverService';
import { RichTextEditor } from './ui/RichTextEditor';
import './WeeklyCommandHuddle.css';

interface WeeklyCommandHuddleProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedWeek?: Date; // Optional prop to set initial week
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
  linkedOKRId: string; // Back to single OKR linking
  status: 'todo' | 'in-progress' | 'done';
  calendarBlocked: boolean;
}

interface LinkedReflection {
  goalId?: string;
  goalTitle?: string;
  goalType?: 'life' | 'annual' | 'quarterly' | 'task';
  isGeneral?: boolean; // For universal lessons not tied to specific goals
}

type Phase = 'review' | 'clarity' | 'realign' | 'plan';
type ReviewStep = 'celebrate' | 'analyze' | 'learn';

// Searchable Select Component
interface SearchableSelectProps {
  value?: LinkedReflection;
  onChange: (selectedItem: { id: string; title: string; type: string } | null) => void;
  placeholder: string;
  items: Array<{
    id: string;
    title: string;
    type: 'life' | 'annual' | 'quarterly' | 'task';
    status: string;
    description?: string;
  }>;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, placeholder, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items.slice(0, 10); // Show top 10 recent items by default
    
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return filtered.slice(0, 10); // Limit to 10 results
  }, [items, searchTerm]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'life': return '#8b5cf6';
      case 'annual': return '#3b82f6';
      case 'quarterly': return '#10b981';
      case 'task': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'life': return 'Life Goal';
      case 'annual': return 'Annual Goal';
      case 'quarterly': return 'Quarterly Goal';
      case 'task': return 'Weekly Task';
      default: return type;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', marginTop: '0.75rem' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          background: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '38px'
        }}
      >
        {value?.goalTitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '10px',
              background: getTypeColor(value.goalType || ''),
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              {getTypeLabel(value.goalType || '')}
            </span>
            <span>{value.goalTitle}</span>
          </div>
        ) : (
          <span style={{ color: '#9ca3af' }}>{placeholder}</span>
        )}
        <span style={{ color: '#6b7280' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflow: 'hidden'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search goals and tasks..."
            autoFocus
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {filteredItems.length > 0 ? (
              <>
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange({ id: item.id, title: item.title, type: item.type });
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '10px',
                        background: getTypeColor(item.type),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {getTypeLabel(item.type)}
                      </span>
                      <span style={{ fontWeight: '500' }}>{item.title}</span>
                      <span style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        background: '#f3f4f6',
                        padding: '1px 4px',
                        borderRadius: '3px'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    {item.description && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
                <div
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#dc2626',
                    textAlign: 'center',
                    borderTop: '1px solid #f3f4f6',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ✕ Clear selection
                </div>
              </>
            ) : (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const WeeklyCommandHuddle: React.FC<WeeklyCommandHuddleProps> = ({ isOpen, onClose, onComplete, selectedWeek: initialSelectedWeek }) => {
  const { state, dispatch } = useApp();

  // Get all available goals and tasks for linking, sorted by most recent modification
  const availableItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      type: 'life' | 'annual' | 'quarterly' | 'task';
      status: string;
      lastModified: Date;
      description?: string;
    }> = [];

    // Add life goals
    state.lifeGoals.forEach(goal => {
      items.push({
        id: goal.id,
        title: goal.title,
        type: 'life',
        status: goal.status,
        lastModified: goal.createdAt,
        description: goal.description
      });
    });

    // Add annual goals
    state.annualGoals.forEach(goal => {
      items.push({
        id: goal.id,
        title: goal.title,
        type: 'annual',
        status: goal.status,
        lastModified: goal.createdAt,
        description: goal.description
      });
    });

    // Add quarterly goals
    state.quarterlyGoals.forEach(goal => {
      items.push({
        id: goal.id,
        title: goal.title,
        type: 'quarterly',
        status: goal.status,
        lastModified: goal.createdAt,
        description: goal.description
      });
    });

    // Add weekly tasks
    state.weeklyTasks.forEach(task => {
      items.push({
        id: task.id,
        title: task.title,
        type: 'task',
        status: task.status,
        lastModified: task.weekOf,
        description: task.description
      });
    });

    // Sort by last modified (most recent first)
    return items.sort((a, b) => {
      const dateA = new Date(a.lastModified);
      const dateB = new Date(b.lastModified);
      return dateB.getTime() - dateA.getTime();
    });
  }, [state.lifeGoals, state.annualGoals, state.quarterlyGoals, state.weeklyTasks]);
  const [currentPhase, setCurrentPhase] = useState<Phase>('review');
  const [reviewStep, setReviewStep] = useState<ReviewStep>('celebrate');
  const [selectedOKRs, setSelectedOKRs] = useState<QuarterlyGoal[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(initialSelectedWeek || new Date()); // Add week selection
  
  // Update selectedWeek when prop changes
  useEffect(() => {
    if (initialSelectedWeek) {
      setSelectedWeek(initialSelectedWeek);
    }
  }, [initialSelectedWeek]);
  
  // Phase 1: Review data - After Action Review
  const [lastWeekPriorities, setLastWeekPriorities] = useState<LastWeekPriority[]>([]);
  const [biggestWin, setBiggestWin] = useState('');
  const [biggestRoadblock, setBiggestRoadblock] = useState('');
  
  // Individual wins with linking
  const [wins, setWins] = useState<Array<{id: string, text: string, link?: LinkedReflection}>>([
    { id: crypto.randomUUID(), text: '', link: undefined }
  ]);

  // Individual gaps with linking
  const [gaps, setGaps] = useState<Array<{id: string, text: string, link?: LinkedReflection}>>([
    { id: crypto.randomUUID(), text: '', link: undefined }
  ]);

  // Individual lessons with linking
  const [lessons, setLessons] = useState<Array<{id: string, text: string, link?: LinkedReflection}>>([
    { id: crypto.randomUUID(), text: '', link: undefined }
  ]);
  
  // Phase 2: Clarity/Mindset data
  const [clarityResponses, setClarityResponses] = useState<Record<string, string>>({});
  
  // Phase 3: Plan data
  const [weeklyPriorities, setWeeklyPriorities] = useState<WeeklyPriority[]>([]);
  
  // Validation states
  const [showValidationError, setShowValidationError] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<Phase | null>(null);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  const currentWeek = useMemo(() => selectedWeek, [selectedWeek]);
  const lastWeek = useMemo(() => subWeeks(currentWeek, 1), [currentWeek]);
  const nextWeek = useMemo(() => addWeeks(currentWeek, 1), [currentWeek]);
  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const weekEnd = useMemo(() => endOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const nextWeekStart = useMemo(() => startOfWeek(nextWeek, { weekStartsOn: 1 }), [nextWeek]);
  const lastWeekStart = useMemo(() => startOfWeek(lastWeek, { weekStartsOn: 1 }), [lastWeek]);
  const lastWeekEnd = useMemo(() => endOfWeek(lastWeek, { weekStartsOn: 1 }), [lastWeek]);

  const currentQuarterOKRs = state.quarterlyGoals.filter(
    goal => goal.quarter === state.currentQuarter && 
           goal.year === state.currentYear &&
           goal.status !== 'completed'
  );

  // Load last week's tasks and reviews on component mount
  useEffect(() => {
    if (isOpen) {
      // Trigger automatic rollover check when opening the huddle
      taskRolloverService.checkAndPerformRollover(state.weeklyTasks).catch(error => {
        console.warn('Weekly Huddle rollover check failed:', error);
      });

      // Load tasks for the CURRENT selected week (week in focus)
      const currentWeekTasks = state.weeklyTasks.filter(task =>
        isWithinInterval(task.weekOf, { start: weekStart, end: weekEnd })
      );
      
      const lastWeekReview = state.weeklyReviews.find(review =>
        isWithinInterval(review.weekOf, { start: lastWeekStart, end: lastWeekEnd })
      );

      // Convert current week's tasks to priorities format
      const priorities: LastWeekPriority[] = currentWeekTasks.map(task => ({
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
      
      // Reset validation error when modal opens
      setShowValidationError(false);
    }
  }, [isOpen, weekStart, weekEnd, lastWeekStart, lastWeekEnd, state.weeklyTasks, state.weeklyReviews]);

  const togglePriorityComplete = (priorityId: string) => {
    setLastWeekPriorities(prev => 
      prev.map(p => p.id === priorityId ? { ...p, completed: !p.completed } : p)
    );
  };

  const selectOKR = (okr: QuarterlyGoal) => {
    setSelectedOKRs(prev => {
      const isAlreadySelected = prev.some(selected => selected.id === okr.id);
      if (isAlreadySelected) {
        // Remove from selection
        return prev.filter(selected => selected.id !== okr.id);
      } else {
        // Add to selection
        return [...prev, okr];
      }
    });
    if (showValidationError) setShowValidationError(false);
  };

  const addPriorityToOKR = (okrId: string, priorityText: string) => {
    if (priorityText.trim() && weeklyPriorities.length < 15) { // Increased limit for multiple OKRs
      const newPriority: WeeklyPriority = {
        id: crypto.randomUUID(),
        title: priorityText.trim(),
        description: '',
        linkedOKRId: okrId, // Link to specific OKR
        status: 'todo',
        calendarBlocked: false
      };
      setWeeklyPriorities(prev => [...prev, newPriority]);
      if (showValidationError) setShowValidationError(false);
    }
  };

  // Local component for OKR-specific priority input
  const OKRPriorityInput: React.FC<{
    okrId: string;
    onAddPriority: (okrId: string, text: string) => void;
    maxPriorities: number;
    currentCount: number;
  }> = ({ okrId, onAddPriority, maxPriorities, currentCount }) => {
    const [inputValue, setInputValue] = useState('');
    
    const handleAdd = () => {
      if (inputValue.trim() && currentCount < maxPriorities) {
        onAddPriority(okrId, inputValue);
        setInputValue('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAdd();
      }
    };

    return (
      <div className="okr-priority-input">
        <div className="priority-input-group">
          <input
            type="text"
            className="priority-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a priority for this objective..."
            disabled={currentCount >= maxPriorities}
          />
          <button 
            className="add-priority-btn"
            onClick={handleAdd}
            disabled={!inputValue.trim() || currentCount >= maxPriorities}
          >
            Add
          </button>
        </div>
        <div className="priority-counter">
          {currentCount}/{maxPriorities} priorities
        </div>
      </div>
    );
  };

  const removeWeeklyPriority = (priorityId: string) => {
    setWeeklyPriorities(prev => prev.filter(p => p.id !== priorityId));
  };

  // Win management functions
  const addWin = () => {
    const newWin = {
      id: crypto.randomUUID(),
      text: '',
      link: undefined
    };
    setWins(prev => [...prev, newWin]);
  };

  const removeWin = (winId: string) => {
    setWins(prev => prev.filter(win => win.id !== winId));
  };

  const updateWinText = (winId: string, newText: string) => {
    setWins(prev => prev.map(win => 
      win.id === winId ? { ...win, text: newText } : win
    ));
    if (showValidationError) setShowValidationError(false);
  };

  // Gap management functions
  const addGap = () => {
    const newGap = {
      id: crypto.randomUUID(),
      text: '',
      link: undefined
    };
    setGaps(prev => [...prev, newGap]);
  };

  const removeGap = (gapId: string) => {
    setGaps(prev => prev.filter(gap => gap.id !== gapId));
  };

  const updateGapText = (gapId: string, newText: string) => {
    setGaps(prev => prev.map(gap => 
      gap.id === gapId ? { ...gap, text: newText } : gap
    ));
    if (showValidationError) setShowValidationError(false);
  };

  // Lesson management functions
  const addLesson = () => {
    const newLesson = {
      id: crypto.randomUUID(),
      text: '',
      link: undefined
    };
    setLessons(prev => [...prev, newLesson]);
  };

  const removeLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
  };

  const updateLessonText = (lessonId: string, newText: string) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId ? { ...lesson, text: newText } : lesson
    ));
    if (showValidationError) setShowValidationError(false);
  };

  // Individual win linking functions
  const linkWinManually = (winId: string, selectedItem: { id: string; title: string; type: string } | null) => {
    setWins(prev => prev.map(win => 
      win.id === winId ? { 
        ...win, 
        link: selectedItem ? { 
          goalId: selectedItem.id,
          goalTitle: selectedItem.title,
          goalType: selectedItem.type as 'life' | 'annual' | 'quarterly' | 'task'
        } : undefined 
      } : win
    ));
  };

  // Individual gap linking functions
  const linkGapManually = (gapId: string, selectedItem: { id: string; title: string; type: string } | null) => {
    setGaps(prev => prev.map(gap => 
      gap.id === gapId ? { 
        ...gap, 
        link: selectedItem ? { 
          goalId: selectedItem.id,
          goalTitle: selectedItem.title,
          goalType: selectedItem.type as 'life' | 'annual' | 'quarterly' | 'task'
        } : undefined 
      } : gap
    ));
  };

  // Individual lesson linking functions
  const linkLessonManually = (lessonId: string, selectedItem: { id: string; title: string; type: string } | null) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId ? { 
        ...lesson, 
        link: selectedItem ? { 
          goalId: selectedItem.id,
          goalTitle: selectedItem.title,
          goalType: selectedItem.type as 'life' | 'annual' | 'quarterly' | 'task'
        } : undefined 
      } : lesson
    ));
  };

  const confirmProceed = () => {
    if (pendingCompletion) {
      // User confirmed to complete without all requirements
      performCompletion();
      setPendingCompletion(false);
    } else if (pendingPhase) {
      // User confirmed to proceed to next phase
      setCurrentPhase(pendingPhase);
      setPendingPhase(null);
    }
    setShowConfirmDialog(false);
    setShowValidationError(false);
  };

  const cancelProceed = () => {
    setShowConfirmDialog(false);
    setPendingPhase(null);
    setPendingCompletion(false);
  };

  const nextPhase = () => {
    if (currentPhase === 'review') {
      // Handle review substeps
      if (reviewStep === 'celebrate') {
        if (!canProceedFromReview) {
          setShowValidationError(true);
          return;
        }
        setShowValidationError(false);
        setReviewStep('analyze');
      } else if (reviewStep === 'analyze') {
        if (!canProceedFromReview) {
          setShowValidationError(true);
          return;
        }
        setShowValidationError(false);
        setReviewStep('learn');
      } else if (reviewStep === 'learn') {
        if (!canProceedFromReview) {
          setShowValidationError(true);
          return;
        }
        setShowValidationError(false);
        setCurrentPhase('clarity');
      }
    } else if (currentPhase === 'clarity') {
      if (!canProceedFromClarity) {
        setShowValidationError(true);
        return; // Don't proceed if validation fails
      }
      setShowValidationError(false);
      setCurrentPhase('realign');
    } else if (currentPhase === 'realign') {
      if (!canProceedFromRealign) {
        // Show confirmation dialog instead of blocking
        setPendingPhase('plan');
        setShowConfirmDialog(true);
        return;
      }
      setShowValidationError(false);
      setCurrentPhase('plan');
    }
  };

  const prevPhase = () => {
    if (currentPhase === 'review') {
      // Handle review substeps
      if (reviewStep === 'analyze') {
        setReviewStep('celebrate');
      } else if (reviewStep === 'learn') {
        setReviewStep('analyze');
      }
      // If we're on 'celebrate', we can't go back further
    } else if (currentPhase === 'clarity') {
      setCurrentPhase('review');
      setReviewStep('learn'); // Go back to the last review step
    } else if (currentPhase === 'realign') {
      setCurrentPhase('clarity');
    } else if (currentPhase === 'plan') {
      setCurrentPhase('realign');
    }
  };

  const completeHuddle = () => {
    // Check if validation fails - show confirmation instead of blocking
    if (!canCompleteHuddle) {
      setPendingCompletion(true);
      setShowConfirmDialog(true);
      return;
    }
    
    setShowValidationError(false);
    performCompletion();
  };

  const performCompletion = () => {

    // Save the review data
    const reviewData: WeeklyReviewData = {
      id: crypto.randomUUID(),
      weekOf: lastWeekStart,
      completedTasks: lastWeekPriorities.filter(p => p.completed).map(p => p.id),
      roadblocks: biggestRoadblock ? [biggestRoadblock] : [],
      learnings: lessons.map(lesson => lesson.text).filter(text => text.trim() !== ''), // Use individual lessons
      nextWeekPriorities: weeklyPriorities.map(p => p.title),
      lastWeekGoals: lastWeekPriorities.map(p => p.title),
      lastWeekResults: lastWeekPriorities.filter(p => p.completed).map(p => p.title),
      strategicCheckIn: selectedOKRs.length > 0 
        ? `Focused on ${selectedOKRs.length === 1 
            ? selectedOKRs[0].title 
            : `${selectedOKRs.length} strategic objectives: ${selectedOKRs.map(okr => okr.title).join(', ')}`
          } next week. ${weeklyPriorities.length} ${weeklyPriorities.length === 1 ? 'priority' : 'priorities'} defined across focus areas.`
        : 'Focused on strategic objectives next week.',
      overallProgress: Math.round((lastWeekPriorities.filter(p => p.completed).length / Math.max(lastWeekPriorities.length, 1)) * 100),
      energyLevel: 3,
      satisfaction: lastWeekPriorities.filter(p => p.completed).length >= lastWeekPriorities.length * 0.7 ? 4 : 3,
      notes: '',
      completedAt: new Date(), // Add completion timestamp
      // Add the new After-Action Review fields
      winsReflection: wins.map(win => win.text).join('\n'), // Convert individual wins to string for storage
      gapsAnalysis: gaps.map(gap => gap.text).join('\n'), // Convert individual gaps to string for storage
      keyLesson: lessons.map(lesson => lesson.text).join('\n'), // Convert individual lessons to string for storage
      // Add Mindset & Clarity Check responses
      clarityResponses: clarityResponses,
      // Add linked reflection data - map each win to its link
      winsLink: wins.reduce((acc, win) => {
        if (win.link) {
          acc[win.id] = win.link;
        }
        return acc;
      }, {} as Record<string, LinkedReflection>),
      gapsLink: gaps.reduce((acc, gap) => {
        if (gap.link) {
          acc[gap.id] = gap.link;
        }
        return acc;
      }, {} as Record<string, LinkedReflection>),
      lessonLink: lessons.reduce((acc, lesson) => {
        if (lesson.link) {
          acc[lesson.id] = lesson.link;
        }
        return acc;
      }, {} as Record<string, LinkedReflection>)
    };

    // Debug: Log clarity responses to verify they're being saved
    console.log('🔍 Weekly Huddle Review Data:', {
      clarityResponses,
      clarityResponsesKeys: Object.keys(clarityResponses),
      clarityResponsesValues: Object.values(clarityResponses),
      hasAnyResponses: Object.keys(clarityResponses).length > 0
    });

    dispatch({ type: 'ADD_WEEKLY_REVIEW', payload: reviewData });

    // Convert weekly priorities to tasks for NEXT week
    weeklyPriorities.forEach(priority => {
      const taskData: WeeklyTask = {
        id: priority.id,
        title: priority.title,
        description: priority.description,
        quarterlyGoalId: priority.linkedOKRId, // Back to single OKR
        estimatedHours: 2,
        actualHours: 0,
        completed: false,
        status: 'todo', // Set default status for Kanban board
        weekOf: nextWeekStart, // Tasks are for the NEXT week
        roadblocks: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dispatch({ type: 'ADD_WEEKLY_TASK', payload: taskData });
    });

    onComplete();
  };

  const canProceedFromReview = useMemo(() => {
    if (reviewStep === 'celebrate') {
      return wins.length > 0 && wins.some(win => win.text.trim() !== ''); // At least one win with text
    } else if (reviewStep === 'analyze') {
      return gaps.length > 0 && gaps.some(gap => gap.text.trim() !== ''); // At least one gap with text
    } else if (reviewStep === 'learn') {
      return lessons.length > 0 && lessons.some(lesson => lesson.text.trim() !== ''); // At least one lesson with text
    } else if (reviewStep === 'priorities') {
      return biggestWin.trim() !== '' && biggestRoadblock.trim() !== '';
    }
    return false;
  }, [reviewStep, wins, gaps, lessons, biggestWin, biggestRoadblock]);
  const canProceedFromClarity = useMemo(() => {
    const requiredQuestions = [
      'creativity-passion',
      'mind-spirit', 
      'relationships',
      'community-giving',
      'career-finance',
      'health-wellbeing'
    ];
    return requiredQuestions.every(key => clarityResponses[key]?.trim() !== '');
  }, [clarityResponses]);
  const canProceedFromRealign = useMemo(() => 
    selectedOKRs.length > 0, 
    [selectedOKRs]
  );
  const canCompleteHuddle = useMemo(() => {
    // At least one priority should be added across all selected OKRs
    return weeklyPriorities.length >= 1 && 
           selectedOKRs.every(okr => {
             const okrPriorities = weeklyPriorities.filter(p => p.linkedOKRId === okr.id);
             return okrPriorities.length >= 0; // Allow 0 priorities per OKR as long as total is >= 1
           });
  }, [weeklyPriorities.length, selectedOKRs]);

  if (!isOpen) return null;

  return (
    <div className="command-huddle-overlay" onClick={onClose}>
      <div 
        className="command-huddle-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-huddle-header">
          {/* Week Selection */}
          <div className="week-selector" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              ← Previous Week
            </button>
            <div style={{ 
              textAlign: 'center', 
              color: 'white', 
              fontWeight: 'bold',
              minWidth: '200px'
            }}>
              Week of {format(weekStart, 'MMM dd')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Next Week →
            </button>
          </div>
          
          <div className="huddle-progress">
            <div className={`progress-step ${currentPhase === 'review' ? 'active' : 'completed'}`}>
              <div className="step-number">1</div>
              <span>Review</span>
            </div>
            <div className={`progress-step ${currentPhase === 'clarity' ? 'active' : ['realign', 'plan'].includes(currentPhase) ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <span>Clarity</span>
            </div>
            <div className={`progress-step ${currentPhase === 'realign' ? 'active' : currentPhase === 'plan' ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <span>Re-align</span>
            </div>
            <div className={`progress-step ${currentPhase === 'plan' ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <span>Plan</span>
            </div>
          </div>
          <button className="huddle-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="command-huddle-content">
          {/* Phase 1: Review - After Action Review Wizard */}
          {currentPhase === 'review' && (
            <div className="huddle-phase">
              {/* Step 1: Celebrate (Wins) */}
              {reviewStep === 'celebrate' && (
                <div className="after-action-step">
                  <div className="step-indicator">
                    <span className="step-number">Step 1 of 3</span>
                  </div>
                  <div className="phase-header celebrate-header">
                    <h2>🎉 Let's start with the wins</h2>
                    <p>What are you proud of from last week?</p>
                  </div>

                  <div className="last-week-priorities">
                    <h3>This Week's Priorities</h3>
                    <p className="week-range">Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}</p>
                    
                    {lastWeekPriorities.length === 0 ? (
                      <div className="no-priorities">
                        <Target size={48} style={{ color: '#cbd5e0' }} />
                        <p>No priorities were set for this week.</p>
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
                  
                  <div className="reflection-area">
                    <div className="wins-list">
                      {wins.map((win, index) => (
                        <div key={win.id} className="win-item">
                          <div className="win-input-container">
                            <input
                              type="text"
                              className="win-input"
                              value={win.text}
                              onChange={(e) => updateWinText(win.id, e.target.value)}
                              placeholder={`Win #${index + 1}: What accomplishment are you proud of?`}
                              style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                background: '#fefefe'
                              }}
                            />
                            <button
                              className="remove-win-btn"
                              onClick={() => removeWin(win.id)}
                              disabled={wins.length === 1}
                              style={{
                                marginLeft: '0.5rem',
                                padding: '0.75rem',
                                background: wins.length === 1 ? '#f0f0f0' : '#fee2e2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: wins.length === 1 ? 'not-allowed' : 'pointer',
                                color: wins.length === 1 ? '#999' : '#dc2626'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {/* Searchable Select linking */}
                          <SearchableSelect
                            value={win.link}
                            onChange={(selectedItem) => linkWinManually(win.id, selectedItem)}
                            placeholder="Link to goal/task (optional)"
                            items={availableItems}
                          />
                        </div>
                      ))}
                      
                      <button
                        className="add-win-btn"
                        onClick={addWin}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px dashed #10b981',
                          borderRadius: '8px',
                          background: 'transparent',
                          color: '#10b981',
                          fontSize: '16px',
                          cursor: 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        ➕ Add another win
                      </button>
                    </div>
                    
                    <div className="reflection-hint">
                      <span>💡 No win is too small. Did you overcome a difficult task, have a great conversation, or stick to a new habit?</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Analyze (Gaps) */}
              {reviewStep === 'analyze' && (
                <div className="after-action-step">
                  <div className="step-indicator">
                    <span className="step-number">Step 2 of 3</span>
                  </div>
                  <div className="phase-header analyze-header">
                    <h2>🔍 Where were the gaps?</h2>
                    <p>What didn't get done, and what stood in the way?</p>
                  </div>

                  <div className="last-week-priorities">
                    <h3>This Week's Priorities</h3>
                    <p className="week-range">Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}</p>
                    
                    {lastWeekPriorities.length === 0 ? (
                      <div className="no-priorities">
                        <Target size={48} style={{ color: '#cbd5e0' }} />
                        <p>No priorities were set for this week.</p>
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
                  
                  <div className="reflection-area">
                    <div className="gaps-list">
                      {gaps.map((gap, index) => (
                        <div key={gap.id} className="gap-item">
                          <div className="gap-input-container">
                            <input
                              type="text"
                              className="gap-input"
                              value={gap.text}
                              onChange={(e) => updateGapText(gap.id, e.target.value)}
                              placeholder={`Gap #${index + 1}: What obstacle or missed opportunity do you want to analyze?`}
                              style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                background: '#fefefe'
                              }}
                            />
                            <button
                              className="remove-gap-btn"
                              onClick={() => removeGap(gap.id)}
                              disabled={gaps.length === 1}
                              style={{
                                marginLeft: '0.5rem',
                                padding: '0.75rem',
                                background: gaps.length === 1 ? '#f0f0f0' : '#fee2e2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: gaps.length === 1 ? 'not-allowed' : 'pointer',
                                color: gaps.length === 1 ? '#999' : '#dc2626'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {/* Individual gap linking */}
                          <SearchableSelect
                            value={gap.link}
                            onChange={(selectedItem) => linkGapManually(gap.id, selectedItem)}
                            placeholder="Link to goal/task (optional)"
                            items={availableItems}
                          />
                        </div>
                      ))}
                      
                      <button
                        className="add-gap-btn"
                        onClick={addGap}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px dashed #f59e0b',
                          borderRadius: '8px',
                          background: 'transparent',
                          color: '#f59e0b',
                          fontSize: '16px',
                          cursor: 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        ➕ Add another gap
                      </button>
                    </div>
                    
                    <div className="reflection-hint">
                      <span>💡 This isn't about blame, it's about diagnosis. Was it a planning issue, an unexpected obstacle, or a lack of energy?</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Learn (Key Takeaway) */}
              {reviewStep === 'learn' && (
                <div className="after-action-step">
                  <div className="step-indicator">
                    <span className="step-number">Step 3 of 3</span>
                  </div>
                  <div className="phase-header learn-header">
                    <h2>🧠 What's the key takeaway?</h2>
                    <p>What's the one lesson you can apply to make next week better?</p>
                  </div>

                  <div className="last-week-priorities">
                    <h3>This Week's Priorities</h3>
                    <p className="week-range">Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}</p>
                    
                    {lastWeekPriorities.length === 0 ? (
                      <div className="no-priorities">
                        <Target size={48} style={{ color: '#cbd5e0' }} />
                        <p>No priorities were set for this week.</p>
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
                  
                  <div className="reflection-area">
                    <div className="lessons-list">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="lesson-item">
                          <div className="lesson-input-container">
                            <input
                              type="text"
                              className="lesson-input"
                              value={lesson.text}
                              onChange={(e) => updateLessonText(lesson.id, e.target.value)}
                              placeholder={`Lesson #${index + 1}: What key insight will you carry forward?`}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                background: '#fefefe'
                              }}
                            />
                            <button
                              className="remove-lesson-btn"
                              onClick={() => removeLesson(lesson.id)}
                              disabled={lessons.length === 1}
                              style={{
                                marginLeft: '0.5rem',
                                padding: '0.75rem',
                                background: lessons.length === 1 ? '#f0f0f0' : '#fee2e2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: lessons.length === 1 ? 'not-allowed' : 'pointer',
                                color: lessons.length === 1 ? '#999' : '#dc2626'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {/* Individual lesson linking */}
                          <SearchableSelect
                            value={lesson.link}
                            onChange={(selectedItem) => linkLessonManually(lesson.id, selectedItem)}
                            placeholder="Link to goal/task (optional)"
                            items={availableItems}
                          />
                        </div>
                      ))}
                      
                      <button
                        className="add-lesson-btn"
                        onClick={addLesson}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px dashed #8b5cf6',
                          borderRadius: '8px',
                          background: 'transparent',
                          color: '#8b5cf6',
                          fontSize: '16px',
                          cursor: 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        ➕ Add another lesson
                      </button>
                    </div>
                    
                    <div className="reflection-hint">
                      <span>💡 What specific insight or strategy will you carry forward? Make it actionable.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase 2: Clarity/Mindset */}
          {currentPhase === 'clarity' && (
            <div className="huddle-phase">
              <div className="phase-header">
                <h2>🧠 Mindset & Clarity Check</h2>
                <p>Take a moment to reflect deeply on different areas of your life</p>
              </div>

              <div className="clarity-questions">
                <div className="clarity-category">
                  <h3>🎨 Creativity & Passion</h3>
                  <div className="question-group">
                    <label className="question-label">
                      What creative pursuits or passions am I nurturing right now? How do they fuel my sense of purpose?
                    </label>
                    <RichTextEditor
                      content={clarityResponses['creativity-passion'] || ''}
                      onChange={(html) => {
                        setClarityResponses(prev => ({
                          ...prev,
                          'creativity-passion': html
                        }));
                        if (showValidationError) setShowValidationError(false);
                      }}
                      placeholder="Reflect on your creative outlets and what brings you joy..."
                      minHeight="100px"
                    />
                  </div>
                </div>

                <div className="clarity-category">
                  <h3>🧘‍♀️ Mind & Spirit</h3>
                  <div className="question-group">
                    <label className="question-label">
                      How connected do I feel to my inner self and values? What practices help me stay centered?
                    </label>
                    <RichTextEditor
                      content={clarityResponses['mind-spirit'] || ''}
                      onChange={(html) => {
                        setClarityResponses(prev => ({
                          ...prev,
                          'mind-spirit': html
                        }));
                        if (showValidationError) setShowValidationError(false);
                      }}
                      placeholder="Consider your spiritual practices, meditation, mindfulness..."
                      minHeight="100px"
                    />
                  </div>
                </div>

                <div className="clarity-category">
                  <h3>💕 Relationships</h3>
                  <div className="question-group">
                    <label className="question-label">
                      How am I showing up in my relationships? What connections need more attention or boundaries?
                    </label>
                    <RichTextEditor
                      content={clarityResponses['relationships'] || ''}
                      onChange={(html) => {
                        setClarityResponses(prev => ({
                          ...prev,
                          'relationships': html
                        }));
                        if (showValidationError) setShowValidationError(false);
                      }}
                      placeholder="Think about family, friends, romantic relationships, professional connections..."
                      minHeight="100px"
                    />
                  </div>
                </div>

                <div className="clarity-category">
                  <h3>🌍 Community & Giving Back</h3>
                  <div className="question-group">
                    <label className="question-label">
                      How am I contributing to something bigger than myself? What impact do I want to make?
                    </label>
                    <RichTextEditor
                      content={clarityResponses['community-giving'] || ''}
                      onChange={(html) => {
                        setClarityResponses(prev => ({
                          ...prev,
                          'community-giving': html
                        }));
                        if (showValidationError) setShowValidationError(false);
                      }}
                      placeholder="Consider volunteer work, mentoring, community involvement, social impact..."
                      minHeight="100px"
                    />
                  </div>
                </div>

                <div className="clarity-category">
                  <h3>💼 Career & Finance</h3>
                  <div className="question-group">
                    <label className="question-label">
                      Is my work aligned with my values and long-term vision? How am I building financial security and freedom?
                    </label>
                    <RichTextEditor
                      content={clarityResponses['career-finance'] || ''}
                      onChange={(html) => {
                        setClarityResponses(prev => ({
                          ...prev,
                          'career-finance': html
                        }));
                        if (showValidationError) setShowValidationError(false);
                      }}
                      placeholder="Reflect on career satisfaction, financial goals, professional growth..."
                      minHeight="100px"
                    />
                  </div>
                </div>

                <div className="clarity-category">
                  <h3>🌟 Health, Travel & Well-being</h3>
                  <div className="question-group">
                    <label className="question-label">
                      How am I caring for my physical and mental health? What experiences am I creating for myself?
                    </label>
                    <RichTextEditor
                      content={clarityResponses['health-wellbeing'] || ''}
                      onChange={(html) => {
                        setClarityResponses(prev => ({
                          ...prev,
                          'health-wellbeing': html
                        }));
                        if (showValidationError) setShowValidationError(false);
                      }}
                      placeholder="Consider physical fitness, mental health, travel plans, life experiences..."
                      minHeight="100px"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Re-align */}
          {currentPhase === 'realign' && (
            <div className="huddle-phase">
              <div className="phase-header">
                <h2>🎯 Strategic Re-alignment</h2>
                <p>Looking at your quarterly objectives, select the focus areas where you need to make the most impact this week. You can select multiple objectives.</p>
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
                        className={`okr-card ${selectedOKRs.some(selected => selected.id === okr.id) ? 'selected' : ''}`}
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
                        
                        {selectedOKRs.some(selected => selected.id === okr.id) && (
                          <div className="selection-indicator">
                            <CheckSquare size={20} />
                            Selected
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
                <p>Define priorities for each of your focus areas for next week</p>
              </div>

              {selectedOKRs.length === 0 ? (
                <div className="no-focus-selected">
                  <TrendingUp size={48} style={{ color: '#cbd5e0' }} />
                  <p>No focus areas selected. Go back to re-alignment to select your objectives.</p>
                </div>
              ) : (
                <div className="okr-priority-sections">
                  {selectedOKRs.map(okr => {
                    const okrPriorities = weeklyPriorities.filter(p => p.linkedOKRId === okr.id);
                    return (
                      <div key={okr.id} className="okr-section">
                        <div className="okr-section-header">
                          <h3>{okr.title}</h3>
                          <div className="okr-progress-mini">
                            <span>{okr.progress}%</span>
                            <div className="progress-bar-mini">
                              <div 
                                className="progress-fill-mini" 
                                style={{ width: `${okr.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="priority-input-section">
                          <OKRPriorityInput 
                            okrId={okr.id} 
                            onAddPriority={addPriorityToOKR}
                            maxPriorities={5}
                            currentCount={okrPriorities.length}
                          />
                        </div>

                        <div className="okr-priorities-list">
                          {okrPriorities.map((priority, index) => (
                            <div key={priority.id} className="okr-priority-card">
                              <div className="priority-content">
                                <div className="priority-number">{index + 1}</div>
                                <div className="priority-details">
                                  <h4>{priority.title}</h4>
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
                          
                          {okrPriorities.length === 0 && (
                            <div className="empty-okr-priorities">
                              <p>No priorities added for this objective yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="command-huddle-footer">
          <div className="navigation-buttons">
            {(currentPhase !== 'review' || (currentPhase === 'review' && reviewStep !== 'celebrate')) && (
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
              >
                {reviewStep === 'celebrate' && (
                  <>Continue to Analysis <ArrowRight size={20} /></>
                )}
                {reviewStep === 'analyze' && (
                  <>Continue to Lessons <ArrowRight size={20} /></>
                )}
                {reviewStep === 'learn' && (
                  <>Continue to Clarity <ArrowRight size={20} /></>
                )}
              </button>
            )}
            
            {currentPhase === 'clarity' && (
              <button 
                className="nav-button primary"
                onClick={nextPhase}
              >
                Continue to Re-align
                <ArrowRight size={20} />
              </button>
            )}
            
            {currentPhase === 'realign' && (
              <button 
                className="nav-button primary"
                onClick={nextPhase}
              >
                Continue to Planning
                <ArrowRight size={20} />
              </button>
            )}
            
            {currentPhase === 'plan' && (
              <button 
                className="nav-button primary complete"
                onClick={completeHuddle}
              >
                Complete Weekly Huddle
                <CheckSquare size={20} />
              </button>
            )}
          </div>
          
          {showValidationError && !canProceedFromReview && currentPhase === 'review' && (
            <>
              {reviewStep === 'celebrate' && (
                <p className="requirement-note error">Please share what you're proud of from last week to continue</p>
              )}
              {reviewStep === 'analyze' && (
                <p className="requirement-note error">Please identify the gaps and obstacles from last week to continue</p>
              )}
              {reviewStep === 'learn' && (
                <p className="requirement-note error">Please share your key lesson or takeaway to continue</p>
              )}
            </>
          )}
          {showValidationError && !canProceedFromClarity && currentPhase === 'clarity' && (
            <p className="requirement-note error">Please answer all mindset reflection questions to continue</p>
          )}
          {showValidationError && !canProceedFromRealign && currentPhase === 'realign' && (
            <p className="requirement-note error">Please select an OKR to focus on this week</p>
          )}
          {showValidationError && !canCompleteHuddle && currentPhase === 'plan' && (
            <p className="requirement-note error">Define 3-5 priorities to complete your weekly huddle</p>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {pendingCompletion ? 'Complete Without All Requirements?' : 'Continue Without Requirements?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {pendingCompletion 
                ? 'You haven\'t defined any weekly priorities yet. You can still complete your huddle and add priorities later, or go back to add them now.'
                : pendingPhase === 'plan' 
                  ? 'You haven\'t selected any quarterly objectives to focus on. You can still proceed to planning or go back to select objectives.'
                  : 'Some requirements are missing. Would you like to continue anyway?'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelProceed}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={confirmProceed}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {pendingCompletion ? 'Complete Anyway' : 'Continue Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCommandHuddle;
