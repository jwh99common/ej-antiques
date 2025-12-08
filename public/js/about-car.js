document.addEventListener('DOMContentLoaded', async () => {
  const track = document.querySelector('.fade-track');
  if (!track) return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    // Clear any static content
    track.innerHTML = '';

    const imageUrls = products
      .map(p => p.image?.trim())
      .filter(url => url && url.length > 0);

    imageUrls.forEach((url, index) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Product image ${index + 1}`;
      img.className = 'fade-slide' + (index === 0 ? ' active' : '');
      track.appendChild(img);
    });

    // ✅ Now that images are in the DOM, start the carousel
    const slides = document.querySelectorAll('.fade-slide');
    let current = 0;

    function showNextSlide() {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }

    if (slides.length > 1) {
      setInterval(showNextSlide, 4000); // every 4 seconds
    }

  } catch (err) {
    console.error('Failed to load carousel images:', err);
  }
});
