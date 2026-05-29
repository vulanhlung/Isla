import express from 'express'
import { getProgressDashboard, getStreakInfo, getAchievements } from '../controllers/progress.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// UC-15: View Progress Dashboard
router.get('/dashboard', authMiddleware, getProgressDashboard)

// UC-16: Get Streak Info
router.get('/streak', authMiddleware, getStreakInfo)

// UC-17: Get Achievements
router.get('/achievements', authMiddleware, getAchievements)

export default router
