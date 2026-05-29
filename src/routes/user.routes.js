import express from 'express'
import { createUser, getProfile, deleteUserData } from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', createUser)
router.get('/profile', authMiddleware, getProfile)
router.delete('/data', authMiddleware, deleteUserData)

export default router