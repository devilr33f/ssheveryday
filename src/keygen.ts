import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = promisify(execFile)

export interface AlgoSpec {
  algo: 'ed25519' | 'ecdsa' | 'rsa'
  bits?: number
  label: string
}

export interface GeneratedKey {
  algo: AlgoSpec['algo']
  label: string
  bits?: number
  privateKey: string
  publicKey: string
  fingerprint: string
  randomart: string
}

const POOL: AlgoSpec[] = [
  { algo: 'ed25519', label: 'ED25519' },
  { algo: 'ecdsa', bits: 256, label: 'ECDSA 256' },
  { algo: 'ecdsa', bits: 384, label: 'ECDSA 384' },
  { algo: 'ecdsa', bits: 521, label: 'ECDSA 521' },
  { algo: 'rsa', bits: 2048, label: 'RSA 2048' },
  { algo: 'rsa', bits: 3072, label: 'RSA 3072' },
  { algo: 'rsa', bits: 4096, label: 'RSA 4096' }
]

export function pickAlgo(previous?: AlgoSpec, rng: () => number = Math.random): AlgoSpec {
  const candidates = previous ? POOL.filter(s => s.label !== previous.label) : POOL
  return candidates[Math.floor(rng() * candidates.length)]
}

function parseFingerprint(line: string): string {
  const hash = line.match(/\bSHA256:\S+/)?.[0] ?? line.trim()
  const type = line.match(/\(([^)]+)\)\s*$/)?.[1]
  return type ? `${hash} (${type})` : hash
}

export async function generateKey(spec: AlgoSpec): Promise<GeneratedKey> {
  const dir = await mkdtemp(join(tmpdir(), 'ssheveryday-'))
  const keyPath = join(dir, 'id')
  try {
    const args = ['-t', spec.algo, '-N', '', '-C', '', '-f', keyPath, '-q']
    if (spec.bits) args.push('-b', String(spec.bits))
    await run('ssh-keygen', args)

    const [privateKey, publicKey, lv] = await Promise.all([
      readFile(keyPath, 'utf8'),
      readFile(`${keyPath}.pub`, 'utf8'),
      run('ssh-keygen', ['-lvf', keyPath]).then(r => r.stdout)
    ])

    const lines = lv.split('\n')
    return {
      algo: spec.algo,
      label: spec.label,
      bits: spec.bits,
      privateKey: privateKey.trimEnd(),
      publicKey: publicKey.trimEnd(),
      fingerprint: parseFingerprint(lines[0] ?? ''),
      randomart: lines.slice(1).join('\n').trimEnd()
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
