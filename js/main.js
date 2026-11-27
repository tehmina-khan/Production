// Hero Calendar-Flip Words (2-second cycle) STARTS HERE
const flipWords = [...document.querySelectorAll('.calendar-flip .flip-word')];
if (flipWords.length > 1) {
  let wordIndex = 0;

  setInterval(() => {
    const currentWord = flipWords[wordIndex];
    const nextIndex = (wordIndex + 1) % flipWords.length;
    const nextWord = flipWords[nextIndex];

    // Flip current word upward out
    currentWord.classList.remove('active');
    currentWord.classList.add('exit');

    // Reset next word to bottom-ready position before flipping in
    nextWord.classList.remove('exit');
    void nextWord.offsetWidth; // force reflow so upward entrance always plays cleanly
    nextWord.classList.add('active');

    // Clean up exit state after transition completes
    setTimeout(() => {
      currentWord.classList.remove('exit');
    }, 600);

    wordIndex = nextIndex;
  }, 1500);
}
// Hero Calendar-Flip Words (2-second cycle) ENDS HERE


// Hero 5-Image Slider (Horizontal Sliding Track)
const heroSlider = document.querySelector('.hero-slider');
if (heroSlider) {
  const track = heroSlider.querySelector('.hero-slides');
  const slides = [...heroSlider.querySelectorAll('.hero-slide')];
  const dots = [...heroSlider.querySelectorAll('.hero-dot')];
  const prevBtn = heroSlider.querySelector('.hero-slider-btn.prev');
  const nextBtn = heroSlider.querySelector('.hero-slider-btn.next');
  let slideIdx = 0;
  let slideTimer = null;

  const goToSlide = (index) => {
    slideIdx = (index + slides.length) % slides.length;
    if (track) {
      track.style.transform = `translateX(-${slideIdx * 100}%)`;
    }
    slides.forEach((img, i) => img.classList.toggle('active', i === slideIdx));
    dots.forEach((dot, i) => {
      const isActive = i === slideIdx;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive);
    });
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    slideTimer = setInterval(() => goToSlide(slideIdx + 1), 2500);
  };

  const stopAutoSlide = () => {
    if (slideTimer) clearInterval(slideTimer);
  };

  prevBtn?.addEventListener('click', () => {
    goToSlide(slideIdx - 1);
    startAutoSlide();
  });

  nextBtn?.addEventListener('click', () => {
    goToSlide(slideIdx + 1);
    startAutoSlide();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      startAutoSlide();
    });
  });

  // Pause on hover
  heroSlider.addEventListener('mouseenter', stopAutoSlide);
  heroSlider.addEventListener('mouseleave', startAutoSlide);

  // Touch swipe support on mobile
  let touchStartX = 0;
  heroSlider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
  }, { passive: true });

  heroSlider.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 40) {
      goToSlide(diff < 0 ? slideIdx + 1 : slideIdx - 1);
    }
    startAutoSlide();
  }, { passive: true });

  startAutoSlide();
}
// HERO SLIDER ENDS HERE

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

// Project Flip Cards (Click / Tap Support)
document.querySelectorAll('.project-flip').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

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



// Booking Page: Live Summary, URL Pre-fill & Structured WhatsApp Request
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  const serviceEl = document.getElementById('bk-service');
  const optionEl = document.getElementById('bk-option');
  const qtyEl = document.getElementById('bk-qty');
  const propertyEl = document.getElementById('bk-property');
  const nameEl = document.getElementById('bk-name');
  const phoneEl = document.getElementById('bk-phone');
  const emailEl = document.getElementById('bk-email');
  const locationEl = document.getElementById('bk-location');
  const dateEl = document.getElementById('bk-date');
  const timeEl = document.getElementById('bk-time');
  const notesEl = document.getElementById('bk-notes');
  const agreeEl = document.getElementById('bk-agree');
  const alertEl = document.getElementById('booking-alert');

  // Prevent selecting past dates
  if (dateEl) {
    const today = new Date().toISOString().split('T')[0];
    dateEl.setAttribute('min', today);
  }

  // Pre-select service if passed from another page (?service=...)
  const params = new URLSearchParams(window.location.search);
  const preselectedService = params.get('service');
  if (preselectedService && serviceEl) {
    const match = [...serviceEl.options].find(
      opt => opt.value.toLowerCase() === preselectedService.toLowerCase()
    );
    if (match) serviceEl.value = match.value;
  }

  // Live sidebar summary updates
  const syncSummary = () => {
    const sumService = document.getElementById('sum-service');
    const sumProperty = document.getElementById('sum-property');
    const sumLocation = document.getElementById('sum-location');
    const sumSchedule = document.getElementById('sum-schedule');

    if (sumService) sumService.textContent = serviceEl.value || 'Not selected yet';
    if (sumProperty) {
      const qtyText = qtyEl.value.trim() ? ` (${qtyEl.value.trim()})` : '';
      sumProperty.textContent = propertyEl.value ? `${propertyEl.value}${qtyText}` : 'Not selected yet';
    }
    if (sumLocation) sumLocation.textContent = locationEl.value.trim() || '—';
    if (sumSchedule) {
      const parts = [dateEl.value, timeEl.value].filter(Boolean);
      sumSchedule.textContent = parts.length ? parts.join(' · ') : '—';
    }
  };

  bookingForm.addEventListener('input', syncSummary);
  bookingForm.addEventListener('change', syncSummary);
  syncSummary();

  // Validate & open structured WhatsApp message
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alertEl.textContent = '';

    const requiredFields = [serviceEl, propertyEl, nameEl, phoneEl, locationEl, dateEl, timeEl];
    let firstInvalid = null;

    requiredFields.forEach(field => {
      const empty = !field.value.trim() || field.value.trim() === '+971';
      field.classList.toggle('invalid', empty);
      if (empty && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      alertEl.textContent = 'Please complete all required fields marked with * before continuing.';
      firstInvalid.focus();
      return;
    }

    if (!agreeEl.checked) {
      alertEl.textContent = 'Please tick the confirmation checkbox to prepare your WhatsApp booking request.';
      agreeEl.focus();
      return;
    }

    const lines = [
      '*NEW SERVICE BOOKING REQUEST — AISTIBAQI*',
      '',
      `*Service:* ${serviceEl.value}`,
      `*Service Option:* ${optionEl.value}`,
      qtyEl.value.trim() ? `*Quantity / Units:* ${qtyEl.value.trim()}` : null,
      `*Property Type:* ${propertyEl.value}`,
      `*Customer Name:* ${nameEl.value.trim()}`,
      `*Mobile Number:* ${phoneEl.value.trim()}`,
      emailEl.value.trim() ? `*Email:* ${emailEl.value.trim()}` : null,
      `*Dubai Location:* ${locationEl.value.trim()}`,
      `*Preferred Date:* ${dateEl.value}`,
      `*Preferred Time:* ${timeEl.value}`,
      notesEl.value.trim() ? `*Additional Notes:* ${notesEl.value.trim()}` : null
    ].filter(Boolean);

    const waUrl = `https://wa.me/971527689121?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(waUrl, '_blank', 'noopener');
  });
}


// =========================================================
// WHATSAPP HANDLERS: contact.html vs. call.html
// (Leaves book.html completely untouched)
// =========================================================
const setupSimpleWhatsAppForm = ({ formId, alertId, subject, priorityNote }) => {
  const form = document.getElementById(formId);
  if (!form) return;

  const alertEl = document.getElementById(alertId);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (alertEl) alertEl.textContent = '';

    // Validate required fields
    const requiredFields = [...form.querySelectorAll('[required]')];
    let firstInvalid = null;

    requiredFields.forEach((field) => {
      const isEmpty = !field.value.trim() || field.value.trim() === '+971';
      field.classList.toggle('invalid', isEmpty);
      if (isEmpty && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      if (alertEl) {
        alertEl.textContent = 'Please fill in all required fields before continuing.';
      }
      firstInvalid.focus();
      return;
    }

    // Collect filled fields dynamically from the form
    const lines = [
      `*${subject}*`,
      `_${priorityNote}_`,
      '────────────────────',
      ''
    ];

    const controls = [...form.querySelectorAll('input, select, textarea')];
    controls.forEach((el) => {
      if (el.type === 'submit' || el.type === 'button' || el.type === 'hidden') return;
      const val = el.value.trim();
      if (!val || val === '+971') return;

      // Derive a clean label from <label>, name, or placeholder
      const labelEl = el.id ? form.querySelector(`label[for="${el.id}"]`) : null;
      const rawLabel =
        (labelEl && labelEl.textContent.replace('*', '').trim()) ||
        el.getAttribute('name') ||
        el.getAttribute('placeholder') ||
        'Details';

      const formattedLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      lines.push(`*${formattedLabel}:* ${val}`);
    });

    const waUrl = `https://wa.me/971527689121?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(waUrl, '_blank', 'noopener');
  });
};

// 1. contact.html -> General Contact Inquiry
setupSimpleWhatsAppForm({
  formId: 'contact-form',
  alertId: 'contact-alert',
  subject: '📩 GENERAL CONTACT INQUIRY — AISTIBAQI',
  priorityNote: 'Submitted via Contact Page'
});

// 2. call.html -> High-Priority Call Request
setupSimpleWhatsAppForm({
  formId: 'call-form',
  alertId: 'call-alert',
  subject: '📞 PRIORITY CALL REQUEST — AISTIBAQI',
  priorityNote: 'High-Priority Request via Book a Call Page'
});