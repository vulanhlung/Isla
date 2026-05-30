import fs from 'fs'
import path from 'path'

const root = path.resolve('./')
const envFile = path.join(root, '.env')
const envProductionFile = path.join(root, '.env.production')

function copyEnv() {
  if (fs.existsSync(envFile)) {
    return
  }

  if (!fs.existsSync(envProductionFile)) {
    console.warn('.env.production not found, skipping env copy.')
    return
  }

  fs.copyFileSync(envProductionFile, envFile)
  console.log('Copied .env.production to .env')
}

copyEnv()
