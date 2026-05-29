import express from 'express'
import { generateRecommendation } from '../controllers/recommendation.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/generate', authMiddleware, generateRecommendation)

export default router
