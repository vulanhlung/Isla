import fs from 'fs'
import path from 'path'

const root = path.resolve('./')
const envFile = path.join(root, '.env')
const envExampleFile = path.join(root, '.env.example')

function copyEnv() {
  if (fs.existsSync(envFile)) {
    return
  }

  if (!fs.existsSync(envExampleFile)) {
    console.warn('.env.example not found, skipping env copy.')
    return
  }

  fs.copyFileSync(envExampleFile, envFile)
  console.log('Copied .env.example to .env')
}

copyEnv()
