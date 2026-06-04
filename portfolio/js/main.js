/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — main.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility: run once DOM is ready ─── */
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

ready(() => {
  initTheme();
  initHamburger();
  initScrollHeader();
  initSmoothScroll();
  initActiveNavLinks();
  initRevealAnimations();
  initHeroAnimations();
  initCounters();
  initTiltCards();
  initTestimonialsCarousel();
  initWorkFilter();
  initContactForm();
  initCustomCursor();
  initBackToTop();
  initFooterYear();
  initParallaxOrbs();
});

/* ════════════════════════════════════════════
   1. THEME (light / dark)
   ════════════════════════════════════════════ */
function initTheme() {
  const html    = document.documentElement;
  const btn     = document.getElementById('themeToggle');
  const STORAGE = 'portfolio-theme';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE, theme);
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', isDark);
  }

  /* Determine initial theme */
  const stored = localStorage.getItem(STORAGE);
  if (stored) {
    applyTheme(stored);
  } else {
    applyTheme(prefersDark.matches ? 'dark' : 'light');
  }

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* Respect OS change if user hasn't set a preference */
  prefersDark.addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ════════════════════════════════════════════
   2. HAMBURGER MENU
   ════════════════════════════════════════════ */
function initHamburger() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navOverlay   = document.getElementById('navOverlay');
  const navClose     = document.getElementById('navClose');
  const navBackdrop  = document.getElementById('navBackdrop');
  const navLinks     = navOverlay.querySelectorAll('.nav-link, .nav-cta-btn');

  /* Focus trap helpers */
  const focusableSelectors = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';

  function getFocusable() {
    return Array.from(navOverlay.querySelectorAll(focusableSelectors)).filter(
      el => !el.closest('[aria-hidden="true"]')
    );
  }

  function openMenu() {
    navOverlay.classList.add('is-open');
    navOverlay.removeAttribute('aria-hidden');
    hamburgerBtn.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    /* Stagger nav link animation */
    const links = navOverlay.querySelectorAll('.nav-link');
    links.forEach((link, i) => {
      link.style.opacity = '0';
      link.style.transform = 'translateX(24px)';
      setTimeout(() => {
        link.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        link.style.opacity = '1';
        link.style.transform = 'none';
      }, 80 + i * 60);
    });

    /* Move focus into panel */
    setTimeout(() => {
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }, 50);
  }

  function closeMenu() {
    navOverlay.classList.remove('is-open');
    navOverlay.setAttribute('aria-hidden', 'true');
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburgerBtn.focus();
  }

  hamburgerBtn.addEventListener('click', () => {
    if (navOverlay.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  navClose.addEventListener('click', closeMenu);
  navBackdrop.addEventListener('click', closeMenu);

  /* Close on nav link click */
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  /* ESC key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navOverlay.classList.contains('is-open')) closeMenu();
  });

  /* Focus trap */
  navOverlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
}

/* ════════════════════════════════════════════
   3. SCROLL-AWARE HEADER
   ════════════════════════════════════════════ */
function initScrollHeader() {
  const header = document.getElementById('siteHeader');
  let ticking  = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════
   4. SMOOTH SCROLL
   ════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ════════════════════════════════════════════
   5. ACTIVE NAV LINKS (scroll spy)
   ════════════════════════════════════════════ */
function initActiveNavLinks() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.dataset.section === entry.target.id;
          link.classList.toggle('active', active);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════
   6. SCROLL REVEAL ANIMATIONS
   ════════════════════════════════════════════ */
function initRevealAnimations() {
  /* Mark elements for reveal */
  const targets = [
    '.service-card',
    '.work-card',
    '.testimonial-card',
    '.stat-item',
    '.pillar',
    '.about__content > *',
    '.section-header',
    '.why-us__visual',
    '.footer__brand, .footer__nav, .footer__services, .footer__contact',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      /* stagger within parent grids */
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════
   7. HERO ANIMATIONS (GSAP)
   ════════════════════════════════════════════ */
function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__eyebrow',   { opacity: 0, y: 24, duration: 0.7 })
    .from('.hero__title-line', { opacity: 0, y: 40, stagger: 0.12, duration: 0.8 }, '-=0.3')
    .from('.hero__subtitle',   { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero__actions',    { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
    .from('.hero__stats',      { opacity: 0, y: 20, duration: 0.5 }, '-=0.2');

  /* Parallax on scroll */
  gsap.to('.hero__gradient-orb--1', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    y: -120, x: 60,
  });

  gsap.to('.hero__gradient-orb--2', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
    y: 80, x: -40,
  });

  /* About image parallax */
  gsap.to('.about__img', {
    scrollTrigger: {
      trigger: '.about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
    },
    y: -40,
  });
}

/* ════════════════════════════════════════════
   8. ANIMATED COUNTERS
   ════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('.counter, .stat-number[data-count]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseFloat(el.dataset.count);
      const isFloat = String(end).includes('.');
      const dur   = 2000;
      const step  = 16;
      const steps = dur / step;
      const inc   = end / steps;
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + inc, end);
        el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        if (current >= end) clearInterval(timer);
      }, step);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════
   9. TILT CARDS (3D depth on hover)
   ════════════════════════════════════════════ */
function initTiltCards() {
  /* Only on devices that support hover */
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  =  dy * 8;
      const tiltY  = -dx * 8;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ════════════════════════════════════════════
   10. TESTIMONIALS CAROUSEL
   ════════════════════════════════════════════ */
function initTestimonialsCarousel() {
  const track    = document.getElementById('testimonialsTrack');
  const prevBtn  = document.getElementById('testimonialPrev');
  const nextBtn  = document.getElementById('testimonialNext');
  const dotsWrap = document.getElementById('carouselDots');

  if (!track) return;

  const cards        = Array.from(track.children);
  let currentIndex   = 0;
  let autoplayTimer;
  let isDragging     = false;
  let startX         = 0;

  /* Build dot buttons */
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className   = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getVisibleCount() {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function goTo(index) {
    const visible  = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visible);
    currentIndex   = Math.max(0, Math.min(index, maxIndex));

    const cardWidth  = cards[0].getBoundingClientRect().width;
    const gap        = 24; /* matches --space-xl */
    const offset     = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    /* Update dots */
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
      d.setAttribute('aria-selected', i === currentIndex);
    });
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

  /* Touch / drag support */
  track.addEventListener('touchstart', e => {
    startX    = e.touches[0].clientX;
    isDragging = false;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    isDragging = Math.abs(e.touches[0].clientX - startX) > 5;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 40)  next();
    if (diff < -40) prev();
    resetAutoplay();
  });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetAutoplay(); }
    if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
  });

  /* Autoplay */
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      const visible  = getVisibleCount();
      const maxIndex = cards.length - visible;
      if (currentIndex >= maxIndex) goTo(0);
      else next();
    }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  /* Init */
  goTo(0);
  startAutoplay();

  /* Pause on hover */
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  track.parentElement.addEventListener('mouseleave', startAutoplay);

  /* Recalc on resize */
  window.addEventListener('resize', () => goTo(currentIndex), { passive: true });
}

/* ════════════════════════════════════════════
   11. WORK FILTER
   ════════════════════════════════════════════ */
function initWorkFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards  = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      workCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('filtered-out', !match);
        card.classList.toggle('filtered-in', match);
        card.setAttribute('aria-hidden', !match);
      });
    });
  });

  /* Init — all shown */
  workCards.forEach(c => c.classList.add('filtered-in'));
}

/* ════════════════════════════════════════════
   12. CONTACT FORM
   ════════════════════════════════════════════ */
function initContactForm() {
  const form     = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  if (!form) return;

  function validate(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const empty = !field.value.trim();
      const emailBad = field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      const invalid  = empty || emailBad;
      field.classList.toggle('error', invalid);
      if (invalid) valid = false;
    });
    return valid;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    feedback.textContent = '';
    feedback.className   = 'form-feedback';

    if (!validate(form)) {
      feedback.textContent = 'Please fill in all fields correctly.';
      feedback.classList.add('error');
      return;
    }

    /* Simulate async send */
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      feedback.textContent = '✓ Message sent! I\'ll be in touch shortly.';
      feedback.classList.add('success');
      btn.disabled    = false;
      btn.innerHTML   = 'Send Message <i class="bi bi-send-fill" aria-hidden="true"></i>';

      setTimeout(() => {
        feedback.textContent = '';
        feedback.className   = 'form-feedback';
      }, 6000);
    }, 1400);
  });

  /* Live validation */
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
}

/* ════════════════════════════════════════════
   13. CUSTOM CURSOR
   ════════════════════════════════════════════ */
function initCustomCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  }, { passive: true });

  /* Smooth ring follows with lag */
  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  /* Grow on interactive elements */
  const interactiveSelector = 'a, button, [data-tilt], .work-card, input, textarea, .filter-btn, .carousel-btn';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.add('is-hovering');
      dot.style.opacity = '0';
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.remove('is-hovering');
      dot.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.5';
  });
}

/* ════════════════════════════════════════════
   14. BACK TO TOP BUTTON
   ════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    const visible = window.scrollY > 600;
    btn.classList.toggle('is-visible', visible);
    btn.setAttribute('aria-hidden', !visible);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════
   15. FOOTER YEAR
   ════════════════════════════════════════════ */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════════════════
   16. PARALLAX ORBS (mouse-follow)
   ════════════════════════════════════════════ */
function initParallaxOrbs() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const orbs = document.querySelectorAll('.hero__gradient-orb');
  if (!orbs.length) return;

  document.addEventListener('mousemove', e => {
    const cx   = window.innerWidth  / 2;
    const cy   = window.innerHeight / 2;
    const dx   = (e.clientX - cx) / cx;
    const dy   = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
}
