import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MarkdownText } from '../utils/markdown';
import { startOfWeek } from 'date-fns';
import './LifeArchitectureWizard.css';

interface WizardData {
  lifeGoal: string;
  annualGoal: string;
  quarterlyObjective: string;
  keyResults: string[];
  weeklyTasks: string[];
}

interface LifeArchitectureWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const LifeArchitectureWizard: React.FC<LifeArchitectureWizardProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    lifeGoal: '',
    annualGoal: '',
    quarterlyObjective: '',
    keyResults: ['', '', ''],
    weeklyTasks: ['', '', '']
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSteps = 6; // Including the final reveal

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = async () => {
    // Create the complete Golden Thread in the system
    try {
      // Add Life Goal
      const lifeGoalId = `life-${Date.now()}`;
      dispatch({
        type: 'ADD_LIFE_GOAL',
        payload: {
          id: lifeGoalId,
          type: 'life' as const,
          title: wizardData.lifeGoal,
          description: `Created through Life Architecture Wizard on ${new Date().toLocaleDateString()}. Please categorize this goal in the Life Goals section.`,
          vision: wizardData.lifeGoal,
          category: 'Other' as const,
          timeframe: 'five-year' as const,
          priority: 'high' as const,
          targetDate: new Date(new Date().getFullYear() + 5, 11, 31),
          status: 'not-started' as const,
          progress: 0,
          createdAt: new Date(),
          annualGoals: []
        }
      });

      // Add Annual Goal
      const annualGoalId = `annual-${Date.now()}`;
      dispatch({
        type: 'ADD_ANNUAL_GOAL',
        payload: {
          id: annualGoalId,
          type: 'annual' as const,
          title: wizardData.annualGoal,
          description: `Supporting Life Goal: ${wizardData.lifeGoal}`,
          category: 'Other',
          priority: 'high' as const,
          year: new Date().getFullYear(),
          lifeGoalId: lifeGoalId,
          status: 'in-progress' as const,
          progress: 0,
          createdAt: new Date(),
          targetDate: new Date(new Date().getFullYear(), 11, 31),
          quarterlyGoals: []
        }
      });

      // Add Quarterly Sprint
      const quarterlyGoalId = `quarterly-${Date.now()}`;
      const currentQuarter = Math.floor((new Date().getMonth()) / 3) + 1 as 1 | 2 | 3 | 4;
      dispatch({
        type: 'ADD_QUARTERLY_GOAL',
        payload: {
          id: quarterlyGoalId,
          type: 'quarterly' as const,
          title: wizardData.quarterlyObjective,
          description: `Supporting Annual Goal: ${wizardData.annualGoal}`,
          category: 'Other',
          priority: 'high' as const,
          keyResults: wizardData.keyResults.filter(kr => kr.trim() !== '').map((kr, index) => ({
            id: `kr-${Date.now()}-${index}`,
            description: kr,
            targetValue: 100,
            currentValue: 0,
            unit: 'percent',
            completed: false
          })),
          year: new Date().getFullYear(),
          quarter: currentQuarter,
          annualGoalId: annualGoalId,
          status: 'in-progress' as const,
          progress: 0,
          createdAt: new Date(),
          targetDate: new Date(new Date().getFullYear(), (currentQuarter * 3) - 1, 30),
          weeklyTasks: []
        }
      });

      // Add Weekly Tasks for this week
      const currentWeek = new Date();
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start, same as ThisWeekDashboard
      
      const validWeeklyTasks = wizardData.weeklyTasks.filter(task => task.trim() !== '');
      validWeeklyTasks.forEach((task, index) => {
        dispatch({
          type: 'ADD_WEEKLY_TASK',
          payload: {
            id: `task-${Date.now()}-${index}`,
            title: task,
            description: `Priority task from Life Architecture setup`,
            quarterlyGoalId: quarterlyGoalId,
            priority: 'high' as const,
            estimatedHours: 2,
            completed: false,
            status: 'todo' as const,
            weekOf: weekStart, // Use Monday-based week start
            roadblocks: [],
            notes: 'Created during onboarding wizard'
          }
        });
      });

      // Add Weekly Review with tasks
      dispatch({
        type: 'ADD_WEEKLY_REVIEW',
        payload: {
          id: `weekly-${Date.now()}`,
          weekOf: weekStart, // Use same week start
          completedTasks: [],
          roadblocks: [],
          learnings: [],
          nextWeekPriorities: validWeeklyTasks,
          lastWeekGoals: [],
          lastWeekResults: [],
          strategicCheckIn: 'Initial setup through Life Architecture Wizard',
          overallProgress: 10,
          energyLevel: 4 as const,
          satisfaction: 4 as const,
          notes: 'Started LifePeak journey with complete Golden Thread setup'
        }
      });

      // Close wizard and show success
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error creating Golden Thread:', error);
    }
  };

  const updateWizardData = (field: keyof WizardData, value: string | string[]) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: 'keyResults' | 'weeklyTasks', index: number, value: string) => {
    setWizardData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return wizardData.lifeGoal.trim() !== '';
      case 2: return wizardData.annualGoal.trim() !== '';
      case 3: return wizardData.quarterlyObjective.trim() !== '';
      case 4: return wizardData.keyResults.some(kr => kr.trim() !== '');
      case 5: return wizardData.weeklyTasks.some(task => task.trim() !== '');
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h1>Welcome to LifePeak</h1>
              <p className="wizard-subtitle">Before we build, let's lay the cornerstone.</p>
            </div>
            <div className="wizard-content">
              <h2>What is the ultimate vision for your life?</h2>
              <p className="wizard-prompt">
                Let's define your first Life Goal. Think 5-10 years out. What does an incredible life look like?
              </p>
              <div className="wizard-examples">
                <p>Examples to spark inspiration:</p>
                <ul>
                  <li>• Achieve Personal Sovereignty</li>
                  <li>• Build a lasting creative legacy</li>
                  <li>• Become financially independent</li>
                  <li>• Master the art of meaningful relationships</li>
                  <li>• Create impact through entrepreneurship</li>
                </ul>
              </div>
              <textarea
                value={wizardData.lifeGoal}
                onChange={(e) => updateWizardData('lifeGoal', e.target.value)}
                placeholder="My ultimate life vision is..."
                className="wizard-textarea"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h1>Making the Vision Concrete</h1>
              <p className="wizard-subtitle">Let's bridge the gap between dream and reality.</p>
            </div>
            <div className="wizard-content">
              <div className="connection-visual">
                <div className="life-goal-preview">
                  <MarkdownText>{wizardData.lifeGoal}</MarkdownText>
                </div>
                <div className="arrow-down">↓</div>
              </div>
              <h2>What's your Annual Flight Plan?</h2>
              <p className="wizard-prompt">
                To make '<strong>{wizardData.lifeGoal}</strong>' a reality, what is the single most important thing you need to accomplish in the next 12 months?
              </p>
              <textarea
                value={wizardData.annualGoal}
                onChange={(e) => updateWizardData('annualGoal', e.target.value)}
                placeholder="This year, I will..."
                className="wizard-textarea"
                autoFocus
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h1>Breaking It Down</h1>
              <p className="wizard-subtitle">A year is a long time. Let's focus on the next 90 days.</p>
            </div>
            <div className="wizard-content">
              <div className="connection-visual">
                <div className="annual-goal-preview">
                  <MarkdownText>{wizardData.annualGoal}</MarkdownText>
                </div>
                <div className="arrow-down">↓</div>
              </div>
              <h2>What's your Quarterly Objective?</h2>
              <p className="wizard-prompt">
                What is a key objective that will get you a significant part of the way towards your annual goal?
              </p>
              <textarea
                value={wizardData.quarterlyObjective}
                onChange={(e) => updateWizardData('quarterlyObjective', e.target.value)}
                placeholder="In the next 90 days, I will..."
                className="wizard-textarea"
                autoFocus
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h1>Make It Measurable</h1>
              <p className="wizard-subtitle">How will you know you're winning?</p>
            </div>
            <div className="wizard-content">
              <div className="connection-visual">
                <div className="quarterly-objective-preview">
                  <MarkdownText>{wizardData.quarterlyObjective}</MarkdownText>
                </div>
                <div className="arrow-down">↓</div>
              </div>
              <h2>Define Your Key Results</h2>
              <p className="wizard-prompt">
                Add 2-3 measurable outcomes that will prove you've achieved your objective.
              </p>
              {wizardData.keyResults.map((kr, index) => (
                <input
                  key={index}
                  type="text"
                  value={kr}
                  onChange={(e) => updateArrayField('keyResults', index, e.target.value)}
                  placeholder={`Key Result ${index + 1} (e.g., "Get 100 beta sign-ups")`}
                  className="wizard-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h1>Priming for Action</h1>
              <p className="wizard-subtitle">You have a vision, a plan, and an objective. Now, let's win this week.</p>
            </div>
            <div className="wizard-content">
              <h2>This Week's Priorities</h2>
              <p className="wizard-prompt">
                What are 1-3 small things you can do in the next 7 days to start making progress?
              </p>
              {wizardData.weeklyTasks.map((task, index) => (
                <input
                  key={index}
                  type="text"
                  value={task}
                  onChange={(e) => updateArrayField('weeklyTasks', index, e.target.value)}
                  placeholder={`Priority ${index + 1} (e.g., "Create landing page")`}
                  className="wizard-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="wizard-step wizard-final">
            <div className="wizard-header">
              <h1>🎉 Congratulations!</h1>
              <p className="wizard-subtitle">You've just built your first strategic thread.</p>
            </div>
            <div className="golden-thread-visualization">
              <div className="thread-level life-goal">
                <div className="thread-node">
                  <span className="thread-label">Life Goal (5-10 years)</span>
                  <div className="thread-content">
                    <MarkdownText>{wizardData.lifeGoal}</MarkdownText>
                  </div>
                </div>
              </div>
              <div className="thread-connection"></div>
              <div className="thread-level annual-goal">
                <div className="thread-node">
                  <span className="thread-label">Annual Flight Plan ({new Date().getFullYear()})</span>
                  <div className="thread-content">
                    <MarkdownText>{wizardData.annualGoal}</MarkdownText>
                  </div>
                </div>
              </div>
              <div className="thread-connection"></div>
              <div className="thread-level quarterly-objective">
                <div className="thread-node">
                  <span className="thread-label">Quarterly Objective (Q{Math.floor((new Date().getMonth()) / 3) + 1})</span>
                  <div className="thread-content">
                    <MarkdownText>{wizardData.quarterlyObjective}</MarkdownText>
                  </div>
                </div>
              </div>
              <div className="thread-connection"></div>
              <div className="thread-level weekly-tasks">
                <div className="thread-node">
                  <span className="thread-label">This Week's Priorities</span>
                  <div className="thread-content">
                    {wizardData.weeklyTasks.filter(task => task.trim() !== '').map((task, index) => (
                      <div key={index} className="weekly-task">
                        <MarkdownText>{task}</MarkdownText>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="wizard-completion-message">
              <p>This visual proof of your newly-architected plan is the foundation of your LifePeak. You now have clarity on how every weekly action connects to your ultimate life vision.</p>
              <p><strong>Ready to start building your extraordinary life?</strong></p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">
        <div className="wizard-background"></div>
        <div className={`wizard-content-wrapper ${isAnimating ? 'animating' : ''}`}>
          <div className="wizard-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">Step {currentStep} of {totalSteps}</span>
          </div>

          {renderStep()}

          <div className="wizard-actions">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="wizard-button primary"
              >
                {currentStep === 5 ? "Show Me My Golden Thread" : "Let's Do It"}
              </button>
            ) : null}
            {currentStep === totalSteps && (
              <button
                onClick={handleComplete}
                className="wizard-button primary completion"
              >
                Launch My LifePeak
              </button>
            )}
            <button onClick={onClose} className="wizard-button secondary">
              {currentStep === totalSteps ? "I'll Set This Up Later" : "Maybe Later"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeArchitectureWizard;
