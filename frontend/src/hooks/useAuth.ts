import { useEffect } from 'react'
import { useAuthStore } from '@store/authStore'

export function useAuth() {
  const { accessToken, isAuthenticated, isHydrated, hydrate, logout, setToken } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return {
    accessToken,
    isAuthenticated,
    isHydrated,
    logout,
    setToken,
  }
}
