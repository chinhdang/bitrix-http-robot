CREATE TABLE IF NOT EXISTS oauth_tokens (
  id              SERIAL PRIMARY KEY,
  member_id       VARCHAR(64) NOT NULL UNIQUE,
  domain          VARCHAR(255),
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  expires_at      TIMESTAMPTZ,
  client_endpoint TEXT,
  server_endpoint TEXT,
  scope           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
