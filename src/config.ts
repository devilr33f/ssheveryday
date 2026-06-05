export interface Config {
  botToken: string
  channelId: string
  cronSchedule: string
  tz: string
  adminChatId?: string
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`missing required env var: ${name}`)
  return value
}

export function loadConfig(): Config {
  return {
    botToken: required('BOT_TOKEN'),
    channelId: required('CHANNEL_ID'),
    cronSchedule: process.env.CRON_SCHEDULE ?? '0 9 * * *',
    tz: process.env.TZ ?? 'UTC',
    adminChatId: process.env.ADMIN_CHAT_ID || undefined
  }
}
