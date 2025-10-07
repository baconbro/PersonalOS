import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Plus,
  Link2,
  AlertCircle,
  Lightbulb,
  Trophy,
  Flag,
  Smile,
  Meh,
  Frown,
  Zap,
  Brain,
  Clock,
  Edit3,
  X,
  Check,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toastService } from '../services/toastService';
import { useApp } from '../context/AppContext';
import type { LifeGoal, AnnualGoal, QuarterlyGoal, WeeklyTask, GoalUpdate } from '../types';

interface GoalDetailsProps {
  goalId: string;
  goalType: 'life' | 'annual' | 'quarterly' | 'weekly';
  onBack: () => void;
  onNavigate?: (goalId: string, goalType: 'life' | 'annual' | 'quarterly' | 'weekly') => void;
}

const GoalDetails: React.FC<GoalDetailsProps> = ({ goalId, goalType, onBack, onNavigate }) => {
  const { state, dispatch } = useApp();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('on-track');
  const [updateContent, setUpdateContent] = useState('');

  // Learning form state
  const [showLearningForm, setShowLearningForm] = useState(false);
  const [learningContent, setLearningContent] = useState('');

  // Roadblock form state
  const [showRoadblockForm, setShowRoadblockForm] = useState(false);
  const [roadblockContent, setRoadblockContent] = useState('');

  // Decision form state
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [decisionContent, setDecisionContent] = useState('');
  const [decisionImpact, setDecisionImpact] = useState('');

  // Win form state
  const [showWinForm, setShowWinForm] = useState(false);
  const [winContent, setWinContent] = useState('');

  // Check-in form state
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInMood, setCheckInMood] = useState<'excellent' | 'good' | 'neutral' | 'challenging' | 'struggling'>('good');
  const [checkInEnergy, setCheckInEnergy] = useState([5]);
  const [checkInFocus, setCheckInFocus] = useState([5]);
  const [checkInNote, setCheckInNote] = useState('');

  // Key Result form state
  const [showKeyResultForm, setShowKeyResultForm] = useState(false);
  const [editingKeyResult, setEditingKeyResult] = useState<any>(null);
  const [krDescription, setKrDescription] = useState('');
  const [krTargetValue, setKrTargetValue] = useState('');
  const [krCurrentValue, setKrCurrentValue] = useState('');
  const [krUnit, setKrUnit] = useState('');

  // Get the goal based on type
  const goal = (() => {
    switch (goalType) {
      case 'life':
        return state.lifeGoals.find(g => g.id === goalId);
      case 'annual':
        return state.annualGoals.find(g => g.id === goalId);
      case 'quarterly':
        return state.quarterlyGoals.find(g => g.id === goalId);
      case 'weekly':
        return state.weeklyTasks.find(t => t.id === goalId);
      default:
        return null;
    }
  })();

  if (!goal) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold">Goal not found</h2>
        </div>
      </div>
    );
  }

  // Get related data
  const parentGoal = (() => {
    if (goalType === 'annual' && 'lifeGoalId' in goal) {
      return state.lifeGoals.find(g => g.id === goal.lifeGoalId);
    }
    if (goalType === 'quarterly' && 'annualGoalId' in goal) {
      return state.annualGoals.find(g => g.id === goal.annualGoalId);
    }
    if (goalType === 'weekly' && 'quarterlyGoalId' in goal) {
      return state.quarterlyGoals.find(g => g.id === goal.quarterlyGoalId);
    }
    return null;
  })();

  const childGoals = (() => {
    if (goalType === 'life') {
      return state.annualGoals.filter(g => g.lifeGoalId === goalId);
    }
    if (goalType === 'annual') {
      return state.quarterlyGoals.filter(g => g.annualGoalId === goalId);
    }
    if (goalType === 'quarterly') {
      return state.weeklyTasks.filter(t => t.quarterlyGoalId === goalId);
    }
    return [];
  })();

  const updates = state.goalUpdates?.filter((u: GoalUpdate) => u.goalId === goal.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  // Get related data from state
  const goalLearnings = state.learnings?.filter((l: any) => l.goalId === goal.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];
  
  const goalRoadblocks = state.roadblocks?.filter((r: any) => r.goalId === goal.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];
  
  const goalDecisions = state.decisions?.filter((d: any) => d.goalId === goal.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];
  
  const goalWins = state.wins?.filter((w: any) => w.goalId === goal.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];
  
  const goalCheckIns = state.checkIns?.filter((c: any) => c.linkedGoalId === goal.id).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ) || [];

  const relatedTasks = goalType !== 'quarterly' ? [] : state.weeklyTasks.filter(t => t.quarterlyGoalId === goalId);

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'completed':
      case 'on-track':
      case 'in-progress':
        return 'default';
      case 'at-risk':
        return 'outline';
      case 'off-track':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'on-track':
      case 'in-progress':
        return <TrendingUp className="w-3 h-3" />;
      case 'at-risk':
      case 'off-track':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'good':
        return <Smile className="w-5 h-5 text-blue-500" />;
      case 'neutral':
        return <Meh className="w-5 h-5 text-muted-foreground" />;
      case 'challenging':
        return <Frown className="w-5 h-5 text-orange-500" />;
      case 'struggling':
        return <Frown className="w-5 h-5 text-destructive" />;
      default:
        return <Meh className="w-5 h-5" />;
    }
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveField = (field: string) => {
    const updatedGoal = { ...goal, [field]: editValue, updatedAt: new Date() };

    switch (goalType) {
      case 'life':
        dispatch({ type: 'UPDATE_LIFE_GOAL', payload: updatedGoal as LifeGoal });
        break;
      case 'annual':
        dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: updatedGoal as AnnualGoal });
        break;
      case 'quarterly':
        dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: updatedGoal as QuarterlyGoal });
        break;
      case 'weekly':
        dispatch({ type: 'UPDATE_WEEKLY_TASK', payload: updatedGoal as WeeklyTask });
        break;
    }

    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSubmitUpdate = () => {
    if (!updateContent.trim()) return;

    const update: GoalUpdate = {
      id: Date.now().toString(),
      goalId: goal.id,
      goalType,
      content: updateContent.trim(),
      status: updateStatus,
      targetDate: new Date().toISOString(),
      createdAt: new Date(),
      author: 'Current User'
    };

    dispatch({ type: 'ADD_GOAL_UPDATE', payload: update });
    toastService.showFirebaseSuccess('posted', 'Update');
    setUpdateContent('');
    setShowUpdateForm(false);
  };

  const handleSubmitLearning = () => {
    if (!learningContent.trim()) return;
    
    const learning = {
      id: Date.now().toString(),
      goalId: goal.id,
      goalType,
      content: learningContent.trim(),
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_LEARNING', payload: learning });
    setLearningContent('');
    setShowLearningForm(false);
  };

  const handleSubmitRoadblock = () => {
    if (!roadblockContent.trim()) return;
    
    const roadblock = {
      id: Date.now().toString(),
      goalId: goal.id,
      goalType,
      content: roadblockContent.trim(),
      status: 'active' as const,
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_ROADBLOCK', payload: roadblock });
    setRoadblockContent('');
    setShowRoadblockForm(false);
  };

  const handleSubmitDecision = () => {
    if (!decisionContent.trim()) return;
    
    const decision = {
      id: Date.now().toString(),
      goalId: goal.id,
      goalType,
      content: decisionContent.trim(),
      impact: decisionImpact.trim() || undefined,
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_DECISION', payload: decision });
    setDecisionContent('');
    setDecisionImpact('');
    setShowDecisionForm(false);
  };

  const handleSubmitWin = () => {
    if (!winContent.trim()) return;
    
    const win = {
      id: Date.now().toString(),
      goalId: goal.id,
      goalType,
      content: winContent.trim(),
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_WIN', payload: win });
    setWinContent('');
    setShowWinForm(false);
  };

  const handleSubmitCheckIn = () => {
    const checkIn = {
      id: Date.now().toString(),
      timestamp: new Date(),
      energyLevel: checkInEnergy[0],
      focusLevel: checkInFocus[0],
      mood: checkInMood,
      notes: checkInNote.trim() || undefined,
      linkedGoalId: goal.id
    };
    
    dispatch({ type: 'ADD_CHECK_IN', payload: checkIn });
    setCheckInMood('good');
    setCheckInEnergy([5]);
    setCheckInFocus([5]);
    setCheckInNote('');
    setShowCheckInForm(false);
  };

  // Delete handlers
  const handleDeleteUpdate = (updateId: string) => {
    dispatch({ type: 'DELETE_GOAL_UPDATE', payload: updateId });
  };

  const handleDeleteLearning = (learningId: string) => {
    dispatch({ type: 'DELETE_LEARNING', payload: learningId });
  };

  const handleDeleteRoadblock = (roadblockId: string) => {
    dispatch({ type: 'DELETE_ROADBLOCK', payload: roadblockId });
  };

  const handleDeleteDecision = (decisionId: string) => {
    dispatch({ type: 'DELETE_DECISION', payload: decisionId });
  };

  const handleDeleteWin = (winId: string) => {
    dispatch({ type: 'DELETE_WIN', payload: winId });
  };

  const handleDeleteCheckIn = (checkInId: string) => {
    dispatch({ type: 'DELETE_CHECK_IN', payload: checkInId });
  };

  // Key Result handlers
  const handleAddKeyResult = () => {
    if (!krDescription.trim() || !krTargetValue || !krUnit.trim()) return;
    
    const newKeyResult = {
      id: Date.now().toString(),
      description: krDescription,
      targetValue: parseFloat(krTargetValue),
      currentValue: parseFloat(krCurrentValue) || 0,
      unit: krUnit,
      completed: false,
    };

    dispatch({
      type: 'ADD_KEY_RESULT',
      payload: { goalId, keyResult: newKeyResult },
    });

    // Update the quarterly goal to persist changes
    if (goalType === 'quarterly' && 'keyResults' in goal) {
      const updatedGoal = {
        ...goal,
        keyResults: [...goal.keyResults, newKeyResult],
      };
      dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: updatedGoal as QuarterlyGoal });
    }

    // Reset form
    setKrDescription('');
    setKrTargetValue('');
    setKrCurrentValue('');
    setKrUnit('');
    setShowKeyResultForm(false);
  };

  const handleUpdateKeyResult = (keyResult: any) => {
    dispatch({
      type: 'UPDATE_KEY_RESULT',
      payload: { goalId, keyResult },
    });

    // Update the quarterly goal to persist changes
    if (goalType === 'quarterly' && 'keyResults' in goal) {
      const updatedGoal = {
        ...goal,
        keyResults: goal.keyResults.map((kr: any) =>
          kr.id === keyResult.id ? keyResult : kr
        ),
      };
      dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: updatedGoal as QuarterlyGoal });
    }

    setEditingKeyResult(null);
  };

  const handleDeleteKeyResult = (keyResultId: string) => {
    dispatch({
      type: 'DELETE_KEY_RESULT',
      payload: { goalId, keyResultId },
    });

    // Update the quarterly goal to persist changes
    if (goalType === 'quarterly' && 'keyResults' in goal) {
      const updatedGoal = {
        ...goal,
        keyResults: goal.keyResults.filter((kr: any) => kr.id !== keyResultId),
      };
      dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: updatedGoal as QuarterlyGoal });
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (goalType === 'weekly') return;

    const updatedGoal = { ...goal, progress: value[0], updatedAt: new Date() };

    switch (goalType) {
      case 'life':
        dispatch({ type: 'UPDATE_LIFE_GOAL', payload: updatedGoal as LifeGoal });
        break;
      case 'annual':
        dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: updatedGoal as AnnualGoal });
        break;
      case 'quarterly':
        dispatch({ type: 'UPDATE_QUARTERLY_GOAL', payload: updatedGoal as QuarterlyGoal });
        break;
    }
  };

  const characterCount = updateContent.length;
  const characterLimit = 280;
  const progress = 'progress' in goal ? goal.progress : 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6 max-w-5xl">
          {/* Header */}
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>

            {/* Breadcrumb */}
            {parentGoal && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span className="hover:text-foreground cursor-pointer">{parentGoal.title}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{goal.title}</span>
              </div>
            )}

            {/* Title - Editable */}
            {editingField === 'title' ? (
              <div className="space-y-2 mb-3">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-2xl p-3 h-auto font-bold"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSaveField('title')}>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <h1
                className="text-3xl font-bold mb-3 cursor-pointer hover:text-primary/80 transition-colors group inline-flex items-center gap-2"
                onClick={() => handleEditField('title', goal.title)}
              >
                {goal.title}
                <Edit3 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}

            {/* Description - Editable */}
            {editingField === 'description' ? (
              <div className="space-y-2 max-w-3xl">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSaveField('description')}>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-muted-foreground max-w-3xl cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleEditField('description', goal.description || '')}
              >
                {goal.description || 'Click to add description...'}
              </p>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="updates" className="space-y-4">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="learnings">
                Learnings
                {goalLearnings.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {goalLearnings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="roadblocks">
                Roadblocks
                {goalRoadblocks.filter((r: any) => r.status === 'active').length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {goalRoadblocks.filter((r: any) => r.status === 'active').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="decisions">Decisions</TabsTrigger>
              <TabsTrigger value="wins">Wins</TabsTrigger>
              <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            </TabsList>

            {/* Updates Tab */}
            <TabsContent value="updates" className="space-y-4">
              {!showUpdateForm ? (
                <Button onClick={() => setShowUpdateForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Update
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Post Status Update</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={updateStatus} onValueChange={setUpdateStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-track">On Track</SelectItem>
                          <SelectItem value="at-risk">At Risk</SelectItem>
                          <SelectItem value="off-track">Off Track</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Update</Label>
                        <span className={`text-xs ${characterCount > characterLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {characterCount}/{characterLimit}
                        </span>
                      </div>
                      <Textarea
                        value={updateContent}
                        onChange={(e) => setUpdateContent(e.target.value)}
                        placeholder="What's the status? Share progress, blockers, or insights..."
                        rows={4}
                        maxLength={characterLimit}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitUpdate}>Post Update</Button>
                      <Button variant="outline" onClick={() => setShowUpdateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Update History */}
              <div className="space-y-3">
                {updates.length > 0 ? (
                  updates.map((update) => (
                    <Card key={update.id} className="group relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge variant={getStatusColor(update.status)} className="gap-1 flex-shrink-0">
                            {getStatusIcon(update.status)}
                            {update.status.replace('-', ' ')}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="mb-2">{update.content}</p>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(update.createdAt), 'MMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUpdate(update.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No updates yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Post your first status update to track progress
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {editingField === 'about-description' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={4}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveField('description')}>
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleEditField('about-description', goal.description || '')}
                    >
                      {goal.description || 'Click to add description...'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Annual Goal Specific Fields */}
              {goalType === 'annual' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Why It's Important</CardTitle>
                      <CardDescription>Strategic rationale for this goal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editingField === 'whyImportant' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveField('whyImportant')}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleEditField('whyImportant', (goal as any).whyImportant || '')}
                        >
                          {(goal as any).whyImportant || 'Click to add why this goal is important...'}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>My Plan to Achieve This</CardTitle>
                      <CardDescription>Execution strategy</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editingField === 'planToAchieve' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveField('planToAchieve')}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleEditField('planToAchieve', (goal as any).planToAchieve || '')}
                        >
                          {(goal as any).planToAchieve || 'Click to add your plan...'}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Current Barriers</CardTitle>
                      <CardDescription>Obstacles and challenges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editingField === 'currentBarriers' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveField('currentBarriers')}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleEditField('currentBarriers', (goal as any).currentBarriers || '')}
                        >
                          {(goal as any).currentBarriers || 'Click to add current barriers...'}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>My Reward</CardTitle>
                      <CardDescription>How you'll celebrate success</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editingField === 'reward' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveField('reward')}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleEditField('reward', (goal as any).reward || '')}
                        >
                          {(goal as any).reward || 'Click to add your reward...'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Key Results for Quarterly Goals */}
              {goalType === 'quarterly' && 'keyResults' in goal && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Key Results</h3>
                      <p className="text-sm text-muted-foreground">Measurable outcomes for this quarter</p>
                    </div>
                    {!showKeyResultForm && (
                      <Button onClick={() => setShowKeyResultForm(true)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Key Result
                      </Button>
                    )}
                  </div>

                  {showKeyResultForm && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Add Key Result</CardTitle>
                        <CardDescription>Define a measurable outcome</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={krDescription}
                            onChange={(e) => setKrDescription(e.target.value)}
                            placeholder="e.g., Increase monthly revenue"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Target Value</Label>
                            <Input
                              type="number"
                              value={krTargetValue}
                              onChange={(e) => setKrTargetValue(e.target.value)}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Current Value</Label>
                            <Input
                              type="number"
                              value={krCurrentValue}
                              onChange={(e) => setKrCurrentValue(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input
                              value={krUnit}
                              onChange={(e) => setKrUnit(e.target.value)}
                              placeholder="e.g., %, $, users"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleAddKeyResult}>Add Key Result</Button>
                          <Button variant="outline" onClick={() => {
                            setShowKeyResultForm(false);
                            setKrDescription('');
                            setKrTargetValue('');
                            setKrCurrentValue('');
                            setKrUnit('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {goal.keyResults && goal.keyResults.length > 0 ? (
                      goal.keyResults.map((kr: any, index: number) => {
                        const progress = kr.targetValue > 0 ? Math.round((kr.currentValue / kr.targetValue) * 100) : 0;
                        const isEditing = editingKeyResult?.id === kr.id;

                        return (
                          <Card key={kr.id} className="group">
                            <CardContent className="p-4">
                              {isEditing ? (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                      value={editingKeyResult.description}
                                      onChange={(e) => setEditingKeyResult({ ...editingKeyResult, description: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label>Target</Label>
                                      <Input
                                        type="number"
                                        value={editingKeyResult.targetValue}
                                        onChange={(e) => setEditingKeyResult({ ...editingKeyResult, targetValue: parseFloat(e.target.value) })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Current</Label>
                                      <Input
                                        type="number"
                                        value={editingKeyResult.currentValue}
                                        onChange={(e) => setEditingKeyResult({ ...editingKeyResult, currentValue: parseFloat(e.target.value) })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Unit</Label>
                                      <Input
                                        value={editingKeyResult.unit}
                                        onChange={(e) => setEditingKeyResult({ ...editingKeyResult, unit: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleUpdateKeyResult(editingKeyResult)}>
                                      <Check className="w-4 h-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingKeyResult(null)}>
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium mb-1">{kr.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <span className="font-mono">{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                                          <Badge variant={progress >= 100 ? "default" : "outline"} className="text-xs">
                                            {progress}%
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingKeyResult(kr)}
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteKeyResult(kr.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : !showKeyResultForm && (
                      <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                          <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No key results yet</p>
                          <p className="text-sm">Add measurable outcomes to track progress</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Learnings Tab */}
            <TabsContent value="learnings" className="space-y-4">
              {!showLearningForm ? (
                <Button onClick={() => setShowLearningForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Learning
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Learning</CardTitle>
                    <CardDescription>Document an insight or lesson learned</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>What did you learn?</Label>
                      <Textarea
                        value={learningContent}
                        onChange={(e) => setLearningContent(e.target.value)}
                        placeholder="Describe the insight, lesson, or discovery..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitLearning}>Add Learning</Button>
                      <Button variant="outline" onClick={() => setShowLearningForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {goalLearnings.length > 0 ? (
                  goalLearnings.map((learning: any) => (
                    <Card key={learning.id} className="group relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="mb-2">{learning.content}</p>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(learning.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteLearning(learning.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No learnings yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Document insights and lessons from weekly reviews
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Roadblocks Tab */}
            <TabsContent value="roadblocks" className="space-y-4">
              {!showRoadblockForm ? (
                <Button onClick={() => setShowRoadblockForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Roadblock
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Roadblock</CardTitle>
                    <CardDescription>Document a challenge or obstacle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Describe the roadblock</Label>
                      <Textarea
                        value={roadblockContent}
                        onChange={(e) => setRoadblockContent(e.target.value)}
                        placeholder="What's blocking progress? What challenges are you facing?..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitRoadblock}>Add Roadblock</Button>
                      <Button variant="outline" onClick={() => setShowRoadblockForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {goalRoadblocks.length > 0 ? (
                  goalRoadblocks.map((roadblock: any) => (
                    <Card key={roadblock.id} className="group relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="mb-2">{roadblock.content}</p>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(roadblock.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRoadblock(roadblock.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No roadblocks</h3>
                    <p className="text-sm text-muted-foreground">
                      Track challenges and obstacles as they arise
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Decisions Tab */}
            <TabsContent value="decisions" className="space-y-4">
              {!showDecisionForm ? (
                <Button onClick={() => setShowDecisionForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Decision
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Record Decision</CardTitle>
                    <CardDescription>Document an important decision and its rationale</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Decision</Label>
                      <Textarea
                        value={decisionContent}
                        onChange={(e) => setDecisionContent(e.target.value)}
                        placeholder="What decision did you make?..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Impact (Optional)</Label>
                      <Textarea
                        value={decisionImpact}
                        onChange={(e) => setDecisionImpact(e.target.value)}
                        placeholder="What impact will this decision have?..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitDecision}>Record Decision</Button>
                      <Button variant="outline" onClick={() => setShowDecisionForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {goalDecisions.length > 0 ? (
                  goalDecisions.map((decision: any) => (
                    <Card key={decision.id} className="group relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Flag className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="mb-2">{decision.content}</p>
                            {decision.impact && (
                              <div className="p-2 rounded bg-muted/50 mb-2 text-sm">
                                <strong>Impact:</strong> {decision.impact}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(decision.createdAt), 'MMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDecision(decision.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No decisions recorded</h3>
                    <p className="text-sm text-muted-foreground">
                      Document key decisions and their rationale
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Wins Tab */}
            <TabsContent value="wins" className="space-y-4">
              {!showWinForm ? (
                <Button onClick={() => setShowWinForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Win
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Win</CardTitle>
                    <CardDescription>Celebrate an accomplishment or milestone</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Describe your win</Label>
                      <Textarea
                        value={winContent}
                        onChange={(e) => setWinContent(e.target.value)}
                        placeholder="What did you accomplish? What are you proud of?..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitWin}>
                        <Trophy className="w-4 h-4 mr-2" />
                        Celebrate Win
                      </Button>
                      <Button variant="outline" onClick={() => setShowWinForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {goalWins.length > 0 ? (
                  goalWins.map((win: any) => (
                    <Card key={win.id} className="border-yellow-500/50 bg-yellow-500/5 group relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="mb-2">{win.content}</p>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(win.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteWin(win.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No wins yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Celebrate your accomplishments and milestones
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Check-ins Tab */}
            <TabsContent value="checkins" className="space-y-4">
              {!showCheckInForm ? (
                <Button onClick={() => setShowCheckInForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Check-in
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Record Check-in</CardTitle>
                    <CardDescription>Track your mood, energy, and focus</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>How are you feeling?</Label>
                      <Select value={checkInMood} onValueChange={(v: any) => setCheckInMood(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="challenging">Challenging</SelectItem>
                          <SelectItem value="struggling">Struggling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Energy Level
                        </Label>
                        <span className="text-sm">{checkInEnergy[0]}/10</span>
                      </div>
                      <Slider
                        value={checkInEnergy}
                        onValueChange={setCheckInEnergy}
                        max={10}
                        min={1}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Focus Level
                        </Label>
                        <span className="text-sm">{checkInFocus[0]}/10</span>
                      </div>
                      <Slider
                        value={checkInFocus}
                        onValueChange={setCheckInFocus}
                        max={10}
                        min={1}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Note (Optional)</Label>
                      <Textarea
                        value={checkInNote}
                        onChange={(e) => setCheckInNote(e.target.value)}
                        placeholder="Any additional thoughts or context?..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitCheckIn}>Record Check-in</Button>
                      <Button variant="outline" onClick={() => setShowCheckInForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {goalCheckIns.length > 0 ? (
                  goalCheckIns.map((checkIn: any) => (
                    <Card key={checkIn.id} className="group relative">
                      <CardContent className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCheckIn(checkIn.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getMoodIcon(checkIn.mood)}
                              <span className="capitalize">{checkIn.mood}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(checkIn.timestamp), 'MMM d, yyyy • h:mm a')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Zap className="w-4 h-4" />
                                  Energy
                                </span>
                                <span className="text-sm">{checkIn.energyLevel}/10</span>
                              </div>
                              <Progress value={checkIn.energyLevel * 10} className="h-2" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Brain className="w-4 h-4" />
                                  Focus
                                </span>
                                <span className="text-sm">{checkIn.focusLevel}/10</span>
                              </div>
                              <Progress value={checkIn.focusLevel * 10} className="h-2" />
                            </div>
                          </div>

                          {checkIn.notes && (
                            <p className="text-sm pt-2 border-t">{checkIn.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No check-ins yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your mood, energy, and focus regularly
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-muted/20 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Progress Circle */}
            {goalType !== 'weekly' && (
              <>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                        className="text-primary transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute">
                      <div className="text-3xl font-bold">{progress}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Update Progress</Label>
                    <Slider
                      value={[progress]}
                      onValueChange={handleProgressChange}
                      max={100}
                      step={5}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Status */}
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant={getStatusColor(goal.status)} className="gap-1 w-full justify-center">
                  {getStatusIcon(goal.status)}
                  {goal.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Year - For Annual Goals */}
            {goalType === 'annual' && 'year' in goal && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <p className="mt-1 text-2xl font-semibold">
                    {goal.year}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Quarter & Year - For Quarterly Goals */}
            {goalType === 'quarterly' && 'quarter' in goal && 'year' in goal && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Quarter</Label>
                  <p className="mt-1 text-2xl font-semibold">
                    Q{goal.quarter} {goal.year}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Dates */}
            <div className="space-y-3 text-sm">
              {goal.createdAt && (
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="mt-1">{format(new Date(goal.createdAt), 'MMM d, yyyy')}</p>
                </div>
              )}
              {'targetDate' in goal && goal.targetDate && (
                <div>
                  <Label className="text-xs text-muted-foreground">Target Date</Label>
                  <p className="mt-1">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>

            {(parentGoal || childGoals.length > 0) && <Separator />}

            {/* Parent Goal */}
            {parentGoal && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Parent Goal</Label>
                <Card 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    if (onNavigate) {
                      const parentType = 'type' in parentGoal ? parentGoal.type : goalType === 'annual' ? 'life' : goalType === 'quarterly' ? 'annual' : 'quarterly';
                      onNavigate(parentGoal.id, parentType);
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">{parentGoal.title}</h4>
                      </div>
                      {('year' in parentGoal || 'quarter' in parentGoal) && (
                        <span className="text-xs text-muted-foreground">
                          {'quarter' in parentGoal && `Q${parentGoal.quarter} `}
                          {'year' in parentGoal && parentGoal.year}
                        </span>
                      )}
                    </div>
                    {'progress' in parentGoal && (
                      <>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{parentGoal.progress}%</span>
                        </div>
                        <Progress value={parentGoal.progress} className="h-1.5" />
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Child Goals */}
            {childGoals.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  {goalType === 'quarterly' ? 'Tasks' : 'Sub-Goals'} ({childGoals.length})
                </Label>
                <div className="space-y-2">
                  {childGoals.slice(0, 5).map((child: any) => (
                    <Card 
                      key={child.id} 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        if (onNavigate) {
                          const childType = 'type' in child ? child.type : goalType === 'life' ? 'annual' : goalType === 'annual' ? 'quarterly' : 'weekly';
                          onNavigate(child.id, childType);
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <h4 className="text-sm mb-2">{child.title}</h4>
                        {'progress' in child && (
                          <>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span>{child.progress}%</span>
                            </div>
                            <Progress value={child.progress} className="h-1.5" />
                          </>
                        )}
                        {'status' in child && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs h-5">
                              {child.status}
                            </Badge>
                            {('year' in child || 'quarter' in child) && (
                              <span className="text-xs text-muted-foreground">
                                {'quarter' in child && `Q${child.quarter} `}
                                {'year' in child && child.year}
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {childGoals.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      +{childGoals.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Related Tasks */}
            {relatedTasks.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Tasks ({relatedTasks.filter((t: any) => t.status !== 'done').length} active)
                  </Label>
                  <div className="space-y-2">
                    {relatedTasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex items-start gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          task.status === 'done' ? 'bg-green-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-muted'
                        }`} />
                        <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default GoalDetails;
