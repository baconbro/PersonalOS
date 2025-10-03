import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Plus, 
  Edit,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronDown,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyticsService } from '../services/analyticsService';
import type { LifeGoal, AnnualGoal, QuarterlyGoal, WeeklyTask } from '../types';
import './GoalDetails.css';

interface GoalDetailsProps {
  goalId: string;
  goalType: 'life' | 'annual' | 'quarterly' | 'weekly';
  onBack: () => void;
}

const GoalDetails: React.FC<GoalDetailsProps> = ({ goalId, goalType, onBack }) => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'about' | 'updates' | 'learnings' | 'roadblocks' | 'decisions' | 'wins' | 'check-ins'>('updates');
  const [newUpdate, setNewUpdate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('on-track');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Oct-Dec');
  const [datePickerTab, setDatePickerTab] = useState<'quarter' | 'month' | 'day'>('quarter');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11); // December (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(31);

  // Individual field edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedProgress, setEditedProgress] = useState(0);
  const [editedPriority, setEditedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editedStatus, setEditedStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'on-hold'>('not-started');
  
  // Rich text editor state
  const [richTextFocused, setRichTextFocused] = useState(false);
  const richTextEditorRef = useRef<HTMLDivElement>(null);

  // Decisions state (kept for future use)
  const goalDecisions: any[] = [];
  
  // Get goal updates from context, filtered by current goal
  const goalUpdates = state.goalUpdates.filter(update => update.goalId === goalId);

  // Annual goal specific fields
  const [whyImportant, setWhyImportant] = useState('');
  const [myPlan, setMyPlan] = useState('');
  const [currentBarrier, setCurrentBarrier] = useState('');
  const [myReward, setMyReward] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'PENDING', color: '#6b7280' },
    { value: 'on-track', label: 'ON TRACK', color: '#22c55e' },
    { value: 'at-risk', label: 'AT RISK', color: '#f59e0b' },
    { value: 'off-track', label: 'OFF TRACK', color: '#ef4444' },
    { value: 'completed', label: 'COMPLETED', color: '#6b7280' },
    { value: 'paused', label: 'PAUSED', color: '#6b7280' },
    { value: 'cancelled', label: 'CANCELLED', color: '#6b7280' }
  ];

  const quarters = [
    { value: 'Jan-Mar', label: 'Jan-Mar', quarter: 'Q1' },
    { value: 'Apr-Jun', label: 'Apr-Jun', quarter: 'Q2' },
    { value: 'Jul-Sep', label: 'Jul-Sep', quarter: 'Q3' },
    { value: 'Oct-Dec', label: 'Oct-Dec', quarter: 'Q4' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth + 1, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const daysFromPrevMonth = getDaysInMonth(selectedMonth, selectedYear);
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysFromPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }
    
    // Next month's leading days
    const remainingSlots = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }
    
    return days;
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDay(day);
      const date = new Date(selectedYear, selectedMonth, day);
      setSelectedDate(date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Find the goal based on type and ID
  const getGoal = () => {
    switch (goalType) {
      case 'life':
        return state.lifeGoals.find(goal => goal.id === goalId);
      case 'annual':
        return state.annualGoals.find(goal => goal.id === goalId);
      case 'quarterly':
        return state.quarterlyGoals.find(goal => goal.id === goalId);
      case 'weekly':
        return state.weeklyTasks.find(task => task.id === goalId);
      default:
        return null;
    }
  };

  const goal = getGoal();

  // Initialize edit form when entering edit mode
  // Start editing a specific field
  const startEditingField = (fieldName: string) => {
    if (goal) {
      setEditingField(fieldName);
      
      // Initialize the edited value based on field
      switch (fieldName) {
        case 'title':
          setEditedTitle(goal.title);
          break;
        case 'description':
          setEditedDescription(goal.description || '');
          // Set initial content for rich text editor
          setTimeout(() => {
            if (richTextEditorRef.current) {
              richTextEditorRef.current.innerHTML = goal.description || '';
            }
          }, 0);
          break;
        case 'progress':
          if ('progress' in goal) {
            setEditedProgress(goal.progress || 0);
          }
          break;
        case 'priority':
          setEditedPriority(goal.priority);
          break;
        case 'status':
          if (goalType === 'weekly') {
            const weeklyTask = goal as any;
            const mappedStatus = weeklyTask.status === 'todo' ? 'not-started' : 
                               weeklyTask.status === 'in-progress' ? 'in-progress' : 
                               weeklyTask.status === 'done' ? 'completed' : 'not-started';
            setEditedStatus(mappedStatus);
          } else {
            setEditedStatus(goal.status as 'not-started' | 'in-progress' | 'completed' | 'on-hold');
          }
          break;
      }
      
      // Track field edit started
      analyticsService.trackEvent('goal_field_edit_started', {
        goal_id: goalId,
        goal_type: goalType,
        field: fieldName
      });
    }
  };

  const cancelEditingField = () => {
    setEditingField(null);
    setEditedTitle('');
    setEditedDescription('');
    setEditedProgress(0);
    setEditedPriority('medium');
    setEditedStatus('not-started');
    
    analyticsService.trackEvent('goal_field_edit_cancelled', {
      goal_id: goalId,
      goal_type: goalType,
      field: editingField
    });
  };

  const saveChanges = () => {
    if (!goal || !editingField) return;

    // Create base update with only the field being edited
    const baseUpdate = {
      ...goal,
      updatedAt: new Date()
    };

    // Update only the specific field being edited
    switch (editingField) {
      case 'title':
        baseUpdate.title = editedTitle.trim();
        break;
      case 'description':
        baseUpdate.description = editedDescription.trim();
        break;
      case 'progress':
        if ('progress' in goal) {
          (baseUpdate as any).progress = editedProgress;
        }
        break;
      case 'priority':
        baseUpdate.priority = editedPriority;
        break;
      case 'status':
        if (goalType === 'weekly') {
          const weeklyStatus = editedStatus === 'not-started' ? 'todo' : 
                             editedStatus === 'in-progress' ? 'in-progress' : 
                             editedStatus === 'completed' ? 'done' : 'todo';
          baseUpdate.status = weeklyStatus as 'todo' | 'in-progress' | 'done';
        } else {
          baseUpdate.status = editedStatus;
        }
        break;
    }

    // Dispatch the appropriate update action based on goal type
    switch (goalType) {
      case 'life': {
        dispatch({ type: 'UPDATE_LIFE_GOAL', payload: baseUpdate as LifeGoal });
        break;
      }
      case 'annual': {
        dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: baseUpdate as AnnualGoal });
        break;
      }
      case 'quarterly': {
        dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: baseUpdate as QuarterlyGoal });
        break;
      }
      case 'weekly': {
        dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: baseUpdate as WeeklyTask });
        break;
      }
    }

    // Track successful save
    analyticsService.trackEvent('goal_field_updated', {
      goal_id: goalId,
      goal_type: goalType,
      field: editingField,
      new_value: editingField === 'title' ? editedTitle :
                editingField === 'description' ? editedDescription :
                editingField === 'progress' ? editedProgress :
                editingField === 'priority' ? editedPriority :
                editingField === 'status' ? editedStatus : 'unknown'
    });

    setEditingField(null);
  };

  // Rich text editor functions
  const applyFormatting = (command: string) => {
    switch (command) {
      case 'bold':
        document.execCommand('bold', false, undefined);
        break;
      case 'italic':
        document.execCommand('italic', false, undefined);
        break;
      case 'underline':
        document.execCommand('underline', false, undefined);
        break;
      case 'unorderedList':
        document.execCommand('insertUnorderedList', false, undefined);
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList', false, undefined);
        break;
      case 'heading':
        // Toggle between H3 and normal text
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentElement 
            : range.commonAncestorContainer as Element;
          
          if (parentElement?.tagName === 'H3') {
            document.execCommand('formatBlock', false, '<p>');
          } else {
            document.execCommand('formatBlock', false, '<h3>');
          }
        }
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
    }
    richTextEditorRef.current?.focus();
    handleRichTextChange();
  };

  const handleRichTextChange = () => {
    if (richTextEditorRef.current) {
      setEditedDescription(richTextEditorRef.current.innerHTML);
    }
  };

  // Function to handle creating new updates
  const handleCreateUpdate = () => {
    if (newUpdate.trim()) {
      const update = {
        id: Date.now().toString(),
        goalId,
        goalType,
        content: newUpdate.trim(),
        status: selectedStatus,
        targetDate: selectedDate,
        createdAt: new Date(),
        author: 'Current User' // This would come from auth context in a real app
      };
      
      // Add update to list through context
      dispatch({ type: 'ADD_GOAL_UPDATE', payload: update });
      setNewUpdate('');
      
      // Track update creation
      analyticsService.trackEvent('goal_update_created', {
        goal_id: goalId,
        goal_type: goalType,
        status: selectedStatus,
        content_length: newUpdate.trim().length
      });
    }
  };

  // Get weekly review learnings linked to this goal AND its children
  const getLinkedLearnings = () => {
    if (!goal) return [];
    
    const linkedLearnings: Array<{
      id: string;
      text: string;
      weekOf: Date;
      reviewId: string;
      linkedToGoalId: string;
      linkedToGoalTitle: string;
      linkedToGoalType: string;
      isDirectLink: boolean;
    }> = [];

    // Get all child goal IDs for this goal
    const getChildGoalIds = (currentGoalId: string, currentGoalType: string): string[] => {
      const childIds: string[] = [currentGoalId]; // Include the goal itself
      
      switch (currentGoalType) {
        case 'life':
          // Life goal children are annual goals with lifeGoalId reference
          state.annualGoals
            .filter(ag => ag.lifeGoalId === currentGoalId)
            .forEach(ag => {
              childIds.push(...getChildGoalIds(ag.id, 'annual'));
            });
          break;
        case 'annual':
          // Annual goal children are quarterly goals with annualGoalId reference
          state.quarterlyGoals
            .filter(qg => qg.annualGoalId === currentGoalId)
            .forEach(qg => {
              childIds.push(...getChildGoalIds(qg.id, 'quarterly'));
            });
          break;
        case 'quarterly':
          // Quarterly goal children are weekly tasks with quarterlyGoalId reference
          state.weeklyTasks
            .filter(wt => wt.quarterlyGoalId === currentGoalId)
            .forEach(wt => {
              childIds.push(wt.id);
            });
          break;
      }
      
      return childIds;
    };

    const relevantGoalIds = getChildGoalIds(goalId, goalType);

    // Helper function to get goal info by ID
    const getGoalInfo = (id: string) => {
      // Check life goals
      const lifeGoal = state.lifeGoals.find(lg => lg.id === id);
      if (lifeGoal) return { title: lifeGoal.title, type: 'life' };
      
      // Check annual goals
      const annualGoal = state.annualGoals.find(ag => ag.id === id);
      if (annualGoal) return { title: annualGoal.title, type: 'annual' };
      
      // Check quarterly goals
      const quarterlyGoal = state.quarterlyGoals.find(qg => qg.id === id);
      if (quarterlyGoal) return { title: quarterlyGoal.title, type: 'quarterly' };
      
      // Check weekly tasks
      const weeklyTask = state.weeklyTasks.find(wt => wt.id === id);
      if (weeklyTask) return { title: weeklyTask.title, type: 'task' };
      
      return { title: 'Unknown Goal', type: 'unknown' };
    };

    // Search through all weekly reviews
    state.weeklyReviews.forEach(review => {
      // Check if this review has lesson links (new format: Record<string, LinkedReflection>)
      if (review.lessonLink && typeof review.lessonLink === 'object') {
        // Split the keyLesson back into individual lessons
        const lessonTexts = review.keyLesson ? review.keyLesson.split('\n').filter((text: string) => text.trim()) : [];
        
        // Handle new format where lessonLink is Record<string, LinkedReflection>
        const lessonEntries = Object.entries(review.lessonLink as Record<string, any>);
        
        lessonEntries.forEach(([lessonId, link]) => {
          if (relevantGoalIds.includes(link.goalId)) {
            // Find the lesson text that corresponds to this lessonId
            const lessonIndex = parseInt(lessonId.split('-').pop() || '0');
            const lessonText = lessonTexts[lessonIndex] || lessonTexts[0] || review.keyLesson || '';
            
            if (lessonText.trim()) {
              const goalInfo = getGoalInfo(link.goalId);
              linkedLearnings.push({
                id: `${review.id}-lesson-${lessonId}`,
                text: lessonText.trim(),
                weekOf: review.weekOf,
                reviewId: review.id,
                linkedToGoalId: link.goalId,
                linkedToGoalTitle: goalInfo.title,
                linkedToGoalType: goalInfo.type,
                isDirectLink: link.goalId === goalId
              });
            }
          }
        });
      }
      // Handle legacy format where lessonLink is a single LinkedReflection
      else if (review.lessonLink && relevantGoalIds.includes((review.lessonLink as any).goalId)) {
        const lessonText = review.keyLesson || '';
        if (lessonText.trim()) {
          const goalInfo = getGoalInfo((review.lessonLink as any).goalId);
          linkedLearnings.push({
            id: `${review.id}-lesson-legacy`,
            text: lessonText.trim(),
            weekOf: review.weekOf,
            reviewId: review.id,
            linkedToGoalId: (review.lessonLink as any).goalId,
            linkedToGoalTitle: goalInfo.title,
            linkedToGoalType: goalInfo.type,
            isDirectLink: (review.lessonLink as any).goalId === goalId
          });
        }
      }
    });

    // Sort by most recent first
    return linkedLearnings.sort((a, b) => new Date(b.weekOf).getTime() - new Date(a.weekOf).getTime());
  };

  // Get weekly review roadblocks (gaps) linked to this goal AND its children
  const getLinkedRoadblocks = () => {
    if (!goal) return [];
    
    const linkedRoadblocks: Array<{
      id: string;
      text: string;
      weekOf: Date;
      reviewId: string;
      linkedToGoalId: string;
      linkedToGoalTitle: string;
      linkedToGoalType: string;
      isDirectLink: boolean;
    }> = [];

    // Get all child goal IDs for this goal (reuse the same function)
    const getChildGoalIds = (currentGoalId: string, currentGoalType: string): string[] => {
      const childIds: string[] = [currentGoalId];
      
      switch (currentGoalType) {
        case 'life':
          state.annualGoals
            .filter(ag => ag.lifeGoalId === currentGoalId)
            .forEach(ag => {
              childIds.push(...getChildGoalIds(ag.id, 'annual'));
            });
          break;
        case 'annual':
          state.quarterlyGoals
            .filter(qg => qg.annualGoalId === currentGoalId)
            .forEach(qg => {
              childIds.push(...getChildGoalIds(qg.id, 'quarterly'));
            });
          break;
        case 'quarterly':
          state.weeklyTasks
            .filter(wt => wt.quarterlyGoalId === currentGoalId)
            .forEach(wt => {
              childIds.push(wt.id);
            });
          break;
      }
      
      return childIds;
    };

    const relevantGoalIds = getChildGoalIds(goalId, goalType);

    // Helper function to get goal info by ID
    const getGoalInfo = (id: string) => {
      const lifeGoal = state.lifeGoals.find(lg => lg.id === id);
      if (lifeGoal) return { title: lifeGoal.title, type: 'life' };
      
      const annualGoal = state.annualGoals.find(ag => ag.id === id);
      if (annualGoal) return { title: annualGoal.title, type: 'annual' };
      
      const quarterlyGoal = state.quarterlyGoals.find(qg => qg.id === id);
      if (quarterlyGoal) return { title: quarterlyGoal.title, type: 'quarterly' };
      
      const weeklyTask = state.weeklyTasks.find(wt => wt.id === id);
      if (weeklyTask) return { title: weeklyTask.title, type: 'task' };
      
      return { title: 'Unknown Goal', type: 'unknown' };
    };

    // Search through all weekly reviews
    state.weeklyReviews.forEach(review => {
      // Check if this review has gap links (new format: Record<string, LinkedReflection>)
      if (review.gapsLink && typeof review.gapsLink === 'object') {
        // Split the gapsAnalysis back into individual items
        const gapTexts = review.gapsAnalysis ? review.gapsAnalysis.split('\n').filter((text: string) => text.trim()) : [];
        
        // Handle new format where gapsLink is Record<string, LinkedReflection>
        const gapEntries = Object.entries(review.gapsLink as Record<string, any>);
        
        gapEntries.forEach(([gapId, link]) => {
          if (relevantGoalIds.includes(link.goalId)) {
            // Find the gap text that corresponds to this gapId
            const gapIndex = parseInt(gapId.split('-').pop() || '0');
            const gapText = gapTexts[gapIndex] || gapTexts[0] || review.gapsAnalysis || '';
            
            if (gapText.trim()) {
              const goalInfo = getGoalInfo(link.goalId);
              linkedRoadblocks.push({
                id: `${review.id}-gap-${gapId}`,
                text: gapText.trim(),
                weekOf: review.weekOf,
                reviewId: review.id,
                linkedToGoalId: link.goalId,
                linkedToGoalTitle: goalInfo.title,
                linkedToGoalType: goalInfo.type,
                isDirectLink: link.goalId === goalId
              });
            }
          }
        });
      }
      // Handle legacy format where gapsLink is a single LinkedReflection
      else if (review.gapsLink && relevantGoalIds.includes((review.gapsLink as any).goalId)) {
        const gapText = review.gapsAnalysis || '';
        if (gapText.trim()) {
          const goalInfo = getGoalInfo((review.gapsLink as any).goalId);
          linkedRoadblocks.push({
            id: `${review.id}-gap-legacy`,
            text: gapText.trim(),
            weekOf: review.weekOf,
            reviewId: review.id,
            linkedToGoalId: (review.gapsLink as any).goalId,
            linkedToGoalTitle: goalInfo.title,
            linkedToGoalType: goalInfo.type,
            isDirectLink: (review.gapsLink as any).goalId === goalId
          });
        }
      }
    });

    // Sort by most recent first
    return linkedRoadblocks.sort((a, b) => new Date(b.weekOf).getTime() - new Date(a.weekOf).getTime());
  };

  // Get weekly review wins linked to this goal AND its children
  const getLinkedWins = () => {
    if (!goal) return [];
    
    const linkedWins: Array<{
      id: string;
      text: string;
      weekOf: Date;
      reviewId: string;
      linkedToGoalId: string;
      linkedToGoalTitle: string;
      linkedToGoalType: string;
      isDirectLink: boolean;
    }> = [];

    // Get all child goal IDs for this goal (reuse the same function)
    const getChildGoalIds = (currentGoalId: string, currentGoalType: string): string[] => {
      const childIds: string[] = [currentGoalId];
      
      switch (currentGoalType) {
        case 'life':
          state.annualGoals
            .filter(ag => ag.lifeGoalId === currentGoalId)
            .forEach(ag => {
              childIds.push(...getChildGoalIds(ag.id, 'annual'));
            });
          break;
        case 'annual':
          state.quarterlyGoals
            .filter(qg => qg.annualGoalId === currentGoalId)
            .forEach(qg => {
              childIds.push(...getChildGoalIds(qg.id, 'quarterly'));
            });
          break;
        case 'quarterly':
          state.weeklyTasks
            .filter(wt => wt.quarterlyGoalId === currentGoalId)
            .forEach(wt => {
              childIds.push(wt.id);
            });
          break;
      }
      
      return childIds;
    };

    const relevantGoalIds = getChildGoalIds(goalId, goalType);

    // Helper function to get goal info by ID
    const getGoalInfo = (id: string) => {
      const lifeGoal = state.lifeGoals.find(lg => lg.id === id);
      if (lifeGoal) return { title: lifeGoal.title, type: 'life' };
      
      const annualGoal = state.annualGoals.find(ag => ag.id === id);
      if (annualGoal) return { title: annualGoal.title, type: 'annual' };
      
      const quarterlyGoal = state.quarterlyGoals.find(qg => qg.id === id);
      if (quarterlyGoal) return { title: quarterlyGoal.title, type: 'quarterly' };
      
      const weeklyTask = state.weeklyTasks.find(wt => wt.id === id);
      if (weeklyTask) return { title: weeklyTask.title, type: 'task' };
      
      return { title: 'Unknown Goal', type: 'unknown' };
    };

    // Search through all weekly reviews
    state.weeklyReviews.forEach(review => {
      // Check if this review has win links (new format: Record<string, LinkedReflection>)
      if (review.winsLink && typeof review.winsLink === 'object') {
        // Split the winsReflection back into individual items
        const winTexts = review.winsReflection ? review.winsReflection.split('\n').filter((text: string) => text.trim()) : [];
        
        // Handle new format where winsLink is Record<string, LinkedReflection>
        const winEntries = Object.entries(review.winsLink as Record<string, any>);
        
        winEntries.forEach(([winId, link]) => {
          if (relevantGoalIds.includes(link.goalId)) {
            // Find the win text that corresponds to this winId
            const winIndex = parseInt(winId.split('-').pop() || '0');
            const winText = winTexts[winIndex] || winTexts[0] || review.winsReflection || '';
            
            if (winText.trim()) {
              const goalInfo = getGoalInfo(link.goalId);
              linkedWins.push({
                id: `${review.id}-win-${winId}`,
                text: winText.trim(),
                weekOf: review.weekOf,
                reviewId: review.id,
                linkedToGoalId: link.goalId,
                linkedToGoalTitle: goalInfo.title,
                linkedToGoalType: goalInfo.type,
                isDirectLink: link.goalId === goalId
              });
            }
          }
        });
      }
      // Handle legacy format where winsLink is a single LinkedReflection
      else if (review.winsLink && relevantGoalIds.includes((review.winsLink as any).goalId)) {
        const winText = review.winsReflection || '';
        if (winText.trim()) {
          const goalInfo = getGoalInfo((review.winsLink as any).goalId);
          linkedWins.push({
            id: `${review.id}-win-legacy`,
            text: winText.trim(),
            weekOf: review.weekOf,
            reviewId: review.id,
            linkedToGoalId: (review.winsLink as any).goalId,
            linkedToGoalTitle: goalInfo.title,
            linkedToGoalType: goalInfo.type,
            isDirectLink: (review.winsLink as any).goalId === goalId
          });
        }
      }
    });

    // Sort by most recent first
    return linkedWins.sort((a, b) => new Date(b.weekOf).getTime() - new Date(a.weekOf).getTime());
  };

  // Get check-ins linked to this goal
  const getLinkedCheckIns = () => {
    if (!goal) return [];
    
    return state.checkIns.filter(checkIn => checkIn.linkedGoalId === goalId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const linkedLearnings = getLinkedLearnings();
  const linkedRoadblocks = getLinkedRoadblocks();
  const linkedWins = getLinkedWins();
  const linkedCheckIns = getLinkedCheckIns();

  // Get parent goal based on goal type
  const getParentGoal = () => {
    if (!goal) return null;
    
    switch (goalType) {
      case 'annual':
        const annualGoal = goal as any;
        if (annualGoal.lifeGoalId) {
          return state.lifeGoals.find(lg => lg.id === annualGoal.lifeGoalId);
        }
        return null;
      case 'quarterly':
        const quarterlyGoal = goal as any;
        if (quarterlyGoal.annualGoalId) {
          return state.annualGoals.find(ag => ag.id === quarterlyGoal.annualGoalId);
        }
        return null;
      case 'weekly':
        const weeklyTask = goal as any;
        if (weeklyTask.quarterlyGoalId) {
          return state.quarterlyGoals.find(qg => qg.id === weeklyTask.quarterlyGoalId);
        }
        return null;
      default:
        return null;
    }
  };

  // Get child goals based on goal type
  const getChildGoals = () => {
    if (!goal) return [];
    
    console.log('Getting child goals for:', goalType, goal.id);
    
    switch (goalType) {
      case 'life':
        // Find annual goals that reference this life goal
        const lifeChildren = state.annualGoals.filter(ag => {
          console.log('Checking annual goal:', ag.id, 'lifeGoalId:', ag.lifeGoalId);
          return ag.lifeGoalId === goal.id;
        });
        console.log('Found life children:', lifeChildren);
        return lifeChildren;
      case 'annual':
        // Find quarterly goals that reference this annual goal
        const annualChildren = state.quarterlyGoals.filter(qg => {
          console.log('Checking quarterly goal:', qg.id, 'annualGoalId:', qg.annualGoalId);
          return qg.annualGoalId === goal.id;
        });
        console.log('Found annual children:', annualChildren);
        return annualChildren;
      case 'quarterly':
        // Find weekly tasks that reference this quarterly goal
        const quarterlyChildren = state.weeklyTasks.filter(wt => {
          console.log('Checking weekly task:', wt.id, 'quarterlyGoalId:', wt.quarterlyGoalId);
          return wt.quarterlyGoalId === goal.id;
        });
        console.log('Found quarterly children:', quarterlyChildren);
        return quarterlyChildren;
      default:
        return [];
    }
  };

  const parentGoal = getParentGoal();
  const childGoals = getChildGoals();

  // Debug logging
  if (goal) {
    console.log('Goal Details Debug:', {
      goalType,
      goalId,
      goal,
      parentGoal,
      childGoals,
      allAnnualGoals: state.annualGoals,
      allQuarterlyGoals: state.quarterlyGoals,
      allWeeklyTasks: state.weeklyTasks
    });
  }

  // Get goal type display name
  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'life': return 'Life Goal';
      case 'annual': return 'Annual Goal';
      case 'quarterly': return 'Quarterly Goal';
      case 'weekly': return 'Weekly Task';
      default: return 'Goal';
    }
  };

  // Get child goal type name
  const getChildGoalTypeName = () => {
    switch (goalType) {
      case 'life': return 'Annual Goals';
      case 'annual': return 'Quarterly Goals';
      case 'quarterly': return 'Weekly Tasks';
      default: return 'Sub-goals';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'on-track':
        return '#22c55e';
      case 'at-risk':
        return '#f59e0b';
      case 'blocked':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} />;
      case 'on-track':
        return <TrendingUp size={16} />;
      case 'at-risk':
        return <AlertTriangle size={16} />;
      case 'blocked':
        return <Circle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!goal) {
    return (
      <div className="goal-details-error">
        <h2>Goal not found</h2>
        <button onClick={onBack} className="btn-primary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="goal-details">
      {/* Header */}
      <div className="goal-details-header">
        <div className="goal-header-top">
          <div className="breadcrumb">
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={20} />
            </button>
            <span className="breadcrumb-text">Goals</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-text">{goalType.charAt(0).toUpperCase() + goalType.slice(1)} Goals</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{goal.title}</span>
          </div>
          <div className="header-actions">
            <button className="more-btn">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div className="goal-title-section">
          <div className="goal-icon">
            <Target size={24} />
          </div>
          <div className="goal-title-content">
            {editingField === 'title' ? (
              <div className="title-edit-container">
                <input 
                  type="text" 
                  className="goal-title-edit" 
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Goal title"
                  autoFocus
                />
                <div className="field-edit-actions">
                  <button className="save-btn" onClick={saveChanges} title="Save changes">
                    <Save size={16} />
                  </button>
                  <button className="cancel-btn" onClick={cancelEditingField} title="Cancel editing">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="title-display-container">
                <h1 className="goal-title" onClick={() => startEditingField('title')} title="Click to edit">
                  {goal.title}
                </h1>
              </div>
            )}
            <div className="goal-meta">
              <span className="goal-due-date">
                <Calendar size={14} />
                Next update due {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="goal-nav-tabs">
        {['about', 'updates', 'learnings', 'roadblocks', 'decisions', 'wins', 'check-ins'].map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === 'check-ins' ? 'Check-ins' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'updates' && <span className="tab-count">{goalUpdates.length}</span>}
            {tab === 'learnings' && <span className="tab-count">{linkedLearnings.length}</span>}
            {tab === 'roadblocks' && <span className="tab-count">{linkedRoadblocks.length}</span>}
            {tab === 'wins' && <span className="tab-count">{linkedWins.length}</span>}
            {tab === 'decisions' && <span className="tab-count">{goalDecisions.length}</span>}
            {tab === 'check-ins' && <span className="tab-count">{linkedCheckIns.length}</span>}
          </button>
        ))}
      </div>

      <div className="goal-content">
        {/* Main Content */}
        <div className="goal-main-content">
          {activeTab === 'updates' && (
            <div className="updates-section">
              {/* Status Update Form */}
              <div className="status-update-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>What is the current status?</label>
                    <div className="status-dropdown-container">
                      <button 
                        className="status-dropdown-trigger"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      >
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: statusOptions.find(opt => opt.value === selectedStatus)?.color,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}
                        >
                          {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                        </span>
                        <ChevronDown size={16} />
                      </button>
                      
                      {showStatusDropdown && (
                        <div className="status-dropdown-menu">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              className="status-option"
                              onClick={() => {
                                setSelectedStatus(option.value);
                                setShowStatusDropdown(false);
                              }}
                              style={{
                                backgroundColor: option.color,
                                color: 'white'
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-field">
                    <label>When will it be done?</label>
                    <div className="date-dropdown-container">
                      <button 
                        className="date-dropdown-trigger"
                        onClick={() => setShowDateDropdown(!showDateDropdown)}
                      >
                        <Calendar size={16} />
                        <span>{selectedDate}</span>
                        <ChevronDown size={16} />
                      </button>

                      {showDateDropdown && (
                        <div className="date-dropdown-menu">
                          <div className="date-picker-header">
                            <h4>Target date</h4>
                            <p>Help your followers understand when you're aiming to have achieved the desired outcome.</p>
                          </div>

                          <div className="date-picker-tabs">
                            <button 
                              className={`tab ${datePickerTab === 'day' ? 'active' : ''}`}
                              onClick={() => setDatePickerTab('day')}
                            >
                              Day
                            </button>
                            <button 
                              className={`tab ${datePickerTab === 'month' ? 'active' : ''}`}
                              onClick={() => setDatePickerTab('month')}
                            >
                              Month
                            </button>
                            <button 
                              className={`tab ${datePickerTab === 'quarter' ? 'active' : ''}`}
                              onClick={() => setDatePickerTab('quarter')}
                            >
                              Quarter
                            </button>
                          </div>

                          <div className="year-selector">
                            <button onClick={() => setSelectedYear(selectedYear - 1)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                              </svg>
                            </button>
                            <span className="year">{selectedYear}</span>
                            <button onClick={() => setSelectedYear(selectedYear + 1)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                              </svg>
                            </button>
                          </div>

                          {datePickerTab === 'quarter' && (
                            <div className="quarters-grid">
                              {quarters.map((quarter) => (
                                <button
                                  key={quarter.value}
                                  className={`quarter-option ${selectedDate === quarter.value ? 'selected' : ''}`}
                                  onClick={() => setSelectedDate(quarter.value)}
                                >
                                  {quarter.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {datePickerTab === 'month' && (
                            <div className="months-grid">
                              {months.map((month) => (
                                <button
                                  key={month}
                                  className={`month-option ${selectedDate === month ? 'selected' : ''}`}
                                  onClick={() => setSelectedDate(month)}
                                >
                                  {month}
                                </button>
                              ))}
                            </div>
                          )}

                          {datePickerTab === 'day' && (
                            <div className="calendar-container">
                              <div className="calendar-header">
                                <button onClick={() => navigateMonth('prev')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                  </svg>
                                </button>
                                <button onClick={() => navigateMonth('prev')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="11,17 6,12 11,7"></polyline>
                                    <polyline points="18,17 13,12 18,7"></polyline>
                                  </svg>
                                </button>
                                <span className="calendar-month-year">
                                  {monthNames[selectedMonth]} {selectedYear}
                                </span>
                                <button onClick={() => navigateMonth('next')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="13,17 18,12 13,7"></polyline>
                                    <polyline points="6,17 11,12 6,7"></polyline>
                                  </svg>
                                </button>
                                <button onClick={() => navigateMonth('next')}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="calendar-grid">
                                <div className="calendar-day-headers">
                                  {dayNames.map(day => (
                                    <div key={day} className="day-header">{day}</div>
                                  ))}
                                </div>
                                
                                <div className="calendar-days">
                                  {generateCalendarDays().map((dayObj, index) => (
                                    <button
                                      key={index}
                                      className={`calendar-day ${
                                        !dayObj.isCurrentMonth ? 'other-month' : ''
                                      } ${
                                        dayObj.isCurrentMonth && dayObj.day === selectedDay ? 'selected' : ''
                                      }`}
                                      onClick={() => handleDayClick(dayObj.day, dayObj.isCurrentMonth)}
                                    >
                                      {dayObj.day}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="date-picker-actions">
                            <button 
                              className="confirm-btn"
                              onClick={() => setShowDateDropdown(false)}
                            >
                              Confirm
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={() => setShowDateDropdown(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="update-textarea-container">
                  <textarea
                    placeholder="Write your 280 character update. Type /last to copy your last update, and ! to add more elements"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    className="update-textarea-enhanced"
                    rows={4}
                  />
                  <div className="char-count">
                    {newUpdate.length}/280
                  </div>
                </div>

                <div className="form-toolbar">
                  <div className="form-actions">
                    <button className="btn-primary-large" onClick={handleCreateUpdate}>Post</button>
                  </div>
                </div>

                {/* Notice */}
                <div className="update-notice">
                  <span className="notice-icon">⚠️</span>
                  We've noticed you're posting an update early this month and have a missed update from last month. If this post is for last month, update last month's entry instead.
                </div>
              </div>

              {/* Latest Update Section */}
              <div className="latest-update-section">
                <h3>Latest update</h3>
                <div className="update-item-enhanced">
                  <div className="update-header">
                    <div className="update-author">
                      <div className="author-avatar">FG</div>
                      <div className="author-info">
                        <span className="author-name">Frederic Gouverneur</span>
                        <span className="update-time">
                          8 Sep 2025 Last updated about 2 months ago
                        </span>
                      </div>
                    </div>
                    <div className="update-status">
                      <div className="status-indicator on-track">
                        <span className="status-text">11.5%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="no-update-message">
                    <p>No update was posted</p>
                    <button className="add-update-btn">Add update</button>
                  </div>

                  <div className="update-actions">
                    <button className="add-update-action">
                      <Plus size={16} />
                      Add update
                    </button>
                    <button className="comment-action">
                      💬 Add a comment... encourage them to keep going
                    </button>
                  </div>
                </div>
              </div>

              {/* Previous Updates */}
              <div className="previous-updates-section">
                <h3>Previous updates</h3>
                {goalUpdates.length > 0 ? (
                  <div className="updates-list">
                    {goalUpdates.map((update) => (
                      <div key={update.id} className="update-item-enhanced">
                        <div className="update-header">
                          <div className="update-author">
                            <div className="author-avatar">
                              {update.author.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="author-info">
                              <span className="author-name">{update.author}</span>
                              <span className="update-time">
                                {formatDate(update.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="update-status">
                            <div className="status-indicator">
                              <span className={`status-badge-small ${update.status.toLowerCase().replace(' ', '-')}`}>
                                {update.status.toUpperCase()}
                              </span>
                              <span className="date-badge">📅 {update.targetDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="update-content-enhanced">
                          <p>{update.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-updates">
                    <p className="no-updates-text">No previous updates yet.</p>
                    <p className="no-updates-hint">Updates you create will appear here to track your progress over time.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              {/* Description */}
              <div className="goal-description">
                <h3>Description</h3>
                <div className="description-content">
                  {editingField === 'description' ? (
                    <div className="description-edit-container">
                      <div className="rich-text-toolbar">
                        <div className="toolbar-group">
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('bold')}
                            title="Bold"
                          >
                            <strong>B</strong>
                          </button>
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('italic')}
                            title="Italic"
                          >
                            <em>I</em>
                          </button>
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('underline')}
                            title="Underline"
                          >
                            <span style={{ textDecoration: 'underline' }}>U</span>
                          </button>
                        </div>
                        <div className="toolbar-group">
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('unorderedList')}
                            title="Bullet List"
                          >
                            •
                          </button>
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('orderedList')}
                            title="Numbered List"
                          >
                            1.
                          </button>
                        </div>
                        <div className="toolbar-group">
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('heading')}
                            title="Heading"
                          >
                            H
                          </button>
                          <button 
                            className="toolbar-btn" 
                            onClick={() => applyFormatting('link')}
                            title="Link"
                          >
                            🔗
                          </button>
                        </div>
                      </div>
                      <div 
                        className="rich-text-editor"
                        contentEditable
                        ref={richTextEditorRef}
                        onInput={handleRichTextChange}
                        onFocus={() => setRichTextFocused(true)}
                        onBlur={() => setRichTextFocused(false)}
                        dangerouslySetInnerHTML={{ __html: editedDescription }}
                        style={{
                          minHeight: '120px',
                          padding: '12px',
                          border: richTextFocused ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                          borderRadius: '6px',
                          outline: 'none',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#374151',
                          background: 'white'
                        }}
                        suppressContentEditableWarning={true}
                      />
                      <div className="field-edit-actions">
                        <button className="save-btn" onClick={saveChanges} title="Save changes">
                          <Save size={16} />
                        </button>
                        <button className="cancel-btn" onClick={cancelEditingField} title="Cancel editing">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="description-display" onClick={() => startEditingField('description')} title="Click to edit">
                      {goal.description ? (
                        <div 
                          className="description-content-html"
                          dangerouslySetInnerHTML={{ __html: goal.description }}
                        />
                      ) : (
                        <p className="description-placeholder">
                          Briefly describe why this goal is important and how success is measured, so you can provide followers a common understanding.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Annual Goal Specific Fields */}
              {goalType === 'annual' && (
                <div className="annual-goal-fields">
                  <div className="annual-field">
                    <h3>Why it's important</h3>
                    <textarea
                      placeholder="Explain why achieving this goal matters to you..."
                      value={whyImportant}
                      onChange={(e) => setWhyImportant(e.target.value)}
                      className="annual-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="annual-field">
                    <h3>My plan to achieve this goal</h3>
                    <textarea
                      placeholder="Describe your strategy and approach to reach this goal..."
                      value={myPlan}
                      onChange={(e) => setMyPlan(e.target.value)}
                      className="annual-textarea"
                      rows={4}
                    />
                  </div>

                  <div className="annual-field">
                    <h3>Current barrier (if any)</h3>
                    <textarea
                      placeholder="What obstacles or challenges are you facing? (optional)"
                      value={currentBarrier}
                      onChange={(e) => setCurrentBarrier(e.target.value)}
                      className="annual-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="annual-field">
                    <h3>My reward for achieving it</h3>
                    <textarea
                      placeholder="How will you celebrate or reward yourself when you achieve this goal?"
                      value={myReward}
                      onChange={(e) => setMyReward(e.target.value)}
                      className="annual-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'learnings' && (
            <div className="learnings-section">
              <h2>What have we learned?</h2>
              
              {/* Learning Creation Form */}
              <div className="learning-form">
                <div className="learning-form-header">
                  <div className="lightbulb-icon">💡</div>
                  <input 
                    type="text" 
                    placeholder="What's the summary of your learning?"
                    className="learning-title-input"
                  />
                </div>
                
                <div className="rich-text-toolbar">
                  <select className="text-style-dropdown">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button className="toolbar-btn" title="More">⋯</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Text color">A</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bullet list">• ▪</button>
                    <button className="toolbar-btn" title="Numbered list">1. 2.</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Checkbox">☑</button>
                    <button className="toolbar-btn" title="Link">🔗</button>
                    <button className="toolbar-btn" title="Image">🖼️</button>
                    <button className="toolbar-btn" title="Mention">@</button>
                    <button className="toolbar-btn" title="Emoji">😊</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Table">⊞</button>
                    <button className="toolbar-btn" title="Layout">⊡</button>
                  </div>
                  <button className="toolbar-btn more-options" title="More options">+</button>
                </div>
                
                <textarea 
                  className="learning-content-textarea"
                  placeholder="Use this space to share your learning with your 1 follower"
                  rows={6}
                ></textarea>
                
                <div className="learning-form-actions">
                  <button className="btn-primary">Save</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>

              {/* Existing Learnings */}
              <div className="existing-learnings">
                {linkedLearnings.length > 0 ? (
                  linkedLearnings.map((learning) => (
                    <div key={learning.id} className="learning-item">
                      <div className="learning-header">
                        <div className="lightbulb-icon">💡</div>
                        <h3>Weekly Review Learning</h3>
                        <button className="expand-btn">⌃</button>
                      </div>
                      
                      <div className="learning-content">
                        <p>{learning.text}</p>
                      </div>
                      
                      <div className="learning-footer">
                        <div className="learning-meta">
                          <div className="author-avatar-small">WR</div>
                          <span className="learning-author">
                            Learning from weekly review - Week of {new Date(learning.weekOf).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          {!learning.isDirectLink && (
                            <span className={`goal-link-indicator ${learning.linkedToGoalType}`}>
                              <span className="goal-type-icon">
                                {learning.linkedToGoalType === 'life' && '🎯'}
                                {learning.linkedToGoalType === 'annual' && '📅'}
                                {learning.linkedToGoalType === 'quarterly' && '📊'}
                                {learning.linkedToGoalType === 'task' && '✓'}
                              </span>
                              from {learning.linkedToGoalType}: {learning.linkedToGoalTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-learnings-message">
                    <p>No learnings linked to this goal yet.</p>
                    <p>Learnings will appear here when you link them to this goal during your weekly reviews.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'roadblocks' && (
            <div className="roadblocks-section">
              <h2>What roadblocks do we need to overcome?</h2>
              
              {linkedRoadblocks.length > 0 ? (
                <div className="linked-roadblocks">
                  {linkedRoadblocks.map((roadblock) => (
                    <div key={roadblock.id} className="learning-item">
                      <div className="learning-content">
                        <p>{roadblock.text}</p>
                        <div className="learning-meta">
                          <span className="learning-date">
                            Week of {new Date(roadblock.weekOf).toLocaleDateString()}
                          </span>
                          {!roadblock.isDirectLink && (
                            <span className={`goal-link-indicator ${roadblock.linkedToGoalType}`}>
                              <span className="goal-type-icon">
                                {roadblock.linkedToGoalType === 'life' && '🎯'}
                                {roadblock.linkedToGoalType === 'annual' && '📅'}
                                {roadblock.linkedToGoalType === 'quarterly' && '📊'}
                                {roadblock.linkedToGoalType === 'task' && '✓'}
                              </span>
                              from {roadblock.linkedToGoalType}: {roadblock.linkedToGoalTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-learnings-message">
                  <p>No roadblocks linked to this goal yet. Add roadblocks in your weekly reviews and link them to this goal to see them here.</p>
                </div>
              )}

              {/* Legacy Risk Creation Form - keeping for backward compatibility */}
              <div className="risk-form">
                <div className="risk-form-header">
                  <div className="risk-icon">🚧</div>
                  <input 
                    type="text" 
                    placeholder="What's the summary of your risk?"
                    className="risk-title-input"
                  />
                </div>
                
                <div className="rich-text-toolbar">
                  <select className="text-style-dropdown">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button className="toolbar-btn" title="More">⋯</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Text color">A</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bullet list">• ▪</button>
                    <button className="toolbar-btn" title="Numbered list">1. 2.</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Checkbox">☑</button>
                    <button className="toolbar-btn" title="Link">🔗</button>
                    <button className="toolbar-btn" title="Image">🖼️</button>
                    <button className="toolbar-btn" title="Mention">@</button>
                    <button className="toolbar-btn" title="Emoji">😊</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Table">⊞</button>
                    <button className="toolbar-btn" title="Layout">⊡</button>
                  </div>
                  <button className="toolbar-btn more-options" title="More options">+</button>
                </div>
                
                <textarea 
                  className="risk-content-textarea"
                  placeholder="Use this space to share risk details with your 1 follower"
                  rows={6}
                ></textarea>
                
                <div className="risk-form-actions">
                  <button className="btn-primary">Save</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>

              {/* Existing Risks */}
              <div className="existing-risks">
                <div className="risk-item">
                  <div className="risk-header">
                    <div className="risk-icon">⚠️</div>
                    <h3>Budget constraints may impact timeline</h3>
                    <button className="expand-btn">⌃</button>
                  </div>
                  
                  <div className="risk-content">
                    <p>Current budget limitations might require us to extend the project timeline by 2-3 months.</p>
                  </div>
                  
                  <div className="risk-footer">
                    <div className="risk-meta">
                      <div className="author-avatar-small">FG</div>
                      <span className="risk-author">Risk identified by Frederic Gouverneur 2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'decisions' && (
            <div className="decisions-section">
              <h2>What decisions have we made?</h2>
              
              {/* Decision Creation Form */}
              <div className="decision-form">
                <div className="decision-form-header">
                  <div className="decision-icon">✅</div>
                  <input 
                    type="text" 
                    placeholder="What's the summary of your decision?"
                    className="decision-title-input"
                  />
                </div>
                
                <div className="rich-text-toolbar">
                  <select className="text-style-dropdown">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button className="toolbar-btn" title="More">⋯</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Text color">A</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Bullet list">• ▪</button>
                    <button className="toolbar-btn" title="Numbered list">1. 2.</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Checkbox">☑</button>
                    <button className="toolbar-btn" title="Link">🔗</button>
                    <button className="toolbar-btn" title="Image">🖼️</button>
                    <button className="toolbar-btn" title="Mention">@</button>
                    <button className="toolbar-btn" title="Emoji">😊</button>
                  </div>
                  <div className="toolbar-group">
                    <button className="toolbar-btn" title="Table">⊞</button>
                    <button className="toolbar-btn" title="Layout">⊡</button>
                  </div>
                  <button className="toolbar-btn more-options" title="More options">+</button>
                </div>
                
                <textarea 
                  className="decision-content-textarea"
                  placeholder="Use this space to share decision details with your 1 follower"
                  rows={6}
                ></textarea>
                
                <div className="decision-form-actions">
                  <button className="btn-primary">Save</button>
                  <button className="btn-secondary">Cancel</button>
                </div>
              </div>

              {/* Existing Decisions */}
              <div className="existing-decisions">
                <div className="decision-item">
                  <div className="decision-header">
                    <div className="decision-icon">✅</div>
                    <h3>Approved additional budget allocation</h3>
                    <button className="expand-btn">⌃</button>
                  </div>
                  
                  <div className="decision-content">
                    <p>Management has approved an additional $50k budget to ensure project completion by target date.</p>
                  </div>
                  
                  <div className="decision-footer">
                    <div className="decision-meta">
                      <div className="author-avatar-small">FG</div>
                      <span className="decision-author">Decision made by Frederic Gouverneur 1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wins' && (
            <div className="wins-section">
              <h2>What wins have contributed to this goal?</h2>
              
              {linkedWins.length > 0 ? (
                <div className="linked-wins">
                  {linkedWins.map((win) => (
                    <div key={win.id} className="learning-item">
                      <div className="learning-content">
                        <p>{win.text}</p>
                        <div className="learning-meta">
                          <span className="learning-date">
                            Week of {new Date(win.weekOf).toLocaleDateString()}
                          </span>
                          {!win.isDirectLink && (
                            <span className={`goal-link-indicator ${win.linkedToGoalType}`}>
                              <span className="goal-type-icon">
                                {win.linkedToGoalType === 'life' && '🎯'}
                                {win.linkedToGoalType === 'annual' && '📅'}
                                {win.linkedToGoalType === 'quarterly' && '📊'}
                                {win.linkedToGoalType === 'task' && '✓'}
                              </span>
                              from {win.linkedToGoalType}: {win.linkedToGoalTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-learnings-message">
                  <p>No wins linked to this goal yet. Add wins in your weekly reviews and link them to this goal to see them here.</p>
                </div>
              )}
              
              {/* Legacy Accomplishment Creation Form - keeping for backward compatibility */}
              <div className="accomplishment-form">
                <div className="accomplishment-form-header">
                  <div className="trophy-icon">🏆</div>
                  <input 
                    type="text" 
                    placeholder="What accomplishment would you like to celebrate?"
                    className="accomplishment-title-input"
                  />
                </div>
                
                <div className="accomplishment-form-body">
                  <textarea
                    placeholder="Describe what was accomplished and its impact..."
                    className="accomplishment-description"
                    rows={4}
                  />
                  
                  <div className="accomplishment-meta">
                    <div className="accomplishment-date">
                      <Calendar size={16} />
                      <input type="date" className="date-input" />
                    </div>
                    
                    <div className="accomplishment-actions">
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-primary">Add Accomplishment</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Accomplishments */}
              <div className="existing-accomplishments">
                <div className="accomplishment-item">
                  <div className="accomplishment-icon">🎯</div>
                  <div className="accomplishment-content">
                    <div className="accomplishment-header">
                      <h4>Reached 50% milestone</h4>
                      <span className="accomplishment-date">Dec 15, 2024</span>
                    </div>
                    <p className="accomplishment-description">
                      Successfully completed the first half of our annual goal ahead of schedule. 
                      The team's dedication and new process improvements made this possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'check-ins' && (
            <div className="check-ins-section">
              <h2>Check-ins for this goal</h2>
              
              {linkedCheckIns.length > 0 ? (
                <div className="check-ins-list">
                  {linkedCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="check-in-item">
                      <div className="check-in-header">
                        <div className="check-in-date">
                          {new Date(checkIn.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="check-in-mood">
                          <span className="mood-emoji">{checkIn.mood}</span>
                        </div>
                      </div>
                      
                      <div className="check-in-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Energy</span>
                          <div className="metric-bar">
                            <div 
                              className="metric-fill" 
                              style={{ width: `${(checkIn.energyLevel / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="metric-value">{checkIn.energyLevel}/5</span>
                        </div>
                        
                        <div className="metric-item">
                          <span className="metric-label">Focus</span>
                          <div className="metric-bar">
                            <div 
                              className="metric-fill" 
                              style={{ width: `${(checkIn.focusLevel / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="metric-value">{checkIn.focusLevel}/5</span>
                        </div>
                      </div>
                      
                      {checkIn.notes && (
                        <div className="check-in-notes">
                          <p>{checkIn.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-check-ins">
                  <p>No check-ins recorded for this goal yet.</p>
                  <p className="hint">Check-ins help track your energy, focus, and overall progress toward achieving this goal.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="goal-sidebar">
          {/* Progress */}
          <div className="sidebar-section">
            <h4>
              Progress
              <button className="add-btn">
                <Plus size={14} />
              </button>
            </h4>
            <div className="progress-section">
              <div className="progress-visual">
                <div 
                  className="progress-circle"
                  onClick={() => goalType !== 'weekly' && startEditingField('progress')}
                  title={goalType !== 'weekly' ? "Click to edit progress" : undefined}
                  style={{ cursor: goalType !== 'weekly' ? 'pointer' : 'default' }}
                >
                  <span className="progress-percentage">
                    {Math.round(
                      'progress' in goal ? goal.progress || 0 : 
                      (goalType === 'weekly' && 'completed' in goal && goal.completed) ? 100 : 0
                    )}%
                  </span>
                </div>
              </div>
              {editingField === 'progress' && goalType !== 'weekly' && (
                <div className="progress-edit-container">
                  <div className="progress-edit">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={editedProgress}
                      onChange={(e) => setEditedProgress(Number(e.target.value))}
                      className="progress-slider"
                    />
                    <span className="progress-value">{editedProgress}%</span>
                  </div>
                  <div className="field-edit-actions">
                    <button className="save-btn" onClick={saveChanges} title="Save changes">
                      <Save size={16} />
                    </button>
                    <button className="cancel-btn" onClick={cancelEditingField} title="Cancel editing">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="sidebar-section">
            <h4>Status</h4>
            <div className="status-section">
              {editingField === 'status' ? (
                <div className="status-edit-container">
                  <select 
                    value={editedStatus} 
                    onChange={(e) => setEditedStatus(e.target.value as any)}
                    className="status-select"
                    autoFocus
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                  <div className="field-edit-actions">
                    <button className="save-btn" onClick={saveChanges} title="Save changes">
                      <Save size={16} />
                    </button>
                    <button className="cancel-btn" onClick={cancelEditingField} title="Cancel editing">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`status-badge status-${goal.status}`}
                  onClick={() => startEditingField('status')}
                  title="Click to edit"
                >
                  {getStatusIcon(goal.status)}
                  <span>{goal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="sidebar-section">
            <h4>Priority</h4>
            <div className="priority-section">
              {editingField === 'priority' ? (
                <div className="priority-edit-container">
                  <select 
                    value={editedPriority} 
                    onChange={(e) => setEditedPriority(e.target.value as any)}
                    className="priority-select"
                    autoFocus
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="field-edit-actions">
                    <button className="save-btn" onClick={saveChanges} title="Save changes">
                      <Save size={16} />
                    </button>
                    <button className="cancel-btn" onClick={cancelEditingField} title="Cancel editing">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`priority-badge priority-${goal.priority}`}
                  onClick={() => startEditingField('priority')}
                  title="Click to edit"
                >
                  <span>{goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Parent Goal */}
          {goalType !== 'life' && parentGoal && (
            <div className="sidebar-section">
              <h4>Parent {getGoalTypeLabel(parentGoal.type)}</h4>
              <div className="parent-goal">
                <Target size={16} />
                <span>{parentGoal.title}</span>
                <button className="edit-link-btn">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Child Goals */}
          <div className="sidebar-section">
            <h4>
              {getChildGoalTypeName()}
              <span className="count">{childGoals.length}</span>
              <button className="add-btn">
                <Plus size={14} />
              </button>
            </h4>
            {childGoals.length > 0 ? (
              <div className="sub-goals-list">
                {childGoals.map((childGoal: any) => (
                  <div key={childGoal.id} className="sub-goal-item">
                    <div className="sub-goal-icon" style={{ color: getStatusColor(childGoal.status) }}>
                      {getStatusIcon(childGoal.status)}
                    </div>
                    <div className="sub-goal-content">
                      <span className="sub-goal-title">{childGoal.title}</span>
                      <div className="sub-goal-progress">
                        <div 
                          className="progress-bar"
                          style={{ 
                            backgroundColor: getStatusColor(childGoal.status),
                            width: `${childGoal.progress || 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-children">
                <p>No {getChildGoalTypeName().toLowerCase()} found</p>
                {goalType === 'annual' && (
                  <p className="debug-info">
                    Looking for quarterly goals with annualGoalId: {goal?.id}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="sidebar-section">
            <h4>
              Start date
              <button className="edit-link-btn">
                <Edit size={14} />
              </button>
            </h4>
            <div className="start-date">
              {formatDate(
                'createdAt' in goal ? goal.createdAt : 
                (goal as any).weekOf ? (goal as any).weekOf : 
                new Date()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetails;
