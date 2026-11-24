
// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Header shadow on scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
const observeReveals = () =>
  document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
observeReveals();

// Count-up numbers
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const raw = el.dataset.count.trim();
    const target = parseFloat(raw);
    const suffix = el.dataset.suffix || raw.replace(/[0-9.]/g, '');
    const start = performance.now();
    const dur = 1400;

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// Services: Pop up 3 cards at a time per row (macOS spring wave)
const serviceCards = [...document.querySelectorAll('#services .service-card')];
if (serviceCards.length) {
  const getCols = () => (window.innerWidth <= 560 ? 1 : window.innerWidth <= 900 ? 2 : 3);

  const syncServiceDelays = () => {
    const cols = getCols();
    serviceCards.forEach((card, i) => {
      card.style.setProperty('--d', `${(i % cols) * 0.09}s`);
    });
  };
  syncServiceDelays();
  window.addEventListener('resize', syncServiceDelays, { passive: true });

  const serviceRowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cols = getCols();
      const idx = serviceCards.indexOf(entry.target);
      const rowStart = Math.floor(idx / cols) * cols;

      // Trigger all cards in the same row together
      serviceCards.slice(rowStart, rowStart + cols).forEach(card => {
        card.classList.add('in');
        serviceRowObserver.unobserve(card);
        revealObserver.unobserve(card);
      });
    });
  }, { threshold: 0.18 });

  serviceCards.forEach(card => serviceRowObserver.observe(card));
}

// Social feed (Feedback page)
const feed = document.getElementById('social-feed');
if (feed) {
  // skeleton placeholders while loading
  feed.innerHTML = '<div class="post skeleton"></div>'.repeat(6);

  const render = (posts) => {
    feed.innerHTML = posts.slice(0, 9).map((p, i) => {
      const img = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
      const caption = (p.caption || '').slice(0, 110);
      return `<a class="post reveal" style="--d:${(i % 3) * 0.1}s" href="${p.permalink}" target="_blank" rel="noopener">
        <img src="${img}" alt="${caption.replace(/"/g, '&quot;')}" loading="lazy">
        <span class="cap">${caption}</span></a>`;
    }).join('');
    observeReveals();
  };

  fetch(feed.dataset.endpoint)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(posts => posts.length ? render(posts) : Promise.reject())
    .catch(() => {
      feed.innerHTML = '<p>Follow us on Instagram to see our latest projects.</p>';
    });
}

// Hide navbar smoothly when footer is in view; bring back when scrolling up
const footerEl = document.querySelector('.site-footer');
if (header && footerEl) {
  const footerNavObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      header.classList.toggle('hidden', entry.isIntersecting);
      if (entry.isIntersecting && links && toggle) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }, { threshold: 0.08 });

  footerNavObserver.observe(footerEl);
}