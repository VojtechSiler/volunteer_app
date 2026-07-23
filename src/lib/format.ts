import type { Opportunity, Programme } from '../types'

export const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€', USD: '$', GBP: '£',
}

type Translator = (key: string, vars?: Record<string, string | number>) => string

export function formatSalary(s: Opportunity['salary'], t?: Translator): string {
  if (!s) return t ? t('salary.unpaid') : 'Unpaid / volunteer'
  const sym = CURRENCY_SYMBOL[s.currency] ?? s.currency + ' '
  const period = t ? t('unit.month') : s.period
  return `${sym}${s.amount.toLocaleString()} / ${period}`
}

export function formatDate(iso: string, locale?: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysUntil(iso: string, today = new Date()): number {
  const d = new Date(iso + 'T00:00:00')
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

export const PROGRAMME_META: Record<Programme, { label: string; color: string; soft: string; short: string }> = {
  'global-volunteer': { label: 'Global Volunteer', short: 'Volunteer', color: 'var(--fit)', soft: 'var(--fit-soft)' },
  'global-talent': { label: 'Global Talent', short: 'Talent', color: 'var(--primary)', soft: 'var(--primary-soft)' },
  'global-teacher': { label: 'Global Teacher', short: 'Teacher', color: 'var(--coral)', soft: 'var(--coral-soft)' },
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
}

/** Pick black or white text for legible contrast on a solid hex background. */
export function readableTextOn(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#10233a' : '#ffffff'
}

export function flagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍'
  const A = 0x1f1e6
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split('').map((c) => A + c.charCodeAt(0) - 65),
  )
}
