/**
 * Alex Morgan Portfolio — main.js
 * All interactivity in a single IIFE.
 */
(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx){ return [...(ctx || document).querySelectorAll(sel)]; }

  /* ── Boot: wait for GSAP deferred scripts ───────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') waitGSAP(fn);
    else document.addEventListener('DOMContentLoaded', () => waitGSAP(fn));
  }

  function waitGSAP(fn) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') fn();
    else setTimeout(() => waitGSAP(fn), 60);
  }

  /* ══════════════════════════════════════════════════════
     THEME
  ══════════════════════════════════════════════════════ */
  function initTheme() {
    const html   = document.documentElement;
    const btn    = $('#themeToggle');
    const stored = localStorage.getItem('am-theme');
    const sys    = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    apply(stored || sys);

    btn?.addEventListener('click', () => {
      const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem('am-theme', next);
    });

    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('am-theme')) apply(e.matches ? 'dark' : 'light');
    });

    function apply(t) {
      html.dataset.theme = t;
      btn?.setAttribute('aria-pressed', String(t === 'dark'));
    }
  }

  /* ══════════════════════════════════════════════════════
     SCROLL PROGRESS
  ══════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = $('#scrollProgress');
    if (!bar) return;
    addEventListener('scroll', () => {
      const pct = scrollY / (document.documentElement.scrollHeight - innerHeight) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════
     STICKY HEADER
  ══════════════════════════════════════════════════════ */
  function initHeader() {
    const hdr = $('#siteHeader');
    if (!hdr) return;
    const tick = () => hdr.classList.toggle('scrolled', scrollY > 40);
    addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ══════════════════════════════════════════════════════
     NAV DRAWER
  ══════════════════════════════════════════════════════ */
  function initDrawer() {
    const toggle   = $('#menuToggle');
    const drawer   = $('#navDrawer');
    const closeBtn = $('#drawerClose');
    const backdrop = $('#drawerBackdrop');
    if (!toggle || !drawer) return;

    let open = false;

    const focusable = () => $$('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])', drawer)
      .filter(el => !el.closest('[hidden]'));

    function openDrawer() {
      open = true;
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      drawer.removeAttribute('aria-hidden');
      setTimeout(() => focusable()[0]?.focus(), 100);
    }

    function closeDrawer() {
      open = false;
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      drawer.setAttribute('aria-hidden', 'true');
      toggle.focus();
    }

    toggle.addEventListener('click', () => open ? closeDrawer() : openDrawer());
    closeBtn?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', e => {
      if (!open) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') {
        const items = focusable();
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
        else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
      }
    });

    $$('.dnav-link', drawer).forEach(l => l.addEventListener('click', closeDrawer));
  }

  /* ══════════════════════════════════════════════════════
     GSAP HERO + PARALLAX
  ══════════════════════════════════════════════════════ */
  function initHero() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* Smooth anchor scroll */
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = $(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 80 }, ease: 'power3.inOut' });
      });
    });

    /* Hero entrance timeline */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('[data-h="eyebrow"]', { opacity: 0, y: 20, duration: .6 })
      .from('[data-h="line"]',    { opacity: 0, y: 56, stagger: .12, duration: .8 }, '-=.3')
      .from('[data-h="sub"]',     { opacity: 0, y: 24, duration: .7 }, '-=.4')
      .from('[data-h="btns"]',    { opacity: 0, y: 20, duration: .6 }, '-=.3')
      .from('[data-h="kpis"]',    { opacity: 0, y: 20, duration: .6 }, '-=.2')
      .from('[data-h="visual"]',  { opacity: 0, x: 40, duration: .9 }, '-=.7');

    /* Blob parallax */
    ['.blob--a','.blob--b','.blob--c'].forEach((sel, i) => {
      gsap.to(sel, {
        y: -80 - i * 20, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 + i * .3 }
      });
    });

    /* About image parallax */
    gsap.to('.about-img', {
      y: -48, ease: 'none',
      scrollTrigger: { trigger: '.about-sec', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  }

  /* ══════════════════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════════════════ */
  function initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
        obs.unobserve(el);
      });
    }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });

    $$('[data-reveal]').forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════════════════════════════
     ANIMATED COUNTERS
  ══════════════════════════════════════════════════════ */
  function initCounters() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1800, step = 16, steps = dur / step;
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + end / steps, end);
          el.textContent = Math.floor(cur);
          if (cur >= end) { el.textContent = end; clearInterval(t); }
        }, step);
        obs.unobserve(el);
      });
    }, { threshold: .5 });

    $$('[data-count]').forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════════════════════════════
     3-D TILT CARDS
  ══════════════════════════════════════════════════════ */
  function initTilt() {
    if (matchMedia('(hover:none)').matches) return;

    $$('.glass-card,.svc-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale3d(1.015,1.015,1.015)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     TESTIMONIALS CAROUSEL
  ══════════════════════════════════════════════════════ */
  function initCarousel() {
    const track  = $('#testiTrack');
    const prev   = $('#tPrev');
    const next   = $('#tNext');
    const dotsEl = $('#tDots');
    if (!track) return;

    const cards    = $$('.testi-card', track);
    let cur        = 0;
    let timer      = null;
    let touchStart = 0;

    const perView  = () => innerWidth <= 768 ? 1 : 2;
    const maxIdx   = () => Math.max(0, cards.length - perView());

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      for (let i = 0; i <= maxIdx(); i++) {
        const d = document.createElement('button');
        d.className = 'tc-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
      }
    }

    function updateDots() {
      $$('.tc-dot', dotsEl).forEach((d, i) => d.classList.toggle('active', i === cur));
    }

    function goTo(i) {
      cur = Math.max(0, Math.min(i, maxIdx()));
      const w = cards[0]?.offsetWidth || 0;
      track.style.transform  = `translateX(-${cur * (w + 24)}px)`;
      track.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1)';
      updateDots();
    }

    const fwd = () => goTo(cur >= maxIdx() ? 0 : cur + 1);
    const bwd = () => goTo(cur <= 0 ? maxIdx() : cur - 1);

    const startAuto = () => { timer = setInterval(fwd, 5000); };
    const stopAuto  = () => clearInterval(timer);

    buildDots();
    startAuto();

    next?.addEventListener('click', () => { stopAuto(); fwd(); startAuto(); });
    prev?.addEventListener('click', () => { stopAuto(); bwd(); startAuto(); });

    track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStart - e.changedTouches[0].clientX;
      stopAuto();
      if (Math.abs(diff) > 40) diff > 0 ? fwd() : bwd();
      startAuto();
    }, { passive: true });

    addEventListener('resize', () => { buildDots(); goTo(0); });

    document.addEventListener('keydown', e => {
      const r = track.getBoundingClientRect();
      if (r.top > innerHeight || r.bottom < 0) return;
      if (e.key === 'ArrowRight') { stopAuto(); fwd(); startAuto(); }
      if (e.key === 'ArrowLeft')  { stopAuto(); bwd(); startAuto(); }
    });
  }

  /* ══════════════════════════════════════════════════════
     WORK FILTER
  ══════════════════════════════════════════════════════ */
  function initFilter() {
    const btns  = $$('.wf-btn');
    const cards = $$('#workGrid .work-card');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        cards.forEach(c => c.classList.toggle('hidden', f !== 'all' && c.dataset.cat !== f));
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     CUSTOM CURSOR
  ══════════════════════════════════════════════════════ */
  function initCursor() {
    if (matchMedia('(hover:none)').matches) return;
    const dot  = $('#cursorDot');
    const ring = $('#cursorRing');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * .12;
      ry += (my - ry) * .12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    })();

    $$('a,button,.wf-btn,.tc-btn,.soc,.stag,input,select,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('grow'));
      el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = ''; });
  }

  /* ══════════════════════════════════════════════════════
     BACK TO TOP
  ══════════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 500), { passive: true });
    btn.addEventListener('click', () => gsap.to(window, { duration: .85, scrollTo: 0, ease: 'power3.inOut' }));
  }

  /* ══════════════════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════════════════ */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn  = $('#cfSubmit');
      const span = btn?.querySelector('.cf-submit-text');
      if (!btn) return;

      btn.disabled = true;
      if (span) span.textContent = 'Sending…';

      setTimeout(() => {
        btn.disabled = false;
        if (span) span.textContent = 'Send Message';
        form.reset();
        const msg = document.createElement('p');
        msg.textContent = '✓ Sent! I\'ll be in touch shortly.';
        msg.style.cssText = 'text-align:center;color:#3DDBA8;font-weight:600;font-size:.9375rem;';
        form.appendChild(msg);
        setTimeout(() => msg.remove(), 4000);
      }, 1800);
    });
  }

  /* ══════════════════════════════════════════════════════
     GSAP STAT REVEALS
  ══════════════════════════════════════════════════════ */
  function initGSAPReveals() {
    gsap.utils.toArray('.stat-item').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0, y: 40, duration: .7, delay: i * .1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     BAR CHART ANIMATION
  ══════════════════════════════════════════════════════ */
  function initBars() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'barGrow 1.2s cubic-bezier(.22,1,.36,1) .3s both';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });
    $$('.wbar-fill').forEach(b => obs.observe(b));
  }

  /* ══════════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════════ */
  ready(() => {
    initTheme();
    initScrollProgress();
    initHeader();
    initDrawer();
    initHero();
    initReveal();
    initCounters();
    initTilt();
    initCarousel();
    initFilter();
    initCursor();
    initBackToTop();
    initForm();
    initGSAPReveals();
    initBars();
  });

})();
