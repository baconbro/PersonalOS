import { useApp } from '../context/AppContext';
import { TrendingUp, Target, Calendar, CheckSquare, Clock, Star, GitBranch, Heart } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { DashboardStats } from '../types';
import GoalTree from './GoalTree';
import CheckInModal from './CheckInModal';
import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { state } = useApp();
  const [showGoalTree, setShowGoalTree] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Balance Wheel Data Calculation
  const calculateBalanceWheelData = () => {
    const categories = [
      'Creativity & Passion', 'Mind', 'Career', 'Finance', 
      'Health', 'Relationships', 'Spirit', 'Community', 
      'Travel', 'Giving Back'
    ];
    
    return categories.map(category => {
      // Find life goals in this category
      const categoryGoals = state.lifeGoals.filter(goal => goal.category === category);
      
      // Calculate effort (number of goals in this category / total goals * 100)
      const effort = state.lifeGoals.length > 0 ? 
        (categoryGoals.length / state.lifeGoals.length) * 100 : 0;
      
      // Calculate progress (average progress of goals in this category)
      const progress = categoryGoals.length > 0 ? 
        categoryGoals.reduce((sum, goal) => sum + goal.progress, 0) / categoryGoals.length : 0;
      
      return {
        category: category.replace(' & ', ' &\n'), // Line break for better display
        effort: Math.round(effort),
        progress: Math.round(progress),
        goalCount: categoryGoals.length
      };
    }).filter(item => item.effort > 0 || item.progress > 0); // Only show categories with data
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
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
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

        <div 
          className="card"
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            border: '2px solid #2f855a',
            color: 'white'
          }}
          onClick={() => {
            // For now, just show a message. In a router-based app, this would navigate
            alert('Weekly Command Huddle feature! Navigate to "This Week" tab to experience the full Weekly Huddle.');
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <CheckSquare size={20} />
            This Week Command Center
          </div>
          <div className="card-content">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {stats.weeklyTasksCompleted}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              Tasks Completed • Click for Weekly Huddle
            </div>
          </div>
        </div>

        <div 
          className="card"
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            border: '2px solid #e53e3e',
            color: 'white'
          }}
          onClick={() => setShowCheckInModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Heart size={20} />
            Check-In
          </div>
          <div className="card-content">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {state.checkIns.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              Today's Check-ins • Log your energy & focus
            </div>
          </div>
        </div>
      </div>

      {/* Goal Tree Overview Card */}
      <div style={{ marginBottom: '2rem' }}>
        <div 
          className="card"
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            border: '2px solid #f59e0b',
            color: '#7c2d12'
          }}
          onClick={() => setShowGoalTree(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="card-title" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#7c2d12'
          }}>
            <GitBranch size={32} />
            <span>🌟 Open Goal Tree Overview</span>
          </div>
          <div className="card-content" style={{ textAlign: 'center' }}>
            <p style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1rem', 
              color: '#92400e',
              lineHeight: 1.6
            }}>
              See the complete hierarchy of your goals and tasks. Explore how every action connects 
              to your life vision in an interactive tree view.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              flexWrap: 'wrap',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              <span>📍 {state.lifeGoals.length} Life Goals</span>
              <span>🎯 {state.annualGoals.length} Annual Goals</span>
              <span>📅 {state.quarterlyGoals.length} Quarterly OKRs</span>
              <span>✅ {state.weeklyTasks.length} Tasks</span>
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

      {/* Balance Wheel - Life Goals Overview */}
      {state.lifeGoals.length > 0 ? (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-title" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <Target size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Life Balance Wheel</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                Your effort and progress across life pillars for holistic growth
              </p>
            </div>
          </div>
          
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={calculateBalanceWheelData()}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                />
                <Radar
                  name="Effort (Goal Count %)"
                  dataKey="effort"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Progress %"
                  dataKey="progress"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem', 
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#8b5cf6', 
                borderRadius: '2px' 
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Effort Distribution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#10b981', 
                borderRadius: '2px' 
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Progress Achievement</span>
            </div>
          </div>
          
          {/* Balance Insights */}
          <div style={{ 
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1rem' }}>
              🎯 Balance Insights
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              fontSize: '0.875rem'
            }}>
              {(() => {
                const data = calculateBalanceWheelData();
                const totalGoals = state.lifeGoals.length;
                const avgProgress = data.length > 0 ? 
                  Math.round(data.reduce((sum, item) => sum + item.progress, 0) / data.length) : 0;
                const mostFocusedArea = data.length > 0 ? 
                  data.reduce((max, item) => item.effort > max.effort ? item : max, data[0]) : null;
                
                return (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {totalGoals}
                      </div>
                      <div style={{ color: '#6b7280' }}>Total Life Goals</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        {avgProgress}%
                      </div>
                      <div style={{ color: '#6b7280' }}>Average Progress</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                        {data.length}
                      </div>
                      <div style={{ color: '#6b7280' }}>Active Pillars</div>
                    </div>
                    {mostFocusedArea && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#f59e0b' }}>
                          {mostFocusedArea.category.replace('\n', ' ')}
                        </div>
                        <div style={{ color: '#6b7280' }}>Most Focused Area</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '2px dashed #0ea5e9',
          textAlign: 'center',
          padding: '3rem 2rem',
          marginBottom: '2rem'
        }}>
          <Target size={48} style={{ color: '#0ea5e9', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 1rem 0', color: '#0c4a6e', fontSize: '1.5rem' }}>
            Create Your Life Vision
          </h3>
          <p style={{ 
            margin: '0 0 2rem 0', 
            color: '#075985', 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Start by defining your life goals across different pillars. Your Balance Wheel will appear here 
            to help you visualize and maintain holistic growth across all areas of your life.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            color: '#0369a1'
          }}>
            <span>🎨 Creativity</span>
            <span>🧠 Mind</span>
            <span>💼 Career</span>
            <span>💰 Finance</span>
            <span>🏃‍♂️ Health</span>
            <span>❤️ Relationships</span>
            <span>🙏 Spirit</span>
            <span>🌍 Community</span>
          </div>
        </div>
      )}

      {/* Goal Tree Modal */}
      <GoalTree 
        isOpen={showGoalTree}
        onClose={() => setShowGoalTree(false)}
      />
      
      {/* Check-In Modal */}
      <CheckInModal 
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
      />
    </div>
  );
}

export default Dashboard;
