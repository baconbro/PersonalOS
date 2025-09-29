import { useState, useEffect } from 'react';
import { RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { taskRolloverService } from '../services/taskRolloverService';
import { getIncompleteTasksForWeek, shouldPerformRollover, getPreviousWeek } from '../utils/taskRollover';
import './TaskRolloverStatus.css';

interface TaskRolloverStatusProps {
  showInDashboard?: boolean;
}

export function TaskRolloverStatus({ showInDashboard = false }: TaskRolloverStatusProps) {
  const { state, logActivity, createActivityLog } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [lastRolloverCheck, setLastRolloverCheck] = useState<Date | null>(null);
  const [showRolloverSuccess, setShowRolloverSuccess] = useState(false);

  // Get rollover statistics
  const rolloverStats = taskRolloverService.getRolloverStats(state.weeklyTasks);
  const previousWeek = getPreviousWeek();
  const incompleteTasksFromPrevWeek = getIncompleteTasksForWeek(state.weeklyTasks, previousWeek);
  const shouldShowRolloverPrompt = shouldPerformRollover() && incompleteTasksFromPrevWeek.length > 0;

  useEffect(() => {
    setLastRolloverCheck(new Date());
    
    // Check if any tasks were recently rolled over (within last 5 minutes)
    const recentRollovers = state.weeklyTasks.filter(task => 
      task.id.startsWith('rollover-') && 
      task.notes?.includes('[Rolled over from previous week]')
    );
    
    if (recentRollovers.length > 0) {
      setShowRolloverSuccess(true);
      // Hide success message after 10 seconds
      setTimeout(() => setShowRolloverSuccess(false), 10000);
    }
  }, [state.weeklyTasks]);

  const handleManualRollover = async () => {
    setIsLoading(true);
    
    try {
      // Check for incomplete tasks before rollover
      const incompleteTasks = getIncompleteTasksForWeek(state.weeklyTasks, getPreviousWeek());
      
      await taskRolloverService.checkAndPerformRollover(state.weeklyTasks);
      
      // Show success notification if tasks were rolled over
      if (incompleteTasks.length > 0) {
        setShowRolloverSuccess(true);
        setTimeout(() => setShowRolloverSuccess(false), 8000);
      }
      
      // Log manual rollover activity
      const activityLog = createActivityLog(
        'SYSTEM_ROLLOVER',
        'Manual task rollover triggered',
        `User manually triggered rollover - ${incompleteTasks.length} tasks processed`,
        undefined,
        'system', 
        { manualTrigger: true, taskCount: incompleteTasks.length, timestamp: new Date() }
      );
      logActivity(activityLog);
      
    } catch (error) {
      console.error('Manual rollover failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showInDashboard && !shouldShowRolloverPrompt && rolloverStats.totalTasks === 0) {
    return null; // Don't show anything if no rollover needed and no rollover tasks exist
  }

  return (
    <div className={`task-rollover-status ${showInDashboard ? 'dashboard-style' : 'standalone-style'}`}>
      {/* Rollover Success Notification */}
      {showRolloverSuccess && (
        <div className="rollover-success">
          <div className="success-header">
            <CheckCircle size={20} className="success-icon" />
            <h4>Tasks Rolled Over Successfully!</h4>
          </div>
          <p>
            Incomplete tasks from last week have been automatically moved to this week.
          </p>
        </div>
      )}

      {/* Rollover Prompt */}
      {shouldShowRolloverPrompt && (
        <div className="rollover-prompt">
          <div className="prompt-header">
            <AlertCircle size={20} className="prompt-icon" />
            <h4>Incomplete Tasks from Last Week</h4>
          </div>
          <p>
            You have {incompleteTasksFromPrevWeek.length} task{incompleteTasksFromPrevWeek.length === 1 ? '' : 's'} 
            {' '}from last week that {incompleteTasksFromPrevWeek.length === 1 ? 'is' : 'are'} not completed.
          </p>
          <button 
            className="rollover-button"
            onClick={handleManualRollover}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spinning" />
                Rolling over...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Roll over to this week
              </>
            )}
          </button>
        </div>
      )}

      {/* Rollover Statistics (only show if not in dashboard mode or if there are stats to show) */}
      {(!showInDashboard || rolloverStats.totalTasks > 0) && (
        <div className="rollover-stats">
          <div className="stats-header">
            <Clock size={18} />
            <span>Task Rollover Status</span>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Rolled Over Tasks</span>
              <span className="stat-value">{rolloverStats.totalTasks}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Completed</span>
              <span className="stat-value success">{rolloverStats.completedTasks}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Remaining</span>
              <span className="stat-value warning">{rolloverStats.incompleteTasks}</span>
            </div>
            
            {rolloverStats.totalTasks > 0 && (
              <div className="stat-item">
                <span className="stat-label">Success Rate</span>
                <span className="stat-value">
                  {Math.round((rolloverStats.completedTasks / rolloverStats.totalTasks) * 100)}%
                </span>
              </div>
            )}
          </div>

          {lastRolloverCheck && (
            <div className="last-check">
              <small>
                Last checked: {lastRolloverCheck.toLocaleTimeString()}
              </small>
            </div>
          )}
        </div>
      )}

      {/* Manual Rollover Button (always show if there are stats or it's not dashboard mode) */}
      {(!showInDashboard || rolloverStats.totalTasks > 0 || incompleteTasksFromPrevWeek.length > 0) && (
        <div className="manual-controls">
          <button 
            className={`manual-rollover-button ${showInDashboard ? 'dashboard-style' : ''}`}
            onClick={handleManualRollover}
            disabled={isLoading}
            title="Manually check and perform rollover of incomplete tasks"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spinning" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                {showInDashboard ? 'Check Rollover' : 'Check for Rollover'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
