import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard.tsx'
import AnnualPlan from './components/AnnualPlan.tsx'
import QuarterlySprint from './components/QuarterlySprint.tsx'
import WeeklyReview from './components/WeeklyReview'
import ThisWeekDashboard from './components/ThisWeekDashboard.tsx'
import LifeGoals from './components/LifeGoals.tsx'
import UserGuide from './components/UserGuide.tsx'
import AuthComponent from './components/AuthComponent.tsx'
import { Target, Calendar, CheckSquare, TrendingUp, LogOut, BookOpen, Heart } from 'lucide-react'
import { useAuth } from './context/AuthContext'
// Import Firebase connection test
import './utils/firebaseTest'

type ViewType = 'dashboard' | 'annual' | 'quarterly' | 'weekly' | 'this-week' | 'life-goals' | 'guide'

function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')

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
    return <AuthComponent />;
  }

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
    </div>
  )
}

export default App
