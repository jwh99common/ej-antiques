
const body = document.querySelector('body');
const type = body?.dataset.type;

const filename = `${type}.txt`;
const allowed = ['home', 'products', 'gallery', 'blogs', 'about'];

if (!allowed.includes(type)) {
  console.warn(`Blocked: ${filename} not whitelisted`);
} else {
  fetch(`/content/${filename}`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      return res.text();
    })
    .then(text => {
      const container = document.getElementById('txt-placeholder');
      if (!container) throw new Error(`Missing #txt-placeholder`);
      container.innerHTML = text;
    })
    .catch(err => console.error('injectTxt error:', err));
}
