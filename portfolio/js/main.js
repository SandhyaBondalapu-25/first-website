/**
 * Jordan Ellis — Portfolio
 * main.js
 */

(function () {
  'use strict';

  /* ─── Wait for GSAP ─────────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      waitForGSAP(fn);
    } else {
      document.addEventListener('DOMContentLoaded', () => waitForGSAP(fn));
    }
  }

  function waitForGSAP(fn) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      fn();
    } else {
      setTimeout(() => waitForGSAP(fn), 60);
    }
  }

  /* ─── Theme ──────────────────────────────────────────────────── */
  function initTheme() {
    const html    = document.documentElement;
    const toggle  = document.getElementById('themeToggle');
    const stored  = localStorage.getItem('je-theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = stored || prefers;

    applyTheme(initial);

    toggle?.addEventListener('click', () => {
      const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('je-theme', next);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('je-theme')) applyTheme(e.matches ? 'dark' : 'light');
    });

    function applyTheme(theme) {
      html.dataset.theme = theme;
      toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    }
  }

  /* ─── Scroll progress bar ───────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${(window.scrollY / total) * 100}%`;
    }, { passive: true });
  }

  /* ─── Header scroll state ───────────────────────────────────── */
  function initHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const toggle = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  /* ─── Hamburger / Nav Overlay ───────────────────────────────── */
  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('navOverlay');
    const closeBtn  = document.getElementById('navClose');
    const backdrop  = document.getElementById('navBackdrop');
    const navLinks  = overlay?.querySelectorAll('.nav-link, .nav-cta, .nav-close, .social-icon');
    if (!hamburger || !overlay) return;

    let isOpen = false;

    function getFocusable() {
      return [...overlay.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(el => !el.closest('[hidden]'));
    }

    function openMenu() {
      isOpen = true;
      overlay.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => getFocusable()[0]?.focus(), 100);
    }

    function closeMenu() {
      isOpen = false;
      overlay.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      overlay.setAttribute('aria-hidden', 'true');
      hamburger.focus();
    }

    hamburger.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
    closeBtn?.addEventListener('click', closeMenu);
    backdrop?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', e => {
      if (!isOpen) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
        }
      }
    });

    // Close on nav link click
    overlay.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ─── Active nav link on scroll ────────────────────────────── */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link[data-section]');
    if (!sections.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active-link', l.dataset.section === entry.target.id));
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => obs.observe(s));
  }

  /* ─── GSAP Hero Animations ──────────────────────────────────── */
  function initHeroAnimations() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Smooth anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        gsap.to(window, { duration: 0.9, scrollTo: { y: target, offsetY: 80 }, ease: 'power3.inOut' });
      });
    });

    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    tl.from('[data-hero="eyebrow"]',  { opacity: 0, y: 20, duration: 0.6 })
      .from('[data-hero="line"]',     { opacity: 0, y: 50, stagger: 0.12 }, '-=0.3')
      .from('[data-hero="subtitle"]', { opacity: 0, y: 24 }, '-=0.4')
      .from('[data-hero="ctas"]',     { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from('[data-hero="stats"]',    { opacity: 0, y: 20, duration: 0.6 }, '-=0.2');

    // Parallax orbs on scroll
    gsap.to('.orb--1', {
      y: -120, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
    gsap.to('.orb--2', {
      y: -80, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.8 }
    });
    gsap.to('.orb--3', {
      y: -60, x: 30, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 2 }
    });

    // About image parallax
    gsap.to('.about-img', {
      y: -50, ease: 'none',
      scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  }

  /* ─── Scroll Reveal (IntersectionObserver) ──────────────────── */
  function initScrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseFloat(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('revealed'), delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ─── Animated Counters ─────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const end   = parseInt(el.dataset.count, 10);
        const dur   = 1800;
        const step  = 16;
        const steps = dur / step;
        let current = 0;

        const timer = setInterval(() => {
          current = Math.min(current + end / steps, end);
          el.textContent = Math.floor(current);
          if (current >= end) { el.textContent = end; clearInterval(timer); }
        }, step);

        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => obs.observe(el));
  }

  /* ─── 3D Tilt Cards ─────────────────────────────────────────── */
  function initTiltCards() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.service-card, .glass-card').forEach(card => {
      card.classList.add('tilt-card');

      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = -dy * 6;
        const rotY   =  dx * 6;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
    });
  }

  /* ─── Testimonials Carousel ─────────────────────────────────── */
  function initTestimonialsCarousel() {
    const track    = document.getElementById('testiTrack');
    const prevBtn  = document.getElementById('testiPrev');
    const nextBtn  = document.getElementById('testiNext');
    const dotsWrap = document.getElementById('testiDots');
    if (!track) return;

    const cards    = [...track.querySelectorAll('.testi-card')];
    let current    = 0;
    let autoTimer  = null;
    let touchStart = 0;

    const perView = () => window.innerWidth <= 768 ? 1 : 2;

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const total = maxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const d = document.createElement('button');
        d.className = 'testi-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', `Go to slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function updateDots() {
      dotsWrap?.querySelectorAll('.testi-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex()));
      const cardW = cards[0]?.offsetWidth || 0;
      const gap   = 24;
      track.style.transform = `translateX(-${current * (cardW + gap)}px)`;
      track.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      updateDots();
    }

    function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

    function startAuto() { autoTimer = setInterval(next, 5000); }
    function stopAuto()  { clearInterval(autoTimer); }

    buildDots();
    startAuto();

    nextBtn?.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    prevBtn?.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });

    track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchStart - e.changedTouches[0].clientX;
      stopAuto();
      if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
      startAuto();
    }, { passive: true });

    window.addEventListener('resize', () => { buildDots(); goTo(0); });

    document.addEventListener('keydown', e => {
      const inView = track.getBoundingClientRect();
      if (inView.top > window.innerHeight || inView.bottom < 0) return;
      if (e.key === 'ArrowRight') { stopAuto(); next(); startAuto(); }
      if (e.key === 'ArrowLeft')  { stopAuto(); prev(); startAuto(); }
    });
  }

  /* ─── Work Filter ───────────────────────────────────────────── */
  function initWorkFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards  = document.querySelectorAll('#workGrid .work-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        workCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('filtered-out', !match);
        });
      });
    });
  }

  /* ─── Custom Cursor ─────────────────────────────────────────── */
  function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top  = `${mouseY}px`;
    }, { passive: true });

    (function loop() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top  = `${ringY}px`;
      requestAnimationFrame(loop);
    })();

    const hover = document.querySelectorAll(
      'a, button, .filter-btn, .testi-btn, .work-view-btn, .social-icon, input, textarea, select, .skill-pill'
    );
    hover.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = ''; });
  }

  /* ─── Back to Top ───────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      gsap.to(window, { duration: 0.8, scrollTo: 0, ease: 'power3.inOut' });
    });
  }

  /* ─── Contact Form ──────────────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = document.getElementById('formSubmit');
      if (!btn) return;

      btn.disabled = true;
      btn.querySelector('.submit-text').style.display = 'none';

      const sendingSpan = document.createElement('span');
      sendingSpan.textContent = 'Sending…';
      btn.prepend(sendingSpan);

      setTimeout(() => {
        btn.disabled = false;
        sendingSpan.remove();
        btn.querySelector('.submit-text').style.display = '';
        form.reset();

        const msg = document.createElement('p');
        msg.textContent = '✓ Message sent! I\'ll be in touch soon.';
        msg.style.cssText = 'text-align:center;color:#43E97B;font-weight:600;font-size:0.9375rem;';
        form.appendChild(msg);
        setTimeout(() => msg.remove(), 4000);
      }, 1800);
    });
  }

  /* ─── Bar chart animation in Why section ───────────────────── */
  function initBarAnimation() {
    const bars = document.querySelectorAll('.bar-fill');
    if (!bars.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'barGrow 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s both';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(b => obs.observe(b));
  }

  /* ─── GSAP ScrollTrigger section reveals ───────────────────── */
  function initGSAPReveal() {
    gsap.utils.toArray('.stat-block').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
        }
      });
    });
  }

  /* ─── Init ──────────────────────────────────────────────────── */
  ready(function () {
    initTheme();
    initScrollProgress();
    initHeader();
    initHamburger();
    initActiveNav();
    initHeroAnimations();
    initScrollReveal();
    initCounters();
    initTiltCards();
    initTestimonialsCarousel();
    initWorkFilter();
    initCustomCursor();
    initBackToTop();
    initContactForm();
    initBarAnimation();
    initGSAPReveal();
  });

})();
