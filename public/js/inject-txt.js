const body = document.querySelector('body');
const type = body?.dataset.type;
const allowed = ['home', 'products', 'tcs', 'privacy', 'soldproducts', 'checkout', 'gallery', 'checkouot', 'blogs', 'about', 'services', 'contact'];
const container = document.getElementById('txt-placeholder');


if (!type || !allowed.includes(type)) {
  console.warn(`Blocked or missing type: ${type}`);
  if (container) {
    container.innerHTML = `<div class="fallback-message">This section is currently unavailable.</div>`;
  }
} else {
  const filename = `${type}.txt`;

  fetch(`/ej-antiques/content/${filename}`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      return res.text();
    })
    .then(text => {
      if (!text.trim()) {
        container.innerHTML = `<div class="fallback-message">This section is currently empty. Please check back soon.</div>`;
      } else {
        container.innerHTML = text;
      }
    })
    .catch(err => {
      console.error('injectTxt error:', err);
      if (container) {
        container.innerHTML = `<div class="fallback-message">Sorry, we couldn't load this content right now.</div>`;
      }
    });
}
