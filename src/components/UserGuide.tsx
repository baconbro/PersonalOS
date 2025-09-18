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
          <div className="feature-highlight">
            <h4>Latest Updates</h4>
            <ul>
              <li>🗂️ <strong>Streamlined Goals Table:</strong> Removed social features (Owner/Following columns) for cleaner professional interface</li>
              <li>📅 <strong>Enhanced Date Picker:</strong> Real calendar with Day/Month/Quarter tabs for precise target date selection</li>
              <li>🎯 <strong>Interactive Status Dropdown:</strong> Color-coded status options (ON TRACK, AT RISK, OFF TRACK, etc.)</li>
              <li>🏆 <strong>Accomplishments Tracking:</strong> New tab to celebrate and document goal achievements</li>
              <li>� <strong>Annual Goal Planning:</strong> Dedicated fields for importance, plan, barriers, and rewards</li>
              <li>🔗 <strong>Real Goal Hierarchy:</strong> Parent-child relationships now show actual linked goals (not dummy data)</li>
              <li>🎨 <strong>Professional UI:</strong> Atlassian-inspired design focused on productivity and goal management</li>
            </ul>
          </div>
          
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
                <h3>Weekly Command Huddle</h3>
                <span className="tier-timeframe">7 days</span>
              </div>
              <p>Strategic 15-minute sessions that transform weekly planning into focused executive-level command huddles</p>
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
            Life Goals and provide clear direction for the year. The enhanced Annual Goal planning includes 
            dedicated fields for comprehensive strategy development.
          </p>
          
          <div className="feature-highlight">
            <h4>🎯 Annual Goal Planning Framework</h4>
            <p>When creating or editing Annual Goals, use these four strategic planning fields:</p>
            <ul>
              <li><strong>Why it's important:</strong> Your motivation, values, and purpose behind this goal</li>
              <li><strong>My plan to achieve this goal:</strong> Strategy, approach, and key tactics</li>
              <li><strong>Current barriers (if any):</strong> Obstacles, challenges, and potential risks</li>
              <li><strong>My reward for achieving it:</strong> How you'll celebrate and recognize success</li>
            </ul>
          </div>
          
          <div className="example-box">
            <h4>Example Annual Goal Planning</h4>
            <div className="goal-examples">
              <div className="goal-example">
                <div className="goal-category">🎯 Goal</div>
                <div className="goal-text">"Launch profitable consulting business with $50K revenue"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🤔 Why Important</div>
                <div className="goal-text">"Financial independence, creative control, and using my expertise to help others"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">📋 My Plan</div>
                <div className="goal-text">"Build portfolio, network with 50 prospects, create 3 service packages, focus on LinkedIn marketing"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">⚠️ Current Barriers</div>
                <div className="goal-text">"Limited time due to current job, need to build confidence in pricing, lack of sales experience"</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🏆 My Reward</div>
                <div className="goal-text">"Week-long vacation to Japan and upgrade home office setup"</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Enhanced Annual Goal Strategy</h4>
            <ul>
              <li><strong>Complete the planning fields:</strong> Use all four fields for comprehensive goal strategy</li>
              <li><strong>Link to Life Goals:</strong> Each annual goal should connect to a specific Life Goal</li>
              <li><strong>Limit to 2-3 goals:</strong> Focus is power. Too many goals dilute your energy</li>
              <li><strong>Be specific and measurable:</strong> "Get healthy" → "Run a half-marathon in under 2 hours"</li>
              <li><strong>Plan your celebration:</strong> Having a reward increases motivation and completion rates</li>
              <li><strong>Address barriers upfront:</strong> Identifying obstacles early helps you plan around them</li>
              <li><strong>Review and adjust quarterly:</strong> Update your plan as you learn and circumstances change</li>
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

        {/* Weekly Command Huddle Section */}
        <section className="guide-section">
          <h2>
            <Target className="section-icon" />
            Weekly Command Huddle
          </h2>
          <p>
            The Weekly Command Huddle is your 15-minute strategic session that transforms weekly planning 
            from a mundane task into a focused, executive-level experience. It's not about filling out 
            spreadsheets—it's about having a focused command huddle with your most important employee: your future self.
          </p>
          
          <div className="feature-highlight">
            <h4>🎯 The W.R.P. Ritual (Weekly Review & Plan)</h4>
            <p>
              A guided, three-phase wizard that walks you through strategic weekly planning:
            </p>
            
            <div className="ritual-phases">
              <div className="ritual-phase">
                <div className="phase-number">1</div>
                <div className="phase-content">
                  <h5>📍 Review (Look Back)</h5>
                  <p>Check off last week's priorities and reflect on your biggest win and roadblock. 
                  This provides immediate accountability and helps you spot patterns over time.</p>
                </div>
              </div>
              
              <div className="ritual-phase">
                <div className="phase-number">2</div>
                <div className="phase-content">
                  <h5>🎯 Re-align (Look Up)</h5>
                  <p>Review your current quarterly OKRs with progress bars and select which objective 
                  needs the most impact this week. The system forces you to look at the tactical map 
                  before deciding your route.</p>
                </div>
              </div>
              
              <div className="ritual-phase">
                <div className="phase-number">3</div>
                <div className="phase-content">
                  <h5>📋 Plan (Look Forward)</h5>
                  <p>Define 3-5 "needle-mover" priorities linked to your selected OKR. The system 
                  enforces focus by limiting you to maximum 5 priorities—no comprehensive to-do lists allowed.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="example-box">
            <h4>🎮 This Week Dashboard - Your Command Center</h4>
            <p>Once your huddle is complete, the "This Week" view becomes your minimalist heads-up display:</p>
            
            <div className="dashboard-features">
              <div className="feature-item">
                <h5>⚡ Extreme Focus</h5>
                <p>Only your 3-5 weekly priorities are prominently displayed. The noise of bigger goals is intentionally hidden to prevent overwhelm.</p>
              </div>
              
              <div className="feature-item">
                <h5>📊 Kanban Board</h5>
                <p>Drag your priorities through "To Do → In Progress → Done" for powerful visual progress tracking.</p>
              </div>
              
              <div className="feature-item">
                <h5>🔗 Golden Thread</h5>
                <p>Every priority card has a link icon showing exactly how it connects to your quarterly OKR and annual goal—reinforcing your "Why."</p>
              </div>
              
              <div className="feature-item">
                <h5>📅 Calendar Integration</h5>
                <p>Link priorities to calendar blocks, moving from intentions to scheduled commitments.</p>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Mastering the Weekly Command Huddle</h4>
            <ul>
              <li><strong>Trigger timing:</strong> System prompts every Sunday evening or Monday morning</li>
              <li><strong>Non-dismissible:</strong> This is a core loop of the app—strategic discipline enforced</li>
              <li><strong>Quality over quantity:</strong> 3-5 needle-movers beat 20 scattered tasks every time</li>
              <li><strong>Strategic connection:</strong> Every priority must link to an OKR—no orphaned tasks</li>
              <li><strong>Visual progress:</strong> Use the Kanban board for satisfying completion tracking</li>
              <li><strong>Golden Thread:</strong> Click the 🔗 icon anytime to see your task's strategic context</li>
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

        {/* Goals Table Section */}
        <section className="guide-section">
          <h2>
            <TrendingUp className="section-icon" />
            Goals Table View
          </h2>
          <p>
            The Goals Table provides a professional, streamlined view of all your goals in one place. 
            Recently updated with a cleaner interface focused on productivity and goal management.
          </p>
          
          <div className="feature-highlight">
            <h4>🗂️ Streamlined Interface</h4>
            <p>The table now focuses on essential goal management with these columns:</p>
            <ul>
              <li><strong>Name</strong> - Goal titles with hierarchical indentation</li>
              <li><strong>Status</strong> - Color-coded status indicators (ON TRACK, AT RISK, etc.)</li>
              <li><strong>Progress</strong> - Visual progress bars showing completion percentage</li>
              <li><strong>Target Date</strong> - Enhanced date picker with calendar interface</li>
              <li><strong>Last Updated</strong> - Recent activity timestamps</li>
              <li><strong>Actions</strong> - Quick access menu for goal management</li>
            </ul>
            <p><em>Social features (Owner/Following) have been removed for a cleaner, professional experience.</em></p>
          </div>
          
          <div className="example-box">
            <h4>Enhanced Features</h4>
            <div className="goal-examples">
              <div className="goal-example">
                <div className="goal-category">� Smart Date Picker</div>
                <div className="goal-text">Calendar interface with Day/Month/Quarter tabs for precise target dates</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🎯 Interactive Status</div>
                <div className="goal-text">Dropdown with 7 color-coded status options and visual feedback</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🔗 Real Relationships</div>
                <div className="goal-text">Hierarchical structure shows actual parent-child goal connections</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">⚡ Quick Navigation</div>
                <div className="goal-text">Sorting, filtering, and search for efficient goal management</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Pro Tips for Goals Table</h4>
            <ul>
              <li><strong>Start with sample data:</strong> Click "Load Sample Data" to see the hierarchy in action</li>
              <li><strong>Navigate strategically:</strong> Life Goals → Annual Goals → Quarterly Goals shows strategic alignment</li>
              <li><strong>Track visually:</strong> Progress bars and status badges give quick overview of momentum</li>
              <li><strong>Drill down:</strong> Click goal titles to access detailed About, Updates, Learnings, Risks, and Decisions</li>
              <li><strong>Focus by level:</strong> Collapse sections to focus on specific time horizons</li>
            </ul>
          </div>
        </section>

        {/* Goal Details Section */}
        <section className="guide-section">
          <h2>
            <Target className="section-icon" />
            Goal Details View
          </h2>
          <p>
            Each goal has a comprehensive details page with enhanced features for professional goal management. 
            Click any goal title in the table to access rich tracking, planning, and documentation capabilities.
          </p>
          
          <div className="feature-highlight">
            <h4>🆕 Enhanced Goal Planning</h4>
            <p>For Annual Goals, the About tab now includes dedicated planning sections:</p>
            <ul>
              <li><strong>Why it's important</strong> - Capture your motivation and purpose</li>
              <li><strong>My plan to achieve this goal</strong> - Document your strategy and approach</li>
              <li><strong>Current barriers (if any)</strong> - Identify obstacles and challenges</li>
              <li><strong>My reward for achieving it</strong> - Plan your celebration and recognition</li>
            </ul>
          </div>
          
          <div className="example-box">
            <h4>Goal Details Tabs</h4>
            <div className="goal-examples">
              <div className="goal-example">
                <div className="goal-category">📖 About</div>
                <div className="goal-text">Goal description, planning fields (for Annual Goals), and streamlined interface</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">📰 Updates</div>
                <div className="goal-text">Progress updates with enhanced date picker and interactive status selection</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🧠 Learnings</div>
                <div className="goal-text">Insights, lessons learned, and knowledge gained during goal pursuit</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">⚠️ Risks</div>
                <div className="goal-text">Potential obstacles, mitigation strategies, and risk assessments</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🤔 Decisions</div>
                <div className="goal-text">Key decisions made, rationale, and strategic choices documented</div>
              </div>
              <div className="goal-example">
                <div className="goal-category">🏆 Accomplishments</div>
                <div className="goal-text">Celebrate achievements, milestones, and victories with date tracking</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>💡 Enhanced Goal Management</h4>
            <ul>
              <li><strong>Annual Goal Planning:</strong> Use the four planning fields to create comprehensive goal strategies</li>
              <li><strong>Status Tracking:</strong> Interactive dropdown with 7 status options (PENDING, ON TRACK, AT RISK, etc.)</li>
              <li><strong>Date Precision:</strong> Calendar interface lets you set exact target dates by day, month, or quarter</li>
              <li><strong>Accomplishment Celebration:</strong> Document wins and milestones to maintain motivation</li>
              <li><strong>Real Hierarchy:</strong> Sidebar shows actual parent goals and child goals based on your data</li>
              <li><strong>Professional Focus:</strong> Streamlined interface without social features for productivity</li>
            </ul>
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
              <h4>🗂️ 0. Explore with Goals Table</h4>
              <p>
                Start with <strong>Goals Table</strong> to see the complete hierarchy. Click "Load Sample Data" 
                to see realistic examples, then explore how Life Goals → Annual Goals → Quarterly Goals connect strategically.
              </p>
            </div>
            
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
                to maintain strategic alignment. You'll see this connection in the Goals Table hierarchy.
              </p>
            </div>
            
            <div className="workflow-step">
              <h4>🚀 3. Break into Quarterly Sprints</h4>
              <p>
                Use <strong>90-Day Sprint</strong> to create quarterly objectives and key results (OKRs) that support your annual goals.
                These will appear as the deepest level in your Goals Table hierarchy.
              </p>
            </div>
            
            <div className="workflow-step">
              <h4>✅ 4. Execute Weekly</h4>
              <p>
                Navigate to <strong>"This Week"</strong> and start your <strong>Weekly Command Huddle</strong>—a 15-minute 
                strategic session that guides you through Review → Re-align → Plan. This transforms weekly planning 
                from a chore into focused executive-level decision making.
              </p>
            </div>
            
            <div className="workflow-step">
              <h4>📊 5. Track Progress Professionally</h4>
              <p>
                Return to <strong>Goals Table</strong> regularly to see progress across all levels. Click goal titles 
                to access detailed tracking with About, Updates, Learnings, Risks, and Decisions tabs.
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
