import axios from 'axios'

function normalizeBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`
}

const envBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL?.trim() || import.meta.env.VITE_API_URL?.trim(),
)
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)

const fallbackBaseUrl = isLocalhost
  ? 'http://localhost:8000/api'
  : 'https://digtal-legacy-vault.onrender.com/api'

const client = axios.create({
  baseURL: envBaseUrl ?? fallbackBaseUrl,
})

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken') ?? localStorage.getItem('accessToken')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client

