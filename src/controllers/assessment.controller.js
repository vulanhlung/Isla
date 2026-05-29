import prisma from '../prisma/client.js'

export const createAssessment = async (req, res) => {
  try {
    const userId = req.user.userId
    const { answers } = req.body // answers là array [score1, score2, ..., score9]

    if (!answers || !Array.isArray(answers) || answers.length !== 9) {
      return res.status(400).json({ error: 'Answers must be an array of 9 scores' })
    }

    for (let score of answers) {
      if (typeof score !== 'number' || score < 0 || score > 3) {
        return res.status(400).json({ error: 'Each score must be a number between 0 and 3' })
      }
    }

    const totalScore = answers.reduce((sum, score) => sum + score, 0)

    let level
    if (totalScore <= 4) {
      level = 'Normal'
    } else if (totalScore <= 9) {
      level = 'Mild'
    } else if (totalScore <= 14) {
      level = 'Moderate'
    } else {
      level = 'Severe'
    }

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        score: totalScore,
        level,
        answers: JSON.stringify(answers)
      }
    })

    res.json({
      id: assessment.id,
      totalScore,
      level,
      createdAt: assessment.createdAt
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit, offset } = req.query

    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
      select: { id: true, score: true, level: true, createdAt: true }
    })

    res.json(assessments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getLatestAssessment = async (req, res) => {
  try {
    const userId = req.user.userId

    const assessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, score: true, level: true, createdAt: true }
    })

    if (!assessment) {
      return res.status(404).json({ error: 'No assessment found' })
    }

    res.json(assessment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}