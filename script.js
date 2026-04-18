/* Developed by AquaSave Team | AquaSave Initiative | SDG 6 */

/* ══════════════════════════════════════════════════════════
   CONFIGURATION
══════════════════════════════════════════════════════════ */
const CONFIG = {
  storageKeys: {
    habits:         'aqua_habits',
    lastUsage:      'aqua_last_usage',
    pledge:         'aqua_pledge',
    pledgeDate:     'aqua_pledge_date',
    pledgeCount:    'aqua_pledge_count',
    theme:          'aqua_theme',
    notifEnabled:   'aqua_notif_enabled',
    notifTime:      'aqua_notif_time',
    billPeople:     'aqua_bill_people',
    lastBillResult: 'aqua_last_bill',
    habitsToday:    'aqua_habits_today_date',
    reminderDismissed: 'aqua_reminder_dismissed',
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

  // Egypt official residential water tariff (EGP / m³)
  waterTariff: [
    { upTo: 10, rate: 0.65 },
    { upTo: 20, rate: 1.60 },
    { upTo: 30, rate: 2.25 },
    { upTo: 40, rate: 2.75 },
    { upTo: Infinity, rate: 3.15 },
  ],
  sewageMultiplier: 0.75,   // sewage = 75% of water bill
  baseRateEGP: 0.65,        // EGP/m³ used for virtual water cost display

  // Yearly savings equivalents (EGP price estimates in Egypt 2026)
  yearlyEquivItems: [
    { emoji: '🍚', label: 'kg of rice', egpPerUnit: 35 },
    { emoji: '📚', label: 'school books', egpPerUnit: 120 },
    { emoji: '🌐', label: 'months of internet', egpPerUnit: 400 },
  ],

  // Reminder messages (rotated daily by day-of-year index)
  reminderMessages: [
    '💧 Did you log your water habits today?',
    '🌱 Have you completed your 6 daily water habits?',
    '♻️ Remember: every drop you save changes lives!',
    '🌊 Small habits, massive impact — check in today!',
    '💡 Your daily actions support UN SDG 6. Keep going!',
    '🚰 Don\'t forget: turn off the tap while brushing tonight!',
    '🏆 Champions don\'t take days off — log your habits!',
  ],
  carbon: {
    kgCo2PerM3:     0.298,   // Egypt/MENA grid — kg CO₂ per m³ treated & pumped
    carKgPerKm:     0.210,   // avg petrol car — kg CO₂ per km
    treeKgPerYear:  21,      // avg tree CO₂ absorption per year
    phoneKgPerCharge: 0.004, // smartphone full charge — kWh × 0.5 kg CO₂/kWh
    gaugeMaxMonthly: 20,     // kg CO₂/month considered "high" (gauge ceiling)
  },

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

  // Budget state
  billPeople:    2,
  billDailyL:    200,  // fallback if no calculator run yet
  lastBillEGP:   0,    // current monthly total incl. sewage
  lastBillSaveEGP: 0,  // after-20%-reduction monthly total
  virtualCounts: { burger: 0, coffee: 0, tshirt: 0, phone: 0 },
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

  // Render carbon section immediately after calculation
  renderCarbonFootprint(totalLiters);
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
   CARBON FOOTPRINT FROM WATER
══════════════════════════════════════════════════════════ */

/**
 * Core calculation: converts daily water litres → monthly CO₂ kg
 * Formula: L/day ÷ 1000 × 30 × 0.298 kg CO₂/m³
 */
function calcCarbonMonthly(dailyLitres) {
  const cf = CONFIG.carbon;
  return parseFloat(((dailyLitres / 1000) * 30 * cf.kgCo2PerM3).toFixed(3));
}

function renderCarbonFootprint(dailyLitres) {
  const cf = CONFIG.carbon;

  // Reveal the panel, hide the prompt
  document.getElementById('carbonPrompt')?.classList.add('hidden');
  const panel = document.getElementById('carbonPanel');
  if (panel) panel.classList.remove('hidden');

  // ── Core numbers ──────────────────────────────────────
  const monthly     = calcCarbonMonthly(dailyLitres);
  const yearly      = parseFloat((monthly * 12).toFixed(2));
  const dailyKg     = parseFloat(((dailyLitres / 1000) * cf.kgCo2PerM3).toFixed(4));

  const save20Daily   = parseFloat((dailyKg * 0.2).toFixed(4));
  const save20Monthly = parseFloat((monthly * 0.2).toFixed(3));
  const save20Yearly  = parseFloat((yearly * 0.2).toFixed(2));

  // ── Real-world equivalents (monthly) ─────────────────
  const carKm     = Math.round(monthly / cf.carKgPerKm);
  const trees     = (monthly / (cf.treeKgPerYear / 12)).toFixed(1);
  const phones    = Math.round(monthly / cf.phoneKgPerCharge);
  const saveTrees = (save20Yearly / cf.treeKgPerYear).toFixed(1);

  // ── Populate text fields ──────────────────────────────
  setText('cMonthly',  monthly.toLocaleString());
  setText('cYearly',   yearly.toLocaleString());
  setText('cDailyLabel', `${dailyKg} kg CO₂`);
  setText('cSaveLabel',  `−${save20Daily} kg CO₂`);
  setText('eqCar',    carKm.toLocaleString());
  setText('eqTrees',  trees);
  setText('eqPhones', phones.toLocaleString());
  setText('eqSaveCo2', save20Yearly.toLocaleString());
  setText('eqSaveTrees', saveTrees);

  // ── Animated gauge number ─────────────────────────────
  animateNumber('carbonGaugeNumber', 0, monthly, 1400);

  // ── SVG gauge fill (stroke-dashoffset) ───────────────
  const ratio  = Math.min(monthly / cf.gaugeMaxMonthly, 1);
  const offset = 283 - (283 * ratio);
  setTimeout(() => {
    const fill = document.getElementById('carbonGaugeFill');
    if (fill) fill.style.strokeDashoffset = offset;
  }, 120);

  // ── Animated progress bars ────────────────────────────
  // Use relative width: daily bar = 100%, save bar = 80% (20% less)
  setTimeout(() => {
    const dailyBar = document.getElementById('carbonBarFill');
    const saveBar  = document.getElementById('carbonBarSave');
    if (dailyBar) dailyBar.style.width = '100%';
    if (saveBar)  saveBar.style.width  = '80%';
  }, 200);

  // ── Headline sentiment badge ──────────────────────────
  const headlineEl = document.getElementById('carbonHeadline');
  if (headlineEl) {
    headlineEl.className = 'carbon-summary-row';
    if (monthly < 3) {
      headlineEl.textContent = '🌱 Low carbon impact — your water habits are climate-friendly!';
      headlineEl.classList.add('is-low');
    } else if (monthly < 8) {
      headlineEl.textContent = '👍 Moderate carbon impact — room to improve with small habit changes.';
      headlineEl.classList.add('is-moderate');
    } else {
      headlineEl.textContent = '⚠️ High carbon impact — reducing water use could significantly cut your CO₂.';
      headlineEl.classList.add('is-high');
    }
  }

  // ── Scroll into view smoothly ─────────────────────────
  setTimeout(() => {
    document.getElementById('carbon')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

/** Small helper to safely set text content */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}


/* ══════════════════════════════════════════════════════════
   SMART WATER BUDGET — PART A: BILL ESTIMATOR
══════════════════════════════════════════════════════════ */

/**
 * Calculates Egyptian tiered water bill (EGP) for a given monthly m³ volume.
 * Returns { waterBill, sewageFee, total, tierBreakdown }
 */
function calcEgyptBill(m3) {
  const tariff = CONFIG.waterTariff;
  let remaining = m3;
  let waterBill = 0;
  let prevBand = 0;
  const tierBreakdown = [];

  for (const tier of tariff) {
    if (remaining <= 0) break;
    const bandSize   = tier.upTo === Infinity ? remaining : Math.min(remaining, tier.upTo - prevBand);
    const bandCost   = bandSize * tier.rate;
    const bandConsumed = Math.min(remaining, tier.upTo - prevBand);

    if (bandConsumed > 0) {
      tierBreakdown.push({
        label: tier.upTo === Infinity
          ? `>${prevBand} m³ @ ${tier.rate} EGP/m³`
          : `${prevBand + 1}–${tier.upTo} m³ @ ${tier.rate} EGP/m³`,
        consumed: bandConsumed,
        cost: bandConsumed * tier.rate,
        rate: tier.rate,
        maxBand: tier.upTo === Infinity ? m3 : tier.upTo - prevBand,
      });
      waterBill += bandConsumed * tier.rate;
      remaining -= bandConsumed;
    }
    prevBand = tier.upTo;
  }

  const sewageFee = waterBill * CONFIG.sewageMultiplier;
  const total     = waterBill + sewageFee;

  return {
    waterBill: parseFloat(waterBill.toFixed(2)),
    sewageFee: parseFloat(sewageFee.toFixed(2)),
    total:     parseFloat(total.toFixed(2)),
    tierBreakdown,
  };
}

function initBillEstimator() {
  // Load daily litres from localStorage (from calculator) or fallback
  const saved = localStorage.getItem(CONFIG.storageKeys.lastUsage);
  if (saved) {
    const { total } = JSON.parse(saved);
    state.billDailyL = total;
  }

  // Bill people stepper
  const savedPeople = parseInt(localStorage.getItem(CONFIG.storageKeys.billPeople) || '2');
  state.billPeople = savedPeople;
  setText('billPeopleVal', savedPeople);

  document.getElementById('billPeopleDown')?.addEventListener('click', () => {
    if (state.billPeople > 1) {
      state.billPeople--;
      setText('billPeopleVal', state.billPeople);
    }
  });
  document.getElementById('billPeopleUp')?.addEventListener('click', () => {
    if (state.billPeople < 20) {
      state.billPeople++;
      setText('billPeopleVal', state.billPeople);
    }
  });

  // Manual override
  document.getElementById('billManualApply')?.addEventListener('click', () => {
    const input = document.getElementById('billManualLitres');
    const val = parseFloat(input?.value);
    if (val && val > 0) {
      state.billDailyL = val;
      updateBillDailyDisplay();
      showToast('✅ Manual daily usage applied — click <strong>Calculate My Bill</strong>.');
    }
  });

  document.getElementById('billCalcBtn')?.addEventListener('click', runBillEstimator);

  updateBillDailyDisplay();
}

function updateBillDailyDisplay() {
  const el    = document.getElementById('billDailyDisplay');
  const chip  = document.getElementById('billSourceChip');
  const saved = localStorage.getItem(CONFIG.storageKeys.lastUsage);

  if (el) el.textContent = `${state.billDailyL.toLocaleString()} L/day`;
  if (chip) {
    chip.textContent = saved ? '📊 From your calculator' : '📏 Default estimate (200L)';
  }
}

function runBillEstimator() {
  const m3Monthly     = (state.billDailyL / 1000) * 30;
  const m3Save        = m3Monthly * 0.8;
  const current       = calcEgyptBill(m3Monthly);
  const after         = calcEgyptBill(m3Save);
  const moneySaved    = parseFloat((current.total - after.total).toFixed(2));

  state.lastBillEGP     = current.total;
  state.lastBillSaveEGP = after.total;

  // Persist for savings comparison tab
  localStorage.setItem(CONFIG.storageKeys.lastBillResult, JSON.stringify({
    current: current.total, after: after.total, moneySaved,
    yearly: parseFloat((moneySaved * 12).toFixed(2)),
    m3Monthly: parseFloat(m3Monthly.toFixed(2)),
  }));

  // Show results container
  const resultsEl = document.getElementById('billResults');
  if (resultsEl) resultsEl.classList.remove('hidden');

  // m³ display
  setText('billM3', m3Monthly.toFixed(1));

  // Tier bars
  renderTierBars(current.tierBreakdown, m3Monthly);

  // Bill cards
  setText('billCurrentTotal', `${current.total.toFixed(2)} EGP`);
  const breakEl = document.getElementById('billCurrentBreak');
  if (breakEl) {
    breakEl.innerHTML = `Water: ${current.waterBill.toFixed(2)} EGP<br>Sewage (75%): ${current.sewageFee.toFixed(2)} EGP`;
  }

  setText('billSaveTotal', `${after.total.toFixed(2)} EGP`);
  const badgeEl = document.getElementById('billSavingBadge');
  if (badgeEl) badgeEl.textContent = `💰 You save ${moneySaved.toFixed(2)} EGP/month`;

  // Update savings comparison tab
  updateSavingsComparison();
  showToast('💶 <strong>Bill calculated!</strong> Check the Savings tab for your yearly impact.');
}

function renderTierBars(tiers, totalM3) {
  const container = document.getElementById('tierBars');
  if (!container) return;
  container.innerHTML = '';

  const tierColors = ['#2ecc71', '#38c5f5', '#f7c948', '#ff9f40', '#ff6b35'];

  tiers.forEach((tier, i) => {
    const pct = Math.min(100, (tier.consumed / Math.max(totalM3, 1)) * 100);
    const row = document.createElement('div');
    row.className = 'tier-row';
    row.innerHTML = `
      <div class="tier-row-label">
        <span>${tier.label}</span>
        <strong>${tier.consumed.toFixed(1)} m³ · ${tier.cost.toFixed(2)} EGP</strong>
      </div>
      <div class="tier-bar-track">
        <div class="tier-bar-fill" style="background:${tierColors[i] || '#38c5f5'}"></div>
      </div>
    `;
    container.appendChild(row);
    setTimeout(() => {
      row.querySelector('.tier-bar-fill').style.width = pct + '%';
    }, 80 + i * 80);
  });
}

/* ══════════════════════════════════════════════════════════
   SMART WATER BUDGET — PART B: VIRTUAL WATER COST
══════════════════════════════════════════════════════════ */
function initVirtualWater() {
  const items = document.querySelectorAll('.virtual-item');

  items.forEach(item => {
    const key = item.dataset.item;
    state.virtualCounts[key] = 0;
    const countEl = item.querySelector('.vi-count');

    item.querySelectorAll('.vi-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir === '+' ? 1 : -1;
        state.virtualCounts[key] = Math.max(0, state.virtualCounts[key] + dir);
        if (countEl) countEl.textContent = state.virtualCounts[key];
        updateVirtualTotals();
      });
    });
  });
}

function updateVirtualTotals() {
  const items = document.querySelectorAll('.virtual-item');
  let totalLitres = 0;

  items.forEach(item => {
    const key    = item.dataset.item;
    const litres = parseInt(item.dataset.liters);
    totalLitres += litres * (state.virtualCounts[key] || 0);
  });

  const m3     = totalLitres / 1000;
  const egp    = m3 * CONFIG.baseRateEGP;

  setText('vtLitres', `${totalLitres.toLocaleString()} L`);
  setText('vtM3',     `${m3.toFixed(2)} m³`);
  setText('vtEGP',    `${egp.toFixed(2)} EGP`);
}

/* ══════════════════════════════════════════════════════════
   SMART WATER BUDGET — PART C: SAVINGS COMPARISON
══════════════════════════════════════════════════════════ */
function updateSavingsComparison() {
  const saved = localStorage.getItem(CONFIG.storageKeys.lastBillResult);
  if (!saved) return;

  const { current, after, moneySaved, yearly } = JSON.parse(saved);

  setText('scNow',  `${current.toFixed(2)} EGP`);
  setText('scSave', `${moneySaved.toFixed(2)} EGP saved/month`);

  const nowSub  = document.getElementById('scNowSub');
  const saveSub = document.getElementById('scSaveSub');
  if (nowSub)  nowSub.textContent  = `Your estimated monthly bill including sewage fees`;
  if (saveSub) saveSub.textContent = `After reducing water use by 20% → ${after.toFixed(2)} EGP/month`;

  // Yearly card
  const yearlyCard = document.getElementById('yearlySavingCard');
  const yearlyEl   = document.getElementById('ysAmount');
  const equivEl    = document.getElementById('yearlyEquivs');

  if (yearlyCard) yearlyCard.classList.remove('hidden');
  if (yearlyEl)   yearlyEl.textContent = `${yearly.toFixed(2)}`;

  if (equivEl && yearly > 0) {
    equivEl.innerHTML = CONFIG.yearlyEquivItems.map(({ emoji, label, egpPerUnit }) => {
      const qty = (yearly / egpPerUnit).toFixed(1);
      return `
        <div class="ye-item">
          <span class="ye-emoji">${emoji}</span>
          <span class="ye-amount">${qty}</span>
          <span class="ye-label">${label}</span>
        </div>
      `;
    }).join('');
  }
}

/* ══════════════════════════════════════════════════════════
   BUDGET TABS
══════════════════════════════════════════════════════════ */
function initBudgetTabs() {
  const tabs   = document.querySelectorAll('.budget-tab');
  const panels = document.querySelectorAll('.budget-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t   => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));

      tab.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.remove('hidden');

      // Refresh savings comparison when tab opened
      if (target === 'savings') updateSavingsComparison();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   SMART REMINDER NOTIFICATIONS
══════════════════════════════════════════════════════════ */
const reminderMessages = CONFIG.reminderMessages;

/** Pick a consistent message for today (same all day, changes daily) */
function getDailyMessage() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return reminderMessages[dayOfYear % reminderMessages.length];
}

function initReminderBanner() {
  const banner    = document.getElementById('reminderBanner');
  const closeBtn  = document.getElementById('reminderBannerClose');
  const textEl    = document.getElementById('reminderBannerText');

  if (!banner) return;

  // Only show if: dismissed key not set today AND after 18:00 AND habits not all done
  const today        = new Date().toDateString();
  const dismissed    = localStorage.getItem(CONFIG.storageKeys.reminderDismissed);
  const habitsToday  = localStorage.getItem(CONFIG.storageKeys.habitsToday);
  const doneHabits   = JSON.parse(localStorage.getItem(CONFIG.storageKeys.habits) || '[]');
  const hour         = new Date().getHours();
  const allDone      = doneHabits.length === 6;

  if (dismissed === today || allDone) return;
  if (hour < 18) return;  // only show after 6 PM

  if (textEl) textEl.textContent = getDailyMessage();
  banner.classList.remove('hidden');

  closeBtn?.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem(CONFIG.storageKeys.reminderDismissed, today);
  });
}

function initReminderSettings() {
  const toggle     = document.getElementById('notifToggle');
  const timeInput  = document.getElementById('reminderTime');
  const saveBtn    = document.getElementById('rsSaveBtn');
  const previewEl  = document.getElementById('rsPreviewText');
  const statusEl   = document.getElementById('rsStatus');
  const rsBody     = document.getElementById('rsBody');

  if (!toggle) return;

  // Restore saved state
  const isEnabled   = localStorage.getItem(CONFIG.storageKeys.notifEnabled) === 'true';
  const savedTime   = localStorage.getItem(CONFIG.storageKeys.notifTime) || '20:00';

  toggle.checked      = isEnabled;
  if (timeInput) timeInput.value = savedTime;
  if (previewEl) previewEl.textContent = `"${getDailyMessage()}"`;

  // Toggle animation — show/hide body
  const toggleBody = () => {
    if (rsBody) rsBody.style.opacity = toggle.checked ? '1' : '0.5';
    if (timeInput) timeInput.disabled = !toggle.checked;
  };
  toggleBody();
  toggle.addEventListener('change', toggleBody);

  // Save button
  saveBtn?.addEventListener('click', async () => {
    const enabled = toggle.checked;
    const time    = timeInput?.value || '20:00';

    localStorage.setItem(CONFIG.storageKeys.notifEnabled, enabled);
    localStorage.setItem(CONFIG.storageKeys.notifTime, time);

    if (!enabled) {
      setRsStatus('info', '🔕 Reminders disabled. You can re-enable them any time.', statusEl);
      return;
    }

    // Check browser support
    if (!('Notification' in window)) {
      setRsStatus('error',
        '⚠️ Your browser does not support notifications. Try Chrome or Edge on desktop for the best experience.',
        statusEl);
      return;
    }

    // Request permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      scheduleNotification(time);
      setRsStatus('success',
        `✅ Reminder set for ${formatTime12(time)} daily. Keep the page open or pin it for best results.`,
        statusEl);
      showToast(`🔔 <strong>Reminder saved!</strong> You'll be nudged at ${formatTime12(time)}.`);
    } else if (permission === 'denied') {
      setRsStatus('error',
        '❌ Notification permission was denied. Please enable it in your browser settings → Site Settings → Notifications.',
        statusEl);
    } else {
      setRsStatus('info', 'ℹ️ Permission not granted. Please try again or enable in browser settings.', statusEl);
    }
  });
}

function setRsStatus(type, message, el) {
  if (!el) return;
  el.className = `rs-status ${type}`;
  el.textContent = message;
}

function formatTime12(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12    = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Schedule a browser notification for the user's chosen time today (and recurring via setInterval) */
function scheduleNotification(time) {
  const [targetH, targetM] = time.split(':').map(Number);

  function fireIfTime() {
    const now = new Date();
    if (now.getHours() === targetH && now.getMinutes() === targetM) {
      const message = getDailyMessage();
      const notif = new Notification('💧 AquaSave Reminder', {
        body: message.replace(/^[^\s]+\s/, ''), // strip leading emoji
        icon: 'https://em-content.zobj.net/source/apple/391/droplet_1f4a7.png',
        tag:  'aquasave-daily',
        requireInteraction: false,
      });
      notif.onclick = () => window.focus();
    }
  }

  // Check every minute
  setInterval(fireIfTime, 60000);
  fireIfTime(); // run immediately in case user saved at exactly the right minute
}

/** Restore notification scheduling on page load if previously enabled */
function restoreNotificationSchedule() {
  const enabled = localStorage.getItem(CONFIG.storageKeys.notifEnabled) === 'true';
  const time    = localStorage.getItem(CONFIG.storageKeys.notifTime) || '20:00';

  if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  scheduleNotification(time);
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

  // Smart Water Budget
  initBudgetTabs();
  initBillEstimator();
  initVirtualWater();

  // Reminders
  initReminderBanner();
  initReminderSettings();
  restoreNotificationSchedule();

  // Share card
  injectShareCardStyles();
  buildShareSection();

  // Persistent state
  loadPersistedState();
  restorePledgeState();

  // Event listeners
  bindEvents();
});
