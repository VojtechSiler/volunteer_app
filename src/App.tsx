import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { FullscreenLoader } from './components/ui'
import { AuthScreen } from './pages/AuthScreen'
import { Opportunities } from './pages/Opportunities'
import { OpportunityDetail } from './pages/OpportunityDetail'
import { Match } from './pages/Match'
import { Settings } from './pages/Settings'

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  return user ? <Navigate to="/opportunities" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><AuthScreen mode="login" /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><AuthScreen mode="register" /></PublicOnly>} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/match" element={<Match />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/opportunities" replace />} />
    </Routes>
  )
}
