import express from 'express'
import { generateInsight } from '../controllers/insight.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/generate', authMiddleware, generateInsight)

export default router
