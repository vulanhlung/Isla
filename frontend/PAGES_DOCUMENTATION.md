# ISLA Frontend - Pages & Features Documentation

## Overview

The ISLA frontend consists of 10 main pages providing a complete mental health wellness experience.

---

## 1. Login Page (`/login`)

**File**: `src/pages/LoginPage.jsx`

### Features
- Email and password input
- Error handling and validation
- Link to registration page
- JWT token authentication
- Auto-redirect to dashboard on success

### Technical Details
- Uses `authAPI.login()` from API service
- Stores token in localStorage
- Sets user context
- Navigates to `/dashboard` on success

### User Experience
- Professional gradient background
- Clear error messages
- Loading state indication
- Form validation feedback

---

## 2. Register Page (`/register`)

**File**: `src/pages/RegisterPage.jsx`

### Features
- Email and password registration
- Password confirmation
- Data processing consent checkbox
- Input validation
- Error/success messages
- Link to login page

### Validations
- Email format check
- Password minimum 6 characters
- Password matching
- Consent checkbox required

### Technical Details
- Uses `authAPI.register()` from API service
- Validates form before submission
- Shows success message
- Auto-redirect to login after 2 seconds

### User Experience
- Clear form layout
- Password strength indicator
- Consent explanation
- Success notification

---

## 3. Dashboard Page (`/dashboard`)

**File**: `src/pages/DashboardPage.jsx`

### Features
- **Mood Overview**: Latest mood with timestamp
- **Stats Grid**:
  - Current streak (days)
  - Today's task progress
  - Daily completion rate percentage
  - Total tasks completed all time
- **Recent Mood Chart**: Last 7 days of mood entries
- **Daily Insight**: AI-generated wellness insight
- **Progress Overview**: Visual summary of wellness

### Data Displayed
```javascript
{
  mood: {
    id, mood (HAPPY/NEUTRAL/SAD/OVERWHELMED),
    intensity (1-5), note, date
  },
  recentMoodEntries: [...],
  progress: {
    streakDays, totalTasksDone,
    todayCompleted, todayTotal, todayCompletionRate
  },
  insight: { id, message, type, createdAt }
}
```

### Technical Details
- Uses `dashboardAPI.getDashboard()`
- Fetches on component mount
- Loading state with spinner
- Error handling with alert
- Format dates with `date-fns`

### User Experience
- Welcoming greeting
- Color-coded stat cards
- Easy task progress visualization
- Motivational insights
- Responsive design

---

## 4. Mood Tracking Page (`/mood`)

**File**: `src/pages/MoodPage.jsx`

### Features
- **Mood Selection**: 4 mood options with emojis
  - 😊 Happy (green)
  - 😐 Neutral (gray)
  - 😢 Sad (blue)
  - 😰 Overwhelmed (red)
- **Intensity Slider**: Scale 1-5
- **Optional Notes**: Free-form text field
- **Mood History**: Display all past entries
- **Timestamp Tracking**: Know when mood was recorded

### Technical Details
- Uses `moodAPI.createMood()` to save
- Uses `moodAPI.getMoodHistory()` to fetch
- Real-time list update
- Maximum 1000 characters for notes
- Intensity validation (1-5)

### Data Structure
```javascript
{
  mood: "HAPPY", // Required
  intensity: 3,  // 1-5, Required
  note: "...",   // Optional
  createdAt: timestamp
}
```

### User Experience
- Intuitive mood emoji buttons
- Visual intensity slider
- Chronological history display
- Quick entry process
- Reflection encouragement

---

## 5. Tasks Page (`/tasks`)

**File**: `src/pages/TasksPage.jsx`

### Features
- **Daily Task Generation**: Auto-generates 3 tasks per day
  - Breathing Exercise (5 min) 🌬️
  - CBT Practice (10 min) 🧠
  - Gratitude Journal (5 min) 📝
- **Task Status Tracking**: PENDING, DONE, SKIPPED
- **Progress Visualization**: 
  - Completion count (X of Y)
  - Percentage bar
  - Color-coded status
- **Click to Complete**: Simple checkbox toggle
- **Duration Display**: Time estimate per task

### Technical Details
- Uses `taskAPI.generateDailyTasks()`
- Uses `taskAPI.getTodayTasks()`
- Uses `taskAPI.updateTaskStatus()`
- Tasks reset daily
- Status options: PENDING, DONE, SKIPPED

### Data Structure
```javascript
{
  id: taskId,
  userId: ...,
  taskId: ...,
  status: "PENDING", // or "DONE", "SKIPPED"
  date: today,
  task: {
    type: "BREATHING", // BREATHING, CBT, JOURNAL
    title: "...",
    duration: 5 // minutes
  }
}
```

### User Experience
- Visual progress bar
- Percentage completion
- Quick task toggle
- Task duration info
- Helpful tips section
- Motivational design

---

## 6. Chat Page (`/chat`)

**File**: `src/pages/ChatPage.jsx`

### Features
- **Real-time Chat**: Conversational interface
- **Chat History**: See past conversations
- **AI Responses**: Powered by OpenAI
- **Auto-scroll**: Messages scroll to bottom
- **Loading State**: Typing indicator
- **Message Validation**: Max 1000 characters
- **User/Assistant Differentiation**: Color-coded messages

### Technical Details
- Uses `chatAPI.getChatHistory()`
- Uses `chatAPI.sendMessage()`
- WebSocket-style UI (polling backend)
- Error handling with retry
- Automatic scroll on new messages
- Message timestamp with `date-fns`

### Data Structure
```javascript
{
  id: messageId,
  message: "What's on your mind?",
  role: "user", // or "assistant"
  userId: ...,
  createdAt: timestamp
}
```

### User Experience
- Clean chat interface
- Distinguish user/AI messages
- Visual typing indicator
- Message timestamps
- Error recovery
- Mobile responsive

### Limitations
- Max 1000 characters per message
- Requires OpenAI API key
- Limited context window

---

## 7. CBT Sessions Page (`/cbt`)

**File**: `src/pages/CBTPage.jsx`

### Features
- **4-Step Process**:
  1. Identify the Stressor
  2. Check the Evidence
  3. Find Alternative Perspective
  4. Create an Action Plan
- **Session Progress**: Visual step indicator
- **Previous Responses**: Show in gray box
- **Status Tracking**: active, completed, paused
- **Guided Prompts**: Clear instructions at each step
- **Session Persistence**: Continue previous session

### Technical Details
- Uses `cbtAPI.startSession()`
- Uses `cbtAPI.continueSession()`
- Session state: step (1-4), status
- Stores: stressor, evidence, alternative, actionPlan
- Tracks session duration

### Data Structure
```javascript
{
  id: sessionId,
  userId: ...,
  step: 1, // 1, 2, 3, or 4
  stressor: "...",        // Step 1
  evidence: "...",        // Step 2
  alternative: "...",     // Step 3
  actionPlan: "...",      // Step 4
  status: "active",       // active, completed, paused
  createdAt, updatedAt
}
```

### User Experience
- Structured therapy guidance
- Clear step progression
- Encouragement throughout
- Professional tone
- Printable format (future)
- Privacy assured

### Benefits
- Structured thought process
- Evidence-based approach
- Actionable outcomes
- Therapy guidance offline

---

## 8. Journal Page (`/journal`)

**File**: `src/pages/JournalPage.jsx`

### Features
- **New Entry Form**: Large textarea for writing
- **Journal History**: All past entries listed
- **Free-form Writing**: No constraints
- **Timestamps**: Know when written
- **Chronological Order**: Newest first
- **Entry Previews**: Read full text
- **Toggle Form**: Show/hide writing interface

### Technical Details
- Uses `journalAPI.createJournal()`
- Uses `journalAPI.getJournals()`
- Fetches with limit: 50
- Real-time list update
- Local form state management

### Data Structure
```javascript
{
  id: entryId,
  userId: ...,
  content: "Full text of journal entry",
  createdAt: timestamp
}
```

### User Experience
- Large, inviting text area
- Minimal interface (no rules)
- Preserves formatting
- Easy entry creation
- Privacy focus
- Reflective tone

### Features
- Unlimited length
- Free-form writing
- Historical access
- No editing (appended only)

---

## 9. Progress Page (`/progress`)

**File**: `src/pages/ProgressPage.jsx`

### Features
- **Stats Overview**:
  - Current Streak (days)
  - Tasks Completed (all-time)
  - Last Active Date
  - Wellness Score (0-100)
- **Achievements Section**: Unlocked badges
- **Milestone Tracking**:
  - 7-day streak
  - 30-day mark
  - 100-day challenge
  - Full year achievement
- **Progress Bars**: Visual milestone completion
- **Motivational Quote**: Encouragement section

### Technical Details
- Uses `progressAPI.getProgress()`
- Calculates wellness score from stats
- Fetches achievements data
- Displays achievement timestamps
- Responsive grid layout

### Data Structure
```javascript
{
  stats: {
    userId: ...,
    streakDays: 5,
    totalTasksDone: 47,
    lastActiveDate: timestamp
  },
  achievements: [
    {
      id, userId, badge, milestone,
      description, unlockedAt
    },
    ...
  ]
}
```

### User Experience
- Gamified progress
- Achievement celebration
- Clear milestone goals
- Visual progress bars
- Motivational messaging
- Celebration animations

### Milestones
- 🔥 1-Week Streak
- 💪 One Month Strong
- ⭐ 100 Days Challenge
- 🌟 Full Year Journey

---

## 10. Settings Page (`/settings`)

**File**: `src/pages/SettingsPage.jsx`

### Features
- **Profile Section**: View email and account info
- **Notification Settings**:
  - Email notifications toggle
  - Push notifications toggle
- **Privacy & Data**:
  - Data retention option
  - Privacy mode toggle
- **Security**:
  - Change password button (placeholder)
- **Danger Zone**:
  - Logout button
  - Delete account (future)
- **Legal Links**: Privacy policy, ToS, support

### Technical Details
- Local state for settings
- Toggle switches for preferences
- Warning dialogs for destructive actions
- Logout clears localStorage
- Settings saved locally (backend integration pending)

### Data Structure
```javascript
settings: {
  emailNotifications: true,
  pushNotifications: false,
  dataRetention: true,
  privacyMode: false
}
```

### User Experience
- Clear section organization
- Toggle switches for easy control
- Confirmation dialogs
- Privacy explanation
- Legal transparency
- Profile information display

---

## Navigation Component

**File**: `src/components/Navigation.jsx`

### Features
- **Desktop Menu**: Full navigation links
- **Mobile Menu**: Hamburger menu
- **User Info**: Shows email
- **Logout Button**: Easy access
- **Settings Link**: Quick settings access
- **Logo**: Click to return to dashboard
- **Responsive Design**: Adapts to all sizes

### Navigation Items
1. Dashboard
2. Mood
3. Tasks
4. Chat
5. Journal
6. Progress
7. (Settings via icon)

---

## Protected Route Component

**File**: `src/components/ProtectedRoute.jsx`

### Features
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading spinner
- Prevents unauthorized access
- Manages loading state

---

## Authentication Context

**File**: `src/context/AuthContext.jsx`

### Provides
- `user`: Current user object
- `token`: JWT authentication token
- `isAuthenticated`: Boolean flag
- `login()`: Function to login user
- `logout()`: Function to logout user
- `loading`: Initial loading state

### Storage
- Token stored in localStorage
- User info stored in localStorage
- Persists across page refreshes

---

## API Integration

**File**: `src/services/api.js`

### Features
- Axios interceptors
- Automatic token injection
- Error handling
- CORS support
- Base URL configuration

### API Groups
- `authAPI` - Authentication
- `userAPI` - User profile
- `moodAPI` - Mood tracking
- `taskAPI` - Task management
- `assessmentAPI` - Assessments
- `journeyAPI` - Wellness journeys
- `insightAPI` - AI insights
- `chatAPI` - Chat interface
- `cbtAPI` - CBT sessions
- `journalAPI` - Journal entries
- `reflectionAPI` - Reflections
- `patternAPI` - Behavior patterns
- `progressAPI` - Progress data
- `dashboardAPI` - Dashboard data
- `recommendationAPI` - Recommendations

---

## Styling

All pages use **Tailwind CSS** with consistent design:

### Color Scheme
- **Primary**: Indigo (#6366f1)
- **Secondary**: Violet (#8b5cf6)
- **Success**: Emerald (#10b981)
- **Danger**: Red (#ef4444)
- **Warning**: Amber (#f59e0b)

### Components
- Cards with shadows
- Gradient buttons
- Responsive grids
- Smooth transitions
- Loading animations
- Empty states

---

## User Flow

```
Public Routes:
┌──────────────┐
│   /login     │
└──────┬───────┘
       │
       ├─ Wrong credentials → Stay on /login
       └─ Success → Redirect to /dashboard

┌──────────────┐
│  /register   │
└──────┬───────┘
       │
       ├─ Validation error → Stay on /register
       └─ Success → Redirect to /login

Protected Routes (require authentication):
┌──────────────────────────────────────┐
│  Dashboard, Mood, Tasks, Chat, etc.  │
└──────────────────────────────────────┘
       │
       ├─ Authenticated → Load page
       └─ Not authenticated → Redirect to /login
```

---

## Performance Optimizations

1. **Code Splitting**: React Router lazy loading
2. **Caching**: API response caching
3. **Lazy Components**: Load on demand
4. **Image Optimization**: SVG icons
5. **CSS**: Tailwind purges unused styles

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast compliance
- Focus management

---

## Mobile Responsive

All pages are fully responsive:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

---

## Future Enhancements

1. Dark mode toggle
2. Multi-language support
3. Data export functionality
4. Advanced analytics
5. Integration with wearables
6. Video guidance
7. Community features
8. Advanced reporting

---

This documentation covers all frontend pages and their integration with the backend API. For more details, see individual file comments and code.
