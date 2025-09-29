import { useState, useEffect } from 'react';
import { Settings, RefreshCw, TestTube, Info, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { taskRolloverService } from '../services/taskRolloverService';
import { createTestTasksForRollover } from '../utils/testRollover';
import { performTaskRollover } from '../utils/taskRollover';
import './TaskRolloverSettings.css';

export function TaskRolloverSettings() {
  const { state, dispatch, logActivity, createActivityLog } = useApp();
  const [isTestingRollover, setIsTestingRollover] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [rolloverEnabled, setRolloverEnabled] = useState(true);

  // Get current rollover statistics
  const rolloverStats = taskRolloverService.getRolloverStats(state.weeklyTasks);

  useEffect(() => {
    // Load rollover settings from localStorage
    const savedSettings = localStorage.getItem('taskRolloverSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setRolloverEnabled(settings.enabled !== false);
    }
  }, []);

  const saveSettings = (enabled: boolean) => {
    setRolloverEnabled(enabled);
    localStorage.setItem('taskRolloverSettings', JSON.stringify({ enabled }));
  };

  const handleTestRollover = async () => {
    setIsTestingRollover(true);
    setTestResults(null);

    try {
      // Create test tasks
      const testTasks = createTestTasksForRollover();
      
      // Test rollover logic
      const result = performTaskRollover([...state.weeklyTasks, ...testTasks]);
      
      if (result.shouldRollover && result.rolledOverTasks.length > 0) {
        // Actually add the test tasks to simulate rollover
        result.rolledOverTasks.forEach(task => {
          dispatch({ type: 'ADD_WEEKLY_TASK', payload: task });
        });

        setTestResults(`✅ Successfully rolled over ${result.rolledOverTasks.length} test task${result.rolledOverTasks.length === 1 ? '' : 's'}`);
        
        // Log test activity
        const activityLog = createActivityLog(
          'SYSTEM_ROLLOVER',
          'Test rollover completed',
          `Tested rollover functionality with ${result.rolledOverTasks.length} tasks`,
          undefined,
          'system',
          { testMode: true, taskCount: result.rolledOverTasks.length }
        );
        logActivity(activityLog);
      } else {
        setTestResults('ℹ️ No rollover needed - all test conditions passed');
      }
    } catch (error) {
      console.error('Test rollover failed:', error);
      setTestResults('❌ Test failed - check console for details');
    } finally {
      setIsTestingRollover(false);
    }
  };

  const handleManualRollover = async () => {
    try {
      await taskRolloverService.checkAndPerformRollover(state.weeklyTasks);
      setTestResults('✅ Manual rollover check completed');
    } catch (error) {
      console.error('Manual rollover failed:', error);
      setTestResults('❌ Manual rollover failed - check console for details');
    }
  };

  return (
    <div className="task-rollover-settings">
      <div className="settings-header">
        <h1>
          <Settings size={28} />
          Task Rollover Settings
        </h1>
        <p>Configure and test automatic task rollover functionality</p>
      </div>

      {/* Settings Controls */}
      <div className="settings-section">
        <h2>Configuration</h2>
        <div className="setting-item">
          <div className="setting-info">
            <h3>Automatic Rollover</h3>
            <p>Automatically move incomplete tasks from previous week to current week on Monday mornings (6-10 AM)</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={rolloverEnabled}
              onChange={(e) => saveSettings(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Statistics */}
      <div className="settings-section">
        <h2>Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <RefreshCw size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{rolloverStats.totalTasks}</div>
              <div className="stat-label">Total Rolled Over</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{rolloverStats.completedTasks}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{rolloverStats.incompleteTasks}</div>
              <div className="stat-label">Still Pending</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Info size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{rolloverStats.rolloverRate.toFixed(1)}%</div>
              <div className="stat-label">Rollover Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Tools */}
      <div className="settings-section">
        <h2>Testing & Manual Controls</h2>
        <div className="test-controls">
          <button
            className="test-button"
            onClick={handleTestRollover}
            disabled={isTestingRollover}
          >
            {isTestingRollover ? (
              <>
                <RefreshCw size={20} className="spinning" />
                Running Test...
              </>
            ) : (
              <>
                <TestTube size={20} />
                Test Rollover
              </>
            )}
          </button>
          
          <button
            className="manual-button"
            onClick={handleManualRollover}
          >
            <RefreshCw size={20} />
            Manual Rollover Check
          </button>
        </div>

        {testResults && (
          <div className="test-results">
            <p>{testResults}</p>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="settings-section">
        <h2>How It Works</h2>
        <div className="info-content">
          <div className="info-item">
            <h4>📅 When:</h4>
            <p>Monday mornings between 6:00 AM and 10:00 AM</p>
          </div>
          
          <div className="info-item">
            <h4>🎯 What:</h4>
            <p>Incomplete tasks from the previous week (status: 'todo' or 'in-progress')</p>
          </div>
          
          <div className="info-item">
            <h4>🔄 How:</h4>
            <p>Tasks are duplicated with new IDs, moved to current week, and marked with rollover notes</p>
          </div>
          
          <div className="info-item">
            <h4>⚡ Status:</h4>
            <p>Task status is preserved to maintain progress state</p>
          </div>
        </div>
      </div>
    </div>
  );
}
