import express from 'express'
import { generateDailyTasks, completeTask, getTaskProgress, getTodayTasks, updateTaskStatus } from '../controllers/task.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// UC-12: Generate daily tasks for today
router.post('/generate-daily', authMiddleware, generateDailyTasks)

// UC-13: Complete a task
router.post('/complete', authMiddleware, completeTask)

// UC-14: Get task progress and streak
router.get('/progress', authMiddleware, getTaskProgress)

// Get today's tasks
router.get('/today', authMiddleware, getTodayTasks)

// Update task status (PENDING / DONE)
router.patch('/:id/status', authMiddleware, updateTaskStatus)

export default router
