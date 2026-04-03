import { create } from 'zustand'
import type { VaultItem, VaultItemCreate, VaultItemUpdate } from '@api/vaultApi'
import { getVaultItems, createVaultItem, updateVaultItem, deleteVaultItem, uploadVaultFile, downloadVaultFile } from '@api/vaultApi'

interface VaultState {
  items: VaultItem[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  addItem: (input: VaultItemCreate) => Promise<void>
  uploadItem: (form: FormData) => Promise<void>
  downloadItem: (id: number) => Promise<void>
  editItem: (id: number, input: VaultItemUpdate) => Promise<void>
  removeItem: (id: number) => Promise<void>
}


export const useVaultStore = create<VaultState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  async fetchItems() {
    set({ loading: true, error: null })
    try {
      const data = await getVaultItems()
      set({ items: data, loading: false })
    } catch (e) {
      set({ error: 'Failed to load vault items', loading: false })
    }
  },
  async addItem(input) {
    try {
      const created = await createVaultItem(input)
      set({ items: [created, ...get().items] })
    } catch {
      set({ error: 'Failed to create item' })
    }
  },
  async uploadItem(form: FormData) {
    try {
      const created = await uploadVaultFile(form)
      set({ items: [created, ...get().items] })
    } catch {
      set({ error: 'Failed to upload item' })
    }
  },
  async downloadItem(id: number) {
    try {
      const blob = await downloadVaultFile(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Provide a generic or item-specific filename. The API doesn't return the filename right now,
      // it is set in Content-Disposition if we read headers, but window.open or a.download is easier.
      // Easiest is to just set download='file' or let browser handle it via Content-Disposition headers.
      // But fetch blob strips headers without extra work, so let's default to vault_file.
      a.download = 'vault_file' 
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      set({ error: 'Failed to download item' })
    }
  },
  async editItem(id, input) {
    try {
      const updated = await updateVaultItem(id, input)
      set({
        items: get().items.map((it) => (it.id === id ? updated : it)),
      })
    } catch {
      set({ error: 'Failed to update item' })
    }
  },
  async removeItem(id) {
    try {
      await deleteVaultItem(id)
      set({
        items: get().items.filter((it) => it.id !== id),
      })
    } catch {
      set({ error: 'Failed to delete item' })
    }
  },
}))

