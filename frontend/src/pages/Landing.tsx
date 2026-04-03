import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SecurityLock } from '@components/SecurityLock'
import { DemoVideo } from '@components/DemoVideo'
import { ParticleCanvas } from '@components/ParticleCanvas'

const features = [
  { icon: '🔐', text: 'End-to-end encrypted at rest' },
  { icon: '📋', text: 'Category-wise nominee access' },
  { icon: '📥', text: 'PDF download with DOB protection' },
  { icon: '⏱️', text: 'Dead man\'s switch (6 months)' },
]

export function Landing() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <>
      {/* ── 3D Particle Background ─────────────────────────── */}
      <ParticleCanvas />

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative py-10 sm:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16" style={{ zIndex: 1 }}>
        {/* Left — Copy */}
        <div className="flex-1 space-y-6 text-center md:text-left animate-step-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            Future-proof your digital life
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Your secrets, protected
            <br />
            <span className="text-emerald-400 neon-text-emerald">for the people you trust.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Digital Legacy Vault encrypts your most sensitive documents, bank keys and
            wishes — and safely hands them to your nominees only when
            they're meant to see them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto text-center px-7 py-3.5 rounded-full bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg neon-glow-emerald hover:scale-105 active:scale-95"
            >
              Get started — it's free
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2 border border-slate-700 hover:border-emerald-500/50 px-6 py-3 rounded-full backdrop-blur-sm hover:bg-white/5"
            >
              ▶ Play Demo Video
            </button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {features.map((f, i) => (
              <span
                key={f.text}
                className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1.5 backdrop-blur-sm hover:border-emerald-500/30 hover:text-slate-300 transition-all cursor-default"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span>{f.icon}</span>
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Visual (3D floating card) */}
        <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-xs mx-auto perspective-wrapper">
          {/* Floating SecurityLock with 3D animation */}
          <div className="animate-float3d-slow">
            <div className="animate-pulse-emerald rounded-full">
              <SecurityLock />
            </div>
          </div>

          {/* Nominee snapshot card — 3D float */}
          <div
            className="w-full rounded-2xl glass-panel p-5 space-y-4 animate-float3d"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100 text-sm">🛡️ Nominee snapshot</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse">
                Encrypted
              </span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Bank Details', who: 'Spouse', status: '✅ Accepted' },
                { label: 'Documents', who: 'Son', status: '⏳ Pending' },
                { label: 'Personal Notes', who: 'Spouse', status: '✅ Accepted' },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-xs rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div>
                    <span className="text-slate-200 font-medium">{row.label}</span>
                    <span className="text-slate-500 ml-2">→ {row.who}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${row.status.startsWith('✅') ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
              Designate who unlocks your vault and when. Full control stays with you until the end.
            </p>

            {/* Decorative glow bottom */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full blur-xl opacity-30"
              style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 70%)' }}
            />
          </div>
        </div>
      </section>

      {/* ── How it Works Section ─────────────────────────────── */}
      <section className="relative py-16 mt-10 border-t border-slate-800/60" style={{ zIndex: 1 }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">How it works</h2>
        <p className="text-center text-slate-400 text-sm mb-12 max-w-xl mx-auto">Three simple steps to secure your digital legacy forever.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Encrypt', desc: 'Store files, keys, and wishes. Everything is end-to-end encrypted locally.', icon: '🔒', color: 'emerald' },
            { step: '2', title: 'Nominate', desc: 'Assign specific categories of your vault to specific trusted individuals.', icon: '👥', color: 'blue' },
            { step: '3', title: 'Automate', desc: 'If you are inactive for 6 months, nominees are automatically granted access.', icon: '⚡', color: 'purple' },
          ].map((s, i) => (
            <div
              key={s.step}
              className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center group hover:scale-105 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-3">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────── */}
      <section className="relative py-16 mb-10 border-t border-slate-800/60" style={{ zIndex: 1 }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            { q: 'Can Digital Legacy Vault or hackers read my data?', a: 'No. All your vault contents are end-to-end encrypted before they leave your device. We have zero knowledge of what you store.' },
            { q: 'What happens to my account after 5 failed login attempts?', a: 'Your account goes into an automatic Security Lockout mode to prevent brute-force attacks. You will need to contact our support team.' },
            { q: 'How does the Dead Man\'s Switch work?', a: 'If you fail to login to your dashboard for 6 continuous months, your account is marked inactive, and pre-authorized nominees are immediately notified to access their assigned categories.' },
            { q: 'Is it completely free?', a: 'Yes, Digital Legacy Vault is currently 100% free to use. Secure your legacy today.' },
          ].map((faq, i) => (
            <div
              key={i}
              className="glass-panel p-5 rounded-2xl text-left hover:border-emerald-500/20 transition-all duration-300 group cursor-default"
            >
              <h3 className="text-base font-semibold text-emerald-400 mb-2 group-hover:text-emerald-300 transition-colors">{faq.q}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {showDemo && <DemoVideo onClose={() => setShowDemo(false)} />}
    </>
  )
}
