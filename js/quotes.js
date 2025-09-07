function cacheGet(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw);
    if (Date.now() - t > maxAgeMs) return null;
    return v;
  } catch {
    return null;
  }
}

function cacheSet(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify({ v, t: Date.now() }));
  } catch {}
}

// Fallback quotes (used if API + cache fail)
const fallbackQuotes = [
  { content: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { content: "Happiness depends upon ourselves.", author: "Aristotle" },
  { content: "Don’t count the days, make the days count.", author: "Muhammad Ali" }
];

async function fetchQuote() {
  const res = await fetch("https://quote-garden.herokuapp.com/api/v3/quotes/random", {
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`quote ${res.status}`);
  const data = await res.json();
  if (data.data?.[0]) {
    return {
      content: data.data[0].quoteText,
      author: data.data[0].quoteAuthor
    };
  }
  throw new Error("No quote found");
}

export function initQuotes() {
  const textEl = document.getElementById("quote-text");
  const authorEl = document.getElementById("quote-author");
  const btn = document.getElementById("new-quote");
  if (!textEl || !authorEl || !btn) return;

  const cacheKey = "dd:quote";
  const ttl = 2 * 60 * 60 * 1000; 

  const render = (q) => {
    textEl.textContent = q.content || "—";
    authorEl.textContent = q.author ? `— ${q.author}` : "";
  };

  async function load(isRefresh = false) {
    const cached = isRefresh ? null : cacheGet(cacheKey, ttl);
    if (cached) return render(cached);

    textEl.textContent = "Loading…";
    authorEl.textContent = "";

    try {
      const q = await fetchQuote();
      cacheSet(cacheKey, q);
      render(q);
    } catch (e) {
      console.error("Quote fetch failed:", e);

      const fallback =
        fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      render(fallback);
    }
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    load(true);
  });

  load(false);
}
