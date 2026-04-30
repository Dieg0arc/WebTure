// gsap, ScrollTrigger y SplitText vienen del CDN — se leen dentro de cada función
// para garantizar disponibilidad cuando initAll() se llama en el evento `load`

/* ─── 1. Split titles ────────────────────────────────────────────────────── */
export function initSplitTitles() {
  if (typeof window === 'undefined') return;
  const gsap          = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText     = window.SplitText;
  if (!gsap || !ScrollTrigger || !SplitText) return;
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

/* ─── 2. Contadores animados ─────────────────────────────────────────────── */
export function initCounters() {
  if (typeof window === 'undefined') return;
  const gsap          = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

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
        if (prefersReduced) {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
          return;
        }
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

/* ─── 3. Línea SVG del proceso ───────────────────────────────────────────── */
export function initProcessLine() {
  if (typeof window === 'undefined') return;
  const gsap          = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

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

/* ─── 4. Fade-ups ────────────────────────────────────────────────────────── */
export function initFadeUps() {
  if (typeof window === 'undefined') return;
  const gsap          = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els    = document.querySelectorAll('.fade-up');
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

/* ─── 5. Carrusel de proyectos ───────────────────────────────────────────── */
export function initProjectsCarousel() {
  if (typeof window === 'undefined') return;

  const track = document.querySelector('.proj-track');
  if (!track) return;

  const gsap           = window.gsap;
  const ScrollTrigger  = window.ScrollTrigger;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Entrada staggered de cards ─────────────────────────────────────────── */
  if (gsap && ScrollTrigger && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);
    const cards = document.querySelectorAll('.proj-card');
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '.projects', start: 'top 80%', once: true },
        },
      );
    }
  }

  /* ── Drag (mouse) ─────────────────────────────────────────────────────────── */
  let isDragging = false, startX = 0, scrollLeftPos = 0;

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

  /* ── Touch ────────────────────────────────────────────────────────────────── */
  let touchStartX = 0, touchScrollLeft = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX     = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    track.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].pageX);
  }, { passive: true });

  /* ── Botones prev / next ──────────────────────────────────────────────────── */
  const cardWidth = () => {
    const card = track.querySelector('.proj-card');
    return card ? card.offsetWidth + 24 : 444;
  };

  document.getElementById('projPrev')?.addEventListener('click', () =>
    track.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));
  document.getElementById('projNext')?.addEventListener('click', () =>
    track.scrollBy({ left: cardWidth(), behavior: 'smooth' }));

  /* ── Dots sincronizados con scroll ───────────────────────────────────────── */
  const dots = document.querySelectorAll('.proj-dot');
  if (dots.length) {
    track.addEventListener('scroll', () => {
      const index = Math.round(track.scrollLeft / cardWidth());
      dots.forEach((d, i) => {
        const active = i === index;
        d.classList.toggle('active', active);
        d.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }, { passive: true });
  }
}

/* ─── 6. initAll — punto de entrada ─────────────────────────────────────── */
// Navbar:     IIFE self-contained en Navbar.astro
// Hero:       self-contained en Hero.astro
// ScrollStory: self-contained en ScrollStory.astro
// Testimonials: self-contained en Metrics.astro
export function initAll() {
  if (typeof window === 'undefined') return;
  initSplitTitles();
  initCounters();
  initProcessLine();
  initFadeUps();
  initProjectsCarousel();
}

export default initAll;
