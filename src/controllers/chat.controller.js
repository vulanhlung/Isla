import prisma from '../prisma/client.js'
import { aiChatCompletion } from '../utils/openai.js'
import {
  assessMentalHealthRisk,
  createCrisisResponse
} from '../services/mentalHealthSafety.service.js'
import { retrieveMentalHealthKnowledge } from '../services/mentalHealthKnowledge.service.js'
import {
  buildAssistantMetadata,
  buildMentalHealthSystemPrompt,
  buildOfflineSupportResponse
} from '../services/mentalHealthPrompt.service.js'

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 20 } = req.query

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    })

    res.json({
      messages: messages.reverse().map((m) => ({
        ...m,
        metadata: m.metadata ? JSON.parse(m.metadata) : null
      })),
      total: messages.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId
    const { message } = req.body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' })
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' })
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        userId,
        message: message.trim(),
        role: 'user'
      }
    })

    // Get recent chat history for context (last 10 messages)
    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get user context from database
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const recentMoods = await prisma.mood.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Build context for AI
    const context = {
      userStats: userStats || { totalTasksDone: 0, streakDays: 0 },
      latestAssessment: latestAssessment ? {
        score: latestAssessment.score,
        level: latestAssessment.level,
        createdAt: latestAssessment.createdAt
      } : null,
      recentMoods: recentMoods.map(m => ({
        mood: m.mood,
        intensity: m.intensity,
        note: m.note,
        date: m.createdAt.toISOString().split('T')[0]
      }))
    }

    const risk = assessMentalHealthRisk(message.trim())
    const knowledge = retrieveMentalHealthKnowledge(message.trim())

    const assistantResult = await generateChatResponse({
      userMessage: message.trim(),
      chatHistory: recentMessages.reverse().filter((msg) => msg.id !== userMessage.id),
      context,
      risk,
      knowledge
    })

    // Save assistant response (include metadata for safety/audit)
    const aiMessage = await prisma.chatMessage.create({
      data: {
        userId,
        message: assistantResult.message,
        role: 'assistant',
        metadata: JSON.stringify(assistantResult.metadata)
      }
    })

    res.json({
      userMessage: {
        id: userMessage.id,
        message: userMessage.message,
        role: userMessage.role,
        createdAt: userMessage.createdAt
      },
      assistantMessage: {
        id: aiMessage.id,
        message: aiMessage.message,
        role: aiMessage.role,
        createdAt: aiMessage.createdAt
      },
      metadata: assistantResult.metadata
    })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Failed to process chat message' })
  }
}

const localResponseTemplates = [
  {
    match: (text) => /\b(chào|xin chào|hello|hi|hey|alo)\b/i.test(text),
    response:
      'Chào bạn, mình là Isla. Mình có thể hỗ trợ bạn ghi lại cảm xúc, hiểu điều đang xảy ra, hoặc chọn một bước tự chăm sóc nhỏ hôm nay.'
  },
  {
    match: (text) => /\b(cảm ơn|thank you|thanks)\b/i.test(text),
    response: 'Mình rất vui vì được đi cùng bạn một đoạn. Hôm nay bạn cứ đi chậm thôi, một bước nhỏ cũng tính.'
  }
]


const generateChatResponse = async ({ userMessage, chatHistory, context, risk, knowledge }) => {
  const metadata = buildAssistantMetadata({ risk, knowledge })

  if (!risk.shouldUseAI) {
    return {
      message: createCrisisResponse(risk),
      metadata
    }
  }

  const localTemplate = localResponseTemplates.find(({ match }) => match(userMessage))
  if (localTemplate) {
    return {
      message: localTemplate.response,
      metadata
    }
  }

  // Always call AI for all other messages — AI handles context-aware responses naturally
  const systemPrompt = buildMentalHealthSystemPrompt({ context, risk, knowledge })

  try {
    const responseText = await aiChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.message
        })),
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    return {
      message: responseText || buildOfflineSupportResponse({ message: userMessage, risk, knowledge }),
      metadata
    }
  } catch (err) {
    console.error('AI chat error:', err.message)
    return {
      message: buildOfflineSupportResponse({ message: userMessage, risk, knowledge }),
      metadata: {
        ...metadata,
        aiFallback: true
      }
    }
  }
}

export { getChatHistory, sendMessage }
