DROP TABLE IF EXISTS bens_bikes_services;

CREATE TABLE bens_bikes_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,         -- service title
  description TEXT,
  long_description TEXT, 
  image TEXT,         -- R2 asset key or URL
  price INTEGER,         -- Optional: "£25", "Free consultation", etc.
  category TEXT       -- Optional: "Repair", "Custom Build", etc.
);
