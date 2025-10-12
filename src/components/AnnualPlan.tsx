import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../hooks/useRouter';
import { Target, Plus, Sparkles, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import type { AnnualGoal } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function AnnualPlan() {
  const { state, dispatch } = useApp();
  const { navigateTo } = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lifeGoalId: '',
    targetDate: '',
  });

  const MAX_ANNUAL_GOALS = 10;
  const currentYearGoals = state.annualGoals.filter(goal => goal.year === state.currentYear);
  const currentGoalCount = currentYearGoals.length;
  const canAddMore = currentGoalCount < MAX_ANNUAL_GOALS;

  // Months for the flight path
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Current month (October = 9, 0-indexed)
  const currentMonth = new Date().getMonth();

  // Group goals by their linked life goal
  const groupedGoals = state.lifeGoals.map((lifeGoal) => ({
    lifeGoal,
    annualGoals: currentYearGoals.filter((g) => g.lifeGoalId === lifeGoal.id),
  })).filter((group) => group.annualGoals.length > 0);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      lifeGoalId: '',
      targetDate: '',
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    const goalData: AnnualGoal = {
      id: crypto.randomUUID(),
      type: 'annual',
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: 'Annual Goal',
      status: 'not-started',
      createdAt: new Date(),
      targetDate: new Date(formData.targetDate),
      progress: 0,
      year: state.currentYear,
      lifeGoalId: formData.lifeGoalId || undefined,
      quarterlyGoals: [],
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_ANNUAL_GOAL', payload: goalData });
    resetForm();
  };

  const handleSelectGoal = (goalId: string) => {
    navigateTo('goals-table', false, { goalType: 'annual', goalId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Life Goals Context - The "Why" */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Life Goals</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            The foundation. Your annual goals serve these bigger aspirations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {state.lifeGoals.map((goal) => (
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
            <div>
              <h1 className="text-3xl font-bold mb-2">Your {state.currentYear} Flight Path</h1>
              <p className="text-muted-foreground">
                Strategic missions for the year ahead. Focus is your superpower.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canAddMore}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Annual Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Annual Goal</DialogTitle>
                  <DialogDescription>
                    Set a strategic goal for {state.currentYear} that serves your life goals
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="linked-goal">Connect to Life Goal</Label>
                    <Select value={formData.lifeGoalId} onValueChange={(value) => setFormData({ ...formData, lifeGoalId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Which life goal does this serve?" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.lifeGoals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Ship 3 Major Features" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Why This Matters</Label>
                    <Textarea
                      id="description"
                      placeholder="How does this goal serve your life vision?"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Mission</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goal Counter */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {currentGoalCount} of {MAX_ANNUAL_GOALS} annual goals
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_ANNUAL_GOALS }).map((_, i) => (
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
                • Focus is your superpower
              </div>
            )}
          </div>
        </div>

        {/* The Flight Path - 12 Month Timeline */}
        <div className="mb-8 p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-semibold">Your Year at a Glance</h3>
          </div>
          
          <div className="relative">
            {/* Timeline Base */}
            <div className="flex items-center gap-1 mb-2">
              {months.map((month, idx) => (
                <div key={month} className="flex-1">
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    {month}
                  </div>
                  <div className="h-2 bg-accent rounded-full relative overflow-hidden">
                    {/* Progress indicator - for current month */}
                    {idx === currentMonth && (
                      <div className="absolute inset-0 bg-primary/50 w-1/3" />
                    )}
                    {idx < currentMonth && (
                      <div className="absolute inset-0 bg-primary/30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>Jan 1, {state.currentYear}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>You are here • {months[currentMonth]}</span>
              </div>
              <span>Dec 31, {state.currentYear}</span>
            </div>
          </div>
        </div>

        {/* Strategic Missions - Grouped by Life Goal */}
        <div className="space-y-8">
          {groupedGoals.length > 0 ? (
            groupedGoals.map(({ lifeGoal, annualGoals: goals }) => (
              <div key={lifeGoal.id}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm">{lifeGoal.title}</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {goals.map((goal) => (
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2.5" />
                          <div className="text-xs text-muted-foreground">
                            Target: {format(goal.targetDate, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-1">No Annual Goals Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Start by creating your first strategic mission for {state.currentYear}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Mission
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
                <h3 className="text-lg font-semibold mb-1">Add Another Mission</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {MAX_ANNUAL_GOALS - currentGoalCount} {MAX_ANNUAL_GOALS - currentGoalCount === 1 ? 'slot' : 'slots'} remaining. 
                  Choose goals that truly matter.
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
                  <h3 className="text-lg font-semibold mb-1">You've set your strategic focus</h3>
                  <p className="text-sm text-muted-foreground">
                    {MAX_ANNUAL_GOALS} carefully chosen goals. This level of focus is rare and powerful. 
                    Now it's about execution.
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

export default AnnualPlan;
