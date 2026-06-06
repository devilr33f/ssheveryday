import { describe, it, expect } from 'vitest'
import { generateKey } from '../src/keygen.js'
import { formatKey } from '../src/format.js'

const date = new Date('2026-06-05T12:00:00Z')

// the file-fallback path fires for real ~1/7 of daily runs (rsa-4096 is in the pool).
// format.test.ts only exercises it with a synthetic 5000-char string, so this verifies
// the keygen -> format integration against a real oversized key, end to end (no telegram).
describe('rsa-4096 file-fallback (integration: real ssh-keygen)', () => {
  it('produces a valid file-mode plan for a real rsa-4096 key', async () => {
    const key = await generateKey({ algo: 'rsa', bits: 4096, label: 'RSA 4096' })
    const plan = formatKey(key, date, 'UTC')

    expect(plan.mode).toBe('file')
    if (plan.mode !== 'file') throw new Error('expected file mode for rsa-4096')

    expect(plan.filename).toBe('id_rsa')
    expect(plan.privateKey).toContain('OPENSSH PRIVATE KEY')
    expect(plan.caption.text.length).toBeLessThanOrEqual(1024)
    expect(plan.followup.text.length).toBeLessThanOrEqual(4096)
    expect(plan.followup.text).toContain(key.publicKey.slice(0, 20))
  }, 30000)
})
