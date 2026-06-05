import { describe, it, expect } from 'vitest'
import { formatKey } from '../src/format.js'
import type { GeneratedKey } from '../src/keygen.js'

const date = new Date('2026-06-05T12:00:00Z')

function makeKey(over: Partial<GeneratedKey> = {}): GeneratedKey {
  return {
    algo: 'ed25519',
    label: 'ED25519',
    privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\nabc\n-----END OPENSSH PRIVATE KEY-----',
    publicKey: 'ssh-ed25519 AAAAC3Nz',
    fingerprint: 'SHA256:abcUSELESS (ED25519)',
    randomart: '+--[ED25519 256]--+\n|   .o+ .         |\n+----[SHA256]-----+',
    ...over
  }
}

describe('formatKey', () => {
  it('renders inline when under the limit', () => {
    const plan = formatKey(makeKey(), date, 'UTC')
    expect(plan.mode).toBe('inline')
    if (plan.mode !== 'inline') throw new Error('expected inline')
    expect(plan.text).toContain('ssh key of the day • jun 05 2026')
    expect(plan.text).toContain('<b>private key:</b>')
    expect(plan.text).toContain('<pre>')
    expect(plan.text.length).toBeLessThanOrEqual(4096)
  })

  it('escapes HTML-special chars in key bodies', () => {
    const plan = formatKey(makeKey({ publicKey: 'ssh-rsa A<B>&C' }), date, 'UTC')
    if (plan.mode !== 'inline') throw new Error('expected inline')
    expect(plan.text).toContain('A&lt;B&gt;&amp;C')
  })

  it('falls back to file mode when over 4096', () => {
    const plan = formatKey(makeKey({ algo: 'rsa', privateKey: 'x'.repeat(5000) }), date, 'UTC')
    expect(plan.mode).toBe('file')
    if (plan.mode !== 'file') throw new Error('expected file')
    expect(plan.filename).toBe('id_rsa')
    expect(plan.privateKey.length).toBe(5000)
    expect(plan.caption.length).toBeLessThanOrEqual(1024)
    expect(plan.followup).toContain('<b>public key:</b>')
    expect(plan.followup.length).toBeLessThanOrEqual(4096)
  })

  it('respects timezone when rendering the date', () => {
    const plan = formatKey(makeKey(), new Date('2026-06-05T23:30:00Z'), 'Asia/Tokyo')
    if (plan.mode !== 'inline') throw new Error('expected inline')
    expect(plan.text).toContain('jun 06 2026')
  })
})
