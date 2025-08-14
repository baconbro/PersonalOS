import React from 'react';
import { Target, Calendar, CheckSquare, TrendingUp, Users, Lightbulb, Clock, Award, Heart } from 'lucide-react';
import './UserGuide.css';

const UserGuide: React.FC = () => {
  return (
    <div className="user-guide">
      <div className="guide-header">
        <h1>
          <Target className="icon" />
          Personal OS User Guide
        </h1>
        <p className="subtitle">Master your strategic goal management system</p>
      </div>

      <div className="guide-content">
        {/* Overview Section */}
        <section className="guide-section">
          <h2>
            <Lightbulb className="section-icon" />
            What is Personal OS?
          </h2>
          <p>
            Personal OS is a strategic goal management system that helps you transform big dreams into actionable results. 
            It follows a proven four-tier approach that connects your life vision to daily execution.
          </p>
          
          <div className="methodology">
            <div className="tier">
              <div className="tier-header">
                <Heart className="tier-icon life-goals" />
                <h3>Life Goals</h3>
                <span className="tier-timeframe">5-10+ years</span>
              </div>
              <p>Your long-term vision across all areas of life that guide your strategic direction</p>
            </div>
            
            <div className="tier">
              <div className="tier-header">
                <Target className="tier-icon annual" />
                <h3>Annual Flight Plans</h3>
                <span className="tier-timeframe">12 months</span>
              </div>
              <p>2-3 high-level strategic goals that connect to your life vision and define your year</p>
            </div>
            
            <div className="tier">
              <div className="tier-header">
                <Calendar className="tier-icon quarterly" />
                <h3>90-Day Sprints</h3>
                <span className="tier-timeframe">3 months</span>
              </div>
              <p>Quarterly objectives and key results (OKRs) that break down annual goals into focused sprints</p>
            </div>
            
            <div className="tier">
              <div className="tier-header">
                <CheckSquare className="tier-icon weekly" />
                <h3>Weekly Execution</h3>
                <span className="tier-timeframe">7 days</span>
              </div>
              <p>Weekly accountability loops for progress review and priority setting</p>
            </div>
          </div>
        </section>

        {/* Life Goals Section */}
        <section className="guide-section">
          <h2>
            <Heart className="section-icon" />
            Life Goals
          </h2>
          <p>
            Life Goals are your long-term vision across all areas of life. They represent who you want to become 
            and what you want to achieve over your chosen timeframe (5-year, 10-year, or lifetime goals). 
            These goals provide the foundation and direction for all your annual planning.
          </p>
          
          <div className="feature-highlight">
            <h4>🤖 AI-Powered Goal Refinement</h4>
            <p>
              Personal OS includes an intelligent AI Refiner that helps strengthen your goals. Once you've written 
              your goal content, click <strong>"Analyze & Refine Goal"</strong> to get:
            </p>
            <ul>
              <li><strong>Goal Quality Score:</strong> Rated 1-10 based on clarity, measurability, and actionability</li>
              <li><strong>Strengths Analysis:</strong> What's already working well in your goal</li>
              <li><strong>Improvement Suggestions:</strong> Specific areas to enhance</li>
              <li><strong>Refined Versions:</strong> Polished alternatives when significant improvements are needed</li>
            </ul>
            <p><em>The AI focuses on strengthening your ideas rather than creating new ones from scratch.</em></p>
          </div>
          
          <div className="example-box">
            <h4>Life Goal Categories</h4>
            <div className="goal-examples">
              <div className="goal-example">
                <div className="goal-category">Career</div>
                <div className="goal-text">"Become a recognized AI technology leader"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">Finance</div>
                <div className="goal-text">"Achieve financial independence by age 50"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">Health</div>
                <div className="goal-text">"Maintain optimal health and fitness throughout life"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">Relationships</div>
                <div className="goal-text">"Build deep, meaningful connections with family and friends"</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Tips for Life Goals</h4>
            <ul>
              <li><strong>Choose your timeframe:</strong> Select 5-year, 10-year, or lifetime based on your vision</li>
              <li><strong>Think big picture:</strong> Focus on transformation and long-term aspirations</li>
              <li><strong>Cover all life areas:</strong> Career, Health, Relationships, Finance, Creativity, etc.</li>
              <li><strong>Write a detailed vision:</strong> Describe what success looks like and why it matters</li>
              <li><strong>Use AI refinement:</strong> Let the AI help strengthen your goal's clarity and impact</li>
              <li><strong>Review annually:</strong> Life goals can evolve as you grow and change</li>
              <li><strong>Link to annual goals:</strong> Your yearly goals should connect to these life visions</li>
            </ul>
          </div>
        </section>

        {/* Annual Goals Section */}
        <section className="guide-section">
          <h2>
            <Target className="section-icon" />
            Annual Flight Plans
          </h2>
          <p>
            Your annual goals bridge your life vision and quarterly execution. They should directly connect to your 
            Life Goals and provide clear direction for the year. Link each annual goal to a specific Life Goal 
            to maintain strategic alignment.
          </p>
          
          <div className="example-box">
            <h4>Example Annual Goals Linked to Life Goals</h4>
            <div className="goal-examples">
              <div className="goal-example">
                <div className="goal-category">→ Career Life Goal</div>
                <div className="goal-text">"Complete Stanford AI Certificate and launch first AI pilot project"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">→ Health Life Goal</div>
                <div className="goal-text">"Run first half-marathon and establish consistent strength training routine"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">→ Finance Life Goal</div>
                <div className="goal-text">"Increase savings rate to 30% and max out retirement contributions"</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Pro Tips for Annual Goals</h4>
            <ul>
              <li><strong>Link to Life Goals:</strong> Each annual goal should connect to a specific Life Goal</li>
              <li><strong>Limit to 2-3 goals:</strong> Focus is power. Too many goals dilute your energy.</li>
              <li><strong>Make them specific:</strong> "Get healthy" → "Run a half-marathon in under 2 hours"</li>
              <li><strong>Include metrics:</strong> How will you know you've succeeded?</li>
              <li><strong>One-year achievable:</strong> Ambitious but realistic for a 12-month timeframe</li>
            </ul>
          </div>
        </section>

        {/* Quarterly Goals Section */}
        <section className="guide-section">
          <h2>
            <Calendar className="section-icon" />
            90-Day Sprints (OKRs)
          </h2>
          <p>
            Quarterly goals break your annual vision into manageable 90-day chunks. Each quarter should have 3-5 objectives 
            that directly support your annual goals.
          </p>
          
          <div className="example-box">
            <h4>Example: Q1 Goals Supporting "Launch Consulting Business"</h4>
            <div className="quarterly-examples">
              <div className="quarterly-example">
                <div className="objective">
                  <h5>Objective 1: Build Foundation</h5>
                  <div className="key-results">
                    <div className="kr">✓ Register LLC and get business license</div>
                    <div className="kr">✓ Create professional website with 5 case studies</div>
                    <div className="kr">✓ Define service packages and pricing</div>
                  </div>
                </div>
              </div>
              
              <div className="quarterly-example">
                <div className="objective">
                  <h5>Objective 2: Build Network</h5>
                  <div className="key-results">
                    <div className="kr">✓ Connect with 50 potential clients on LinkedIn</div>
                    <div className="kr">✓ Attend 4 industry networking events</div>
                    <div className="kr">✓ Schedule 10 discovery calls</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Pro Tips for Quarterly Goals</h4>
            <ul>
              <li><strong>Use OKR format:</strong> Objective (what) + Key Results (how to measure)</li>
              <li><strong>Make key results binary:</strong> Either you did it or you didn't</li>
              <li><strong>Aim for 70% completion:</strong> If you hit 100%, your goals weren't ambitious enough</li>
              <li><strong>Review weekly:</strong> Track progress and adjust tactics as needed</li>
            </ul>
          </div>
        </section>

        {/* Weekly Tasks Section */}
        <section className="guide-section">
          <h2>
            <CheckSquare className="section-icon" />
            Weekly Execution
          </h2>
          <p>
            Weekly tasks are where the rubber meets the road. These are specific, actionable items that 
            move your quarterly goals forward. Think of them as your weekly commitments to yourself.
          </p>
          
          <div className="example-box">
            <h4>Example: Week of March 15th</h4>
            <div className="weekly-examples">
              <div className="weekly-example">
                <div className="task-priority high">High Priority</div>
                <div className="task-text">Write and publish blog post about "5 Marketing Mistakes Startups Make"</div>
                <div className="task-connection">→ Supports: Build Network (Content Marketing)</div>
              </div>
              
              <div className="weekly-example">
                <div className="task-priority medium">Medium Priority</div>
                <div className="task-text">Reach out to 10 warm connections for potential referrals</div>
                <div className="task-connection">→ Supports: Build Network (Direct Outreach)</div>
              </div>
              
              <div className="weekly-example">
                <div className="task-priority low">Low Priority</div>
                <div className="task-text">Update LinkedIn profile with consulting services</div>
                <div className="task-connection">→ Supports: Build Foundation (Online Presence)</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Pro Tips for Weekly Tasks</h4>
            <ul>
              <li><strong>Connect to bigger picture:</strong> Every task should support a quarterly goal</li>
              <li><strong>Use priority levels:</strong> Not all tasks are created equal</li>
              <li><strong>Be specific:</strong> "Work on website" → "Write About page copy and add testimonials"</li>
              <li><strong>Time-box activities:</strong> Estimate how long tasks will take</li>
            </ul>
          </div>
        </section>

        {/* Weekly Reviews Section */}
        <section className="guide-section">
          <h2>
            <TrendingUp className="section-icon" />
            Weekly Reviews
          </h2>
          <p>
            Weekly reviews are your strategic check-ins. This is where you reflect on progress, 
            celebrate wins, learn from setbacks, and plan the upcoming week.
          </p>
          
          <div className="example-box">
            <h4>Example Weekly Review</h4>
            <div className="review-example">
              <div className="review-section">
                <h5>🎯 Goals Achieved</h5>
                <p>"Published marketing blog post (got 200 views and 5 LinkedIn comments). 
                Completed website About page. Had 3 great discovery calls - 2 potential projects!"</p>
              </div>
              
              <div className="review-section">
                <h5>📚 Lessons Learned</h5>
                <p>"Discovery calls go better when I research the company beforehand. 
                Need to prepare better questions about their current challenges."</p>
              </div>
              
              <div className="review-section">
                <h5>🚀 Next Week's Focus</h5>
                <p>"Follow up with the 2 hot prospects. Create proposal templates. 
                Schedule 5 more discovery calls through LinkedIn outreach."</p>
              </div>
            </div>
          </div>

          <div className="review-framework">
            <h4>📋 Weekly Review Framework</h4>
            <div className="framework-steps">
              <div className="framework-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Celebrate Wins</h5>
                  <p>What went well? What are you proud of?</p>
                </div>
              </div>
              
              <div className="framework-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Analyze Gaps</h5>
                  <p>What didn't get done? Why not?</p>
                </div>
              </div>
              
              <div className="framework-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Extract Lessons</h5>
                  <p>What did you learn? How can you improve?</p>
                </div>
              </div>
              
              <div className="framework-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Plan Next Week</h5>
                  <p>What are your top 3 priorities?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="guide-section">
          <h2>
            <Award className="section-icon" />
            Getting Started
          </h2>
          
          <div className="getting-started">
            <div className="start-step">
              <div className="step-icon">
                <Target />
              </div>
              <div className="step-content">
                <h4>Step 1: Set Your Annual Vision</h4>
                <p>Start with 1-2 annual goals. What do you want to achieve this year? 
                Make them specific and meaningful to you.</p>
              </div>
            </div>
            
            <div className="start-step">
              <div className="step-icon">
                <Calendar />
              </div>
              <div className="step-content">
                <h4>Step 2: Plan Your Quarter</h4>
                <p>Break your annual goal into 3-4 quarterly objectives. 
                What needs to happen in the next 90 days?</p>
              </div>
            </div>
            
            <div className="start-step">
              <div className="step-icon">
                <CheckSquare />
              </div>
              <div className="step-content">
                <h4>Step 3: Plan This Week</h4>
                <p>Choose 3-5 specific tasks that will move your quarterly goals forward. 
                Start small and build momentum.</p>
              </div>
            </div>
            
            <div className="start-step">
              <div className="step-icon">
                <Clock />
              </div>
              <div className="step-content">
                <h4>Step 4: Review Weekly</h4>
                <p>Every Friday or Sunday, spend 15-20 minutes reviewing your progress 
                and planning the next week.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation and Workflow Section */}
        <section className="guide-section">
          <h2>
            <TrendingUp className="section-icon" />
            Using Personal OS
          </h2>
          
          <div className="workflow-steps">
            <div className="workflow-step">
              <h4>🎯 1. Start with Life Goals</h4>
              <p>
                Navigate to <strong>Life Goals</strong> and define your long-term vision across all life categories. 
                Use the "All Life Goals" view to see everything or filter by specific categories like Career, Health, or Finance.
              </p>
            </div>
            
            <div className="workflow-step">
              <h4>📅 2. Create Annual Goals</h4>
              <p>
                Go to <strong>Annual Flight Plan</strong> and create 2-3 annual goals. Link each goal to a specific Life Goal 
                to maintain strategic alignment. You'll see the Life Goal's colored icon on your annual goal cards.
              </p>
            </div>
            
            <div className="workflow-step">
              <h4>🚀 3. Break into Quarterly Sprints</h4>
              <p>
                Use <strong>90-Day Sprint</strong> to create quarterly objectives and key results (OKRs) that support your annual goals.
              </p>
            </div>
            
            <div className="workflow-step">
              <h4>✅ 4. Execute Weekly</h4>
              <p>
                Review progress and set priorities in <strong>Weekly Review</strong>. This is where strategy meets execution.
              </p>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="guide-section">
          <h2>
            <Lightbulb className="section-icon" />
            AI-Powered Goal Enhancement
          </h2>
          <p>
            Personal OS includes intelligent AI features powered by Firebase AI and Gemini to help you strengthen 
            your goals at every level of your strategic framework.
          </p>
          
          <div className="ai-features">
            <div className="feature">
              <h4>🎯 Life Goal Refiner</h4>
              <p>
                When creating or editing Life Goals, the AI Refiner analyzes your content and provides:
              </p>
              <ul>
                <li><strong>Quality Score (1-10):</strong> Based on clarity, measurability, and actionability</li>
                <li><strong>Strengths Analysis:</strong> What's already working well</li>
                <li><strong>Improvement Suggestions:</strong> Specific areas to enhance</li>
                <li><strong>Refined Versions:</strong> Polished alternatives when needed</li>
              </ul>
              <p><em>The AI focuses on strengthening your ideas, not replacing them.</em></p>
            </div>

            <div className="feature">
              <h4>📅 Annual Goal Suggestions</h4>
              <p>
                When you link an Annual Goal to a Life Goal, the AI provides smart suggestions for breaking 
                down your Life Goal into actionable annual steps.
              </p>
            </div>

            <div className="feature">
              <h4>📊 Weekly Review Analysis</h4>
              <p>
                After completing weekly reviews, the AI analyzes your patterns and provides insights, 
                suggestions for improvement, and focus areas for the upcoming week.
              </p>
            </div>

            <div className="ai-tips">
              <h4>💡 AI Tips</h4>
              <ul>
                <li><strong>Write first, refine second:</strong> The AI works best when you have content to improve</li>
                <li><strong>Use specific details:</strong> More detailed goals get better AI analysis</li>
                <li><strong>Apply selectively:</strong> Review AI suggestions and apply what resonates</li>
                <li><strong>Iterate:</strong> Analyze, apply, and analyze again to continuously improve</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Success Tips Section */}
        <section className="guide-section">
          <h2>
            <Users className="section-icon" />
            Success Principles
          </h2>
          
          <div className="success-principles">
            <div className="principle">
              <h4>🎯 Focus Over Perfection</h4>
              <p>Better to make progress on fewer goals than to make no progress on many.</p>
            </div>
            
            <div className="principle">
              <h4>📊 Progress Over Completion</h4>
              <p>Celebrate small wins. 70% completion of an ambitious goal beats 100% of an easy one.</p>
            </div>
            
            <div className="principle">
              <h4>🔄 Iteration Over Rigidity</h4>
              <p>Adjust your goals as you learn. The plan is important, but learning is more important.</p>
            </div>
            
            <div className="principle">
              <h4>⚡ Consistency Over Intensity</h4>
              <p>Small, consistent actions compound over time. Show up every week.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserGuide;
