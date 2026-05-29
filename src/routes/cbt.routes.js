import express from 'express'
import { startCBTSession, continueCBTSession, getCBTSessions, pauseCBTSession } from '../controllers/cbt.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Start new CBT session
router.post('/start', authMiddleware, startCBTSession)

// Continue existing CBT session
router.post('/continue', authMiddleware, continueCBTSession)

// Get CBT sessions history
router.get('/history', authMiddleware, getCBTSessions)

// Pause CBT session
router.post('/pause', authMiddleware, pauseCBTSession)

export default router