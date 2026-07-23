import type { CandidateProfile, LanguageReq, Opportunity } from '../types'

/**
 * Transparent, weighted rule-based matching.
 *
 * We deliberately avoid a black-box similarity model here: for a few thousand
 * opportunities a scored rule engine is faster, fully explainable ("why did
 * this rank first?"), and needs no infra. Each component returns 0..1 and is
 * weighted; the weights sum to 100. Where a real semantic layer would help
 * (free-text interests vs. long descriptions), the hook is marked below.
 *
 * The engine is i18n-agnostic: instead of English strings it returns a
 * `detailKey` (+ interpolation params) that the UI resolves via the translator.
 */

export type ReasonKey =
  | 'language'
  | 'field'
  | 'availability'
  | 'age'
  | 'duration'
  | 'interests'
  | 'programme'
  | 'region'

export interface MatchReason {
  key: ReasonKey
  ok: boolean
  weight: number
  detailKey: string
  params?: Record<string, string | number>
}

export interface MatchResult {
  opportunity: Opportunity
  score: number // 0..100
  reasons: MatchReason[]
  dealbreaker: boolean // hard constraint failed (age out of range)
}

interface Part {
  s: number
  detailKey: string
  params?: Record<string, string | number>
}

const LEVEL_RANK: Record<LanguageReq['level'], number> = {
  Basic: 1,
  Intermediate: 2,
  Fluent: 3,
  Native: 4,
}

export type Weights = Record<ReasonKey, number>

const WEIGHTS: Weights = {
  field: 28,
  language: 18,
  availability: 14,
  age: 12,
  duration: 10,
  interests: 9,
  programme: 5,
  region: 4,
}

export const DEFAULT_WEIGHTS: Weights = { ...WEIGHTS }

/** Rescale arbitrary slider values so they sum to 100 — keeps scores on a 0..100 scale. */
function normalizeWeights(w: Weights): Weights {
  const total = Object.values(w).reduce((a, b) => a + b, 0) || 1
  const factor = 100 / total
  const out = {} as Weights
  for (const key of Object.keys(w) as ReasonKey[]) out[key] = w[key] * factor
  return out
}

function languageScore(c: CandidateProfile, o: Opportunity): Part {
  if (o.requiredLanguages.length === 0) return { s: 1, detailKey: 'rd.lang.none' }
  const spoken = new Map(c.languages.map((l) => [l.name.toLowerCase(), LEVEL_RANK[l.level]]))
  let met = 0
  const missing: string[] = []
  for (const req of o.requiredLanguages) {
    const have = spoken.get(req.name.toLowerCase())
    if (have && have >= LEVEL_RANK[req.level]) met++
    else missing.push(req.name)
  }
  const s = met / o.requiredLanguages.length
  return s === 1
    ? { s, detailKey: 'rd.lang.all', params: { langs: o.requiredLanguages.map((l) => l.name).join(', ') } }
    : { s, detailKey: 'rd.lang.missing', params: { missing: missing.join(', ') } }
}

function fieldScore(c: CandidateProfile, o: Opportunity): Part {
  if (!c.fieldOfStudy) return { s: 0.5, detailKey: 'rd.field.none' }
  const match = o.fieldsOfStudy.some((f) => f.toLowerCase() === c.fieldOfStudy.toLowerCase())
  // partial credit for related keyword overlap (lightweight stand-in for semantic match)
  const words = c.fieldOfStudy.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3)
  const related =
    !match && o.fieldsOfStudy.some((f) => words.some((w) => f.toLowerCase().includes(w)))
  if (match) return { s: 1, detailKey: 'rd.field.preferred', params: { field: c.fieldOfStudy } }
  if (related) return { s: 0.6, detailKey: 'rd.field.related' }
  return { s: 0.15, detailKey: 'rd.field.different' }
}

function availabilityScore(c: CandidateProfile, o: Opportunity): Part {
  if (!c.availableFrom) return { s: 0.5, detailKey: 'rd.avail.none' }
  const from = new Date(c.availableFrom).getTime()
  const openFrom = new Date(o.applicationOpenFrom).getTime()
  const openTo = new Date(o.applicationOpenTo).getTime()
  if (from <= openTo && from >= openFrom - 45 * 86_400_000) {
    return { s: 1, detailKey: 'rd.avail.within' }
  }
  const gap = Math.min(Math.abs(from - openFrom), Math.abs(from - openTo)) / 86_400_000
  const s = Math.max(0, 1 - gap / 180)
  return { s, detailKey: s > 0.5 ? 'rd.avail.close' : 'rd.avail.outside' }
}

function ageScore(c: CandidateProfile, o: Opportunity): Part & { hard: boolean } {
  if (c.age === '') return { s: 0.5, hard: false, detailKey: 'rd.age.none' }
  const age = Number(c.age)
  if (age < o.minAge || age > o.maxAge) {
    return { s: 0, hard: true, detailKey: 'rd.age.requires', params: { min: o.minAge, max: o.maxAge } }
  }
  return { s: 1, hard: false, detailKey: 'rd.age.within', params: { min: o.minAge, max: o.maxAge } }
}

function durationScore(c: CandidateProfile, o: Opportunity): Part {
  if (!c.durationPreferenceWeeks) return { s: 0.7, detailKey: 'rd.dur.any' }
  const want = Number(c.durationPreferenceWeeks)
  const diff = Math.abs(o.durationWeeks - want)
  const s = Math.max(0, 1 - diff / Math.max(want, 12))
  return s > 0.7
    ? { s, detailKey: 'rd.dur.fits' }
    : { s, detailKey: 'rd.dur.mismatch', params: { duration: o.duration, want } }
}

function interestsScore(c: CandidateProfile, o: Opportunity): Part {
  if (c.interests.length === 0) return { s: 0.6, detailKey: 'rd.interest.none' }
  const oppSdgs = new Set(o.sdgs.map((s) => s.name))
  const overlap = c.interests.filter((i) => oppSdgs.has(i))
  const s = overlap.length ? Math.min(1, overlap.length / Math.min(c.interests.length, 2)) : 0.1
  return overlap.length
    ? { s, detailKey: 'rd.interest.shared', params: { overlap: overlap.join(', ') } }
    : { s, detailKey: 'rd.interest.no' }
}

export function scoreOpportunity(
  c: CandidateProfile,
  o: Opportunity,
  weights: Weights = DEFAULT_WEIGHTS,
): MatchResult {
  const W = normalizeWeights(weights)
  const lang = languageScore(c, o)
  const field = fieldScore(c, o)
  const avail = availabilityScore(c, o)
  const age = ageScore(c, o)
  const dur = durationScore(c, o)
  const interest = interestsScore(c, o)

  const progOk = c.programmePreference === 'any' || c.programmePreference === o.programme
  const regionOk = c.preferredRegions.length === 0 || c.preferredRegions.includes(o.location.region)

  const raw =
    lang.s * W.language +
    field.s * W.field +
    avail.s * W.availability +
    age.s * W.age +
    dur.s * W.duration +
    interest.s * W.interests +
    (progOk ? 1 : 0) * W.programme +
    (regionOk ? 1 : 0) * W.region

  // stipend preference nudges score without being a hard gate
  let score = raw
  if (c.wantsStipend && !o.benefits.stipend) score *= 0.9

  const reasons: MatchReason[] = [
    { key: 'language', ok: lang.s === 1, weight: Math.round(W.language), detailKey: lang.detailKey, params: lang.params },
    { key: 'field', ok: field.s >= 0.6, weight: Math.round(W.field), detailKey: field.detailKey, params: field.params },
    { key: 'availability', ok: avail.s >= 0.7, weight: Math.round(W.availability), detailKey: avail.detailKey, params: avail.params },
    { key: 'age', ok: age.s === 1, weight: Math.round(W.age), detailKey: age.detailKey, params: age.params },
    { key: 'duration', ok: dur.s >= 0.7, weight: Math.round(W.duration), detailKey: dur.detailKey, params: dur.params },
    { key: 'interests', ok: interest.s >= 0.5, weight: Math.round(W.interests), detailKey: interest.detailKey, params: interest.params },
    { key: 'programme', ok: progOk, weight: Math.round(W.programme), detailKey: progOk ? 'rd.prog.match' : 'rd.prog.diff' },
    { key: 'region', ok: regionOk, weight: Math.round(W.region), detailKey: regionOk ? 'rd.region.pref' : 'rd.region.outside' },
  ]

  return {
    opportunity: o,
    score: Math.round(Math.min(100, score)),
    reasons,
    dealbreaker: age.hard,
  }
}

export function rankOpportunities(
  c: CandidateProfile,
  list: Opportunity[],
  weights: Weights = DEFAULT_WEIGHTS,
): MatchResult[] {
  return list
    .map((o) => scoreOpportunity(c, o, weights))
    .sort((a, b) => {
      if (a.dealbreaker !== b.dealbreaker) return a.dealbreaker ? 1 : -1
      return b.score - a.score
    })
}

export const MATCH_WEIGHTS = WEIGHTS
