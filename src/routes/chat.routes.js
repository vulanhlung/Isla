import express from 'express'
import { getChatHistory, sendMessage } from '../controllers/chat.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Simple in-memory rate limiter: max 20 messages per user per minute
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 20

const chatRateLimit = (req, res, next) => {
  const userId = req.user?.userId || req.ip
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { windowStart: now, count: 1 })
    return next()
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: `Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ một chút rồi thử lại.`
    })
  }

  entry.count++
  next()
}

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key)
  }
}, 5 * 60 * 1000)

// Get chat history
router.get('/history', authMiddleware, getChatHistory)

// Send message and get AI response (rate limited)
router.post('/message', authMiddleware, chatRateLimit, sendMessage)

export default router