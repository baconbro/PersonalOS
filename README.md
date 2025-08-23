# Personal OS - Strategic Goal Management System

A comprehensive React TypeScript application for managing your personal strategic goals through a structured three-tier system: Annual Flight Plans, 90-Day Sprints, and Weekly Execution Reviews.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:5173
```

### Firebase Setup (Cloud Sync)

**Important**: The app now uses Firebase for data storage instead of localStorage for better reliability and cross-device sync.

1. **Create Firebase Project**: Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

2. **Update Configuration**: Replace the placeholder values in `src/lib/firebase.ts` with your actual Firebase config

3. **Test Locally**: Restart your dev server after updating the config

4. **Deploy**: Use `npm run build && firebase deploy` to deploy to Firebase Hosting

> Note: Without Firebase, the app works locally (localStorage) but won’t sync across devices.

## 📋 System Overview

Personal OS implements a strategic framework based on three time horizons:

- **🎯 Annual Flight Plans**: 2-3 high-level strategic goals set at the start of each year
- **📅 90-Day Sprints**: Quarterly objectives and key results (OKRs) that break down annual goals
- **✅ Weekly Execution Reviews**: Weekly accountability loops for progress review and priority setting

## 🎮 How to Use the App

### 🪄 Public Landing Page

- When logged out, the root shows a modern landing page explaining the system.
- You can access it anytime at `/welcome` (even when logged in). It’s not in the navigation.

### 📖 Built-in User Guide

Personal OS includes a comprehensive **User Guide** with detailed examples and best practices:

- **Click the "User Guide" tab** in the navigation to access the full guide
- **Real-world examples** of annual goals, quarterly OKRs, and weekly tasks
- **Step-by-step frameworks** for weekly reviews and goal planning
- **Success principles** and proven methodologies
- **Getting started checklist** for new users

**Start here if you're new to strategic goal management!**

### 1. Dashboard - Your Strategic Command Center

The Dashboard provides an overview of your entire strategic system:

- **Progress Tracking**: Visual progress bars for annual and quarterly goals
- **Weekly Stats**: Current week's task completion and time tracking
- **Load Sample Data**: Click "Load Sample Data" to populate the app with realistic examples
- **Navigation**: Use the sidebar to switch between different sections

### 2. Annual Flight Plan - Setting Your Year's Direction

**Purpose**: Define 2-3 major strategic goals for the year

**How to Use**:
1. Click "Annual Flight Plan" in the sidebar
2. Click "Add Annual Goal" to create a new goal
3. Fill out:
   - **Title**: Clear, specific goal name (e.g., "Master AI/ML Fundamentals")
   - **Description**: Detailed explanation of what success looks like
   - **Target Date**: When you want to achieve this goal
   - **Success Metrics**: How you'll measure progress
4. **Edit**: Click the pencil icon to modify existing goals
5. **Delete**: Click the trash icon to remove goals
6. **Progress**: Update progress percentage as you make headway

**Best Practices**:
- Limit to 2-3 goals maximum for focus
- Make goals specific and measurable
- Review and update progress monthly

### 3. 90-Day Sprint - Quarterly Focus

**Purpose**: Break down annual goals into quarterly objectives with measurable key results

**How to Use**:
1. Click "90-Day Sprint" in the sidebar
2. Click "Add Quarterly Goal" 
3. Fill out:
   - **Title**: What you want to achieve this quarter
   - **Description**: Context and approach
   - **Link to Annual Goal**: Connect to your yearly objectives
   - **Target Quarter**: Q1, Q2, Q3, or Q4
   - **Priority Level**: High, Medium, or Low
4. **Add Key Results**: Click "Add Key Result" to define measurable outcomes
   - Set target values and units (e.g., "Complete 5 courses")
   - Update current values as you progress
5. **Manage**: Edit, duplicate, or delete goals as needed

**Best Practices**:
- Each quarterly goal should support an annual goal
- Create 3-5 key results per goal
- Update progress weekly during your reviews

### 4. Weekly Execution Review - Your Accountability Loop

**Purpose**: Plan weekly tasks, track progress, identify roadblocks, and maintain momentum

#### Managing Tasks

**Quick Add Tasks**:
- Use the quick-add buttons for common tasks:
  - "Review Goals": Add a goal review task
  - "Plan Week": Add a weekly planning task  
  - "Review Meeting": Add a review meeting task

**Custom Tasks**:
1. Click "Add Custom Task"
2. Fill out the form:
   - **Title**: What needs to be done
   - **Description**: Additional context or details
   - **Link to Quarterly Goal**: Connect to your quarterly objectives
   - **Priority**: High, Medium, or Low
   - **Estimated Hours**: How long you think it will take

**Task Management**:
- ✅ **Complete**: Check the checkbox when done
- ✏️ **Edit**: Click the pencil icon to modify
- 📋 **Duplicate**: Click the copy icon to create a similar task
- 🗑️ **Delete**: Click the trash icon to remove (with confirmation)
- ⏱️ **Time Tracking**: Update actual hours spent in the time input field

#### Weekly Review Process

**Complete Your Review**:
1. Click "Complete Review" button
2. Fill out each section:

**📊 Last Week's Scorecard**:
- **Goals Set**: What did you plan to accomplish?
- **Results**: What actually happened? Be honest about outcomes.

**🚧 Roadblocks & Risks**:
- Document obstacles you encountered
- Note knowledge gaps or external dependencies
- Identify potential future risks

**🎯 This Week's Top Priorities**:
- List 3-5 most important actions for the coming week
- Connect priorities to your quarterly goals
- Be specific about when and how you'll tackle each priority

**🎯 Strategic Check-in**:
- Reflect on how your weekly work connects to quarterly goals
- Assess if you're on track for your bigger objectives
- Note any strategic pivots needed

**💡 Key Learnings & Insights**:
- What did you discover this week?
- What would you do differently?
- What worked well that you should repeat?

**⭐ Ratings**:
- **Energy Level** (1-5): How energized do you feel?
- **Satisfaction** (1-5): How satisfied are you with your progress?

**📝 Additional Notes**:
- Any other thoughts, observations, or plans

#### Week Navigation

- Use "Previous Week" and "Next Week" buttons to view different weeks
- Each week shows its own tasks and review
- Progress and data are automatically saved

## 💾 Data Persistence

- Hybrid model:
   - When authenticated: data syncs with Firebase (life goals, annual, quarterly, weekly tasks, reviews)
   - When not authenticated: data is saved in localStorage
- Check-Ins are currently stored locally only
- Activity logs are local (not in Firestore)

### Backup & Restore (Export / Import)

- Open Notification Settings → “Data Export & Import”
- Export: Download a versioned JSON bundle of your AppState
- Import: Validate JSON, preview counts, choose Merge or Replace, and apply
- Developer details: see `EXPORT_IMPORT_DEVELOPER_GUIDE.md`

## 🎯 Best Practices

### Getting Started
1. **Load Sample Data** first to see how the system works
2. **Start with Annual Goals** - define your year's direction
3. **Break Down into Quarters** - create Q1 goals and key results
4. **Plan Your First Week** - add 3-5 tasks for this week
5. **Complete Your First Review** - establish the weekly habit

### Weekly Rhythm
- **Monday**: Review last week and plan current week tasks
- **Wednesday**: Mid-week check-in on progress
- **Friday**: Complete weekly review and set next week priorities
- **Sunday**: Light review and mental preparation for the week ahead

### Strategic Alignment
- Always connect weekly tasks to quarterly goals
- Regularly review if your quarterly goals support your annual goals
- Adjust course when needed - the system should serve you, not constrain you

## 🛠 Technical Details

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Custom CSS with responsive design
- **State Management**: React Context + useReducer
- **Data Storage**: Firebase (when signed in) + localStorage fallback

### 🧪 RL Engine (Dev-only)

- Lightweight Q-learning engine runs only in development
- Opens a debug drawer via the “RL” button in the header (dev builds only)
- Learns from: KR progress/velocity, task completion/density, recent check-ins, planning consistency
- Reward: `w1*ΔKR + w2*Tasks + w3*Wellbeing - w4*Burnout`

## 📝 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app follows React best practices with functional components, hooks, and TypeScript for type safety.

---

**Ready to take control of your personal strategic execution? Start with loading the sample data and exploring each section!** 🚀
