import { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Navbar } from '@components/Navbar'
import { Landing } from '@pages/Landing'
import { Login } from '@pages/Login'
import { Dashboard } from '@pages/Dashboard'
import { NomineeSetup } from '@pages/NomineeSetup'
import { NomineeAccept } from '@pages/NomineeAccept'
import { IntroFlow } from '@components/IntroFlow'
import { useAuth } from '@hooks/useAuth'

// ── Route Guards ──────────────────────────────────────────────────

// Logged-in users → redirect to dashboard (skip landing/login)
function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isHydrated } = useAuth()
  if (!isHydrated) return null   // Wait for token check
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

// Not logged-in users → redirect to login
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isHydrated } = useAuth()
  if (!isHydrated) return null   // Wait for token check
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isHydrated } = useAuth()
  const [introDone, setIntroDone] = useState(() =>
    sessionStorage.getItem('vault_intro_done') === 'true'
  )

  // Wait until we know auth state before rendering anything
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a12]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="10" width="18" height="11" rx="2" />
              <path d="M7 10V7a5 5 0 1 1 10 0v3" />
            </svg>
          </div>
          <p className="text-xs text-slate-600 tracking-widest uppercase">Verifying session…</p>
        </div>
      </div>
    )
  }

  // Only show intro flow if NOT authenticated and haven't seen it
  if (!introDone && !isAuthenticated) {
    return (
      <IntroFlow
        onComplete={() => {
          sessionStorage.setItem('vault_intro_done', 'true')
          setIntroDone(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Routes>
          {/* Public-only: auto-redirect to /dashboard if already logged in */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <Landing />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Always public — nominee email invite */}
          <Route path="/nominee-accept/:token" element={<NomineeAccept />} />

          {/* Protected: auto-redirect to /login if not authenticated */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nominee-setup"
            element={
              <ProtectedRoute>
                <NomineeSetup />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
