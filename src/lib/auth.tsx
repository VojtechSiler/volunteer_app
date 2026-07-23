import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * Auth backed by Supabase. The public surface (register/login/logout/
 * changePassword + user/loading) is unchanged from the previous localStorage
 * version, so no components needed changing.
 *
 * Client-side validation throws i18n *keys* (resolved by the UI); Supabase's
 * own English errors are mapped to keys where we recognise them.
 */

export interface User {
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  changePassword: (current: string, next: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toUser(session: Session | null): User | null {
  const u = session?.user
  if (!u) return null
  const name = (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'User'
  return { name, email: u.email ?? '' }
}

function mapError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'err.badCredentials'
  if (m.includes('already registered') || m.includes('already exists')) return 'err.emailExists'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const em = email.trim().toLowerCase()
    if (!name.trim()) throw new Error('err.nameRequired')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw new Error('err.invalidEmail')
    if (password.length < 6) throw new Error('err.passwordShort')
    const { error } = await supabase.auth.signUp({
      email: em,
      password,
      options: { data: { name: name.trim() } },
    })
    if (error) throw new Error(mapError(error.message))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw new Error(mapError(error.message))
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) throw new Error('err.notSignedIn')
      if (next.length < 6) throw new Error('err.newPasswordShort')
      // Verify the current password by re-authenticating.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      })
      if (verifyError) throw new Error('err.currentWrong')
      const { error } = await supabase.auth.updateUser({ password: next })
      if (error) throw new Error(mapError(error.message))
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, loading, register, login, logout, changePassword }),
    [user, loading, register, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
