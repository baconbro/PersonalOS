import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Target,
  Mountain,
  CheckSquare,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Heart,
  Zap,
} from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Mountain,
      title: 'Life Goals',
      description: 'Define your 5-10 year vision and long-term aspirations that guide your life direction.',
    },
    {
      icon: Target,
      title: 'Annual & Quarter Goals',
      description: 'Break down life goals into actionable yearly and quarterly objectives with measurable key results.',
    },
    {
      icon: CheckSquare,
      title: 'Weekly Kanban',
      description: 'Execute with clarity using a visual task board that connects daily actions to your bigger goals.',
    },
    {
      icon: BookOpen,
      title: 'Weekly Reflections',
      description: 'Journal your progress, celebrate wins, learn from challenges, and set intentions for the week ahead.',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Visualize your journey with progress bars, completion rates, and insights across all goal levels.',
    },
    {
      icon: TrendingUp,
      title: 'Goal Hierarchy',
      description: 'See how everything connects - from daily tasks to life goals - in one integrated system.',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Stay Focused',
      description: 'Cut through the noise and focus on what truly matters for your growth.',
    },
    {
      icon: Lightbulb,
      title: 'Execute Consistently',
      description: 'Transform aspirations into actions with a clear path from vision to daily tasks.',
    },
    {
      icon: Heart,
      title: 'Live Intentionally',
      description: 'Make deliberate choices aligned with your values and long-term vision.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Your Personal OKR System</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl">
            Transform Your Life Goals
            <br />
            Into Daily <span className="text-primary">Action</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            For people who journal, set goals, and want to make the most of their life.
            Life OKR helps you bridge the gap between your dreams and daily execution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-chart-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-chart-4" />
              <span>Built for goal-setters</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Floating Cards */}
        <div className="mt-20 max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Life Goals Card */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-purple-900">Life Goals</CardTitle>
                    <CardDescription className="text-purple-600">5-10 year vision</CardDescription>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700 font-medium">Health & Wellness</span>
                    <span className="text-purple-600">75%</span>
                  </div>
                  <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-3/4 transition-all duration-1000"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700 font-medium">Financial Freedom</span>
                    <span className="text-purple-600">60%</span>
                  </div>
                  <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-3/5 transition-all duration-1000"></div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Annual Goals Card */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 mt-8 md:mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-blue-900">Annual Goals</CardTitle>
                    <CardDescription className="text-blue-600">2025 objectives</CardDescription>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 font-medium">Launch LifePeak</span>
                    <span className="text-blue-600">85%</span>
                  </div>
                  <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-5/6 transition-all duration-1000"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 font-medium">Build Community</span>
                    <span className="text-blue-600">45%</span>
                  </div>
                  <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-2/5 transition-all duration-1000"></div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Weekly Tasks Card */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 mt-16 md:mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-green-900">This Week</CardTitle>
                    <CardDescription className="text-green-600">Oct 1-7, 2025</CardDescription>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 font-medium">Landing Page Design</span>
                    <span className="text-green-600">100%</span>
                  </div>
                  <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full w-full transition-all duration-1000"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 font-medium">User Testing</span>
                    <span className="text-green-600">70%</span>
                  </div>
                  <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000" style={{width: '70%'}}></div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
          

        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl mb-4">Why Life OKR?</h2>
            <p className="text-muted-foreground text-lg">
              Stop feeling overwhelmed by disconnected to-do lists and vague aspirations.
              Start living with purpose and clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription className="pt-2">{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-5xl mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg">
              A complete system designed for people who take their personal growth seriously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="mb-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              A simple, powerful framework inspired by OKRs used by top companies,
              adapted for your personal life.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span>1</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-2">Define Your Life Goals</h3>
                <p className="text-muted-foreground">
                  Start with 3-5 long-term aspirations that represent your ideal life in 5-10 years.
                  These become your north star for all decisions.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span>2</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-2">Break Down Into Milestones</h3>
                <p className="text-muted-foreground">
                  Create annual and quarterly goals that ladder up to your life goals.
                  Define clear key results to track meaningful progress.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span>3</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-2">Execute Weekly</h3>
                <p className="text-muted-foreground">
                  Plan your week with tasks that move the needle on your goals.
                  Use the Kanban board to stay focused and make daily progress.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span>4</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-2">Reflect & Adjust</h3>
                <p className="text-muted-foreground">
                  End each week with structured reflection. Celebrate wins, learn from challenges,
                  and continuously improve your approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
            <CardHeader className="text-center space-y-6 p-12">
              <div>
                <h2 className="text-3xl md:text-5xl mb-4">
                  Ready to Make Your Goals a Reality?
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Join people who are transforming their lives through intentional goal-setting
                  and consistent execution.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Free forever • No credit card required • Start achieving today
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Life OKR - Your Personal Goal Management System</p>
        </div>
      </div>
    </div>
  );
}
