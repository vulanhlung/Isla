import prisma from '../prisma/client.js'
import { checkAndUnlockAchievements } from './progress.controller.js'

const predefinedTasks = {
  BREATHING: { title: 'Breathing exercise', type: 'BREATHING', duration: 5 },
  CBT: { title: 'CBT practice', type: 'CBT', duration: 10 },
  GRATITUDE: { title: 'Gratitude journal', type: 'JOURNAL', duration: 5 }
}

const generateDailyTasks = async (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingTasks = await prisma.userTask.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingTasks.length > 0) {
      return res.json({
        message: 'Daily tasks already generated for today',
        tasks: existingTasks,
        alreadyExists: true
      })
    }

    const taskIds = {}
    for (const [key, taskData] of Object.entries(predefinedTasks)) {
      let task = await prisma.task.findFirst({
        where: { title: taskData.title }
      })

      if (!task) {
        task = await prisma.task.create({
          data: taskData
        })
      }

      taskIds[key] = task.id
    }

    const dailyTasks = await Promise.all(
      Object.values(taskIds).map((taskId) =>
        prisma.userTask.create({
          data: {
            userId,
            taskId,
            date: today,
            status: 'PENDING'
          },
          include: { task: true }
        })
      )
    )

    const result = await getOrCreateDailyTasks(userId)

    res.json({
      message: result.alreadyExists ? 'Daily tasks already generated for today' : 'Daily tasks generated successfully',
      date: result.date,
      tasks: result.tasks,
      alreadyExists: result.alreadyExists
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getOrCreateDailyTasks = async (userId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existingTasks = await prisma.userTask.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow
      }
    },
    include: { task: true }
  })

  if (existingTasks.length > 0) {
    return {
      date: today.toISOString().split('T')[0],
      tasks: existingTasks,
      alreadyExists: true
    }
  }

  const taskIds = {}
  for (const [key, taskData] of Object.entries(predefinedTasks)) {
    let task = await prisma.task.findFirst({
      where: { title: taskData.title }
    })

    if (!task) {
      task = await prisma.task.create({
        data: taskData
      })
    }

    taskIds[key] = task.id
  }

  const dailyTasks = await Promise.all(
    Object.values(taskIds).map((taskId) =>
      prisma.userTask.create({
        data: {
          userId,
          taskId,
          date: today,
          status: 'PENDING'
        },
        include: { task: true }
      })
    )
  )

  return {
    date: today.toISOString().split('T')[0],
    tasks: dailyTasks,
    alreadyExists: false
  }
}

const completeTask = async (req, res) => {
  try {
    const userId = req.user.userId
    const { userTaskId } = req.body

    if (!userTaskId) {
      return res.status(400).json({ error: 'userTaskId is required' })
    }

    const userTask = await prisma.userTask.findUnique({
      where: { id: userTaskId },
      include: { user: true, task: true }
    })

    if (!userTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (userTask.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updated = await prisma.userTask.update({
      where: { id: userTaskId },
      data: { status: 'DONE' },
      include: { task: true }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const completedTodayCount = await prisma.userTask.count({
      where: {
        userId,
        status: 'DONE',
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const totalCompleted = await prisma.userTask.count({
      where: {
        userId,
        status: 'DONE'
      }
    })

    await prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalTasksDone: totalCompleted,
        lastActiveDate: new Date()
      },
      update: {
        totalTasksDone: totalCompleted,
        lastActiveDate: new Date()
      }
    })

    const unlocked = await checkAndUnlockAchievements(userId)

    res.json({
      message: 'Task completed',
      task: updated,
      completedTodayCount,
      totalCompleted,
      newAchievements: unlocked.length > 0 ? unlocked : null
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getTaskProgress = async (req, res) => {
  try {
    const userId = req.user.userId

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTasks = await prisma.userTask.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: { task: true },
      orderBy: { task: { type: 'asc' } }
    })

    const completedToday = todayTasks.filter((t) => t.status === 'DONE').length
    const totalTodayTasks = todayTasks.length

    const streak = calculateStreak(stats?.lastActiveDate)

    res.json({
      totalTasksDone: stats?.totalTasksDone || 0,
      streakDays: stats?.streakDays || 0,
      lastActiveDate: stats?.lastActiveDate || null,
      todayProgress: {
        completed: completedToday,
        total: totalTodayTasks,
        percentage: totalTodayTasks > 0 ? Math.round((completedToday / totalTodayTasks) * 100) : 0
      },
      todayTasks,
      currentStreak: streak
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const calculateStreak = (lastActiveDate) => {
  if (!lastActiveDate) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActive = new Date(lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)

  const dayDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) return 1
  if (dayDiff === 1) return 2
  return 0
}

const updateStreakIfNeeded = async (userId) => {
  const stats = await prisma.userStats.findUnique({
    where: { userId }
  })

  if (!stats || !stats.lastActiveDate) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActive = new Date(stats.lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)

  const dayDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))

  let newStreak = stats.streakDays

  if (dayDiff === 1) {
    newStreak = stats.streakDays + 1
  } else if (dayDiff > 1) {
    newStreak = 1
  }

  await prisma.userStats.update({
    where: { userId },
    data: {
      streakDays: newStreak,
      lastActiveDate: new Date()
    }
  })

  return newStreak
}

export { generateDailyTasks, completeTask, getTaskProgress, updateStreakIfNeeded, getOrCreateDailyTasks }

// Get today's tasks (without generating)
export const getTodayTasks = async (req, res) => {
  try {
    const userId = req.user.userId

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTasks = await prisma.userTask.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: { task: true },
      orderBy: { task: { type: 'asc' } }
    })

    res.json({
      date: today.toISOString().split('T')[0],
      tasks: todayTasks
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update task status by userTask id
export const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['PENDING', 'DONE']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be PENDING or DONE' })
    }

    const userTask = await prisma.userTask.findUnique({
      where: { id },
      include: { task: true }
    })

    if (!userTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (userTask.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Validate completion requirements for JOURNAL and CBT tasks
    if (status === 'DONE') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (userTask.task.type === 'JOURNAL') {
        const journalToday = await prisma.journal.findFirst({
          where: {
            userId,
            createdAt: { gte: today, lt: tomorrow }
          }
        })
        if (!journalToday) {
          return res.status(400).json({
            error: 'Bạn cần viết ít nhất một Gratitude Journal hôm nay trước khi đánh dấu hoàn thành.',
            requiresAction: 'JOURNAL'
          })
        }
      }

      if (userTask.task.type === 'CBT') {
        const cbtToday = await prisma.cBTSession.findFirst({
          where: {
            userId,
            status: 'completed',
            createdAt: { gte: today, lt: tomorrow }
          }
        })
        if (!cbtToday) {
          return res.status(400).json({
            error: 'Bạn cần hoàn thành ít nhất một CBT Practice hôm nay trước khi đánh dấu hoàn thành.',
            requiresAction: 'CBT'
          })
        }
      }
    }

    const updated = await prisma.userTask.update({
      where: { id },
      data: { status },
      include: { task: true }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
