import { useApp } from '../context/AppContext';
import { TrendingUp, Target, Calendar, CheckSquare, Clock, Star, Upload } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { loadSampleData } from '../utils/sampleData';
import type { DashboardStats } from '../types';

function Dashboard() {
  const { state, dispatch } = useApp();

  // Debug function to check state and localStorage
  const debugState = () => {
    console.log('Current state:', state);
    console.log('localStorage:', localStorage.getItem('personal-os-data'));
    console.log('Annual goals count:', state.annualGoals.length);
    console.log('Quarterly goals count:', state.quarterlyGoals.length);
    console.log('Weekly tasks count:', state.weeklyTasks.length);
    alert(`Goals: ${state.annualGoals.length} annual, ${state.quarterlyGoals.length} quarterly, ${state.weeklyTasks.length} tasks`);
  };

  // Manual save function
  const forceSave = () => {
    try {
      localStorage.setItem('personal-os-data', JSON.stringify(state));
      alert('Data saved successfully to localStorage!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data!');
    }
  };

  // Clear all data function
  const clearAllData = () => {
    if (confirm('This will delete ALL your data. Are you sure?')) {
      localStorage.removeItem('personal-os-data');
      dispatch({ type: 'LOAD_STATE', payload: {
        annualGoals: [],
        quarterlyGoals: [],
        weeklyTasks: [],
        weeklyReviews: [],
        lifeGoals: [],
        currentYear: new Date().getFullYear(),
        currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4,
      }});
      alert('All data cleared!');
    }
  };

  const handleLoadSampleData = () => {
    if (confirm('This will replace your current data with sample data. Are you sure?')) {
      const sampleData = loadSampleData();
      if (sampleData) {
        dispatch({ type: 'LOAD_STATE', payload: sampleData });
      }
    }
  };

  // Helper function to ensure date is a Date object
  const ensureDate = (date: Date | string): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  };

  const calculateStats = (): DashboardStats => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const thisWeekTasks = state.weeklyTasks.filter(task =>
      isWithinInterval(ensureDate(task.weekOf), { start: currentWeekStart, end: currentWeekEnd })
    );

    const completedThisWeek = thisWeekTasks.filter(task => task.completed).length;
    
    // Calculate overall progress
    const totalGoals = state.annualGoals.length + state.quarterlyGoals.length;
    const totalProgress = totalGoals > 0 
      ? (state.annualGoals.reduce((sum, goal) => sum + goal.progress, 0) +
         state.quarterlyGoals.reduce((sum, goal) => sum + goal.progress, 0)) / totalGoals
      : 0;

    // Calculate current streak (consecutive weeks with reviews)
    let streak = 0;
    const sortedReviews = state.weeklyReviews.sort((a, b) => ensureDate(b.weekOf).getTime() - ensureDate(a.weekOf).getTime());
    for (let i = 0; i < sortedReviews.length; i++) {
      const weeksDiff = Math.floor((new Date().getTime() - ensureDate(sortedReviews[i].weekOf).getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalAnnualGoals: state.annualGoals.length,
      completedAnnualGoals: state.annualGoals.filter(goal => goal.status === 'completed').length,
      activeQuarterlyGoals: state.quarterlyGoals.filter(goal => 
        goal.status === 'in-progress' && 
        goal.quarter === state.currentQuarter &&
        goal.year === state.currentYear
      ).length,
      weeklyTasksCompleted: completedThisWeek,
      overallProgress: Math.round(totalProgress),
      currentStreak: streak,
      lastReviewDate: sortedReviews.length > 0 ? ensureDate(sortedReviews[0].weekOf) : null,
    };
  };

  const stats = calculateStats();
  const currentQuarterGoals = state.quarterlyGoals.filter(goal => 
    goal.quarter === state.currentQuarter && goal.year === state.currentYear
  );

  const recentTasks = state.weeklyTasks
    .filter(task => {
      const daysDiff = (new Date().getTime() - ensureDate(task.weekOf).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 14; // Last 2 weeks
    })
    .sort((a, b) => ensureDate(b.weekOf).getTime() - ensureDate(a.weekOf).getTime())
    .slice(0, 5);

  return (
    <div className="component-container">
      <div className="component-title">
        <TrendingUp size={32} />
        Strategic Dashboard
      </div>
      <p className="component-description">
        Your command center for tracking progress across your 5-year marathon. 
        Monitor annual flight plans, quarterly sprints, and weekly execution.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} />
            Annual Goals
          </div>
          <div className="card-content">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {stats.completedAnnualGoals}/{stats.totalAnnualGoals}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {stats.totalAnnualGoals > 0 
                ? `${Math.round((stats.completedAnnualGoals / stats.totalAnnualGoals) * 100)}% Complete`
                : 'No goals set'
              }
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            Q{state.currentQuarter} Sprint
          </div>
          <div className="card-content">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#764ba2' }}>
              {stats.activeQuarterlyGoals}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Active OKRs
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={20} />
            This Week
          </div>
          <div className="card-content">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#48bb78' }}>
              {stats.weeklyTasksCompleted}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Tasks Completed
            </div>
          </div>
        </div>
      </div>

      {/* Progress and Streak */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-title">Overall Progress</div>
          <div className="card-content">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontWeight: 'bold' }}>
              {stats.overallProgress}%
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} />
            Review Streak
          </div>
          <div className="card-content">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f6ad55' }}>
              {stats.currentStreak}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Consecutive weeks
            </div>
            {stats.lastReviewDate && (
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                Last review: {format(stats.lastReviewDate, 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Quarter Goals */}
      {currentQuarterGoals.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            Current Quarter Goals (Q{state.currentQuarter} {state.currentYear})
          </h3>
          <div className="grid grid-2">
            {currentQuarterGoals.map(goal => (
              <div key={goal.id} className="card">
                <div className="card-title">{goal.title}</div>
                <div className="card-content">
                  <p style={{ marginBottom: '1rem' }}>{goal.description}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <span>Progress: {goal.progress}%</span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      backgroundColor: goal.status === 'completed' ? '#c6f6d5' : 
                                     goal.status === 'in-progress' ? '#fed7d7' : '#e2e8f0',
                      color: goal.status === 'completed' ? '#2f855a' : 
                             goal.status === 'in-progress' ? '#c53030' : '#4a5568'
                    }}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      {recentTasks.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Recent Tasks</h3>
          <div className="card">
            <div className="card-content">
              {recentTasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Week of {format(task.weekOf, 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    {task.completed ? (
                      <span style={{ color: '#48bb78' }}>✓ Completed</span>
                    ) : (
                      <span style={{ color: '#f56565' }}>Pending</span>
                    )}
                    <Clock size={16} />
                    <span>{task.estimatedHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Message */}
      {stats.totalAnnualGoals === 0 && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Welcome to Personal OS! 🚀
          </div>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Start your strategic journey by setting up your annual flight plan. 
            Define 2-3 high-level goals that will drive your next year.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <span style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              1. Set Annual Goals
            </span>
            <span style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              2. Break into Quarters
            </span>
            <span style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              3. Execute Weekly
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn"
              onClick={handleLoadSampleData}
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Upload size={16} />
              Load Sample Data
            </button>
            <button
              onClick={debugState}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#805ad5',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Debug State
            </button>
            <button
              onClick={forceSave}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#38a169',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Force Save
            </button>
            <button
              onClick={clearAllData}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
