import { ReactElement, useEffect, useState } from 'react'

// ── SVG Bank Logos ──────────────────────────────────────────────────
const SBILogo = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <circle cx="20" cy="20" r="18" fill="#22409A"/>
    <text x="20" y="25" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">SBI</text>
    <path d="M8 22 Q20 14 32 22" stroke="#99CAFF" strokeWidth="1.5" fill="none"/>
  </svg>
)

const HDFCLogo = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#004C8F"/>
    <text x="20" y="26" textAnchor="middle" fill="#EF2B2D" fontSize="8" fontWeight="bold">HDFC</text>
    <text x="20" y="34" textAnchor="middle" fill="white" fontSize="4">BANK</text>
  </svg>
)

const ICICILogo = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#F58220"/>
    <text x="20" y="24" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">ICICI</text>
    <text x="20" y="33" textAnchor="middle" fill="#952E1F" fontSize="4">BANK</text>
  </svg>
)

const AxisLogo = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#800000"/>
    <text x="20" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Axis</text>
  </svg>
)

const KotakLogo = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#E10A0A"/>
    <text x="20" y="18" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">KOTAK</text>
    <text x="20" y="28" textAnchor="middle" fill="white" fontSize="5">Mahindra</text>
    <text x="20" y="36" textAnchor="middle" fill="white" fontSize="4">BANK</text>
  </svg>
)

const PNBLogo = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <circle cx="20" cy="20" r="18" fill="#FF6600"/>
    <text x="20" y="25" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">PNB</text>
  </svg>
)

const VisaLogo = () => (
  <svg viewBox="0 0 60 40" className="w-full h-full" fill="none">
    <rect width="60" height="40" rx="6" fill="#1A1F71"/>
    <text x="30" y="27" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontStyle="italic">VISA</text>
  </svg>
)

const MastercardLogo = () => (
  <svg viewBox="0 0 50 40" className="w-full h-full" fill="none">
    <circle cx="17" cy="20" r="14" fill="#EB001B"/>
    <circle cx="33" cy="20" r="14" fill="#F79E1B"/>
    <path d="M25 9 A14 14 0 0 1 25 31 A14 14 0 0 1 25 9" fill="#FF5F00"/>
  </svg>
)

const RuPayLogo = () => (
  <svg viewBox="0 0 60 40" className="w-full h-full" fill="none">
    <rect width="60" height="40" rx="6" fill="#1B6CB0"/>
    <text x="30" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">RuPay</text>
  </svg>
)

// ── SVG Document Logos ────────────────────────────────────────────
const AadhaarIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#0A3D6B"/>
    <circle cx="20" cy="14" r="5" fill="#00BCD4"/>
    <path d="M10 32 Q20 24 30 32" fill="#00BCD4"/>
    <text x="20" y="38" textAnchor="middle" fill="white" fontSize="4">AADHAAR</text>
  </svg>
)

const PANIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#1B5E20"/>
    <text x="20" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PAN</text>
    <text x="20" y="31" textAnchor="middle" fill="#A5D6A7" fontSize="4">INCOME TAX</text>
  </svg>
)

const PassportIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#1A237E"/>
    <circle cx="20" cy="18" r="7" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
    <circle cx="20" cy="18" r="3" fill="#FFD700"/>
    <text x="20" y="34" textAnchor="middle" fill="white" fontSize="4">PASSPORT</text>
  </svg>
)

const DLIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#B71C1C"/>
    <rect x="8" y="14" width="24" height="15" rx="2" fill="none" stroke="white" strokeWidth="1.2"/>
    <circle cx="16" cy="20" r="3" fill="white" opacity="0.7"/>
    <text x="28" y="38" textAnchor="middle" fill="white" fontSize="4">DL</text>
  </svg>
)

const VoterIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="6" fill="#FF6F00"/>
    <path d="M20 10 L24 18 L33 18 L26 24 L28 33 L20 28 L12 33 L14 24 L7 18 L16 18Z" fill="white" opacity="0.9"/>
  </svg>
)

// ── SVG Photo/Video Icons ─────────────────────────────────────────
const CameraIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#7C3AED"/>
    <rect x="6" y="14" width="28" height="18" rx="3" stroke="white" strokeWidth="1.5"/>
    <circle cx="20" cy="23" r="5" stroke="white" strokeWidth="1.5"/>
    <rect x="14" y="10" width="7" height="5" rx="1" fill="white" opacity="0.7"/>
    <circle cx="31" cy="17" r="1.5" fill="white"/>
  </svg>
)

const FilmIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#BE185D"/>
    <rect x="6" y="10" width="28" height="20" rx="2" stroke="white" strokeWidth="1.5"/>
    <rect x="6" y="10" width="5" height="4" rx="0.5" fill="white" opacity="0.7"/>
    <rect x="6" y="16" width="5" height="4" rx="0.5" fill="white" opacity="0.7"/>
    <rect x="6" y="22" width="5" height="4" rx="0.5" fill="white" opacity="0.7"/>
    <rect x="29" y="10" width="5" height="4" rx="0.5" fill="white" opacity="0.7"/>
    <rect x="29" y="16" width="5" height="4" rx="0.5" fill="white" opacity="0.7"/>
    <rect x="29" y="22" width="5" height="4" rx="0.5" fill="white" opacity="0.7"/>
    <polygon points="17,14 28,20 17,26" fill="white" opacity="0.9"/>
  </svg>
)

const PhotoIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#0891B2"/>
    <rect x="7" y="10" width="26" height="20" rx="2" stroke="white" strokeWidth="1.5"/>
    <circle cx="14" cy="16" r="2.5" fill="white" opacity="0.8"/>
    <path d="M7 26 L14 19 L21 25 L27 18 L33 26" stroke="white" strokeWidth="1.5" fill="none"/>
  </svg>
)

// ── Letter/Message Icons ──────────────────────────────────────────
const EnvelopeIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#0F766E"/>
    <rect x="6" y="12" width="28" height="18" rx="2" stroke="white" strokeWidth="1.5"/>
    <path d="M6 14 L20 22 L34 14" stroke="white" strokeWidth="1.5"/>
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#BE123C"/>
    <path d="M20 30 L8 19 Q8 11 16 11 Q20 11 20 16 Q20 11 24 11 Q32 11 32 19Z" fill="white" opacity="0.9"/>
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#1E3A5F"/>
    <rect x="11" y="19" width="18" height="12" rx="2" stroke="#10B981" strokeWidth="1.5"/>
    <path d="M15 19 V14 A5 5 0 0 1 25 14 V19" stroke="#10B981" strokeWidth="1.5"/>
    <circle cx="20" cy="25" r="2" fill="#10B981"/>
  </svg>
)

// ── General Icons ─────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#1E40AF"/>
    <path d="M20 8 L30 12 V20 Q30 28 20 32 Q10 28 10 20 V12Z" stroke="#60A5FA" strokeWidth="1.5" fill="rgba(96,165,250,0.1)"/>
    <path d="M15 20 L18 23 L25 17" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#854D0E"/>
    <path d="M20 10 L23 17 L31 17 L25 22 L27 30 L20 25 L13 30 L15 22 L9 17 L17 17Z" fill="#FCD34D"/>
  </svg>
)

const KeyIcon = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <rect width="40" height="40" rx="8" fill="#44403C"/>
    <circle cx="16" cy="18" r="6" stroke="#FCD34D" strokeWidth="1.5"/>
    <path d="M21 21 L30 30 M28 28 L28 32 M24 32 L28 32" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ── Category configs ──────────────────────────────────────────────
const CATEGORY_LOGOS: Record<string, { items: { id: string; label: string; icon: ReactElement; color: string }[]; title: string; glow: string }> = {
  bank: {
    title: 'Bank & Financial Logos',
    glow: 'rgba(16,185,129,0.3)',
    items: [
      { id: 'sbi', label: 'SBI', icon: <SBILogo />, color: '#22409A' },
      { id: 'hdfc', label: 'HDFC', icon: <HDFCLogo />, color: '#004C8F' },
      { id: 'icici', label: 'ICICI', icon: <ICICILogo />, color: '#F58220' },
      { id: 'axis', label: 'Axis', icon: <AxisLogo />, color: '#800000' },
      { id: 'kotak', label: 'Kotak', icon: <KotakLogo />, color: '#E10A0A' },
      { id: 'pnb', label: 'PNB', icon: <PNBLogo />, color: '#FF6600' },
      { id: 'visa', label: 'Visa', icon: <VisaLogo />, color: '#1A1F71' },
      { id: 'mc', label: 'Mastercard', icon: <MastercardLogo />, color: '#EB001B' },
      { id: 'rupay', label: 'RuPay', icon: <RuPayLogo />, color: '#1B6CB0' },
    ],
  },
  document: {
    title: 'Identity Documents',
    glow: 'rgba(59,130,246,0.3)',
    items: [
      { id: 'aadhaar', label: 'Aadhaar', icon: <AadhaarIcon />, color: '#0A3D6B' },
      { id: 'pan', label: 'PAN Card', icon: <PANIcon />, color: '#1B5E20' },
      { id: 'passport', label: 'Passport', icon: <PassportIcon />, color: '#1A237E' },
      { id: 'dl', label: 'Driving Licence', icon: <DLIcon />, color: '#B71C1C' },
      { id: 'voter', label: 'Voter ID', icon: <VoterIcon />, color: '#FF6F00' },
    ],
  },
  media: {
    title: 'Photos & Videos',
    glow: 'rgba(147,51,234,0.3)',
    items: [
      { id: 'camera', label: 'Camera', icon: <CameraIcon />, color: '#7C3AED' },
      { id: 'film', label: 'Film / Video', icon: <FilmIcon />, color: '#BE185D' },
      { id: 'photo', label: 'Photo Album', icon: <PhotoIcon />, color: '#0891B2' },
    ],
  },
  message: {
    title: 'Personal Messages',
    glow: 'rgba(16,185,129,0.3)',
    items: [
      { id: 'envelope', label: 'Letter', icon: <EnvelopeIcon />, color: '#0F766E' },
      { id: 'heart', label: 'Love Note', icon: <HeartIcon />, color: '#BE123C' },
      { id: 'lock', label: 'Secret', icon: <LockIcon />, color: '#1E3A5F' },
    ],
  },
  general: {
    title: 'General Vault',
    glow: 'rgba(99,102,241,0.3)',
    items: [
      { id: 'shield', label: 'Shield', icon: <ShieldIcon />, color: '#1E40AF' },
      { id: 'star', label: 'Starred', icon: <StarIcon />, color: '#854D0E' },
      { id: 'key', label: 'Key', icon: <KeyIcon />, color: '#44403C' },
    ],
  },
}

interface CategoryAnimatorProps {
  category: string
}

export function CategoryAnimator({ category }: CategoryAnimatorProps) {
  const config = CATEGORY_LOGOS[category]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [category])

  if (!config) return null

  const items = config.items

  return (
    <div
      className="relative rounded-2xl border border-white/10 overflow-hidden mb-4"
      style={{
        background: `radial-gradient(ellipse at center, ${config.glow} 0%, rgba(10,15,25,0.8) 70%)`,
        minHeight: '130px',
        padding: '16px',
      }}
    >
      {/* Title */}
      <div className="text-center mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          {config.title}
        </span>
      </div>

      {/* Logos row — orbit/float animation */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
        {items.map((item, i) => {
          const delay = i * 0.12
          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-1 group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.7)',
                transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
                animation: visible ? `logoFloat ${2.5 + (i % 3) * 0.4}s ease-in-out ${delay}s infinite alternate` : 'none',
              }}
            >
              {/* Logo box */}
              <div
                className="relative rounded-xl overflow-hidden cursor-pointer"
                style={{
                  width: category === 'bank' && (item.id === 'visa' || item.id === 'mc' || item.id === 'rupay') ? '52px' : '40px',
                  height: '40px',
                  boxShadow: `0 0 14px ${item.color}55, 0 4px 12px rgba(0,0,0,0.5)`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {item.icon}
                {/* Shimmer overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
                  }}
                />
              </div>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors font-medium">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Sparkle particles (static decorative) */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: config.glow.replace('0.3)', '0.8)'),
            left: `${15 + i * 17}%`,
            top: `${10 + (i % 3) * 25}%`,
            animation: `sparkle ${1.5 + i * 0.3}s ease-in-out ${i * 0.4}s infinite`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  )
}
