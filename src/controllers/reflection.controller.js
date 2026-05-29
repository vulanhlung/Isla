import prisma from '../prisma/client.js'
import { aiChatCompletion } from '../utils/openai.js'

const createReflection = async (req, res) => {
  try {
    const userId = req.user.userId
    const { emotion, trigger, intensity, context } = req.body

    if (!emotion || typeof emotion !== 'string' || emotion.trim().length === 0) {
      return res.status(400).json({ error: 'Emotion is required' })
    }

    if (intensity && (intensity < 1 || intensity > 10)) {
      return res.status(400).json({ error: 'Intensity must be between 1 and 10' })
    }

    // Get user context for better reflection
    const recentMoods = await prisma.mood.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Generate AI reflection
    const reflectionText = await generateReflectionResponse(
      emotion.trim(),
      trigger?.trim(),
      intensity,
      context?.trim(),
      recentMoods,
      latestAssessment
    )

    // Save reflection
    const reflection = await prisma.reflection.create({
      data: {
        userId,
        emotion: emotion.trim(),
        trigger: trigger?.trim(),
        intensity,
        reflection: reflectionText
      }
    })

    res.json({
      reflection,
      message: 'Reflection đã được tạo thành công'
    })
  } catch (err) {
    console.error('Reflection error:', err)
    res.status(500).json({ error: 'Failed to create reflection' })
  }
}

const getReflections = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 10 } = req.query

    const reflections = await prisma.reflection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    })

    res.json({ reflections })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const generateReflectionResponse = async (emotion, trigger, intensity, context, recentMoods, latestAssessment) => {
  const moodContext = recentMoods.length > 0
    ? `Mood gần đây: ${recentMoods.map(m => `${m.mood} (${m.intensity})`).join(', ')}`
    : 'Chưa có mood gần đây'

  const assessmentContext = latestAssessment
    ? `Assessment gần nhất: ${latestAssessment.level} (điểm ${latestAssessment.score})`
    : 'Chưa có assessment'

  const prompt = `Bạn là một reflection AI đồng cảm và chuyên nghiệp. Nhiệm vụ của bạn là phản chiếu lại cảm xúc của người dùng một cách chân thành và hỗ trợ.

Thông tin về người dùng:
- ${moodContext}
- ${assessmentContext}

Cảm xúc hiện tại: "${emotion}"
${trigger ? `Nguyên nhân: "${trigger}"` : ''}
${intensity ? `Mức độ: ${intensity}/10` : ''}
${context ? `Bối cảnh thêm: "${context}"` : ''}

Hướng dẫn:
- Phản chiếu cảm xúc một cách chân thành
- Thừa nhận cảm xúc là hợp lệ
- Không phán xét hoặc cố "sửa chữa"
- Khuyến khích tự nhận thức
- Giữ phản hồi ngắn gọn, ấm áp
- Luôn trả lời bằng tiếng Việt

Ví dụ phản hồi: "Mình nghe bạn đang cảm thấy ${emotion} rất sâu sắc. Điều này hẳn là rất khó khăn..."`

  try {
    const responseText = await aiChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    })

    return responseText || `Cảm ơn bạn đã chia sẻ cảm xúc "${emotion}". Mình ở đây để lắng nghe.`
  } catch (err) {
    console.error('Reflection AI error:', err.message)
    return `Cảm ơn bạn đã chia sẻ cảm xúc "${emotion}". Mình hiểu đây là một trải nghiệm quan trọng và hợp lệ.`
  }
}

export { createReflection, getReflections }