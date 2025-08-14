import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AnnualGoal, QuarterlyGoal, WeeklyTask, WeeklyReviewData, LifeGoal } from '../types';
import { useAuth } from './AuthContext';
import { FirebaseService } from '../lib/firebaseService';
import { LocalStorageService } from '../lib/localStorageService';

// Initial state
const initialState: AppState & { loading: boolean } = {
  lifeGoals: [],
  annualGoals: [],
  quarterlyGoals: [],
  weeklyTasks: [],
  weeklyReviews: [],
  currentYear: new Date().getFullYear(),
  currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4,
  loading: false,
};

// Action types
type Action =
  | { type: 'ADD_LIFE_GOAL'; payload: LifeGoal }
  | { type: 'UPDATE_LIFE_GOAL'; payload: LifeGoal }
  | { type: 'DELETE_LIFE_GOAL'; payload: string }
  | { type: 'ADD_ANNUAL_GOAL'; payload: AnnualGoal }
  | { type: 'UPDATE_ANNUAL_GOAL'; payload: AnnualGoal }
  | { type: 'DELETE_ANNUAL_GOAL'; payload: string }
  | { type: 'ADD_QUARTERLY_GOAL'; payload: QuarterlyGoal }
  | { type: 'UPDATE_QUARTERLY_GOAL'; payload: QuarterlyGoal }
  | { type: 'DELETE_QUARTERLY_GOAL'; payload: string }
  | { type: 'ADD_WEEKLY_TASK'; payload: WeeklyTask }
  | { type: 'UPDATE_WEEKLY_TASK'; payload: WeeklyTask }
  | { type: 'DELETE_WEEKLY_TASK'; payload: string }
  | { type: 'ADD_WEEKLY_REVIEW'; payload: WeeklyReviewData }
  | { type: 'UPDATE_WEEKLY_REVIEW'; payload: WeeklyReviewData }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_YEAR'; payload: number }
  | { type: 'SET_CURRENT_QUARTER'; payload: 1 | 2 | 3 | 4 };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  console.log('Dispatching action:', action.type, action.payload);
  
  switch (action.type) {
    case 'ADD_LIFE_GOAL':
      console.log('Adding life goal:', action.payload);
      return {
        ...state,
        lifeGoals: [...state.lifeGoals, action.payload],
      };
    case 'UPDATE_LIFE_GOAL':
      return {
        ...state,
        lifeGoals: state.lifeGoals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    case 'DELETE_LIFE_GOAL':
      return {
        ...state,
        lifeGoals: state.lifeGoals.filter(goal => goal.id !== action.payload),
      };
    case 'ADD_ANNUAL_GOAL':
      console.log('Adding annual goal:', action.payload);
      return {
        ...state,
        annualGoals: [...state.annualGoals, action.payload],
      };
    case 'UPDATE_ANNUAL_GOAL':
      return {
        ...state,
        annualGoals: state.annualGoals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    case 'DELETE_ANNUAL_GOAL':
      return {
        ...state,
        annualGoals: state.annualGoals.filter(goal => goal.id !== action.payload),
      };
    case 'ADD_QUARTERLY_GOAL':
      return {
        ...state,
        quarterlyGoals: [...state.quarterlyGoals, action.payload],
      };
    case 'UPDATE_QUARTERLY_GOAL':
      return {
        ...state,
        quarterlyGoals: state.quarterlyGoals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    case 'DELETE_QUARTERLY_GOAL':
      return {
        ...state,
        quarterlyGoals: state.quarterlyGoals.filter(goal => goal.id !== action.payload),
      };
    case 'ADD_WEEKLY_TASK':
      return {
        ...state,
        weeklyTasks: [...state.weeklyTasks, action.payload],
      };
    case 'UPDATE_WEEKLY_TASK':
      return {
        ...state,
        weeklyTasks: state.weeklyTasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_WEEKLY_TASK':
      return {
        ...state,
        weeklyTasks: state.weeklyTasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_WEEKLY_REVIEW':
      return {
        ...state,
        weeklyReviews: [...state.weeklyReviews, action.payload],
      };
    case 'UPDATE_WEEKLY_REVIEW':
      return {
        ...state,
        weeklyReviews: state.weeklyReviews.map(review =>
          review.id === action.payload.id ? action.payload : review
        ),
      };
    case 'LOAD_STATE':
      return { ...action.payload, loading: false };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_CURRENT_YEAR':
      return {
        ...state,
        currentYear: action.payload,
      };
    case 'SET_CURRENT_QUARTER':
      return {
        ...state,
        currentQuarter: action.payload,
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState & { loading: boolean };
  dispatch: React.Dispatch<Action>;
  firebaseService: FirebaseService | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null);

  // Load localStorage data on app startup
  useEffect(() => {
    console.log('🚀 App starting, loading initial data...');
    const localData = LocalStorageService.load();
    if (localData) {
      dispatch({ type: 'LOAD_STATE', payload: localData });
      console.log('📂 Initial data loaded from localStorage');
    } else {
      console.log('💭 No localStorage data found, starting fresh');
    }
  }, []);

  // Initialize Firebase service when user logs in
  useEffect(() => {
    if (user) {
      const service = new FirebaseService(user);
      setFirebaseService(service);
      
      // Load user data from Firebase
      const loadData = async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          console.log('🔄 Loading data from Firebase...');
          const userData = await service.loadAllData();
          dispatch({ type: 'LOAD_STATE', payload: userData });
          console.log('✅ Data loaded from Firebase');
        } catch (error) {
          console.warn('⚠️ Failed to load from Firebase, trying localStorage:', error);
          // Fallback to localStorage
          const localData = LocalStorageService.load();
          if (localData) {
            dispatch({ type: 'LOAD_STATE', payload: localData });
            console.log('📂 Data loaded from localStorage');
          } else {
            console.log('💭 No local data found, starting fresh');
          }
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };
      
      loadData();
    } else {
      setFirebaseService(null);
      
      // Load from localStorage when not authenticated
      console.log('👤 No user authenticated, loading from localStorage...');
      const localData = LocalStorageService.load();
      if (localData) {
        dispatch({ type: 'LOAD_STATE', payload: localData });
        console.log('📂 Data loaded from localStorage (no auth)');
      } else {
        dispatch({ type: 'LOAD_STATE', payload: initialState });
        console.log('💭 No local data found, starting fresh (no auth)');
      }
    }
  }, [user]);

  // Enhanced dispatch that automatically saves to Firebase with localStorage fallback
  const enhancedDispatch = async (action: Action) => {
    // Always dispatch locally first for immediate UI update
    dispatch(action);
    
    // Save to localStorage for persistence
    setTimeout(() => {
      const currentState = {
        lifeGoals: state.lifeGoals,
        annualGoals: state.annualGoals,
        quarterlyGoals: state.quarterlyGoals,
        weeklyTasks: state.weeklyTasks,
        weeklyReviews: state.weeklyReviews,
        currentYear: state.currentYear,
        currentQuarter: state.currentQuarter,
      };
      LocalStorageService.save(currentState);
    }, 100); // Small delay to ensure state is updated

    // Try Firebase sync if available
    if (!firebaseService) {
      console.log('📱 Firebase not available, using localStorage only');
      return;
    }

    try {
      console.log('🔄 Syncing with Firebase...');
      
      // Then sync with Firebase
      switch (action.type) {
        case 'ADD_LIFE_GOAL':
          const lifeGoalId = await firebaseService.addLifeGoal(action.payload);
          dispatch({ type: 'UPDATE_LIFE_GOAL', payload: { ...action.payload, id: lifeGoalId } });
          break;
        case 'UPDATE_LIFE_GOAL':
          await firebaseService.updateLifeGoal(action.payload);
          break;
        case 'DELETE_LIFE_GOAL':
          await firebaseService.deleteLifeGoal(action.payload);
          break;
        case 'ADD_ANNUAL_GOAL':
          const annualId = await firebaseService.addAnnualGoal(action.payload);
          dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: { ...action.payload, id: annualId } });
          break;
        case 'UPDATE_ANNUAL_GOAL':
          await firebaseService.updateAnnualGoal(action.payload);
          break;
        case 'DELETE_ANNUAL_GOAL':
          await firebaseService.deleteAnnualGoal(action.payload);
          break;
        case 'ADD_QUARTERLY_GOAL':
          const quarterlyId = await firebaseService.addQuarterlyGoal(action.payload);
          dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: { ...action.payload, id: quarterlyId } });
          break;
        case 'UPDATE_QUARTERLY_GOAL':
          await firebaseService.updateQuarterlyGoal(action.payload);
          break;
        case 'DELETE_QUARTERLY_GOAL':
          await firebaseService.deleteQuarterlyGoal(action.payload);
          break;
        case 'ADD_WEEKLY_TASK':
          const taskId = await firebaseService.addWeeklyTask(action.payload);
          dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: { ...action.payload, id: taskId } });
          break;
        case 'UPDATE_WEEKLY_TASK':
          await firebaseService.updateWeeklyTask(action.payload);
          break;
        case 'DELETE_WEEKLY_TASK':
          await firebaseService.deleteWeeklyTask(action.payload);
          break;
        case 'ADD_WEEKLY_REVIEW':
          const reviewId = await firebaseService.addWeeklyReview(action.payload);
          dispatch({ type: 'UPDATE_WEEKLY_REVIEW', payload: { ...action.payload, id: reviewId } });
          break;
        case 'UPDATE_WEEKLY_REVIEW':
          await firebaseService.updateWeeklyReview(action.payload);
          break;
      }
      console.log('✅ Firebase sync completed');
    } catch (error) {
      console.warn('⚠️ Firebase sync failed, data saved locally only:', error);
      // Data is still saved in localStorage, so functionality continues
    }
  };

  return (
    <AppContext.Provider value={{ 
      state: { ...state, loading: state.loading || false }, 
      dispatch: enhancedDispatch,
      firebaseService 
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
