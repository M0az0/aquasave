/* ╔══════════════════════════════════════════════════════╗
   ║  AquaSave — script.js (v2 — All 8 Phases)           ║
   ╚══════════════════════════════════════════════════════╝ */
'use strict';

/* ── 1. NAV ──────────────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (!nav || !burger || !menu) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
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
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── 3. COUNTER ANIMATION ────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-card__value[data-target]');
  if (!counters.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function formatNumber(n, target) {
    if (target >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (target >= 1_000) return Math.round(n).toLocaleString();
    return Math.round(n).toString();
  }
  function animateCounter(el) {
    const target = +el.dataset.target;
    const duration = 2000;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = formatNumber(easeOut(progress) * target, target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, target);
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => io.observe(el));
})();

/* ── 4. PROGRESS BARS ────────────────────────────────── */
(function initProgressBars() {
  const fills = document.querySelectorAll('.prog-fill[data-width]');
  const vals  = document.querySelectorAll('.prog-item__val[data-val]');
  if (!fills.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      fills.forEach(fill => {
        fill.style.width = fill.dataset.width + '%';
      });
      vals.forEach(val => {
        const target = +val.dataset.val;
        const duration = 1500;
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          val.textContent = Math.round(easeOut(progress) * target) + '%';
          if (progress < 1) requestAnimationFrame(step);
          else val.textContent = target + '%';
        }
        requestAnimationFrame(step);
      });
      io.disconnect();
    });
  }, { threshold: 0.3 });
  const container = document.querySelector('.sdg-progress');
  if (container) io.observe(container);
})();

/* ── 5. SIMULATION ALERT BANNER ──────────────────────── */
(function initSimAlert() {
  const alert = document.getElementById('simAlert');
  const close = document.getElementById('simAlertClose');
  if (!alert || !close) return;

  close.addEventListener('click', () => {
    alert.classList.add('hidden');
  });

  // Cycle through different alerts every 20s
  const alerts = [
    '🔔 <strong>Simulation Alert:</strong> Sensor Node #EG-04 detected turbidity spike in Cairo pilot zone.',
    '✅ <strong>Simulation Update:</strong> Node #EG-07 readings normalized — contamination resolved.',
    '⚡ <strong>Simulation Warning:</strong> Node #EG-11 pH level below threshold — field team dispatched.',
    '📊 <strong>Simulation Update:</strong> Daily report generated — 11/12 nodes operating normally.'
  ];
  let idx = 0;
  const textEl = alert.querySelector('span');

  setInterval(() => {
    if (alert.classList.contains('hidden')) return;
    idx = (idx + 1) % alerts.length;
    alert.style.opacity = '0';
    setTimeout(() => {
      textEl.innerHTML = alerts[idx];
      alert.style.opacity = '1';
      alert.style.transition = 'opacity .4s';
    }, 400);
  }, 20000);
})();

/* ── 6. CONTACT FORM ─────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    let valid = true;
    [name, email].forEach(field => {
      if (!field.value.trim()) { field.style.borderColor = '#f87171'; valid = false; }
      else field.style.borderColor = '';
    });
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#f87171'; valid = false;
    }
    if (!valid) return;
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
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();

/* ── 7. ACTIVE NAV LINKS ─────────────────────────────── */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__links a');
  if (!sections.length || !links.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--brand-lt)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => io.observe(sec));
})();

/* ── 8. PARALLAX HERO ORBS ───────────────────────────── */
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

/* ── 9. CARD TILT (desktop) ──────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.feature-card:not(.feature-card--cta), .team__card, .how__step').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── 10. SCROLL HINT FADE ────────────────────────────── */
(function initScrollHint() {
  const hint = document.querySelector('.hero__scroll-hint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    hint.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
})();
