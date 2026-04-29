import Lenis from 'lenis';

// gsap y ScrollTrigger vienen del CDN cargado en <head>
// No importamos desde npm para evitar duplicar el bundle
const gsap          = typeof window !== 'undefined' ? window.gsap : null;
const ScrollTrigger = typeof window !== 'undefined' ? window.ScrollTrigger : null;

let lenis = null;

if (typeof window !== 'undefined' && gsap && ScrollTrigger) {
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
}

export default lenis;
