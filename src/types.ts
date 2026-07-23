export type Programme = 'global-volunteer' | 'global-talent' | 'global-teacher'

export interface LanguageReq {
  name: string
  level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native'
}

export interface Sdg {
  name: string
  number: number
  color: string
}

export interface Salary {
  currency: string
  amount: number
  period: string
  type: string
}

export interface Location {
  city: string
  country: string
  countryCode: string
  region: string
  lat: number
  lng: number
}

export interface Opportunity {
  id: number
  url: string
  programme: Programme
  programmeLabel: string
  category: string
  isPremium: boolean
  isGlobalProject: boolean
  title: string
  organization: string
  location: Location
  duration: string
  durationWeeks: number
  description: string
  responsibilities: string[]
  programBenefits: string[]
  requiredLanguages: LanguageReq[]
  fieldsOfStudy: string[]
  minAge: number
  maxAge: number
  salary: Salary | null
  benefits: {
    accommodation: boolean
    food: boolean
    transport: boolean
    visaSupport: boolean
    stipend: boolean
  }
  workSchedule: string
  sdgs: Sdg[]
  applicants: number
  openings: number
  applicationOpenFrom: string
  applicationOpenTo: string
  applicationDeadline: string
  backgroundRequired: boolean
  logistics: {
    airportPickup: boolean
    orientationProvided: boolean
    weeklyHours: number
  }
}

/** A candidate profile used to rank opportunities. */
export interface CandidateProfile {
  fullName: string
  nationality: string
  age: number | ''
  languages: LanguageReq[]
  fieldOfStudy: string
  degreeLevel: string
  availableFrom: string          // ISO date
  durationPreferenceWeeks: number | ''  // 0 = any
  programmePreference: Programme | 'any'
  preferredRegions: string[]
  interests: string[]            // SDG names
  wantsStipend: boolean
}
