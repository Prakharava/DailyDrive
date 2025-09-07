const STORE_KEY = 'dd:pomo:v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

function nowSec() { return Math.floor(Date.now() / 1000); }

export function initPomodoro() {
  const el = document.getElementById('pomodoro-ui');
  if (!el) return;
  el.innerHTML = `
    <div class="pomo" aria-live="polite">
      <div class="pomo-row">
        <label>Work (min)
          <input type="number" id="pomo-work" min="1" max="120" value="25" />
        </label>
        <label>Break (min)
          <input type="number" id="pomo-break" min="1" max="60" value="5" />
        </label>
        <label>Long break (min)
          <input type="number" id="pomo-long" min="1" max="60" value="15" />
        </label>
        <label>Every
          <input type="number" id="pomo-every" min="2" max="12" value="4" /> cycles
        </label>
        <span class="pomo-mode" id="pomo-mode" aria-live="polite" aria-atomic="true">Work</span>
      </div>
      <div class="pomo-visual" aria-hidden="true">
        <svg class="pomo-ring" width="160" height="160" viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="45" />
          <circle class="ring-fg" cx="50" cy="50" r="45" />
        </svg>
        <div class="pomo-time" id="pomo-time">25:00</div>
      </div>
      <div class="pomo-actions">
        <button id="pomo-toggle">Start</button>
        <button id="pomo-reset">Reset</button>
        <button id="pomo-skip">Skip</button>
      </div>
    </div>`;

  const timeEl = el.querySelector('#pomo-time');
  const modeEl = el.querySelector('#pomo-mode');
  const toggleBtn = el.querySelector('#pomo-toggle');
  const resetBtn = el.querySelector('#pomo-reset');
  const skipBtn = el.querySelector('#pomo-skip');
  const workInput = el.querySelector('#pomo-work');
  const breakInput = el.querySelector('#pomo-break');
  const longInput = el.querySelector('#pomo-long');
  const everyInput = el.querySelector('#pomo-every');
  const ringFg = el.querySelector('.ring-fg');

  let state = loadState() || {
    mode: 'work', 
    workMin: 25,
    breakMin: 5,
    longMin: 15,
    longEvery: 4,
    remaining: 25 * 60,
    running: false,
    lastTick: nowSec(),
    workStreak: 0,
  };

  workInput.value = String(state.workMin);
  breakInput.value = String(state.breakMin);
  longInput.value = String(state.longMin);
  everyInput.value = String(state.longEvery);

  let timer = null;

  function format(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(Math.max(0, sec % 60)).padStart(2, '0');
    return `${m}:${s}`;
  }

  function render() {
    modeEl.textContent = state.mode === 'work' ? 'Work' : 'Break';
    timeEl.textContent = format(state.remaining);
    toggleBtn.textContent = state.running ? 'Pause' : 'Start';

    if (ringFg) {
      const total = (state.mode === 'work' ? state.workMin : (state.workStreak % state.longEvery === 0 && state.mode === 'break' ? state.longMin : state.breakMin)) * 60;
      const pct = total > 0 ? (1 - state.remaining / total) : 0;
      const C = 2 * Math.PI * 45;
      ringFg.style.strokeDasharray = `${C}`;
      ringFg.style.strokeDashoffset = `${C * pct}`;
    }
  }

  function switchMode(nextMode) {
    state.mode = nextMode;
    // Determine if this break should be long
    const breakLength = (state.workStreak % state.longEvery === 0) ? state.longMin : state.breakMin;
    state.remaining = (nextMode === 'work' ? state.workMin : breakLength) * 60;
    state.running = false;
    state.lastTick = nowSec();
    saveState(state);
    stopTimer();
    render();
    toggleBtn.focus({ preventScroll: true });
  }

  function tick() {
    const now = nowSec();
    const delta = Math.max(0, now - state.lastTick);
    state.lastTick = now;
    if (state.running) {
      state.remaining = Math.max(0, state.remaining - delta);
      if (state.remaining === 0) {
        if (state.mode === 'work') {
          state.workStreak = (state.workStreak + 1);
          saveState(state);
        }
        // Auto-switch when a session ends
        const next = state.mode === 'work' ? 'break' : 'work';
        switchMode(next);
        // Auto-start next session
        state.running = true;
      }
      saveState(state);
      render();
    }
  }

  function startTimer() {
    if (timer) return;
    state.running = true;
    state.lastTick = nowSec();
    saveState(state);
    render();
    timer = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function resetTimer() {
    state.remaining = (state.mode === 'work' ? state.workMin : state.breakMin) * 60;
    state.running = false;
    saveState(state);
    stopTimer();
    render();
  }

  if (state.running) {
    timer = setInterval(tick, 1000);
  }
  render();

  toggleBtn.addEventListener('click', () => {
    if (state.running) { stopTimer(); state.running = false; saveState(state); render(); }
    else { startTimer(); }
  });

  resetBtn.addEventListener('click', resetTimer);
  skipBtn.addEventListener('click', () => {
    const next = state.mode === 'work' ? 'break' : 'work';
    switchMode(next);
  });

  workInput.addEventListener('change', () => {
    const val = Math.max(1, Math.min(120, parseInt(workInput.value || '25', 10)));
    workInput.value = String(val);
    state.workMin = val;
    if (state.mode === 'work' && !state.running) state.remaining = val * 60;
    saveState(state);
    render();
  });

  breakInput.addEventListener('change', () => {
    const val = Math.max(1, Math.min(60, parseInt(breakInput.value || '5', 10)));
    breakInput.value = String(val);
    state.breakMin = val;
    if (state.mode === 'break' && !state.running) state.remaining = val * 60;
    saveState(state);
    render();
  });

  longInput.addEventListener('change', () => {
    const val = Math.max(1, Math.min(60, parseInt(longInput.value || '15', 10)));
    longInput.value = String(val);
    state.longMin = val;
    if (state.mode === 'break' && !state.running && (state.workStreak % state.longEvery === 0)) {
      state.remaining = val * 60;
    }
    saveState(state);
    render();
  });

  everyInput.addEventListener('change', () => {
    const val = Math.max(2, Math.min(12, parseInt(everyInput.value || '4', 10)));
    everyInput.value = String(val);
    state.longEvery = val;
    saveState(state);
    render();
  });
}
