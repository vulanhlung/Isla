import prisma from '../prisma/client.js'
import { getOrCreateDailyTasks } from './task.controller.js'
import { getOrCreateDailyInsight } from './insight.controller.js'

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId

    const latestMood = await prisma.mood.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const recentMoodEntries = await prisma.mood.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7
    })

    const insight = await getOrCreateDailyInsight(userId, 7)
    const taskResult = await getOrCreateDailyTasks(userId)

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    const completedToday = taskResult.tasks.filter((t) => t.status === 'DONE').length
    const totalToday = taskResult.tasks.length

    const progress = {
      totalTasksDone: stats?.totalTasksDone || 0,
      streakDays: stats?.streakDays || 0,
      todayCompleted: completedToday,
      todayTotal: totalToday,
      todayCompletionRate: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
    }

    res.json({
      mood: latestMood
        ? {
            id: latestMood.id,
            mood: latestMood.mood,
            intensity: latestMood.intensity,
            note: latestMood.note,
            date: latestMood.createdAt
          }
        : null,
      recentMoodEntries: recentMoodEntries.map((entry) => ({
        id: entry.id,
        mood: entry.mood,
        intensity: entry.intensity,
        note: entry.note,
        date: entry.createdAt
      })),
      insight: insight
        ? {
            id: insight.id,
            message: insight.message,
            type: insight.type,
            createdAt: insight.createdAt
          }
        : null,
      tasks: {
        date: taskResult.date,
        items: taskResult.tasks,
        alreadyGenerated: taskResult.alreadyExists
      },
      progress,
      chat: {
        available: true,
        message: 'Bạn có thể mở phần Chat AI để nhận hỗ trợ bổ sung nếu muốn.'
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getDashboard }
