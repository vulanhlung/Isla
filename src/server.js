import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.routes.js'
import moodRoutes from './routes/mood.routes.js'
import authRoutes from './routes/auth.routes.js'
import assessmentRoutes from './routes/assessment.routes.js'
import journeyRoutes from './routes/journey.routes.js'
import insightRoutes from './routes/insight.routes.js'
import recommendationRoutes from './routes/recommendation.routes.js'
import patternRoutes from './routes/pattern.routes.js'
import taskRoutes from './routes/task.routes.js'
import progressRoutes from './routes/progress.routes.js'
import chatRoutes from './routes/chat.routes.js'
import cbtRoutes from './routes/cbt.routes.js'
import reflectionRoutes from './routes/reflection.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import journalRoutes from './routes/journal.routes.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { privacyLogger } from './middlewares/privacy.middleware.js'

const app = express()

app.use(cors())
app.use(express.json())

// Public routes (no auth, no privacy log needed)
app.use('/api/auth', authRoutes)

// Authenticated routes — privacyLogger runs after authMiddleware so req.user is populated
const loggedAuth = [authMiddleware, privacyLogger]

app.use('/api/users', loggedAuth, userRoutes)
app.use('/api/moods', loggedAuth, moodRoutes)
app.use('/api/assessments', loggedAuth, assessmentRoutes)
app.use('/api/journeys', loggedAuth, journeyRoutes)
app.use('/api/insights', loggedAuth, insightRoutes)
app.use('/api/recommendations', loggedAuth, recommendationRoutes)
app.use('/api/patterns', loggedAuth, patternRoutes)
app.use('/api/tasks', loggedAuth, taskRoutes)
app.use('/api/progress', loggedAuth, progressRoutes)
app.use('/api/chat', loggedAuth, chatRoutes)
app.use('/api/cbt', loggedAuth, cbtRoutes)
app.use('/api/reflections', loggedAuth, reflectionRoutes)
app.use('/api/dashboard', loggedAuth, dashboardRoutes)
app.use('/api/journals', loggedAuth, journalRoutes)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})