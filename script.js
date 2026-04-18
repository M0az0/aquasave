/* Developed by AquaSave Team | AquaSave Initiative | SDG 6 */

/* ══════════════════════════════════════════════════════════
   CONFIGURATION
══════════════════════════════════════════════════════════ */
const CONFIG = {
  storageKeys: {
    habits:      'aqua_habits',
    lastUsage:   'aqua_last_usage',
    pledge:      'aqua_pledge',
    pledgeDate:  'aqua_pledge_date',
    pledgeCount: 'aqua_pledge_count',
    theme:       'aqua_theme',
  },

  ecoTips: [
    'A running tap wastes 12 litres per minute — turn it off while brushing!',
    'The average Egyptian uses ~200L of water per day. How do you compare?',
    'Fixing a dripping faucet saves over 3,000 litres per year.',
    'Choosing a plant-based meal once a week saves more water than 10 shorter showers.',
    '1 cotton t-shirt requires 2,700 litres of water to produce.',
    'Watering plants in the evening reduces evaporation by up to 70%.',
    'A dishwasher uses 10L per cycle — handwashing can use up to 40L.',
    'Agriculture accounts for 70% of global freshwater withdrawals.',
    'Collecting rainwater for garden use is legal in most countries — and free!',
    'It takes 2,400 litres of water to produce a single hamburger.',
  ],

  habitMessages: [
    'Start completing habits to build your score!',
    'Great start! 1 habit down — keep going 💧',
    '2/6 — you\'re making a real difference!',
    'Halfway there — 3 solid habits! 🌊',
    '4/6 — almost a champion! Two more to go.',
    'One final habit away from Champion status!',
    '🏆 Champion! You\'re saving an estimated 262L+ every day.',
  ],

  wasteRatePerSecond: 34722, // litres of household water wasted globally per second

  chartColors: ['#38c5f5', '#2a9fd4', '#7ee8fa', '#1a6b9e', '#0d4a7a', '#052040'],

  egyptDailyAvgPerPerson: 200,
  globalDailyAvgPerPerson: 150,
};


/* ══════════════════════════════════════════════════════════
   STATE MANAGEMENT
══════════════════════════════════════════════════════════ */
const state = {
  people:        2,
  showerMinutes: 5,
  toiletFlushes: 3,
  cookingLevel:  15,
  laundryLoads:  0,
  dishMethod:    20,
  outdoorUse:    0,

  lastCalculatedTotal: 0,
  usageChart: null,
  wasteTickerStart: Date.now(),
};

// Load persisted state from localStorage
function loadPersistedState() {
  const savedUsage = localStorage.getItem(CONFIG.storageKeys.lastUsage);
  if (savedUsage) {
    const { total, timestamp } = JSON.parse(savedUsage);
    const date = new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const banner = document.getElementById('lastUsageBanner');
    const text   = document.getElementById('lastUsageText');
    if (banner && text) {
      text.textContent = `Last calculation: ${total}L/day (${date})`;
      banner.classList.remove('hidden');
    }
  }
}

function saveLastUsage(total) {
  localStorage.setItem(CONFIG.storageKeys.lastUsage, JSON.stringify({
    total,
    timestamp: Date.now(),
  }));
}

function clearAppData() {
  const keysToRemove = Object.values(CONFIG.storageKeys);
  keysToRemove.forEach(key => localStorage.removeItem(key));
  showToast('🗑️ All your data has been cleared successfully.');

  // Reset UI state
  document.querySelectorAll('.habit-card.is-done').forEach(card => {
    card.classList.remove('is-done');
    const check = card.querySelector('.habit-check');
    if (check) check.textContent = '○';
  });
  updateHabitUI(0);

  const banner = document.getElementById('lastUsageBanner');
  if (banner) banner.classList.add('hidden');

  const pledgeBtn = document.getElementById('pledgeBtn');
  if (pledgeBtn) {
    pledgeBtn.textContent = '🤝 I Pledge to Reduce by 20%';
    pledgeBtn.classList.remove('is-pledged');
    pledgeBtn.disabled = false;
  }
  const pledgeDate = document.getElementById('pledgeDate');
  if (pledgeDate) pledgeDate.classList.add('hidden');
}


/* ══════════════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════════════ */
function showToast(html, duration = 4500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = html;
  toast.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

function animateNumber(elementId, from, to, duration = 1000) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const startTime = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current  = Math.round(from + (to - from) * easeOut(progress));
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setBarWidth(elementId, width) {
  const el = document.getElementById(elementId);
  if (el) setTimeout(() => { el.style.width = Math.min(100, width) + '%'; }, 150);
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — CURSOR
══════════════════════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  document.body.style.cursor = 'none';

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX - 17) * 0.12;
    ringY += (mouseY - ringY - 17) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, .habit-card, .water-card, .fact-card, .hero-stat, .faq-question';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
  });
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — LOADER
══════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('is-hidden'), 2100);
  });
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — OCEAN BACKGROUND BUBBLES
══════════════════════════════════════════════════════════ */
function initBubbles() {
  const ocean = document.querySelector('.ocean-bg');
  if (!ocean) return;

  for (let i = 0; i < 14; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = 20 + Math.random() * 55;
    bubble.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${12 + Math.random() * 18}s;
      animation-delay: -${Math.random() * 20}s;
    `;
    ocean.appendChild(bubble);
  }
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — NAVIGATION
══════════════════════════════════════════════════════════ */
function initNavigation() {
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('is-scrolled', window.scrollY > 50);
  }, { passive: true });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', false);
        mobileMenu.setAttribute('aria-hidden', true);
      });
    });
  }
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — SCROLL PROGRESS & REVEAL
══════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  const btt = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const docEl   = document.documentElement;
    const scrolled = docEl.scrollTop / (docEl.scrollHeight - docEl.clientHeight);
    if (bar) bar.style.width = (scrolled * 100) + '%';
    if (btt) btt.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — ECO TIP (HERO)
══════════════════════════════════════════════════════════ */
function initEcoTip() {
  const tipEl = document.getElementById('ecoTipText');
  if (!tipEl) return;

  const randomTip = CONFIG.ecoTips[Math.floor(Math.random() * CONFIG.ecoTips.length)];
  tipEl.textContent = `Did you know? ${randomTip}`;
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — HERO COUNTER
══════════════════════════════════════════════════════════ */
function initHeroCounter() {
  const el = document.getElementById('heroLiters');
  if (!el) return;

  let simulatedSaved = 847320 + Math.floor(Math.random() * 5000);
  el.textContent = simulatedSaved.toLocaleString();

  setInterval(() => {
    simulatedSaved += Math.floor(Math.random() * 3) + 1;
    el.textContent = simulatedSaved.toLocaleString();
  }, 2000);
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — TOGGLE BUTTONS
══════════════════════════════════════════════════════════ */
function initToggleGroups() {
  document.querySelectorAll('.toggle-group').forEach(group => {
    group.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syncToggleState(group.id, parseInt(btn.dataset.value));
      });
    });
  });
}

function syncToggleState(groupId, value) {
  const map = {
    showerGroup:  'showerMinutes',
    toiletGroup:  'toiletFlushes',
    cookGroup:    'cookingLevel',
    laundryGroup: 'laundryLoads',
    dishGroup:    'dishMethod',
    outdoorGroup: 'outdoorUse',
  };
  if (map[groupId]) state[map[groupId]] = value;
}

function getActiveToggleValue(groupId) {
  const active = document.querySelector(`#${groupId} .toggle-btn.active`);
  return active ? parseInt(active.dataset.value) : 0;
}


/* ══════════════════════════════════════════════════════════
   UI HANDLERS — STEPPER (people count)
══════════════════════════════════════════════════════════ */
function initStepper() {
  const downBtn  = document.getElementById('peopleDown');
  const upBtn    = document.getElementById('peopleUp');
  const valueEl  = document.getElementById('peopleValue');

  if (!downBtn || !upBtn || !valueEl) return;

  downBtn.addEventListener('click', () => {
    if (state.people > 1) {
      state.people--;
      valueEl.textContent = state.people;
    }
  });

  upBtn.addEventListener('click', () => {
    if (state.people < 20) {
      state.people++;
      valueEl.textContent = state.people;
    }
  });
}


/* ══════════════════════════════════════════════════════════
   CALCULATOR LOGIC
══════════════════════════════════════════════════════════ */
function calculateUsage() {
  // Gather inputs
  const showerL  = getActiveToggleValue('showerGroup') * 9 * state.people;
  const toiletL  = getActiveToggleValue('toiletGroup') * 9 * state.people;
  const cookL    = getActiveToggleValue('cookGroup') * state.people;
  const laundryL = (getActiveToggleValue('laundryGroup') * 70) / 7; // loads/week → L/day
  const dishL    = getActiveToggleValue('dishGroup') * state.people;
  const outdoorL = getActiveToggleValue('outdoorGroup');

  const totalLiters = Math.round(showerL + toiletL + cookL + laundryL + dishL + outdoorL);
  state.lastCalculatedTotal = totalLiters;

  // Persist
  saveLastUsage(totalLiters);

  // Show results panel
  document.getElementById('resultsPlaceholder').classList.add('hidden');
  const resultsContent = document.getElementById('resultsContent');
  resultsContent.classList.remove('hidden');
  resultsContent.classList.add('is-visible');

  // Animate main number
  animateNumber('totalLiters', 0, totalLiters);

  // Smart feedback
  renderFeedbackBadge(totalLiters);

  // Bottles context
  const bottleCount = Math.round(totalLiters / 1.5);
  const bottlesEl = document.getElementById('bottlesContext');
  if (bottlesEl) bottlesEl.textContent = `≈ ${bottleCount.toLocaleString()} standard 1.5L bottles`;

  // Comparison bars
  const egyptTotal  = CONFIG.egyptDailyAvgPerPerson * state.people;
  const globalTotal = CONFIG.globalDailyAvgPerPerson * state.people;
  const maxVal = Math.max(totalLiters, egyptTotal, globalTotal) * 1.2;

  setBarWidth('yourBar',   (totalLiters / maxVal) * 100);
  setBarWidth('egyptBar',  (egyptTotal  / maxVal) * 100);
  setBarWidth('globalBar', (globalTotal / maxVal) * 100);

  document.getElementById('yourUsageLabel').textContent  = `${totalLiters}L/day`;
  document.getElementById('egyptLabel').textContent       = `${egyptTotal}L/day`;
  document.getElementById('globalLabel').textContent      = `${globalTotal}L/day`;

  const perPerson = Math.round(totalLiters / state.people);
  const diffFromEgypt = perPerson - CONFIG.egyptDailyAvgPerPerson;
  const msgEl = document.getElementById('comparisonMessage');
  if (msgEl) {
    msgEl.textContent = diffFromEgypt > 0
      ? `⚠️ You use ${diffFromEgypt}L more per person than the Egyptian average. Reducing by 20% could bring you below average.`
      : `✅ You use ${Math.abs(diffFromEgypt)}L less per person than the Egyptian average. Excellent habits — keep going!`;
  }

  // Savings (20% reduction)
  const savedPerDay = Math.round(totalLiters * 0.2);
  document.getElementById('saveDay').textContent    = `${savedPerDay}L`;
  document.getElementById('saveWeek').textContent   = `${(savedPerDay * 7).toLocaleString()}L`;
  document.getElementById('saveYear').textContent   = `${(savedPerDay * 365).toLocaleString()}L`;
  document.getElementById('savePeople').textContent = Math.round((savedPerDay * 365) / 50).toLocaleString();

  // Chart
  renderChart({ showerL, toiletL, cookL, laundryL, dishL, outdoorL, totalLiters });

  // Update share card
  document.getElementById('sc-daily').textContent = `${totalLiters}L`;
  document.getElementById('sc-saved').textContent = `${(savedPerDay * 365).toLocaleString()}L`;

  // Restore pledge state
  restorePledgeState();

  showToast('✅ <strong>Done!</strong> Your water footprint has been calculated.');
}

function renderFeedbackBadge(total) {
  const badge = document.getElementById('feedbackBadge');
  if (!badge) return;

  badge.className = 'feedback-badge';

  if (total > 300) {
    badge.textContent = 'High Consumption ⚠️';
    badge.classList.add('high');
  } else if (total >= 150) {
    badge.textContent = 'Moderate Usage 👍';
    badge.classList.add('moderate');
  } else {
    badge.textContent = 'Excellent — Keep It Up! 🌱';
    badge.classList.add('low');
  }
}

function renderChart({ showerL, toiletL, cookL, laundryL, dishL, outdoorL, totalLiters }) {
  const ctx = document.getElementById('usageChart');
  if (!ctx) return;

  if (state.usageChart) state.usageChart.destroy();

  state.usageChart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Showers', 'Toilet', 'Cooking', 'Laundry', 'Dishes', 'Outdoor'],
      datasets: [{
        data: [showerL, toiletL, cookL, laundryL, dishL, outdoorL],
        backgroundColor: CONFIG.chartColors,
        borderColor: 'rgba(56, 197, 245, 0.12)',
        borderWidth: 2,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#8ab4c8',
            font: { family: 'DM Sans', size: 11 },
            boxWidth: 10,
            padding: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: ({ label, parsed }) => {
              const pct = Math.round((parsed / totalLiters) * 100);
              return ` ${label}: ${parsed}L (${pct}%)`;
            },
          },
        },
      },
      animation: { animateRotate: true, duration: 900 },
    },
  });
}


/* ══════════════════════════════════════════════════════════
   PLEDGE SYSTEM
══════════════════════════════════════════════════════════ */
function takePledge() {
  const btn    = document.getElementById('pledgeBtn');
  const dateEl = document.getElementById('pledgeDate');
  if (!btn || btn.classList.contains('is-pledged')) return;

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  btn.textContent = '✅ Pledged!';
  btn.classList.add('is-pledged');
  btn.disabled = true;

  if (dateEl) {
    dateEl.textContent = `🏅 Pledged on ${today}`;
    dateEl.classList.remove('hidden');
  }

  localStorage.setItem(CONFIG.storageKeys.pledge, 'true');
  localStorage.setItem(CONFIG.storageKeys.pledgeDate, today);

  // Increment simulated pledge count
  const currentCount = parseInt(localStorage.getItem(CONFIG.storageKeys.pledgeCount) || '1847');
  localStorage.setItem(CONFIG.storageKeys.pledgeCount, currentCount + 1);

  showToast('🏅 <strong>Pledge saved!</strong> Your commitment is stored in your browser.');
}

function restorePledgeState() {
  const isPledged  = localStorage.getItem(CONFIG.storageKeys.pledge);
  const pledgeDate = localStorage.getItem(CONFIG.storageKeys.pledgeDate);
  if (!isPledged || !pledgeDate) return;

  const btn    = document.getElementById('pledgeBtn');
  const dateEl = document.getElementById('pledgeDate');

  if (btn) {
    btn.textContent = '✅ Already Pledged!';
    btn.classList.add('is-pledged');
    btn.disabled = true;
  }
  if (dateEl) {
    dateEl.textContent = `🏅 Pledged on ${pledgeDate}`;
    dateEl.classList.remove('hidden');
  }
}


/* ══════════════════════════════════════════════════════════
   HABIT TRACKER
══════════════════════════════════════════════════════════ */
function initHabitTracker() {
  // Restore from localStorage
  const savedHabits = JSON.parse(localStorage.getItem(CONFIG.storageKeys.habits) || '[]');

  document.querySelectorAll('.habit-card').forEach(card => {
    const habitId = parseInt(card.dataset.habitId);

    if (savedHabits.includes(habitId)) {
      markHabitDone(card, true);
    }

    card.addEventListener('click', () => toggleHabit(card));
  });

  updateHabitUI(savedHabits.length);
}

function toggleHabit(card) {
  const isDone = card.classList.contains('is-done');
  markHabitDone(card, !isDone);

  const completedIds = Array.from(document.querySelectorAll('.habit-card.is-done'))
    .map(c => parseInt(c.dataset.habitId));

  localStorage.setItem(CONFIG.storageKeys.habits, JSON.stringify(completedIds));
  updateHabitUI(completedIds.length);
}

function markHabitDone(card, isDone) {
  const check = card.querySelector('.habit-check');
  card.classList.toggle('is-done', isDone);
  if (check) check.textContent = isDone ? '✓' : '○';
}

function updateHabitUI(score) {
  const scoreEl   = document.getElementById('habitScore');
  const fillEl    = document.getElementById('progressFill');
  const messageEl = document.getElementById('progressMessage');
  const achievement = document.getElementById('achievementBanner');
  const tracker = document.getElementById('progressTrack');

  if (scoreEl)   scoreEl.textContent = score;
  if (fillEl)    fillEl.style.width  = `${(score / 6) * 100}%`;
  if (messageEl) messageEl.textContent = CONFIG.habitMessages[score] || '';
  if (tracker)   tracker.setAttribute('aria-valuenow', score);

  // Share card score
  const scScore = document.getElementById('sc-score');
  if (scScore) scScore.textContent = `${score}/6`;

  // Achievement banner
  if (achievement) {
    achievement.classList.toggle('is-visible', score === 6);
    achievement.classList.toggle('hidden', score < 6);
  }

  if (score === 6) {
    showToast('🎉 <strong>Perfect score!</strong> You\'ve completed all 6 habits!');
  }
}


/* ══════════════════════════════════════════════════════════
   IMPACT SECTION — COUNTERS & TICKER
══════════════════════════════════════════════════════════ */
function initImpactCounters() {
  const pledgeCount = parseInt(localStorage.getItem(CONFIG.storageKeys.pledgeCount) || '1847');

  const counters = [
    { id: 'counter1', target: 1243890 },
    { id: 'counter2', target: 8420 },
    { id: 'counter3', target: 34 },
    { id: 'counter4', target: pledgeCount },
  ];

  counters.forEach(({ id, target }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateNumber(id, 0, target, 1800);
        observer.disconnect();
      }
    }, { threshold: 0.4 });

    observer.observe(el);
  });
}

function initGlobalWasteTicker() {
  const tickerEl = document.getElementById('globalWaste');
  if (!tickerEl) return;

  function updateTicker() {
    const secondsElapsed = Math.floor((Date.now() - state.wasteTickerStart) / 1000);
    const litresWasted   = secondsElapsed * CONFIG.wasteRatePerSecond;
    tickerEl.textContent = `${litresWasted.toLocaleString()} Litres`;
  }

  updateTicker();
  setInterval(updateTicker, 1000);
}


/* ══════════════════════════════════════════════════════════
   SHARE CARD
══════════════════════════════════════════════════════════ */
function copyShareCard() {
  const daily   = document.getElementById('sc-daily')?.textContent  || '—';
  const saved   = document.getElementById('sc-saved')?.textContent  || '—';
  const score   = document.getElementById('sc-score')?.textContent  || '0/6';

  const cardText = `💧 My AquaSave Water Footprint

Daily Usage: ${daily}
Yearly savings if I reduce 20%: ${saved}
Conservation Habit Score: ${score}

I pledged to save water. Join me:
https://m0az0.github.io/aquasave

#SDG6 #AquaSave #SaveWater #CleanWaterForAll`;

  navigator.clipboard.writeText(cardText).then(() => {
    const btn = document.getElementById('copyShareCard');
    if (btn) {
      btn.textContent = '✅ Copied to clipboard!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '📋 Copy My Impact Card';
        btn.classList.remove('copied');
      }, 3000);
    }
    showToast('📋 <strong>Impact card copied!</strong> Share it anywhere to inspire others.');
  });
}

function shareOnWhatsApp() {
  const total = state.lastCalculatedTotal;
  if (total === 0) {
    showToast('⚠️ Please <strong>calculate your usage first</strong> to generate your share message.');
    return;
  }

  const savedPerDay = Math.round(total * 0.2);
  const message = encodeURIComponent(
    `💧 I just calculated my water footprint on AquaSave!\n\n` +
    `My daily household usage: *${total}L*\n` +
    `If I reduce by 20%, I save *${(savedPerDay * 365).toLocaleString()}L per year*.\n\n` +
    `Join me in supporting UN SDG 6 — Clean Water for All:\n` +
    `https://m0az0.github.io/aquasave\n\n` +
    `#SDG6 #AquaSave #SaveWater`
  );

  window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener');
}


/* ══════════════════════════════════════════════════════════
   EVENT BINDING — connects DOM events to logic
══════════════════════════════════════════════════════════ */
function bindEvents() {
  // Calculator
  document.getElementById('calcBtn')?.addEventListener('click', calculateUsage);

  // Reset
  document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (confirm('This will clear all your saved habits, calculations, and pledge. Continue?')) {
      clearAppData();
    }
  });

  // Pledge
  document.getElementById('pledgeBtn')?.addEventListener('click', takePledge);

  // WhatsApp
  document.getElementById('whatsappBtn')?.addEventListener('click', shareOnWhatsApp);

  // Copy share card (may be added to DOM dynamically — use delegation)
  document.addEventListener('click', e => {
    if (e.target.id === 'copyShareCard') copyShareCard();
  });

  // Back to top
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ══════════════════════════════════════════════════════════
   SHARE SECTION — inject share card HTML
══════════════════════════════════════════════════════════ */
function buildShareSection() {
  const shareSection = document.querySelector('section#impact');
  if (!shareSection) return;

  const existing = document.querySelector('.share-card-section');
  if (existing) return;

  const shareHTML = `
    <div class="share-card-section section-wrap" style="padding-top:0">
      <div style="max-width:740px;margin:0 auto;text-align:center">
        <p class="section-label" style="justify-content:center">Share Your Impact</p>
        <h2 class="section-title" style="text-align:center">Spread the<br/><span class="gradient-text">Water Movement</span></h2>

        <div class="share-preview">
          <p class="share-preview-title">💧 My AquaSave Water Footprint</p>
          <div class="share-stats">
            <div class="share-stat"><strong id="sc-daily">—</strong><span>Daily Usage</span></div>
            <div class="share-stat"><strong id="sc-saved">—</strong><span>Yearly Savings −20%</span></div>
            <div class="share-stat"><strong id="sc-score">0/6</strong><span>Habit Score</span></div>
          </div>
          <p class="share-message">
            I calculated my household water footprint and pledged to reduce it by 20%.
            Every litre matters — join me in supporting UN SDG 6.
          </p>
          <div class="share-tags">
            <span>#SDG6</span><span>#AquaSave</span><span>#SaveWater</span><span>#CleanWaterForAll</span>
          </div>
        </div>

        <button class="copy-share-btn" id="copyShareCard">📋 Copy My Impact Card</button>
      </div>
    </div>
  `;

  shareSection.insertAdjacentHTML('afterend', shareHTML);
}


/* ══════════════════════════════════════════════════════════
   INLINE STYLES FOR SHARE CARD (injected dynamically)
══════════════════════════════════════════════════════════ */
function injectShareCardStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .share-card-section { background: linear-gradient(135deg, rgba(56,197,245,.03), transparent); }
    .share-preview {
      background: linear-gradient(135deg, var(--ocean-surface), var(--ocean-deep));
      border: 1px solid rgba(56,197,245,.22);
      border-radius: 24px;
      padding: 44px 40px;
      margin: 40px 0 28px;
      position: relative;
      overflow: hidden;
    }
    .share-preview::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--water-bright), transparent);
    }
    .share-preview-title {
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      letter-spacing: 3px;
      color: var(--water-bright);
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .share-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .share-stat { text-align: center; }
    .share-stat strong {
      display: block;
      font-family: 'Syne', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: var(--water-bright);
    }
    .share-stat span { font-size: 11.5px; color: var(--text-muted); }
    .share-message {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 480px;
      margin: 0 auto 20px;
    }
    .share-tags {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .share-tags span {
      background: rgba(56,197,245,.08);
      border: 1px solid rgba(56,197,245,.18);
      color: var(--water-bright);
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 12px;
    }
    .copy-share-btn {
      background: transparent;
      border: 1px solid var(--card-border) !important;
      color: var(--text-secondary);
      padding: 14px 28px;
      border-radius: 100px;
      font-size: 14px;
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    .copy-share-btn:hover { border-color: var(--water-bright) !important; color: var(--water-bright); }
    .copy-share-btn.copied { border-color: var(--success) !important; color: var(--success); }
  `;
  document.head.appendChild(style);
}


/* ══════════════════════════════════════════════════════════
   INITIALISATION — runs on DOM ready
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Core
  initLoader();
  initBubbles();
  initCursor();
  initNavigation();
  initScrollProgress();
  initScrollReveal();

  // Hero
  initEcoTip();
  initHeroCounter();

  // Calculator
  initToggleGroups();
  initStepper();

  // Habits
  initHabitTracker();

  // Impact
  initImpactCounters();
  initGlobalWasteTicker();

  // Share card
  injectShareCardStyles();
  buildShareSection();

  // Persistent state
  loadPersistedState();
  restorePledgeState();

  // Event listeners
  bindEvents();
});
