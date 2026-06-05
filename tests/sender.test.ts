import { describe, it, expect, vi } from 'vitest'
import { send } from '../src/sender.js'
import type { RenderPlan } from '../src/format.js'

function makeTg() {
  const sendMessage = vi.fn().mockResolvedValue({})
  const sendDocument = vi.fn().mockResolvedValue({})
  return { tg: { api: { sendMessage, sendDocument } } as any, sendMessage, sendDocument }
}

describe('send', () => {
  it('sends a single message for inline plans', async () => {
    const { tg, sendMessage, sendDocument } = makeTg()
    const plan: RenderPlan = { mode: 'inline', text: 'hello' }
    await send(tg, '@chan', plan)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ chat_id: '@chan', text: 'hello', parse_mode: 'HTML' })
    )
    expect(sendDocument).not.toHaveBeenCalled()
  })

  it('sends document + followup for file plans', async () => {
    const { tg, sendMessage, sendDocument } = makeTg()
    const plan: RenderPlan = {
      mode: 'file', caption: 'cap', privateKey: 'PRIV', filename: 'id_rsa', followup: 'pub'
    }
    await send(tg, '@chan', plan)
    expect(sendDocument).toHaveBeenCalledTimes(1)
    expect(sendDocument).toHaveBeenCalledWith(
      expect.objectContaining({ chat_id: '@chan', caption: 'cap', parse_mode: 'HTML' })
    )
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ chat_id: '@chan', text: 'pub', parse_mode: 'HTML' })
    )
  })
})
