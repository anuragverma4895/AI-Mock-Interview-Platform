import { useEffect, useRef } from 'react'

export function ParticleEffect() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      element: HTMLDivElement
    }> = []

    function createParticle(x: number, y: number) {
      const particle = document.createElement('div')
      const size = Math.random() * 4 + 2

      particle.style.position = 'fixed'
      particle.style.left = x + 'px'
      particle.style.top = y + 'px'
      particle.style.width = size + 'px'
      particle.style.height = size + 'px'
      particle.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
      particle.style.borderRadius = '50%'
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '1'

      container.appendChild(particle)

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size,
        element: particle,
      })

      setTimeout(() => {
        particle.remove()
        particles.splice(
          particles.findIndex((p) => p.element === particle),
          1
        )
      }, 1500)
    }

    function animate() {
      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.1

        particle.element.style.left = particle.x + 'px'
        particle.element.style.top = particle.y + 'px'
        particle.element.style.opacity = (1 - index / particles.length).toString()
      })

      requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.97) {
        createParticle(e.clientX, e.clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      particles.forEach((p) => p.element.remove())
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />
}
