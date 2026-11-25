
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
}, { threshold: 0.05 });
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

// CLIENT FEEDBACK
// Stacked Google Review Cards (< > Navigation)
const reviewCards = [...document.querySelectorAll('.review-card')];
if (reviewCards.length) {
  let current = 0;
  const counterEl = document.getElementById('review-current');
  const prevBtn = document.querySelector('.review-nav.prev');
  const nextBtn = document.querySelector('.review-nav.next');
  const sheet1 = document.querySelector('.sheet-1');
  const sheet2 = document.querySelector('.sheet-2');

  const showReview = (index) => {
    current = (index + reviewCards.length) % reviewCards.length;
    reviewCards.forEach((card, i) => card.classList.toggle('active', i === current));
    if (counterEl) counterEl.textContent = current + 1;

    // Subtle paper-shuffle tilt on background sheets
    const dir = current % 2 === 0 ? 1 : -1;
    if (sheet1) sheet1.style.transform = `translate(${10 * dir}px, 12px) rotate(${-1.2 * dir}deg)`;
    if (sheet2) sheet2.style.transform = `translate(${-6 * dir}px, 22px) rotate(${1.4 * dir}deg)`;
  };

  prevBtn?.addEventListener('click', () => showReview(current - 1));
  nextBtn?.addEventListener('click', () => showReview(current + 1));

  // Keyboard arrow support when focused inside the review section
  document.getElementById('reviews')?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showReview(current - 1);
    if (e.key === 'ArrowRight') showReview(current + 1);
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



