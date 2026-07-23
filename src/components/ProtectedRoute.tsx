import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../lib/auth'
import { FullscreenLoader } from './ui'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullscreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}
