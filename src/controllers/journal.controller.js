import prisma from '../prisma/client.js'

export const createJournal = async (req, res) => {
  try {
    const userId = req.user.userId
    const { content } = req.body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Content too long (max 5000 characters)' })
    }

    const journal = await prisma.journal.create({
      data: {
        userId,
        content: content.trim()
      }
    })

    res.json(journal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getJournals = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit, offset } = req.query

    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    })

    res.json(journals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getJournalById = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const journal = await prisma.journal.findUnique({
      where: { id }
    })

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    if (journal.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    res.json(journal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteJournal = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const journal = await prisma.journal.findUnique({ where: { id } })

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    if (journal.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await prisma.journal.delete({ where: { id } })

    res.json({ message: 'Journal entry deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
