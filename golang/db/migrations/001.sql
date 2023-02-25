CREATE TABLE Entries (
  id SERIAL PRIMARY KEY,
  text TEXT,
  entry_type TEXT DEFAULT 'task',
  completed BOOLEAN DEFAULT FALSE,
  priority BOOLEAN DEFAULT FALSE,
  created_timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now())),
  modified_timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now()))
);

CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  verification_code INT DEFAULT (floor(random() * 1000000)::integer),
  verified BOOLEAN DEFAULT FALSE,
  passwordReset BOOLEAN DEFAULT FALSE,
  created_timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now())),
  modified_timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now()))
);

CREATE TABLE Sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(id),
  session_token TEXT NOT NULL DEFAULT substr(md5(random()::text), 0, 32),
  expires_at BIGINT DEFAULT (extract(epoch from now()) + 604800),
  created_timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now())),
  modified_timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now()))
);
