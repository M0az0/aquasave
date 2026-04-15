/* ╔══════════════════════════════════════════════════════╗
   ║  AquaSave — script.js  (v3 Final — Top 1)           ║
   ╚══════════════════════════════════════════════════════╝ */
'use strict';

/* ── 1. LOADER ───────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 1800);
  });
  document.body.style.overflow = 'hidden';
})();

/* ── 2. DARK / LIGHT MODE TOGGLE ─────────────────────── */
(function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const icon = btn ? btn.querySelector('.theme-toggle__icon') : null;
  const html = document.documentElement;
  const saved = localStorage.getItem('aquasave-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (icon) icon.textContent = saved === 'dark' ? '🌙' : '☀️';

  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('aquasave-theme', next);
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => { btn.style.transform = ''; btn.style.transition = 'transform .4s'; }, 400);
  });
})();

/* ── 3. NAV ──────────────────────────────────────────── */
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

/* ── 4. REVEAL ON SCROLL ─────────────────────────────── */
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

/* ── 5. COUNTER ANIMATION ────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-card__value[data-target]');
  if (!counters.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function fmt(n, target) {
    if (target >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (target >= 1_000) return Math.round(n).toLocaleString();
    return Math.round(n).toString();
  }
  function animate(el) {
    const target = +el.dataset.target;
    const start  = performance.now();
    const dur    = 2200;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmt(easeOut(p) * target, target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, target);
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => io.observe(el));
})();

/* ── 6. PROGRESS BARS ────────────────────────────────── */
(function initProgressBars() {
  const fills = document.querySelectorAll('.prog-fill[data-width]');
  const vals  = document.querySelectorAll('.prog-item__val[data-val]');
  if (!fills.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      fills.forEach(f => { f.style.width = f.dataset.width + '%'; });
      vals.forEach(v => {
        const target = +v.dataset.val;
        const start  = performance.now();
        const dur    = 1600;
        function step(now) {
          const p = Math.min((now - start) / dur, 1);
          v.textContent = Math.round(easeOut(p) * target) + '%';
          if (p < 1) requestAnimationFrame(step);
          else v.textContent = target + '%';
        }
        requestAnimationFrame(step);
      });
      io.disconnect();
    });
  }, { threshold: 0.3 });
  const container = document.querySelector('.sdg-progress');
  if (container) io.observe(container);
})();

/* ── 7. SIM ALERT — shake + cycling messages ─────────── */
(function initSimAlert() {
  const alertEl = document.getElementById('simAlert');
  const closeBtn = document.getElementById('simAlertClose');
  if (!alertEl || !closeBtn) return;

  closeBtn.addEventListener('click', () => alertEl.classList.add('hidden'));

  const messages = [
    '🔔 <strong>Simulation Alert:</strong> Node #EG-04 detected turbidity spike — Cairo pilot zone.',
    '✅ <strong>Simulation Update:</strong> Node #EG-07 normalized — contamination resolved.',
    '⚡ <strong>Simulation Warning:</strong> Node #EG-11 pH below threshold — field team dispatched.',
    '📊 <strong>Simulation Report:</strong> Daily summary — 11/12 nodes operating normally.',
  ];
  let idx = 0;
  const textEl = alertEl.querySelector('.sim-alert__text');

  setInterval(() => {
    if (alertEl.classList.contains('hidden')) return;
    idx = (idx + 1) % messages.length;

    // Shake micro-interaction
    alertEl.classList.remove('shake');
    void alertEl.offsetWidth; // force reflow
    alertEl.classList.add('shake');

    alertEl.style.opacity = '0';
    setTimeout(() => {
      textEl.innerHTML = messages[idx];
      alertEl.style.transition = 'opacity .4s';
      alertEl.style.opacity = '1';
    }, 350);
  }, 18000);
})();

/* ── 8. MAP TOOLTIP ──────────────────────────────────── */
(function initMapTooltip() {
  const map     = document.getElementById('simMap');
  const tooltip = document.getElementById('mapTooltip');
  const mapWrap = document.getElementById('mapContainer');
  if (!map || !tooltip || !mapWrap) return;

  const nodes = map.querySelectorAll('.map-node');
  const ttStatus = document.getElementById('ttStatus');
  const ttLabel  = document.getElementById('ttLabel');
  const ttLoc    = document.getElementById('ttLoc');
  const ttPh     = document.getElementById('ttPh');
  const ttTurb   = document.getElementById('ttTurb');

  nodes.forEach(node => {
    node.style.cursor = 'pointer';

    node.addEventListener('mouseenter', (e) => {
      const status = node.dataset.status;
      ttStatus.textContent = status.toUpperCase();
      ttStatus.className = 'map-tooltip__status ' + status;
      ttLabel.textContent  = node.dataset.label;
      ttLoc.textContent    = node.dataset.loc;
      ttPh.textContent     = node.dataset.ph;
      ttTurb.textContent   = node.dataset.turb + ' NTU';
      tooltip.classList.add('show');
    });

    node.addEventListener('mousemove', (e) => {
      const rect = mapWrap.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top  - 20;
      const maxX = rect.width  - tooltip.offsetWidth  - 16;
      const maxY = rect.height - tooltip.offsetHeight - 8;
      tooltip.style.left = Math.min(x, maxX) + 'px';
      tooltip.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';
    });

    node.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
    });
  });
})();

/* ── 9. RIPPLE EFFECT ────────────────────────────────── */
(function initRipple() {
  document.querySelectorAll('.btn--ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      this.classList.remove('ripple-active');
      void this.offsetWidth;
      this.classList.add('ripple-active');
      setTimeout(() => this.classList.remove('ripple-active'), 500);
    });
  });
})();

/* ── 10. CONTACT FORM ────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form || !success || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    let valid = true;

    [name, email].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#f87171';
        field.style.boxShadow = '0 0 0 4px rgba(248,113,113,.15)';
        valid = false;
      } else {
        field.style.borderColor = '';
        field.style.boxShadow = '';
      }
    });
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#f87171';
      email.style.boxShadow = '0 0 0 4px rgba(248,113,113,.15)';
      valid = false;
    }
    if (!valid) return;

    const btnText = submitBtn.querySelector('.btn__text');
    if (btnText) btnText.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      if (btnText) btnText.textContent = 'Send Message 🌊';
      submitBtn.disabled = false;
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 7000);
    }, 1400);
  });

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow = '';
    });
  });
})();

/* ── 11. ACTIVE NAV LINKS ────────────────────────────── */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__links a');
  if (!sections.length || !links.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          const active = link.getAttribute('href') === `#${id}`;
          link.style.color = active ? 'var(--brand-lt)' : '';
          link.style.fontWeight = active ? '600' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => io.observe(sec));
})();

/* ── 12. PARALLAX HERO ORBS ──────────────────────────── */
(function initParallax() {
  const orb1 = document.querySelector('.hero__orb--1');
  const orb2 = document.querySelector('.hero__orb--2');
  if (!orb1 || !orb2) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      orb1.style.transform = `translate(0, ${y * 0.14}px)`;
      orb2.style.transform = `translate(0, ${y * -0.09}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── 13. CARD TILT (desktop) ─────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  const cards = document.querySelectorAll(
    '.feature-card:not(.feature-card--cta), .team__card, .how__step, .why__card, .stat-card'
  );
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── 14. SCROLL HINT FADE ────────────────────────────── */
(function initScrollHint() {
  const hint = document.querySelector('.hero__scroll-hint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    hint.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
})();
