import { describe, it, expect, afterEach } from 'vitest'
import { loadConfig } from '../src/config.js'

const ORIG = { ...process.env }
afterEach(() => { process.env = { ...ORIG } })

describe('loadConfig', () => {
  it('throws when BOT_TOKEN is missing', () => {
    delete process.env.BOT_TOKEN
    process.env.CHANNEL_ID = '@x'
    expect(() => loadConfig()).toThrow(/BOT_TOKEN/)
  })

  it('applies defaults for optional vars', () => {
    process.env.BOT_TOKEN = 't'
    process.env.CHANNEL_ID = '@x'
    delete process.env.CRON_SCHEDULE
    delete process.env.TZ
    const c = loadConfig()
    expect(c.cronSchedule).toBe('0 9 * * *')
    expect(c.tz).toBe('UTC')
    expect(c.adminChatId).toBeUndefined()
  })
})
