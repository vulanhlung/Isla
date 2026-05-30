if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db'
  console.warn('DATABASE_URL not set, falling back to file:./dev.db')
}

const { PrismaClient } = await import('@prisma/client')

const prisma = new PrismaClient()

export default prisma
