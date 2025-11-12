export async function onRequest(context) {
  const slug = context.params.slug;
  const db = context.env.gallery_db;

  console.log ("Slug:", slug);
  
  const { results } = await db
    .prepare("SELECT * FROM ej_antiques_blogs WHERE slug = ?")
    .bind(slug)
    .all();

  if (!results.length) {
    return new Response("Blog not found", { status: 404 });
  }

  const blog = results[0];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${blog.title} – EJ's Antiques</title>

      <!-- Stylesheets -->
      <link rel="stylesheet" href="/css/base.css">
      <link rel="stylesheet" href="/css/products.css">
      <link rel="stylesheet" href="/css/cart.css">
      <link rel="stylesheet" href="/css/blog.css">
      <link rel="stylesheet" href="/blogs-page/local.css">
    </head>

    <body data-type="blog">
      <header>
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <img src="/ej-antiques/ej-logo.jpg" alt="EJ's Antiques logo" class="logo-image" />
              <span class="logo-text">EJ's Antiques: Blog</span>
            </div>
            <button id="cartToggleBtn" class="cart-toggle-btn">🛒 Cart (<span id="cartCount">0</span>)</button>
            <div id="nav-placeholder"></div>
          </div>
        </div>
      </header>

      <main class="container blog-page">
        <h1>${blog.title}</h1>
        <p class="blog-card-date">${new Date(blog.createdAt).toLocaleDateString()}</p>
        <p class="modal-author">${blog.author || ''}</p>
        <img src="${blog.image}" alt="${blog.title}" class="modal-thumb" />
        <div class="modal-content-text">${blog.longcontent || blog.content || ''}</div>

        <p class="back-link">
          <a href="/blogs-page">← Back to all blog posts</a>
        </p>
      </main>

      <!-- Cart Panel -->
      <div id="cartPanel" class="cart-panel hidden">
        <h3>Your Cart</h3>
        <ul id="cartItems"></ul>
        <button id="checkoutBtn">Checkout</button>
      </div>

      <footer>
        <div id="footer-placeholder"></div>
      </footer>

      <!-- Scripts -->
      
      <script type="module" src="/js/main.js?v=20251030"></script>

      <script src="/js/inject-nav.js"></script>
      <script src="/js/inject-footer.js"></script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
