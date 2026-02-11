CREATE TABLE IF NOT EXISTS accounts (
  id            SERIAL PRIMARY KEY,
  member_id     VARCHAR(64) NOT NULL UNIQUE,
  domain        VARCHAR(255) NOT NULL,
  plan          VARCHAR(20) NOT NULL DEFAULT 'free',
  installed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_logs (
  id              BIGSERIAL PRIMARY KEY,
  account_id      INTEGER NOT NULL REFERENCES accounts(id),
  url             TEXT NOT NULL,
  method          VARCHAR(10) NOT NULL,
  status_code     INTEGER,
  success         BOOLEAN NOT NULL DEFAULT false,
  execution_time  INTEGER,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_account_month
  ON request_logs(account_id, created_at);
