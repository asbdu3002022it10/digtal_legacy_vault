export function SecurityLock() {
  return (
    <div className="w-16 h-16 rounded-full border border-vault-accent bg-vault-card flex items-center justify-center shadow-lg shadow-emerald-500/30">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-9 text-vault-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="3" y="10" width="18" height="11" rx="2" />
        <path d="M7 10V7a5 5 0 1 1 10 0v3" />
        <circle cx="12" cy="15" r="1.4" />
      </svg>
    </div>
  )
}

