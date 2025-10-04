import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard.tsx'
import AnnualPlan from './components/AnnualPlan.tsx'
import QuarterlySprint from './components/QuarterlySprint.tsx'
import WeeklyReview from './components/WeeklyReview'
import ThisWeekDashboard from './components/ThisWeekDashboard.tsx'
import LifeGoals from './components/LifeGoals.tsx'
import UserGuide from './components/UserGuide.tsx'
import AuthComponent from './components/AuthComponent.tsx'
import NotificationBanner from './components/NotificationBanner.tsx'
import NotificationSettings from './components/NotificationSettings.tsx'
import LifeArchitectureWizard from './components/LifeArchitectureWizard.tsx'
import AIChatbot from './components/AIChatbot.tsx'
import DevToastContainer from './components/DevToastContainer.tsx'
import ToastContainer from './components/ToastContainer.tsx'
import ActivityLogDrawer from './components/ActivityLogDrawer.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import GoalsTable from './components/GoalsTable.tsx'
import { Button } from './components/ui/button'

import { analyticsService } from './services/analyticsService'
import { Target, Calendar, CheckSquare, TrendingUp, LogOut, BookOpen, Heart, Settings, Sparkles, Clock, Table, Menu, X } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { useApp } from './context/AppContext'
import { useRouter } from './hooks/useRouter'
import { notificationService } from './services/notificationService'
import { updatePageTitle, resetPageTitle } from './utils/pageTitle'
import { cn } from './lib/utils'
import type { ViewType } from './services/routerService'
// Import Firebase connection test
import './utils/firebaseTest'

function App() {
  const { user, loading, logout } = useAuth();
  const { state } = useApp();
  const { currentView, currentPath, currentParams, navigateTo } = useRouter();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user has any data - if not, show wizard
  const isNewUser = state.lifeGoals.length === 0 && 
                   state.annualGoals.length === 0 && 
                   state.quarterlyGoals.length === 0;

  // Initialize analytics for logged in users
  useEffect(() => {
    if (user) {
      analyticsService.setUserProperties(user.uid, {
        user_type: isNewUser ? 'new' : 'returning',
        has_life_goals: state.lifeGoals.length > 0,
        has_annual_goals: state.annualGoals.length > 0,
        has_quarterly_goals: state.quarterlyGoals.length > 0
      });
    }
  }, [user, isNewUser, state.lifeGoals.length, state.annualGoals.length, state.quarterlyGoals.length]);



  // Welcome route should be available to anyone (even when logged in) via URL
  if (currentPath === '/welcome') {
    return (
      <LandingPage
        onGetStarted={() => navigateTo('dashboard')}
      />
    );
  }

  useEffect(() => {
    if (user && isNewUser) {
      // Show wizard for new users after a brief delay
      const timer = setTimeout(() => {
        setShowWizard(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isNewUser]);

  useEffect(() => {
    if (user) {
      // Initialize notification service when user is logged in
      notificationService.scheduleWeeklyHuddle();
      notificationService.scheduleQuarterlyPlanning();
      notificationService.scheduleAnnualReview();

      // Listen for notification actions
        const handleNotificationAction = (event: CustomEvent) => {
        const action = event.detail;
        switch (action) {
          case 'navigate-this-week':
            navigateTo('this-week');
            break;
          case 'navigate-quarterly':
            navigateTo('quarterly');
            break;
          case 'navigate-annual':
            navigateTo('annual');
            break;
          case 'navigate-dashboard':
            navigateTo('dashboard');
            break;
          case 'prepare-huddle':
            // Could show a preparation modal or tips
            navigateTo('this-week');
            break;
        }
      };      window.addEventListener('notification-action', handleNotificationAction as EventListener);

      return () => {
        window.removeEventListener('notification-action', handleNotificationAction as EventListener);
      };
    }
  }, [user]);

  // Update page title when view changes
  useEffect(() => {
    if (user) {
      // Create context for dynamic page titles
      const context = {
        quarter: state.currentQuarter,
        year: state.currentYear,
        userName: user.displayName || user.email?.split('@')[0],
        taskCount: state.weeklyTasks.filter(task => {
          const taskWeek = new Date(task.weekOf);
          const currentWeek = new Date();
          const diffTime = Math.abs(currentWeek.getTime() - taskWeek.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }).length,
        goalCount: state.lifeGoals.length
      };
      
      updatePageTitle(currentView, context);
    } else {
      resetPageTitle();
    }

    // Cleanup: reset page title when component unmounts
    return () => {
      resetPageTitle();
    };
  }, [currentView, user, state.currentQuarter, state.currentYear, state.weeklyTasks.length, state.lifeGoals.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        <div className="text-primary-foreground text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Simple path-based router for auth vs landing
    if (currentPath === '/login') {
      return <AuthComponent />;
    }
    return (
      <LandingPage
        onGetStarted={() => {
          // Set URL to /login to show auth component
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />
    );
  }

  const getChatbotContext = (): string => {
    switch (currentView) {
      case 'life-goals':
        return 'life-goals-viewing';
      case 'annual':
        return 'annual-plan';
      case 'quarterly':
        return 'quarterly-goals';
      case 'this-week':
        return 'weekly-dashboard';
      case 'weekly':
        return 'weekly-huddle';
      default:
        return 'dashboard';
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'life-goals':
        return <LifeGoals />
      case 'annual':
        return <AnnualPlan />
      case 'quarterly':
        return <QuarterlySprint />
      case 'this-week':
        return <ThisWeekDashboard />
      case 'weekly':
        return <WeeklyReview />
      case 'guide':
        return <UserGuide />
      case 'goals-table':
        return <GoalsTable 
          onNavigate={(view) => navigateTo(view)}
          initialGoalId={currentParams.goalId}
          initialGoalType={currentParams.goalType as 'life' | 'annual' | 'quarterly' | 'weekly'}
        />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-lg font-semibold">Personal OS</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChatbot(!showChatbot)}
            >
              <Sparkles size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotificationSettings(true)}
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-foreground">Personal OS</h1>
            <p className="text-sm text-muted-foreground mt-1">Strategic Life Management</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'life-goals', label: 'Life Goals', icon: Heart },
            { id: 'annual', label: 'Annual Plan', icon: Target },
            { id: 'quarterly', label: '90-Day Sprint', icon: Calendar },
            { id: 'this-week', label: 'This Week', icon: CheckSquare },
            { id: 'weekly', label: 'Weekly Review', icon: CheckSquare },
            { id: 'goals-table', label: 'Goals Table', icon: Table },
            { id: 'guide', label: 'User Guide', icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-3 h-11",
                  isActive && "bg-secondary text-secondary-foreground font-medium"
                )}
                onClick={() => {
                  navigateTo(item.id as ViewType);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 space-y-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3"
            onClick={() => setShowWizard(true)}
          >
            <Sparkles size={18} />
            <span>Life Wizard</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3"
            onClick={() => setShowActivityLog(true)}
          >
            <Clock size={18} />
            <span>Activity Log</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start space-x-3 mt-4"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Notification Banner */}
        <NotificationBanner 
          onAction={(action) => {
            switch (action) {
              case 'navigate-this-week':
                navigateTo('this-week');
                break;
              case 'navigate-quarterly':
                navigateTo('quarterly');
                break;
              case 'navigate-annual':
                navigateTo('annual');
                break;
              case 'navigate-dashboard':
                navigateTo('dashboard');
                break;
            }
          }}
        />

        {/* Content Area */}
        <div className="flex-1 pt-16 lg:pt-0 px-4 lg:px-8 py-6 lg:py-8 overflow-auto">
          {renderView()}
        </div>
      </main>

      {/* Floating Chat Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <Sparkles size={20} />
      </Button>

      {/* Modals and Overlays */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      <LifeArchitectureWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          notificationService.celebrateGoalCompletion('PersonalOS Setup', 'Life Architecture');
          navigateTo('dashboard');
        }}
      />

      <AIChatbot
        context={getChatbotContext()}
        isVisible={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />

      <ActivityLogDrawer
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
      />



      <DevToastContainer />
      <ToastContainer />
    </div>
  )
}

export default App
