import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import { Plus, BookOpen, TrendingUp, Lightbulb, Target, Sparkles, Heart, Battery, Star, Calendar, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, startOfQuarter, endOfQuarter, getWeek, isValid } from 'date-fns';
import WeeklyCommandHuddle from './WeeklyCommandHuddle';

// Safe date formatter
const safeFormatDate = (date: Date | string | undefined, formatStr: string): string => {
  if (!date) return '';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

interface WeeklyHurdle {
  id: string;
  weekStart: string;
  weekEnd: string;
  wins: string[];
  challenges: string[];
  learnings: string[];
  nextWeekFocus: string[];
  gratitude: string;
  overallMood: 'great' | 'good' | 'neutral' | 'difficult' | 'challenging';
  energyLevel: number;
  progressRating: number;
  createdAt: string;
  completedAt?: string; // When the hurdle was actually completed
  clarityResponses?: Record<string, string>; // Mindset clarity responses
}

// Helper function to convert WeeklyReviewData to WeeklyHurdle format
const convertReviewDataToHurdle = (review: any): WeeklyHurdle => {
  const weekStart = review.weekOf instanceof Date ? review.weekOf : new Date(review.weekOf);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  // Parse wins from winsReflection (stored as newline-separated string)
  const wins = review.winsReflection ? review.winsReflection.split('\n').filter((w: string) => w.trim()) : [];
  
  // Parse challenges from gapsAnalysis (stored as newline-separated string)  
  const challenges = review.gapsAnalysis ? review.gapsAnalysis.split('\n').filter((g: string) => g.trim()) : review.roadblocks || [];
  
  // Parse learnings from keyLesson (stored as newline-separated string)
  const learnings = review.keyLesson ? review.keyLesson.split('\n').filter((l: string) => l.trim()) : review.learnings || [];
  
  // Determine mood based on satisfaction score
  const mood = review.satisfaction >= 4 ? 'great' : review.satisfaction >= 3 ? 'good' : review.satisfaction >= 2 ? 'neutral' : 'difficult';
  
  return {
    id: review.id,
    weekStart: safeFormatDate(weekStart, 'yyyy-MM-dd'),
    weekEnd: safeFormatDate(weekEnd, 'yyyy-MM-dd'),
    wins,
    challenges,
    learnings,
    nextWeekFocus: review.nextWeekPriorities || [],
    gratitude: review.notes || review.strategicCheckIn || '',
    overallMood: mood as WeeklyHurdle['overallMood'],
    energyLevel: review.energyLevel || 5,
    progressRating: Math.round((review.overallProgress || 50) / 10),
    createdAt: safeFormatDate(weekStart, 'yyyy-MM-dd'),
    completedAt: review.completedAt ? safeFormatDate(review.completedAt, 'yyyy-MM-dd') : undefined,
    clarityResponses: review.clarityResponses || {},
  };
};

// Mock data for demonstration - covering different quarters of 2025
const mockHurdles: WeeklyHurdle[] = [
  // Q1 2025 data
  {
    id: '1',
    weekStart: '2025-01-06',
    weekEnd: '2025-01-12',
    wins: ['Set up new year goals', 'Started morning routine', 'Organized workspace'],
    challenges: ['Getting back into rhythm', 'Cold weather affecting mood', 'Post-holiday adjustment'],
    learnings: ['Consistency beats perfection', 'Small habits compound', 'Environment affects productivity'],
    nextWeekFocus: ['Maintain morning routine', 'Start fitness program', 'Plan quarterly objectives'],
    gratitude: 'Grateful for fresh starts and new opportunities.',
    overallMood: 'good',
    energyLevel: 6,
    progressRating: 7,
    createdAt: '2025-01-12',
  },
  {
    id: '2',
    weekStart: '2025-02-10',
    weekEnd: '2025-02-16',
    wins: ['Completed major project milestone', 'Improved team communication', 'Personal reading goal met'],
    challenges: ['Work-life balance', 'Managing stakeholder expectations', 'Technical complexity'],
    learnings: ['Clear communication prevents confusion', 'Regular breaks improve focus', 'Learning is continuous'],
    nextWeekFocus: ['Focus on team development', 'Implement new processes', 'Plan spring initiatives'],
    gratitude: 'Thankful for supportive colleagues and growth opportunities.',
    overallMood: 'great',
    energyLevel: 8,
    progressRating: 8,
    createdAt: '2025-02-16',
  },
  // Q2 2025 data
  {
    id: '3',
    weekStart: '2025-04-07',
    weekEnd: '2025-04-13',
    wins: ['Launched spring campaign', 'Improved customer satisfaction', 'Team building success'],
    challenges: ['Resource constraints', 'Tight deadlines', 'Market competition'],
    learnings: ['Creativity thrives under constraints', 'Customer feedback is invaluable', 'Team unity drives results'],
    nextWeekFocus: ['Optimize processes', 'Gather customer insights', 'Plan summer strategy'],
    gratitude: 'Grateful for creative challenges and team resilience.',
    overallMood: 'good',
    energyLevel: 7,
    progressRating: 8,
    createdAt: '2025-04-13',
  },
  // Q3 2025 data
  {
    id: '4',
    weekStart: '2025-07-14',
    weekEnd: '2025-07-20',
    wins: ['Mid-year review success', 'Summer project kickoff', 'Personal development milestone'],
    challenges: ['Vacation coverage', 'Summer slowdown', 'Maintaining momentum'],
    learnings: ['Planning prevents poor performance', 'Delegation empowers teams', 'Rest fuels creativity'],
    nextWeekFocus: ['Prepare for autumn rush', 'Cross-train team members', 'Update annual goals'],
    gratitude: 'Thankful for mid-year achievements and summer rejuvenation.',
    overallMood: 'great',
    energyLevel: 9,
    progressRating: 9,
    createdAt: '2025-07-20',
  },
  // Q4 2025 data (current)
  {
    id: '5',
    weekStart: '2025-09-30',
    weekEnd: '2025-10-06',
    wins: ['Completed product launch', 'Team collaboration improved', 'Personal fitness goal achieved'],
    challenges: ['Time management issues', 'Technical debt accumulated', 'Work-life balance struggled'],
    learnings: ['Planning is crucial for success', 'Communication prevents most problems', 'Small wins compound'],
    nextWeekFocus: ['Focus on code quality', 'Implement better planning', 'Schedule regular breaks'],
    gratitude: 'Grateful for my supportive team and the opportunity to work on meaningful projects.',
    overallMood: 'good',
    energyLevel: 7,
    progressRating: 8,
    createdAt: '2025-10-06',
    completedAt: '2025-10-07', // Completed the next day
    clarityResponses: {
      'creativity-passion': 'Feeling inspired by the product launch - it reminded me why I love building things that help people.',
      'career-finance': 'Making good progress on career goals, though need to be more strategic about time management.',
      'health-wellbeing': 'Exercise routine is helping with energy levels, but sleep could be better.'
    }
  },
  {
    id: '6',
    weekStart: '2025-10-07',
    weekEnd: '2025-10-13',
    wins: ['Refactored legacy code', 'Mentored junior developer', 'Completed quarterly planning'],
    challenges: ['Debugging complex issues', 'Meeting deadlines', 'Managing stakeholder expectations'],
    learnings: ['Code reviews catch bugs early', 'Teaching helps solidify knowledge', 'Buffer time is essential'],
    nextWeekFocus: ['Start new feature development', 'Improve testing coverage', 'Schedule team retrospective'],
    gratitude: 'Thankful for continuous learning opportunities and team trust.',
    overallMood: 'great',
    energyLevel: 8,
    progressRating: 9,
    createdAt: '2025-10-13',
    completedAt: '2025-10-14', // Completed the next day
    clarityResponses: {
      'mind-spirit': 'Mentoring others gives me a sense of purpose and reminds me of how much I\'ve grown.',
      'relationships': 'Good week for team relationships - the mentoring session created better understanding.',
      'career-finance': 'Quarterly planning went well - feeling aligned with long-term career objectives.'
    }
  }
];

function WeeklyReview() {
  const { state } = useApp();
  const [selectedHurdle, setSelectedHurdle] = useState<WeeklyHurdle | null>(null);
  const [showCommandHuddle, setShowCommandHuddle] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(state.currentQuarter);
  const [selectedWeekForHurdle, setSelectedWeekForHurdle] = useState<Date | null>(null);
  
  const currentYear = new Date().getFullYear();
  const currentQuarter = selectedQuarter;

  // Generate weeks for current quarter
  const generateQuarterWeeks = () => {
    const weeks = [];
    const quarterStart = startOfQuarter(new Date(currentYear, (currentQuarter - 1) * 3, 1));
    const quarterEnd = endOfQuarter(new Date(currentYear, (currentQuarter - 1) * 3, 1));
    
    // Convert real weekly reviews to hurdle format
    const realHurdles = state.weeklyReviews?.map(convertReviewDataToHurdle) || [];
    
    // Debug: Log the data to help troubleshoot
    console.log('📊 WeeklyReview Debug:', {
      totalWeeklyReviews: state.weeklyReviews?.length || 0,
      weeklyReviews: state.weeklyReviews,
      realHurdles: realHurdles,
      currentQuarter,
      currentYear
    });
    
    // Combine real data with mock data (real data takes precedence)
    const allHurdles = [...realHurdles, ...mockHurdles];
    
    let currentWeek = startOfWeek(quarterStart, { weekStartsOn: 1 });
    
    while (currentWeek <= quarterEnd) {
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekId = format(currentWeek, 'yyyy-MM-dd');
      
      // Find hurdle for this week (prioritize real data over mock data)
      const hurdle = allHurdles.find(r => r.weekStart === weekId);
      const hasHurdle = !!hurdle;
      
      // Get the actual week number of the year (1-52/53)
      const yearWeekNumber = getWeek(currentWeek, { weekStartsOn: 1 });
      
      weeks.push({
        number: yearWeekNumber,
        start: currentWeek,
        end: weekEnd > quarterEnd ? quarterEnd : weekEnd,
        hasHurdle,
        hurdle,
        id: weekId,
      });
      currentWeek = addWeeks(currentWeek, 1);
      
      // Safety check to prevent infinite loop (quarters have at most 14 weeks)
      if (weeks.length > 20) break;
    }
    
    return weeks;
  };

  const quarterWeeks = generateQuarterWeeks();
  
  // Filter hurdles for the selected quarter (using real data + mock data)
  const realHurdles = state.weeklyReviews?.map(convertReviewDataToHurdle) || [];
  const allHurdles = [...realHurdles, ...mockHurdles];
  
  const quarterHurdles = allHurdles.filter(hurdle => {
    const hurdleDate = new Date(hurdle.weekStart);
    const hurdleQuarter = Math.ceil((hurdleDate.getMonth() + 1) / 3);
    return hurdleQuarter === currentQuarter && hurdleDate.getFullYear() === currentYear;
  });

  const getMoodColor = (mood: WeeklyHurdle['overallMood']) => {
    switch (mood) {
      case 'great':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'neutral':
        return 'bg-gray-500';
      case 'difficult':
        return 'bg-orange-500';
      case 'challenging':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMoodBadgeVariant = (mood: WeeklyHurdle['overallMood']) => {
    switch (mood) {
      case 'great':
      case 'good':
        return 'default' as const;
      case 'neutral':
        return 'secondary' as const;
      case 'difficult':
      case 'challenging':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    return safeFormatDate(date, 'MMM d');
  };

  const formatCompletionDate = (date: Date | string | undefined) => {
    return safeFormatDate(date, 'MMM d, yyyy');
  };

  if (selectedHurdle) {
    return (
      <div className="p-8 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedHurdle(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quarter Overview
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Week of {formatDate(selectedHurdle.weekStart)} - {formatDate(selectedHurdle.weekEnd)}
                </CardTitle>
                <CardDescription>
                  Hurdle completed on {formatCompletionDate(selectedHurdle.completedAt || selectedHurdle.createdAt)}
                </CardDescription>
              </div>
              <Badge variant={getMoodBadgeVariant(selectedHurdle.overallMood)}>
                {selectedHurdle.overallMood}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wins */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">What Went Well</h3>
              </div>
              <ul className="space-y-2">
                {selectedHurdle.wins.map((win: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-4" />

            {/* Challenges */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Challenges</h3>
              </div>
              <ul className="space-y-2">
                {selectedHurdle.challenges.map((challenge: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-1" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-4" />

            {/* Learnings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Key Learnings</h3>
              </div>
              <ul className="space-y-2">
                {selectedHurdle.learnings.map((learning: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span>{learning}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-4" />

            {/* Next Week Focus */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Next Week Focus</h3>
              </div>
              <ul className="space-y-2">
                {selectedHurdle.nextWeekFocus.map((focus: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">▶</span>
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-4" />

            {/* Gratitude */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold">Gratitude</h3>
              </div>
              <p className="text-gray-600 italic">{selectedHurdle.gratitude}</p>
            </div>

            {/* Clarity Responses */}
            {selectedHurdle.clarityResponses && Object.keys(selectedHurdle.clarityResponses).length > 0 && (
              <>
                <hr className="my-4" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">Mindset & Clarity Check</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(selectedHurdle.clarityResponses).map(([key, value]) => {
                      const questionLabels: Record<string, string> = {
                        'creativity-passion': 'Creativity & Passion',
                        'mind-spirit': 'Mind & Spirit',
                        'relationships': 'Relationships',
                        'community-giving': 'Community & Giving',
                        'career-finance': 'Career & Finance',
                        'health-wellbeing': 'Health & Wellbeing'
                      };
                      
                      return value && value.trim() ? (
                        <div key={key} className="bg-indigo-50 p-3 rounded-lg">
                          <h4 className="font-medium text-indigo-800 mb-1">
                            {questionLabels[key] || key}
                          </h4>
                          <p className="text-gray-700 text-sm">{value}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </>
            )}

            <hr className="my-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full ${getMoodColor(selectedHurdle.overallMood)} mx-auto mb-2`} />
                  <p className="text-sm text-gray-600">Mood</p>
                  <p className="capitalize font-medium">{selectedHurdle.overallMood}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Battery className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold">{selectedHurdle.energyLevel}</span>
                    <span className="text-gray-600">/10</span>
                  </div>
                  <p className="text-sm text-gray-600">Energy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="text-2xl font-bold">{selectedHurdle.progressRating}</span>
                    <span className="text-gray-600">/10</span>
                  </div>
                  <p className="text-sm text-gray-600">Progress</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Q{currentQuarter} {currentYear} Weekly Hurdles</h1>
          <p className="text-gray-600">
            Review your progress across the quarter. Weeks without hurdles are shown in gray.
            {state.weeklyReviews && state.weeklyReviews.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {state.weeklyReviews.length} real hurdle{state.weeklyReviews.length !== 1 ? 's' : ''} loaded
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => {
          setSelectedWeekForHurdle(null); // No specific week selected
          setShowCommandHuddle(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Hurdle
        </Button>
      </div>

      {/* Quarter Selection Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([1, 2, 3, 4] as const).map((quarter) => (
          <button
            key={quarter}
            onClick={() => setSelectedQuarter(quarter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedQuarter === quarter
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Q{quarter} {currentYear}
          </button>
        ))}
      </div>

      {/* Quarter Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quarterWeeks.map((week) => (
          <Card
            key={week.id}
            className={`cursor-pointer transition-all duration-200 ${
              week.hasHurdle
                ? 'hover:shadow-lg hover:scale-105 border-blue-200 bg-blue-50/50'
                : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
            }`}
            onClick={() => {
              if (week.hasHurdle && week.hurdle) {
                setSelectedHurdle(week.hurdle);
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Week {week.number}</CardTitle>
                  <CardDescription className="text-sm">
                    {formatDate(week.start)} - {formatDate(week.end)}
                  </CardDescription>
                </div>
                {week.hasHurdle ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <Badge variant={getMoodBadgeVariant(week.hurdle!.overallMood)}>
                      {week.hurdle!.overallMood}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                )}
              </div>
            </CardHeader>
            
            {week.hasHurdle && week.hurdle ? (
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-sm">Top Win</h4>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {week.hurdle.wins[0]}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Battery className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{week.hurdle.energyLevel}/10</span>
                    </div>
                    <p className="text-xs text-gray-600">Energy</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{week.hurdle.progressRating}/10</span>
                    </div>
                    <p className="text-xs text-gray-600">Progress</p>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No hurdle yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWeekForHurdle(week.start);
                      setShowCommandHuddle(true);
                    }}
                  >
                    Add Hurdle
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Quarter Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Quarter Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Weeks Completed:</span>
              <span className="font-medium">{quarterWeeks.filter(w => w.hasHurdle).length}/{quarterWeeks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Energy:</span>
              <span className="font-medium">
                {quarterHurdles.length > 0 
                  ? (quarterHurdles.reduce((acc: number, r: WeeklyHurdle) => acc + r.energyLevel, 0) / quarterHurdles.length).toFixed(1)
                  : 'N/A'
                }/10
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Progress:</span>
              <span className="font-medium">
                {quarterHurdles.length > 0 
                  ? (quarterHurdles.reduce((acc: number, r: WeeklyHurdle) => acc + r.progressRating, 0) / quarterHurdles.length).toFixed(1)
                  : 'N/A'
                }/10
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Hurdle Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              {quarterWeeks.filter(w => w.hasHurdle).length > 0 
                ? `You've been consistent with hurdles this quarter. Keep building on your wins and learning from challenges to maintain momentum toward your goals.`
                : 'Start adding weekly hurdles to track your progress and identify patterns in your personal growth journey.'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Command Huddle Modal */}
      <WeeklyCommandHuddle
        isOpen={showCommandHuddle}
        onClose={() => {
          setShowCommandHuddle(false);
          setSelectedWeekForHurdle(null); // Reset selected week
        }}
        onComplete={() => {
          setShowCommandHuddle(false);
          setSelectedWeekForHurdle(null); // Reset selected week
          // The component will automatically refresh with new data
        }}
        selectedWeek={selectedWeekForHurdle || undefined}
      />
    </div>
  );
}

export default WeeklyReview;
