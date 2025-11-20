export function trackEvent(eventType = 'pageview', metadata = {}) {
  const sessionId = sessionStorage.getItem('ej-session') || crypto.randomUUID();
  sessionStorage.setItem('ej-session', sessionId);

 // console.log ('Tracking event:', eventType, metadata);
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
  });
}
