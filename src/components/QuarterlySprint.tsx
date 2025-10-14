import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../hooks/useRouter';
import { Calendar, Plus, Sparkles, Lightbulb, Target, X, Hash, DollarSign, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { QuarterlyGoal } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { validateGoalTitle, sanitizeText } from '../utils/security';

type KeyResultInput = {
  id: string;
  description: string;
  unit: 'number' | 'percent' | 'currency';
  targetValue: number;
  currentValue: number;
};

function QuarterlySprint() {
  const { state, dispatch } = useApp();
  const { navigateTo } = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnnualGoal, setSelectedAnnualGoal] = useState('');
  const [objective, setObjective] = useState('');
  const [keyResults, setKeyResults] = useState<KeyResultInput[]>([]);
  const [newKrDescription, setNewKrDescription] = useState('');
  const [newKrUnit, setNewKrUnit] = useState<'number' | 'percent' | 'currency'>('number');
  const [newKrTarget, setNewKrTarget] = useState('');
  const [titleError, setTitleError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_descriptionError, setDescriptionError] = useState('');
  
  // Track the viewing quarter (can be different from current quarter)
  const [viewingQuarter, setViewingQuarter] = useState(state.currentQuarter);
  const [viewingYear, setViewingYear] = useState(state.currentYear);

  const MAX_QUARTERLY_GOALS = 5;
  
  const getQuarterDates = (quarter: number, year: number) => {
    const quarterStartDate = new Date(year, (quarter - 1) * 3, 1);
    const quarterEndDate = new Date(year, quarter * 3, 0);
    return { start: quarterStartDate, end: quarterEndDate };
  };

  // Navigation functions
  const goToPreviousQuarter = () => {
    if (viewingQuarter === 1) {
      setViewingQuarter(4);
      setViewingYear(viewingYear - 1);
    } else {
      setViewingQuarter((viewingQuarter - 1) as 1 | 2 | 3 | 4);
    }
  };

  const goToNextQuarter = () => {
    if (viewingQuarter === 4) {
      setViewingQuarter(1);
      setViewingYear(viewingYear + 1);
    } else {
      setViewingQuarter((viewingQuarter + 1) as 1 | 2 | 3 | 4);
    }
  };

  const goToCurrentQuarter = () => {
    setViewingQuarter(state.currentQuarter);
    setViewingYear(state.currentYear);
  };

  const isCurrentQuarter = viewingQuarter === state.currentQuarter && viewingYear === state.currentYear;

  const currentQuarterGoals = state.quarterlyGoals.filter(
    goal => goal.quarter === viewingQuarter && goal.year === viewingYear
  );
  
  const currentGoalCount = currentQuarterGoals.length;
  const canAddMore = currentGoalCount < MAX_QUARTERLY_GOALS;
  const currentQuarterDates = getQuarterDates(viewingQuarter, viewingYear);

  // Get weeks in current quarter
  const getWeeksInQuarter = () => {
    const weeks = [];
    const start = currentQuarterDates.start;
    const end = currentQuarterDates.end;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    for (let i = 0; i < diff; i++) {
      weeks.push(i + 1);
    }
    return weeks;
  };

  const weeks = getWeeksInQuarter();
  const currentWeek = Math.ceil((new Date().getTime() - currentQuarterDates.start.getTime()) / (7 * 24 * 60 * 60 * 1000));

  // Group goals by their linked annual goal
  const groupedGoals = state.annualGoals
    .filter(ag => ag.year === state.currentYear)
    .map((annualGoal) => ({
      annualGoal,
      quarterlyGoals: currentQuarterGoals.filter((g) => g.annualGoalId === annualGoal.id),
    }))
    .filter((group) => group.quarterlyGoals.length > 0);

  // Get the selected annual goal for context
  const selectedAnnual = state.annualGoals.find(g => g.id === selectedAnnualGoal);
  const selectedLife = selectedAnnual ? state.lifeGoals.find(lg => lg.id === selectedAnnual.lifeGoalId) : null;

  const getUnitSymbol = (unit: string) => {
    switch (unit) {
      case 'currency': return '$';
      case 'percent': return '%';
      default: return '';
    }
  };

  const addKeyResult = () => {
    if (!newKrDescription.trim() || !newKrTarget) return;

    const newKr: KeyResultInput = {
      id: `kr-${Date.now()}`,
      description: newKrDescription,
      unit: newKrUnit,
      targetValue: parseFloat(newKrTarget),
      currentValue: 0,
    };

    setKeyResults([...keyResults, newKr]);
    setNewKrDescription('');
    setNewKrTarget('');
    setNewKrUnit('number');
  };

  const removeKeyResult = (id: string) => {
    setKeyResults(keyResults.filter(kr => kr.id !== id));
  };

  const resetForm = () => {
    setSelectedAnnualGoal('');
    setObjective('');
    setKeyResults([]);
    setNewKrDescription('');
    setNewKrTarget('');
    setNewKrUnit('number');
    setTitleError('');
    setDescriptionError('');
    setIsDialogOpen(false);
  };

  const calculateProgress = (keyResults: KeyResultInput[]) => {
    if (keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => {
      const progress = kr.targetValue > 0 ? Math.min((kr.currentValue / kr.targetValue) * 100, 100) : 0;
      return sum + progress;
    }, 0);
    return Math.round(totalProgress / keyResults.length);
  };

  const handleSubmit = () => {
    setTitleError('');
    setDescriptionError('');

    const titleValidation = validateGoalTitle(objective);
    if (!titleValidation.valid) {
      setTitleError(titleValidation.error || 'Invalid objective');
      return;
    }

    if (keyResults.length === 0) {
      alert('Please add at least one key result');
      return;
    }

    const progress = calculateProgress(keyResults);
    const sanitizedObjective = sanitizeText(objective);

    const goalData: QuarterlyGoal = {
      id: crypto.randomUUID(),
      type: 'quarterly',
      title: sanitizedObjective,
      description: sanitizedObjective,
      category: 'OKR',
      status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started',
      createdAt: new Date(),
      targetDate: currentQuarterDates.end,
      progress,
      quarter: viewingQuarter,
      year: viewingYear,
      annualGoalId: selectedAnnualGoal || '',
      keyResults: keyResults.map(kr => ({
        id: kr.id,
        description: sanitizeText(kr.description),
        targetValue: kr.targetValue,
        currentValue: kr.currentValue,
        unit: kr.unit,
        completed: kr.currentValue >= kr.targetValue,
      })),
      weeklyTasks: [],
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_QUARTERLY_GOAL', payload: goalData });

    // Link to annual goal if selected
    if (selectedAnnualGoal) {
      const annualGoal = state.annualGoals.find(g => g.id === selectedAnnualGoal);
      if (annualGoal) {
        const updatedAnnualGoal = {
          ...annualGoal,
          quarterlyGoals: [...annualGoal.quarterlyGoals, goalData.id]
        };
        dispatch({ type: 'UPDATE_ANNUAL_GOAL', payload: updatedAnnualGoal });
      }
    }

    resetForm();
  };

  const handleSelectGoal = (goalId: string) => {
    navigateTo('goals-table', false, { goalType: 'quarterly', goalId });
  };

  const getQuarterName = (quarter: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[quarter - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Annual Goals Context - The "What" */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Annual Goals</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Break these strategic missions into quarterly objectives.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.annualGoals.filter(ag => ag.year === state.currentYear).map((goal) => (
              <Card key={goal.id} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <CardTitle className="text-sm mb-1">{goal.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Progress value={goal.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousQuarter}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h1 className="text-3xl font-bold">
                  Quarterly Execution - {getQuarterName(viewingQuarter)} {viewingYear}
                </h1>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextQuarter}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                {!isCurrentQuarter && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToCurrentQuarter}
                    className="ml-2"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Current Quarter
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">
                Transform annual goals into quarterly objectives. Each goal is a key result.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button disabled={!canAddMore}>
                  <Plus className="w-4 h-4 mr-2" />
                  New quarterly objective
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
                <DialogHeader>
                  <DialogTitle>Create Quarterly Objective</DialogTitle>
                  <DialogDescription>
                    Set an Objective and Key Results for {getQuarterName(viewingQuarter)} {viewingYear}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Annual Goal Context */}
                  <div className="space-y-2">
                    <Label>Connect to Annual Goal</Label>
                    <Select value={selectedAnnualGoal} onValueChange={setSelectedAnnualGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Which annual mission does this serve?" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.annualGoals.filter(ag => ag.year === state.currentYear).map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Show context when selected */}
                    {selectedAnnual && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-3.5 h-3.5 text-primary" />
                          <Breadcrumb>
                            <BreadcrumbList>
                              {selectedLife && (
                                <>
                                  <BreadcrumbItem>
                                    <BreadcrumbLink className="text-xs">{selectedLife.title}</BreadcrumbLink>
                                  </BreadcrumbItem>
                                  <BreadcrumbSeparator />
                                </>
                              )}
                              <BreadcrumbItem>
                                <BreadcrumbPage className="text-xs">{selectedAnnual.title}</BreadcrumbPage>
                              </BreadcrumbItem>
                            </BreadcrumbList>
                          </Breadcrumb>
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedAnnual.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">O</div>
                      <h4>Objective (The "What" - Inspirational)</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="objective">Objective</Label>
                      <Textarea
                        id="objective"
                        placeholder="e.g., Revolutionize our mobile user experience with a complete redesign"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        rows={3}
                        className={`resize-none ${titleError ? 'border-red-500' : ''}`}
                      />
                      {titleError && <p className="text-sm text-red-500">{titleError}</p>}
                      <p className="text-xs text-muted-foreground">
                        Make it qualitative and inspiring. What do you want to achieve?
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">KR</div>
                      <h4>Key Results (The "How" - Measurable)</h4>
                    </div>

                    {/* Existing Key Results */}
                    {keyResults.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {keyResults.map((kr, index) => (
                          <div key={kr.id} className="p-3 bg-accent rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start gap-2 flex-1">
                                <span className="text-xs text-muted-foreground mt-0.5">KR{index + 1}:</span>
                                <span className="text-sm flex-1">{kr.description}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => removeKeyResult(kr.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            {/* Instant Progress Preview */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>
                                  {getUnitSymbol(kr.unit)}{kr.currentValue} / {getUnitSymbol(kr.unit)}{kr.targetValue}
                                  {kr.unit === 'number' && ' items'}
                                </span>
                              </div>
                              <Progress value={(kr.currentValue / kr.targetValue) * 100} className="h-1.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Key Result */}
                    <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="kr-description">Key Result Description</Label>
                        <Input
                          id="kr-description"
                          placeholder="e.g., Implement 15 core screens"
                          value={newKrDescription}
                          onChange={(e) => setNewKrDescription(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Measurement Unit</Label>
                          <Select value={newKrUnit} onValueChange={(value: any) => setNewKrUnit(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="number">
                                <div className="flex items-center gap-2">
                                  <Hash className="w-4 h-4" />
                                  <span>Number (#)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="percent">
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4" />
                                  <span>Percent (%)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="currency">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>Currency ($)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kr-target">Target Value</Label>
                          <Input
                            id="kr-target"
                            type="number"
                            placeholder="15"
                            value={newKrTarget}
                            onChange={(e) => setNewKrTarget(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={addKeyResult}
                        disabled={!newKrDescription.trim() || !newKrTarget}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Key Result
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        💡 Make it measurable. You should be able to track progress objectively.
                      </p>
                    </div>

                    {keyResults.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Add 2-5 measurable key results to track your objective
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!selectedAnnualGoal || !objective.trim() || keyResults.length === 0}
                  >
                    Create Quarter Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goal Counter */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {currentGoalCount} of {MAX_QUARTERLY_GOALS} quarterly objectives
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_QUARTERLY_GOALS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${
                    i < currentGoalCount ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            {!canAddMore && (
              <div className="text-sm text-muted-foreground italic">
                • Quality over quantity
              </div>
            )}
          </div>
        </div>

        {/* The Quarter Timeline - Week by Week */}
        <div className="mb-8 p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-semibold">Your Quarter at a Glance</h3>
          </div>
          
          <div className="relative">
            {/* Timeline Base */}
            <div className="flex items-center gap-1 mb-2">
              {weeks.map((week, idx) => (
                <div key={week} className="flex-1">
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    W{week}
                  </div>
                  <div className="h-2 bg-accent rounded-full relative overflow-hidden">
                    {idx + 1 === currentWeek && (
                      <div className="absolute inset-0 bg-primary w-1/2" />
                    )}
                    {idx + 1 < currentWeek && (
                      <div className="absolute inset-0 bg-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>{format(currentQuarterDates.start, 'MMM dd')}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Week {currentWeek} of {weeks.length}</span>
              </div>
              <span>{format(currentQuarterDates.end, 'MMM dd')}</span>
            </div>
          </div>
        </div>

        {/* OKRs - Grouped by Annual Goal */}
        <div className="space-y-8">
          {groupedGoals.length > 0 ? (
            groupedGoals.map(({ annualGoal, quarterlyGoals: goals }) => (
              <div key={annualGoal.id}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium">{annualGoal.title}</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const keyResult = goal.keyResults[0];
                    return (
                      <Card
                        key={goal.id}
                        className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                        onClick={() => handleSelectGoal(goal.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {goal.title}
                            </CardTitle>
                            <Badge
                              variant={goal.status === 'in-progress' ? 'default' : 'secondary'}
                              className="capitalize shrink-0"
                            >
                              {goal.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {goal.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Key Result Display */}
                            {keyResult && (
                              <div className="p-3 bg-accent/50 rounded-lg">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground font-medium">Key Result</span>
                                  <span className="font-semibold">
                                    {keyResult.currentValue} / {keyResult.targetValue} {keyResult.unit}
                                  </span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                              </div>
                            )}
                            
                            {/* Progress */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Overall Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              Target: {format(goal.targetDate, 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-1">No Quarter Objectives Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Start by creating your first quarterly objective for {getQuarterName(viewingQuarter)} {viewingYear}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First quarterly objective
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State for remaining capacity */}
          {canAddMore && groupedGoals.length > 0 && (
            <Card 
              className="border-dashed border-2 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Add Another quarterly objective</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {MAX_QUARTERLY_GOALS - currentGoalCount} {MAX_QUARTERLY_GOALS - currentGoalCount === 1 ? 'slot' : 'slots'} remaining. 
                  Keep it focused and achievable.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Focus Message when at capacity */}
          {!canAddMore && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex items-center gap-3 py-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Quarter is fully planned</h3>
                  <p className="text-sm text-muted-foreground">
                    {MAX_QUARTERLY_GOALS} focused quarterly objectives for this quarter. Now it's time to execute and track progress weekly.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuarterlySprint;
