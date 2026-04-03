import type { VaultItem } from '@api/vaultApi'

interface Props {
  item: VaultItem
  onEdit?: () => void
  onDelete?: () => void
  onDownload?: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  bank: '🏦',
  media: '🖼️',
  document: '📄',
  message: '💬',
  general: '📋',
}

export function VaultCard({ item, onEdit, onDelete, onDownload }: Props) {
  const icon = CATEGORY_ICONS[item.category] ?? '🔐'

  return (
    <div className="rounded-xl border border-slate-800 bg-vault-card/80 p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{item.title}</h3>
            <span className="text-xs text-emerald-400 capitalize">{item.category}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
          {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
        </span>
      </div>

      {/* Preview */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {item.file_path
          ? '📎 File attached — protected by DOB password when downloaded.'
          : '🔒 Contents are end-to-end encrypted. Only you (or your nominee) can decrypt.'}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/60">
        {onDownload && item.file_path && (
          <button
            onClick={onDownload}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-sky-500/40 text-sky-300 hover:border-sky-400 hover:bg-sky-500/5 transition-colors text-center"
          >
            ⬇ Download
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-center"
          >
            ✏️ Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/5 transition-colors text-center"
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  )
}
