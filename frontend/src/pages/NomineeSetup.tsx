import { FormEvent, useEffect, useState } from 'react'
import { getNominees, addNominee, deleteNominee, Nominee, NomineeCreate } from '@api/nomineeApi'

const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Father', 'Mother', 'Son', 'Daughter',
  'Brother', 'Sister', 'Friend', 'Lawyer', 'Other',
]

const CATEGORY_OPTIONS = [
  { value: 'all', label: '🔓 All Categories' },
  { value: 'bank', label: '🏦 Bank Details' },
  { value: 'document', label: '📄 Documents' },
  { value: 'media', label: '🖼️ Photos & Videos' },
  { value: 'message', label: '💬 Personal Messages' },
  { value: 'general', label: '📋 General' },
]

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  accepted:  'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  activated: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
}

const STATUS_ICONS: Record<string, string> = {
  pending: '⏳',
  accepted: '✅',
  activated: '🔓',
}

function NomineeCard({ nominee, onDelete }: { nominee: Nominee; onDelete: () => void }) {
  const cats = nominee.allowed_categories === 'all' || !nominee.allowed_categories
    ? 'All Categories'
    : nominee.allowed_categories.split(',').join(', ')

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f1621]/80 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-lg font-bold text-white border border-slate-700">
            {(nominee.name || nominee.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-100 text-sm">{nominee.name || nominee.email}</p>
            <p className="text-xs text-slate-400">{nominee.email}</p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${STATUS_COLORS[nominee.status] ?? STATUS_COLORS.pending}`}>
          {STATUS_ICONS[nominee.status]} {nominee.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        {nominee.relationship && (
          <div>
            <span className="text-slate-500">Relationship</span>
            <p className="text-slate-200 font-medium">{nominee.relationship}</p>
          </div>
        )}
        {nominee.phone && (
          <div>
            <span className="text-slate-500">Phone</span>
            <p className="text-slate-200 font-medium">{nominee.phone}</p>
          </div>
        )}
        <div className="col-span-2">
          <span className="text-slate-500">Access to</span>
          <p className="text-slate-200 font-medium capitalize">{cats}</p>
        </div>
        {nominee.accepted_at && (
          <div className="col-span-2">
            <span className="text-slate-500">Accepted on</span>
            <p className="text-slate-200 font-medium">{new Date(nominee.accepted_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {nominee.instructions && (
        <div className="rounded-lg bg-black/30 border border-slate-700/50 p-3">
          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">📝 Instructions</p>
          <p className="text-xs text-slate-300 leading-relaxed">{nominee.instructions}</p>
        </div>
      )}

      <button
        onClick={onDelete}
        className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg py-1.5 transition-colors border border-red-500/20"
      >
        Remove Nominee
      </button>
    </div>
  )
}

export function NomineeSetup() {
  const [nominees, setNominees] = useState<Nominee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [selectedCats, setSelectedCats] = useState<string[]>(['all'])
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    loadNominees()
  }, [])

  async function loadNominees() {
    setLoading(true)
    try {
      const data = await getNominees()
      setNominees(data)
    } finally {
      setLoading(false)
    }
  }

  function toggleCategory(val: string) {
    if (val === 'all') {
      setSelectedCats(['all'])
      return
    }
    setSelectedCats(prev => {
      const withoutAll = prev.filter(c => c !== 'all')
      return withoutAll.includes(val)
        ? withoutAll.filter(c => c !== val)
        : [...withoutAll, val]
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const payload: NomineeCreate = {
        name,
        email,
        phone: phone || undefined,
        relationship: relationship || undefined,
        allowed_categories: selectedCats.join(','),
        instructions: instructions || undefined,
      }
      await addNominee(payload)
      setMessage(`✅ ${email} has been added as a nominee. A confirmation email has been sent to them.`)
      setName(''); setEmail(''); setPhone(''); setRelationship('')
      setSelectedCats(['all']); setInstructions('')
      setShowForm(false)
      await loadNominees()
    } catch (err: any) {
      setMessage(`❌ ${err?.response?.data?.detail ?? 'Failed to add nominee.'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this nominee?')) return
    await deleteNominee(id)
    await loadNominees()
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Nominee Management</h1>
        <p className="text-xs text-slate-400">
          Designate trusted people who can access your vault when you're no longer active.
          They'll receive an email confirmation and must accept the responsibility.
        </p>
      </header>

      {/* Status legend */}
      <div className="flex gap-3 flex-wrap text-[10px]">
        <span className={`px-2 py-1 rounded-full ${STATUS_COLORS.pending}`}>⏳ Pending — Invite sent, awaiting acceptance</span>
        <span className={`px-2 py-1 rounded-full ${STATUS_COLORS.accepted}`}>✅ Accepted — Confirmed by nominee</span>
        <span className={`px-2 py-1 rounded-full ${STATUS_COLORS.activated}`}>🔓 Activated — Has vault access</span>
      </div>

      {/* Message */}
      {message && (
        <p className="text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-emerald-300">
          {message}
        </p>
      )}

      {/* Nominee List */}
      {loading ? (
        <p className="text-xs text-slate-400">Loading nominees…</p>
      ) : (
        <div className="space-y-3">
          {nominees.map(n => (
            <NomineeCard key={n.id} nominee={n} onDelete={() => handleDelete(n.id)} />
          ))}
          {nominees.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
              <p className="text-3xl mb-2">🛡️</p>
              <p className="text-sm text-slate-400">No nominees added yet.</p>
              <p className="text-xs text-slate-600 mt-1">Add trusted people who can unlock your vault.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Nominee Toggle */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
        >
          + Add New Nominee
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-700 bg-[#0f1621]/80 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-100">New Nominee Details</h2>

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-sm">
              <label className="block text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya Devi"
                className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-100"
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="block text-slate-300">Email Address <span className="text-red-400">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nominee@example.com"
                className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-100"
              />
            </div>
          </div>

          {/* Phone + Relationship */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-sm">
              <label className="block text-slate-300">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-100"
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="block text-slate-300">Relationship</label>
              <select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-100"
              >
                <option value="">Select relationship</option>
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Access */}
          <div className="space-y-2 text-sm">
            <label className="block text-slate-300">Vault Access — What can they see?</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleCategory(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    selectedCats.includes(opt.value)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1 text-sm">
            <label className="block text-slate-300">Instructions / Last Note to Nominee</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. The bank locker key is in my study. Please contact our family lawyer first."
              className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Add Nominee & Send Invite'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
