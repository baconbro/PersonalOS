import { useState } from 'react';
import { Calendar, Target, CheckCircle, Heart, Star, TrendingUp, Clock, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useRouter } from '../hooks/useRouter';
import CheckInModal from './CheckInModal';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

function Dashboard() {
  const { state } = useApp();
  const { navigateTo } = useRouter();
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Helper function to ensure date is a Date object
  const ensureDate = (date: Date | string): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  };
  const calculateStats = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    const thisWeekTasks = state.weeklyTasks.filter(task => {
      const taskWeek = ensureDate(task.weekOf);
      return taskWeek >= weekStart;
    });

    const completedThisWeek = thisWeekTasks.filter(task => task.completed).length;
    const weekProgress = thisWeekTasks.length > 0 ? Math.round((completedThisWeek / thisWeekTasks.length) * 100) : 0;

    const totalGoals = state.lifeGoals.length + state.annualGoals.length + state.quarterlyGoals.length;
    const completedGoals = [
      ...state.lifeGoals.filter(g => g.status === 'completed'),
      ...state.annualGoals.filter(g => g.status === 'completed'),
      ...state.quarterlyGoals.filter(g => g.status === 'completed')
    ].length;
    const activeGoals = totalGoals - completedGoals;

    const completedTasks = state.weeklyTasks.filter(task => task.completed).length;
    const totalTasks = state.weeklyTasks.length;
    const pendingTasks = totalTasks - completedTasks;

    const completedAnnualGoals = state.annualGoals.filter(g => g.status === 'completed').length;
    const totalAnnualGoals = state.annualGoals.length;
    const activeQuarterlyGoals = state.quarterlyGoals.filter(g => g.status === 'in-progress').length;

    // Calculate overall progress based on actual progress values, not just completion status
    const allGoals = [...state.lifeGoals, ...state.annualGoals, ...state.quarterlyGoals];
    const totalProgressSum = allGoals.reduce((sum, goal) => sum + goal.progress, 0);
    const overallProgress = totalGoals > 0 ? Math.round(totalProgressSum / totalGoals) : 0;
    
    // Debug logging to understand progress calculation
    console.log('Progress Debug:', {
      totalGoals,
      lifeGoalsCount: state.lifeGoals.length,
      annualGoalsCount: state.annualGoals.length,
      quarterlyGoalsCount: state.quarterlyGoals.length,
      lifeGoalsProgress: state.lifeGoals.map(g => ({ title: g.title, progress: g.progress })),
      annualGoalsProgress: state.annualGoals.map(g => ({ title: g.title, progress: g.progress })),
      quarterlyGoalsProgress: state.quarterlyGoals.map(g => ({ title: g.title, progress: g.progress })),
      totalProgressSum,
      overallProgress
    });

    // Calculate streak
    const reviews = state.weeklyReviews || [];
    const sortedReviews = reviews.sort((a, b) => ensureDate(b.weekOf).getTime() - ensureDate(a.weekOf).getTime());
    
    let currentStreak = 0;
    let checkDate = new Date();
    
    for (const review of sortedReviews) {
      const reviewDate = ensureDate(review.weekOf);
      const daysDiff = Math.floor((checkDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        currentStreak++;
        checkDate = reviewDate;
      } else {
        break;
      }
    }

    const lastReviewDate = sortedReviews.length > 0 ? ensureDate(sortedReviews[0].weekOf) : null;

    return {
      weekProgress,
      totalGoals,
      completedGoals,
      activeGoals,
      completedTasks,
      totalTasks,
      pendingTasks,
      totalAnnualGoals,
      completedAnnualGoals,
      activeQuarterlyGoals,
      overallProgress,
      currentStreak,
      lastReviewDate
    };
  };

  const calculateBalanceWheelData = () => {
    // Get unique categories from life goals
    const uniqueCategories = Array.from(
      new Set(state.lifeGoals.map(goal => goal.category).filter(cat => cat && cat.trim() !== ''))
    ).sort();

    // If no categories exist, return empty array
    if (uniqueCategories.length === 0) {
      return [];
    }

    // Calculate raw values for each category
    const rawData = uniqueCategories.map(category => {
      const categoryGoals = state.lifeGoals.filter(goal => 
        goal.category === category
      );
      
      const goalCount = categoryGoals.length;
      
      const avgProgress = categoryGoals.length > 0 ? 
        categoryGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / categoryGoals.length : 0;

      return {
        category,
        goalCount,
        avgProgress
      };
    });

    // Find the maximum values for scaling
    const maxGoalCount = Math.max(...rawData.map(d => d.goalCount), 1);
    const maxProgress = Math.max(...rawData.map(d => d.avgProgress), 1);

    // Scale everything relative to the maximum (0-100%)
    return rawData.map(data => ({
      category: data.category,
      effort: Math.round((data.goalCount / maxGoalCount) * 100),
      progress: Math.round((data.avgProgress / maxProgress) * 100)
    }));
  };

  const stats = calculateStats();
  const currentQuarterGoals = state.quarterlyGoals.filter(goal => 
    goal.quarter === state.currentQuarter && goal.year === state.currentYear
  );

  const handleQuarterlyGoalClick = (goalId: string) => {
    navigateTo('goals-table', false, { goalType: 'quarterly', goalId });
  };

  const recentTasks = state.weeklyTasks
    .filter(task => {
      const daysDiff = (new Date().getTime() - ensureDate(task.weekOf).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 14; // Last 2 weeks
    })
    .sort((a, b) => ensureDate(b.weekOf).getTime() - ensureDate(a.weekOf).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Strategic Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Your command center for tracking progress across your 5-year marathon. 
          Monitor annual flight plans, quarterly sprints, and weekly execution.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigateTo('annual')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ocean-deep-blue">{state.annualGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAnnualGoals > 0 
                ? `${Math.round((stats.completedAnnualGoals / stats.totalAnnualGoals) * 100)}% Complete`
                : 'No goals set'
              }
            </p>
          </CardContent>
        </Card>

        <Card 
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigateTo('quarterly')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q{state.currentQuarter} Sprint</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ocean-surface-blue">{stats.activeQuarterlyGoals}</div>
            <p className="text-xs text-muted-foreground">
              Active OKRs
            </p>
          </CardContent>
        </Card>

        <Card 
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => {
            alert('Weekly Command Huddle feature! Navigate to "This Week" tab to experience the full Weekly Huddle.');
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold text-success">{stats.weekProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Click for Weekly Command Huddle
            </p>
          </CardContent>
        </Card>

        <Card 
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => setShowCheckInModal(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <CardTitle className="text-sm font-medium">Check-In</CardTitle>
            <Heart className="h-4 w-4 text-mood-confident" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold text-mood-confident">{state.checkIns.length}</div>
            <p className="text-xs text-muted-foreground">
              Today's Check-ins • Log your energy & focus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Tree Overview Card */}
      <Card 
        className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={() => navigateTo('goal-tree', false)}
      >
        <CardHeader className="p-6">
          <CardTitle className="flex items-center justify-center gap-4 text-lg font-bold text-warning">
            <GitBranch className="h-8 w-8" />
            <span>🌟 Open Goal Tree Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 pt-0">
          <p className="mb-4 text-muted-foreground leading-relaxed">
            See the complete hierarchy of your goals and tasks. Explore how every action connects 
            to your life vision in an interactive tree view.
          </p>
          <div className="flex justify-center gap-6 flex-wrap text-sm font-semibold text-yellow-900">
            <span>📍 {state.lifeGoals.length} Life Goals</span>
            <span>🎯 {state.annualGoals.length} Annual Goals</span>
            <span>📅 {state.quarterlyGoals.length} Quarterly OKRs</span>
            <span>✅ {state.weeklyTasks.length} Tasks</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={stats.overallProgress} className="w-full" />
            <div className="text-center font-bold">{stats.overallProgress}%</div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigateTo('weekly')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Review Streak</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 mb-1">{stats.currentStreak}</div>
            <p className="text-sm text-muted-foreground mb-2">Consecutive weeks</p>
            {stats.lastReviewDate && (
              <p className="text-xs text-muted-foreground">
                Last review: {format(stats.lastReviewDate, 'MMM dd, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Quarter Goals */}
      {currentQuarterGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Current Quarter Goals (Q{state.currentQuarter} {state.currentYear})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuarterGoals.map(goal => (
              <Card 
                key={goal.id}
                className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleQuarterlyGoalClick(goal.id)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                  <Progress value={goal.progress} className="w-full" />
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress: {goal.progress}%</span>
                    <Badge 
                      variant={goal.status === 'completed' ? 'default' : 
                              goal.status === 'in-progress' ? 'secondary' : 'outline'}
                    >
                      {goal.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      {recentTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <Card>
            <CardContent className="p-0">
              {recentTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex justify-between items-center p-4",
                    index !== recentTasks.length - 1 && "border-b"
                  )}
                >
                  <div>
                    <div className="font-semibold mb-1">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Week of {format(task.weekOf, 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={task.completed ? 'default' : 'secondary'}>
                      {task.completed ? '✓ Completed' : 'Pending'}
                    </Badge>
                    <Clock className="h-4 w-4" />
                    <span>{task.estimatedHours}h</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Balance Wheel - Life Goals Overview */}
      {state.lifeGoals.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Target className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">Life Balance Wheel</CardTitle>
                <CardDescription>
                  Your effort and progress across life pillars for holistic growth
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full mb-6">
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
            
            <div className="flex justify-center gap-8 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                <span className="text-sm">Effort Distribution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-sm">Progress Achievement</span>
              </div>
            </div>
            
            {/* Balance Insights */}
            <div className="bg-muted p-6 rounded-lg">
              <h4 className="text-base font-semibold mb-4">🎯 Balance Insights</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {(() => {
                  const data = calculateBalanceWheelData();
                  const totalGoals = state.lifeGoals.length;
                  const avgProgress = data.length > 0 ? 
                    Math.round(data.reduce((sum, item) => sum + item.progress, 0) / data.length) : 0;
                  const mostFocusedArea = data.length > 0 ? 
                    data.reduce((max, item) => item.effort > max.effort ? item : max, data[0]) : null;
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalGoals}</div>
                        <div className="text-muted-foreground">Total Life Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{avgProgress}%</div>
                        <div className="text-muted-foreground">Average Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{data.length}</div>
                        <div className="text-muted-foreground">Active Pillars</div>
                      </div>
                      {mostFocusedArea && (
                        <div className="text-center">
                          <div className="text-base font-bold text-yellow-600">
                            {mostFocusedArea.category.replace('\n', ' ')}
                          </div>
                          <div className="text-muted-foreground">Most Focused Area</div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-4">Create Your Life Vision</h3>
            <p className="text-blue-800 text-base leading-relaxed max-w-2xl mx-auto mb-6">
              Start by defining your life goals across different pillars. Your Balance Wheel will appear here 
              to help you visualize and maintain holistic growth across all areas of your life.
            </p>
            <div className="flex gap-4 justify-center flex-wrap text-sm text-blue-700">
              <span>🎨 Creativity</span>
              <span>🧠 Mind</span>
              <span>💼 Career</span>
              <span>💰 Finance</span>
              <span>🏃‍♂️ Health</span>
              <span>❤️ Relationships</span>
              <span>🙏 Spirit</span>
              <span>🌍 Community</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Check-In Modal */}
      <CheckInModal 
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
      />
    </div>
  );
}

export default Dashboard;
