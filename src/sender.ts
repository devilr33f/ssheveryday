import { type Telegram, MediaSource } from 'puregram'
import type { RenderPlan } from './format.js'

// post-only bot never calls tg.start(), so the markup() plugin's request hook
// never installs — unwrap Formatted -> { text, entities } at the send boundary.
export async function send(tg: Telegram, channelId: string, plan: RenderPlan): Promise<void> {
  if (plan.mode === 'inline') {
    await tg.api.sendMessage({ chat_id: channelId, ...plan.text.toPayload() })
    return
  }

  const caption = plan.caption.toPayload()
  await tg.api.sendDocument({
    chat_id: channelId,
    document: MediaSource.text(plan.privateKey, { filename: plan.filename }),
    caption: caption.text,
    caption_entities: caption.entities
  })
  await tg.api.sendMessage({ chat_id: channelId, ...plan.followup.toPayload() })
}
