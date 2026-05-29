import prisma from '../prisma/client.js'

const moodScoreMap = {
  HAPPY: 4,
  NEUTRAL: 3,
  SAD: 2,
  OVERWHELMED: 1
}

const moodPhrase = (mood, intensity) => {
  const intensityLabel = intensity >= 4 ? 'rất' : intensity >= 3 ? 'khá' : 'hơi'

  switch (mood) {
    case 'OVERWHELMED':
      return `${intensityLabel} căng thẳng`
    case 'SAD':
      return `${intensityLabel} buồn`
    case 'NEUTRAL':
      return `${intensityLabel} tâm trạng trung tính`
    case 'HAPPY':
      return `${intensityLabel} tích cực`
    default:
      return `${intensityLabel} dao động`
  }
}

const timePattern = (weekdayCounts, nightCount, total) => {
  const early = weekdayCounts.monday + weekdayCounts.tuesday
  const weekend = weekdayCounts.saturday + weekdayCounts.sunday
  const middle = weekdayCounts.wednesday + weekdayCounts.thursday

  if (nightCount >= total * 0.3) return 'ban đêm'
  if (early >= weekend && early >= middle) return 'đầu tuần'
  if (weekend >= early && weekend >= middle) return 'cuối tuần'
  return 'giữa tuần'
}

const trendLabel = (values) => {
  if (values.length < 2) return 'stable'

  const mid = Math.floor(values.length / 2)
  const firstAvg = values.slice(0, mid).reduce((sum, v) => sum + v, 0) / Math.max(mid, 1)
  const secondAvg = values.slice(mid).reduce((sum, v) => sum + v, 0) / Math.max(values.length - mid, 1)
  const diff = secondAvg - firstAvg

  if (diff > 0.3) return 'improving'
  if (diff < -0.3) return 'declining'
  return 'stable'
}

const insightTypeFor = (mainMood, averageIntensity, stressRate) => {
  if (mainMood === 'OVERWHELMED' || mainMood === 'SAD') {
    if (stressRate >= 0.4 || averageIntensity >= 4) return 'WARNING'
    return 'PATTERN'
  }

  if (mainMood === 'NEUTRAL') {
    return averageIntensity >= 4 ? 'PATTERN' : 'IMPROVEMENT'
  }

  return 'IMPROVEMENT'
}

const composeNaturalInsight = ({ mainMood, averageIntensity, timePattern, trend, stressRate }) => {
  const moodText = moodPhrase(mainMood, averageIntensity)
  let base = `Bạn có xu hướng ${moodText}`

  if (timePattern) {
    base += ` vào ${timePattern}`
  }

  if (trend === 'declining') {
    base += `. Tâm trạng đang có xu hướng xấu dần trong thời gian gần đây`
  } else if (trend === 'improving') {
    base += `. Tâm trạng của bạn đang dần tốt hơn`
  } else {
    base += `. Tình trạng nhìn chung ổn định`
  }

  if (stressRate >= 0.4 && (mainMood === 'OVERWHELMED' || mainMood === 'SAD')) {
    base += `. Đây là dấu hiệu bạn cần dành thêm thời gian nghỉ ngơi và chăm sóc bản thân`
  }

  return base
}

const generateInsight = async (req, res) => {
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

    if (!moods.length) {
      return res.status(400).json({ error: 'Chưa có dữ liệu mood để phân tích.' })
    }

    const moodCounts = { HAPPY: 0, NEUTRAL: 0, SAD: 0, OVERWHELMED: 0 }
    const weekdayCounts = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }
    let intensitySum = 0
    let nightCount = 0
    const moodValues = []

    moods.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      intensitySum += entry.intensity
      moodValues.push(moodScoreMap[entry.mood] || 3)

      const createdAt = new Date(entry.createdAt)
      const day = createdAt.getDay()
      const hour = createdAt.getHours()

      if (day === 1) weekdayCounts.monday += 1
      if (day === 2) weekdayCounts.tuesday += 1
      if (day === 3) weekdayCounts.wednesday += 1
      if (day === 4) weekdayCounts.thursday += 1
      if (day === 5) weekdayCounts.friday += 1
      if (day === 6) weekdayCounts.saturday += 1
      if (day === 0) weekdayCounts.sunday += 1

      if (hour >= 22 || hour < 6) {
        nightCount += 1
      }
    })

    const total = moods.length
    const mainMood = Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] >= moodCounts[b] ? a : b))
    const averageIntensity = intensitySum / total
    const stressRate = (moodCounts.SAD + moodCounts.OVERWHELMED) / total
    const timeFocus = timePattern(weekdayCounts, nightCount, total)
    const trend = trendLabel(moodValues)
    const message = composeNaturalInsight({ mainMood, averageIntensity, timePattern: timeFocus, trend, stressRate })
    const type = insightTypeFor(mainMood, averageIntensity, stressRate)

    const insight = await prisma.insight.create({
      data: {
        userId,
        message,
        type
      }
    })

    res.json({
      insightId: insight.id,
      message: insight.message,
      type: insight.type,
      period: `${days} days`,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      stressRate: Math.round(stressRate * 100),
      trend,
      timePattern: timeFocus,
      moodCounts,
      weekdayCounts,
      nightCount,
      totalEntries: total,
      createdAt: insight.createdAt
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getOrCreateDailyInsight = async (userId, period = 7) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existingInsight = await prisma.insight.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (existingInsight) {
    return existingInsight
  }

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

  if (!moods.length) {
    return null
  }

  const moodCounts = { HAPPY: 0, NEUTRAL: 0, SAD: 0, OVERWHELMED: 0 }
  const weekdayCounts = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }
  let intensitySum = 0
  let nightCount = 0
  const moodValues = []

  moods.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    intensitySum += entry.intensity
    moodValues.push(moodScoreMap[entry.mood] || 3)

    const createdAt = new Date(entry.createdAt)
    const day = createdAt.getDay()
    const hour = createdAt.getHours()

    if (day === 1) weekdayCounts.monday += 1
    if (day === 2) weekdayCounts.tuesday += 1
    if (day === 3) weekdayCounts.wednesday += 1
    if (day === 4) weekdayCounts.thursday += 1
    if (day === 5) weekdayCounts.friday += 1
    if (day === 6) weekdayCounts.saturday += 1
    if (day === 0) weekdayCounts.sunday += 1

    if (hour >= 22 || hour < 6) {
      nightCount += 1
    }
  })

  const total = moods.length
  const mainMood = Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] >= moodCounts[b] ? a : b))
  const averageIntensity = intensitySum / total
  const stressRate = (moodCounts.SAD + moodCounts.OVERWHELMED) / total
  const timeFocus = timePattern(weekdayCounts, nightCount, total)
  const trend = trendLabel(moodValues)
  const message = composeNaturalInsight({ mainMood, averageIntensity, timePattern: timeFocus, trend, stressRate })
  const type = insightTypeFor(mainMood, averageIntensity, stressRate)

  const insight = await prisma.insight.create({
    data: {
      userId,
      message,
      type
    }
  })

  return insight
}

export { generateInsight, getOrCreateDailyInsight }