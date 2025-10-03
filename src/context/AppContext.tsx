import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AnnualGoal, QuarterlyGoal, WeeklyTask, WeeklyReviewData, LifeGoal, ActivityLog, CheckIn, GoalUpdate } from '../types';
import { useAuth } from './AuthContext';
import { FirebaseService } from '../lib/firebaseService';
import { LocalStorageService } from '../lib/localStorageService';
import { notificationService } from '../services/notificationService';
import { toastService } from '../services/toastService';
import { taskRolloverService } from '../services/taskRolloverService';
import { updateLifeGoalFromAnnualProgress, updateAnnualGoalFromQuarterlyProgress } from '../utils/progressCalculation';
import { updateGoalTimestamp, ensureTimestamps } from '../utils/goalTimestamps';

// Initial state
const initialState: AppState & { loading: boolean } = {
  lifeGoals: [],
  annualGoals: [],
  quarterlyGoals: [],
  weeklyTasks: [],
  weeklyReviews: [],
  activityLogs: [],
  checkIns: [],
  goalUpdates: [],
  currentYear: new Date().getFullYear(),
  currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4,
  loading: false,
};

// Action types
type Action =
  | { type: 'ADD_LIFE_GOAL'; payload: LifeGoal }
  | { type: 'UPDATE_LIFE_GOAL'; payload: LifeGoal }
  | { type: 'DELETE_LIFE_GOAL'; payload: string; meta?: { activityLog: any } }
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
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLog }
  | { type: 'ADD_CHECK_IN'; payload: CheckIn }
  | { type: 'ADD_GOAL_UPDATE'; payload: GoalUpdate }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_YEAR'; payload: number }
  | { type: 'SET_CURRENT_QUARTER'; payload: 1 | 2 | 3 | 4 };

// Helper function to update life goal progress when annual goals change
function updateLifeGoalProgress(state: AppState, updatedAnnualGoals: AnnualGoal[]): LifeGoal[] {
  return state.lifeGoals.map(lifeGoal => {
    const updatedGoal = updateLifeGoalFromAnnualProgress(lifeGoal, updatedAnnualGoals);
    return updatedGoal || lifeGoal;
  });
}

// Helper function to update annual goal progress when quarterly goals change
function updateAnnualGoalProgress(state: AppState, updatedQuarterlyGoals: QuarterlyGoal[]): AnnualGoal[] {
  return state.annualGoals.map(annualGoal => {
    const updatedGoal = updateAnnualGoalFromQuarterlyProgress(annualGoal, updatedQuarterlyGoals);
    return updatedGoal || annualGoal;
  });
}

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  console.log('Dispatching action:', action.type, 'payload' in action ? action.payload : '(no payload)');
  
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
          goal.id === action.payload.id ? updateGoalTimestamp(action.payload) : goal
        ),
      };
    case 'DELETE_LIFE_GOAL':
      return {
        ...state,
        lifeGoals: state.lifeGoals.filter(goal => goal.id !== action.payload),
      };
    case 'ADD_ANNUAL_GOAL':
      console.log('Adding annual goal:', action.payload);
      const newAnnualGoals = [...state.annualGoals, action.payload];
      const updatedLifeGoalsFromAdd = updateLifeGoalProgress(state, newAnnualGoals);
      
      return {
        ...state,
        annualGoals: newAnnualGoals,
        lifeGoals: updatedLifeGoalsFromAdd,
      };
    case 'UPDATE_ANNUAL_GOAL': {
      const oldGoal = state.annualGoals.find(goal => goal.id === action.payload.id);
      const newGoal = action.payload;
      
      // Check if goal was just completed
      if (oldGoal && oldGoal.status !== 'completed' && newGoal.status === 'completed') {
        notificationService.celebrateGoalCompletion(newGoal.title, 'Annual');
      }
      
      const updatedAnnualGoals = state.annualGoals.map(goal =>
        goal.id === action.payload.id ? updateGoalTimestamp(action.payload) : goal
      );
      
      // Update life goal progress based on annual goal changes
      const updatedLifeGoals = updateLifeGoalProgress(state, updatedAnnualGoals);
      
      return {
        ...state,
        annualGoals: updatedAnnualGoals,
        lifeGoals: updatedLifeGoals,
      };
    }
    case 'DELETE_ANNUAL_GOAL':
      const filteredAnnualGoals = state.annualGoals.filter(goal => goal.id !== action.payload);
      const updatedLifeGoalsFromDelete = updateLifeGoalProgress(state, filteredAnnualGoals);
      
      return {
        ...state,
        annualGoals: filteredAnnualGoals,
        lifeGoals: updatedLifeGoalsFromDelete,
      };
    case 'ADD_QUARTERLY_GOAL': {
      const newQuarterlyGoals = [...state.quarterlyGoals, action.payload];
      const updatedAnnualGoals = updateAnnualGoalProgress(state, newQuarterlyGoals);
      const updatedLifeGoals = updateLifeGoalProgress(state, updatedAnnualGoals);
      
      return {
        ...state,
        quarterlyGoals: newQuarterlyGoals,
        annualGoals: updatedAnnualGoals,
        lifeGoals: updatedLifeGoals,
      };
    }
    case 'UPDATE_QUARTERLY_GOAL': {
      const oldGoal = state.quarterlyGoals.find(goal => goal.id === action.payload.id);
      const newGoal = action.payload;
      
      // Check if goal was just completed
      if (oldGoal && oldGoal.status !== 'completed' && newGoal.status === 'completed') {
        notificationService.celebrateGoalCompletion(newGoal.title, 'Quarterly');
      }
      
      const updatedQuarterlyGoals = state.quarterlyGoals.map(goal =>
        goal.id === action.payload.id ? updateGoalTimestamp(action.payload) : goal
      );
      const updatedAnnualGoals = updateAnnualGoalProgress(state, updatedQuarterlyGoals);
      const updatedLifeGoals = updateLifeGoalProgress(state, updatedAnnualGoals);

      return {
        ...state,
        quarterlyGoals: updatedQuarterlyGoals,
        annualGoals: updatedAnnualGoals,
        lifeGoals: updatedLifeGoals,
      };
    }
    case 'DELETE_QUARTERLY_GOAL': {
      const filteredQuarterlyGoals = state.quarterlyGoals.filter(goal => goal.id !== action.payload);
      const updatedAnnualGoals = updateAnnualGoalProgress(state, filteredQuarterlyGoals);
      const updatedLifeGoals = updateLifeGoalProgress(state, updatedAnnualGoals);
      
      return {
        ...state,
        quarterlyGoals: filteredQuarterlyGoals,
        annualGoals: updatedAnnualGoals,
        lifeGoals: updatedLifeGoals,
      };
    }
    case 'ADD_WEEKLY_TASK':
      return {
        ...state,
        weeklyTasks: [...state.weeklyTasks, action.payload],
      };
    case 'UPDATE_WEEKLY_TASK':
      return {
        ...state,
        weeklyTasks: state.weeklyTasks.map(task =>
          task.id === action.payload.id ? updateGoalTimestamp(action.payload) : task
        ),
      };
    case 'DELETE_WEEKLY_TASK':
      return {
        ...state,
        weeklyTasks: state.weeklyTasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_WEEKLY_REVIEW': {
      const newReviews = [...state.weeklyReviews, action.payload];
      
      // Calculate streak length
      const sortedReviews = newReviews.sort((a, b) => new Date(b.weekOf).getTime() - new Date(a.weekOf).getTime());
      let streak = 0;
      const now = new Date();
      
      for (let i = 0; i < sortedReviews.length; i++) {
        const reviewDate = new Date(sortedReviews[i].weekOf);
        const weeksDiff = Math.floor((now.getTime() - reviewDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        if (weeksDiff === i) {
          streak++;
        } else {
          break;
        }
      }
      
      // Celebrate streak milestones
      if (streak > 0) {
        notificationService.celebrateStreak(streak, 'Weekly Review');
      }
      
      return {
        ...state,
        weeklyReviews: newReviews,
      };
    }
    case 'UPDATE_WEEKLY_REVIEW':
      return {
        ...state,
        weeklyReviews: state.weeklyReviews.map(review =>
          review.id === action.payload.id ? action.payload : review
        ),
      };
    case 'ADD_ACTIVITY_LOG': {
      // Keep only the last 30 activities
      const newActivityLogs = [action.payload, ...state.activityLogs].slice(0, 30);
      return {
        ...state,
        activityLogs: newActivityLogs,
      };
    }
    case 'ADD_CHECK_IN': {
      return {
        ...state,
        checkIns: [action.payload, ...state.checkIns],
      };
    }
    case 'ADD_GOAL_UPDATE': {
      return {
        ...state,
        goalUpdates: [action.payload, ...state.goalUpdates],
      };
    }
    case 'LOAD_STATE':
      // Ensure all goals have proper timestamps for backward compatibility
      const payload = action.payload;
      return { 
        ...payload, 
        lifeGoals: payload.lifeGoals?.map(goal => ensureTimestamps(goal)) || [],
        annualGoals: payload.annualGoals?.map(goal => ensureTimestamps(goal)) || [],
        quarterlyGoals: payload.quarterlyGoals?.map(goal => ensureTimestamps(goal)) || [],
        weeklyTasks: payload.weeklyTasks?.map(task => ensureTimestamps(task)) || [],
        activityLogs: payload.activityLogs || [], 
        checkIns: payload.checkIns || [],
        goalUpdates: payload.goalUpdates || [],
        loading: false 
      };
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
  const [state, originalDispatch] = useReducer(appReducer, initialState);
  const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null);

  // Load localStorage data on app startup
  useEffect(() => {
    console.log('🚀 App starting, loading initial data...');
    const localData = LocalStorageService.load();
    if (localData) {
      // Migrate weekly tasks that don't have status field
      const migratedLocalData = {
        ...localData,
        weeklyTasks: localData.weeklyTasks?.map(task => {
          const hasStatus = task.status !== undefined && task.status !== null;
          const normalizedStatus = task.status || (task.completed ? 'done' : 'todo');
          
          if (!hasStatus) {
            console.log(`🔄 Migrating localStorage task "${task.title}" - adding status: ${normalizedStatus}`);
          }
          
          return {
            ...task,
            status: normalizedStatus,
            completed: normalizedStatus === 'done' || task.completed
          };
        }) || []
      };
      
      originalDispatch({ type: 'LOAD_STATE', payload: migratedLocalData });
      
      // Save migrated data back to localStorage if any tasks were migrated
      const tasksNeedingMigration = localData.weeklyTasks?.filter(task => 
        task.status === undefined || task.status === null
      ) || [];
      
      if (tasksNeedingMigration.length > 0) {
        console.log(`🔄 Saving ${tasksNeedingMigration.length} migrated tasks back to localStorage...`);
        LocalStorageService.save(migratedLocalData);
      }
      
      console.log('📂 Initial data loaded from localStorage with migration');
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
          originalDispatch({ type: 'SET_LOADING', payload: true });
          console.log('🔄 Loading data from Firebase...');
          const userData = await service.loadAllData();
          
          // Get existing localStorage data to preserve local-only data like goalUpdates
          const existingLocalData = LocalStorageService.load();
          
          // Migrate weekly tasks that don't have status field
          const migratedUserData = {
            ...userData,
            // Preserve goalUpdates from localStorage since Firebase doesn't store them yet
            goalUpdates: existingLocalData?.goalUpdates || [],
            weeklyTasks: userData.weeklyTasks.map(task => {
              const hasStatus = task.status !== undefined && task.status !== null;
              const normalizedStatus = task.status || (task.completed ? 'done' : 'todo');
              
              if (!hasStatus) {
                console.log(`🔄 Migrating task "${task.title}" - adding status: ${normalizedStatus}`);
              }
              
              return {
                ...task,
                status: normalizedStatus,
                completed: normalizedStatus === 'done' || task.completed
              };
            })
          };
          
          originalDispatch({ type: 'LOAD_STATE', payload: migratedUserData });
          
          // Force save migrated tasks back to Firebase if any were migrated
          const tasksNeedingMigration = userData.weeklyTasks.filter(task => 
            task.status === undefined || task.status === null
          );
          
          if (tasksNeedingMigration.length > 0) {
            console.log(`🔄 Force-saving ${tasksNeedingMigration.length} migrated tasks to Firebase...`);
            // Save migrated tasks back to Firebase
            for (const originalTask of tasksNeedingMigration) {
              const migratedTask = migratedUserData.weeklyTasks.find(t => t.id === originalTask.id);
              if (migratedTask) {
                try {
                  await service.updateWeeklyTask(migratedTask);
                  console.log(`✅ Migrated task "${migratedTask.title}" saved to Firebase`);
                } catch (error) {
                  console.warn(`⚠️ Failed to save migrated task "${migratedTask.title}":`, error);
                }
              }
            }
          }
          
          console.log('✅ Data loaded from Firebase with status migration');
        } catch (error) {
          console.warn('⚠️ Failed to load from Firebase, trying localStorage:', error);
          // Fallback to localStorage
          const localData = LocalStorageService.load();
          if (localData) {
            originalDispatch({ type: 'LOAD_STATE', payload: localData });
            console.log('📂 Data loaded from localStorage');
          } else {
            console.log('💭 No local data found, starting fresh');
          }
        } finally {
          originalDispatch({ type: 'SET_LOADING', payload: false });
        }
      };
      
      loadData();
    } else {
      setFirebaseService(null);
      
      // Load from localStorage when not authenticated
      console.log('👤 No user authenticated, loading from localStorage...');
      const localData = LocalStorageService.load();
      if (localData) {
        originalDispatch({ type: 'LOAD_STATE', payload: localData });
        console.log('📂 Data loaded from localStorage (no auth)');
      } else {
        originalDispatch({ type: 'LOAD_STATE', payload: initialState });
        console.log('💭 No local data found, starting fresh (no auth)');
      }
    }
  }, [user]);

  // Initialize task rollover service
  useEffect(() => {
    // Initialize rollover service
    taskRolloverService.initialize();
    
    // Register rollover callback to handle task rollover
    const handleRollover = (rolloverData: { tasksToAdd: WeeklyTask[]; tasksToRemove: WeeklyTask[] }) => {
      const { tasksToAdd, tasksToRemove } = rolloverData;
      
      console.log(`🔄 Rolling over ${tasksToAdd.length} tasks: removing ${tasksToRemove.length} original tasks and adding ${tasksToAdd.length} rolled over tasks`);
      
      // First, remove the original incomplete tasks from previous week
      tasksToRemove.forEach(originalTask => {
        console.log(`🗑️ Removing original task: "${originalTask.title}" (ID: ${originalTask.id})`);
        originalDispatch({ type: 'DELETE_WEEKLY_TASK', payload: originalTask.id });
      });
      
      // Then add each rolled over task to current week
      tasksToAdd.forEach(task => {
        console.log(`📝 Adding rolled over task: "${task.title}" (ID: ${task.id})`);
        originalDispatch({ type: 'ADD_WEEKLY_TASK', payload: task });
      });
      
      // Log activity for rollover
      const activityLog = createActivityLog(
        'SYSTEM_ROLLOVER',
        `Rolled over ${tasksToAdd.length} task${tasksToAdd.length === 1 ? '' : 's'}`,
        `Automatically moved incomplete tasks from previous week to current week`,
        undefined,
        'system',
        { taskCount: tasksToAdd.length, rolloverDate: new Date() }
      );
      originalDispatch({ type: 'ADD_ACTIVITY_LOG', payload: activityLog });
    };
    
    taskRolloverService.onRollover(handleRollover);
    
    // Cleanup on unmount
    return () => {
      taskRolloverService.offRollover(handleRollover);
    };
  }, []);

  // Trigger rollover check when tasks are loaded or updated
  useEffect(() => {
    if (state.weeklyTasks.length > 0 && !state.loading) {
      // Check for rollover with current tasks
      taskRolloverService.checkAndPerformRollover(state.weeklyTasks);
    }
  }, [state.weeklyTasks, state.loading]);

  // Enhanced dispatch that automatically saves to Firebase with localStorage fallback
  const enhancedDispatch = async (action: Action) => {
    // Calculate the new state using the reducer logic BEFORE dispatching
    const newState = appReducer(state, action);
    
    // Handle activity logging for DELETE_LIFE_GOAL with meta
    if (action.type === 'DELETE_LIFE_GOAL' && action.meta?.activityLog) {
      console.log('📝 Adding activity log for life goal deletion');
      const activityLog = createActivityLog(
        action.meta.activityLog.type,
        action.meta.activityLog.title,
        action.meta.activityLog.description,
        action.meta.activityLog.entityId,
        action.meta.activityLog.entityType,
        action.meta.activityLog.metadata
      );
      
      // Add the activity log to the new state
      const newActivityLogs = [activityLog, ...newState.activityLogs].slice(0, 30);
      newState.activityLogs = newActivityLogs;
    }
    
    // Save the new state to localStorage immediately - this should NEVER fail
    try {
      const stateToSave = {
        lifeGoals: newState.lifeGoals,
        annualGoals: newState.annualGoals,
        quarterlyGoals: newState.quarterlyGoals,
        weeklyTasks: newState.weeklyTasks,
        weeklyReviews: newState.weeklyReviews,
        activityLogs: newState.activityLogs,
        checkIns: newState.checkIns,
        goalUpdates: newState.goalUpdates,
        currentYear: newState.currentYear,
        currentQuarter: newState.currentQuarter,
      };
      
      // Debug logging for Firebase sync
      if (action.type === 'UPDATE_QUARTERLY_GOAL') {
        console.log('🔄 Will also sync updated annual goals to Firebase...');
      }
      
      LocalStorageService.save(stateToSave);
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
    
    // Update the UI immediately - this should also never fail
    originalDispatch(action);
    
    // Add activity log to UI if we created one
    if (action.type === 'DELETE_LIFE_GOAL' && action.meta?.activityLog) {
      const activityLog = createActivityLog(
        action.meta.activityLog.type,
        action.meta.activityLog.title,
        action.meta.activityLog.description,
        action.meta.activityLog.entityId,
        action.meta.activityLog.entityType,
        action.meta.activityLog.metadata
      );
      originalDispatch({ type: 'ADD_ACTIVITY_LOG', payload: activityLog });
    }
    
    // Firebase operations are completely separate and asynchronous
    // They run in the background and don't block localStorage or UI updates
    if (firebaseService) {
      console.log('🔄 Firebase service available, starting background sync...');
      // Don't await this - let it run in background
      handleFirebaseSync(action, firebaseService).catch(error => {
        console.warn('⚠️ Firebase sync failed (but localStorage is safe):', error);
      });
    } else {
      console.log('📱 Firebase service not available - user might not be authenticated');
    }
  };

  // Separate function to handle Firebase sync
  const handleFirebaseSync = async (action: Action, firebaseService: FirebaseService) => {
    try {
      console.log('🔄 Syncing with Firebase...');
      
      switch (action.type) {
        case 'ADD_LIFE_GOAL':
          const lifeGoalId = await firebaseService.addLifeGoal(action.payload);
          originalDispatch({ type: 'UPDATE_LIFE_GOAL', payload: { ...action.payload, id: lifeGoalId } });
          toastService.showFirebaseSuccess('created', 'Life Goal', action.payload.title);
          break;
        case 'UPDATE_LIFE_GOAL':
          await firebaseService.updateLifeGoal(action.payload);
          toastService.showFirebaseSuccess('updated', 'Life Goal', action.payload.title);
          break;
        case 'DELETE_LIFE_GOAL':
          console.log('🔄 AppContext: Starting Firebase life goal deletion for ID:', action.payload);
          await firebaseService.deleteLifeGoal(action.payload);
          console.log('✅ Firebase life goal deletion completed');
          toastService.showFirebaseSuccess('deleted', 'Life Goal');
          break;
        case 'ADD_ANNUAL_GOAL':
          const annualId = await firebaseService.addAnnualGoal(action.payload);
          originalDispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: { ...action.payload, id: annualId } });
          toastService.showFirebaseSuccess('created', 'Annual Goal', action.payload.title);
          break;
        case 'UPDATE_ANNUAL_GOAL':
          await firebaseService.updateAnnualGoal(action.payload);
          toastService.showFirebaseSuccess('updated', 'Annual Goal', action.payload.title);
          break;
        case 'DELETE_ANNUAL_GOAL':
          await firebaseService.deleteAnnualGoal(action.payload);
          toastService.showFirebaseSuccess('deleted', 'Annual Goal');
          break;
        case 'ADD_QUARTERLY_GOAL':
          const quarterlyId = await firebaseService.addQuarterlyGoal(action.payload);
          originalDispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: { ...action.payload, id: quarterlyId } });
          toastService.showFirebaseSuccess('created', 'Quarterly Goal', action.payload.title);
          break;
        case 'UPDATE_QUARTERLY_GOAL':
          await firebaseService.updateQuarterlyGoal(action.payload);
          toastService.showFirebaseSuccess('updated', 'Quarterly Goal', action.payload.title);
          
          // Also sync any annual goals that were automatically updated
          const currentState = state;
          const updatedQuarterlyGoals = currentState.quarterlyGoals.map(goal =>
            goal.id === action.payload.id ? action.payload : goal
          );
          const updatedAnnualGoals = updateAnnualGoalProgress(currentState, updatedQuarterlyGoals);
          
          // Sync each annual goal that was updated
          for (const annualGoal of updatedAnnualGoals) {
            const originalAnnualGoal = currentState.annualGoals.find(g => g.id === annualGoal.id);
            if (originalAnnualGoal && originalAnnualGoal.progress !== annualGoal.progress) {
              console.log(`🔄 Syncing automatically updated annual goal: ${annualGoal.title} (${originalAnnualGoal.progress}% → ${annualGoal.progress}%)`);
              await firebaseService.updateAnnualGoal(annualGoal);
            }
          }
          break;
        case 'DELETE_QUARTERLY_GOAL':
          await firebaseService.deleteQuarterlyGoal(action.payload);
          toastService.showFirebaseSuccess('deleted', 'Quarterly Goal');
          break;
        case 'ADD_WEEKLY_TASK':
          const taskId = await firebaseService.addWeeklyTask(action.payload);
          originalDispatch({ type: 'UPDATE_WEEKLY_TASK', payload: { ...action.payload, id: taskId } });
          toastService.showFirebaseSuccess('created', 'Weekly Task', action.payload.title);
          break;
        case 'UPDATE_WEEKLY_TASK':
          await firebaseService.updateWeeklyTask(action.payload);
          toastService.showFirebaseSuccess('updated', 'Weekly Task', action.payload.title);
          break;
        case 'DELETE_WEEKLY_TASK':
          await firebaseService.deleteWeeklyTask(action.payload);
          toastService.showFirebaseSuccess('deleted', 'Weekly Task');
          break;
        case 'ADD_WEEKLY_REVIEW':
          const reviewId = await firebaseService.addWeeklyReview(action.payload);
          originalDispatch({ type: 'UPDATE_WEEKLY_REVIEW', payload: { ...action.payload, id: reviewId } });
          toastService.showFirebaseSuccess('saved', 'Weekly Review');
          break;
        case 'UPDATE_WEEKLY_REVIEW':
          await firebaseService.updateWeeklyReview(action.payload);
          toastService.showFirebaseSuccess('updated', 'Weekly Review');
          break;
        case 'ADD_CHECK_IN':
          await firebaseService.addCheckIn(action.payload);
          toastService.showFirebaseSuccess('saved', 'Check-in');
          break;
      }
      console.log('✅ Firebase sync completed');
    } catch (error) {
      console.warn('⚠️ Firebase sync failed:', error);
      
      // Show error toast based on the action type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      switch (action.type) {
        case 'ADD_LIFE_GOAL':
          toastService.showFirebaseError('create', 'Life Goal', errorMessage);
          break;
        case 'UPDATE_LIFE_GOAL':
          toastService.showFirebaseError('update', 'Life Goal', errorMessage);
          break;
        case 'DELETE_LIFE_GOAL':
          toastService.showFirebaseError('delete', 'Life Goal', errorMessage);
          break;
        case 'ADD_ANNUAL_GOAL':
          toastService.showFirebaseError('create', 'Annual Goal', errorMessage);
          break;
        case 'UPDATE_ANNUAL_GOAL':
          toastService.showFirebaseError('update', 'Annual Goal', errorMessage);
          break;
        case 'DELETE_ANNUAL_GOAL':
          toastService.showFirebaseError('delete', 'Annual Goal', errorMessage);
          break;
        case 'ADD_QUARTERLY_GOAL':
          toastService.showFirebaseError('create', 'Quarterly Goal', errorMessage);
          break;
        case 'UPDATE_QUARTERLY_GOAL':
          toastService.showFirebaseError('update', 'Quarterly Goal', errorMessage);
          break;
        case 'DELETE_QUARTERLY_GOAL':
          toastService.showFirebaseError('delete', 'Quarterly Goal', errorMessage);
          break;
        case 'ADD_WEEKLY_TASK':
          toastService.showFirebaseError('create', 'Weekly Task', errorMessage);
          break;
        case 'UPDATE_WEEKLY_TASK':
          toastService.showFirebaseError('update', 'Weekly Task', errorMessage);
          break;
        case 'DELETE_WEEKLY_TASK':
          toastService.showFirebaseError('delete', 'Weekly Task', errorMessage);
          break;
        case 'ADD_WEEKLY_REVIEW':
          toastService.showFirebaseError('save', 'Weekly Review', errorMessage);
          break;
        case 'UPDATE_WEEKLY_REVIEW':
          toastService.showFirebaseError('update', 'Weekly Review', errorMessage);
          break;
        case 'ADD_CHECK_IN':
          toastService.showFirebaseError('save', 'Check-in', errorMessage);
          break;
        default:
          toastService.error('Sync Failed', `Failed to sync data: ${errorMessage}`);
      }
      
      throw error; // Re-throw so the catch in enhancedDispatch logs it
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

// Utility function to create activity logs
export function createActivityLog(
  type: ActivityLog['type'],
  title: string,
  description: string,
  entityId?: string,
  entityType?: ActivityLog['entityType'],
  metadata?: Record<string, any>
): ActivityLog {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    description,
    timestamp: new Date(),
    entityId,
    entityType,
    metadata,
  };
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  // Enhanced dispatch with automatic activity logging
  const logActivity = (activityLog: ActivityLog) => {
    context.dispatch({ type: 'ADD_ACTIVITY_LOG', payload: activityLog });
  };
  
  return {
    ...context,
    logActivity,
    createActivityLog,
  };
}
