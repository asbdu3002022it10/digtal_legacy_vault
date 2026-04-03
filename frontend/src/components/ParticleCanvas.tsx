import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  opacity: number
  color: string
  pulseSpeed: number
  pulseOffset: number
}

interface Orb {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
  glowSize: number
}

const COLORS = [
  'rgba(16, 185, 129,',   // emerald
  'rgba(52, 211, 153,',   // lighter emerald
  'rgba(6, 182, 212,',    // cyan
  'rgba(99, 102, 241,',   // indigo
  'rgba(167, 243, 208,',  // mint
]

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    // ── Generate particles ──────────────────────────────
    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: Math.random() * 0.8 + 0.2,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    // ── Generate glowing orbs ───────────────────────────
    const orbs: Orb[] = [
      { x: W * 0.1, y: H * 0.2, radius: 180, vx: 0.15, vy: 0.1, color: 'rgba(16,185,129,', glowSize: 3.5 },
      { x: W * 0.85, y: H * 0.15, radius: 140, vx: -0.1, vy: 0.12, color: 'rgba(6,182,212,', glowSize: 3 },
      { x: W * 0.5, y: H * 0.8, radius: 160, vx: 0.08, vy: -0.15, color: 'rgba(99,102,241,', glowSize: 3.2 },
      { x: W * 0.75, y: H * 0.6, radius: 100, vx: -0.12, vy: 0.09, color: 'rgba(52,211,153,', glowSize: 2.8 },
    ]

    // ── Connections ─────────────────────────────────────
    function drawConnections(ps: Particle[]) {
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x
          const dy = ps[i].y - ps[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15
            ctx!.beginPath()
            ctx!.strokeStyle = `rgba(16, 185, 129, ${alpha})`
            ctx!.lineWidth = 0.5
            ctx!.moveTo(ps[i].x, ps[i].y)
            ctx!.lineTo(ps[j].x, ps[j].y)
            ctx!.stroke()
          }
        }
      }
    }

    let t = 0
    function animate() {
      t += 0.016
      ctx!.clearRect(0, 0, W, H)

      // Dark base bg (matches vault bg)
      ctx!.fillStyle = 'rgba(5, 10, 18, 0.02)'
      ctx!.fillRect(0, 0, W, H)

      // ── Draw glowing orbs ────────────────────────────
      orbs.forEach(orb => {
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.radius || orb.x > W + orb.radius) orb.vx *= -1
        if (orb.y < -orb.radius || orb.y > H + orb.radius) orb.vy *= -1

        const grad = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * orb.glowSize)
        grad.addColorStop(0, `${orb.color}0.10)`)
        grad.addColorStop(0.4, `${orb.color}0.05)`)
        grad.addColorStop(1, `${orb.color}0)`)
        ctx!.beginPath()
        ctx!.fillStyle = grad
        ctx!.arc(orb.x, orb.y, orb.radius * orb.glowSize, 0, Math.PI * 2)
        ctx!.fill()
      })

      // ── Draw connection lines ────────────────────────
      drawConnections(particles)

      // ── Draw particles ───────────────────────────────
      particles.forEach(p => {
        // 3D projection
        const scale = 1000 / (1000 + p.z)
        const px = p.x * scale + (W / 2) * (1 - scale)
        const py = p.y * scale + (H / 2) * (1 - scale)

        p.x += p.vx
        p.y += p.vy
        p.z -= p.vz

        if (p.z <= 0) p.z = 1000
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        const pulse = Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7
        const finalOpacity = p.opacity * scale * pulse
        const finalSize = p.size * scale

        // Glow
        const glow = ctx!.createRadialGradient(px, py, 0, px, py, finalSize * 4)
        glow.addColorStop(0, `${p.color}${finalOpacity})`)
        glow.addColorStop(1, `${p.color}0)`)
        ctx!.beginPath()
        ctx!.fillStyle = glow
        ctx!.arc(px, py, finalSize * 4, 0, Math.PI * 2)
        ctx!.fill()

        // Core dot
        ctx!.beginPath()
        ctx!.fillStyle = `${p.color}${Math.min(finalOpacity * 1.5, 1)})`
        ctx!.arc(px, py, finalSize, 0, Math.PI * 2)
        ctx!.fill()
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
