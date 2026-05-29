import fs from 'fs'
import path from 'path'

export const privacyLogger = (req, res, next) => {
  const timestamp = new Date().toISOString()
  // req.user is populated by authMiddleware — log userId if available, else anonymous
  const anonymizedId = req.user?.anonymizedId || req.user?.userId || 'anonymous'
  const endpoint = req.originalUrl
  const method = req.method

  // Log only essential info, no PII
  const logEntry = `${timestamp} | ${anonymizedId} | ${method} ${endpoint}\n`

  // Append to log file
  const logPath = path.join(process.cwd(), 'logs', 'privacy.log')
  fs.appendFile(logPath, logEntry, (err) => {
    if (err) console.error('Privacy log error:', err)
  })

  next()
}