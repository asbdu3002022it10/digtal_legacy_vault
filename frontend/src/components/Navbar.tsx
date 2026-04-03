import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-emerald-400 font-semibold'
      : 'text-slate-300 hover:text-white'

  const closeMenu = () => setMenuOpen(false)

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
    closeMenu()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-black/70 backdrop-blur-md">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0" onClick={closeMenu}>
          <span className="h-8 w-8 rounded-full border border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            DL
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-white text-sm">Digital Legacy Vault</span>
            <span className="text-[10px] text-slate-500 hidden sm:block">Secure after-life access</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/nominee-setup" className={isActive('/nominee-setup')}>Nominees</Link>
            </>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 text-slate-200 hover:border-red-500/60 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-slate-300 transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-5 bg-slate-300 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-slate-300 transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-black/90 backdrop-blur-md px-4 py-4 space-y-3">
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={`block text-sm py-2 ${isActive('/dashboard')}`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/nominee-setup"
                onClick={closeMenu}
                className={`block text-sm py-2 ${isActive('/nominee-setup')}`}
              >
                🛡️ Nominees
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm py-2 text-red-400 hover:text-red-300 transition-colors"
            >
              🚪 Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="block text-center text-sm py-2.5 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
