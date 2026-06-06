import { bold, pre, join, Formatted } from '@puregram/markup'
import type { GeneratedKey } from './keygen.js'

export interface InlinePlan { mode: 'inline'; text: Formatted }
export interface FilePlan {
  mode: 'file'
  caption: Formatted
  privateKey: string
  filename: string
  followup: Formatted
}
export type RenderPlan = InlinePlan | FilePlan

const MESSAGE_LIMIT = 4096

function formatDate(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, month: 'short', day: '2-digit', year: 'numeric'
  }).formatToParts(date)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === t)?.value ?? ''
  return `${get('month').toLowerCase()} ${get('day')} ${get('year')}`
}

function section(label: string, body: string): Formatted {
  return join([bold(`${label}:`), pre(body)], '\n')
}

export function formatKey(key: GeneratedKey, date: Date, tz: string): RenderPlan {
  const title = bold(`ssh key of the day • ${formatDate(date, tz)}`)

  const text = join([
    title,
    section('private key', key.privateKey),
    section('public key', key.publicKey),
    section('fingerprint', key.fingerprint),
    pre(key.randomart)
  ], '\n\n')

  if (text.text.length <= MESSAGE_LIMIT) {
    return { mode: 'inline', text }
  }

  const caption = join([title, section('fingerprint', key.fingerprint)], '\n\n')
  const followup = join([section('public key', key.publicKey), pre(key.randomart)], '\n\n')

  return { mode: 'file', caption, privateKey: key.privateKey, filename: `id_${key.algo}`, followup }
}
