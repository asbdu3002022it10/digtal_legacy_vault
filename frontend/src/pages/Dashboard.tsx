import { FormEvent, useEffect, useState } from 'react'
import { useVaultStore } from '@store/vaultStore'
import { VaultCard } from '@components/VaultCard'
import { CategoryAnimator } from '@components/CategoryAnimator'
import { getAuditLogs, AuditLog } from '@api/auditApi'
import { getNominees, Nominee } from '@api/nomineeApi'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { value: 'general',  label: 'General',          icon: '🗄️',  color: '#6366f1' },
  { value: 'bank',     label: 'Bank Details',      icon: '🏦',  color: '#10b981' },
  { value: 'media',    label: 'Photo / Video',     icon: '📸',  color: '#9333ea' },
  { value: 'document', label: 'Document',          icon: '📄',  color: '#3b82f6' },
  { value: 'message',  label: 'Personal Message',  icon: '💌',  color: '#f43f5e' },
]

export function Dashboard() {
  const { items, loading, error, fetchItems, addItem, uploadItem, downloadItem, removeItem } = useVaultStore()
  const [title, setTitle] = useState('')
  const [payload, setPayload] = useState('')
  const [category, setCategory] = useState('general')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [nominees, setNominees] = useState<Nominee[]>([])

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Calculate Security Score
  let score = 40
  const hasNominees = nominees.length > 0
  if (items.length > 0) score += 15
  if (hasNominees) score += 20
  if (nominees.some(n => n.status !== 'pending')) score += 15
  if (logs.length > 0) score += 10

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    fetchItems()
    getAuditLogs().then(setLogs).catch(() => {})
    getNominees().then(setNominees).catch(() => {})
  }, [fetchItems])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title) return
    if (!payload && !file) return
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

  const currentCat = CATEGORIES.find(c => c.value === category)

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Your encrypted vault</h1>
        <p className="text-xs text-slate-500">
          Store keys, account details, media, and last wishes. Everything is encrypted before it touches the database.
        </p>
      </header>

      {/* ── Security Score & Nominee Status ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nominee Widget */}
        <div className="rounded-xl border border-slate-800 bg-[#0f1621]/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">🛡️ Nominee Status</h2>
              <p className="text-xs text-slate-500">People who can access your vault</p>
            </div>
            <button
              onClick={() => navigate('/nominee-setup')}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Manage
            </button>
          </div>
          {nominees.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-xs text-yellow-400 font-medium">No nominees added</p>
                <p className="text-[11px] text-slate-500">Vault data will be inaccessible after you.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nominees.slice(0, 3).map(n => {
                const colors: Record<string, string> = {
                  pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                  accepted: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                  activated: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                }
                const icons: Record<string, string> = { pending: '⏳', accepted: '✅', activated: '🔓' }
                return (
                  <div key={n.id} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border ${colors[n.status] ?? colors.pending}`}>
                    <span>{icons[n.status] ?? '⏳'}</span>
                    <span className="font-medium truncate max-w-[80px]">{n.name || n.email.split('@')[0]}</span>
                  </div>
                )
              })}
              {nominees.length > 3 && <span className="text-xs text-slate-500 self-center">+{nominees.length - 3} more</span>}
            </div>
          )}
        </div>

        {/* Security Score Widget */}
        <div className="rounded-xl border border-slate-800 bg-[#0f1621]/60 p-4 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">🔐 Security Profile Score</h2>
              <p className="text-xs text-slate-500">Your vault protection metrics</p>
            </div>
            <span className={`text-xl font-bold ${score >= 90 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${score >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex justify-between">
            <span>{score >= 90 ? 'Excellent Security' : score >= 60 ? 'Good, but needs action' : 'Weak Security'}</span>
            {!hasNominees && <span className="text-yellow-400">Add a nominee to improve</span>}
          </p>
        </div>
      </div>

      {/* ── ADD TO VAULT FORM ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#080d15]/80 overflow-hidden shadow-xl">

        {/* Category selector tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-800/60 bg-black/20">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => { setCategory(cat.value); setPayload(''); setFile(null) }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-300 border-b-2 flex-shrink-0 ${
                category === cat.value
                  ? 'border-b-2 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              style={category === cat.value ? {
                borderBottomColor: cat.color,
                background: `linear-gradient(to bottom, ${cat.color}15, transparent)`,
                color: cat.color,
              } : {}}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category Animator — unique animated logos */}
        <div className="px-4 pt-4">
          <CategoryAnimator category={category} />
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-4 pt-2 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'bank'     ? 'e.g. Main HDFC Savings Account' :
                category === 'document' ? 'e.g. My Aadhaar Card' :
                category === 'media'    ? 'e.g. Family Photos 2024' :
                category === 'message'  ? 'e.g. Letter to my children' :
                'e.g. Important Notes'
              }
              className="w-full rounded-xl border border-slate-700/70 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] transition-all text-slate-100 placeholder:text-slate-600"
            />
          </div>

          {/* File or Text payload based on category */}
          {category === 'media' || category === 'document' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload File</label>
              <div
                className="relative rounded-xl border-2 border-dashed border-slate-700/60 bg-black/20 px-4 py-6 text-center hover:border-emerald-500/40 transition-all cursor-pointer group"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="text-3xl mb-2">{category === 'media' ? '📸' : '📄'}</div>
                <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {category === 'bank' ? 'Bank Account Details' :
                 category === 'message' ? 'Your Personal Message' :
                 'Secret Payload'}
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
                placeholder={
                  category === 'bank' ? 'Bank: HDFC\nAccount No: 1234567890\nIFSC: HDFC0001234\nCard: 4111 **** **** 1111\nCVV: ***' :
                  category === 'message' ? 'Write your personal message, last wishes, or any important notes...' :
                  'Paste notes, keys, passwords, or important instructions...'
                }
                className="w-full rounded-xl border border-slate-700/70 bg-black/40 px-4 py-3 text-sm outline-none focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] transition-all text-slate-100 placeholder:text-slate-600 resize-none font-mono leading-relaxed"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !title || (!payload && !file)}
            className="px-6 py-2.5 rounded-xl text-black text-sm font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            style={{
              background: submitting ? '#6b7280' : `linear-gradient(135deg, ${currentCat?.color ?? '#10b981'}, ${currentCat?.color ?? '#10b981'}dd)`,
              boxShadow: submitting ? 'none' : `0 0 20px ${currentCat?.color ?? '#10b981'}40`,
            }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
                Adding to vault…
              </span>
            ) : `${currentCat?.icon ?? '➕'} Add to Vault`}
          </button>
        </form>
      </div>

      {loading && <p className="text-xs text-slate-400 animate-pulse">Loading your vault…</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* ── Search and Filters ──────────────────────────────────── */}
      {(items.length > 0 || searchQuery !== '') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search vault items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black/40 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 text-slate-200 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 text-slate-200 shrink-0 transition-all"
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

      {/* ── Vault Items Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <VaultCard
            key={item.id}
            item={item}
            onDownload={() => downloadItem(item.id)}
            onDelete={() => removeItem(item.id)}
          />
        ))}
        {!loading && filteredItems.length === 0 && items.length > 0 && (
          <p className="text-xs text-slate-400 col-span-full py-6 text-center italic border border-dashed border-slate-800 rounded-xl">
            No items matching your search/filters.
          </p>
        )}
        {!loading && items.length === 0 && (
          <div className="col-span-full py-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <span className="text-4xl block mb-3">🗄️</span>
            <p className="text-sm text-slate-400 font-medium">Your vault is completely empty.</p>
            <p className="text-xs text-slate-600 mt-1">Start by securely adding your most critical accounts above.</p>
          </div>
        )}
      </div>

      {/* ── Activity Logs ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold">📋 Activity Logs</h2>
          <span className="text-xs text-slate-500">{logs.length} events</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-vault-card/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-black/20">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap">Action</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 capitalize font-semibold text-slate-200 whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {log.country ? `${log.country}, ${log.state}, ${log.district}` : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic text-xs">
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
