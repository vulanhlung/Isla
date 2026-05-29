import express from 'express'
import { createMood, getMoodHistory, getMoodAnalytics } from '../controllers/mood.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', authMiddleware, createMood)
router.get('/history', authMiddleware, getMoodHistory)
router.get('/analytics', authMiddleware, getMoodAnalytics)

export default router