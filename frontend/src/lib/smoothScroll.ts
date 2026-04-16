import Lenis from '@studio-freight/lenis'

let lenis: Lenis | null = null

export function initSmoothScroll() {
  if (typeof window === 'undefined') return

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical' as const,
    gestureDirection: 'vertical' as const,
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  })

  function raf(time: number) {
    lenis?.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
  return lenis
}

export function getSmoothScroll() {
  return lenis
}

export function destroySmoothScroll() {
  if (lenis) {
    lenis.destroy()
    lenis = null
  }
}
