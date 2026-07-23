import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CandidateProfile } from '../types'
import { useAuth } from './auth'

/**
 * Saved candidates are kept **in memory only** — never written to a database
 * or localStorage. This avoids storing candidates' personal data at rest
 * (GDPR). A recruiter can save and switch between people during a session;
 * everything is cleared on refresh, sign-out, or switching account.
 */

export interface SavedCandidate {
  id: string
  name: string
  profile: CandidateProfile
  updatedAt: number
}

interface CandidatesValue {
  candidates: SavedCandidate[]
  save: (profile: CandidateProfile, id?: string) => Promise<string>
  remove: (id: string) => Promise<void>
  get: (id: string) => SavedCandidate | undefined
}

const Ctx = createContext<CandidatesValue | null>(null)

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'c_' + Math.abs(Date.now() ^ (performance.now() * 1000)).toString(36)
}

export function CandidatesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<SavedCandidate[]>([])

  // Clear the in-memory list on sign-in/out so no data carries between users.
  useEffect(() => {
    setCandidates([])
  }, [user])

  const save = useCallback(async (profile: CandidateProfile, id?: string) => {
    const name = profile.fullName.trim() || 'Unnamed candidate'
    const resultId = id ?? newId()
    setCandidates((prev) => {
      const entry: SavedCandidate = { id: resultId, name, profile, updatedAt: Date.now() }
      const exists = id ? prev.some((c) => c.id === id) : false
      return exists ? prev.map((c) => (c.id === id ? entry : c)) : [entry, ...prev]
    })
    return resultId
  }, [])

  const remove = useCallback(async (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const get = useCallback((id: string) => candidates.find((c) => c.id === id), [candidates])

  const value = useMemo(
    () => ({ candidates, save, remove, get }),
    [candidates, save, remove, get],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCandidates(): CandidatesValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCandidates must be used within CandidatesProvider')
  return ctx
}
