import client from './client'

export interface VaultItem {
  id: number
  title: string
  category: string
  file_path?: string
  created_at: string
  updated_at: string
}

export interface VaultItemCreate {
  title: string
  category: string
  payload?: string
}

export interface VaultItemUpdate {
  title?: string
  category?: string
  payload?: string
}

export async function getVaultItems(): Promise<VaultItem[]> {
  const { data } = await client.get<VaultItem[]>('/vault/')
  return data
}

export async function createVaultItem(input: VaultItemCreate): Promise<VaultItem> {
  const { data } = await client.post<VaultItem>('/vault/', input)
  return data
}

export async function uploadVaultFile(form: FormData): Promise<VaultItem> {
  const { data } = await client.post<VaultItem>('/vault/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateVaultItem(
  id: number,
  input: VaultItemUpdate,
): Promise<VaultItem> {
  const { data } = await client.put<VaultItem>(`/vault/${id}`, input)
  return data
}

export async function deleteVaultItem(id: number): Promise<void> {
  await client.delete(`/vault/${id}`)
}

export async function downloadVaultFile(id: number): Promise<Blob> {
  const { data } = await client.get(`/vault/${id}/download`, {
    responseType: 'blob'
  })
  return data
}

