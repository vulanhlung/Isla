# Quick Start Guide - ISLA

Get your mental wellness application up and running in 5 minutes!

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Backend (2 minutes)

```bash
# Navigate to backend folder
cd d:\EXE\isla

# Install dependencies
npm install

# Create .env file with your settings
# (Copy DATABASE_URL and OPENAI_API_KEY)

# Run database migrations
npx prisma migrate deploy

# Start backend
npm run dev
```

**Expected Output:**
```
Server running on port 3000
```

### Step 2: Setup Frontend (2 minutes)

```bash
# In a new terminal, navigate to frontend
cd d:\EXE\isla\frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Expected Output:**
```
Local: http://localhost:5173/
```

### Step 3: Open Application (1 minute)

1. Open browser: `http://localhost:5173`
2. Click "Sign up"
3. Create account:
   - Email: `test@example.com`
   - Password: `password123`
   - Check consent box
4. Click "Create Account"
5. Login with credentials
6. 🎉 You're in! Explore the dashboard

## 📋 Key Features to Test

After login, try these features:

### 1. Dashboard
- View your wellness overview
- See latest mood
- Check today's progress

### 2. Mood Tracking
- Click "Mood" in navigation
- Select how you're feeling
- Set intensity level
- Add notes

### 3. Daily Tasks
- Click "Tasks" in navigation
- See breathing exercises, CBT practice, journaling
- Mark tasks as complete

### 4. Journal
- Click "Journal" in navigation
- Write an entry
- Save it

### 5. Chat
- Click "Chat" in navigation
- Type a message
- Get AI-powered response

### 6. CBT Session
- Click "Tasks" → "CBT"
- Work through 4 steps:
  1. Identify stressor
  2. Check evidence
  3. Alternative view
  4. Action plan

### 7. Progress
- Click "Progress" in navigation
- See achievements
- Track milestones

### 8. Settings
- Click settings icon
- View profile
- Configure notifications
- Adjust privacy settings

## 🔧 Prerequisites

Before starting, ensure you have:

- [ ] Node.js v16+ installed
- [ ] npm v8+ installed
- [ ] PostgreSQL running locally
- [ ] Database created: `isla_db`
- [ ] .env file with DATABASE_URL
- [ ] OpenAI API key (optional, for AI features)

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Make sure PostgreSQL is running
# Check DATABASE_URL in .env is correct
# Run migrations:
npx prisma migrate deploy
```

### Issue: "Port 3000 already in use"
```bash
# Windows - Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Port 5173 already in use"
```bash
npm run dev -- --port 3001
```

### Issue: "API connection failed"
- Check backend is running: `http://localhost:3000/api`
- Open browser DevTools (F12)
- Check Network tab for API errors
- Verify CORS is configured

## 📁 Project Structure

```
isla/
├── src/                          # Backend code
│   ├── controllers/              # Business logic
│   ├── routes/                   # API endpoints
│   └── server.js                 # Start here
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── pages/               # Pages
│   │   ├── components/          # Components
│   │   └── App.jsx              # Router
│   └── index.html               # Start here
├── prisma/
│   └── schema.prisma            # Database schema
└── SETUP_GUIDE.md               # Full setup guide
```

## 🌐 API Endpoints

Core API endpoints:

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login

Mood:
POST   /api/moods
GET    /api/moods

Tasks:
POST   /api/tasks/generate-daily
GET    /api/tasks/today
PATCH  /api/tasks/:id/status

Chat:
GET    /api/chat
POST   /api/chat

CBT:
POST   /api/cbt/start
POST   /api/cbt/continue

Journal:
POST   /api/journals
GET    /api/journals

And more... see SETUP_GUIDE.md for full list
```

## 💾 Database

Your data includes:

- Users (with privacy consent)
- Mood entries (with timestamp and intensity)
- Tasks (daily wellness exercises)
- Journal entries (private thoughts)
- Chat history (with AI responses)
- CBT sessions (therapy progress)
- Achievements (milestone badges)
- Progress stats (streaks, completion)

## 🔐 Security

- Passwords are hashed with bcrypt
- Authentication uses JWT tokens
- All data stored securely in PostgreSQL
- Privacy consent is tracked
- User data is anonymized when requested

## 📞 Common Commands

```bash
# Backend
npm run dev              # Start development server
npm run build            # Build for production
npx prisma studio       # Open database UI

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma migrate dev  # Create new migration
npx prisma db push      # Sync schema with DB
npx prisma db seed      # Seed database
```

## 🎓 Learning Paths

### Just Getting Started?
1. Create account
2. Go to Dashboard
3. Add a mood
4. Complete one task

### Want to Explore More?
1. Try the Chat feature
2. Write a journal entry
3. Start a CBT session
4. Check your Progress

### Want to Customize?
- See `SETUP_GUIDE.md` for configuration
- Edit Tailwind colors in `frontend/tailwind.config.js`
- Add new pages in `frontend/src/pages/`
- Add new API endpoints in `src/routes/`

## 🚀 Deployment

When ready to deploy:

### Backend
1. Update environment variables
2. Deploy to Heroku/Render/Railway
3. Update DATABASE_URL

### Frontend
1. Run: `npm run build`
2. Deploy `dist/` folder to Vercel/Netlify
3. Update API endpoint in environment

## 📚 Next Steps

1. **Read Full Guide**: Open `SETUP_GUIDE.md`
2. **Explore Code**: See `frontend/README.md`
3. **Test All Features**: Try each page
4. **Customize**: Add your branding
5. **Deploy**: Launch your app

## ✅ Checklist

- [ ] Backend running (port 3000)
- [ ] Frontend running (port 5173)
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Dashboard loads with data
- [ ] Mood entry created
- [ ] Task completed
- [ ] Chat message sent
- [ ] Journal entry written
- [ ] Progress page visible

## 💡 Tips

- Use browser DevTools (F12) to debug
- Check backend terminal for errors
- Clear browser cache if issues occur
- Use `npx prisma studio` to view database
- Keep OpenAI API key safe
- Use strong passwords in production

## 🎉 You're Ready!

Your ISLA mental wellness application is ready to use. Start tracking your wellness journey today!

For detailed information, see:
- Backend setup: See `src/` folder
- Frontend setup: See `frontend/README.md`
- Full guide: See `SETUP_GUIDE.md`

---

Happy wellness tracking! 🌟
