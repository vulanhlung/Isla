import express from 'express'
import { createReflection, getReflections } from '../controllers/reflection.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Create new reflection
router.post('/', authMiddleware, createReflection)

// Get reflections history
router.get('/', authMiddleware, getReflections)

export default router