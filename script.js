/* ╔══════════════════════════════════════════════════════╗
   ║  AquaSave — script.js                               ║
   ╚══════════════════════════════════════════════════════╝ */

'use strict';

/* ── 1. NAV: Scroll + Mobile Burger ─────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');

  if (!nav || !burger || !menu) return;

  // Sticky style on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Burger toggle
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // Close mobile menu when a link is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
})();

/* ── 2. REVEAL ON SCROLL ─────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-delay-1, .reveal-delay-2');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── 3. COUNTER ANIMATION ────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-card__value[data-target]');
  if (!counters.length) return;

  // Easing function
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function formatNumber(n, target) {
    if (target >= 1_000_000) {
      return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
    }
    if (target >= 1_000) {
      return Math.round(n).toLocaleString();
    }
    return Math.round(n).toString();
  }

  function animateCounter(el) {
    const target   = +el.dataset.target;
    const duration = 2000; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = easeOut(progress) * target;

      el.textContent = formatNumber(value, target);

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, target);
    }

    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => io.observe(el));
})();

/* ── 4. CONTACT FORM ─────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    let valid = true;

    [name, email].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#f87171';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    // Simple email format check
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#f87171';
      valid = false;
    }

    if (!valid) return;

    // Simulate async submit
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.textContent = 'Send Message 🌊';
      btn.disabled = false;
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1200);
  });

  // Remove red border on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();

/* ── 5. SMOOTH ACTIVE NAV LINKS ──────────────────────── */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__links a');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--brand-lt)'
            : '';
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(sec => io.observe(sec));
})();

/* ── 6. PARALLAX HERO ORBS ───────────────────────────── */
(function initParallax() {
  const orb1 = document.querySelector('.hero__orb--1');
  const orb2 = document.querySelector('.hero__orb--2');
  if (!orb1 || !orb2) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      orb1.style.transform = `translate(0, ${y * 0.15}px)`;
      orb2.style.transform = `translate(0, ${y * -0.1}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── 7. FEATURE CARD TILT (desktop only) ────────────── */
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.feature-card:not(.feature-card--cta)').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── 8. HERO SCROLL HINT FADE ────────────────────────── */
(function initScrollHint() {
  const hint = document.querySelector('.hero__scroll-hint');
  if (!hint) return;

  window.addEventListener('scroll', () => {
    hint.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
})();
