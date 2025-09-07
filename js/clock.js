export function initClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl || !dateEl) return;
  const locale = navigator.language || undefined;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz
  });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', timeZone: tz
  });

  const update = () => {
    const d = new Date();
    timeEl.textContent = timeFmt.format(d);
    dateEl.textContent = dateFmt.format(d);
  };
  update();
  setInterval(update, 1000); 
}
