DROP TABLE IF EXISTS ej_antiques_analytics;

CREATE TABLE  ej_antiques_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip TEXT,
  country TEXT,
  city TEXT,
  event_type TEXT DEFAULT 'pageview',
  metadata TEXT
);


