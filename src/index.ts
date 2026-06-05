import { Telegram } from 'puregram'
import { loadConfig } from './config.js'
import { startScheduler } from './scheduler.js'

const config = loadConfig()
const tg = Telegram.fromToken(config.botToken)

startScheduler(tg, config)
console.log(`[ssheveryday] scheduler started: "${config.cronSchedule}" (${config.tz})`)

function shutdown() {
  console.log('[ssheveryday] shutting down')
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
