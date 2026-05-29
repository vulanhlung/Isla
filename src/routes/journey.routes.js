import express from 'express'
import { generateJourney } from '../controllers/journey.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/generate', authMiddleware, generateJourney)

export default router
