import { create } from 'zustand'
import type { TokenResponse } from '@api/authApi'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  setToken: (token: TokenResponse) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
  setToken: (token) => {
    sessionStorage.setItem('accessToken', token.access_token)
    set({ accessToken: token.access_token, isAuthenticated: true, isHydrated: true })
  },
  logout: () => {
    sessionStorage.removeItem('accessToken')
    // Keep intro_done so they don't see the intro again on next visit
    set({ accessToken: null, isAuthenticated: false, isHydrated: true })
  },
  hydrate: () => {
    const stored = sessionStorage.getItem('accessToken')
    if (stored) {
      set({ accessToken: stored, isAuthenticated: true, isHydrated: true })
    } else {
      set({ isHydrated: true })
    }
  },
}))
