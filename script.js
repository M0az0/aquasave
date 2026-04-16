/* ╔══════════════════════════════════════════════════════╗
   ║  AquaSave — script.js  (v4 Final Interactive)       ║
   ╚══════════════════════════════════════════════════════╝ */
'use strict';

/* ── 1. LOADER ───────────────────────────────────────── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('gone');
      document.body.style.overflow = '';
    }, 1900);
  });
})();

/* ── 2. THEME TOGGLE ─────────────────────────────────── */
(function () {
  const btn  = document.getElementById('themeBtn');
  const icon = document.getElementById('themeIcon');
  const html = document.documentElement;
  const saved = localStorage.getItem('aq-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (icon) { icon.className = saved === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'; }

  if (!btn) return;
  btn.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('aq-theme', next);
    if (icon) icon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  });
})();

/* ── 3. NAV ──────────────────────────────────────────── */
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  }
})();

/* ── 4. SCROLL REVEAL ────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── 5. RIPPLE EFFECT ────────────────────────────────── */
(function () {
  document.querySelectorAll('.btn--ripple').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.remove('rippling');
      void this.offsetWidth;
      this.classList.add('rippling');
      setTimeout(() => this.classList.remove('rippling'), 500);
    });
  });
})();

/* ── 6. HERO COUNTER (liters saved today — animated) ─── */
(function () {
  const el = document.getElementById('heroSaved');
  if (!el) return;
  let current = 0;
  const target = 1247 + Math.floor(Math.random() * 500);
  const step = target / 80;
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current).toLocaleString();
    if (current >= target) clearInterval(interval);
  }, 20);
})();

/* ── 7. IMPACT COUNTERS ──────────────────────────────── */
(function () {
  const vals = document.querySelectorAll('.impact__stat-val[data-target]');
  if (!vals.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function animate(el) {
    const target = +el.dataset.target;
    const dur = 2000;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const v = easeOut(p) * target;
      el.textContent = target >= 1000 ? Math.round(v).toLocaleString() : Math.round(v);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? target.toLocaleString() : target;
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  vals.forEach(el => io.observe(el));
})();

/* ── 8. LIVE WASTE COUNTER ───────────────────────────── */
(function () {
  const el = document.getElementById('liveWaste');
  if (!el) return;
  let val = 3_840_000_000 + Math.floor(Math.random() * 1_000_000);
  setInterval(() => {
    val += Math.floor(Math.random() * 800 + 200);
    el.textContent = val.toLocaleString() + ' Liters';
  }, 1200);
})();

/* ── 9. WATER CALCULATOR ─────────────────────────────── */
(function () {
  let people  = 2;
  let shower  = 5;
  let flush   = 3;
  let cook    = 'low';

  const cookMap = { low: 15, medium: 25, high: 40 };

  // Stepper
  const peopleVal  = document.getElementById('peopleVal');
  const peopleDown = document.getElementById('peopleDown');
  const peopleUp   = document.getElementById('peopleUp');

  if (peopleDown) {
    peopleDown.addEventListener('click', () => {
      if (people > 1) { people--; peopleVal.textContent = people; }
    });
  }
  if (peopleUp) {
    peopleUp.addEventListener('click', () => {
      if (people < 20) { people++; peopleVal.textContent = people; }
    });
  }

  // Select buttons — shower
  document.querySelectorAll('[data-shower]').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-shower]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      shower = +this.dataset.shower;
    });
  });

  // Select buttons — flush
  document.querySelectorAll('[data-flush]').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-flush]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      flush = +this.dataset.flush;
    });
  });

  // Select buttons — cook
  document.querySelectorAll('[data-cook]').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-cook]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      cook = this.dataset.cook;
    });
  });

  // Calculate
  const calcBtn     = document.getElementById('calcBtn');
  const placeholder = document.getElementById('calcPlaceholder');
  const content     = document.getElementById('calcContent');
  const gaugeFill   = document.getElementById('gaugeFill');
  const gaugeVal    = document.getElementById('gaugeVal');

  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    // Formulas (liters per person per day)
    const showerL   = shower * 9;           // ~9L/min
    const toiletL   = flush  * 8;           // ~8L/flush
    const cookL     = cookMap[cook];

    const showerTotal = showerL  * people;
    const toiletTotal = toiletL  * people;
    const cookTotal   = cookL    * people;
    const total = showerTotal + toiletTotal + cookTotal;

    // Show content
    placeholder.classList.add('hidden');
    content.classList.remove('hidden');

    // Gauge animation (max reference = 600L)
    const maxRef  = 600;
    const ratio   = Math.min(total / maxRef, 1);
    const offset  = 283 - (283 * ratio);
    setTimeout(() => {
      gaugeFill.style.transition = 'stroke-dashoffset 1.2s ease';
      gaugeFill.style.strokeDashoffset = offset;
    }, 100);

    // Animated gauge number
    let cur = 0;
    const dur = 1200;
    const start = performance.now();
    function animNum(now) {
      const p = Math.min((now - start) / dur, 1);
      cur = Math.round((1 - Math.pow(1 - p, 3)) * total);
      gaugeVal.textContent = cur;
      if (p < 1) requestAnimationFrame(animNum);
      else gaugeVal.textContent = total;
    }
    requestAnimationFrame(animNum);

    // Breakdown
    document.getElementById('rShower').textContent  = showerTotal + 'L';
    document.getElementById('rToilet').textContent  = toiletTotal + 'L';
    document.getElementById('rCook').textContent    = cookTotal   + 'L';
    document.getElementById('rTotal').textContent   = total       + ' L/day';

    // Savings (20% reduction)
    const saveDay    = Math.round(total * 0.2);
    const saveWeek   = saveDay * 7;
    const saveYear   = saveDay * 365;
    const savePeople = Math.round(saveYear / 50); // ~50L/day minimum need

    document.getElementById('saveDaily').textContent  = saveDay   + 'L';
    document.getElementById('saveWeekly').textContent = saveWeek  + 'L';
    document.getElementById('saveYearly').textContent = (saveYear / 1000).toFixed(1) + 'K L';
    document.getElementById('savePeople').textContent = savePeople + ' people/yr';

    // Rating
    const ratingEl = document.getElementById('calcRating');
    if (total < 200) {
      ratingEl.textContent = '🌿 Excellent! You\'re a water conservation champion.';
      ratingEl.className = 'calc__rating low';
    } else if (total < 400) {
      ratingEl.textContent = '⚡ Good usage — a few tweaks could make a big difference!';
      ratingEl.className = 'calc__rating medium';
    } else {
      ratingEl.textContent = '🚨 High usage detected — check our tips to reduce waste.';
      ratingEl.className = 'calc__rating high';
    }

    // Scroll to results on mobile
    if (window.innerWidth < 860) {
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

/* ── 10. TIPS — mark as done ─────────────────────────── */
(function () {
  let score = 0;
  const scoreEl = document.getElementById('scoreVal');

  document.querySelectorAll('.tip-card__done').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.tip-card');
      const done = card.classList.toggle('done');
      const icon = this.querySelector('i');

      if (done) {
        icon.className = 'fa-solid fa-circle-check';
        score = Math.min(score + 1, 6);
      } else {
        icon.className = 'fa-regular fa-circle-check';
        score = Math.max(score - 1, 0);
      }
      if (scoreEl) scoreEl.textContent = score;
    });
  });
})();

/* ── 11. LOGIN MODAL ─────────────────────────────────── */
(function () {
  const overlay  = document.getElementById('loginOverlay');
  const closeBtn = document.getElementById('loginClose');
  const loginBtn = document.getElementById('loginBtn');
  if (!overlay) return;

  function openModal() { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal() { overlay.classList.remove('open'); document.body.style.overflow = ''; }

  // Trigger from nav + footer link
  document.querySelectorAll('a[href="#login"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); openModal(); });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In…';
      loginBtn.disabled = true;
      setTimeout(() => {
        closeModal();
        loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
        loginBtn.disabled = false;
        // Show a brief toast
        const toast = document.createElement('div');
        toast.textContent = '✅ Demo login successful! Welcome to AquaSave.';
        toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.3);color:#22d3ee;padding:.75rem 1.5rem;border-radius:50px;font-size:.82rem;z-index:9999;white-space:nowrap;backdrop-filter:blur(10px)';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      }, 1400);
    });
  }
})();

/* ── 12. CONTACT FORM ────────────────────────────────── */
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('cName');
    const email = document.getElementById('cEmail');
    let valid = true;

    [name, email].forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = '#f87171';
        f.style.boxShadow   = '0 0 0 4px rgba(248,113,113,.15)';
        valid = false;
      } else {
        f.style.borderColor = '';
        f.style.boxShadow   = '';
      }
    });
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#f87171';
      valid = false;
    }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      btn.disabled = false;
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 7000);
    }, 1400);
  });

  form.querySelectorAll('input, textarea').forEach(f => {
    f.addEventListener('input', () => { f.style.borderColor = ''; f.style.boxShadow = ''; });
  });
})();

/* ── 13. BACK TO TOP ─────────────────────────────────── */
(function () {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 14. ACTIVE NAV LINKS ────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__links a');
  if (!sections.length || !links.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => {
          const active = l.getAttribute('href') === `#${id}`;
          l.style.color  = active ? 'var(--brand2)' : '';
          l.style.fontWeight = active ? '600' : '';
        });
      }
    });
  }, { threshold: 0.45 });
  sections.forEach(s => io.observe(s));
})();
