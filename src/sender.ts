import { type Telegram, MediaSource } from 'puregram'
import type { RenderPlan } from './format.js'

export async function send(tg: Telegram, channelId: string, plan: RenderPlan): Promise<void> {
  if (plan.mode === 'inline') {
    await tg.api.sendMessage({ chat_id: channelId, text: plan.text })
    return
  }

  await tg.api.sendDocument({
    chat_id: channelId,
    document: MediaSource.text(plan.privateKey, { filename: plan.filename }),
    caption: plan.caption
  })
  await tg.api.sendMessage({ chat_id: channelId, text: plan.followup })
}
