import client from './client'

export interface Nominee {
  id: number
  user_id: number
  name?: string | null
  email: string
  phone?: string | null
  relationship?: string | null
  can_access: boolean
  status: string                    // 'pending' | 'accepted' | 'activated'
  allowed_categories?: string | null // 'all' or 'bank,document'
  instructions?: string | null
  accepted_at?: string | null
  created_at: string
  updated_at: string
}

export interface NomineeCreate {
  name?: string
  email: string
  phone?: string
  relationship?: string
  allowed_categories?: string
  instructions?: string
}

export async function getNominees(): Promise<Nominee[]> {
  const { data } = await client.get<Nominee[]>('/nominee/')
  return data
}

export async function addNominee(input: NomineeCreate): Promise<Nominee> {
  const { data } = await client.post<Nominee>('/nominee/', input)
  return data
}

export async function updateNominee(id: number, input: Partial<NomineeCreate>): Promise<Nominee> {
  const { data } = await client.put<Nominee>(`/nominee/${id}`, input)
  return data
}

export async function deleteNominee(id: number): Promise<void> {
  await client.delete(`/nominee/${id}`)
}

// Keep backward compat for existing code
export async function getNominee() {
  const list = await getNominees()
  return list[0] ?? null
}

export async function upsertNominee(input: { email: string; phone?: string }): Promise<Nominee> {
  return addNominee(input)
}
