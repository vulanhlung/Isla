import express from 'express'
import { createAssessment, getAssessmentHistory, getLatestAssessment } from '../controllers/assessment.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', authMiddleware, createAssessment)
router.get('/', authMiddleware, getAssessmentHistory)
router.get('/latest', authMiddleware, getLatestAssessment)

export default router
