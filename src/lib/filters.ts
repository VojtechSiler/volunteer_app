import type { Opportunity, Programme } from '../types'

export interface Filters {
  q: string
  programmes: Programme[]
  regions: string[]
  countries: string[]
  languages: string[]
  fields: string[]
  sdgs: string[]
  maxDurationWeeks: number | null
  paidOnly: boolean
  accommodationOnly: boolean
  premiumOnly: boolean
  sort: 'relevance' | 'deadline' | 'applicants-asc' | 'applicants-desc' | 'duration'
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  programmes: [],
  regions: [],
  countries: [],
  languages: [],
  fields: [],
  sdgs: [],
  maxDurationWeeks: null,
  paidOnly: false,
  accommodationOnly: false,
  premiumOnly: false,
  sort: 'relevance',
}

export function countActive(f: Filters): number {
  return (
    f.programmes.length +
    f.regions.length +
    f.countries.length +
    f.languages.length +
    f.fields.length +
    f.sdgs.length +
    (f.maxDurationWeeks ? 1 : 0) +
    (f.paidOnly ? 1 : 0) +
    (f.accommodationOnly ? 1 : 0) +
    (f.premiumOnly ? 1 : 0)
  )
}

export function applyFilters(list: Opportunity[], f: Filters): Opportunity[] {
  const q = f.q.trim().toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)

  const filtered = list.filter((o) => {
    if (terms.length) {
      const haystack = [
        o.title,
        o.organization,
        o.location.city,
        o.location.country,
        o.description,
        o.category,
        ...o.fieldsOfStudy,
        ...o.sdgs.map((s) => s.name),
        ...o.requiredLanguages.map((l) => l.name),
      ]
        .join(' ')
        .toLowerCase()
      if (!terms.every((t) => haystack.includes(t))) return false
    }
    if (f.programmes.length && !f.programmes.includes(o.programme)) return false
    if (f.regions.length && !f.regions.includes(o.location.region)) return false
    if (f.countries.length && !f.countries.includes(o.location.country)) return false
    if (f.languages.length && !f.languages.every((l) => o.requiredLanguages.some((r) => r.name === l)))
      return false
    if (f.fields.length && !f.fields.some((x) => o.fieldsOfStudy.includes(x))) return false
    if (f.sdgs.length && !f.sdgs.some((s) => o.sdgs.some((os) => os.name === s))) return false
    if (f.maxDurationWeeks && o.durationWeeks > f.maxDurationWeeks) return false
    if (f.paidOnly && !o.benefits.stipend) return false
    if (f.accommodationOnly && !o.benefits.accommodation) return false
    if (f.premiumOnly && !o.isPremium) return false
    return true
  })

  const sorted = [...filtered]
  switch (f.sort) {
    case 'deadline':
      sorted.sort((a, b) => a.applicationDeadline.localeCompare(b.applicationDeadline))
      break
    case 'applicants-asc':
      sorted.sort((a, b) => a.applicants - b.applicants)
      break
    case 'applicants-desc':
      sorted.sort((a, b) => b.applicants - a.applicants)
      break
    case 'duration':
      sorted.sort((a, b) => a.durationWeeks - b.durationWeeks)
      break
    default:
      // relevance: premium first, then fewer applicants (less competition), then soonest deadline
      sorted.sort((a, b) => {
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1
        if (a.applicants !== b.applicants) return a.applicants - b.applicants
        return a.applicationDeadline.localeCompare(b.applicationDeadline)
      })
  }
  return sorted
}
