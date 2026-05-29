import express from 'express'
import { createJournal, getJournals, getJournalById, deleteJournal } from '../controllers/journal.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Get all journal entries
router.get('/', authMiddleware, getJournals)

// Create a new journal entry
router.post('/', authMiddleware, createJournal)

// Get a specific journal entry
router.get('/:id', authMiddleware, getJournalById)

// Delete a journal entry
router.delete('/:id', authMiddleware, deleteJournal)

export default router
