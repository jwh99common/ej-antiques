DROP TABLE IF EXISTS ej_antiques_blogs;

CREATE TABLE ej_antiques_blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  author TEXT,
  image TEXT, -- URL or path to image
  content TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
