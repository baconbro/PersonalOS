// AI Chatbot Service for Personal OS
// Provides contextual insights and recommendations based on user's current screen and data

import type { LifeGoal, AppState } from '../types';
import { firebaseAI } from '../lib/firebaseAI';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: string;
  taskSuggestion?: TaskSuggestion;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  quarterlyGoalId?: string;
  quarterlyGoalTitle?: string;
  reasoning: string;
  accepted?: boolean;
  snoozed?: boolean;
  snoozeUntil?: Date;
}

export interface ContextualInsight {
  type: 'recommendation' | 'reflection' | 'planning' | 'warning' | 'celebration';
  title: string;
  content: string;
  actionable?: boolean;
}

export class ChatbotService {
  private static instance: ChatbotService;
  private chatHistory: ChatMessage[] = [];

  private constructor() {}

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  // Generate contextual insights based on current screen and user data
  generateContextualInsights(context: string, userState: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];

    switch (context) {
      case 'life-goals-adding':
        insights.push(...this.getLifeGoalAddingInsights(userState));
        break;
      case 'life-goals-viewing':
        insights.push(...this.getLifeGoalViewingInsights(userState));
        break;
      case 'annual-plan':
        insights.push(...this.getAnnualPlanInsights(userState));
        break;
      case 'quarterly-goals':
        insights.push(...this.getQuarterlyGoalInsights(userState));
        break;
      case 'weekly-dashboard':
        insights.push(...this.getWeeklyDashboardInsights(userState));
        break;
      case 'weekly-huddle':
        insights.push(...this.getWeeklyHuddleInsights(userState));
        break;
      default:
        insights.push(...this.getGeneralInsights(userState));
    }

    return insights;
  }

  private getLifeGoalAddingInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];
    const categoryCount = this.getCategoryCounts(state.lifeGoals);

    // Check for balance across life categories
    const imbalancedCategories = Object.entries(categoryCount).filter(([_, count]) => count === 0);
    if (imbalancedCategories.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Life Balance Opportunity',
        content: `You haven't set goals in ${imbalancedCategories.map(([cat]) => cat).join(', ')}. Consider if these areas need attention for a more balanced life approach.`,
        actionable: true
      });
    }

    // Recommend specificity
    insights.push({
      type: 'planning',
      title: 'Goal Crafting Tips',
      content: 'Make your life goal specific and measurable. Instead of "Be healthier," try "Run a half-marathon by year-end" or "Reduce stress through daily 10-minute meditation practice."',
      actionable: true
    });

    // Suggest timeframe consideration
    insights.push({
      type: 'reflection',
      title: 'Timeframe Wisdom',
      content: 'Consider: What would achieving this goal mean for your life in 5 years? How will it compound and create opportunities for growth in other areas?',
      actionable: false
    });

    return insights;
  }

  private getLifeGoalViewingInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];
    const totalGoals = state.lifeGoals.length;
    const completedGoals = state.lifeGoals.filter(g => g.progress >= 100).length;
    const stagnantGoals = state.lifeGoals.filter(g => g.progress < 10 && 
      new Date().getTime() - g.createdAt.getTime() > 90 * 24 * 60 * 60 * 1000).length;

    if (totalGoals === 0) {
      insights.push({
        type: 'planning',
        title: 'Your Personal Operating System Awaits',
        content: 'Life goals are your North Star. Start with 3-5 meaningful goals that excite you. Think about what would make you proud to achieve in the next 5-10 years.',
        actionable: true
      });
    }

    if (stagnantGoals > 0) {
      insights.push({
        type: 'warning',
        title: 'Stagnant Goals Need Attention',
        content: `${stagnantGoals} goals haven't seen progress in 90+ days. Consider breaking them into smaller annual goals or reassessing their importance.`,
        actionable: true
      });
    }

    if (completedGoals > 0) {
      insights.push({
        type: 'celebration',
        title: 'Celebrate Your Wins!',
        content: `You've completed ${completedGoals} life goals! 🎉 This shows your commitment to growth. Consider setting bigger, more ambitious goals that build on this momentum.`,
        actionable: false
      });
    }

    return insights;
  }

  private getAnnualPlanInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];
    const currentYear = new Date().getFullYear();
    const currentYearGoals = state.annualGoals.filter(g => g.year === currentYear);
    const quarterProgress = Math.ceil((new Date().getMonth() + 1) / 3);

    if (currentYearGoals.length === 0) {
      insights.push({
        type: 'planning',
        title: 'Annual Focus Creates Momentum',
        content: 'Break down your life goals into annual milestones. 2-3 focused annual goals are better than 10 scattered ones. What would make this year meaningful?',
        actionable: true
      });
    }

    if (currentYearGoals.length > 0) {
      const avgProgress = currentYearGoals.reduce((sum, g) => sum + g.progress, 0) / currentYearGoals.length;
      const expectedProgress = (quarterProgress / 4) * 100;

      if (avgProgress < expectedProgress - 20) {
        insights.push({
          type: 'warning',
          title: 'Annual Goals Need Acceleration',
          content: `You're ${Math.round(expectedProgress - avgProgress)}% behind expected progress for Q${quarterProgress}. Consider adjusting scope or increasing weekly focus.`,
          actionable: true
        });
      } else if (avgProgress > expectedProgress + 10) {
        insights.push({
          type: 'celebration',
          title: 'Ahead of Schedule! 🚀',
          content: `You're ${Math.round(avgProgress - expectedProgress)}% ahead of expected progress. Consider expanding your goals or helping others achieve theirs.`,
          actionable: true
        });
      }
    }

    return insights;
  }

  private getQuarterlyGoalInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4;
    const quarterlyGoals = state.quarterlyGoals.filter(g => g.quarter === currentQuarter);
    const weekOfYear = Math.ceil(((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
    const weekInQuarter = weekOfYear % 13 || 13;

    if (quarterlyGoals.length === 0) {
      insights.push({
        type: 'planning',
        title: 'Quarterly OKRs Drive Weekly Action',
        content: 'Transform your annual goals into quarterly objectives with measurable key results. This creates a clear bridge between your big vision and daily actions.',
        actionable: true
      });
    }

    if (quarterlyGoals.length > 0 && weekInQuarter > 8) {
      const onTrackGoals = quarterlyGoals.filter(g => g.progress >= 60).length;
      if (onTrackGoals < quarterlyGoals.length / 2) {
        insights.push({
          type: 'warning',
          title: 'Quarter End Approaching',
          content: `Week ${weekInQuarter}/13 of Q${currentQuarter}. Only ${onTrackGoals}/${quarterlyGoals.length} goals are on track (60%+). Time for sprint mode!`,
          actionable: true
        });
      }
    }

    return insights;
  }

  private getWeeklyDashboardInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];
    const currentWeek = new Date();
    const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
    const thisWeekTasks = state.weeklyTasks.filter(task => 
      task.weekOf.getTime() >= weekStart.getTime() && 
      task.weekOf.getTime() < weekStart.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const completedTasks = thisWeekTasks.filter(t => t.completed).length;
    const totalTasks = thisWeekTasks.length;

    if (totalTasks === 0) {
      insights.push({
        type: 'planning',
        title: 'Weekly Planning Creates Momentum',
        content: 'Start your Weekly Command Huddle to define 3-5 priorities that advance your quarterly goals. Focused weekly execution is where transformation happens.',
        actionable: true
      });
    }

    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100;
      
      if (completionRate >= 80) {
        insights.push({
          type: 'celebration',
          title: 'Execution Excellence! 🎯',
          content: `${completionRate.toFixed(0)}% task completion this week. You're building serious momentum. Consider taking on a stretch goal next week.`,
          actionable: false
        });
      } else if (completionRate < 50) {
        insights.push({
          type: 'reflection',
          title: 'Execution Reflection',
          content: `${completionRate.toFixed(0)}% completion rate suggests overcommitment or underestimation. What can you learn for better weekly planning?`,
          actionable: true
        });
      }
    }

    return insights;
  }

  private getWeeklyHuddleInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];

    insights.push({
      type: 'planning',
      title: 'CEO Mindset for Personal Execution',
      content: 'Treat this like a board meeting with your future self. What are the 3-5 highest-impact actions that will move your quarterly goals forward this week?',
      actionable: true
    });

    insights.push({
      type: 'reflection',
      title: 'Energy Management Strategy',
      content: 'Schedule your most important tasks during your peak energy hours. When are you most focused and creative? Protect those hours fiercely.',
      actionable: true
    });

    const recentReviews = state.weeklyReviews.slice(-4);
    if (recentReviews.length > 2) {
      const avgSatisfaction = recentReviews.reduce((sum, r) => sum + r.satisfaction, 0) / recentReviews.length;
      if (avgSatisfaction < 3) {
        insights.push({
          type: 'warning',
          title: 'Satisfaction Trend Alert',
          content: `Your satisfaction has averaged ${avgSatisfaction.toFixed(1)}/5 recently. Consider adjusting your approach or goals to align with what energizes you.`,
          actionable: true
        });
      }
    }

    return insights;
  }

  private getGeneralInsights(state: AppState): ContextualInsight[] {
    const insights: ContextualInsight[] = [];
    const totalGoals = state.lifeGoals.length + state.annualGoals.length + state.quarterlyGoals.length;

    if (totalGoals === 0) {
      insights.push({
        type: 'planning',
        title: 'Welcome to Your Personal Operating System',
        content: 'Start by defining 3-5 life goals that excite you. Then break them into annual milestones, quarterly objectives, and weekly actions. Your future self will thank you.',
        actionable: true
      });
    }

    return insights;
  }

  private getCategoryCounts(lifeGoals: LifeGoal[]): Record<string, number> {
    const counts: Record<string, number> = {};
    lifeGoals.forEach(goal => {
      counts[goal.category] = (counts[goal.category] || 0) + 1;
    });
    return counts;
  }

  // Process user chat message and generate AI response
  async processUserMessage(message: string, context: string, userState: AppState): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      context
    };

    this.chatHistory.push(userMsg);

    // Generate AI response based on context and message
    const response = await this.generateAIResponse(message, context, userState);
    
    // Check if we should suggest a task
    const taskSuggestion = this.shouldSuggestTask(message, context, userState) 
      ? this.generateTaskSuggestion(message, context, userState)
      : undefined;
    
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      context,
      taskSuggestion
    };

    this.chatHistory.push(assistantMsg);
    return assistantMsg;
  }

  private async generateAIResponse(message: string, context: string, userState: AppState): Promise<string> {
    try {
      // Get conversation history for context
      const recentHistory = this.chatHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use Firebase AI to generate contextual response
      const response = await firebaseAI.generateChatResponse(
        message,
        context,
        {
          lifeGoals: userState.lifeGoals,
          annualGoals: userState.annualGoals,
          quarterlyGoals: userState.quarterlyGoals,
          weeklyTasks: userState.weeklyTasks,
          weeklyReviews: userState.weeklyReviews
        },
        recentHistory
      );

      return response;
    } catch (error) {
      console.error('AI response generation failed:', error);
      
      // Fallback to contextual mock responses if AI fails
      return this.getFallbackResponse(message, context, userState);
    }
  }

  private getFallbackResponse(message: string, context: string, userState: AppState): string {
    const insights = this.generateContextualInsights(context, userState);
    const messageLower = message.toLowerCase();

    // Context-aware responses
    if (messageLower.includes('recommend') || messageLower.includes('suggest')) {
      const recommendations = insights.filter(i => i.type === 'recommendation' || i.type === 'planning');
      if (recommendations.length > 0) {
        return recommendations[0].content + "\n\nWould you like more specific guidance on implementing this?";
      }
    }

    if (messageLower.includes('stuck') || messageLower.includes('help')) {
      return this.getUnstuckAdvice(context, userState);
    }

    if (messageLower.includes('progress') || messageLower.includes('how am i doing')) {
      return this.getProgressAnalysis(userState);
    }

    if (messageLower.includes('next steps') || messageLower.includes('what should i do')) {
      return this.getNextStepsAdvice(context, userState);
    }

    // Default contextual response
    switch (context) {
      case 'life-goals-adding':
        return "Great that you're adding a life goal! Make it specific, meaningful, and connected to your values. What timeframe are you thinking, and how will you measure progress?";
      
      case 'weekly-huddle':
        return "Your Weekly Command Huddle is where strategy meets execution. Focus on 3-5 high-impact priorities that directly advance your quarterly goals. What's your biggest opportunity this week?";
      
      case 'weekly-dashboard':
        return "Your weekly execution is where transformation happens. How can you optimize your energy and focus to make meaningful progress on what matters most?";
      
      default:
        return "I'm here to help you optimize your personal execution system. What specific area would you like insights on - goal setting, planning, execution, or reflection?";
    }
  }

  private getUnstuckAdvice(context: string, _userState: AppState): string {
    switch (context) {
      case 'life-goals-adding':
        return "Feeling stuck on life goals? Start with this question: 'What would I regret not pursuing in the next 10 years?' Focus on growth, relationships, and contribution. Make it personal and exciting.";
      
      case 'annual-plan':
        return "Break your life goals into smaller annual milestones. What's one meaningful step toward each life goal you could achieve this year? Think progress, not perfection.";
      
      case 'quarterly-goals':
        return "Stuck on quarterly goals? Use OKRs: 1 ambitious Objective with 3-4 measurable Key Results. Ask: 'What would need to be true by quarter-end to make real progress?'";
      
      default:
        return "When stuck, zoom out to your life goals, then zoom in to this week. What's one small action you could take today that aligns with your bigger vision?";
    }
  }

  private getProgressAnalysis(userState: AppState): string {
    const lifeGoalsProgress = userState.lifeGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(userState.lifeGoals.length, 1);
    const annualGoalsProgress = userState.annualGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(userState.annualGoals.length, 1);
    
    const thisWeekTasks = userState.weeklyTasks.filter(t => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      return t.weekOf >= weekStart;
    });
    const weeklyCompletion = thisWeekTasks.filter(t => t.completed).length / Math.max(thisWeekTasks.length, 1) * 100;

    return `Here's your progress snapshot:
    
📈 Life Goals: ${lifeGoalsProgress.toFixed(0)}% average progress
🎯 Annual Goals: ${annualGoalsProgress.toFixed(0)}% average progress  
⚡ This Week: ${weeklyCompletion.toFixed(0)}% task completion

${weeklyCompletion >= 80 ? "🔥 Excellent execution this week!" : weeklyCompletion >= 60 ? "💪 Solid progress - keep pushing!" : "🎯 Opportunity to tighten your weekly focus."}

Remember: Consistent execution beats perfect planning. Small daily actions compound into life-changing results.`;
  }

  private getNextStepsAdvice(context: string, userState: AppState): string {
    switch (context) {
      case 'life-goals-viewing':
        if (userState.lifeGoals.length === 0) {
          return "Next step: Define 3-5 life goals that excite you. Think 5-10 year timeframe. What would make you proud to achieve?";
        }
        return "Next step: Break your life goals into specific annual milestones. What progress could you make this year on each goal?";
      
      case 'annual-plan':
        if (userState.annualGoals.length === 0) {
          return "Next step: Create 2-3 annual goals that advance your life goals. Be specific about what 'done' looks like by year-end.";
        }
        return "Next step: Transform your annual goals into quarterly OKRs. What measurable progress do you need this quarter?";
      
      case 'quarterly-goals':
        return "Next step: Start your Weekly Command Huddle to define this week's priorities. Bridge your quarterly goals to weekly execution.";
      
      default:
        return "Next step: Focus on your weekly execution. Run your Weekly Command Huddle to define 3-5 priorities that advance your bigger goals.";
    }
  }

  // Determine if the current conversation context suggests creating a task
  private shouldSuggestTask(message: string, context: string, userState: AppState): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Keywords that suggest actionable intent
    const actionKeywords = [
      'should', 'need to', 'want to', 'plan to', 'going to', 'will',
      'start', 'begin', 'work on', 'focus on', 'prioritize', 'complete',
      'finish', 'deliver', 'create', 'build', 'develop', 'improve',
      'organize', 'schedule', 'book', 'call', 'meet', 'review',
      'research', 'study', 'learn', 'practice', 'exercise',
      'tomorrow', 'this week', 'next week', 'soon', 'today',
      'help me', 'how do', 'what should', 'next steps'
    ];

    // Check for action-oriented language
    const hasActionIntent = actionKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check if user has active quarterly goals that could be advanced
    const hasActiveQuarterlyGoals = userState.quarterlyGoals.some(goal => goal.status !== 'completed');
    
    // Check if it's in a planning context
    const isPlanningContext = ['weekly-dashboard', 'weekly-huddle', 'quarterly-goals', 'life-goals-viewing'].includes(context);
    
    // Check if user is asking about next steps or planning
    const isSeekingDirection = lowerMessage.includes('next') || lowerMessage.includes('what should') || 
                              lowerMessage.includes('how do') || lowerMessage.includes('help me') ||
                              lowerMessage.includes('plan') || lowerMessage.includes('focus') ||
                              lowerMessage.includes('work on') || lowerMessage.includes('improve');

    // More generous triggering for demonstration
    return hasActionIntent || isSeekingDirection || (isPlanningContext && (userState.quarterlyGoals.length > 0 || hasActiveQuarterlyGoals));
  }

  // Generate a contextual task suggestion
  private generateTaskSuggestion(message: string, context: string, userState: AppState): TaskSuggestion {
    const relevantQuarterlyGoal = this.findMostRelevantQuarterlyGoal(message, userState);
    const priority = this.determinePriority(message, context);
    const estimatedHours = this.estimateHours(message);

    // Generate task based on message content and context
    const taskTitle = this.generateTaskTitle(message, relevantQuarterlyGoal);
    const taskDescription = this.generateTaskDescription(message, relevantQuarterlyGoal);
    const reasoning = this.generateTaskReasoning(message, relevantQuarterlyGoal, context);

    return {
      id: crypto.randomUUID(),
      title: taskTitle,
      description: taskDescription,
      priority,
      estimatedHours,
      quarterlyGoalId: relevantQuarterlyGoal?.id,
      quarterlyGoalTitle: relevantQuarterlyGoal?.title,
      reasoning
    };
  }

  private findMostRelevantQuarterlyGoal(message: string, userState: AppState): any {
    const activeGoals = userState.quarterlyGoals.filter(goal => goal.status !== 'completed');
    if (activeGoals.length === 0) return null;

    // Simple keyword matching - could be enhanced with more sophisticated NLP
    const lowerMessage = message.toLowerCase();
    
    // Find goal with most keyword matches
    let bestMatch = activeGoals[0];
    let maxMatches = 0;

    activeGoals.forEach(goal => {
      const goalKeywords = goal.title.toLowerCase().split(' ').concat(
        goal.description.toLowerCase().split(' ')
      );
      
      const matches = goalKeywords.filter(keyword => 
        keyword.length > 3 && lowerMessage.includes(keyword)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = goal;
      }
    });

    return bestMatch;
  }

  private determinePriority(message: string, _context: string): 'high' | 'medium' | 'low' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || 
        lowerMessage.includes('critical') || lowerMessage.includes('important')) {
      return 'high';
    }
    
    if (lowerMessage.includes('later') || lowerMessage.includes('eventually') || 
        lowerMessage.includes('when i have time')) {
      return 'low';
    }
    
    // Default to medium for most suggestions
    return 'medium';
  }

  private estimateHours(message: string): number {
    const lowerMessage = message.toLowerCase();
    
    // Look for explicit time mentions
    if (lowerMessage.includes('hour')) {
      const hourMatch = lowerMessage.match(/(\d+)\s*hour/);
      if (hourMatch) return parseInt(hourMatch[1]);
    }
    
    if (lowerMessage.includes('day')) {
      const dayMatch = lowerMessage.match(/(\d+)\s*day/);
      if (dayMatch) return parseInt(dayMatch[1]) * 8; // Assume 8 hours per day
    }
    
    // Default estimates based on task complexity indicators
    if (lowerMessage.includes('quick') || lowerMessage.includes('brief') || 
        lowerMessage.includes('short')) {
      return 1;
    }
    
    if (lowerMessage.includes('deep') || lowerMessage.includes('thorough') || 
        lowerMessage.includes('comprehensive')) {
      return 4;
    }
    
    return 2; // Default 2 hours
  }

  private generateTaskTitle(message: string, quarterlyGoal: any): string {
    // Extract action-oriented phrases from the message
    const actionPatterns = [
      /(?:need to|want to|should|will|plan to)\s+([^.!?]+)/i,
      /(?:start|begin|work on|focus on)\s+([^.!?]+)/i,
      /(?:create|build|develop|improve)\s+([^.!?]+)/i
    ];

    for (const pattern of actionPatterns) {
      const match = message.match(pattern);
      if (match) {
        const extracted = match[1].trim();
        // Clean up and capitalize
        return extracted.charAt(0).toUpperCase() + extracted.slice(1);
      }
    }

    // Fallback: generate based on quarterly goal
    if (quarterlyGoal) {
      return `Advance progress on: ${quarterlyGoal.title}`;
    }

    return 'Complete suggested action item';
  }

  private generateTaskDescription(message: string, quarterlyGoal: any): string {
    let description = `Task suggested based on our conversation: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`;
    
    if (quarterlyGoal) {
      description += `\n\nThis task will contribute to your quarterly goal: ${quarterlyGoal.title}`;
    }
    
    return description;
  }

  private generateTaskReasoning(_message: string, quarterlyGoal: any, context: string): string {
    let reasoning = "Based on our conversation, this seems like a concrete next step you could take.";
    
    if (quarterlyGoal) {
      reasoning += ` It aligns with your quarterly goal "${quarterlyGoal.title}" and would move you closer to completion.`;
    }
    
    const contextReasons: Record<string, string> = {
      'weekly-dashboard': ' Adding this to your weekly tasks would help maintain momentum.',
      'weekly-huddle': ' This fits well with your weekly planning session.',
      'quarterly-goals': ' This would be a good weekly milestone toward your quarterly objective.'
    };
    
    if (contextReasons[context]) {
      reasoning += contextReasons[context];
    }
    
    return reasoning;
  }
  
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  // Test function to add some example task-generating messages
  addExampleConversation(userState: AppState): void {
    const exampleMessages = [
      "I need to work on my fitness goals this week",
      "I should start planning my quarterly review",
      "I want to focus on improving my productivity",
      "Help me plan my week to advance my career goals"
    ];

    // Add an example that would trigger task suggestions
    const testMessage = exampleMessages[0];
    this.processUserMessage(testMessage, 'weekly-dashboard', userState);
  }
}

export const chatbotService = ChatbotService.getInstance();
