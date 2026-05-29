import prisma from '../prisma/client.js'
import { generateNaturalInsight } from '../utils/openai.js'

const moodScoreMap = {
  HAPPY: 4,
  NEUTRAL: 3,
  SAD: 2,
  OVERWHELMED: 1
}

const isStressMood = (mood) => mood === 'OVERWHELMED' || mood === 'SAD'

const composePatternDescription = (pattern, detail) => {
  switch (pattern) {
    case 'REPEATED_STRESS':
      return `Trong 7 ngày gần nhất, bạn đã có ${detail.count} lần biểu hiện stress. Đây là một dấu hiệu stress lặp lại.`
    case 'DECLINING_MOOD':
      return `Tâm trạng của bạn có xu hướng giảm: điểm trung bình tuần này (${detail.thisWeek.toFixed(1)}) thấp hơn tuần trước (${detail.lastWeek.toFixed(1)}).`
    case 'NIGHT_SADNESS':
      return `Bạn có nhiều lần buồn vào ban đêm (${detail.nightSadCount} lần). Điều này cho thấy buổi tối là khoảng thời gian bạn dễ gặp mood thấp.`
    case 'WEEKDAY_STRESS':
      return `Stress xuất hiện nhiều vào đầu tuần, đặc biệt vào Thứ Hai/Thứ Ba (${detail.monTueCount} lần).`
    default:
      return 'Không phát hiện pattern đặc biệt.'
  }
}

export const detectPatterns = async (req, res) => {
  try {
    const userId = req.user.userId
    const { period = 14 } = req.query
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
      return res.status(400).json({ error: 'Chưa có dữ liệu mood để phát hiện pattern.' })
    }

    const total = moods.length
    const stressEntries = moods.filter((entry) => isStressMood(entry.mood))
    const stressCount = stressEntries.length
    const recent7Date = new Date()
    recent7Date.setDate(recent7Date.getDate() - 7)
    const recent7 = moods.filter((entry) => new Date(entry.createdAt) >= recent7Date)
    const recentStressCount = recent7.filter((entry) => isStressMood(entry.mood)).length

    const moodScore = moods.map((entry) => moodScoreMap[entry.mood] || 3)
    const half = Math.floor(moodScore.length / 2)
    const firstHalf = moodScore.slice(0, half)
    const secondHalf = moodScore.slice(half)

    const avg = (arr) => (arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0)
    const lastWeekAvg = avg(firstHalf)
    const thisWeekAvg = avg(secondHalf)

    const nightSadCount = moods.filter((entry) => entry.mood === 'SAD' && new Date(entry.createdAt).getHours() >= 20).length
    const sadCount = moods.filter((entry) => entry.mood === 'SAD').length

    const monTueStressCount = moods.filter((entry) => {
      const day = new Date(entry.createdAt).getDay()
      return (day === 1 || day === 2) && isStressMood(entry.mood)
    }).length

    const patterns = []

    if (recentStressCount >= 3) {
      patterns.push({
        pattern: 'REPEATED_STRESS',
        detail: { count: recentStressCount },
        description: composePatternDescription('REPEATED_STRESS', { count: recentStressCount })
      })
    }

    if (thisWeekAvg < lastWeekAvg && lastWeekAvg > 0) {
      patterns.push({
        pattern: 'DECLINING_MOOD',
        detail: { lastWeek: lastWeekAvg, thisWeek: thisWeekAvg },
        description: composePatternDescription('DECLINING_MOOD', { lastWeek: lastWeekAvg, thisWeek: thisWeekAvg })
      })
    }

    if (sadCount > 0 && nightSadCount >= 2 && nightSadCount / sadCount >= 0.3) {
      patterns.push({
        pattern: 'NIGHT_SADNESS',
        detail: { nightSadCount, sadCount },
        description: composePatternDescription('NIGHT_SADNESS', { nightSadCount })
      })
    }

    if (monTueStressCount >= 2) {
      patterns.push({
        pattern: 'WEEKDAY_STRESS',
        detail: { monTueCount: monTueStressCount },
        description: composePatternDescription('WEEKDAY_STRESS', { monTueCount: monTueStressCount })
      })
    }

    if (!patterns.length) {
      patterns.push({
        pattern: 'NO_PATTERN',
        description: 'Không phát hiện pattern đáng chú ý trong dữ liệu mood hiện tại.'
      })
    }

    let aiInsight = null
    try {
      aiInsight = await generateNaturalInsight(patterns)
    } catch (err) {
      console.error('OpenAI insight generation skipped:', err.message)
      aiInsight = null
    }

    res.json({
      period: `${days} days`,
      totalEntries: total,
      stressCount,
      thisWeekAvg: Math.round(thisWeekAvg * 10) / 10,
      lastWeekAvg: Math.round(lastWeekAvg * 10) / 10,
      nightSadCount,
      monTueStressCount,
      patterns,
      aiInsight: aiInsight || null
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
