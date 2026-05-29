import express from 'express'
import { detectPatterns } from '../controllers/pattern.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/detect', authMiddleware, detectPatterns)

export default router
