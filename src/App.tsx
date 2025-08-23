import { useState, useEffect } from 'react'
import './App.css'
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
import ActivityLogDrawer from './components/ActivityLogDrawer.tsx'
import LandingPage from './components/LandingPage.tsx'
import DevRLModal from './components/DevRLModal.tsx'
import { rlEngine } from './services/rlEngine'
import { appSettingsService } from './services/appSettingsService'
import { Target, Calendar, CheckSquare, TrendingUp, LogOut, BookOpen, Heart, Settings, Sparkles, Clock } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { useApp } from './context/AppContext'
import { notificationService } from './services/notificationService'
import { updatePageTitle, resetPageTitle } from './utils/pageTitle'
// Import Firebase connection test
import './utils/firebaseTest'

type ViewType = 'dashboard' | 'annual' | 'quarterly' | 'weekly' | 'this-week' | 'life-goals' | 'guide'

function App() {
  const { user, loading, logout } = useAuth();
  const { state } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [path, setPath] = useState<string>(window.location.pathname);
  const [showRLDrawer, setShowRLDrawer] = useState(false);

  // Check if user has any data - if not, show wizard
  const isNewUser = state.lifeGoals.length === 0 && 
                   state.annualGoals.length === 0 && 
                   state.quarterlyGoals.length === 0;

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Dev-only: initialize RL engine and tick periodically when feature toggle is enabled
  useEffect(() => {
    if (import.meta.env.MODE === 'production') return;
    rlEngine.init(() => state);
    const settings = appSettingsService.getSettings();
    let id: number | undefined;
    const start = () => { if (!id) id = window.setInterval(() => rlEngine.step(), 4000); };
    const stop = () => { if (id) { clearInterval(id); id = undefined; } };
    if (settings.rlEngineEnabled) start(); else stop();
    const onChange = (e: Event) => {
      const s = (e as CustomEvent).detail;
      if (s.rlEngineEnabled) start(); else stop();
    };
    window.addEventListener('app-settings-changed', onChange as EventListener);
    return () => { stop(); window.removeEventListener('app-settings-changed', onChange as EventListener); };
  }, [state]);

  // Welcome route should be available to anyone (even when logged in) via URL
  if (path === '/welcome') {
    return (
      <LandingPage
        isAuthenticated={!!user}
        onGetStarted={() => { window.history.pushState({}, '', '/'); setPath('/'); }}
        onEnterApp={() => { window.history.pushState({}, '', '/'); setPath('/'); }}
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
            setCurrentView('this-week');
            break;
          case 'navigate-quarterly':
            setCurrentView('quarterly');
            break;
          case 'navigate-annual':
            setCurrentView('annual');
            break;
          case 'navigate-dashboard':
            setCurrentView('dashboard');
            break;
          case 'prepare-huddle':
            // Could show a preparation modal or tips
            setCurrentView('this-week');
            break;
        }
      };

      window.addEventListener('notification-action', handleNotificationAction as EventListener);

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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Simple path-based router for auth vs landing
    if (path === '/login') {
      return <AuthComponent />;
    }
    return (
      <LandingPage
        isAuthenticated={false}
        onGetStarted={() => { window.history.pushState({}, '', '/login'); setPath('/login'); }}
        onEnterApp={() => {}}
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
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      {/* Notification Banner */}
      <NotificationBanner 
        onAction={(action) => {
          // Handle notification actions
          switch (action) {
            case 'navigate-this-week':
              setCurrentView('this-week');
              break;
            case 'navigate-quarterly':
              setCurrentView('quarterly');
              break;
            case 'navigate-annual':
              setCurrentView('annual');
              break;
            case 'navigate-dashboard':
              setCurrentView('dashboard');
              break;
          }
        }}
      />

      <header className="app-header">
        <div>
          <h1>Personal OS</h1>
          <p>Transform your 5-year marathon into manageable strategic actions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#718096', fontSize: '0.9rem' }}>
            {user.email}
          </span>
          <button
            onClick={() => setShowRLDrawer(true)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: import.meta.env.MODE === 'production' ? 'none' : 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title="RL Debug Log (dev)"
          >
            RL
          </button>
          <button
            onClick={() => setShowNotificationSettings(true)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title="Notification Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setShowActivityLog(true)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title="Activity Log"
          >
            <Clock size={16} />
          </button>
          <button
            onClick={() => setShowWizard(true)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title="Life Architecture Wizard"
          >
            <Sparkles size={16} />
          </button>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={currentView === 'dashboard' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('dashboard')}
        >
          <TrendingUp size={20} />
          Dashboard
        </button>
        <button 
          className={currentView === 'life-goals' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('life-goals')}
        >
          <Heart size={20} />
          Life Goals
        </button>
        <button 
          className={currentView === 'annual' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('annual')}
        >
          <Target size={20} />
          Annual Flight Plan
        </button>
        <button 
          className={currentView === 'quarterly' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('quarterly')}
        >
          <Calendar size={20} />
          90-Day Sprint
        </button>
        <button 
          className={currentView === 'this-week' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('this-week')}
        >
          <Target size={20} />
          This Week
        </button>
        <button 
          className={currentView === 'weekly' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('weekly')}
        >
          <CheckSquare size={20} />
          Weekly Review
        </button>
        <button 
          className={currentView === 'guide' ? 'nav-button active' : 'nav-button'}
          onClick={() => setCurrentView('guide')}
        >
          <BookOpen size={20} />
          User Guide
        </button>
      </nav>

      <main className="app-main">
        {renderView()}
      </main>

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      {/* Life Architecture Wizard */}
      <LifeArchitectureWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          notificationService.celebrateGoalCompletion('PersonalOS Setup', 'Life Architecture');
          setCurrentView('dashboard');
        }}
      />

      {/* AI Chatbot */}
      <AIChatbot
        context={getChatbotContext()}
        isVisible={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />

      {/* Activity Log Drawer */}
      <ActivityLogDrawer
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
      />

      {/* Dev-only RL Modal */}
      {import.meta.env.MODE !== 'production' && (
        <DevRLModal isOpen={showRLDrawer} onClose={() => setShowRLDrawer(false)} />
      )}

      {/* Development Toast Notifications */}
      <DevToastContainer />
    </div>
  )
}

export default App
