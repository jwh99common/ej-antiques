export async function onRequest(context) {
  const slug = context.params.slug;
  const db = context.env.gallery_db;

  console.log("Product Slug:", slug);

  const { results } = await db
    .prepare("SELECT * FROM ej_antiques_products WHERE slug = ?")
    .bind(slug)
    .all();

  if (!results.length) {
    return new Response("Product not found", { status: 404 });
  }

  const product = results[0];
  const formattedPrice = (product.price / 100).toFixed(2);
  const images = product.images ? JSON.parse(product.images) : [];

  if (!images.includes(product.image)) {
    images.unshift(product.image);
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${product.title} – EJ's Antiques</title>

      <link rel="stylesheet" href="/css/base.css">
      <link rel="stylesheet" href="/css/products.css">
      <link rel="stylesheet" href="/css/cart.css">
      <link rel="stylesheet" href="/css/navigation.css">
      <link rel="stylesheet" href="/products/local.css">
      <style>
        .three-column-layout {
          display: grid;
          grid-template-columns: 100px 1fr 1.5fr;
          gap: 2rem;
          align-items: start;
        }
        .column {
          display: flex;
          flex-direction: column;
        }
        .column-thumbs {
          max-height: 600px;
          overflow-y: auto;
          gap: 1rem;
        }
        .image-box {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid #ddd;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .thumb-image,
        .main-image {
          border-radius: 8px;
          width: 100%;
          object-fit: cover;
        }
        .thumb-image {
          aspect-ratio: 1 / 1;
          cursor: pointer;
        }
        .column-main-image {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 600px;
        }
        .main-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .column-details h1 {
          margin-top: 0;
        }
        .product-price {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .product-category {
          font-style: italic;
          color: #666;
          margin-bottom: 1rem;
        }
        .product-description,
        .product-long-description {
          margin-bottom: 1rem;
        }
        .add-to-cart {
          padding: 0.75rem 1.5rem;
          background-color: #222;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }
        .add-to-cart:hover {
          background-color: #444;
        }
      </style>
    </head>

    <body data-type="product">
      <header>
        <div class="container">
          <div id="nav-placeholder"></div>
        </div>
      </header>

      <main class="container product-page three-column-layout">
        <!-- Column 1: Thumbnails -->
        <div class="column column-thumbs">
          ${images
            .map(
              (img, i) => `
              <div class="image-box">
                <img src="${img}" alt="${product.title} thumbnail ${i + 1}" class="thumb-image" />
              </div>`
            )
            .join('')}
        </div>

        <!-- Column 2: Main Image -->
        <div class="column column-main-image">
          <div class="image-box">
            <img src="${product.image}" alt="${product.title}" class="main-image" />
          </div>
        </div>

        <!-- Column 3: Details -->
        <div class="column column-details">
          <h1>${product.title}</h1>
          <p class="product-price">£${formattedPrice}</p>
          <p class="product-category">${product.category}</p>
          <p class="product-description">${product.description}</p>
          <div class="product-long-description">${product.longDescription || ''}</div>

          <button class="add-to-cart"
            data-id="${product.id}"
            data-title="${product.title}"
            data-price="${formattedPrice}"
            data-image="${product.image}"
            data-type="product"
          >
            Add to Cart
          </button>

          <p class="back-link">
            <a href="/products">← Back to all products</a>
          </p>
        </div>
      </main>

      <div id="cartPanel" class="cart-panel hidden">
        <div class="cart-header">
          <h3>Your Cart</h3>
          <button id="closeCartBtn" class="close-cart">&times;</button>
        </div>
        <ul id="cartItems"></ul>
        <button id="checkoutBtn">Checkout</button>
      </div>

      <footer>
        <div id="footer-placeholder"></div>
      </footer>

      <script type="module" src="/js/main.js?v=20251030"></script>
      <script type="module" src="/js/inject-nav.js"></script>
      <script src="/js/inject-footer.js"></script>
      <script type="module" src="/js/track-analytics.js"></script>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const mainImage = document.querySelector('.main-image');
          document.querySelectorAll('.thumb-image').forEach(img => {
            img.addEventListener('click', () => {
              mainImage.src = img.src;
            });
          });
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
