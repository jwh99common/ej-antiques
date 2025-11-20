async function injectFooter() {
  const res = await fetch('/partials/ej-footer.html');
  const html = await res.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
}

document.addEventListener('DOMContentLoaded', injectFooter);
