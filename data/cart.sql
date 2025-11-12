drop table bens_bikes_orders;

CREATE TABLE bens_bikes_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart JSON NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
