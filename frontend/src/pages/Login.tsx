import { FormEvent, ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  beginPasskeyAuthentication,
  finishPasskeyAuthentication,
  requestOtp,
  setupSecurity,
  verifyOtp,
  verifySecurity,
} from '@api/authApi'
import { useAuth } from '@hooks/useAuth'
import { browserSupportsPasskeys, getPasskeyCredential } from '@utils/passkey'

type LoginStep = 'request' | 'verify' | 'questions-setup' | 'questions-verify'

function IconShell({ children, active = false, done = false }: { children: ReactNode; active?: boolean; done?: boolean }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-500 ${
        done
          ? 'border-emerald-400/70 bg-emerald-400/20 text-emerald-200 shadow-[0_0_28px_rgba(16,185,129,0.32)]'
          : active
            ? 'border-cyan-300/70 bg-cyan-300/12 text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.24)]'
            : 'border-slate-700/80 bg-slate-900/70 text-slate-500'
      }`}
    >
      {children}
    </div>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5 12 14l9-6.5" />
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
    </svg>
  )
}

function OtpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 10h.01M12 10h.01M16 10h.01M9 15h6" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5.5 6v5.6c0 4.4 2.8 7.6 6.5 9.4 3.7-1.8 6.5-5 6.5-9.4V6L12 3Z" />
      <path d="m9.5 12 1.7 1.7L14.8 10" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.2" />
    </svg>
  )
}

function FingerprintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.8 10.2a3.2 3.2 0 0 1 6.4 0v1.1a8 8 0 0 1-2.7 6" />
      <path d="M6.5 10.5a5.5 5.5 0 1 1 11 0v1.2a10.5 10.5 0 0 1-3.4 7.7" />
      <path d="M10.2 14.8v.4a4.8 4.8 0 0 1-1.8 3.8" />
      <path d="M12 6.2a7.7 7.7 0 0 0-7.7 7.7v.4" />
      <path d="M14.4 14.1v.4a7 7 0 0 1-1.7 4.6" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 3.7 18.5a1 1 0 0 0 .9 1.5h14.8a1 1 0 0 0 .9-1.5L12 4Z" />
      <path d="M12 9v4.5" />
      <circle cx="12" cy="16.5" r=".7" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17" />
      <path d="M3.5 15h17" />
      <path d="M12 3c2.7 2.5 4.1 5.5 4.1 9S14.7 18.5 12 21c-2.7-2.5-4.1-5.5-4.1-9S9.3 5.5 12 3Z" />
    </svg>
  )
}

function VaultCoreIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="20" width="32" height="19" rx="5" />
      <path d="M15 20v-4a9 9 0 0 1 18 0v4" />
      <circle cx="24" cy="29.5" r="2.4" />
      <path d="M24 31.9v3.6" />
    </svg>
  )
}

function StepIndicator({ currentStep }: { currentStep: LoginStep }) {
  const isSetup = currentStep === 'questions-setup'
  const showFinalStep = isSetup || currentStep === 'questions-verify'
  const activeIdx = currentStep === 'request' ? 0 : currentStep === 'verify' ? 1 : 2

  const steps = [
    { label: 'Email', icon: <MailIcon /> },
    { label: 'OTP', icon: <OtpIcon /> },
    { label: showFinalStep && isSetup ? 'Setup' : 'Verify', icon: showFinalStep && isSetup ? <ShieldIcon /> : <LockIcon /> },
  ]

  return (
    <div className="mb-8 flex items-center justify-center">
      {steps.map((step, index) => {
        const done = index < activeIdx
        const active = index === activeIdx

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <IconShell active={active} done={done}>
                {done ? <CheckIcon /> : step.icon}
              </IconShell>
              <span className={`text-[10px] font-medium uppercase tracking-[0.24em] ${active || done ? 'text-emerald-200' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="mx-3 h-px w-10 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${index < activeIdx ? 'w-full bg-gradient-to-r from-emerald-400 to-cyan-300' : 'w-0 bg-transparent'}`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-300">
      <AlertIcon />
      <p className="text-xs leading-relaxed">{message}</p>
    </div>
  )
}

function SuccessNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-emerald-200">
      <CheckIcon />
      <p className="text-xs leading-relaxed">{message}</p>
    </div>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [otp, setOtp] = useState('')
  const [country] = useState('India')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')

  const [step, setStep] = useState<LoginStep>('request')
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState({ a1: '', a2: '', a3: '' })
  const [setupData, setSetupData] = useState({ q1: '', q2: '', q3: '' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const passkeyAvailable = browserSupportsPasskeys() && localStorage.getItem('vault_passkey_ready') === 'true'

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const dobString = `${day.padStart(2, '0')}${month.padStart(2, '0')}${year}`
      await requestOtp(email, dobString)
      setStep('verify')
      setMessage('Verification code sent to your email.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
    } finally {
      setLoading(false)
    }
  }

  async function handleSetupQuestions(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = await setupSecurity(
        email,
        otp,
        setupData.q1,
        answers.a1,
        setupData.q2,
        answers.a2,
        setupData.q3,
        answers.a3,
      )
      setToken(token)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyQuestions(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = await verifySecurity(email, otp, answers.a1, answers.a2, answers.a3, country, state, district)
      setToken(token)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Incorrect answers')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasskeyLogin() {
    setPasskeyLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { public_key, challenge_token } = await beginPasskeyAuthentication()
      const credential = await getPasskeyCredential(public_key)
      const token = await finishPasskeyAuthentication(credential, challenge_token)
      localStorage.setItem('vault_passkey_ready', 'true')
      setToken(token)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Fingerprint login failed')
    } finally {
      setPasskeyLoading(false)
    }
  }

  const years = Array.from({ length: 100 }, (_, index) => 2026 - index)

  return (
    <div className="relative mx-auto mt-4 w-full max-w-md overflow-hidden rounded-[2rem] sm:mt-10">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="login-radar pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full" />
      <div className="login-aurora login-aurora-a pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full" />
      <div className="login-aurora login-aurora-b pointer-events-none absolute -right-12 top-1/3 h-72 w-72 rounded-full" />
      <div className="login-aurora login-aurora-c pointer-events-none absolute bottom-0 left-1/3 h-60 w-60 rounded-full" />
      <div className="login-scanline pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative rounded-[2rem] border border-slate-700/60 bg-[linear-gradient(180deg,rgba(5,11,19,0.96),rgba(7,14,24,0.92))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:p-8">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.28),rgba(8,15,25,0.7)_60%)] text-emerald-200 shadow-[0_0_45px_rgba(16,185,129,0.18)]">
            <VaultCoreIcon />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {step === 'questions-setup' ? 'Set Security Questions' : step === 'questions-verify' ? 'Verify Identity' : 'Access Your Vault'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {step === 'questions-setup'
              ? 'Choose three questions you will always remember. This stays as your final verification layer.'
              : step === 'questions-verify'
                ? 'Complete the final identity check to unlock your encrypted dashboard.'
                : 'Bank-grade access flow with OTP, identity verification and optional fingerprint sign-in.'}
          </p>
        </div>

        <StepIndicator currentStep={step} />

        {step === 'request' && (
          <div className="space-y-5 animate-step-up">
            {passkeyAvailable && (
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={passkeyLoading}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-all hover:border-cyan-200/40 hover:bg-cyan-300/15 disabled:opacity-60"
              >
                <FingerprintIcon />
                {passkeyLoading ? 'Checking Fingerprint...' : 'Use Fingerprint Login'}
              </button>
            )}

            {passkeyAvailable && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-slate-600">or</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-2xl border border-slate-700/80 bg-black/35 py-3 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Date Of Birth
                  <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-slate-600">(Decryption key factor)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    required
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="rounded-2xl border border-slate-700/80 bg-black/35 px-3 py-3 text-sm text-slate-200 outline-none transition-all focus:border-emerald-400/60"
                  >
                    <option value="" disabled>
                      Day
                    </option>
                    {Array.from({ length: 31 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-2xl border border-slate-700/80 bg-black/35 px-3 py-3 text-sm text-slate-200 outline-none transition-all focus:border-emerald-400/60"
                  >
                    <option value="" disabled>
                      Month
                    </option>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((name, index) => (
                      <option key={name} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="rounded-2xl border border-slate-700/80 bg-black/35 px-3 py-3 text-sm text-slate-200 outline-none transition-all focus:border-emerald-400/60"
                  >
                    <option value="" disabled>
                      Year
                    </option>
                    {years.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <ErrorNotice message={error} />}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#34d399,#22c55e)] py-3 text-sm font-bold text-slate-950 transition-all hover:translate-y-[-1px] hover:shadow-[0_0_28px_rgba(16,185,129,0.32)] disabled:opacity-60"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-step-fade">
            {message && <SuccessNotice message={message} />}

            <div className="space-y-2">
              <label className="block text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">6-Digit Verification Code</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300">
                  <OtpIcon />
                </div>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-2xl border border-slate-700/80 bg-black/35 py-4 pl-12 pr-4 text-center font-mono text-2xl tracking-[0.45em] text-emerald-200 outline-none transition-all placeholder:text-slate-700 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                />
              </div>
              <p className="text-center text-[11px] text-slate-500">Check your inbox. This code expires in 10 minutes.</p>
            </div>

            {error && <ErrorNotice message={error} />}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#34d399,#22c55e)] py-3 text-sm font-bold text-slate-950 transition-all hover:translate-y-[-1px] hover:shadow-[0_0_28px_rgba(16,185,129,0.32)] disabled:opacity-60"
            >
              {loading ? 'Confirming...' : `Confirm Code (${otp.length}/6)`}
            </button>
          </form>
        )}

        {step === 'questions-setup' && (
          <form onSubmit={handleSetupQuestions} className="space-y-5 animate-step-fade">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">One-Time Security Setup</p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-100/80">
                Choose three strong personal questions. Every future login will use these as the final trust layer.
              </p>
            </div>

            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-2 rounded-2xl border border-slate-700/60 bg-black/25 p-4">
                <div className="flex items-center gap-2">
                  <IconShell active>
                    <ShieldIcon />
                  </IconShell>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Security Question {index}</p>
                    <p className="text-xs text-slate-500">Pick something only you can answer confidently.</p>
                  </div>
                </div>
                <input
                  required
                  placeholder={
                    [
                      "e.g. What is your mother's maiden name?",
                      'e.g. Name of your first school?',
                      'e.g. Your childhood nickname?',
                    ][index - 1]
                  }
                  className="w-full rounded-xl border border-slate-700/80 bg-black/35 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/60"
                  onChange={(e) => setSetupData((prev) => ({ ...prev, [`q${index}`]: e.target.value }))}
                />
                <input
                  required
                  placeholder="Your answer"
                  className="w-full rounded-xl border border-slate-700/80 bg-black/35 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/60"
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [`a${index}`]: e.target.value }))}
                />
              </div>
            ))}

            {error && <ErrorNotice message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#34d399,#22c55e)] py-3 text-sm font-bold text-slate-950 transition-all hover:translate-y-[-1px] hover:shadow-[0_0_28px_rgba(16,185,129,0.32)] disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save And Enter Dashboard'}
            </button>
          </form>
        )}

        {step === 'questions-verify' && (
          <form onSubmit={handleVerifyQuestions} className="space-y-4 animate-step-fade">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Final Security Layer</p>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/80">Answer all three questions to unlock your vault.</p>
            </div>

            {securityQuestions.map((question, index) => (
              <div key={question} className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/12 text-[10px] font-bold text-cyan-100">
                    {index + 1}
                  </span>
                  {question}
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter your answer"
                  className="w-full rounded-2xl border border-slate-700/80 bg-black/35 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/60"
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [`a${index + 1}`]: e.target.value }))}
                />
              </div>
            ))}

            <div className="space-y-3 rounded-2xl border border-slate-700/60 bg-black/25 p-4">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                <GlobeIcon />
                Location Verification
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">State</label>
                  <input
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/35 px-3 py-2.5 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">District</label>
                  <input
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/35 px-3 py-2.5 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/60"
                  />
                </div>
              </div>
            </div>

            {error && <ErrorNotice message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#34d399,#22c55e)] py-3 text-sm font-bold text-slate-950 transition-all hover:translate-y-[-1px] hover:shadow-[0_0_28px_rgba(16,185,129,0.32)] disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>
        )}

        {step !== 'request' && (
          <button
            type="button"
            onClick={() => {
              setStep('request')
              setOtp('')
              setError(null)
              setMessage(null)
            }}
            className="mt-5 w-full text-center text-[11px] uppercase tracking-[0.24em] text-slate-500 transition-colors hover:text-slate-300"
          >
            Restart Login Flow
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 px-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
        <span className="flex items-center gap-1.5">
          <LockIcon />
          E2E Encrypted
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldIcon />
          Zero-Knowledge
        </span>
        <span className="flex items-center gap-1.5">
          <FingerprintIcon />
          3-Factor Auth
        </span>
      </div>
    </div>
  )
}
