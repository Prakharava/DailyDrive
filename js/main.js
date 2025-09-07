import { initWeather } from './weather.js';
import { initClock } from './clock.js';
import { initQuotes } from './quotes.js';
import { initTodo } from './todo.js';
import { initPlanner } from './planner.js';
import { initPomodoro } from './pomodoro.js';

function safeInit(name, fn) {
  try {
    fn?.();
    console.log(`[boot] ${name} initialized`);
  } catch (err) {
    console.error(`[boot] ${name} failed`, err);
  }
}

function getCachedCoords() {
  try {
    const raw = localStorage.getItem('dd:coords');
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > 24 * 60 * 60 * 1000) return null;
    return value;
  } catch { return null; }
}

function setCachedCoords(coords) {
  try {
    localStorage.setItem('dd:coords', JSON.stringify({ value: coords, ts: Date.now() }));
  } catch {}
}

async function getCoords() {
  const cached = getCachedCoords();
  if (cached) return cached;
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCachedCoords(coords);
        resolve(coords);
      },
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
    );
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  safeInit('clock', initClock);
  const coords = await getCoords();
  try {
    await initWeather(coords);
    console.log('[boot] weather initialized');
  } catch (e) {
    console.error('[boot] weather failed', e);
  }
  safeInit('quotes', initQuotes);
  safeInit('todo', initTodo);
  safeInit('planner', initPlanner);
  safeInit('pomodoro', initPomodoro);
});
