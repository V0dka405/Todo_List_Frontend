// Lightweight zero-dependency Canvas Confetti Engine

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  vRot: number
  shape: 'rect' | 'circle'
  opacity: number
}

const PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
]

export function fireConfetti(originX?: number, originY?: number): void {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '99999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }
  const context = ctx

  const width = (canvas.width = window.innerWidth)
  const height = (canvas.height = window.innerHeight)

  const startX = originX ?? width / 2
  const startY = originY ?? height * 0.45

  const particleCount = 65
  const particles: Particle[] = []

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 9 + 4
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      opacity: 1,
    })
  }

  let animationFrameId: number
  const startTime = performance.now()
  const duration = 2400

  function render(time: number) {
    const elapsed = time - startTime
    if (elapsed > duration) {
      cancelAnimationFrame(animationFrameId)
      canvas.remove()
      return
    }

    context.clearRect(0, 0, width, height)

    const fadeStart = duration * 0.6
    const globalFade = elapsed > fadeStart ? 1 - (elapsed - fadeStart) / (duration - fadeStart) : 1

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.28
      p.vx *= 0.985
      p.vy *= 0.985
      p.rotation += p.vRot
      p.opacity = Math.max(0, globalFade)

      context.save()
      context.translate(p.x, p.y)
      context.rotate(p.rotation)
      context.globalAlpha = p.opacity
      context.fillStyle = p.color

      if (p.shape === 'rect') {
        context.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      } else {
        context.beginPath()
        context.arc(0, 0, p.size / 3, 0, Math.PI * 2)
        context.fill()
      }
      context.restore()
    }

    animationFrameId = requestAnimationFrame(render)
  }

  animationFrameId = requestAnimationFrame(render)
}
