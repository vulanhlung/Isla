import { verifyToken } from '../utils/jwt.js'

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'No token' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = verifyToken(token)

    req.user = decoded

    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}