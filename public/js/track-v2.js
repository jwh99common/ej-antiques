// track-v2.js - Enhanced tracking with user behavior: bounce, session duration, form submissions, CTAs

function trackEvent(eventType = 'pageview', metadata = {}) {
  const sessionId = sessionStorage.getItem('ej-session') || crypto.randomUUID();
  sessionStorage.setItem('ej-session', sessionId);

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      url: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      eventType,
      metadata
    })
  }).catch(err => console.error('Track error:', err));
}

// === PAGEVIEW & SESSION ===
const sessionStartTime = Date.now();
const isNewVisitor = !localStorage.getItem('ej-visitor-flag');
if (isNewVisitor) {
  localStorage.setItem('ej-visitor-flag', Date.now());
}

trackEvent('pageview', { 
  isNewVisitor,
  sessionStart: sessionStartTime
});

// Track bounce: if user leaves without interacting within 30s, it's a bounce
let hasInteracted = false;

const interactionEvents = ['click', 'scroll', 'keydown'];
interactionEvents.forEach(event => {
  document.addEventListener(event, () => { hasInteracted = true; }, { once: true });
});

window.addEventListener('beforeunload', () => {
  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
  const isBounce = !hasInteracted && sessionDuration < 30;
  
  trackEvent('session_end', { 
    sessionDuration,
    isBounce,
    url: window.location.pathname,
    interactionCount: document.querySelectorAll('*[data-clicked]').length
  });
});

// Track time-on-page before leaving
let pageStartTime = Date.now();

window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
  if (timeOnPage > 1) {
    trackEvent('time_on_page', { seconds: timeOnPage, url: window.location.pathname });
  }
});

// === PRODUCT INTERACTION ===
document.addEventListener('click', (e) => {
  const productCard = e.target.closest('.product-card');
  if (productCard) {
    const slug = productCard.dataset.slug;
    const productTitle = productCard.dataset.title || slug || 'Unknown';
    trackEvent('product_view', { slug, productTitle });
    hasInteracted = true;
  }
});

// Track add-to-cart
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const productCard = e.target.closest('.product-card') || e.target;
    const slug = productCard.dataset.slug || 'unknown';
    const productTitle = e.target.dataset.title || 'Unknown';
    const price = e.target.dataset.price || 0;
    trackEvent('add_to_cart', { slug, productTitle, price });
    hasInteracted = true;
  }
});

// === CTA TRACKING ===
// Track any button or link with data-cta attribute
document.addEventListener('click', (e) => {
  const ctaElement = e.target.closest('[data-cta]');
  if (ctaElement) {
    const ctaName = ctaElement.dataset.cta;
    const ctaText = ctaElement.textContent?.trim() || ctaName;
    trackEvent('cta_click', { ctaName, ctaText, url: window.location.pathname });
    hasInteracted = true;
  }
});

// === FORM TRACKING ===
document.addEventListener('submit', (e) => {
  const form = e.target;
  const formName = form.dataset.formName || form.id || 'unknown-form';
  const formFields = Array.from(form.querySelectorAll('[name]')).map(f => f.name);
  
  trackEvent('form_submit', { 
    formName, 
    formFields: formFields.join(','),
    url: window.location.pathname,
    timestamp: new Date().toISOString()
  });
  hasInteracted = true;
});

// === SCROLL TRACKING ===
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  
  if (scrollPercent > maxScrollDepth) {
    maxScrollDepth = scrollPercent;
  }
  
  if (scrollPercent >= 50) { hasInteracted = true; }
});

// Track scroll depth on exit
window.addEventListener('beforeunload', () => {
  if (maxScrollDepth > 0) {
    trackEvent('scroll_depth', { maxDepth: maxScrollDepth, url: window.location.pathname });
  }
});

export { trackEvent };

