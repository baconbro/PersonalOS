import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar,
  Plus,
  MoreVertical,
  CheckCircle,
  Circle,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  Heart,
  CheckSquare,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { LifeGoal, AnnualGoal, QuarterlyGoal, WeeklyTask, LifeGoalCategory } from '../types';
import { sampleData } from '../utils/sampleData';
import GoalDetails from './GoalDetails';
import './GoalsTable.css';

interface GoalsTableProps {
  onNavigate?: (view: 'life-goals' | 'annual' | 'quarterly' | 'weekly') => void;
}

// Types
type GoalType = 'life' | 'annual' | 'quarterly' | 'weekly';

type GoalItem = {
  id: string;
  title: string;
  description: string;
  goalType: 'life' | 'annual' | 'quarterly' | 'weekly';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  priority: 'high' | 'medium' | 'low';
  targetDate: Date;
  createdAt: Date;
  category?: string;
  type?: string;
  annualGoals?: string[];
};

// Quick Goal Form Component
interface QuickGoalFormProps {
  goalType: GoalType;
  onBack: () => void;
  onClose: () => void;
}

const QuickGoalForm: React.FC<QuickGoalFormProps> = ({ goalType, onBack, onClose }) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as LifeGoal['priority'],
    targetDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const baseGoal = {
        id: crypto.randomUUID(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create goal based on type
      switch (goalType) {
        case 'life':
          const lifeGoal: LifeGoal = {
            ...baseGoal,
            type: 'life',
            priority: formData.priority,
            status: 'not-started',
            progress: 0,
            category: 'Other' as LifeGoalCategory,
            timeframe: 'five-year' as const,
            annualGoals: [],
            vision: formData.description || '',
            targetDate: formData.targetDate ? new Date(formData.targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          };
          await dispatch({ type: 'ADD_LIFE_GOAL', payload: lifeGoal });
          break;

        case 'annual':
          const annualGoal: AnnualGoal = {
            ...baseGoal,
            type: 'annual',
            year: new Date().getFullYear(),
            lifeGoalId: '', // Could be enhanced to link to a life goal
            category: 'Other',
            priority: formData.priority,
            status: 'not-started',
            progress: 0,
            quarterlyGoals: [],
            targetDate: formData.targetDate ? new Date(formData.targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          };
          await dispatch({ type: 'ADD_ANNUAL_GOAL', payload: annualGoal });
          break;

        case 'quarterly':
          const quarterlyGoal: QuarterlyGoal = {
            ...baseGoal,
            type: 'quarterly',
            year: new Date().getFullYear(),
            quarter: Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4,
            annualGoalId: '', // Could be enhanced to link to an annual goal
            category: 'Other',
            priority: formData.priority,
            status: 'not-started',
            progress: 0,
            keyResults: [],
            weeklyTasks: [],
            targetDate: formData.targetDate ? new Date(formData.targetDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          };
          await dispatch({ type: 'ADD_QUARTERLY_GOAL', payload: quarterlyGoal });
          break;

        case 'weekly':
          const weeklyTask: WeeklyTask = {
            ...baseGoal,
            quarterlyGoalId: '', // Could be enhanced to link to a quarterly goal
            priority: formData.priority,
            estimatedHours: 1,
            completed: false,
            status: 'todo',
            weekOf: new Date(),
            roadblocks: [],
            notes: formData.description || '',
          };
          await dispatch({ type: 'ADD_WEEKLY_TASK', payload: weeklyTask });
          break;
      }

      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.title.trim().length > 0 && !isSubmitting;

  return (
    <div className="quick-goal-form">
      <div className="form-header">
        <button className="back-btn" onClick={onBack} type="button">
          <ArrowLeft size={16} />
        </button>
        <h4>Create {goalType.charAt(0).toUpperCase() + goalType.slice(1)} Goal</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Goal Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter goal title..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your goal..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">Target Date</label>
            <input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleInputChange('targetDate', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!isValid}
          >
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

const GoalsTable: React.FC<GoalsTableProps> = ({ onNavigate }) => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedGoalType2, setSelectedGoalType2] = useState<'life' | 'annual' | 'quarterly' | 'weekly' | null>(null);

  const handleGoalTypeSelect = (type: string) => {
    setSelectedGoalType(type);
  };

  const handleBackToSelection = () => {
    setSelectedGoalType(null);
  };

  const handleGoalClick = (goalId: string, goalType: 'life' | 'annual' | 'quarterly' | 'weekly') => {
    setSelectedGoalId(goalId);
    setSelectedGoalType2(goalType);
  };

  const loadSampleData = () => {
    // Load sample data for demonstration
    sampleData.lifeGoals?.forEach(goal => {
      dispatch({ type: 'ADD_LIFE_GOAL', payload: goal });
    });
    sampleData.annualGoals.forEach(goal => {
      dispatch({ type: 'ADD_ANNUAL_GOAL', payload: goal });
    });
    sampleData.quarterlyGoals.forEach(goal => {
      dispatch({ type: 'ADD_QUARTERLY_GOAL', payload: goal });
    });
    sampleData.weeklyTasks.forEach(task => {
      dispatch({ type: 'ADD_WEEKLY_TASK', payload: task });
    });
  };

  // Create hierarchical goal structure
  const hierarchicalGoals = useMemo(() => {
    const lifeGoalsWithChildren = state.lifeGoals.map(lifeGoal => {
      // Find annual goals linked to this life goal
      const annualGoals = state.annualGoals
        .filter(annual => annual.lifeGoalId === lifeGoal.id)
        .map(annualGoal => {
          // Find quarterly goals linked to this annual goal
          const quarterlyGoals = state.quarterlyGoals
            .filter(quarterly => quarterly.annualGoalId === annualGoal.id)
            .map(quarterlyGoal => ({
              ...quarterlyGoal,
              goalType: 'quarterly' as const,
              level: 2,
              isExpanded: expandedRows.has(quarterlyGoal.id)
            }));

          return {
            ...annualGoal,
            goalType: 'annual' as const,
            level: 1,
            isExpanded: expandedRows.has(annualGoal.id),
            children: quarterlyGoals
          };
        });

      return {
        ...lifeGoal,
        goalType: 'life' as const,
        level: 0,
        isExpanded: expandedRows.has(lifeGoal.id),
        children: annualGoals
      };
    });

    return lifeGoalsWithChildren;
  }, [state.lifeGoals, state.annualGoals, state.quarterlyGoals, expandedRows]);

  // Flatten hierarchical structure for table display
  const flattenedGoals = useMemo(() => {
    const flattened: any[] = [];
    
    hierarchicalGoals.forEach(lifeGoal => {
      // Add life goal
      flattened.push({
        ...lifeGoal,
        goalType: 'life',
        status: lifeGoal.status,
        progress: lifeGoal.progress || 0,
        createdAt: lifeGoal.createdAt,
        targetDate: lifeGoal.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        level: 0,
        hasChildren: lifeGoal.children && lifeGoal.children.length > 0,
        isExpanded: expandedRows.has(lifeGoal.id)
      });

      // Add annual goals if life goal is expanded
      if (expandedRows.has(lifeGoal.id) && lifeGoal.children) {
        lifeGoal.children.forEach(annualGoal => {
          flattened.push({
            ...annualGoal,
            goalType: 'annual',
            status: annualGoal.status,
            progress: annualGoal.progress || 0,
            createdAt: annualGoal.createdAt,
            targetDate: annualGoal.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            level: 1,
            hasChildren: annualGoal.children && annualGoal.children.length > 0,
            isExpanded: expandedRows.has(annualGoal.id)
          });

          // Add quarterly goals if annual goal is expanded
          if (expandedRows.has(annualGoal.id) && annualGoal.children) {
            annualGoal.children.forEach(quarterlyGoal => {
              flattened.push({
                ...quarterlyGoal,
                goalType: 'quarterly',
                status: quarterlyGoal.status,
                progress: quarterlyGoal.progress || 0,
                createdAt: quarterlyGoal.createdAt,
                targetDate: quarterlyGoal.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                level: 2,
                hasChildren: false,
                isExpanded: false
              });
            });
          }
        });
      }
    });

    return flattened;
  }, [hierarchicalGoals, expandedRows]);

  // Apply search filter to flattened goals
  const filteredFlattenedGoals = useMemo(() => {
    if (!searchTerm) return flattenedGoals;
    
    return flattenedGoals.filter(goal =>
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedGoals, searchTerm]);

  // Auto-load sample data if no goals exist
  React.useEffect(() => {
    const totalGoals = state.lifeGoals.length + state.annualGoals.length + state.quarterlyGoals.length + state.weeklyTasks.length;
    if (totalGoals === 0) {
      loadSampleData();
    }
  }, [state.lifeGoals.length, state.annualGoals.length, state.quarterlyGoals.length, state.weeklyTasks.length]);

  // If viewing goal details, show the GoalDetails component
  if (selectedGoalId && selectedGoalType2) {
    return (
      <GoalDetails
        goalId={selectedGoalId}
        goalType={selectedGoalType2}
        onBack={() => {
          setSelectedGoalId(null);
          setSelectedGoalType2(null);
        }}
      />
    );
  }

  const getStatusDisplay = (goal: GoalItem) => {
    if (goal.status === 'completed') return { text: 'COMPLETED', color: 'completed' };
    if (goal.status === 'in-progress' && goal.progress >= 70) return { text: 'ON TRACK', color: 'on-track' };
    if (goal.status === 'in-progress' && goal.progress < 70) return { text: 'AT RISK', color: 'at-risk' };
    if (goal.status === 'not-started' || goal.status === 'on-hold') return { text: 'PENDING', color: 'pending' };
    return { text: 'ON TRACK', color: 'on-track' };
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 60) return '#f59e0b';
    if (progress >= 40) return '#ef4444';
    return '#6b7280';
  };

  const toggleRowExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getLastUpdated = (goal: GoalItem) => {
    const now = new Date();
    const created = new Date(goal.createdAt);
    const diffTime = now.getTime() - created.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    if (diffWeeks === 0) return 'This week';
    if (diffWeeks === 1) return '1 week ago';
    return `${diffWeeks} weeks ago`;
  };

  return (
    <div className="goals-table">
      {/* Header */}
      <div className="goals-header">
        <div className="header-left">
          <h1>Goals</h1>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create goal
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search goals"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="goals-table-view">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Target date</th>
              <th>Last updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredFlattenedGoals.map((goal) => {
              const status = getStatusDisplay(goal);
              const isExpanded = goal.isExpanded;
              const hasChildren = goal.hasChildren;
              
              return (
                <tr key={goal.id} className="goal-row" data-level={goal.level}>
                  <td className="name-cell">
                    <div className="name-content" style={{ paddingLeft: `${goal.level * 12}px` }}>
                      {hasChildren ? (
                        <button
                          className="expand-btn"
                          onClick={() => toggleRowExpansion(goal.id)}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      ) : goal.level > 0 ? (
                        <div className="expand-spacer"></div>
                      ) : null}
                      <div className="goal-status-icon">
                        {goal.status === 'completed' ? (
                          <CheckCircle size={16} className="status-completed" />
                        ) : goal.status === 'in-progress' ? (
                          <Circle size={16} className="status-in-progress" />
                        ) : (
                          <Clock size={16} className="status-pending" />
                        )}
                      </div>
                      <div className="goal-info">
                        <div 
                          className="goal-title clickable-goal-title" 
                          onClick={() => handleGoalClick(goal.id, goal.goalType)}
                        >
                          {goal.title}
                        </div>
                        <div className="goal-type">{goal.goalType.charAt(0).toUpperCase() + goal.goalType.slice(1)} Goal</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="progress-cell">
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${goal.progress || 0}%`,
                            backgroundColor: getProgressColor(goal.progress || 0)
                          }}
                        />
                      </div>
                      <span className="progress-text">{goal.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <Calendar size={16} />
                    {formatDate(goal.targetDate)}
                  </td>
                  <td className="updated-cell">
                    {getLastUpdated(goal)}
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredFlattenedGoals.length === 0 && (
        <div className="empty-state">
          <Target size={48} />
          <h3>No goals found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {/* Simple Create Goal Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Goal</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {selectedGoalType === null ? (
                <>
                  <p>Choose the type of goal you want to create:</p>
                  <div className="goal-type-buttons">
                    <button className="goal-type-btn" onClick={() => handleGoalTypeSelect('life')}>
                      <Heart size={20} />
                      Life Goal
                    </button>
                    <button className="goal-type-btn" onClick={() => handleGoalTypeSelect('annual')}>
                      <Target size={20} />
                      Annual Goal
                    </button>
                    <button className="goal-type-btn" onClick={() => handleGoalTypeSelect('quarterly')}>
                      <Calendar size={20} />
                      Quarterly Goal
                    </button>
                    <button className="goal-type-btn" onClick={() => handleGoalTypeSelect('weekly')}>
                      <CheckSquare size={20} />
                      Weekly Task
                    </button>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-outline" onClick={() => {
                      setShowCreateModal(false);
                      onNavigate?.('life-goals');
                    }}>
                      Go to Full Forms Instead
                    </button>
                  </div>
                </>
              ) : (
                <QuickGoalForm 
                  goalType={selectedGoalType as GoalType}
                  onBack={handleBackToSelection}
                  onClose={() => {
                    setShowCreateModal(false);
                    setSelectedGoalType(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsTable;
