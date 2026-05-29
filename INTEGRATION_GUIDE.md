# ISLA - System Integration & API Connection Guide

## Overview

This document explains how the React Frontend connects to the Express Backend through RESTful APIs, with complete data flow examples for each feature.

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 5173)                 │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │  Pages & Components                             │   │  │
│  │  │  - LoginPage, DashboardPage, MoodPage, etc.    │   │  │
│  │  └──────────────────┬──────────────────────────────┘   │  │
│  │                     │                                   │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Services (API Calls)                           │  │  │
│  │  │  - authAPI, moodAPI, taskAPI, chatAPI, etc.    │  │  │
│  │  └──────────────────┬───────────────────────────────┘  │  │
│  │                     │                                   │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Context (State Management)                     │  │  │
│  │  │  - AuthContext (user, token)                   │  │  │
│  │  │  - Stores in localStorage                      │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          │ HTTP Requests (Axios)             │
│                          │ - Authorization Header            │
│                          │ - JSON data                       │
│                          │ - Error handling                  │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend Server (Port 3000)                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Express.js Server & Routing                          │  │
│  │  - Express middleware                                 │  │
│  │  - Auth middleware (JWT verification)                 │  │
│  │  - Privacy middleware (logging)                       │  │
│  │  - Route handlers                                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Controllers (Business Logic)                          │  │
│  │  - authController, moodController, taskController     │  │
│  │  - Process requests                                   │  │
│  │  - Validate data                                      │  │
│  │  - Return responses                                   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database Layer (Prisma ORM)                          │  │
│  │  - Models: User, Mood, Task, Journal, etc.           │  │
│  │  - Queries and mutations                             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  External Services                                     │  │
│  │  - OpenAI API (for Chat & AI responses)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  PostgreSQL Database (isla_db)  │
        │  - Tables for all models     │
        │  - User data                 │
        │  - Mood history              │
        │  - Tasks & completions       │
        │  - Journals & Reflections    │
        │  - Chat messages             │
        │  - And more...               │
        └──────────────────────────────┘
```

---

## Data Flow Examples

### 1. Authentication Flow

#### Register New User

**Frontend Flow:**
```
RegisterPage Component
    ↓
User fills form (email, password, consent)
    ↓
handleSubmit() called
    ↓
authAPI.register({ email, password, consent })
    ↓
axios.post('/auth/register', data)
    ↓
HTTP POST to backend
```

**Backend Flow:**
```
POST /api/auth/register
    ↓
authMiddleware (skipped for register)
    ↓
register controller
    ↓
Validate input
    ↓
Check email exists
    ↓
Hash password with bcrypt
    ↓
Generate anonymized ID
    ↓
prisma.user.create()
    ↓
Database INSERT
    ↓
Return { message, userId }
    ↓
HTTP 201 Response
```

**Frontend Response Handling:**
```
API response received
    ↓
Success message displayed
    ↓
Auto-redirect to /login
    ↓
User can now login
```

---

#### Login User

**Frontend Flow:**
```
LoginPage Component
    ↓
User enters email & password
    ↓
handleSubmit()
    ↓
authAPI.login({ email, password })
    ↓
axios.post('/auth/login', data)
```

**Backend Flow:**
```
POST /api/auth/login
    ↓
Validate email format
    ↓
prisma.user.findUnique({ email })
    ↓
Check password with bcrypt
    ↓
Generate JWT token
    ↓
Return { token, userId }
```

**Frontend Response Handling:**
```
Receive token and userId
    ↓
Store token in localStorage
    ↓
Store user in localStorage
    ↓
Set auth context
    ↓
Redirect to /dashboard
    ↓
Navigation now shows authenticated UI
```

---

### 2. Mood Tracking Flow

#### Create Mood Entry

**Frontend:**
```
MoodPage Component loads
    ↓
User selects mood (e.g., HAPPY)
    ↓
Adjusts intensity slider (3/5)
    ↓
Optionally adds note
    ↓
Clicks "Save Mood"
    ↓
handleSubmit()
    ↓
moodAPI.createMood({
      mood: "HAPPY",
      intensity: 3,
      note: "Had a great day!"
    })
    ↓
axios.post('/moods', data, {
      headers: { Authorization: `Bearer ${token}` }
    })
```

**Backend:**
```
POST /api/moods
    ↓
authMiddleware
    ↓
Verify JWT token
    ↓
Extract userId from token
    ↓
moodController.createMood()
    ↓
Validate mood value (HAPPY, NEUTRAL, SAD, OVERWHELMED)
    ↓
Validate intensity (1-5 number)
    ↓
prisma.mood.create({
      userId,
      mood,
      intensity,
      note
    })
    ↓
Database INSERT
    ↓
Return mood object
```

**Frontend Response:**
```
Add new mood to UI list
    ↓
Update dashboard summary
    ↓
Show success
    ↓
Clear form
```

---

#### Fetch Mood History

**Frontend:**
```
useEffect(() => {
  moodAPI.getMoodHistory({ limit: 20 })
    ↓
    axios.get('/moods?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    })
})
```

**Backend:**
```
GET /api/moods?limit=20
    ↓
authMiddleware → Extract userId
    ↓
moodController.getMoodHistory()
    ↓
Parse query params (limit, offset)
    ↓
prisma.mood.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    ↓
Return array of moods
```

**Frontend Response:**
```
setMoods(response.data)
    ↓
Render mood list
    ↓
Format dates with date-fns
```

---

### 3. Task Management Flow

#### Generate Daily Tasks

**Frontend:**
```
TasksPage mounts
    ↓
useEffect()
    ↓
taskAPI.generateDailyTasks()
    ↓
axios.post('/tasks/generate-daily', {})
```

**Backend:**
```
POST /api/tasks/generate-daily
    ↓
authMiddleware → userId
    ↓
Check if tasks already generated for today
    ↓
If yes, return existing tasks
    ↓
If no:
  - Create 3 tasks (BREATHING, CBT, JOURNAL)
  - For each, find or create Task record
  - Create UserTask records with PENDING status
    ↓
Return { tasks, alreadyExists }
```

**Frontend Response:**
```
if (alreadyExists) {
  "Daily tasks already generated"
}
setTasks(tasks)
```

---

#### Update Task Status

**Frontend:**
```
User clicks circle icon on task
    ↓
handleTaskStatusChange(taskId, "DONE")
    ↓
taskAPI.updateTaskStatus(taskId, "DONE")
    ↓
axios.patch(`/tasks/${taskId}/status`, { status: "DONE" })
```

**Backend:**
```
PATCH /api/tasks/{taskId}/status
    ↓
authMiddleware → userId
    ↓
taskController.updateTaskStatus()
    ↓
prisma.userTask.update({
      where: { id: taskId },
      data: { status: "DONE" }
    })
    ↓
Check achievements
    ↓
Return updated task
```

**Frontend Response:**
```
Update task in local state
    ↓
Recalculate progress bar
    ↓
Update stats
```

---

### 4. Chat Flow

#### Send Message

**Frontend:**
```
ChatPage Component
    ↓
User types message
    ↓
Presses Send button
    ↓
handleSubmit()
    ↓
Add user message to UI immediately
    ↓
chatAPI.sendMessage({ message: "How are you?" })
    ↓
axios.post('/chat', { message: "How are you?" })
    ↓
Set loading = true
    ↓
Show typing indicator
```

**Backend:**
```
POST /api/chat
    ↓
authMiddleware → userId
    ↓
Validate message (max 1000 chars)
    ↓
chatController.sendMessage()
    ↓
Save user message to DB:
  prisma.chatMessage.create({
    userId, message, role: "user"
  })
    ↓
Get recent chat history (last 10 messages)
    ↓
Call OpenAI API:
  - Pass conversation history
  - Get AI response
    ↓
Save AI response to DB:
  prisma.chatMessage.create({
    userId, message: aiResponse, role: "assistant"
  })
    ↓
Return { userMessage, assistantMessage }
```

**Frontend Response:**
```
Receive response with both messages
    ↓
Add assistant message to UI
    ↓
Auto-scroll to bottom
    ↓
Set loading = false
    ↓
Clear input field
```

---

### 5. Dashboard Flow

#### Load Dashboard

**Frontend:**
```
DashboardPage mounts
    ↓
useEffect()
    ↓
dashboardAPI.getDashboard()
    ↓
axios.get('/dashboard')
    ↓
Set loading = true
```

**Backend:**
```
GET /api/dashboard
    ↓
authMiddleware → userId
    ↓
dashboardController.getDashboard()
    ↓
Fetch:
  - Latest mood
  - Last 7 mood entries
  - Daily insight
  - Today's tasks
  - User stats (streak, totalTasksDone)
    ↓
Calculate progress metrics
    ↓
Return comprehensive object
```

**Frontend Response:**
```
Set loading = false
    ↓
setDashboardData(response.data)
    ↓
Render all sections:
  - Latest mood card
  - Stats grid
  - Mood history
  - Insight section
```

---

## API Request Structure

### Standard Request Format

```javascript
// With token (protected routes)
axios.post('/api/moods', 
  { mood: "HAPPY", intensity: 3 },
  { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)

// Query parameters
axios.get('/api/moods', {
  params: { limit: 20, offset: 0 },
  headers: { Authorization: `Bearer ${token}` }
})
```

### Response Format

**Success Response:**
```javascript
{
  status: 200-201,
  data: {
    // Returned data
  }
}
```

**Error Response:**
```javascript
{
  status: 400-500,
  data: {
    error: "Error message"
  }
}
```

---

## Authentication & Token Flow

### Token Lifecycle

```
1. User Login
   ↓
2. Backend generates JWT
   ↓
3. Frontend stores in localStorage
   ↓
4. Each request includes: Authorization: Bearer <token>
   ↓
5. Backend verifies token
   ↓
6. Token expires (typically 7-30 days)
   ↓
7. User redirected to login
```

### Token in localStorage

```javascript
// After successful login
localStorage.setItem('token', 'eyJhbGciOi...')
localStorage.setItem('user', '{"userId":"...", "email":"..."}'')

// Persists across page refreshes
// Automatically cleared on logout
```

### Axios Interceptor

```javascript
// Every request automatically adds token:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 response, redirect to login:
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await moodAPI.createMood(data)
  // Handle success
} catch (err) {
  // Handle error
  const errorMessage = err.response?.data?.error || 'Failed to save'
  setError(errorMessage)
}
```

### Backend Error Handling

```javascript
try {
  // Business logic
} catch (err) {
  res.status(500).json({ 
    error: err.message 
  })
}
```

### Common Error Responses

```javascript
// 400 - Bad Request
{ error: "Invalid mood. Must be HAPPY, NEUTRAL, SAD, or OVERWHELMED" }

// 401 - Unauthorized
{ error: "Unauthorized" } // Missing/invalid token

// 404 - Not Found
{ error: "Resource not found" }

// 500 - Server Error
{ error: "Database connection failed" }
```

---

## Data Validation

### Frontend Validation

```javascript
// Mood intensity
if (intensity < 1 || intensity > 5) {
  error = "Intensity must be 1-5"
}

// Message length
if (message.length > 1000) {
  error = "Message too long"
}

// Password strength
if (password.length < 6) {
  error = "Password too short"
}
```

### Backend Validation

```javascript
// Always validate on backend
if (!validMoods.includes(mood)) {
  return res.status(400).json({ 
    error: "Invalid mood" 
  })
}
```

---

## CORS Configuration

**Backend CORS Setup:**
```javascript
// Express automatically handles CORS for requests from:
// - http://localhost:5173 (development)
// - Your production frontend URL (production)

// Vite proxy during development:
// Requests to /api are proxied to http://localhost:3000
```

---

## Performance Considerations

### 1. Caching
```javascript
// Moods fetched once, then managed in state
// Use refetch button for manual refresh
// Cache invalidation on mutations
```

### 2. Pagination
```javascript
// Tasks: Limit to today's tasks
// Moods: Limit to recent entries (20)
// Messages: Limit to recent (50)
```

### 3. Lazy Loading
```javascript
// Pages loaded only when accessed
// Components rendered on demand
// API calls on navigation
```

---

## Monitoring & Logging

### Backend Logging
```
POST /api/auth/login - 200
GET /api/dashboard - 200
POST /api/moods - 201
PATCH /api/tasks/1 - 200
...
```

### Frontend Console
```javascript
// Check Network tab in DevTools
// See all API calls
// Monitor response times
// Debug errors
```

---

## Security Measures

1. **Password Hashing**: bcrypt (10 rounds)
2. **JWT Tokens**: Secure, expiring tokens
3. **Input Validation**: Both frontend and backend
4. **SQL Injection Prevention**: Prisma ORM
5. **CORS**: Restricted origins
6. **Data Privacy**: Anonymized IDs for research
7. **Consent**: Data processing consent required

---

## Testing the Integration

### Manual Testing Checklist

1. **Authentication**
   - [ ] Register new user
   - [ ] Login with credentials
   - [ ] Logout
   - [ ] Token persists on refresh

2. **Mood Tracking**
   - [ ] Create mood entry
   - [ ] View mood history
   - [ ] Update mood status

3. **Tasks**
   - [ ] Generate daily tasks
   - [ ] Mark task complete
   - [ ] View progress

4. **Chat**
   - [ ] Send message
   - [ ] Receive response
   - [ ] See chat history

5. **Data Persistence**
   - [ ] Data saved in database
   - [ ] Data retrieves correctly
   - [ ] Historical data maintains

---

## Troubleshooting Integration Issues

### API Not Found (404)
- Check route exists in `src/routes/`
- Verify controller function exists
- Check URL spelling

### Token Invalid (401)
- Re-login user
- Clear localStorage
- Check JWT_SECRET matches

### CORS Error
- Verify backend is running
- Check Vite proxy config
- Ensure correct port

### Data Doesn't Save
- Check database connection
- Verify Prisma schema
- Check middleware order
- Look at backend logs

---

## Deployment Checklist

- [ ] Update API_BASE_URL for production
- [ ] Set environment variables
- [ ] Test all API endpoints
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Test authentication flow
- [ ] Verify data persistence
- [ ] Load test the system

---

This document provides comprehensive understanding of how the frontend and backend integrate to create the complete ISLA mental wellness application.
