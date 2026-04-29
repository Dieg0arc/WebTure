// gsap, ScrollTrigger y SplitText vienen del CDN cargado en <head>
// No importamos desde npm para evitar duplicar el bundle de Vite
const gsap          = typeof window !== 'undefined' ? window.gsap          : null;
const ScrollTrigger = typeof window !== 'undefined' ? window.ScrollTrigger : null;
const SplitText     = typeof window !== 'undefined' ? window.SplitText     : null;

/* ─── 1. Navbar scroll state ─────────────────────────────────────────────── */
export function initNavbar() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;

  const nav = document.getElementById('nav');
  if (!nav) return;

  let scrolled = false;

  ScrollTrigger.create({
    start: 'top -50px',
    onEnter: () => {
      if (scrolled) return;
      scrolled = true;
      nav.classList.add('scrolled');
    },
    onLeaveBack: () => {
      scrolled = false;
      nav.classList.remove('scrolled');
    },
  });
}

/* ─── 2. Hero parallax multicapa ─────────────────────────────────────────── */
// Reserved - currently called directly from Hero.astro
export function initHeroParallax() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const eyebrow = document.querySelector('.hero-eyebrow');
  const h1      = document.querySelector('.hero-h1');
  const sub     = document.querySelector('.hero-sub');
  const cta     = document.querySelector('.cta-row');

  if (eyebrow) {
    gsap.to(eyebrow, {
      y: -60, opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: '30% top', scrub: 1,
      },
    });
  }

  if (h1) {
    gsap.to(h1, {
      y: -120, scale: 0.95, ease: 'none',
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: '50% top', scrub: 1.5,
      },
    });
  }

  if (sub) {
    gsap.to(sub, {
      y: -80, opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: '40% top', scrub: 1.2,
      },
    });
  }

  if (cta) {
    gsap.to(cta, {
      y: -40, opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: '35% top', scrub: 1,
      },
    });
  }
}

/* ─── 3. Hero entrance (carga de página) ─────────────────────────────────── */
// Reserved - currently called directly from Hero.astro
export function initHeroEntrance() {
  if (typeof window === 'undefined' || !gsap) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const eyebrow = document.querySelector('.hero-eyebrow');
  const h1      = document.querySelector('.hero-h1');
  const sub     = document.querySelector('.hero-sub');
  const cta     = document.querySelector('.cta-row');

  if (!h1) return;

  const tl = gsap.timeline({ delay: 0.2 });

  if (eyebrow) {
    tl.from(eyebrow, { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out' });
  }

  // H1 carácter por carácter con SplitText
  let split = null;
  if (SplitText) {
    try {
      split = new SplitText(h1, { type: 'chars,words' });
      gsap.set(h1, { perspective: 600 });
      tl.from(
        split.chars,
        { opacity: 0, y: 40, rotateX: -30, stagger: 0.022, duration: 0.65, ease: 'back.out(1.7)' },
        '-=0.3',
      );
    } catch {
      split = null;
    }
  }

  if (!split) {
    tl.from(h1, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.3');
  }

  if (sub) {
    tl.from(sub, { opacity: 0, y: 20, duration: 0.65, ease: 'power3.out' }, '-=0.4');
  }

  if (cta) {
    tl.from(cta, { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.35');
  }
}

/* ─── 4. Scroll Story — capítulos ────────────────────────────────────────── */
// Reserved - currently called directly from ScrollStory.astro
export function initScrollStory() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;

  const section  = document.querySelector('.scrollstory');
  const chapters = document.querySelectorAll('.ss-chapter');
  const dots     = document.querySelectorAll('.ss-dot');

  if (!section || !chapters.length) return;

  chapters.forEach((ch, i) => {
    gsap.set(ch, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 30 });
  });
  dots[0]?.classList.add('active');

  let activeIndex = 0;

  function goTo(index) {
    if (index === activeIndex) return;

    gsap.to(chapters[activeIndex], { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' });
    dots[activeIndex]?.classList.remove('active');

    activeIndex = index;

    gsap.fromTo(
      chapters[activeIndex],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
    );
    dots[activeIndex]?.classList.add('active');
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      let next = 0;
      if (p >= 0.34 && p < 0.67) next = 1;
      else if (p >= 0.67) next = 2;
      goTo(next);
    },
  });
}

/* ─── 5. Split titles ────────────────────────────────────────────────────── */
export function initSplitTitles() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger || !SplitText) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.split-title').forEach((el) => {
    let split;
    try {
      split = new SplitText(el, { type: 'chars,words' });
    } catch {
      return;
    }

    gsap.set(el, { perspective: 600 });
    gsap.from(split.chars, {
      opacity: 0, y: 32, rotateX: -20,
      stagger: 0.025, duration: 0.7, ease: 'back.out(1.5)',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ─── 6. Contadores animados ─────────────────────────────────────────────── */
export function initCounters() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target   = parseFloat(el.getAttribute('data-count') ?? '0');
    const suffix   = el.getAttribute('data-suffix') ?? '';
    const prefix   = el.getAttribute('data-prefix') ?? '';
    const decimals = target % 1 !== 0 ? 1 : 0;
    const obj      = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(obj, {
          val: target, duration: 2.2, ease: 'power2.out',
          onUpdate() {
            el.textContent = prefix + obj.val.toFixed(decimals) + suffix;
          },
        });
      },
    });
  });
}

/* ─── 7. Línea SVG del proceso ───────────────────────────────────────────── */
export function initProcessLine() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;

  const path = document.querySelector('.process-line path');
  if (!path) return;

  let length;
  try { length = path.getTotalLength(); } catch { return; }

  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  gsap.to(path, {
    strokeDashoffset: 0, ease: 'none',
    scrollTrigger: {
      trigger: '.process', start: 'top 70%', end: 'bottom 55%', scrub: 1.2,
    },
  });
}

/* ─── 8. Fade-ups ────────────────────────────────────────────────────────── */
export function initFadeUps() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = document.querySelectorAll('.fade-up');
  const groups = new Map();

  els.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach((children) => {
    gsap.to(children, {
      opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: children[0], start: 'top 88%', once: true },
    });
  });
}

/* ─── 9. Carrusel de proyectos ───────────────────────────────────────────── */
export function initProjectsCarousel() {
  if (typeof window === 'undefined') return;

  const track = document.querySelector('.proj-track');
  if (!track) return;

  let isDragging    = false;
  let startX        = 0;
  let scrollLeftPos = 0;

  track.addEventListener('mousedown', (e) => {
    isDragging    = true;
    startX        = e.pageX - track.getBoundingClientRect().left;
    scrollLeftPos = track.scrollLeft;
    track.style.cursor     = 'grabbing';
    track.style.userSelect = 'none';
  });

  const endDrag = () => {
    isDragging             = false;
    track.style.cursor     = 'grab';
    track.style.userSelect = '';
  };

  track.addEventListener('mouseleave', endDrag);
  track.addEventListener('mouseup',    endDrag);

  track.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - track.getBoundingClientRect().left;
    const walk = (x - startX) * 1.8;
    track.scrollLeft = scrollLeftPos - walk;
  });

  // Touch
  let touchStartX = 0;
  let touchScrollLeft = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX     = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    track.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].pageX);
  }, { passive: true });

  // Botones prev / next
  const cardWidth = () => {
    const card = track.querySelector('.proj-card');
    return card ? card.offsetWidth + 24 : 440;
  };

  document.getElementById('projPrev')?.addEventListener('click', () =>
    track.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));

  document.getElementById('projNext')?.addEventListener('click', () =>
    track.scrollBy({ left: cardWidth(), behavior: 'smooth' }));

  // Dots
  const dots = document.querySelectorAll('.proj-dot');
  if (dots.length) {
    track.addEventListener('scroll', () => {
      const index = Math.round(track.scrollLeft / cardWidth());
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }, { passive: true });
  }
}

/* ─── 10. Carrusel de testimonios ────────────────────────────────────────── */
export function initTestimonials() {
  if (typeof window === 'undefined') return;

  const slides = document.querySelectorAll('.testi-slide');
  const dots   = document.querySelectorAll('.testi-dot');

  if (!slides.length) return;

  let current  = 0;
  let interval = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = ((index % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    clearInterval(interval);
    interval = setInterval(() => goTo(current + 1), 4000);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  const wrapper = document.querySelector('.testi-wrapper');
  wrapper?.addEventListener('mouseenter', () => clearInterval(interval));
  wrapper?.addEventListener('mouseleave', startAuto);

  goTo(0);
  startAuto();
}

/* ─── 11. initAll — punto de entrada ─────────────────────────────────────── */
export function initAll() {
  if (typeof window === 'undefined') return;

  initNavbar();
  // Hero animations are self-contained in Hero.astro
  // ScrollStory animations are self-contained in ScrollStory.astro
  // to avoid conflicts with ScrollTrigger context
  initSplitTitles();
  initCounters();
  initProcessLine();
  initFadeUps();
  initProjectsCarousel();
  initTestimonials();
}

export default initAll;
