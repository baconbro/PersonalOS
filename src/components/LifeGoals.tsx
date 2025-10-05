import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../hooks/useRouter';
import { Target, Plus, Edit, Trash2, Heart, Brain, Briefcase, DollarSign, Activity, Users, Compass, Building, Plane, Gift, List, Grid, Share2 } from 'lucide-react';
import type { LifeGoal, LifeGoalCategory } from '../types';
import AIRefiner from './AIRefiner';
import { validateGoalTitle, validateGoalDescription, sanitizeText, logSecurityEvent } from '../utils/security';
import { usePageTitleSuffix } from '../utils/usePageTitle';
import { updateLifeGoalFromAnnualProgress, getRelatedAnnualGoals as getRelatedGoals } from '../utils/progressCalculation';
import './LifeGoals.css';

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
  'Creativity & Passion': '#e74c3c',
  'Mind': '#9b59b6',
  'Career': '#3498db',
  'Finance': '#f39c12',
  'Health': '#2ecc71',
  'Relationships': '#e91e63',
  'Spirit': '#9c27b0',
  'Community': '#ff9800',
  'Travel': '#00bcd4',
  'Giving Back': '#4caf50',
  'Other': '#6c757d'
};

const categoryDescriptions: Record<LifeGoalCategory, string> = {
  'Creativity & Passion': 'Self-expression, creation, ideas, inspiration, interests, innovation',
  'Mind': 'Learning, growing, studying, education, mental health',
  'Career': 'Professional development, job, vocation, skills, occupation',
  'Finance': 'Financial security, saving, investing, wealth',
  'Health': 'Physical well-being, fitness, nutrition, strength',
  'Relationships': 'Commitment, communication, intimacy, partnership(s)',
  'Spirit': 'Mindfulness, going inward, compassion, purpose, soul',
  'Community': 'Connection, shared values, family, friends, society',
  'Travel': 'Expanding horizons, exploring, adventure, discovery',
  'Giving Back': 'Charity, philanthropy, conserving the environment, empathy, advocacy',
  'Other': 'Personal goals that don\'t fit into other categories'
};

const LifeGoals: React.FC = () => {
  const { state, dispatch } = useApp();
  const { navigateTo } = useRouter();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LifeGoalCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'mindmap' | 'gallery'>('list');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vision: '',
    category: 'Career' as LifeGoalCategory,
    timeframe: 'five-year' as 'five-year' | 'ten-year' | 'lifetime',
    priority: 'high' as 'high' | 'medium' | 'low'
  });

  // Security validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [visionError, setVisionError] = useState('');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      vision: '',
      category: 'Career',
      timeframe: 'five-year',
      priority: 'high'
    });
    setIsAddingGoal(false);
    setEditingGoal(null);
  };

  const getRelatedAnnualGoals = (lifeGoalId: string) => {
    return getRelatedGoals(lifeGoalId, state.annualGoals);
  };

  const updateLifeGoalProgress = (lifeGoalId: string) => {
    const lifeGoal = state.lifeGoals.find(goal => goal.id === lifeGoalId);
    if (!lifeGoal) return;

    const updatedGoal = updateLifeGoalFromAnnualProgress(lifeGoal, state.annualGoals);
    
    if (updatedGoal) {
      dispatch({ type: 'UPDATE_LIFE_GOAL', payload: updatedGoal });
      console.log(`📈 Updated life goal "${lifeGoal.title}" progress to ${updatedGoal.progress}%`);
    }
  };

  // Update all life goal progress when annual goals change
  const updateAllLifeGoalProgress = () => {
    state.lifeGoals.forEach(lifeGoal => {
      updateLifeGoalProgress(lifeGoal.id);
    });
  };

  // Auto-update life goal progress when annual goals change or component mounts
  useEffect(() => {
    updateAllLifeGoalProgress();
  }, [state.annualGoals, state.lifeGoals]); // Re-run when annual goals or life goals change

  // Additional effect to ensure progress is calculated when component first loads
  useEffect(() => {
    // Run progress calculation when component mounts
    updateAllLifeGoalProgress();
  }, []); // Run once on mount

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setTitleError('');
    setDescriptionError('');
    setVisionError('');

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

    const visionValidation = validateGoalDescription(formData.vision); // Using same validation for vision
    if (!visionValidation.valid) {
      setVisionError(visionValidation.error || 'Invalid vision');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      // Sanitize inputs before submission
      const sanitizedData = {
        ...formData,
        title: sanitizeText(formData.title),
        description: sanitizeText(formData.description),
        vision: sanitizeText(formData.vision)
      };

      if (editingGoal) {
        // Update existing goal
        const updatedGoal: LifeGoal = {
          ...editingGoal,
          ...sanitizedData
        };
        dispatch({ type: 'UPDATE_LIFE_GOAL', payload: updatedGoal });
        logSecurityEvent('LIFE_GOAL_UPDATED', { goalId: editingGoal.id });
        setEditingGoal(null);
      } else {
        // Create new goal
        const newGoal: LifeGoal = {
          id: Date.now().toString(),
          type: 'life',
          ...sanitizedData,
          createdAt: new Date(),
          targetDate: new Date(new Date().getFullYear() + (sanitizedData.timeframe === 'five-year' ? 5 : sanitizedData.timeframe === 'ten-year' ? 10 : 50), 11, 31),
          progress: 0,
          status: 'not-started' as const,
          annualGoals: []
        };
        dispatch({ type: 'ADD_LIFE_GOAL', payload: newGoal });
        logSecurityEvent('LIFE_GOAL_CREATED', { category: sanitizedData.category });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        vision: '',
        category: 'Career' as LifeGoalCategory,
        timeframe: 'five-year' as 'five-year' | 'ten-year' | 'lifetime',
        priority: 'high' as 'high' | 'medium' | 'low'
      });
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Error saving life goal:', error);
      logSecurityEvent('LIFE_GOAL_SAVE_ERROR', { error: (error as Error).message });
    }
  };

  const handleEdit = (goal: LifeGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      vision: goal.vision,
      category: goal.category,
      timeframe: goal.timeframe,
      priority: goal.priority
    });
    setIsAddingGoal(true);
  };

  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const handleDelete = (goalId: string) => {
    // Prevent multiple simultaneous deletions
    if (deletingGoalId) {
      console.log('🛑 Already deleting a goal, ignoring duplicate call');
      return;
    }
    
    const goalToDelete = state.lifeGoals.find(goal => goal.id === goalId);
    if (confirm('Are you sure you want to delete this life goal? This will also remove its connection to annual goals.')) {
      setDeletingGoalId(goalId);
      console.log('🗑️ Starting deletion for goal:', goalId);
      
      // Create a special action that includes the activity log data
      const deleteAction = {
        type: 'DELETE_LIFE_GOAL' as const,
        payload: goalId,
        meta: goalToDelete ? {
          activityLog: {
            type: 'LIFE_GOAL_DELETED' as const,
            title: `Life goal "${goalToDelete.title}" deleted`,
            description: `Deleted life goal in ${goalToDelete.category} category`,
            entityId: goalId,
            entityType: 'life_goal' as const,
            metadata: {
              goalTitle: goalToDelete.title,
              category: goalToDelete.category,
              timeframe: goalToDelete.timeframe
            }
          }
        } : undefined
      };
      
      dispatch(deleteAction);
      
      // Reset the deletion flag after a short delay
      setTimeout(() => {
        setDeletingGoalId(null);
        console.log('✅ Deletion completed for goal:', goalId);
      }, 1000);
    }
  };

  const handleGoalClick = (goalId: string) => {
    navigateTo('goals-table', false, { goalType: 'life', goalId });
  };

  const getLifeGoalsByCategory = (category: LifeGoalCategory | 'All') => {
    if (category === 'All') {
      return state.lifeGoals;
    }
    return state.lifeGoals.filter(goal => goal.category === category);
  };

  const categories: LifeGoalCategory[] = [
    'Creativity & Passion', 'Mind', 'Career', 'Finance', 'Health',
    'Relationships', 'Spirit', 'Community', 'Travel', 'Giving Back'
  ];

  // Update page title with goal count
  const goalCount = state.lifeGoals.length;
  const filteredGoals = getLifeGoalsByCategory(selectedCategory);
  const titleSuffix = selectedCategory === 'All' 
    ? goalCount > 0 ? `(${goalCount} goals)` : ''
    : `(${filteredGoals.length}/${goalCount} goals)`;
  
  usePageTitleSuffix(titleSuffix);

  // Goal Detail Modal Component
  const GoalDetailModal = ({ goal }: { goal: LifeGoal }) => {
    const relatedAnnualGoals = getRelatedAnnualGoals(goal.id);
    
    return (
      <div className="goal-detail-modal" onClick={() => setSelectedGoalId(null)}>
        <div className="goal-detail-content" onClick={e => e.stopPropagation()}>
          <div className="goal-header">
            <div className="goal-info">
              <h3>{goal.title}</h3>
              <div className="goal-meta">
                <span className={`timeframe ${goal.timeframe}`}>
                  {goal.timeframe.replace('-', ' ').replace(/(\w+)-/g, '$1 ')}
                </span>
                <span className={`priority ${goal.priority}`}>
                  {goal.priority} priority
                </span>
              </div>
            </div>
            <div className="goal-actions">
              <button 
                className="action-btn edit"
                onClick={() => {
                  handleEdit(goal);
                  setSelectedGoalId(null);
                }}
                title="Edit goal"
              >
                <Edit size={16} />
              </button>
              <button 
                className="action-btn delete"
                onClick={() => {
                  handleDelete(goal.id);
                  setSelectedGoalId(null);
                }}
                title="Delete goal"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="vision-section">
            <h4>Vision</h4>
            <p>{goal.vision}</p>
          </div>

          <div className="description-section">
            <h4>Description</h4>
            <p>{goal.description}</p>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${goal.progress}%`,
                  backgroundColor: categoryColors[goal.category]
                }}
              />
            </div>
          </div>

          <div className="related-goals">
            <h4>Connected Annual Goals</h4>
            {relatedAnnualGoals.length > 0 ? (
              <div className="annual-goals-list">
                {relatedAnnualGoals.map(annualGoal => (
                  <div key={annualGoal.id} className="annual-goal-item">
                    <span className="annual-goal-title">{annualGoal.title}</span>
                    <span className="annual-goal-year">{annualGoal.year}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-annual-goals">No annual goals connected yet</p>
            )}
          </div>

          <AIRefiner
            type="life-goal"
            formData={{
              title: goal.title,
              description: goal.description,
              vision: goal.vision,
              category: goal.category,
              timeframe: goal.timeframe
            }}
            onRefinementApply={(refinements) => {
              const updatedGoal = {
                ...goal,
                title: refinements.title || goal.title,
                description: refinements.description || goal.description,
                vision: refinements.vision || goal.vision
              };
              dispatch({ type: 'UPDATE_LIFE_GOAL', payload: updatedGoal });
            }}
          />
        </div>
      </div>
    );
  };

  // Gallery View Component
  const GalleryView = ({ goals }: { goals: LifeGoal[] }) => (
    <div className="goals-gallery">
      {goals.map(goal => {
        const Icon = categoryIcons[goal.category];
        return (
          <div 
            key={goal.id} 
            className="gallery-card"
            style={{ borderColor: categoryColors[goal.category] }}
            onClick={() => handleGoalClick(goal.id)}
          >
            <div className="gallery-card-header">
              <Icon 
                size={20} 
                style={{ color: categoryColors[goal.category] }} 
              />
              <span className="gallery-category">{goal.category}</span>
            </div>
            <h3 className="gallery-title">{goal.title}</h3>
            <div className="gallery-progress">
              <div 
                className="gallery-progress-bar"
                style={{ 
                  width: `${goal.progress}%`,
                  backgroundColor: categoryColors[goal.category]
                }}
              />
              <span className="gallery-progress-text">{goal.progress}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Mind Map View Component
  const MindMapView = ({ goals }: { goals: LifeGoal[] }) => {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    return (
      <div className="mindmap-container">
        <svg width="800" height="600" className="mindmap-svg">
          {/* Central hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r="40"
            fill="#f0f9ff"
            stroke="#0ea5e9"
            strokeWidth="3"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            className="mindmap-center-text"
            fill="#0ea5e9"
            fontSize="12"
            fontWeight="bold"
          >
            Life Goals
          </text>
          
          {/* Goal nodes */}
          {goals.map((goal, index) => {
            const angle = (index * 2 * Math.PI) / goals.length;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const Icon = categoryIcons[goal.category];
            
            return (
              <g key={goal.id}>
                {/* Connection line */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={categoryColors[goal.category]}
                  strokeWidth="2"
                  opacity="0.6"
                />
                
                {/* Goal circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill="white"
                  stroke={categoryColors[goal.category]}
                  strokeWidth="3"
                  className="mindmap-goal-circle"
                  onClick={() => handleGoalClick(goal.id)}
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Goal title */}
                <text
                  x={x}
                  y={y - 45}
                  textAnchor="middle"
                  className="mindmap-goal-title"
                  fill={categoryColors[goal.category]}
                  fontSize="11"
                  fontWeight="600"
                  onClick={() => handleGoalClick(goal.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title}
                </text>
                
                {/* Category badge */}
                <foreignObject x={x - 12} y={y - 8} width="24" height="16">
                  <div 
                    style={{ 
                      color: categoryColors[goal.category],
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleGoalClick(goal.id)}
                  >
                    <Icon size={16} />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // List View Component
  const ListView = ({ goals }: { goals: LifeGoal[] }) => (
    <div className="goals-grid">
      {goals.map(goal => {
        const relatedAnnualGoals = getRelatedAnnualGoals(goal.id);
        
        return (
          <div 
            key={goal.id} 
            className="life-goal-card"
            onClick={() => handleGoalClick(goal.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="goal-header">
              <div className="goal-info">
                <h3>{goal.title}</h3>
                <div className="goal-meta">
                  <span className={`timeframe ${goal.timeframe}`}>
                    {goal.timeframe.replace('-', ' ').replace(/(\w+)-/g, '$1 ')}
                  </span>
                  <span className={`priority ${goal.priority}`}>
                    {goal.priority} priority
                  </span>
                </div>
              </div>
              <div className="goal-actions">
                <button 
                  className="action-btn edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(goal);
                  }}
                  title="Edit goal"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(goal.id);
                  }}
                  title="Delete goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="vision-section">
              <h4>Vision</h4>
              <p>{goal.vision}</p>
            </div>

            <div className="description-section">
              <h4>Description</h4>
              <p>{goal.description}</p>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${goal.progress}%`,
                    backgroundColor: categoryColors[goal.category]
                  }}
                />
              </div>
            </div>

            <div className="related-goals">
              <h4>Connected Annual Goals</h4>
              {relatedAnnualGoals.length > 0 ? (
                <div className="annual-goals-list">
                  {relatedAnnualGoals.map(annualGoal => (
                    <div key={annualGoal.id} className="annual-goal-item">
                      <span className="annual-goal-title">{annualGoal.title}</span>
                      <span className="annual-goal-year">{annualGoal.year}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-annual-goals">No annual goals connected yet</p>
              )}
            </div>

            <AIRefiner
              type="life-goal"
              formData={{
                title: goal.title,
                description: goal.description,
                vision: goal.vision,
                category: goal.category,
                timeframe: goal.timeframe
              }}
              onRefinementApply={(refinements) => {
                const updatedGoal = {
                  ...goal,
                  title: refinements.title || goal.title,
                  description: refinements.description || goal.description,
                  vision: refinements.vision || goal.vision
                };
                dispatch({ type: 'UPDATE_LIFE_GOAL', payload: updatedGoal });
              }}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="life-goals">
      <div className="life-goals-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <Target className="header-icon" />
              Life Goals
            </h1>
            <p className="header-description">
              Your long-term vision across all areas of life. These are your North Star goals that guide your annual planning and give meaning to your journey.
            </p>
          </div>
          <div className="header-actions">
            <div className="view-toggles">
              <button 
                className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={16} />
              </button>
              <button 
                className={`view-toggle ${viewMode === 'mindmap' ? 'active' : ''}`}
                onClick={() => setViewMode('mindmap')}
                title="Mind Map View"
              >
                <Share2 size={16} />
              </button>
              <button 
                className={`view-toggle ${viewMode === 'gallery' ? 'active' : ''}`}
                onClick={() => setViewMode('gallery')}
                title="Gallery View"
              >
                <Grid size={16} />
              </button>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setIsAddingGoal(true)}
            >
              <Plus size={20} />
              Add Life Goal
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
              style={{
                '--category-color': '#666'
              } as React.CSSProperties}
            >
              <Target size={16} />
              <span>All Life Goals</span>
              <span className="count">{state.lifeGoals.length}</span>
            </button>
            
            {categories.map(category => {
              const Icon = categoryIcons[category];
              const count = getLifeGoalsByCategory(category).length;
              return (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    '--category-color': categoryColors[category]
                  } as React.CSSProperties}
                >
                  <Icon size={16} />
                  <span>{category}</span>
                  {count > 0 && <span className="count">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAddingGoal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Life Goal' : 'Add Life Goal'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="goal-form">
              <div className="form-group">
                <label htmlFor="title">Goal Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Build a thriving creative business"
                  required
                />
                {titleError && <div className="error-message">{titleError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="vision">Vision Statement</label>
                <textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) => setFormData({...formData, vision: e.target.value})}
                  placeholder="Describe your long-term vision for this area of life..."
                  rows={3}
                  required
                />
                {visionError && <div className="error-message">{visionError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What does success look like? What impact do you want to make?"
                  rows={3}
                  required
                />
                {descriptionError && <div className="error-message">{descriptionError}</div>}
              </div>

              <AIRefiner
                type="life-goal"
                formData={formData}
                onRefinementApply={(refinements) => {
                  setFormData({
                    ...formData,
                    ...refinements
                  });
                }}
                className="ai-refiner-section"
              />

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as LifeGoalCategory})}
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timeframe">Timeframe</label>
                  <select
                    id="timeframe"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({...formData, timeframe: e.target.value as any})}
                    required
                  >
                    <option value="five-year">5 Years</option>
                    <option value="ten-year">10 Years</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    required
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Description */}
      {selectedCategory !== 'All' && (
        <div className="category-description">
          <div className="category-description-content">
            <div className="category-description-icon">
              {React.createElement(categoryIcons[selectedCategory as LifeGoalCategory], { 
                size: 24,
                style: { color: categoryColors[selectedCategory as LifeGoalCategory] }
              })}
            </div>
            <div className="category-description-text">
              <h3>{selectedCategory}</h3>
              <p>{categoryDescriptions[selectedCategory as LifeGoalCategory]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals Display - Conditional Views */}
      <div className="goals-display">
        {getLifeGoalsByCategory(selectedCategory).length === 0 ? (
          <div className="empty-state">
            {selectedCategory === 'All' ? (
              <>
                <div className="empty-icon">
                  <Target size={48} style={{ color: '#666', opacity: 0.3 }} />
                </div>
                <h3>No life goals yet</h3>
                <p>Start by creating your first life goal to define your long-term vision.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setIsAddingGoal(true)}
                >
                  <Plus size={16} />
                  Add Life Goal
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">
                  {React.createElement(categoryIcons[selectedCategory as LifeGoalCategory], { 
                    size: 48,
                    style: { color: categoryColors[selectedCategory as LifeGoalCategory], opacity: 0.3 }
                  })}
                </div>
                <h3>No {selectedCategory} goals yet</h3>
                <p>Start by creating a life goal in this category to define your long-term vision.</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setFormData({...formData, category: selectedCategory as LifeGoalCategory});
                    setIsAddingGoal(true);
                  }}
                >
                  <Plus size={16} />
                  Add {selectedCategory} Goal
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' && <ListView goals={getLifeGoalsByCategory(selectedCategory)} />}
            {viewMode === 'gallery' && <GalleryView goals={getLifeGoalsByCategory(selectedCategory)} />}
            {viewMode === 'mindmap' && <MindMapView goals={getLifeGoalsByCategory(selectedCategory)} />}
          </>
        )}
      </div>

      {/* Goal Detail Modal */}
      {selectedGoalId && (
        <GoalDetailModal 
          goal={state.lifeGoals.find(g => g.id === selectedGoalId)!} 
        />
      )}
    </div>
  );
};

export default LifeGoals;
