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

  const cards      = Array.from(track.querySelectorAll('.proj-card'));
  const indicators = Array.from(document.querySelectorAll('.proj-indicator'));
  const TOTAL      = cards.length;
  if (!TOTAL) return;

  let currentIndex  = 0;
  let autoTimer     = null;

  function getCardWidth() {
    const card = cards[0];
    return card ? card.offsetWidth + 24 : 444; // gap: 24px
  }

  function goToCard(index) {
    track.scrollTo({ left: index * getCardWidth(), behavior: 'smooth' });
  }

  function activateIndicator(index) {
    const prev = indicators[currentIndex];
    if (prev) {
      prev.classList.remove('active');
      prev.setAttribute('aria-selected', 'false');
    }
    currentIndex = index;
    const next = indicators[index];
    if (next) {
      void next.offsetWidth; // force CSS animation restart
      next.classList.add('active');
      next.setAttribute('aria-selected', 'true');
    }
  }

  function scheduleAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => goToCard((currentIndex + 1) % TOTAL), 5000);
  }

  // Update indicator when scroll settles (CSS snap handles the physics)
  let scrollSettleTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer = setTimeout(() => {
      const index = Math.max(0, Math.min(TOTAL - 1, Math.round(track.scrollLeft / getCardWidth())));
      if (index !== currentIndex) activateIndicator(index);
      scheduleAuto();
    }, 80);
  }, { passive: true });

  // Desktop drag only — touch scrolling is handled natively by CSS scroll-snap
  let isDragging    = false;
  let startX        = 0;
  let scrollLeftPos = 0;

  track.addEventListener('mousedown', (e) => {
    isDragging    = true;
    startX        = e.pageX - track.getBoundingClientRect().left;
    scrollLeftPos = track.scrollLeft;
    track.style.cursor     = 'grabbing';
    track.style.userSelect = 'none';
    clearTimeout(autoTimer);
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

  // Prev / next buttons
  document.getElementById('projPrev')?.addEventListener('click', () => {
    clearTimeout(autoTimer);
    track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    setTimeout(scheduleAuto, 8000);
  });

  document.getElementById('projNext')?.addEventListener('click', () => {
    clearTimeout(autoTimer);
    track.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    setTimeout(scheduleAuto, 8000);
  });

  // Indicator dots
  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      clearTimeout(autoTimer);
      goToCard(i);
      setTimeout(scheduleAuto, 8000);
    });
  });

  // Initialize first indicator and start auto-advance
  activateIndicator(0);
  scheduleAuto();
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

/* ─── 11. Cursor personalizado ───────────────────────────────────────────── */
export function initCustomCursor() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.cur-dot')) return; // ya inicializado

  // Inyecta estilos
  const style = document.createElement('style');
  style.textContent = `
    .cur-dot,.cur-ring{position:fixed;top:0;left:0;pointer-events:none;z-index:9999;border-radius:50%;mix-blend-mode:difference;will-change:transform}
    .cur-dot{width:6px;height:6px;background:#fff;margin:-3px 0 0 -3px;transition:transform .18s ease,opacity .2s}
    .cur-ring{width:36px;height:36px;border:1px solid rgba(255,255,255,.45);margin:-18px 0 0 -18px;transition:transform .35s cubic-bezier(.2,1,.3,1),opacity .25s,border-color .25s,width .3s,height .3s}
    .cur-ring.hov{width:64px;height:64px;margin:-32px 0 0 -32px;border-color:rgba(255,255,255,.75)}
    .cur-dot.hov{opacity:0}
    .cur-hidden{opacity:0}
    @media(max-width:768px),(pointer:coarse){.cur-dot,.cur-ring{display:none}}
  `;
  document.head.appendChild(style);

  const dot  = document.createElement('div'); dot.className  = 'cur-dot';
  const ring = document.createElement('div'); ring.className = 'cur-ring';
  document.body.append(dot, ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
  });
  window.addEventListener('mouseleave', () => {
    dot.classList.add('cur-hidden');
    ring.classList.add('cur-hidden');
  });
  window.addEventListener('mouseenter', () => {
    dot.classList.remove('cur-hidden');
    ring.classList.remove('cur-hidden');
  });

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  }
  loop();

  const hovSel = 'a, button, .btn-primary, .btn-ghost, .btn-nav, .proj-card, .svc-card, .btn-cta, .wa-btn, input, textarea, .logo, .footer-logo, .mst-ncta, .mst-hbp';
  function bindHover(root = document) {
    root.querySelectorAll(hovSel).forEach((el) => {
      if (el.__curBound) return;
      el.__curBound = true;
      el.addEventListener('mouseenter', () => { ring.classList.add('hov'); dot.classList.add('hov'); });
      el.addEventListener('mouseleave', () => { ring.classList.remove('hov'); dot.classList.remove('hov'); });
    });
  }
  bindHover();

  // Re-bind cada cierto tiempo para elementos creados dinámicamente
  setTimeout(bindHover, 1500);
  setTimeout(bindHover, 4000);
}

/* ─── 12. Botones magnéticos ─────────────────────────────────────────────── */
export function initMagneticButtons() {
  if (typeof window === 'undefined' || !gsap) return;
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav, .wa-btn, .proj-btn').forEach((btn) => {
    if (btn.__magBound) return;
    btn.__magBound = true;
    const strength = btn.classList.contains('proj-btn') ? 0.4 : 0.25;

    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top  - r.height / 2;
      gsap.to(btn, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power3.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ─── 13. 3D Tilt en service cards ───────────────────────────────────────── */
export function initTiltCards() {
  if (typeof window === 'undefined' || !gsap) return;
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Inyecta estilo para el glow follow
  if (!document.getElementById('tilt-style')) {
    const style = document.createElement('style');
    style.id = 'tilt-style';
    style.textContent = `
      .svc-card{transform-style:preserve-3d;will-change:transform}
      .svc-card::before{content:'';position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(179,136,255,.12) 0%,transparent 60%);transform:translate(-50%,-50%);left:var(--mx,50%);top:var(--my,50%);opacity:0;transition:opacity .35s;pointer-events:none;z-index:0}
      .svc-card:hover::before{opacity:1}
      .svc-card > *:not(.svc-num){position:relative;z-index:1}
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('.svc-card').forEach((card) => {
    if (card.__tiltBound) return;
    card.__tiltBound = true;

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top)  / r.height;
      const rx = (py - 0.5) * -8;
      const ry = (px - 0.5) *  8;
      gsap.to(card, {
        rotateX: rx, rotateY: ry, transformPerspective: 800,
        duration: 0.5, ease: 'power3.out',
      });
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ─── 14. Word reveal en section titles ──────────────────────────────────── */
export function initWordReveal() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Inyecta estilo
  if (!document.getElementById('word-reveal-style')) {
    const style = document.createElement('style');
    style.id = 'word-reveal-style';
    style.textContent = `
      .word-wrap{display:inline-block;overflow:hidden;vertical-align:top;line-height:inherit;padding:.05em 0}
      .word-wrap .word-inner{display:inline-block;transform:translateY(110%);will-change:transform}
    `;
    document.head.appendChild(style);
  }

  // Aplica a títulos de sección comunes en el proyecto
  const selectors = '.section-title, .scrollstory-title, .projects-title, .services-title, .metrics-title, .process-title, .pricing-title, .contact-title, .build-title';
  document.querySelectorAll(selectors).forEach((el) => {
    if (el.__wordRevealBound) return;
    if (el.matches('.split-title')) return; // Split titles are handled by SplitText and should not be rewrapped
    el.__wordRevealBound = true;

    const parts = el.innerHTML.split(/(<br\s*\/?\s*>)/i);
    el.innerHTML = parts
      .map((part) => {
        if (/<br/i.test(part)) return part;
        return part
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => `<span class="word-wrap"><span class="word-inner">${w}</span></span>`)
          .join(' ');
      })
      .join('');

    const words = el.querySelectorAll('.word-inner');
    if (!words.length) return;

    gsap.to(words, {
      y: '0%', duration: 0.95, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });

    el.classList.remove('fade-up');
    el.style.opacity = 1;
    el.style.transform = 'none';
  });
}

/* ─── 15. Image mask reveal en thumbnails ────────────────────────────────── */
export function initMaskReveal() {
  if (typeof window === 'undefined' || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (!document.getElementById('mask-reveal-style')) {
    const style = document.createElement('style');
    style.id = 'mask-reveal-style';
    style.textContent = `
      .proj-thumb{position:relative}
      .proj-thumb::after{content:'';position:absolute;inset:0;background:var(--bg, #080808);transform-origin:left center;transform:scaleX(1);z-index:2}
      .proj-thumb.reveal::after{transform:scaleX(0);transition:transform 1.1s cubic-bezier(.76,0,.24,1)}
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('.proj-thumb').forEach((t) => {
    if (t.__maskRevealBound) return;
    t.__maskRevealBound = true;
    ScrollTrigger.create({
      trigger: t, start: 'top 90%', once: true,
      onEnter: () => t.classList.add('reveal'),
    });
  });
}

/* ─── 16. Marquee dinámico (acelera con scroll) ──────────────────────────── */
export function initMarqueeSpeed() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // CSS animation is smoother on touch

  const track = document.querySelector('.marquee-track');
  if (!track) return;

  let baseDur = parseFloat(getComputedStyle(track).animationDuration) || 38;
  let currentDur = baseDur;
  let lastY = window.scrollY;

  function tick() {
    const vel = window.scrollY - lastY;
    lastY = window.scrollY;
    const target = baseDur / (1 + Math.min(2.5, Math.abs(vel) * 0.08));
    currentDur += (target - currentDur) * 0.1;
    track.style.animationDuration = currentDur.toFixed(2) + 's';
    requestAnimationFrame(tick);
  }
  tick();
}

/* ─── 18. Clip-path block reveal — estilo editorial (Vettvangur) ─────────── */
// Uso: agrega data-clip="bottom|top|left|right" a cualquier elemento.
// El elemento se "destapa" con una máscara al entrar en viewport.
// Hermanos con el mismo data-clip dentro de un mismo padre se revelan en stagger.
export function initClipReveal() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CLIP_START = {
    bottom: 'inset(0% 0% 100% 0%)',
    top:    'inset(100% 0% 0% 0%)',
    left:   'inset(0% 100% 0% 0%)',
    right:  'inset(0% 0% 0% 100%)',
  };

  const els = document.querySelectorAll('[data-clip]');
  if (!els.length) return;

  // Pone todos en estado inicial de inmediato (evita flash antes del load)
  els.forEach((el) => {
    const dir = el.getAttribute('data-clip') || 'bottom';
    gsap.set(el, { clipPath: CLIP_START[dir] || CLIP_START.bottom });
  });

  // Agrupa hermanos del mismo padre para stagger automático
  const groups = new Map();
  els.forEach((el) => {
    const key = el.parentElement;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });

  groups.forEach((children, parent) => {
    const dir   = children[0].getAttribute('data-clip') || 'bottom';
    const start = CLIP_START[dir] || CLIP_START.bottom;
    const hasStagger = children.length > 1;

    gsap.to(children, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.1,
      ease: 'expo.out',
      stagger: hasStagger ? 0.1 : 0,
      scrollTrigger: {
        trigger: parent,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

/* ─── 17. initAll — punto de entrada ─────────────────────────────────────── */
export function initAll() {
  if (typeof window === 'undefined') return;

  // initNavbar() removed — Navbar.astro inline script owns the scroll state
  // and is already resilient to CDN failure
  // Hero animations are self-contained in Hero.astro
  // ScrollStory animations are self-contained in ScrollStory.astro
  // to avoid conflicts with ScrollTrigger context
  initSplitTitles();
  initCounters();
  initProcessLine();
  initFadeUps();
  initProjectsCarousel();
  initTestimonials();

  // ── Nuevas animaciones profesionales ──
  initCustomCursor();
  initMagneticButtons();
  initTiltCards();
  initWordReveal();
  initMaskReveal();
  initMarqueeSpeed();
  initClipReveal();
}

export default initAll;
