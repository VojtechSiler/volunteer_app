import raw from '../data/opportunities.json'
import type { Opportunity } from '../types'

export const OPPORTUNITIES = raw as unknown as Opportunity[]

export function getOpportunity(id: number): Opportunity | undefined {
  return OPPORTUNITIES.find((o) => o.id === id)
}

function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export const FACETS = {
  countries: uniqSorted(OPPORTUNITIES.map((o) => o.location.country)),
  regions: uniqSorted(OPPORTUNITIES.map((o) => o.location.region)),
  languages: uniqSorted(OPPORTUNITIES.flatMap((o) => o.requiredLanguages.map((l) => l.name))),
  fields: uniqSorted(OPPORTUNITIES.flatMap((o) => o.fieldsOfStudy)),
  sdgs: uniqSorted(OPPORTUNITIES.flatMap((o) => o.sdgs.map((s) => s.name))),
  durations: uniqSorted(OPPORTUNITIES.map((o) => o.duration)),
}

export const ALL_LANGUAGES = uniqSorted([
  ...FACETS.languages,
  'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Mandarin',
  'Italian', 'Russian', 'Turkish', 'Vietnamese', 'Hindi', 'Japanese',
])
