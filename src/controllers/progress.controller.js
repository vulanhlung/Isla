import prisma from '../prisma/client.js'

const moodScoreMap = {
  HAPPY: 4,
  NEUTRAL: 3,
  SAD: 2,
  OVERWHELMED: 1
}

const getProgressDashboard = async (req, res) => {
  try {
    const userId = req.user.userId
    const { period = 30 } = req.query
    const days = Math.min(Math.max(parseInt(period), 7), 30)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const moods = await prisma.mood.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    })

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    const moodValues = moods.map((m) => moodScoreMap[m.mood] || 3)
    const half = Math.floor(moodValues.length / 2)
    const firstHalf = moodValues.slice(0, half)
    const secondHalf = moodValues.slice(half)

    const avg = (arr) => (arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0)
    const lastWeekAvg = avg(firstHalf)
    const thisWeekAvg = avg(secondHalf)

    let moodTrend = 'stable'
    if (thisWeekAvg > lastWeekAvg + 0.5) moodTrend = 'improving'
    if (thisWeekAvg < lastWeekAvg - 0.5) moodTrend = 'declining'

    const stressCount = moods.filter((m) => m.mood === 'OVERWHELMED' || m.mood === 'SAD').length
    const stressRate = moods.length > 0 ? (stressCount / moods.length) * 100 : 0

    const totalTasks = await prisma.userTask.count({ where: { userId } })
    const completedTasks = await prisma.userTask.count({ where: { userId, status: 'DONE' } })
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    })

    res.json({
      period: `${days} days`,
      stats: {
        totalTasksDone: stats?.totalTasksDone || 0,
        streakDays: stats?.streakDays || 0,
        lastActiveDate: stats?.lastActiveDate || null
      },
      moodMetrics: {
        thisWeekAvg: Math.round(thisWeekAvg * 10) / 10,
        lastWeekAvg: Math.round(lastWeekAvg * 10) / 10,
        trend: moodTrend,
        totalEntries: moods.length
      },
      stressMetrics: {
        stressCount,
        stressRate: Math.round(stressRate),
        interpretation: stressRate > 50 ? 'High' : stressRate > 25 ? 'Moderate' : 'Low'
      },
      taskMetrics: {
        totalTasks,
        completedTasks,
        completionRate: taskCompletionRate
      },
      achievements
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const checkAndUnlockAchievements = async (userId) => {
  const stats = await prisma.userStats.findUnique({
    where: { userId }
  })

  if (!stats) return []

  const achievements = []
  const existingAchievements = await prisma.achievement.findMany({
    where: { userId }
  })

  const existingBadges = existingAchievements.map((a) => a.badge)

  const achievementRules = [
    {
      badge: 'First Steps',
      milestone: 'FIRST_TASK',
      condition: stats.totalTasksDone >= 1,
      description: 'Hoàn thành task đầu tiên của bạn'
    },
    {
      badge: 'On Fire',
      milestone: 'STREAK_7',
      condition: stats.streakDays >= 7,
      description: 'Duy trì streak 7 ngày liên tiếp'
    },
    {
      badge: 'Unstoppable',
      milestone: 'STREAK_30',
      condition: stats.streakDays >= 30,
      description: 'Duy trì streak 30 ngày liên tiếp'
    },
    {
      badge: 'Productivity Master',
      milestone: 'TASKS_50',
      condition: stats.totalTasksDone >= 50,
      description: 'Hoàn thành 50 tasks'
    },
    {
      badge: 'Zen Master',
      milestone: 'TASKS_100',
      condition: stats.totalTasksDone >= 100,
      description: 'Hoàn thành 100 tasks'
    }
  ]

  for (const rule of achievementRules) {
    if (rule.condition && !existingBadges.includes(rule.badge)) {
      const achievement = await prisma.achievement.create({
        data: {
          userId,
          badge: rule.badge,
          milestone: rule.milestone,
          description: rule.description
        }
      })

      achievements.push(achievement)
      existingBadges.push(rule.badge)
    }
  }

  return achievements
}

const getStreakInfo = async (req, res) => {
  try {
    const userId = req.user.userId

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!stats) {
      return res.json({
        streakDays: 0,
        lastActiveDate: null,
        message: 'Chưa có dữ liệu streak'
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tasksTodayCount = await prisma.userTask.count({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    res.json({
      streakDays: stats.streakDays,
      lastActiveDate: stats.lastActiveDate,
      totalTasksDone: stats.totalTasksDone,
      tasksTodayCount,
      streakStatus: stats.streakDays > 0 ? 'active' : 'inactive'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAchievements = async (req, res) => {
  try {
    const userId = req.user.userId

    const unlocked = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    })

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    const locked = []
    const lockedRules = [
      { badge: 'First Steps', milestone: 'FIRST_TASK', condition: (stats?.totalTasksDone || 0) < 1 },
      { badge: 'On Fire', milestone: 'STREAK_7', condition: (stats?.streakDays || 0) < 7 },
      { badge: 'Unstoppable', milestone: 'STREAK_30', condition: (stats?.streakDays || 0) < 30 },
      { badge: 'Productivity Master', milestone: 'TASKS_50', condition: (stats?.totalTasksDone || 0) < 50 },
      { badge: 'Zen Master', milestone: 'TASKS_100', condition: (stats?.totalTasksDone || 0) < 100 }
    ]

    const unlockedBadges = unlocked.map((a) => a.badge)

    for (const rule of lockedRules) {
      if (rule.condition && !unlockedBadges.includes(rule.badge)) {
        locked.push({
          badge: rule.badge,
          milestone: rule.milestone,
          locked: true
        })
      }
    }

    res.json({
      unlocked,
      locked,
      totalUnlocked: unlocked.length,
      totalAchievements: unlocked.length + locked.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getProgressDashboard, checkAndUnlockAchievements, getStreakInfo, getAchievements }
