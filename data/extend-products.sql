DROP TABLE IF EXISTS ej_antiques_products_old;
ALTER TABLE ej_antiques_products RENAME TO ej_antiques_products_old;
CREATE TABLE ej_antiques_products (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  price INTEGER,
  category TEXT,
  image TEXT,
  images TEXT,
  longDescription TEXT,
  status TEXT DEFAULT 'active',
  slug TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  is_sold BOOLEAN DEFAULT FALSE,
  sold_at DATETIME,
  quantity INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO ej_antiques_products (
  id, title, description, price, category, image, images, longDescription, status
)
SELECT
  id, title, description, price, category, image, images, longDescription, status
FROM ej_antiques_products_old;
DROP TABLE ej_antiques_products_old;
UPDATE ej_antiques_products
SET title = TRIM(title)
WHERE title != TRIM(title);
UPDATE ej_antiques_products
SET slug = TRIM(
  RTRIM(
    LOWER(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(title, '&', 'and'),
          '/', '-'),
        ' ', '-'),
      '''', '')
    ),
  '-')
)
WHERE slug IS NULL OR slug = '' OR slug LIKE '%-';
CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_unique ON ej_antiques_products(slug);
