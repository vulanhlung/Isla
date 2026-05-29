import prisma from '../prisma/client.js'

const startCBTSession = async (req, res) => {
  try {
    const userId = req.user.userId

    // Check if there's an active session
    const activeSession = await prisma.cBTSession.findFirst({
      where: { userId, status: 'active' }
    })

    if (activeSession) {
      return res.json({
        session: activeSession,
        message: 'Bạn có một CBT session đang hoạt động. Tiếp tục từ bước ' + activeSession.step
      })
    }

    // Create new CBT session
    const newSession = await prisma.cBTSession.create({
      data: { userId }
    })

    res.json({
      session: newSession,
      message: 'Bắt đầu CBT session mới. Bước 1: Điều gì đang làm bạn stress?'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const continueCBTSession = async (req, res) => {
  try {
    const userId = req.user.userId
    const { response, sessionId } = req.body

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return res.status(400).json({ error: 'Response is required' })
    }

    // Find active session
    const session = sessionId
      ? await prisma.cBTSession.findFirst({ where: { id: sessionId, userId, status: 'active' } })
      : await prisma.cBTSession.findFirst({ where: { userId, status: 'active' } })

    if (!session) {
      return res.status(404).json({ error: 'No active CBT session found' })
    }

    const currentStep = session.step
    let nextStep = currentStep
    let updateData = {}
    let aiResponse = ''

    switch (currentStep) {
      case 1: // Identify stressor
        updateData = { stressor: response.trim(), step: 2 }
        aiResponse = `Bạn đã xác định: "${response.trim()}". Bước 2: Có bằng chứng nào ủng hộ hoặc chống lại suy nghĩ này không?`
        nextStep = 2
        break

      case 2: // Evidence check
        updateData = { evidence: response.trim(), step: 3 }
        aiResponse = `Cảm ơn bạn đã chia sẻ bằng chứng. Bước 3: Dựa trên bằng chứng này, bạn có thể nhìn nhận vấn đề theo cách khác không?`
        nextStep = 3
        break

      case 3: // Alternative view
        updateData = { alternative: response.trim(), step: 4 }
        aiResponse = `Quan điểm thay thế của bạn rất có giá trị. Bước 4: Bạn có kế hoạch hành động gì để áp dụng quan điểm mới này không?`
        nextStep = 4
        break

      case 4: // Action plan
        updateData = { actionPlan: response.trim(), status: 'completed' }
        aiResponse = `Hoàn thành CBT session! Bạn đã hoàn thành một quá trình suy nghĩ có cấu trúc. Hãy áp dụng kế hoạch hành động này vào cuộc sống hàng ngày.`
        nextStep = 4
        break

      default:
        return res.status(400).json({ error: 'Invalid CBT step' })
    }

    // Update session
    const updatedSession = await prisma.cBTSession.update({
      where: { id: session.id },
      data: updateData
    })

    res.json({
      session: updatedSession,
      step: nextStep,
      message: aiResponse,
      completed: nextStep === 4 && updateData.status === 'completed'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getCBTSessions = async (req, res) => {
  try {
    const userId = req.user.userId
    const sessions = await prisma.cBTSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ sessions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const pauseCBTSession = async (req, res) => {
  try {
    const userId = req.user.userId
    const { sessionId } = req.body

    const session = await prisma.cBTSession.findFirst({
      where: { id: sessionId, userId, status: 'active' }
    })

    if (!session) {
      return res.status(404).json({ error: 'Active CBT session not found' })
    }

    const updatedSession = await prisma.cBTSession.update({
      where: { id: session.id },
      data: { status: 'paused' }
    })

    res.json({
      session: updatedSession,
      message: 'CBT session đã được tạm dừng. Bạn có thể tiếp tục sau.'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { startCBTSession, continueCBTSession, getCBTSessions, pauseCBTSession }