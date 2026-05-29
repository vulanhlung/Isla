import prisma from '../prisma/client.js'

const moodScoreMap = {
  HAPPY: 4,
  NEUTRAL: 3,
  SAD: 2,
  OVERWHELMED: 1
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

  if (diff > 0.25) return 'improving'
  if (diff < -0.25) return 'declining'
  return 'stable'
}

const detectRecommendation = ({ stressRate, mainMood, averageIntensity, trend }) => {
  if (stressRate >= 0.4) {
    return {
      code: 'STRESS_HIGH',
      action: 'Breathing exercise',
      title: 'Thở sâu để giảm stress',
      details: 'Thực hiện 5-10 phút bài thở chậm và kiểm soát nhịp thở để hạ thấp sự căng thẳng.'
    }
  }

  if ((mainMood === 'OVERWHELMED' || mainMood === 'SAD') && trend === 'declining') {
    return {
      code: 'NEGATIVE_THOUGHT',
      action: 'CBT practice',
      title: 'Ghi lại suy nghĩ tiêu cực',
      details: 'Thử viết ra suy nghĩ hiện tại và đặt câu hỏi "Có bằng chứng nào chống lại suy nghĩ này?"'
    }
  }

  if (mainMood === 'SAD' || mainMood === 'NEUTRAL' || averageIntensity <= 3) {
    return {
      code: 'LOW_MOOD',
      action: 'Gratitude journal',
      title: 'Ghi nhớ điều tích cực',
      details: 'Viết ra 3 điều bạn biết ơn hôm nay để tăng cường tâm trạng.'
    }
  }

  return {
    code: 'MAINTAIN',
    action: 'Self-care',
    title: 'Giữ thói quen tốt',
    details: 'Tiếp tục duy trì thói quen lành mạnh như ngủ đủ giấc, vận động nhẹ và giữ liên lạc với người thân.'
  }
}

const aiPersonalizedText = ({ recommendation, timePattern, mainMood }) => {
  switch (recommendation.code) {
    case 'STRESS_HIGH':
      return `Trong ${timePattern}, bạn nên dành thời gian cho kỹ thuật thở thư giãn để giảm tải căng thẳng. Một câu hỏi đơn giản bạn có thể tự hỏi: "Mình cần thở sâu và cho bản thân một khoảnh khắc bình yên như thế nào?"`
    case 'NEGATIVE_THOUGHT':
      return `Khi tâm trạng của bạn đi xuống, thử dùng CBT: "Câu chuyện mình đang kể với bản thân có chính xác không?". Viết ra 3 lý do để nghi ngờ suy nghĩ tiêu cực.`
    case 'LOW_MOOD':
      return `Thử ghi danh sách biết ơn cho ngày hôm nay. Hãy tự hỏi: "Mình đã nhận được điều tốt đẹp nào hôm nay?" để tâm trạng ấm lên.`
    default:
      return `Duy trì thói quen hiện tại và nhớ bổ sung các hoạt động giúp bạn thư giãn và cân bằng cảm xúc.`
  }
}

export const generateRecommendation = async (req, res) => {
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
      return res.status(400).json({ error: 'Chưa có dữ liệu mood để tạo recommendation.' })
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

    const recommendation = detectRecommendation({ stressRate, mainMood, averageIntensity, trend })
    const aiText = aiPersonalizedText({ recommendation, timePattern: timeFocus, mainMood })

    res.json({
      period: `${days} days`,
      totalEntries: total,
      mainMood,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      stressRate: Math.round(stressRate * 100),
      timePattern: timeFocus,
      trend,
      recommendation,
      aiText,
      moodCounts,
      weekdayCounts,
      nightCount
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
