import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.join(__dirname, '..')
const envFile = path.join(root, '.env')
const envExampleFile = path.join(root, '.env.example')

function copyEnv() {
  const cwd = process.cwd()
  console.log(`copyEnv running from cwd=${cwd}, root=${root}`)

  const exampleExists = fs.existsSync(envExampleFile)
  if (!exampleExists) {
    console.warn('.env.example not found, skipping env copy.')
    return
  }

  let envContent = ''
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8')
  }

  const hasDatabaseUrl = /^(DATABASE_URL\s*=)/m.test(envContent)
  if (hasDatabaseUrl) {
    console.log('Existing .env already contains DATABASE_URL, skipping copy.')
    return
  }

  const exampleContent = fs.readFileSync(envExampleFile, 'utf8')
  const databaseUrlLine = exampleContent
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith('DATABASE_URL'))

  if (!databaseUrlLine) {
    console.warn('.env.example does not contain DATABASE_URL, skipping env copy.')
    return
  }

  const newContent = envContent ? `${envContent.trim()}\n${databaseUrlLine}\n` : `${databaseUrlLine}\n`
  fs.writeFileSync(envFile, newContent)
  console.log('.env created/updated with DATABASE_URL from .env.example')
}

copyEnv()
