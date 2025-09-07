const STORAGE_KEY = 'dd:planner:v1';

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadDay(key) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${key}`);
    if (!raw) return {};
    const v = JSON.parse(raw);
    return (v && typeof v === 'object') ? v : {};
  } catch { return {}; }
}

function saveDay(key, data) {
  try { localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(data)); } catch {}
}

function debounce(fn, ms = 500) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function createHourRow(h, data, isToday, currentHour, debouncedSave) {
  const row = document.createElement('div');
  row.className = 'planner-row' + (isToday && h === currentHour ? ' is-now' : '');
  
  const label = document.createElement('div');
  label.className = 'planner-hour';
  
  const content = document.createElement('textarea');
  content.className = 'planner-input';
  content.placeholder = 'Notes…';
  content.value = data[h] || '';

  // Format time as 12-hour with AM/PM
  const displayHour = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  label.textContent = `${displayHour}:00 ${ampm}`;
  
  content.addEventListener('input', () => {
    data[h] = content.value;
    debouncedSave();
  });

  row.append(label, content);
  return row;
}

export function initPlanner() {
  const container = document.getElementById('planner-hours');
  if (!container) return;

  const key = todayKey();
  const data = loadDay(key);
  const now = new Date();
  const currentHour = now.getHours();
  const isToday = new Date().toISOString().split('T')[0] === key;
  const debouncedSave = debounce(() => saveDay(key, data), 500);

  const containerHTML = `
    <div class="planner-container">
      <div class="planner-column">
        <h3>AM</h3>
        <div id="planner-am" class="planner-hours"></div>
      </div>
      <div class="planner-column">
        <h3>PM</h3>
        <div id="planner-pm" class="planner-hours"></div>
      </div>
    </div>
  `;
  
  container.innerHTML = containerHTML;
  
  const amContainer = document.getElementById('planner-am');
  const pmContainer = document.getElementById('planner-pm');
  
  for (let h = 0; h < 24; h++) {
    const row = createHourRow(h, data, isToday, currentHour, debouncedSave);
    if (h < 12) {
      amContainer.appendChild(row);
    } else {
      pmContainer.appendChild(row);
    }
  }
}
