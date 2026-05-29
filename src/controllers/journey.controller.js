import prisma from '../prisma/client.js'

const generateRecommendedTasks = (level) => {
  const taskMap = {
    Normal: [
      { title: 'Daily gratitude reflection', type: 'JOURNAL', duration: 5 },
      { title: 'Mindfulness breathing - 5 min', type: 'BREATHING', duration: 5 }
    ],
    Mild: [
      { title: 'Mood tracking', type: 'JOURNAL', duration: 10 },
      { title: 'Breathing exercises', type: 'BREATHING', duration: 10 },
      { title: 'Cognitive behavioral therapy basics', type: 'CBT', duration: 15 }
    ],
    Moderate: [
      { title: 'Daily mood journal', type: 'JOURNAL', duration: 15 },
      { title: 'Extended breathing practice', type: 'BREATHING', duration: 15 },
      { title: 'CBT thought records', type: 'CBT', duration: 20 },
      { title: 'Physical activity - light walk', type: 'JOURNAL', duration: 30 }
    ],
    Severe: [
      { title: 'Intensive mood tracking', type: 'JOURNAL', duration: 20 },
      { title: 'Crisis breathing techniques', type: 'BREATHING', duration: 20 },
      { title: 'CBT session - Deep work', type: 'CBT', duration: 30 },
      { title: 'Social connection check-in', type: 'JOURNAL', duration: 15 },
      { title: 'Consider professional help', type: 'JOURNAL', duration: 0 }
    ]
  }

  return taskMap[level] || taskMap.Normal
}

const generateGuidelines = (level) => {
  const guidelineMap = {
    Normal: `Your mental health assessment shows you're in a good mental state. Continue maintaining healthy habits like regular exercise, quality sleep, and social connections.`,
    Mild: `You're experiencing mild symptoms. Focus on self-care activities, maintain a routine, and practice stress-management techniques. Consider journaling or meditation.`,
    Moderate: `You're experiencing moderate symptoms. We recommend regular mood tracking, breathing exercises, and cognitive behavioral therapy techniques. If symptoms persist, consult a professional.`,
    Severe: `Your assessment indicates severe symptoms. Please prioritize seeking professional help from a mental health provider. In case of crisis, reach out to emergency services or a crisis helpline.`
  }

  return guidelineMap[level] || guidelineMap.Normal
}

export const generateJourney = async (req, res) => {
  try {
    const userId = req.user.userId

    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestAssessment) {
      return res.status(400).json({ error: 'Please complete assessment first (UC-04)' })
    }

    const recommendedTasks = generateRecommendedTasks(latestAssessment.level)
    const guidelines = generateGuidelines(latestAssessment.level)

    const journey = await prisma.journey.create({
      data: {
        userId,
        assessmentId: latestAssessment.id,
        level: latestAssessment.level,
        recommendedTasks,
        guidelines
      }
    })

    res.json({
      journeyId: journey.id,
      level: journey.level,
      totalScore: latestAssessment.score,
      guidelines: journey.guidelines,
      recommendedTasks: journey.recommendedTasks,
      createdAt: journey.createdAt
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
