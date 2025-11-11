
CREATE TABLE ej_antiques_products (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  price INTEGER,
  category TEXT,
  image TEXT,
  images TEXT,
  longDescription TEXT
, status TEXT DEFAULT 'active');

CREATE TABLE ej_antiques_merchandise (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,         
  description TEXT,
  long_description TEXT, 
  image TEXT,         
  price INTEGER,         
  category TEXT       
, status TEXT DEFAULT 'active');

CREATE TABLE ej_antiques_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,         
  description TEXT,
  long_description TEXT, 
  image TEXT,         
  price INTEGER,         
  category TEXT       
, status TEXT DEFAULT 'active');

CREATE TABLE ej_antiques_gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,         
  description TEXT,
  long_description TEXT, 
  image TEXT,         
  price INTEGER,         
  category TEXT       
, status TEXT DEFAULT 'active');

CREATE TABLE ej_antiques_blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  author TEXT,
  image TEXT, -- URL or path to image
  content TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
, shortcontent TEXT, longcontent TEXT, status TEXT DEFAULT 'active');

CREATE TABLE ej_antiques_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart JSON NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
