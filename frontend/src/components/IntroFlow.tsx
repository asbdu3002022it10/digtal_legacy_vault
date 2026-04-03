import { useEffect, useState, useRef } from 'react'
import { SecurityLock } from '@components/SecurityLock'

interface IntroFlowProps {
  onComplete: () => void
}

export function IntroFlow({ onComplete }: IntroFlowProps) {
  const [step, setStep] = useState<'animation' | 'terms'>('animation')
  const [canAccept, setCanAccept] = useState(false)
  const [accepted, setAccepted] = useState(false)
  
  // Handle animation timeout
  useEffect(() => {
    if (step === 'animation') {
      const timer = setTimeout(() => {
        setStep('terms')
      }, 4500) // 4.5 seconds animation
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50
    if (bottom && !canAccept) {
      setCanAccept(true)
    }
  }

  // Fallback if content is too short to scroll
  useEffect(() => {
    if (step === 'terms') {
      const timer = setTimeout(() => {
        setCanAccept(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [step])

  if (step === 'animation') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#060b14] flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center justify-center animate-pulse">
          <SecurityLock />
          <div className="mt-8 text-center space-y-3">
            <h1 className="text-3xl font-bold text-white tracking-widest uppercase animate-bounce">
              Digital Legacy Vault
            </h1>
            <p className="text-emerald-400 text-sm tracking-widest animate-pulse">
              Encrypting your secrets...
            </p>
          </div>
          
          {/* Animated circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-emerald-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/10 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-sky-500/10 rounded-full animate-[spin_6s_linear_infinite]" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#060b14] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-[#0f1621] border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div>
              <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
              <p className="text-xs text-slate-400">Please read carefully before entering the vault</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-sm text-slate-300 leading-relaxed"
          onScroll={handleScroll}
        >
          <p>
            Welcome to the <strong>Digital Legacy Vault</strong>. This platform is designed to securely store your most sensitive digital assets and ensure they are passed on to your trusted nominees only when necessary.
          </p>

          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-emerald-400">1.</span> End-to-End Encryption
            </h3>
            <p className="pl-5 text-slate-400">
              All data entered into the vault (files, private keys, passwords, bank details) is encrypted <strong>before</strong> it leaves your device. We do not have access to your raw data. Your privacy is structurally guaranteed.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-emerald-400">2.</span> Dead Man's Switch (Inactivity Trigger)
            </h3>
            <p className="pl-5 text-slate-400">
              Your designated nominees will <strong>NOT</strong> have immediate access to your data. Access is only granted if you remain inactive (no logins) for a continuous period of <strong>6 months</strong>. The system will automatically detect this and activate the smart contract protocol.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-emerald-400">3.</span> Nominee Access & Category Restrictions
            </h3>
            <p className="pl-5 text-slate-400">
              You maintain full control over who sees what. When adding a nominee, you specify exactly which categories (e.g., Bank Details, Documents, Photos) they are allowed to access. They will only receive access to the categories you explicitly authorized.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-emerald-400">4.</span> Password-Protected File Downloads
            </h3>
            <p className="pl-5 text-slate-400">
              When a nominee downloads your sensitive files, the system automatically packages them into a highly secure, encrypted PDF. The password to open this file will be your Date of Birth in <strong>DDMMYYYY</strong> format. Your nominee must know this detail to access the files.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-emerald-400">5.</span> Audit Logging & Location Tracking
            </h3>
            <p className="pl-5 text-slate-400">
              For your extreme security, every successful or failed login attempt to your vault is meticulously logged. We record the timestamp, precise action, and geographical location (Country, State, District). You can review these logs at any time in your dashboard.
            </p>
          </div>

          <p className="pt-4 border-t border-slate-800 text-xs italic text-slate-500">
            By proceeding, you acknowledge that you understand the mechanics of the Dead Man's Switch and the encryption protocols used by this application.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-black/40 shrink-0 space-y-4">
          <label className={`flex items-start gap-3 cursor-pointer ${!canAccept ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <div className="mt-0.5 relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="w-5 h-5 appearance-none border-2 border-slate-600 rounded checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                disabled={!canAccept}
              />
              {accepted && (
                <span className="absolute text-black text-xs font-bold pointer-events-none">✓</span>
              )}
            </div>
            <span className="text-sm text-slate-300 select-none">
              I have read the terms completely and agree to the Digital Legacy Vault security protocols.
            </span>
          </label>

          <button
            onClick={() => accepted && onComplete()}
            disabled={!accepted || !canAccept}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              accepted && canAccept
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Enter Vault
          </button>
        </div>
      </div>
    </div>
  )
}
