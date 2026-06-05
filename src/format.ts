import type { GeneratedKey } from './keygen.js'

export interface InlinePlan { mode: 'inline'; text: string }
export interface FilePlan {
  mode: 'file'
  caption: string
  privateKey: string
  filename: string
  followup: string
}
export type RenderPlan = InlinePlan | FilePlan

const MESSAGE_LIMIT = 4096

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatDate(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, month: 'short', day: '2-digit', year: 'numeric'
  }).formatToParts(date)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === t)?.value ?? ''
  return `${get('month').toLowerCase()} ${get('day')} ${get('year')}`
}

export function formatKey(key: GeneratedKey, date: Date, tz: string): RenderPlan {
  const dateStr = formatDate(date, tz)
  const title = `<b>ssh key of the day • ${dateStr}</b>`

  const text = [
    title,
    '',
    '<b>private key:</b>',
    `<pre>${esc(key.privateKey)}</pre>`,
    '',
    '<b>public key:</b>',
    `<pre>${esc(key.publicKey)}</pre>`,
    '',
    '<b>fingerprint:</b>',
    `<pre>${esc(key.fingerprint)}</pre>`,
    '',
    `<pre>${esc(key.randomart)}</pre>`
  ].join('\n')

  if (text.length <= MESSAGE_LIMIT) {
    return { mode: 'inline', text }
  }

  const caption = [
    title,
    '',
    '<b>fingerprint:</b>',
    `<pre>${esc(key.fingerprint)}</pre>`
  ].join('\n')

  const followup = [
    '<b>public key:</b>',
    `<pre>${esc(key.publicKey)}</pre>`,
    '',
    `<pre>${esc(key.randomart)}</pre>`
  ].join('\n')

  return { mode: 'file', caption, privateKey: key.privateKey, filename: `id_${key.algo}`, followup }
}
