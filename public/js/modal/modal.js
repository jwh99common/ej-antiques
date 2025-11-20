import { trackEvent } from './track.js';

let currentImages = [];
let currentIndex = 0;

export function openModal(item) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const type = item.type || document.body.dataset.type || 'products';

  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalDescription');
  const counter = document.getElementById('imageCounter');

  const modalAuthor = document.getElementById('modalAuthor');
  const modalDate = document.getElementById('modalDate');
  const modalPrice = document.getElementById('modalPrice');
  const modalCategory = document.getElementById('modalCategory');

  [modalAuthor, modalDate, modalPrice, modalCategory].forEach(el => {
    if (el) el.style.display = 'none';
  });

  if (modalImage) {
    modalImage.src = item.image;
    modalImage.alt = item.title;
  }
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalContent) modalContent.textContent = item.description || '';

  if (type === 'blogs') {
    if (modalAuthor) {
      modalAuthor.textContent = `By ${item.author || 'Unknown'}`;
      modalAuthor.style.display = 'block';
    }
    if (modalDate) {
      modalDate.textContent = new Date(item.createdAt || item.date).toLocaleDateString();
      modalDate.style.display = 'block';
    }
    if (counter) counter.textContent = `1 / 1`;

    // 🔍 Track blog modal view
    
  }

  if (['products', 'services', 'merchandise'].includes(type)) {
    if (modalPrice) {
      modalPrice.textContent = `£${item.price}`;
      modalPrice.style.display = 'inline-block';
    }
    if (modalCategory) {
      modalCategory.textContent = item.category;
      modalCategory.style.display = 'inline-block';
    }

    const allImages = Array.isArray(item.images) ? item.images : [];
    const uniqueImages = allImages.filter(img => img !== item.image);
    currentImages = [item.image, ...uniqueImages];
    currentIndex = 0;

    if (modalImage) {
      modalImage.src = currentImages[currentIndex];
      modalImage.alt = item.title;
    }
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }

    // 🔍 Track product modal view
    
  }

  // 🔍 Track modal view (product or blog)
  item.type = type;
  console.log ('Tracking modal view:', item.title, type);

  trackEvent(`${type}ModalView`, {
    id: item.id || item.slug || null,
    title: item.title,
    category: item.category || null,
    type
  });

  modal.classList.add('open');
}

export function setupModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  const prevBtn = document.getElementById('prevImage');
  const nextBtn = document.getElementById('nextImage');
  const modalImage = document.getElementById('modalImage');
  const counter = document.getElementById('imageCounter');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentImages.length > 1) {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        if (modalImage) {
          modalImage.src = currentImages[currentIndex];
        }
        if (counter) {
          counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
        }
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentImages.length > 1) {
        currentIndex = (currentIndex + 1) % currentImages.length;
        if (modalImage) {
          modalImage.src = currentImages[currentIndex];
        }
        if (counter) {
          counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
        }
      }
    });
  }
}
