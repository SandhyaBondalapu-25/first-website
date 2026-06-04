/**
 * Jordan Ellis Portfolio — main.js
 * All interactivity in one strict-mode IIFE.
 *
 * Modules (in execution order):
 *  01  Theme (localStorage + prefers-color-scheme)
 *  02  Scroll Progress Bar
 *  03  Header scroll-awareness
 *  04  Nav Drawer (open/close, focus-trap, ESC)
 *  05  Smooth anchor scrolling
 *  06  Scroll Reveal (IntersectionObserver)
 *  07  Animated Counters (IntersectionObserver)
 *  08  3D Tilt on glass cards
 *  09  Testimonials Carousel (autoplay, touch, keyboard, dots)
 *  10  Work Filter
 *  11  Custom Cursor
 *  12  Back-to-Top
 *  13  Contact Form (mock submit)
 *  14  Why-section bar chart animation
 *  15  GSAP hero entrance + parallax (deferred, polled)
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     01  THEME
  ══════════════════════════════════════════════════════════ */
  function initTheme() {
    const html   = document.documentElement;
    const btn    = document.getElementById('themeToggle');
    if (!btn) return;

    /* Determine initial theme */
    const stored = localStorage.getItem('je-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(initial, false);

    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });

    /* Sync if OS theme changes and user has no stored preference */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('je-theme')) applyTheme(e.matches ? 'dark' : 'light', true);
    });

    function applyTheme(theme, persist) {
      html.setAttribute('data-theme', theme);
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      if (persist) localStorage.setItem('je-theme', theme);
    }
  }


  /* ══════════════════════════════════════════════════════════
     02  SCROLL PROGRESS BAR
  ══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
    }, { passive: true });
  }


  /* ══════════════════════════════════════════════════════════
     03  HEADER SCROLL-AWARENESS
  ══════════════════════════════════════════════════════════ */
  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ══════════════════════════════════════════════════════════
     04  NAV DRAWER
  ══════════════════════════════════════════════════════════ */
  function initDrawer() {
    const toggle   = document.getElementById('navToggle');
    const drawer   = document.getElementById('navDrawer');
    const backdrop = document.getElementById('navBackdrop');
    const close    = document.getElementById('navClose');
    const navLinks = document.querySelectorAll('[data-nav]');
    if (!toggle || !drawer) return;

    let isOpen = false;

    const open = () => {
      isOpen = true;
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      /* Stagger nav links */
      drawer.querySelectorAll('.nav-link').forEach((link, i) => {
        link.style.animationDelay = (i * 55 + 60) + 'ms';
      });
      /* Focus first interactive element */
      setTimeout(() => close.focus(), 80);
    };

    const closeDrawer = () => {
      isOpen = false;
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    };

    toggle.addEventListener('click', () => isOpen ? closeDrawer() : open());
    close.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    /* Close on nav link click */
    navLinks.forEach(link => link.addEventListener('click', closeDrawer));

    /* ESC key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeDrawer();
    });

    /* Focus trap */
    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        drawer.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     05  SMOOTH ANCHOR SCROLLING
  ══════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const id = anchor.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const headerH = document.getElementById('site-header')?.offsetHeight ?? 72;
        const y = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     06  SCROLL REVEAL
  ══════════════════════════════════════════════════════════ */
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }


  /* ══════════════════════════════════════════════════════════
     07  ANIMATED COUNTERS
  ══════════════════════════════════════════════════════════ */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix ?? '';
        const dur    = 1800;
        const step   = 16;
        const steps  = dur / step;
        let  current = 0;

        const interval = setInterval(() => {
          current += target / steps;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = Math.floor(current) + suffix;
        }, step);

        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    els.forEach(el => obs.observe(el));
  }


  /* ══════════════════════════════════════════════════════════
     08  3D TILT ON GLASS CARDS
  ══════════════════════════════════════════════════════════ */
  function initTilt() {
    /* Skip on touch-only devices */
    if (!window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('.glass-card, .svc-card, .work-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - .5;
        const y = (e.clientY - rect.top)  / rect.height - .5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     09  TESTIMONIALS CAROUSEL
  ══════════════════════════════════════════════════════════ */
  function initCarousel() {
    const track  = document.getElementById('testimonialTrack');
    const dotsEl = document.getElementById('carouselDots');
    const prev   = document.getElementById('carouselPrev');
    const next   = document.getElementById('carouselNext');
    if (!track) return;

    const cards = Array.from(track.children);
    const total = cards.length;
    if (!total) return;

    let current   = 0;
    let autoTimer = null;
    let touchStartX = 0;

    /* Build dots */
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className  = 'cdot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i, true));
      dotsEl?.appendChild(dot);
    });

    const dots = dotsEl ? Array.from(dotsEl.children) : [];

    /* Determine cards visible */
    const visibleCount = () => window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

    const goTo = (index, resetAuto = false) => {
      const maxIdx = Math.max(0, total - visibleCount());
      current = Math.min(Math.max(index, 0), maxIdx);

      /* Calculate card width + gap */
      const gap  = parseInt(getComputedStyle(track).gap) || 20;
      const cardW = cards[0].offsetWidth + gap;
      track.style.transform = `translateX(-${current * cardW}px)`;

      dots.forEach((d, i) => d.classList.toggle('active', i === current));

      if (resetAuto) resetAutoplay();
    };

    const resetAutoplay = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1 >= total - visibleCount() + 1 ? 0 : current + 1), 5500);
    };

    prev?.addEventListener('click', () => goTo(current - 1, true));
    next?.addEventListener('click', () => goTo(current + 1, true));

    /* Touch swipe */
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1, true);
    });

    /* Keyboard */
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  goTo(current - 1, true);
      if (e.key === 'ArrowRight') goTo(current + 1, true);
    });

    /* Resize */
    window.addEventListener('resize', () => goTo(current), { passive: true });

    /* Init */
    goTo(0);
    resetAutoplay();
  }


  /* ══════════════════════════════════════════════════════════
     10  WORK FILTER
  ══════════════════════════════════════════════════════════ */
  function initFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const grid = document.getElementById('workGrid');
    if (!btns.length || !grid) return;

    /* Override .hidden to keep grid layout */
    const style = document.createElement('style');
    style.textContent = `.work-card.hidden { opacity:0; transform:scale(.94); pointer-events:none; }`;
    document.head.appendChild(style);

    /* Make grid position:relative so hidden absolute cards don't collapse it */
    grid.style.position = 'relative';

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;
        grid.querySelectorAll('.work-card').forEach(card => {
          const cats = (card.dataset.cat || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          card.classList.toggle('hidden', !show);
          /* Reset position for hidden cards */
          card.style.position = show ? '' : 'absolute';
        });
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     11  CUSTOM CURSOR
  ══════════════════════════════════════════════════════════ */
  function initCursor() {
    /* Only on pointer devices */
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mx = -100, my = -100; /* cursor position */
    let rx = -100, ry = -100; /* ring position  */

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`;
    }, { passive: true });

    /* Lag ring with rAF */
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      rx = lerp(rx, mx, .12);
      ry = lerp(ry, my, .12);
      ring.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    /* Hover state on interactive elements */
    const hoverEls = 'a, button, [role="button"], input, textarea, select, .work-card, .svc-card';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }


  /* ══════════════════════════════════════════════════════════
     12  BACK-TO-TOP
  ══════════════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const onScroll = () => {
      const show = window.scrollY > 500;
      btn.classList.toggle('visible', show);
      btn.hidden = false; /* initial hidden attr removed once shown */
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', () => {
      if (typeof gsap !== 'undefined' && gsap.plugins?.scrollTo) {
        gsap.to(window, { duration: .9, scrollTo: 0, ease: 'power3.inOut' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     13  CONTACT FORM (MOCK SUBMIT)
  ══════════════════════════════════════════════════════════ */
  function initForm() {
    const form    = document.getElementById('contactForm');
    const submitB = document.getElementById('formSubmit');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      /* Basic validation */
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = 'var(--pink)';
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        }
      });
      if (!valid) return;

      /* Loading state */
      submitB.classList.add('loading');
      submitB.disabled = true;

      /* Mock network delay */
      setTimeout(() => {
        submitB.classList.remove('loading');
        submitB.style.display = 'none';
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
      }, 1800);
    });
  }


  /* ══════════════════════════════════════════════════════════
     14  WHY-SECTION BAR CHART ANIMATION
  ══════════════════════════════════════════════════════════ */
  function initBars() {
    const bars = document.querySelectorAll('.why-bar');
    if (!bars.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('anim');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => obs.observe(bar));
  }


  /* ══════════════════════════════════════════════════════════
     15  GSAP HERO ENTRANCE + PARALLAX (deferred poll)
  ══════════════════════════════════════════════════════════ */
  function waitGSAP() {
    if (typeof gsap === 'undefined') {
      setTimeout(waitGSAP, 100);
      return;
    }

    /* Register plugins */
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    initHeroGSAP();
    initParallax();
    initStatScrollTrigger();
  }

  function initHeroGSAP() {
    const hero  = document.getElementById('hero');
    if (!hero) return;

    /* Page entrance timeline */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-badge',   { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .9 })
      .fromTo('.hero-line',    { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .12 }, '-=.5')
      .fromTo('.hero-sub',     { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.5')
      .fromTo('.hero-actions', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, '-=.5')
      .fromTo('.hero-kpis',    { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, '-=.4');
  }

  function initParallax() {
    /* Blobs move at slightly different speeds as you scroll */
    ['.blob-a', '.blob-b', '.blob-c'].forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const speed = [-.2, .15, -.1][i];
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        }
      });
    });

    /* About photo parallax */
    gsap.to('.about-photo', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }

  function initStatScrollTrigger() {
    /* Subtle stagger entrance for stat items via GSAP */
    gsap.fromTo('.stat-item', {
      y: 40,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: .7,
      stagger: .1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#stats',
        start: 'top 80%',
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     BOOT — run everything after DOM is ready
  ══════════════════════════════════════════════════════════ */
  function boot() {
    initTheme();
    initScrollProgress();
    initHeader();
    initDrawer();
    initSmoothScroll();
    initReveal();
    initCounters();
    initTilt();
    initCarousel();
    initFilter();
    initCursor();
    initBackToTop();
    initForm();
    initBars();
    waitGSAP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
