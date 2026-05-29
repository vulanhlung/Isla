# ISLA - Complete Setup & Integration Guide

## Project Overview

ISLA is a comprehensive mental health wellness application consisting of:
- **Backend**: Node.js/Express API with PostgreSQL database
- **Frontend**: React/Vite SPA with Tailwind CSS

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   React Frontend (Port 5173)                         │    │
│  │   - Authentication                                   │    │
│  │   - Dashboard, Mood, Tasks, Chat, CBT...            │    │
│  │   - State Management with Context API               │    │
│  │   - Tailwind CSS Styling                            │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │ HTTP/REST                                │
│                   ▼                                           │
└───────────────────────────────────────────────────────────────┘
                     │
                     │ API Calls (Axios)
                     │
┌───────────────────────────────────────────────────────────────┐
│                   Backend Server (Port 3000)                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Express.js API                                    │   │
│  │   - Authentication Routes (/auth)                   │   │
│  │   - Mood Tracking (/moods)                          │   │
│  │   - Task Management (/tasks)                        │   │
│  │   - Chat AI (/chat) - OpenAI Integration            │   │
│  │   - CBT Sessions (/cbt)                             │   │
│  │   - Journal (/journals)                             │   │
│  │   - Reflections (/reflections)                      │   │
│  │   - And more...                                     │   │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │ Prisma ORM                          │
│                        ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   PostgreSQL Database                               │   │
│  │   - Users, Moods, Tasks, Journals, Insights...      │   │
│  │   - Chat Messages, CBT Sessions, Reflections...     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   External Services                                 │   │
│  │   - OpenAI API (Chat & AI Features)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **PostgreSQL**: v12 or higher
- **Git**: For version control

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd d:\EXE\isla
npm install
```

This installs:
- Express.js - Web framework
- Prisma - ORM for database
- PostgreSQL client
- JWT - Authentication
- Bcrypt - Password hashing
- OpenAI - AI features
- Nodemon - Development tool

### 1.2 Database Setup

1. Create a PostgreSQL database:
```bash
createdb isla_db
```

2. Create `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/isla_db"
OPENAI_API_KEY="your-openai-api-key"
JWT_SECRET="your-secret-key"
```

3. Run Prisma migrations:
```bash
npx prisma migrate deploy
```

4. (Optional) Seed database:
```bash
npx prisma db seed
```

### 1.3 Start Backend Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

You should see:
```
Server running on port 3000
```

## Step 2: Frontend Setup

### 2.1 Install Frontend Dependencies

```bash
cd d:\EXE\isla\frontend
npm install
```

This installs:
- React 18
- Vite - Build tool
- React Router - Navigation
- Axios - HTTP client
- Tailwind CSS - Styling
- Lucide React - Icons
- date-fns - Date utilities

### 2.2 Start Frontend Development Server

```bash
npm run dev
```

Frontend will start at `http://localhost:5173`

You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Step 3: Verify Integration

### 3.1 Test Authentication Flow

1. Open `http://localhost:5173` in your browser
2. Click "Sign up" and create a new account
3. Fill in the form and check "Consent" checkbox
4. Click "Create Account"
5. You should be redirected to login page
6. Login with the credentials you just created
7. You should be redirected to the dashboard

### 3.2 Test Main Features

1. **Dashboard**: See overview of your wellness
2. **Mood**: Track your mood entry
3. **Tasks**: View and complete daily tasks
4. **Chat**: Send a message to the AI
5. **CBT**: Start a cognitive behavioral therapy session
6. **Journal**: Write a journal entry
7. **Progress**: View your achievements and milestones

### 3.3 Check Backend Logs

In the backend terminal, you should see requests like:
```
POST /api/auth/register - 201
POST /api/auth/login - 200
GET /api/dashboard - 200
POST /api/moods - 201
...
```

## Features Implementation Details

### Authentication
- Email/password registration with consent
- JWT token-based authentication
- Automatic token refresh
- Auto-logout on token expiration

### Mood Tracking
- Four mood types: Happy, Neutral, Sad, Overwhelmed
- Intensity scale (1-5)
- Optional notes
- Historical data visualization

### Task Management
- Breathing exercises (5 min)
- CBT practice (10 min)
- Gratitude journal (5 min)
- Daily task generation
- Completion tracking

### AI Chat
- OpenAI integration
- Chat history
- Context-aware responses
- Message validation

### CBT Sessions
- 4-step guided process
- Session status tracking
- Evidence evaluation
- Alternative perspectives
- Action planning

### Journal Entries
- Free-form writing
- Timestamp tracking
- Historical entries
- Daily journaling

### Progress Tracking
- Streak counting
- Achievement system
- Milestone tracking
- Completion statistics

## File Structure Reference

### Backend
```
isla/
├── src/
│   ├── controllers/      # Business logic
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth, logging
│   ├── prisma/           # Database client
│   ├── utils/            # JWT, OpenAI
│   └── server.js         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── package.json
```

### Frontend
```
isla/frontend/
├── src/
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── context/          # Auth context
│   ├── services/         # API calls
│   ├── styles/           # CSS files
│   ├── App.jsx           # Main component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite config
├── tailwind.config.js    # Tailwind config
└── package.json
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Mood
- `POST /api/moods` - Create mood entry
- `GET /api/moods` - Get mood history

### Tasks
- `POST /api/tasks/generate-daily` - Generate daily tasks
- `GET /api/tasks/today` - Get today's tasks
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/history` - Get task history

### Assessment
- `POST /api/assessments` - Create assessment
- `GET /api/assessments` - Get assessments

### Chat
- `GET /api/chat` - Get chat history
- `POST /api/chat` - Send message

### CBT
- `POST /api/cbt/start` - Start session
- `POST /api/cbt/continue` - Continue session
- `GET /api/cbt/:id` - Get session

### Journal
- `POST /api/journals` - Create entry
- `GET /api/journals` - Get entries
- `GET /api/journals/:id` - Get specific entry

### Other Features
- `/api/insights` - Wellness insights
- `/api/patterns` - Behavior patterns
- `/api/reflections` - Reflections
- `/api/progress` - Progress data
- `/api/dashboard` - Dashboard data
- `/api/recommendations` - Recommendations
- `/api/journeys` - Wellness journeys

## Configuration

### Backend Configuration

**Environment Variables** (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/isla_db
OPENAI_API_KEY=sk-xxx...
JWT_SECRET=your-secret-key-here
PORT=3000
```

### Frontend Configuration

**API Base URL** (`src/services/api.js`):
```javascript
const API_BASE_URL = 'http://localhost:3000/api'
```

For production, update to your backend URL.

## Development Workflow

### Daily Development

1. Start backend:
```bash
cd d:\EXE\isla
npm run dev
```

2. In another terminal, start frontend:
```bash
cd d:\EXE\isla\frontend
npm run dev
```

3. Open `http://localhost:5173` in browser

4. Make code changes - they auto-reload in development

### Creating New Features

1. **Backend**: 
   - Create route in `src/routes/`
   - Create controller in `src/controllers/`
   - Update Prisma schema if needed

2. **Frontend**:
   - Create page in `src/pages/`
   - Add API call in `src/services/api.js`
   - Add route in `App.jsx`
   - Add navigation link in `Navigation.jsx`

## Deployment

### Backend Deployment

1. Build for production:
```bash
npm run build
```

2. Deploy to hosting (Heroku, Render, Railway, etc.):
```bash
# Example with Heroku
heroku create isla-backend
git push heroku main
```

### Frontend Deployment

1. Build for production:
```bash
cd frontend
npm run build
```

2. Deploy `dist/` folder to static hosting:
   - Vercel: `vercel deploy`
   - Netlify: Drag & drop `dist/` folder
   - GitHub Pages, AWS S3, etc.

3. Update API endpoint to production backend URL

## Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**API not responding:**
- Check backend logs for errors
- Verify JWT_SECRET is set
- Check OpenAI API key is valid

### Frontend Issues

**Port 5173 already in use:**
```bash
npm run dev -- --port 3001
```

**API connection error:**
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify API_BASE_URL in api.js

**Blank page or routing issues:**
- Clear browser cache
- Check React Router configuration
- Verify all pages are imported in App.jsx

### Common Errors

**"Cannot find module":**
- Run `npm install` again
- Delete `node_modules` and reinstall

**"CORS error":**
- Backend needs CORS enabled (usually default in Express)
- Check proxy config in vite.config.js

**"Token expired":**
- Clear localStorage
- Login again
- Check JWT_SECRET matches between sessions

## Performance Tips

### Backend
- Use database indexing
- Implement caching for frequently accessed data
- Optimize API responses
- Use pagination for large datasets

### Frontend
- Enable code splitting
- Lazy load routes
- Optimize images
- Minimize CSS/JS bundles

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set secure OPENAI_API_KEY
- [ ] Use HTTPS in production
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Hash passwords with bcrypt
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Monitoring & Logging

### Backend Logs
Check terminal output for API requests and errors.

### Frontend Console
Open browser developer tools (F12) to see:
- Network requests
- JavaScript errors
- Component warnings
- Performance metrics

## Support & Documentation

- Backend: See `src/` files for detailed code
- Frontend: See `frontend/README.md`
- Database: See `prisma/schema.prisma`

## Next Steps

1. Test all features thoroughly
2. Set up error monitoring
3. Implement analytics
4. Add email notifications
5. Integrate payment system (if needed)
6. Add mobile app
7. Implement push notifications
8. Add data export functionality

## License

ISC

---

**Happy building! Your mental wellness application is ready to help users on their wellness journey.** 🚀
