import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CategoryAnimator } from '@components/CategoryAnimator'
import { VaultCard } from '@components/VaultCard'
import { beginPasskeyRegistration, finishPasskeyRegistration, getPasskeyStatus } from '@api/authApi'
import { AuditLog, getAuditLogs } from '@api/auditApi'
import { getNominees, Nominee } from '@api/nomineeApi'
import { useVaultStore } from '@store/vaultStore'
import { browserSupportsPasskeys, createPasskeyCredential } from '@utils/passkey'

const CATEGORIES = [
  { value: 'general', label: 'General', icon: '🗄️', color: '#6366f1' },
  { value: 'bank', label: 'Bank Details', icon: '🏦', color: '#10b981' },
  { value: 'media', label: 'Photo / Video', icon: '📸', color: '#9333ea' },
  { value: 'document', label: 'Document', icon: '📄', color: '#3b82f6' },
  { value: 'message', label: 'Personal Message', icon: '💌', color: '#f43f5e' },
]

export function Dashboard() {
  const { items, loading, error, fetchItems, addItem, uploadItem, downloadItem, removeItem } = useVaultStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [payload, setPayload] = useState('')
  const [category, setCategory] = useState('general')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [nominees, setNominees] = useState<Nominee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [passkeyRegistered, setPasskeyRegistered] = useState(false)
  const [passkeyBusy, setPasskeyBusy] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [passkeyPromptDismissed, setPasskeyPromptDismissed] = useState(false)

  const passkeySupported = browserSupportsPasskeys()

  let score = 40
  const hasNominees = nominees.length > 0
  if (items.length > 0) score += 15
  if (hasNominees) score += 20
  if (nominees.some((nominee) => nominee.status !== 'pending')) score += 15
  if (logs.length > 0) score += 10

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    fetchItems()
    getAuditLogs().then(setLogs).catch(() => {})
    getNominees().then(setNominees).catch(() => {})
  }, [fetchItems])

  useEffect(() => {
    if (!passkeySupported) return

    getPasskeyStatus()
      .then(({ passkey_registered }) => {
        setPasskeyRegistered(passkey_registered)
        if (passkey_registered) {
          localStorage.setItem('vault_passkey_ready', 'true')
        }
      })
      .catch(() => {})
  }, [passkeySupported])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title || (!payload && !file)) return

    setSubmitting(true)
    if (file) {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('category', category)
      formData.append('file', file)
      await uploadItem(formData)
    } else {
      await addItem({ title, category, payload })
    }

    setTitle('')
    setPayload('')
    setFile(null)
    setSubmitting(false)
  }

  async function handleRegisterPasskey() {
    setPasskeyBusy(true)
    setPasskeyError(null)

    try {
      const options = await beginPasskeyRegistration()
      const credential = await createPasskeyCredential(options)
      await finishPasskeyRegistration(credential)
      localStorage.setItem('vault_passkey_ready', 'true')
      setPasskeyRegistered(true)
      setPasskeyPromptDismissed(true)
    } catch (err: any) {
      setPasskeyError(err?.response?.data?.detail || err?.message || 'Fingerprint registration failed')
    } finally {
      setPasskeyBusy(false)
    }
  }

  const currentCat = CATEGORIES.find((item) => item.value === category)

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Your encrypted vault</h1>
        <p className="text-xs text-slate-500">
          Store keys, account details, media, and last wishes. Everything is encrypted before it touches the database.
        </p>
      </header>

      {passkeySupported && !passkeyRegistered && !passkeyPromptDismissed && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-300">Register fingerprint for faster next login</p>
              <p className="text-xs text-slate-400">
                Indha device-la oru thadavai register pannina, next time fingerprint mattum use panni direct-a login pannalaam.
              </p>
              {passkeyError && <p className="text-xs text-red-400">{passkeyError}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRegisterPasskey}
                disabled={passkeyBusy}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-60"
              >
                {passkeyBusy ? 'Registering...' : 'Register Fingerprint'}
              </button>
              <button
                type="button"
                onClick={() => setPasskeyPromptDismissed(true)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#0f1621]/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">🛡️ Nominee Status</h2>
              <p className="text-xs text-slate-500">People who can access your vault</p>
            </div>
            <button
              onClick={() => navigate('/nominee-setup')}
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              Manage
            </button>
          </div>
          {nominees.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-xs font-medium text-yellow-400">No nominees added</p>
                <p className="text-[11px] text-slate-500">Vault data will be inaccessible after you.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nominees.slice(0, 3).map((nominee) => {
                const colors: Record<string, string> = {
                  pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                  accepted: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                  activated: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                }
                const icons: Record<string, string> = {
                  pending: '⏳',
                  accepted: '✅',
                  activated: '🔓',
                }
                return (
                  <div
                    key={nominee.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${colors[nominee.status] ?? colors.pending}`}
                  >
                    <span>{icons[nominee.status] ?? '⏳'}</span>
                    <span className="max-w-[80px] truncate font-medium">{nominee.name || nominee.email.split('@')[0]}</span>
                  </div>
                )
              })}
              {nominees.length > 3 && <span className="self-center text-xs text-slate-500">+{nominees.length - 3} more</span>}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-[#0f1621]/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">🔐 Security Profile Score</h2>
              <p className="text-xs text-slate-500">Your vault protection metrics</p>
            </div>
            <span className={`text-xl font-bold ${score >= 90 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${score >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-3 flex justify-between text-[10px] text-slate-400">
            <span>{score >= 90 ? 'Excellent Security' : score >= 60 ? 'Good, but needs action' : 'Weak Security'}</span>
            {!hasNominees && <span className="text-yellow-400">Add a nominee to improve</span>}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#080d15]/80 shadow-xl">
        <div className="flex overflow-x-auto border-b border-slate-800/60 bg-black/20 scrollbar-hide">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setCategory(item.value)
                setPayload('')
                setFile(null)
              }}
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold transition-all duration-300 ${
                category === item.value ? 'text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              style={
                category === item.value
                  ? {
                      borderBottomColor: item.color,
                      background: `linear-gradient(to bottom, ${item.color}15, transparent)`,
                      color: item.color,
                    }
                  : undefined
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="px-4 pt-4">
          <CategoryAnimator category={category} />
        </div>

        <form onSubmit={handleCreate} className="space-y-4 p-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'bank'
                  ? 'e.g. Main HDFC Savings Account'
                  : category === 'document'
                    ? 'e.g. My Aadhaar Card'
                    : category === 'media'
                      ? 'e.g. Family Photos 2024'
                      : category === 'message'
                        ? 'e.g. Letter to my children'
                        : 'e.g. Important Notes'
              }
              className="w-full rounded-xl border border-slate-700/70 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
            />
          </div>

          {category === 'media' || category === 'document' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Upload File</label>
              <div
                className="group relative cursor-pointer rounded-xl border-2 border-dashed border-slate-700/60 bg-black/20 px-4 py-6 text-center transition-all hover:border-emerald-500/40"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="mb-2 text-3xl">{category === 'media' ? '📸' : '📄'}</div>
                <p className="text-sm text-slate-400 transition-colors group-hover:text-slate-200">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-[10px] text-slate-600">
                  {category === 'media' ? 'JPG, PNG, MP4, MOV' : 'PDF, DOC, JPG, PNG'}
                </p>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept={category === 'media' ? 'image/*,video/*' : '.pdf,.doc,.docx,image/*'}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {category === 'bank' ? 'Bank Account Details' : category === 'message' ? 'Your Personal Message' : 'Secret Payload'}
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
                placeholder={
                  category === 'bank'
                    ? 'Bank: HDFC\nAccount No: 1234567890\nIFSC: HDFC0001234\nCard: 4111 **** **** 1111\nCVV: ***'
                    : category === 'message'
                      ? 'Write your personal message, last wishes, or any important notes...'
                      : 'Paste notes, keys, passwords, or important instructions...'
                }
                className="w-full resize-none rounded-xl border border-slate-700/70 bg-black/40 px-4 py-3 font-mono text-sm leading-relaxed text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !title || (!payload && !file)}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-black transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            style={{
              background: submitting ? '#6b7280' : `linear-gradient(135deg, ${currentCat?.color ?? '#10b981'}, ${(currentCat?.color ?? '#10b981')}dd)`,
              boxShadow: submitting ? 'none' : `0 0 20px ${(currentCat?.color ?? '#10b981')}40`,
            }}
          >
            {submitting ? 'Adding to vault...' : `${currentCat?.icon ?? '➕'} Add to Vault`}
          </button>
        </form>
      </div>

      {loading && <p className="animate-pulse text-xs text-slate-400">Loading your vault...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {(items.length > 0 || searchQuery !== '') && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search vault items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all focus:border-emerald-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="shrink-0 rounded-xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="bank">🏦 Banks & Financial</option>
            <option value="document">📄 Documents</option>
            <option value="media">📸 Photos & Media</option>
            <option value="message">💌 Personal Messages</option>
            <option value="general">🗄️ General Notes</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredItems.map((item) => (
          <VaultCard
            key={item.id}
            item={item}
            onDownload={() => downloadItem(item.id)}
            onDelete={() => removeItem(item.id)}
          />
        ))}
        {!loading && filteredItems.length === 0 && items.length > 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-slate-800 py-6 text-center text-xs italic text-slate-400">
            No items matching your search/filters.
          </p>
        )}
        {!loading && items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 py-10 text-center">
            <span className="mb-3 block text-4xl">🗄️</span>
            <p className="text-sm font-medium text-slate-400">Your vault is completely empty.</p>
            <p className="mt-1 text-xs text-slate-600">Start by securely adding your most critical accounts above.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">📋 Activity Logs</h2>
          <span className="text-xs text-slate-500">{logs.length} events</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-vault-card/40">
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-black/20 text-slate-400">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wider">Action</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wider">Location</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wider">Timestamp</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 transition-colors last:border-0 hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold capitalize text-slate-200">{log.action}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {log.country ? `${log.country}, ${log.state}, ${log.district}` : 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs italic text-slate-500">
                      No activity logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
