import { describe, it, expect } from 'vitest'
import { pickAlgo, generateKey, type AlgoSpec } from '../src/keygen.js'

describe('pickAlgo', () => {
  it('never returns the previous algo', () => {
    const prev: AlgoSpec = { algo: 'ed25519', label: 'ED25519' }
    for (let i = 0; i < 300; i++) {
      expect(pickAlgo(prev).label).not.toBe('ED25519')
    }
  })

  it('returns something from the pool when no previous', () => {
    expect(pickAlgo().label).toBeTruthy()
  })
})

const specs: AlgoSpec[] = [
  { algo: 'ed25519', label: 'ED25519' },
  { algo: 'ecdsa', bits: 256, label: 'ECDSA 256' },
  { algo: 'rsa', bits: 2048, label: 'RSA 2048' }
]

describe('generateKey (integration: requires ssh-keygen)', () => {
  for (const spec of specs) {
    it(`generates a valid ${spec.label} key`, async () => {
      const key = await generateKey(spec)
      expect(key.privateKey).toContain('OPENSSH PRIVATE KEY')
      expect(key.publicKey).toMatch(/^(ssh-|ecdsa-)/)
      expect(key.fingerprint).toMatch(/SHA256:\S+/)
      expect(key.fingerprint).toContain(`(${spec.label.split(' ')[0]})`)
      expect(key.fingerprint).toMatch(/^SHA256:\S+ \([A-Z0-9-]+\)$/)
      expect(key.randomart).toContain('[SHA256]')
    }, 30000)
  }
})
