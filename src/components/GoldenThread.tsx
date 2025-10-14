import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Target, Calendar, Zap, X, Maximize2, CheckSquare } from 'lucide-react';
import type { WeeklyTask, QuarterlyGoal, AnnualGoal, LifeGoal } from '../types';
import './GoldenThread.css';

interface GoldenThreadProps {
  taskId?: string;
  quarterlyGoalId?: string;
  annualGoalId?: string;
  lifeGoalId?: string;
  onClose: () => void;
  onNavigate?: (section: 'life-goals' | 'annual-plan' | 'quarterly-sprint' | 'weekly-review', id?: string) => void;
}

interface ThreadPath {
  task?: WeeklyTask;
  quarterlyGoal?: QuarterlyGoal;
  annualGoal?: AnnualGoal;
  lifeGoal?: LifeGoal;
}

const GoldenThread: React.FC<GoldenThreadProps> = ({ 
  taskId, 
  quarterlyGoalId, 
  annualGoalId, 
  lifeGoalId, 
  onClose,
  onNavigate 
}) => {
  const { state } = useApp();
  const [expandedLevel, setExpandedLevel] = useState<'task' | 'quarterly' | 'annual' | 'life' | null>(null);

  // Build the complete thread path
  const buildThreadPath = (): ThreadPath => {
    let path: ThreadPath = {};

    // Start with what we have and trace backwards/forwards
    if (taskId) {
      path.task = state.weeklyTasks.find(t => t.id === taskId);
      if (path.task) {
        path.quarterlyGoal = state.quarterlyGoals.find(q => q.id === path.task!.quarterlyGoalId);
      }
    }

    if (quarterlyGoalId || path.quarterlyGoal) {
      const qGoal = path.quarterlyGoal || state.quarterlyGoals.find(q => q.id === quarterlyGoalId);
      if (qGoal) {
        path.quarterlyGoal = qGoal;
        path.annualGoal = state.annualGoals.find(a => a.id === qGoal.annualGoalId);
      }
    }

    if (annualGoalId || path.annualGoal) {
      const aGoal = path.annualGoal || state.annualGoals.find(a => a.id === annualGoalId);
      if (aGoal) {
        path.annualGoal = aGoal;
        if (aGoal.lifeGoalId) {
          path.lifeGoal = state.lifeGoals.find(l => l.id === aGoal.lifeGoalId);
        }
      }
    }

    if (lifeGoalId || path.lifeGoal) {
      const lGoal = path.lifeGoal || state.lifeGoals.find(l => l.id === lifeGoalId);
      if (lGoal) {
        path.lifeGoal = lGoal;
      }
    }

    return path;
  };

  const threadPath = buildThreadPath();

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Creativity & Passion': '#e74c3c',
      'Mind': '#9b59b6',
      'Career': '#3498db',
      'Finance': '#f39c12',
      'Health': '#2ecc71',
      'Relationships': '#e91e63',
      'Spirit': '#9c27b0',
      'Community': '#ff9800',
      'Travel': '#00bcd4',
      'Giving Back': '#4caf50'
    };
    return colors[category || ''] || '#6c757d';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#2ecc71';
    if (progress >= 60) return '#f39c12';
    if (progress >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const handleNavigate = (section: 'life-goals' | 'annual-plan' | 'quarterly-sprint' | 'weekly-review', id?: string) => {
    if (onNavigate) {
      onNavigate(section, id);
    }
    onClose();
  };

  const ThreadLevel = ({ 
    title, 
    subtitle, 
    description, 
    progress, 
    category, 
    icon: Icon, 
    level,
    navigateSection,
    navigateId
  }: {
    title: string;
    subtitle?: string;
    description: string;
    progress?: number;
    category?: string;
    icon: React.ComponentType<any>;
    level: 'task' | 'quarterly' | 'annual' | 'life';
    navigateSection: 'life-goals' | 'annual-plan' | 'quarterly-sprint' | 'weekly-review';
    navigateId?: string;
  }) => {
    const isExpanded = expandedLevel === level;
    const categoryColor = getCategoryColor(category);

    return (
      <div className="thread-level">
        <div 
          className="thread-card"
          style={{ borderLeftColor: categoryColor }}
          onClick={() => setExpandedLevel(isExpanded ? null : level)}
        >
          <div className="thread-header">
            <div className="thread-icon" style={{ backgroundColor: categoryColor }}>
              <Icon size={16} />
            </div>
            <div className="thread-content">
              <div className="thread-title">{title}</div>
              {subtitle && <div className="thread-subtitle">{subtitle}</div>}
            </div>
            <div className="thread-actions">
              {progress !== undefined && (
                <div className="thread-progress">
                  <div 
                    className="thread-progress-bar"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: getProgressColor(progress)
                    }}
                  />
                  <span className="thread-progress-text">{progress}%</span>
                </div>
              )}
              <button
                className="thread-expand"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedLevel(isExpanded ? null : level);
                }}
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="thread-details">
              <p className="thread-description">{description}</p>
              <button
                className="thread-navigate"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(navigateSection, navigateId);
                }}
              >
                View in {navigateSection.replace('-', ' ')}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="golden-thread-overlay">
      <div className="golden-thread-modal">
        <div className="golden-thread-header">
          <div className="golden-thread-title">
            <Target className="golden-thread-icon" />
            <h2>Golden Thread</h2>
            <span className="golden-thread-subtitle">
              See how your work connects to your life vision
            </span>
          </div>
          <button className="golden-thread-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="golden-thread-content">
          <div className="thread-path">
            {/* Life Goal Level */}
            {threadPath.lifeGoal && (
              <>
                <ThreadLevel
                  title={threadPath.lifeGoal.title}
                  subtitle={`${threadPath.lifeGoal.category} • ${threadPath.lifeGoal.timeframe.replace('-', ' ')}`}
                  description={threadPath.lifeGoal.vision}
                  progress={threadPath.lifeGoal.progress}
                  category={threadPath.lifeGoal.category}
                  icon={Target}
                  level="life"
                  navigateSection="life-goals"
                  navigateId={threadPath.lifeGoal.id}
                />
                {threadPath.annualGoal && (
                  <div className="thread-connector">
                    <ArrowRight size={16} className="connector-arrow" />
                    <span className="connector-label">supports</span>
                  </div>
                )}
              </>
            )}

            {/* Annual Goal Level */}
            {threadPath.annualGoal && (
              <>
                <ThreadLevel
                  title={threadPath.annualGoal.title}
                  subtitle={`${threadPath.annualGoal.year} Annual Goal`}
                  description={threadPath.annualGoal.description}
                  progress={threadPath.annualGoal.progress}
                  category={threadPath.annualGoal.category}
                  icon={Calendar}
                  level="annual"
                  navigateSection="annual-plan"
                  navigateId={threadPath.annualGoal.id}
                />
                {threadPath.quarterlyGoal && (
                  <div className="thread-connector">
                    <ArrowRight size={16} className="connector-arrow" />
                    <span className="connector-label">breaks down to</span>
                  </div>
                )}
              </>
            )}

            {/* Quarterly Goal Level */}
            {threadPath.quarterlyGoal && (
              <>
                <ThreadLevel
                  title={threadPath.quarterlyGoal.title}
                  subtitle={`Q${threadPath.quarterlyGoal.quarter} ${threadPath.quarterlyGoal.year} OKR`}
                  description={threadPath.quarterlyGoal.description}
                  progress={threadPath.quarterlyGoal.progress}
                  category={threadPath.quarterlyGoal.category}
                  icon={Zap}
                  level="quarterly"
                  navigateSection="quarterly-sprint"
                  navigateId={threadPath.quarterlyGoal.id}
                />
                {threadPath.task && (
                  <div className="thread-connector">
                    <ArrowRight size={16} className="connector-arrow" />
                    <span className="connector-label">executed through</span>
                  </div>
                )}
              </>
            )}

            {/* Weekly Task Level */}
            {threadPath.task && (
              <ThreadLevel
                title={threadPath.task.title}
                subtitle={`${threadPath.task.estimatedHours}h estimated`}
                description={threadPath.task.description}
                progress={threadPath.task.completed ? 100 : 0}
                icon={CheckSquare}
                level="task"
                navigateSection="weekly-review"
                navigateId={threadPath.task.id}
              />
            )}
          </div>

          {/* Connection Summary */}
          <div className="thread-summary">
            <div className="summary-card">
              <h3>Why This Matters</h3>
              <p>
                {threadPath.task && threadPath.lifeGoal && (
                  <>
                    This task "{threadPath.task.title}" is a concrete step toward your life vision of 
                    "{threadPath.lifeGoal.vision}". Every action has purpose.
                  </>
                )}
                {threadPath.quarterlyGoal && threadPath.lifeGoal && !threadPath.task && (
                  <>
                    This quarterly goal "{threadPath.quarterlyGoal.title}" directly supports your life vision of 
                    "{threadPath.lifeGoal.vision}".
                  </>
                )}
                {threadPath.annualGoal && threadPath.lifeGoal && !threadPath.quarterlyGoal && (
                  <>
                    This annual goal "{threadPath.annualGoal.title}" is your pathway to achieving 
                    "{threadPath.lifeGoal.vision}".
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenThread;
