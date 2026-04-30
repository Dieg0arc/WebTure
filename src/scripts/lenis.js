import Lenis from 'lenis';

// gsap y ScrollTrigger son defer'd — se leen en el evento `load`, nunca a nivel de módulo
let lenis = null;

function initLenis() {
  if (typeof window === 'undefined') return;
  const gsap          = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
}

if (document.readyState === 'complete') {
  initLenis();
} else {
  window.addEventListener('load', initLenis, { once: true });
}

export default lenis;
