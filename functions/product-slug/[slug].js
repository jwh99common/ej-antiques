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
  const formattedPrice = product.price;
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
  <link rel="stylesheet" href="/css/hf.css">
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
      transition: transform 0.3s ease;
    }
    .image-box:hover .main-image {
      transform: scale(2.0);
      cursor: zoom-in;
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
    .lightbox {
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }
    .product-header {
      margin-bottom: 2rem;
    }
    .product-header h1 {
      margin-bottom: 0.25rem;
    }
.product-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.product-title-line h1 {
  margin: 0;
  font-size: 2rem;
}

.product-title-line .product-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.product-title-line .product-category {
  font-style: italic;
  color: #666;
}

.sold-label {
  color: #c00;
  font-weight: bold;
  font-size: 1rem;
}

.product-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.product-title-line h1 {
  margin: 0;
  font-size: 2rem;
}

.product-title-line h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
}

.product-price {
  color: #333;
}

.sold-label {
  color: #c00;
  font-size: 2rem;

}

.product-category {
  font-style: italic;
  color: #666;
}


  </style>
  <link rel="stylesheet" href="/css/mobile.css">

</head>

<body data-type="product">
  <header>
    <div class="container">
      <div id="nav-placeholder"></div>
    </div>
  </header>

  <div class="gallery" id="gallery">
    <!-- Products will be inserted here by JavaScript -->
  </div>
  
  <main class="container product-page">
    <div class="product-header">
      <!--
      <div class="product-title-line">
        <h1>${product.title}</h1>
        <h1>£${formattedPrice}</h1>
        ${product.is_sold ? '<h1 class="sold-label">Sold</h1>' : ''}
        <span class="product-category">${product.category}</span>
      </div>
      -->
    </div>

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
      ${product.is_sold ? '<h1 class="sold-label">Sold</h1>' : ''}
      <p class="product-price">£${formattedPrice}</p>
      <p class="product-category">${product.category}</p>

      <div class="lightbox">
        <p class="product-description">${product.description}</p>
      </div>

      <div class="lightbox">
        <p class="product-description">${product.background}</p>
      </div>

      <div class="lightbox product-long-description">
        ${product.longDescription || ''}
      </div>

      <button class="add-to-cart"
        data-id="${product.id}"
        data-title="${product.title}"
        data-price="${formattedPrice}"
        data-image="${product.image}"
        data-type="product"
      >
        I'm Interested
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
    <button id="checkoutBtn">Get In Touch</button>
  </div>

  <div id="footer-placeholder"></div>


  <script type="module">
 
    document.addEventListener('DOMContentLoaded', () => {
 
      const mainImage = document.querySelector('.main-image');
      const thumbnails = document.querySelectorAll('.thumb-image');

      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
          if (mainImage && thumb.src) {
            mainImage.src = thumb.src;
            mainImage.alt = thumb.alt;
          }
        });
      });
    });
  </script>
  <script type="module" src="/js/main.js"></script>
  <script type="module" src="/js/inject-nav.js"></script>
  <script src="/js/inject-footer.js"></script>
  <script type="module" src="/js/track-analytics.js"></script>
<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/69458465aa24931987c8198a/1jcroqbsg';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->
  </body>
</html>
`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
