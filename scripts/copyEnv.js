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

  const exampleContent = fs.readFileSync(envExampleFile, 'utf8')

  if (!envContent) {
    fs.writeFileSync(envFile, exampleContent)
    console.log('.env created from .env.example')
    return
  }

  const missingLines = exampleContent
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return false
      const key = trimmed.split('=')[0]?.trim()
      return key && !new RegExp(`^${key}\\s*=`, 'm').test(envContent)
    })

  if (missingLines.length === 0) {
    console.log('Existing .env already contains required env vars, skipping update.')
    return
  }

  const newContent = `${envContent.trim()}\n${missingLines.join('\n')}\n`
  fs.writeFileSync(envFile, newContent)
  console.log('.env updated with missing env vars from .env.example: ', missingLines.map(line => line.split('=')[0].trim()).join(', '))
}

copyEnv()
