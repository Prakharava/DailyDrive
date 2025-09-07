const codeMap = {
  0: 'Clear',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  56: 'Freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Heavy freezing rain',
  71: 'Slight snow fall', 73: 'Snow fall', 75: 'Heavy snow fall',
  77: 'Snow grains', 80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ heavy hail'
};

function cacheGet(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw);
    if (Date.now() - t > maxAgeMs) return null;
    return v;
  } catch { return null; }
}

function cacheSet(key, v) {
  try { localStorage.setItem(key, JSON.stringify({ v, t: Date.now() })); } catch {}
}

async function fetchWeather({ lat, lon }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const data = await res.json();
  return {
    temp: Math.round(data?.current?.temperature_2m ?? NaN),
    rh: data?.current?.relative_humidity_2m,
    wind: Math.round(data?.current?.wind_speed_10m ?? NaN),
    code: data?.current?.weather_code
  };
}

export async function initWeather(coords) {
  const loc = document.getElementById('location');
  const temp = document.getElementById('temp');
  const desc = document.getElementById('desc');
  const meta = document.getElementById('weather-meta');
  if (!loc || !temp || !desc || !meta) return;

  // Default fallback near New Delhi, India if no geolocation available
  const fallback = { lat: 28.6139, lon: 77.2090 };
  const { lat, lon } = coords ?? fallback;

  temp.textContent = '--°';
  desc.textContent = 'Loading…';
  meta.textContent = 'Wind: -- | Humidity: --';

  const cacheKey = `dd:weather:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cacheGet(cacheKey, 10 * 60 * 1000);
  try {
    const w = cached ?? await fetchWeather({ lat, lon });
    if (!cached) cacheSet(cacheKey, w);
    temp.textContent = Number.isFinite(w.temp) ? `${w.temp}°` : '--°';
    desc.textContent = codeMap[w.code] || '—';
    const rh = (w.rh != null) ? `${w.rh}%` : '--';
    const ws = Number.isFinite(w.wind) ? `${w.wind} km/h` : '--';
    meta.textContent = `Wind: ${ws} | Humidity: ${rh}`;
  } catch (e) {
    desc.textContent = 'Unable to load weather';
  }
}
