import type { CandidateProfile, LanguageReq } from '../types'
import { ALL_LANGUAGES, FACETS } from './data'

/**
 * Turn a pasted CV / free-text description into a partial candidate profile.
 *
 * Two engines:
 *  - a dependency-free heuristic parser that always works offline, and
 *  - OpenAI, used automatically when VITE_OPENAI_API_KEY is set (falls back to
 *    the heuristic on any error).
 *
 * Swap OpenAI for a backend proxy in production — a browser-exposed key is fine
 * for this local prototype only.
 */

export interface ExtractResult {
  profile: Partial<CandidateProfile>
  found: string[] // field keys that were filled, for user feedback
  source: 'ai' | 'heuristic'
}

const LEVELS: LanguageReq['level'][] = ['Basic', 'Intermediate', 'Fluent', 'Native']
const DEGREES = ['High school', "Bachelor's", "Master's", 'PhD', 'Other']

const NATIONALITIES: Record<string, string> = {
  spanish: 'Spain', czech: 'Czech Republic', slovak: 'Slovakia', german: 'Germany',
  french: 'France', italian: 'Italy', portuguese: 'Portugal', brazilian: 'Brazil',
  indian: 'India', vietnamese: 'Vietnam', turkish: 'Turkiye', egyptian: 'Egypt',
  tunisian: 'Tunisia', romanian: 'Romania', polish: 'Poland', greek: 'Greece',
  mexican: 'Mexico', argentinian: 'Argentina', argentine: 'Argentina', peruvian: 'Peru',
  colombian: 'Colombia', chilean: 'Chile', japanese: 'Japan', korean: 'South Korea',
  nigerian: 'Nigeria', kenyan: 'Kenya', moroccan: 'Morocco', dutch: 'Netherlands',
  belgian: 'Belgium', hungarian: 'Hungary', indonesian: 'Indonesia', thai: 'Thailand',
  nepali: 'Nepal', azerbaijani: 'Azerbaijan', serbian: 'Serbia',
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

function detectLevel(window: string): LanguageReq['level'] {
  const w = window.toLowerCase()
  if (/native|mother ?tongue|rodil/.test(w)) return 'Native'
  if (/fluent|fluency|proficient|c1|c2|advanced/.test(w)) return 'Fluent'
  if (/basic|beginner|elementary|a1|a2/.test(w)) return 'Basic'
  if (/intermediate|b1|b2/.test(w)) return 'Intermediate'
  return 'Intermediate'
}

export function extractProfileHeuristic(text: string): ExtractResult {
  const profile: Partial<CandidateProfile> = {}
  const found: string[] = []
  const lower = text.toLowerCase()

  // name — first line that looks like a person's name
  const firstLine = text.split('\n').map((l) => l.trim()).find(Boolean) ?? ''
  if (/^[A-Za-zÀ-ÿ'’.-]+(?:\s+[A-Za-zÀ-ÿ'’.-]+){1,2}$/.test(firstLine) && firstLine.length <= 40) {
    profile.fullName = firstLine
    found.push('name')
  }

  // age
  const ageMatch =
    lower.match(/\b(1[6-9]|[23]\d)\s*(?:years?\s*old|y\.?o\.?|yrs?|let|rok[ůy]?)\b/) ||
    lower.match(/\bage[:\s]+(1[6-9]|[23]\d)\b/) ||
    lower.match(/\b(1[6-9]|[23]\d)[-\s]year[-\s]old\b/)
  if (ageMatch) {
    profile.age = Number(ageMatch[1])
    found.push('age')
  }

  // languages
  const langs: LanguageReq[] = []
  for (const name of ALL_LANGUAGES) {
    const idx = lower.indexOf(name.toLowerCase())
    if (idx !== -1) {
      const window = lower.slice(Math.max(0, idx - 25), idx + name.length + 25)
      langs.push({ name, level: detectLevel(window) })
    }
  }
  if (langs.length) {
    profile.languages = langs
    found.push('languages')
  }

  // field of study
  const field = FACETS.fields.find((f) => lower.includes(f.toLowerCase()))
  if (field) {
    profile.fieldOfStudy = field
    found.push('field')
  }

  // nationality
  let nationality = ''
  for (const [adj, country] of Object.entries(NATIONALITIES)) {
    if (new RegExp(`\\b${adj}\\b`).test(lower)) {
      nationality = country
      break
    }
  }
  if (!nationality) {
    const country = FACETS.countries.find((c) => lower.includes(c.toLowerCase()))
    if (country) nationality = country
  }
  if (nationality) {
    profile.nationality = nationality
    found.push('nationality')
  }

  // degree
  if (/phd|ph\.d|doctora|doktor/.test(lower)) profile.degreeLevel = 'PhD'
  else if (/master|msc|m\.a|magist/.test(lower)) profile.degreeLevel = "Master's"
  else if (/bachelor|bsc|b\.a|undergrad|bakal/.test(lower)) profile.degreeLevel = "Bachelor's"
  else if (/high ?school|secondary|středn|stredn/.test(lower)) profile.degreeLevel = 'High school'
  if (profile.degreeLevel) found.push('degree')

  // availability — ISO date or a full month name → first of that month in 2026
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) {
    profile.availableFrom = iso[0]
    found.push('availability')
  } else {
    let m = -1
    for (let i = 0; i < MONTHS.length; i++) {
      const mo = MONTHS[i]
      // "may" is also a common word — only accept it next to a day/year
      const re = mo === 'may' ? /\bmay\s+(?:\d{1,2}|20\d{2})\b/ : new RegExp(`\\b${mo}\\b`)
      if (re.test(lower)) {
        m = i
        break
      }
    }
    if (m !== -1) {
      profile.availableFrom = `2026-${String(m + 1).padStart(2, '0')}-01`
      found.push('availability')
    }
  }

  // stipend preference
  if (/\bpaid\b|salary|stipend|placen|plat[ei]/.test(lower)) {
    profile.wantsStipend = true
    found.push('paid')
  }

  return { profile, found, source: 'heuristic' }
}

/** Coerce arbitrary model output into valid, known enum values. */
function sanitize(raw: Record<string, unknown>): ExtractResult {
  const profile: Partial<CandidateProfile> = {}
  const found: string[] = []

  if (typeof raw.fullName === 'string' && raw.fullName.trim()) {
    profile.fullName = raw.fullName.trim()
    found.push('name')
  }
  if (typeof raw.nationality === 'string' && raw.nationality.trim()) {
    profile.nationality = raw.nationality.trim()
    found.push('nationality')
  }
  const age = Number(raw.age)
  if (Number.isFinite(age) && age >= 14 && age <= 60) {
    profile.age = age
    found.push('age')
  }
  if (Array.isArray(raw.languages)) {
    const langs: LanguageReq[] = []
    for (const item of raw.languages as unknown[]) {
      const obj = item as { name?: unknown; level?: unknown }
      const name = ALL_LANGUAGES.find(
        (l) => l.toLowerCase() === String(obj?.name ?? '').toLowerCase(),
      )
      if (!name) continue
      const level = LEVELS.includes(obj?.level as LanguageReq['level'])
        ? (obj!.level as LanguageReq['level'])
        : 'Intermediate'
      langs.push({ name, level })
    }
    if (langs.length) {
      profile.languages = langs
      found.push('languages')
    }
  }
  if (typeof raw.fieldOfStudy === 'string' && raw.fieldOfStudy.trim()) {
    const match = FACETS.fields.find(
      (f) => f.toLowerCase() === (raw.fieldOfStudy as string).toLowerCase(),
    )
    profile.fieldOfStudy = match ?? (raw.fieldOfStudy as string).trim()
    found.push('field')
  }
  if (typeof raw.degreeLevel === 'string') {
    const match = DEGREES.find((d) => d.toLowerCase() === (raw.degreeLevel as string).toLowerCase())
    if (match) {
      profile.degreeLevel = match
      found.push('degree')
    }
  }
  if (typeof raw.availableFrom === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.availableFrom)) {
    profile.availableFrom = raw.availableFrom
    found.push('availability')
  }
  if (typeof raw.wantsStipend === 'boolean' && raw.wantsStipend) {
    profile.wantsStipend = true
    found.push('paid')
  }

  return { profile, found, source: 'ai' }
}

async function extractProfileAI(text: string, apiKey: string): Promise<ExtractResult> {
  const model = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini'
  const system = [
    'You extract a candidate profile from a CV or free-text description for an',
    'exchange-opportunity matcher. Return ONLY a JSON object with these optional keys:',
    'fullName (string), nationality (country name in English), age (number),',
    'languages (array of {name, level}), fieldOfStudy (string), degreeLevel (string),',
    'availableFrom (YYYY-MM-DD), wantsStipend (boolean).',
    `Allowed language levels: ${LEVELS.join(', ')}.`,
    `Prefer these language names when present: ${ALL_LANGUAGES.join(', ')}.`,
    `Prefer these fields of study when they fit: ${FACETS.fields.join(', ')}.`,
    `Allowed degree levels: ${DEGREES.join(', ')}.`,
    'Omit any key you cannot determine with confidence. Do not invent values.',
  ].join(' ')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error('No content')
  return sanitize(JSON.parse(content))
}

export const aiExtractionEnabled = Boolean(import.meta.env.VITE_OPENAI_API_KEY)

export async function extractProfile(text: string): Promise<ExtractResult> {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (key) {
    try {
      const ai = await extractProfileAI(text, key)
      if (ai.found.length) return ai
    } catch (err) {
      console.warn('AI extraction failed, using heuristic parser:', err)
    }
  }
  return extractProfileHeuristic(text)
}
