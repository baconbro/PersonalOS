import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { devToastService } from '../services/devToastService';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize FirebaseApp
const firebaseApp = initializeApp(firebaseConfig);

// Initialize the Gemini Developer API backend service
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { model: "gemini-2.0-flash-001" });

/**
 * Firebase AI Service for Personal OS
 * Provides AI-powered features for goal planning, analysis, and suggestions
 * Uses Firebase AI with Gemini 2.5 Flash model
 */
export class FirebaseAIService {
  private static instance: FirebaseAIService;
  private model = model;

  private constructor() {}

  static getInstance(): FirebaseAIService {
    if (!FirebaseAIService.instance) {
      FirebaseAIService.instance = new FirebaseAIService();
    }
    return FirebaseAIService.instance;
  }

  /**
   * Refine and score an existing life goal
   */
  async refineLifeGoal(lifeGoal: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
    vision: string;
  }): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    refinedTitle?: string;
    refinedDescription?: string;
    refinedVision?: string;
  }> {
    try {
      const prompt = `
        Analyze and refine this life goal. Provide a score out of 10 and specific feedback:

        Life Goal: ${lifeGoal.title}
        Category: ${lifeGoal.category}
        Timeframe: ${lifeGoal.timeframe}
        Description: ${lifeGoal.description}
        Vision: ${lifeGoal.vision}

        Please evaluate this goal on:
        1. Clarity and specificity
        2. Measurability potential
        3. Alignment with timeframe
        4. Inspirational quality
        5. Actionability

        Provide:
        1. A score out of 10
        2. 2-3 specific strengths
        3. 2-3 specific improvements
        4. Refined versions ONLY if significant improvements are needed

        Format:
        SCORE: [number]/10
        STRENGTHS:
        - [strength 1]
        - [strength 2]
        IMPROVEMENTS:
        - [improvement 1]
        - [improvement 2]
        REFINED_TITLE: [only if needs significant improvement]
        REFINED_DESCRIPTION: [only if needs significant improvement]
        REFINED_VISION: [only if needs significant improvement]
      `;

      // Log the query in development mode
      const queryId = devToastService.logAIQuery(prompt, 'life-goal-refinement', this.estimateTokens(prompt));

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Log response tokens in development mode
      devToastService.updateQueryWithResponse(queryId, this.estimateTokens(text));
      
      // Parse the response
      const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
      let score = 0;
      const strengths: string[] = [];
      const improvements: string[] = [];
      let refinedTitle: string | undefined;
      let refinedDescription: string | undefined;
      let refinedVision: string | undefined;
      
      let currentSection = '';
      for (const line of lines) {
        if (line.includes('SCORE:')) {
          const scoreMatch = line.match(/(\d+)/);
          if (scoreMatch) {
            score = parseInt(scoreMatch[1]);
          }
        } else if (line.includes('STRENGTHS:')) {
          currentSection = 'strengths';
        } else if (line.includes('IMPROVEMENTS:')) {
          currentSection = 'improvements';
        } else if (line.includes('REFINED_TITLE:')) {
          refinedTitle = line.replace('REFINED_TITLE:', '').trim();
          currentSection = '';
        } else if (line.includes('REFINED_DESCRIPTION:')) {
          refinedDescription = line.replace('REFINED_DESCRIPTION:', '').trim();
          currentSection = '';
        } else if (line.includes('REFINED_VISION:')) {
          refinedVision = line.replace('REFINED_VISION:', '').trim();
          currentSection = '';
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          const item = line.replace(/^[-•]\s*/, '').trim();
          if (currentSection === 'strengths') {
            strengths.push(item);
          } else if (currentSection === 'improvements') {
            improvements.push(item);
          }
        }
      }
      
      return { 
        score, 
        strengths, 
        improvements, 
        refinedTitle: refinedTitle || undefined,
        refinedDescription: refinedDescription || undefined,
        refinedVision: refinedVision || undefined
      };
    } catch (error) {
      console.error('Error refining life goal:', error);
      throw new Error('Failed to refine life goal');
    }
  }

  /**
   * Generate AI suggestions for breaking down a life goal into annual goals
   */
  async generateAnnualGoalSuggestions(lifeGoal: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
    vision: string;
  }): Promise<string[]> {
    try {
      const prompt = `
        Based on this life goal, suggest 2-3 specific annual goals that would help achieve it:

        Life Goal: ${lifeGoal.title}
        Category: ${lifeGoal.category}
        Timeframe: ${lifeGoal.timeframe}
        Description: ${lifeGoal.description}
        Vision: ${lifeGoal.vision}

        Please provide 2-3 specific, measurable annual goals that are:
        1. Achievable within one year
        2. Directly connected to the life goal
        3. Specific and actionable
        4. Include metrics where possible

        Format as a simple list, one goal per line.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse the response into an array of suggestions
      return text.split('\n').filter((line: string) => line.trim().length > 0);
    } catch (error) {
      console.error('Error generating annual goal suggestions:', error);
      throw new Error('Failed to generate AI suggestions');
    }
  }

  /**
   * Generate AI suggestions for quarterly OKRs based on an annual goal
   */
  async generateQuarterlyOKRSuggestions(annualGoal: {
    title: string;
    description: string;
    targetDate: Date;
  }): Promise<{ objectives: string[], keyResults: string[] }> {
    try {
      const prompt = `
        Based on this annual goal, suggest quarterly objectives and key results (OKRs):

        Annual Goal: ${annualGoal.title}
        Description: ${annualGoal.description}
        Target Date: ${annualGoal.targetDate.toDateString()}

        Please provide:
        1. 2-3 quarterly objectives that break down this annual goal
        2. 2-3 measurable key results for each objective

        Format:
        OBJECTIVES:
        - [objective 1]
        - [objective 2]

        KEY RESULTS:
        - [key result 1]
        - [key result 2]
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse objectives and key results
      const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
      const objectives: string[] = [];
      const keyResults: string[] = [];
      
      let currentSection = '';
      for (const line of lines) {
        if (line.includes('OBJECTIVES:')) {
          currentSection = 'objectives';
        } else if (line.includes('KEY RESULTS:')) {
          currentSection = 'keyResults';
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          const item = line.replace(/^[-•]\s*/, '').trim();
          if (currentSection === 'objectives') {
            objectives.push(item);
          } else if (currentSection === 'keyResults') {
            keyResults.push(item);
          }
        }
      }
      
      return { objectives, keyResults };
    } catch (error) {
      console.error('Error generating quarterly OKR suggestions:', error);
      throw new Error('Failed to generate AI suggestions');
    }
  }

  /**
   * Analyze weekly review and provide insights
   */
  async analyzeWeeklyReview(reviewData: {
    goals: string[];
    accomplishments: string[];
    challenges: string[];
    priorities: string[];
  }): Promise<{
    insights: string[];
    suggestions: string[];
    focus_areas: string[];
  }> {
    try {
      const prompt = `
        Analyze this weekly review and provide insights:

        Goals: ${reviewData.goals.join(', ')}
        Accomplishments: ${reviewData.accomplishments.join(', ')}
        Challenges: ${reviewData.challenges.join(', ')}
        Next Week Priorities: ${reviewData.priorities.join(', ')}

        Please provide:
        1. 2-3 key insights about progress and patterns
        2. 2-3 actionable suggestions for improvement
        3. 2-3 focus areas for the upcoming week

        Format:
        INSIGHTS:
        - [insight 1]
        - [insight 2]

        SUGGESTIONS:
        - [suggestion 1]
        - [suggestion 2]

        FOCUS AREAS:
        - [area 1]
        - [area 2]
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse insights, suggestions, and focus areas
      const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
      const insights: string[] = [];
      const suggestions: string[] = [];
      const focus_areas: string[] = [];
      
      let currentSection = '';
      for (const line of lines) {
        if (line.includes('INSIGHTS:')) {
          currentSection = 'insights';
        } else if (line.includes('SUGGESTIONS:')) {
          currentSection = 'suggestions';
        } else if (line.includes('FOCUS AREAS:')) {
          currentSection = 'focus_areas';
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          const item = line.replace(/^[-•]\s*/, '').trim();
          if (currentSection === 'insights') {
            insights.push(item);
          } else if (currentSection === 'suggestions') {
            suggestions.push(item);
          } else if (currentSection === 'focus_areas') {
            focus_areas.push(item);
          }
        }
      }
      
      return { insights, suggestions, focus_areas };
    } catch (error) {
      console.error('Error analyzing weekly review:', error);
      throw new Error('Failed to analyze weekly review');
    }
  }

  /**
   * Generate personalized life goal suggestions based on user preferences
   */
  async generateLifeGoalSuggestions(preferences: {
    categories: string[];
    interests: string[];
    values: string[];
    timeframe: string;
  }): Promise<{ [category: string]: string[] }> {
    try {
      const prompt = `
        Generate personalized life goal suggestions based on these preferences:

        Preferred Categories: ${preferences.categories.join(', ')}
        Interests: ${preferences.interests.join(', ')}
        Values: ${preferences.values.join(', ')}
        Timeframe: ${preferences.timeframe}

        For each category, suggest 2-3 meaningful life goals that align with the interests and values.
        Make them inspiring, specific, and achievable within the given timeframe.

        Format:
        CATEGORY NAME:
        - [goal 1]
        - [goal 2]
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse suggestions by category
      const suggestions: { [category: string]: string[] } = {};
      const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
      
      let currentCategory = '';
      for (const line of lines) {
        if (line.includes(':') && !line.trim().startsWith('-')) {
          currentCategory = line.replace(':', '').trim();
          suggestions[currentCategory] = [];
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          const goal = line.replace(/^[-•]\s*/, '').trim();
          if (currentCategory && suggestions[currentCategory]) {
            suggestions[currentCategory].push(goal);
          }
        }
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error generating life goal suggestions:', error);
      throw new Error('Failed to generate life goal suggestions');
    }
  }

  /**
   * Generate contextual chat responses for the AI assistant
   */
  async generateChatResponse(
    userMessage: string,
    context: string,
    userState: {
      lifeGoals: any[];
      annualGoals: any[];
      quarterlyGoals: any[];
      weeklyTasks: any[];
      weeklyReviews: any[];
    },
    chatHistory: { role: string; content: string }[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, userState);
      const conversationHistory = chatHistory.slice(-6); // Keep last 6 messages for context
      
      const prompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

USER MESSAGE: ${userMessage}

ASSISTANT RESPONSE:`;

      // Log the query in development mode
      const queryId = devToastService.logAIQuery(prompt, context, this.estimateTokens(prompt));

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text().trim();
      
      // Log response tokens in development mode
      devToastService.updateQueryWithResponse(queryId, this.estimateTokens(responseText));
      
      return responseText;
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  /**
   * Estimate token count for text (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is an approximation since exact tokenization depends on the model
    return Math.ceil(text.length / 4);
  }

  /**
   * Build context-aware system prompt for the AI assistant
   */
  private buildSystemPrompt(context: string, userState: any): string {
    // Determine immediate task based on context
    let immediateTask = '';
    switch (context) {
      case 'life-goals-viewing':
      case 'life-goals-adding':
        immediateTask = `The user is working with Life Goals (Vision layer). Help them clarify their long-term vision and ensure alignment with their values. Ask probing questions about what truly matters to them and how this vision connects to their daily reality.`;
        break;
      case 'annual-plan':
        immediateTask = `The user is working on Annual Planning (Strategy layer). Help them translate life goals into concrete yearly milestones. Focus on strategic prioritization and resource allocation questions.`;
        break;
      case 'quarterly-goals':
        immediateTask = `The user is working on Quarterly OKRs (Tactics layer). Help them break down annual goals into measurable 90-day objectives. Ask about bottlenecks, leverage points, and course-correction needs.`;
        break;
      case 'weekly-dashboard':
        immediateTask = `The user is viewing their Weekly Dashboard (Operations layer). Help them connect daily actions to higher-level objectives. Ask about energy management, priority alignment, and execution consistency.`;
        break;
      case 'weekly-huddle':
        immediateTask = `The user is in their Weekly Command Huddle. This is strategic weekly planning time. Help them reflect on progress, identify roadblocks, and set clear priorities that strengthen their Golden Thread.`;
        break;
      default:
        immediateTask = `The user is on the main Dashboard. Help them see the big picture and identify where their attention should be focused to maintain alignment across their strategic hierarchy.`;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Build Golden Thread hierarchy for user's strategic state
    const buildGoldenThreadHierarchy = () => {
      if (!userState.lifeGoals || userState.lifeGoals.length === 0) {
        return "No Life Goals defined yet - this is the starting point for building your Golden Thread.";
      }

      let hierarchy = '';
      
      userState.lifeGoals.forEach((lifeGoal: any, index: number) => {
        hierarchy += `\n🎯 LIFE GOAL ${index + 1}: "${lifeGoal.title}" (${lifeGoal.category})`;
        hierarchy += `\n   Vision: ${lifeGoal.vision || lifeGoal.description || 'No vision defined'}`;
        hierarchy += `\n   Timeframe: ${lifeGoal.timeframe || 'No timeframe set'}`;
        
        // Find related annual goals
        const relatedAnnualGoals = userState.annualGoals?.filter((annual: any) => 
          annual.lifeGoalId === lifeGoal.id || annual.category === lifeGoal.category
        ) || [];
        
        if (relatedAnnualGoals.length > 0) {
          relatedAnnualGoals.forEach((annualGoal: any, annualIndex: number) => {
            hierarchy += `\n   ↳ 📅 ANNUAL GOAL ${annualIndex + 1}: "${annualGoal.title}"`;
            hierarchy += `\n      Target: ${annualGoal.targetDate ? new Date(annualGoal.targetDate).toLocaleDateString() : 'No date set'}`;
            hierarchy += `\n      Progress: ${annualGoal.progress || 0}%`;
            
            // Find related quarterly goals
            const relatedQuarterlyGoals = userState.quarterlyGoals?.filter((quarterly: any) => 
              quarterly.annualGoalId === annualGoal.id || quarterly.parentGoal === annualGoal.title
            ) || [];
            
            if (relatedQuarterlyGoals.length > 0) {
              relatedQuarterlyGoals.forEach((quarterlyGoal: any, quarterlyIndex: number) => {
                hierarchy += `\n      ↳ 🎯 Q${Math.ceil((new Date().getMonth() + 1) / 3)} OKR ${quarterlyIndex + 1}: "${quarterlyGoal.title}"`;
                hierarchy += `\n         Progress: ${quarterlyGoal.progress || 0}%`;
                
                // Find related weekly tasks
                const relatedWeeklyTasks = userState.weeklyTasks?.filter((task: any) => 
                  task.goalId === quarterlyGoal.id || 
                  task.description?.toLowerCase().includes(quarterlyGoal.title?.toLowerCase().split(' ')[0] || '') ||
                  task.category === quarterlyGoal.category
                ) || [];
                
                if (relatedWeeklyTasks.length > 0) {
                  hierarchy += `\n         ↳ 📋 WEEKLY TASKS:`;
                  relatedWeeklyTasks.forEach((task: any) => {
                    hierarchy += `\n            • "${task.description}" (${task.status || 'Not Started'})`;
                  });
                } else {
                  hierarchy += `\n         ↳ 📋 No weekly tasks linked to this OKR`;
                }
              });
            } else {
              hierarchy += `\n      ↳ No quarterly OKRs defined for this annual goal`;
            }
          });
        } else {
          hierarchy += `\n   ↳ No annual goals defined for this life goal`;
        }
        
        hierarchy += `\n`;
      });
      
      // Show unlinked items
      const unlinkedAnnualGoals = userState.annualGoals?.filter((annual: any) => 
        !userState.lifeGoals.some((life: any) => life.id === annual.lifeGoalId || life.category === annual.category)
      ) || [];
      
      const unlinkedQuarterlyGoals = userState.quarterlyGoals?.filter((quarterly: any) => 
        !userState.annualGoals.some((annual: any) => annual.id === quarterly.annualGoalId)
      ) || [];
      
      const unlinkedWeeklyTasks = userState.weeklyTasks?.filter((task: any) => 
        !userState.quarterlyGoals.some((quarterly: any) => quarterly.id === task.goalId)
      ) || [];
      
      if (unlinkedAnnualGoals.length > 0 || unlinkedQuarterlyGoals.length > 0 || unlinkedWeeklyTasks.length > 0) {
        hierarchy += `\n🔗 UNLINKED ITEMS (BROKEN GOLDEN THREAD):`;
        
        unlinkedAnnualGoals.forEach((goal: any) => {
          hierarchy += `\n   📅 Unlinked Annual: "${goal.title}"`;
        });
        
        unlinkedQuarterlyGoals.forEach((goal: any) => {
          hierarchy += `\n   🎯 Unlinked Quarterly: "${goal.title}"`;
        });
        
        unlinkedWeeklyTasks.forEach((task: any) => {
          hierarchy += `\n   📋 Unlinked Task: "${task.description}"`;
        });
      }
      
      return hierarchy;
    };

    return `# [1. CORE IDENTITY]
You are "The Coach", an AI Strategic Advisor within PersonalOS, a personal goal management and execution system. Your purpose is to help users translate their vision into reality by providing insightful questions, data-driven feedback, and unwavering accountability. You are a partner in their journey toward personal sovereignty.

# [2. CORE METHODOLOGY]
You operate on the "Golden Thread" principle. Every piece of advice you give must help the user see or strengthen the connection between their daily actions and their ultimate life vision. The hierarchy is always:
- Life Goals (Vision) → Annual Plans (Strategy) → 90-Day Sprints (OKRs/Tactics) → Weekly Execution (Operations)

Your primary tool is Socratic questioning. Guide the user to their own conclusions rather than giving commands.

# [3. DYNAMIC CONTEXT BLOCK]
## System & Time Information:
- Current Date: ${currentDate}
- Current Quarter: Q${Math.ceil((new Date().getMonth() + 1) / 3)} of ${new Date().getFullYear()}

## User's Current Strategic State (Golden Thread Hierarchy):
${buildGoldenThreadHierarchy()}

# [4. YOUR IMMEDIATE TASK]
${immediateTask}

# [5. RULES OF ENGAGEMENT]
- **Data First:** NEVER give generic advice. ALWAYS tie your observations and questions back to specific data points from the user's strategic hierarchy above.
- **Be a Coach, Not a Cheerleader:** Be encouraging, but don't shy away from pointing out discrepancies or off-track goals. Frame these as opportunities for strategic adjustment.
- **Concise & Actionable:** Keep responses to 2-4 sentences. Focus on asking one powerful question at a time.
- **Use Strategic Language:** Use terms like "alignment," "bottleneck," "leverage," and "course-correction."
- **Embody the Persona:** You are the coach. You are calm, wise, strategic, and a motivator who helps users maintain their Golden Thread.`;
  }
}

// Export singleton instance
export const firebaseAI = FirebaseAIService.getInstance();
