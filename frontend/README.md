# ISLA Frontend

Mental health wellness application frontend built with React, Vite, and Tailwind CSS.

## Features

- 🔐 User Authentication (Login/Register)
- 📊 Dashboard with wellness overview
- 💭 Mood Tracking
- ✅ Daily Tasks Management
- 🤖 AI-Powered Chat
- 🧠 CBT (Cognitive Behavioral Therapy) Sessions
- 📝 Digital Journal
- 📈 Progress Tracking & Achievements
- ⚙️ Settings & Privacy Controls

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **date-fns** - Date utilities

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

3. **Build for production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

## Configuration

The API is configured to connect to `http://localhost:3000/api` by default. This is set in the Vite config with a proxy during development.

To change the API endpoint, modify the `API_BASE_URL` in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-api-url/api'
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navigation.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/            # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── MoodPage.jsx
│   │   ├── TasksPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── CBTPage.jsx
│   │   ├── JournalPage.jsx
│   │   ├── ProgressPage.jsx
│   │   └── SettingsPage.jsx
│   ├── context/          # React Context (Auth)
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies

```

## Pages Overview

### Authentication
- **Login** - User login page
- **Register** - New user registration with consent

### Main Features
- **Dashboard** - Overview of mood, tasks, progress, and insights
- **Mood Tracking** - Log daily moods with intensity and notes
- **Tasks** - Daily wellness tasks (breathing, CBT, journaling)
- **Chat** - AI-powered wellness conversations
- **CBT** - Guided cognitive behavioral therapy sessions
- **Journal** - Digital journaling for emotional tracking
- **Progress** - View achievements, streaks, and milestones
- **Settings** - User profile, notifications, and privacy settings

## API Endpoints Used

The frontend connects to these backend API endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /dashboard` - Dashboard data
- `POST /moods` - Create mood entry
- `GET /moods` - Get mood history
- `POST /tasks/generate-daily` - Generate daily tasks
- `GET /tasks/today` - Get today's tasks
- `PATCH /tasks/:id/status` - Update task status
- `GET /chat` - Get chat history
- `POST /chat` - Send chat message
- `POST /cbt/start` - Start CBT session
- `POST /cbt/continue` - Continue CBT session
- `POST /journals` - Create journal entry
- `GET /journals` - Get journal entries
- `GET /progress` - Get progress data

## Authentication

Authentication uses JWT tokens stored in localStorage. The token is automatically included in all API requests via the axios interceptor.

When the token expires or becomes invalid, users are redirected to the login page automatically.

## Styling

The application uses Tailwind CSS for all styling. Key color scheme:

- **Primary**: Indigo (#6366f1)
- **Secondary**: Violet (#8b5cf6)
- **Success**: Emerald (#10b981)
- **Danger**: Red (#ef4444)
- **Warning**: Amber (#f59e0b)

## Development Tips

### Adding a New Page

1. Create a new file in `src/pages/`
2. Create the page component
3. Import it in `App.jsx`
4. Add a route in the Routes component
5. Add navigation link in `Navigation.jsx` if needed

### Adding API Calls

1. Add the API call to `src/services/api.js`
2. Use it in your page/component with try-catch
3. Handle loading and error states

### Form Handling

Use React hooks (`useState`) for form state management. Refer to existing pages for patterns.

## Deployment

To deploy the frontend:

1. Build the project:
```bash
npm run build
```

2. The `dist/` folder contains the production build
3. Deploy to a static hosting service (Vercel, Netlify, GitHub Pages, etc.)

4. Update the API endpoint in the deployed version to point to your production backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React Router
- Lazy loading of images
- Optimized CSS with Tailwind
- Responsive design for all screen sizes

## Troubleshooting

### API Connection Issues
- Ensure the backend is running on `http://localhost:3000`
- Check that the API_BASE_URL is correct in `src/services/api.js`

### Port Already in Use
- The dev server runs on port 5173 by default
- To use a different port: `npm run dev -- --port 3000`

### CORS Issues
- Make sure the backend is configured to accept requests from `http://localhost:5173`

## License

ISC

## Support

For issues and feature requests, please contact the development team.
