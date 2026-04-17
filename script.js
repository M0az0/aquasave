/* ╔══════════════════════════════════════════════════════╗
   ║  AquaSave — script.js  (v5 Final Grade)             ║
   ╚══════════════════════════════════════════════════════╝ */
'use strict';

/* ── 1. LOADER ───────────────────────────────────────── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(() => { loader.classList.add('gone'); document.body.style.overflow = ''; }, 1900);
  });
})();

/* ── 2. THEME ────────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('themeBtn');
  const icon = document.getElementById('themeIcon');
  const html = document.documentElement;
  const saved = localStorage.getItem('aq-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (icon) icon.className = saved === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
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
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
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
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── 5. RIPPLE ───────────────────────────────────────── */
(function () {
  document.querySelectorAll('.btn--ripple').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.remove('rippling'); void this.offsetWidth; this.classList.add('rippling');
      setTimeout(() => this.classList.remove('rippling'), 500);
    });
  });
})();

/* ── 6. FIX 2: HERO COUNTER — starts from realistic number ── */
(function () {
  const el = document.getElementById('heroSaved');
  if (!el) return;
  // Start from believable number, animate upward every 2 seconds
  let saved = 847320 + Math.floor(Math.random() * 5000);
  el.textContent = saved.toLocaleString();
  setInterval(() => {
    saved += Math.floor(Math.random() * 3) + 1;
    el.textContent = saved.toLocaleString();
  }, 2000);
})();

/* ── 7. IMPACT COUNTERS ──────────────────────────────── */
(function () {
  const vals = document.querySelectorAll('.impact__stat-val[data-target]');
  if (!vals.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function animate(el) {
    const target = +el.dataset.target;
    const start = performance.now();
    const dur = 2000;
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const v = Math.round(easeOut(p) * target);
      el.textContent = target >= 1000 ? v.toLocaleString() : v;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? target.toLocaleString() : target;
    })(performance.now());
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  vals.forEach(el => io.observe(el));
})();

/* ── 8. LIVE WASTE COUNTER ───────────────────────────── */
(function () {
  const el  = document.getElementById('liveWaste');
  const bar = document.getElementById('liveBar');
  if (!el) return;
  let val = 3_840_000_000 + Math.floor(Math.random() * 1_000_000);
  if (bar) setTimeout(() => { bar.style.width = '78%'; }, 800);
  setInterval(() => {
    val += Math.floor(Math.random() * 800 + 200);
    el.textContent = val.toLocaleString() + ' L';
  }, 1200);
})();

/* ── 9. CALCULATOR ───────────────────────────────────── */
(function () {
  let people = 2;
  const inputs = { shower: 5, flush: 3, cook: 15, laundry: 0, dishes: 20, outdoor: 0 };
  let chartInstance = null;
  let lastTotal = 0;

  // Stepper
  const peopleVal  = document.getElementById('peopleVal');
  document.getElementById('peopleDown')?.addEventListener('click', () => {
    if (people > 1) { people--; peopleVal.textContent = people; }
  });
  document.getElementById('peopleUp')?.addEventListener('click', () => {
    if (people < 20) { people++; peopleVal.textContent = people; }
  });

  // Select buttons
  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const group = this.dataset.group;
      document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      inputs[group] = +this.dataset.val;
    });
  });

  // Calculate
  document.getElementById('calcBtn')?.addEventListener('click', () => {
    const showerL  = inputs.shower  * 9 * people;
    const toiletL  = inputs.flush   * 8 * people;
    const cookL    = inputs.cook    * people;
    const laundryL = inputs.laundry; // already per-day
    const dishesL  = inputs.dishes  * people;
    const outdoorL = inputs.outdoor;
    const total = showerL + toiletL + cookL + laundryL + dishesL + outdoorL;
    lastTotal = total;

    document.getElementById('calcPlaceholder').classList.add('hidden');
    document.getElementById('calcContent').classList.remove('hidden');

    // Breakdown text
    const fmt = n => n + 'L';
    document.getElementById('rShower').textContent  = fmt(showerL);
    document.getElementById('rToilet').textContent  = fmt(toiletL);
    document.getElementById('rCook').textContent    = fmt(cookL);
    document.getElementById('rLaundry').textContent = fmt(laundryL);
    document.getElementById('rDishes').textContent  = fmt(dishesL);
    document.getElementById('rOutdoor').textContent = fmt(outdoorL);
    document.getElementById('rTotal').textContent   = total + ' L/day';
    document.getElementById('chartTotal').textContent = total;

    // PRIORITY 2B: Chart.js doughnut
    const ctx = document.getElementById('usageChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Showers', 'Toilet', 'Cooking', 'Laundry', 'Dishes', 'Outdoor'],
        datasets: [{
          data: [showerL, toiletL, cookL, laundryL, dishesL, outdoorL],
          backgroundColor: ['#0ea5e9','#22d3ee','#38bdf8','#7dd3fc','#bae6fd','#e0f2fe'],
          borderWidth: 2,
          borderColor: isDark ? '#08192e' : '#f0f8ff',
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDark ? '#7bafc9' : '#1e4d70',
              font: { size: 11, family: 'Inter' },
              boxWidth: 10, padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed}L (${Math.round(ctx.parsed/total*100)}%)`
            }
          }
        },
        animation: { animateRotate: true, duration: 900 }
      }
    });

    // PRIORITY 2C: Egypt comparison
    const egyptAvg = 200;
    const diff = total - egyptAvg;
    const compareEl = document.getElementById('calcCompare');
    if (compareEl) {
      const direction = diff > 0
        ? `<strong style="color:#f87171">${diff}L above</strong>`
        : `<strong style="color:#22d3ee">${Math.abs(diff)}L below</strong>`;
      compareEl.innerHTML = `<i class="fa-solid fa-flag"></i> The average Egyptian uses ~<strong>200L/day</strong>. You use <strong>${total}L</strong> — that's ${direction} average.`;
    }

    // Savings (20%)
    const saveDay    = Math.round(total * 0.2);
    const saveWeek   = saveDay * 7;
    const saveYear   = saveDay * 365;
    const savePeople = Math.round(saveYear / 50);
    document.getElementById('saveDaily').textContent  = saveDay + 'L';
    document.getElementById('saveWeekly').textContent = saveWeek.toLocaleString() + 'L';
    document.getElementById('saveYearly').textContent = (saveYear / 1000).toFixed(1) + 'K L';
    document.getElementById('savePeople').textContent = savePeople + ' ppl/yr';

    // Rating
    const ratingEl = document.getElementById('calcRating');
    if (total < 220) {
      ratingEl.textContent = '🌿 Excellent! You\'re a water conservation champion.';
      ratingEl.className = 'calc__rating low';
    } else if (total < 400) {
      ratingEl.textContent = '⚡ Good — a few tweaks could make a big difference.';
      ratingEl.className = 'calc__rating medium';
    } else {
      ratingEl.textContent = '🚨 High usage — check our Tips section to reduce waste.';
      ratingEl.className = 'calc__rating high';
    }

    // Restore pledge badge if already pledged
    const pledgedDate = localStorage.getItem('aq-pledge-date');
    if (pledgedDate) {
      document.getElementById('pledgeBtn').classList.add('hidden');
      const done = document.getElementById('pledgeDone');
      done.classList.remove('hidden');
      document.getElementById('pledgeDate').textContent = `🏅 Pledged on ${pledgedDate}`;
    }

    if (window.innerWidth < 900) {
      document.getElementById('calcContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // PRIORITY 2D: Pledge
  document.getElementById('pledgeBtn')?.addEventListener('click', function () {
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    localStorage.setItem('aq-pledge-date', date);
    this.classList.add('hidden');
    const done = document.getElementById('pledgeDone');
    done.classList.remove('hidden');
    document.getElementById('pledgeDate').textContent = `🏅 Pledged on ${date}`;
  });

  // BONUS: Share card
  document.getElementById('shareBtn')?.addEventListener('click', function () {
    const card = document.getElementById('shareCard');
    const saveDay  = Math.round(lastTotal * 0.2);
    const saveYear = saveDay * 365;
    card.innerHTML = `
<strong>💧 My AquaSave Water Report</strong>

I use <strong>${lastTotal}L</strong> of water per day.
I pledged to save <strong>${saveDay}L</strong> daily.
That's <strong>${saveYear.toLocaleString()}L saved per year</strong>.

Join me → aquasave.github.io
#SDG6 #AquaSave #SaveWater
    `.trim();
    card.classList.toggle('hidden');
    if (!card.classList.contains('hidden')) {
      this.innerHTML = '<i class="fa-solid fa-copy"></i> Copy to Clipboard';
      this.onclick = () => {
        navigator.clipboard?.writeText(card.innerText).then(() => {
          this.innerHTML = '<i class="fa-solid fa-circle-check"></i> Copied!';
          setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Share My Impact'; this.onclick = null; }, 2500);
        });
      };
    }
  });
})();

/* ── 10. FIX 1: TIPS — working habit tracker with localStorage ── */
(function () {
  const STORAGE_KEY = 'aq-tips-done';
  const levelMessages = [
    'Start completing tips to build your score!',
    'Great start! Keep going 💧',
    'You\'re making a difference! 2 down, 4 to go.',
    'Halfway there — you\'re saving water every day! 🌊',
    'Almost a champion — just 2 more habits!',
    'One more tip and you reach Conservation Champion!',
    '🏆 Water Champion! You\'re saving an estimated 267+ liters per day.'
  ];

  // Load saved state from localStorage
  let done = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  function updateScoreUI() {
    const count = done.length;
    const pct   = (count / 6) * 100;
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreBar     = document.getElementById('scoreBar');
    const progressLvl  = document.getElementById('progressLevel');
    const achievement  = document.getElementById('tipsAchievement');

    if (scoreDisplay) scoreDisplay.textContent = `${count} / 6`;
    if (scoreBar)     scoreBar.style.width = pct + '%';
    if (progressLvl)  progressLvl.textContent = levelMessages[count] || '';
    if (achievement)  achievement.classList.toggle('hidden', count < 6);
  }

  function applyVisualState() {
    document.querySelectorAll('.tip-card').forEach(card => {
      const id   = card.dataset.tipId;
      const icon = card.querySelector('.tip-card__toggle i');
      if (done.includes(id)) {
        card.classList.add('completed');
        if (icon) icon.className = 'fa-solid fa-circle-check';
      } else {
        card.classList.remove('completed');
        if (icon) icon.className = 'fa-regular fa-circle-check';
      }
    });
  }

  // Attach click handler to each tip card (the whole card is clickable)
  document.querySelectorAll('.tip-card').forEach(card => {
    card.addEventListener('click', function () {
      const id = this.dataset.tipId;
      if (done.includes(id)) {
        done = done.filter(d => d !== id);     // unmark
      } else {
        done = [...done, id];                  // mark done
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
      applyVisualState();
      updateScoreUI();
    });
  });

  // Initialize on load
  applyVisualState();
  updateScoreUI();
})();

/* ── 11. CONTACT FORM ────────────────────────────────── */
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
      if (!f.value.trim()) { f.style.borderColor='#f87171'; f.style.boxShadow='0 0 0 4px rgba(248,113,113,.12)'; valid=false; }
      else { f.style.borderColor=''; f.style.boxShadow=''; }
    });
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.style.borderColor='#f87171'; valid=false; }
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
    f.addEventListener('input', () => { f.style.borderColor=''; f.style.boxShadow=''; });
  });
})();

/* ── 12. BACK TO TOP ─────────────────────────────────── */
(function () {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 13. ACTIVE NAV LINKS ────────────────────────────── */
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
          l.style.color      = active ? 'var(--brand2)' : '';
          l.style.fontWeight = active ? '700' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
})();
