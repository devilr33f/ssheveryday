import cron from 'node-cron'
import type { Telegram } from 'puregram'
import type { Config } from './config.js'
import { pickAlgo, generateKey, type AlgoSpec } from './keygen.js'
import { formatKey } from './format.js'
import { send } from './sender.js'

export function buildJob(tg: Telegram, config: Config): () => Promise<void> {
  let lastAlgo: AlgoSpec | undefined
  return async () => {
    try {
      const spec = pickAlgo(lastAlgo)
      lastAlgo = spec
      const key = await generateKey(spec)
      const plan = formatKey(key, new Date(), config.tz)
      await send(tg, config.channelId, plan)
      console.log(`[ssheveryday] posted ${spec.label}`)
    } catch (err) {
      console.error('[ssheveryday] daily job failed:', err)
      if (config.adminChatId) {
        await tg.api
          .sendMessage({ chat_id: config.adminChatId, text: `ssheveryday failed: ${String(err)}`, suppress: true })
          .catch(() => {})
      }
    }
  }
}

export function startScheduler(tg: Telegram, config: Config) {
  return cron.schedule(config.cronSchedule, buildJob(tg, config), {
    timezone: config.tz,
    noOverlap: true
  })
}
