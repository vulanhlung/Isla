import prisma from '../prisma/client.js'
import bcrypt from 'bcrypt'

export const createUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        consent: true,
        dataRetention: true,
        createdAt: true,
        _count: {
          select: {
            moods: true,
            assessments: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteUserData = async (req, res) => {
  try {
    const userId = req.user.userId

    // Delete all user data in transaction for privacy compliance
    await prisma.$transaction([
      prisma.chatMessage.deleteMany({ where: { userId } }),
      prisma.reflection.deleteMany({ where: { userId } }),
      prisma.cBTSession.deleteMany({ where: { userId } }),
      prisma.mood.deleteMany({ where: { userId } }),
      prisma.assessment.deleteMany({ where: { userId } }),
      prisma.userTask.deleteMany({ where: { userId } }),
      prisma.insight.deleteMany({ where: { userId } }),
      prisma.journey.deleteMany({ where: { userId } }),
      prisma.achievement.deleteMany({ where: { userId } }),
      prisma.userStats.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ])

    res.json({ message: 'All user data deleted successfully per privacy request' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}