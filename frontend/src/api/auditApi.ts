import client from './client'

export interface AuditLog {
  id: number
  user_id: number
  action: string
  timestamp: string
  ip_address?: string | null
  country?: string | null
  state?: string | null
  district?: string | null
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await client.get<AuditLog[]>('/audit/logs')
  return data
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout')
}
