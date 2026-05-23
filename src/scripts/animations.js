// gsap, ScrollTrigger y SplitText vienen del CDN cargado en <head>
// No importamos desde npm para evitar duplicar el bundle de Vite
const gsap          = typeof window !== 'undefined' ? window.gsap          : null;
const ScrollTrigger = typeof window !== 'undefined' ? window.ScrollTrigger : null;
const SplitText     = typeof window !== 'undefined' ? window.SplitText     : null;

/* ─── 1. Split titles ────────────────────────────────────────────────────── */
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

/* ─── 2. Contadores animados ─────────────────────────────────────────────── */
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

/* ─── 3. Fade-ups ────────────────────────────────────────────────────────── */
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

/* ─── 4. Carrusel de proyectos ───────────────────────────────────────────── */
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

  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      clearTimeout(autoTimer);
      goToCard(i);
      setTimeout(scheduleAuto, 8000);
    });
  });

  activateIndicator(0);
  scheduleAuto();
}

/* ─── 5. Cursor personalizado ───────────────────────────────────────────── */
export function initCustomCursor() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.cur-dot')) return;

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

  setTimeout(bindHover, 1500);
  setTimeout(bindHover, 4000);
}

/* ─── 6. Botones magnéticos ─────────────────────────────────────────────── */
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

/* ─── 7. 3D Tilt en service cards ───────────────────────────────────────── */
export function initTiltCards() {
  if (typeof window === 'undefined' || !gsap) return;
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

/* ─── 8. Word reveal en section titles ──────────────────────────────────── */
export function initWordReveal() {
  if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (!document.getElementById('word-reveal-style')) {
    const style = document.createElement('style');
    style.id = 'word-reveal-style';
    style.textContent = `
      .word-wrap{display:inline-block;overflow:hidden;vertical-align:top;line-height:inherit;padding:.05em 0}
      .word-wrap .word-inner{display:inline-block;transform:translateY(110%);will-change:transform}
    `;
    document.head.appendChild(style);
  }

  const selectors = '.section-title, .scrollstory-title, .projects-title, .services-title, .metrics-title, .process-title, .pricing-title, .build-title';
  document.querySelectorAll(selectors).forEach((el) => {
    if (el.__wordRevealBound) return;
    if (el.matches('.split-title')) return;
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

/* ─── 9. Clip-path block reveal ─────────────────────────────────────────── */
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

  els.forEach((el) => {
    const dir = el.getAttribute('data-clip') || 'bottom';
    gsap.set(el, { clipPath: CLIP_START[dir] || CLIP_START.bottom });
  });

  const groups = new Map();
  els.forEach((el) => {
    const key = el.parentElement;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });

  groups.forEach((children, parent) => {
    const dir      = children[0].getAttribute('data-clip') || 'bottom';
    const hasStagger = children.length > 1;

    gsap.to(children, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.1,
      ease: 'expo.out',
      stagger: hasStagger ? 0.1 : 0,
      scrollTrigger: { trigger: parent, start: 'top 88%', once: true },
    });
  });
}

/* ─── 10. Snap on idle ───────────────────────────────────────────────────── */
export function initSectionSnap() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const IDLE_DELAY  = 750;
  const MIN_OFFSET  = 60;
  const MIN_VISIBLE = 0.4;

  let snapEls    = [];
  let idleTimer  = null;
  let isSnapping = false;

  function loadSections() {
    snapEls = Array.from(
      document.querySelectorAll('section:not(#proceso):not(.scrollstory)')
    );
  }

  function snapToNearest() {
    if (isSnapping || !snapEls.length) return;

    const scrollY = window.scrollY;
    const vh      = window.innerHeight;

    const processEl = document.querySelector('section#proceso');
    if (processEl) {
      const r = processEl.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) return;
    }

    let bestEl   = null;
    let bestArea = -1;

    for (const el of snapEls) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= vh) continue;

      const overlap = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      if (overlap < vh * MIN_VISIBLE) continue;

      if (overlap > bestArea) {
        bestArea = overlap;
        bestEl   = el;
      }
    }

    if (!bestEl) return;

    const rect    = bestEl.getBoundingClientRect();
    const targetY = Math.max(0, scrollY + rect.top);
    const dist    = Math.abs(scrollY - targetY);

    if (dist < MIN_OFFSET) return;

    isSnapping = true;
    const lenis  = window.__lenis;
    const onDone = () => { isSnapping = false; };

    if (lenis) {
      lenis.scrollTo(targetY, { duration: 0.55, onComplete: onDone });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setTimeout(onDone, 700);
    }
  }

  window.addEventListener('scroll', () => {
    if (isSnapping) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(snapToNearest, IDLE_DELAY);
  }, { passive: true });

  if (document.readyState === 'complete') {
    loadSections();
  } else {
    window.addEventListener('load', loadSections, { once: true });
  }
}

/* ─── initAll — punto de entrada ─────────────────────────────────────────── */
export function initAll() {
  if (typeof window === 'undefined') return;

  initSplitTitles();
  initCounters();
  initFadeUps();
  initProjectsCarousel();
  initCustomCursor();
  initMagneticButtons();
  initTiltCards();
  initWordReveal();
  initClipReveal();
  initSectionSnap();
}

export default initAll;
