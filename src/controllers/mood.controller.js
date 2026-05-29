import prisma from '../prisma/client.js'

export const createMood = async (req, res) => {
  try {
    const userId = req.user.userId
    const { mood, intensity, note } = req.body

    // Validate mood
    const validMoods = ['HAPPY', 'NEUTRAL', 'SAD', 'OVERWHELMED']
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood. Must be HAPPY, NEUTRAL, SAD, or OVERWHELMED' })
    }

    // Validate intensity
    if (typeof intensity !== 'number' || intensity < 1 || intensity > 5) {
      return res.status(400).json({ error: 'Intensity must be a number between 1 and 5' })
    }

    const newMood = await prisma.mood.create({
      data: {
        userId,
        mood,
        intensity,
        note
      }
    })

    res.json(newMood)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMoodHistory = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit, offset, from, to } = req.query

    const where = { userId }

    // Add date filters if provided
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const moods = await prisma.mood.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    })

    res.json(moods)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMoodAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId
    const { period = 30 } = req.query // default 30 days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const moods = await prisma.mood.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    if (moods.length === 0) {
      return res.json({
        period: `${period} days`,
        totalEntries: 0,
        averageIntensity: null,
        averageMoodScore: null,
        trend: 'no_data',
        recentMoods: []
      })
    }

    // Map mood types to scores
    const moodScores = {
      HAPPY: 4,
      NEUTRAL: 3,
      SAD: 2,
      OVERWHELMED: 1
    }

    const intensities = moods.map(m => m.intensity)
    const moodValues = moods.map(m => moodScores[m.mood])

    const averageIntensity = intensities.reduce((sum, val) => sum + val, 0) / intensities.length
    const averageMoodScore = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length

    // Calculate trend (simple: compare first half vs second half)
    const midPoint = Math.floor(moods.length / 2)
    const firstHalf = moods.slice(0, midPoint)
    const secondHalf = moods.slice(midPoint)

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, m) => sum + moodScores[m.mood] + m.intensity, 0) / (firstHalf.length * 2)
      : 0

    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, m) => sum + moodScores[m.mood] + m.intensity, 0) / (secondHalf.length * 2)
      : 0

    let trend = 'stable'
    const diff = secondHalfAvg - firstHalfAvg
    if (diff > 0.5) trend = 'improving'
    else if (diff < -0.5) trend = 'declining'

    // Recent moods (last 10)
    const recentMoods = moods.slice(-10).map(m => ({
      date: m.createdAt.toISOString().split('T')[0],
      mood: m.mood,
      intensity: m.intensity,
      note: m.note
    }))

    res.json({
      period: `${period} days`,
      totalEntries: moods.length,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      averageMoodScore: Math.round(averageMoodScore * 10) / 10,
      trend,
      recentMoods
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}