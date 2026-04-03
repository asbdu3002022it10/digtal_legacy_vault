import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestOtp, setupSecurity, verifyOtp, verifySecurity } from '@api/authApi'
import { useAuth } from '@hooks/useAuth'

// ── Step indicator ────────────────────────────────────────────────
const STEPS = [
  { id: 'request', label: 'Email', icon: '✉️' },
  { id: 'verify',  label: 'OTP',   icon: '🔢' },
  { id: 'questions-setup',  label: 'Setup',  icon: '🛡️' },
  { id: 'questions-verify', label: 'Verify', icon: '🔐' },
]

function StepIndicator({ currentStep }: { currentStep: string }) {
  // Only show steps 1 & 2 for the request+verify phase
  // Show steps 1, 2, 3 for setup/verify questions
  const isSetup  = currentStep === 'questions-setup'
  const isVerify = currentStep === 'questions-verify'
  const showThird = isSetup || isVerify

  const steps = [
    { label: 'Email', icon: '✉️', done: currentStep !== 'request' },
    { label: 'OTP',   icon: '🔢', done: showThird },
    { label: showThird && isSetup ? 'Setup' : 'Verify', icon: showThird ? '🛡️' : '🔐', done: false, active: showThird },
  ]

  const activeIdx = currentStep === 'request' ? 0 : currentStep === 'verify' ? 1 : 2

  return (
    <div className="flex items-center justify-center gap-0 mb-6 select-none">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center">
          {/* Circle */}
          <div
            className="flex flex-col items-center"
            style={{ animation: i === activeIdx ? 'stepFadeIn 0.4s ease-out forwards' : 'none' }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${
                i < activeIdx
                  ? 'bg-emerald-500 border-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : i === activeIdx
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.4)] scale-110'
                  : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}
            >
              {i < activeIdx ? '✓' : s.icon}
            </div>
            <span className={`text-[9px] mt-1 font-medium transition-colors ${
              i <= activeIdx ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              {s.label}
            </span>
          </div>
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="relative mx-1 mb-4" style={{ width: '40px', height: '2px' }}>
              <div className="absolute inset-0 bg-slate-700 rounded-full" />
              <div
                className="absolute inset-0 bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: i < activeIdx ? '100%' : '0%', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Login Component ──────────────────────────────────────────
export function Login() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [otp, setOtp] = useState('')
  const [country, setCountry] = useState('India')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')

  const [step, setStep] = useState<'request' | 'verify' | 'questions-setup' | 'questions-verify'>('request')
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState({ a1: '', a2: '', a3: '' })
  const [setupData, setSetupData] = useState({ q1: '', q2: '', q3: '' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setMessage(null)
    try {
      const dobString = `${day.padStart(2, '0')}${month.padStart(2, '0')}${year}`
      await requestOtp(email, dobString)
      setStep('verify')
      setMessage('Verification code sent to your email.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await verifyOtp(email, otp)
      if (res.has_security_questions) {
        setSecurityQuestions(res.questions)
        setStep('questions-verify')
      } else {
        setStep('questions-setup')
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid or expired OTP')
    } finally { setLoading(false) }
  }

  async function handleSetupQuestions(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const token = await setupSecurity(email, otp, setupData.q1, answers.a1, setupData.q2, answers.a2, setupData.q3, answers.a3)
      setToken(token)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Setup failed')
    } finally { setLoading(false) }
  }

  async function handleVerifyQuestions(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const token = await verifySecurity(email, otp, answers.a1, answers.a2, answers.a3, country, state, district)
      setToken(token)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Incorrect answers')
    } finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6 sm:mt-12">
      {/* ── Outer glowing card ─── */}
      <div
        className="relative rounded-2xl border border-slate-700/60 bg-[#0a0f1a]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(16,185,129,0.08), 0 25px 50px rgba(0,0,0,0.6)' }}
      >
        {/* Corner glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          {/* Animated vault icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4 animate-pulse-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="10" width="18" height="11" rx="2" />
              <path d="M7 10V7a5 5 0 1 1 10 0v3" />
              <circle cx="12" cy="15" r="1.4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">
            {step === 'questions-setup'   ? '🛡️ Set Security Questions' :
             step === 'questions-verify'  ? '🔐 Verify Identity'        :
             'Access Your Vault'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'questions-setup'  ? 'One-time setup. You\'ll answer these every login.' :
             step === 'questions-verify' ? 'Answer your security questions to unlock.' :
             'Multi-factor authentication keeps your vault safe.'}
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* ── STEP 1: Email + DOB ─── */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 animate-step-up">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">✉️</span>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-slate-700/80 bg-black/30 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500/70 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date of Birth
                <span className="ml-2 text-[10px] text-slate-600 normal-case font-normal">(Decryption key factor)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Day */}
                <select required value={day} onChange={(e) => setDay(e.target.value)}
                  className="rounded-xl border border-slate-700/80 bg-black/30 px-2 py-2.5 text-sm outline-none focus:border-emerald-500/70 text-slate-300 transition-all">
                  <option value="" disabled>Day</option>
                  {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
                {/* Month */}
                <select required value={month} onChange={(e) => setMonth(e.target.value)}
                  className="rounded-xl border border-slate-700/80 bg-black/30 px-2 py-2.5 text-sm outline-none focus:border-emerald-500/70 text-slate-300 transition-all">
                  <option value="" disabled>Month</option>
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((name, i) =>
                    <option key={i + 1} value={i + 1}>{name}</option>)}
                </select>
                {/* Year */}
                <select required value={year} onChange={(e) => setYear(e.target.value)}
                  className="rounded-xl border border-slate-700/80 bg-black/30 px-2 py-2.5 text-sm outline-none focus:border-emerald-500/70 text-slate-300 transition-all">
                  <option value="" disabled>Year</option>
                  {Array.from({ length: 100 }, (_, i) => <option key={2026 - i} value={2026 - i}>{2026 - i}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2">
                <span className="text-red-400 text-sm">⚠️</span>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 rounded-xl bg-emerald-500 text-black text-sm font-bold py-3 hover:bg-emerald-400 disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Sending code…
                </span>
              ) : 'Send Verification Code →'}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP Verify ─── */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-step-fade">
            {message && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                <span className="text-emerald-400 text-sm">✅</span>
                <p className="text-xs text-emerald-300">{message}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                6-Digit Verification Code
              </label>
              {/* OTP boxes */}
              <input
                type="text" required value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="0  0  0  0  0  0"
                maxLength={6}
                className="w-full rounded-xl border border-slate-700/80 bg-black/30 px-3 py-4 text-2xl outline-none focus:border-emerald-500/70 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] text-center tracking-[0.5em] font-mono text-emerald-300 transition-all placeholder:text-slate-700 placeholder:text-base placeholder:tracking-widest"
              />
              <p className="text-[10px] text-slate-600 text-center">Check your inbox — it expires in 10 minutes</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2">
                <span>⚠️</span>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading || otp.length < 6}
              className="w-full mt-2 rounded-xl bg-emerald-500 text-black text-sm font-bold py-3 hover:bg-emerald-400 disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Confirming…
                </span>
              ) : `Confirm Code (${otp.length}/6) →`}
            </button>
          </form>
        )}

        {/* ── STEP 3A: First-time Question SETUP ─── */}
        {step === 'questions-setup' && (
          <form onSubmit={handleSetupQuestions} className="space-y-5 animate-step-fade">
            {/* Info banner */}
            <div className="rounded-xl bg-yellow-500/8 border border-yellow-500/25 px-4 py-3">
              <p className="text-xs text-yellow-300 font-semibold mb-0.5">⚡ One-time security setup</p>
              <p className="text-[11px] text-yellow-400/70">Choose 3 questions you will always remember. These will be asked every login.</p>
            </div>

            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-slate-700/50 bg-black/20 p-4"
                style={{ animation: `stepSlideUp 0.4s ease-out ${(i - 1) * 0.12}s both` }}
              >
                {/* Question number badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                    {i}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Security Question {i}</span>
                </div>
                <input
                  required
                  placeholder={[
                    "e.g. What is your mother's maiden name?",
                    "e.g. Name of your first school?",
                    "e.g. Your childhood nickname?",
                  ][i - 1]}
                  className="w-full rounded-lg border border-slate-700/60 bg-black/30 px-3 py-2.5 text-xs outline-none focus:border-emerald-500/60 text-slate-200 placeholder:text-slate-600 transition-all"
                  onChange={(e) => setSetupData(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                />
                <input
                  required
                  placeholder="Your Answer (case-sensitive)"
                  className="w-full rounded-lg border border-slate-700/60 bg-black/30 px-3 py-2.5 text-xs outline-none focus:border-emerald-400/60 text-emerald-200 placeholder:text-slate-600 transition-all"
                  onChange={(e) => setAnswers(prev => ({ ...prev, [`a${i}`]: e.target.value }))}
                />
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2">
                <span>⚠️</span>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-emerald-500 text-black text-sm font-bold py-3 hover:bg-emerald-400 disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Saving…
                </span>
              ) : '🔐 Save & Enter Dashboard'}
            </button>
          </form>
        )}

        {/* ── STEP 3B: Return Login — Answer VERIFY ─── */}
        {step === 'questions-verify' && (
          <form onSubmit={handleVerifyQuestions} className="space-y-4 animate-step-fade">
            {/* Info badge */}
            <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-3">
              <p className="text-xs text-emerald-300 font-semibold mb-0.5">🔐 Final Security Layer</p>
              <p className="text-[11px] text-emerald-400/60">Answer your 3 security questions to unlock your vault.</p>
            </div>

            {/* Security question answer fields */}
            {securityQuestions.map((q, i) => (
              <div
                key={i}
                className="space-y-2"
                style={{ animation: `stepSlideUp 0.4s ease-out ${i * 0.1}s both` }}
              >
                <label className="block text-[11px] text-slate-400 font-medium px-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold mr-1.5">{i + 1}</span>
                  {q}
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter your answer"
                  className="w-full rounded-xl border border-slate-700/80 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-emerald-500/70 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] text-slate-100 placeholder:text-slate-700 transition-all"
                  onChange={(e) => setAnswers(prev => ({ ...prev, [`a${i + 1}`]: e.target.value }))}
                />
              </div>
            ))}

            {/* Location (safety tracking) */}
            <div className="rounded-xl border border-slate-800/60 bg-black/10 p-4 space-y-3"
              style={{ animation: 'stepSlideUp 0.4s ease-out 0.4s both' }}>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span>📍</span> Location Verification <span className="text-emerald-700">(Safety)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium">State</label>
                  <input
                    required value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full rounded-lg border border-slate-700/60 bg-black/30 px-3 py-2 text-xs outline-none focus:border-emerald-500/60 text-slate-300 placeholder:text-slate-700 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium">District</label>
                  <input
                    required value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full rounded-lg border border-slate-700/60 bg-black/30 px-3 py-2 text-xs outline-none focus:border-emerald-500/60 text-slate-300 placeholder:text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2">
                <span>⚠️</span>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-emerald-500 text-black text-sm font-bold py-3 hover:bg-emerald-400 disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Authenticating…
                </span>
              ) : '🔓 Unlock Dashboard'}
            </button>
          </form>
        )}

        {/* Back button */}
        {step !== 'request' && (
          <button
            type="button"
            onClick={() => { setStep('request'); setOtp(''); setError(null); setMessage(null) }}
            className="mt-5 w-full text-center text-[11px] text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5"
          >
            ← Use different email or restart login
          </button>
        )}
      </div>

      {/* Bottom trust badges */}
      <div className="flex items-center justify-center gap-4 mt-5">
        {['🔒 E2E Encrypted', '🛡️ Zero-Knowledge', '🌐 3-Factor Auth'].map(badge => (
          <span key={badge} className="text-[10px] text-slate-600 flex items-center gap-1">{badge}</span>
        ))}
      </div>
    </div>
  )
}
