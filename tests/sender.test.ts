import { describe, it, expect, vi } from 'vitest'
import { Formatted } from '@puregram/markup'
import { send } from '../src/sender.js'
import type { RenderPlan } from '../src/format.js'

function makeTg() {
  const sendMessage = vi.fn().mockResolvedValue({})
  const sendDocument = vi.fn().mockResolvedValue({})
  return { tg: { api: { sendMessage, sendDocument } } as any, sendMessage, sendDocument }
}

describe('send', () => {
  it('sends a single message for inline plans, no parse_mode', async () => {
    const { tg, sendMessage, sendDocument } = makeTg()
    const text = new Formatted('hello')
    const plan: RenderPlan = { mode: 'inline', text }
    await send(tg, '@chan', plan)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith({ chat_id: '@chan', text })
    expect(sendMessage.mock.calls[0][0]).not.toHaveProperty('parse_mode')
    expect(sendDocument).not.toHaveBeenCalled()
  })

  it('sends document + followup for file plans', async () => {
    const { tg, sendMessage, sendDocument } = makeTg()
    const caption = new Formatted('cap')
    const followup = new Formatted('pub')
    const plan: RenderPlan = {
      mode: 'file', caption, privateKey: 'PRIV', filename: 'id_rsa', followup
    }
    await send(tg, '@chan', plan)
    expect(sendDocument).toHaveBeenCalledTimes(1)
    expect(sendDocument).toHaveBeenCalledWith(
      expect.objectContaining({ chat_id: '@chan', caption })
    )
    expect(sendDocument.mock.calls[0][0]).not.toHaveProperty('parse_mode')
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith({ chat_id: '@chan', text: followup })
  })
})
