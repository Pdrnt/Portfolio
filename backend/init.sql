CREATE TABLE IF NOT EXISTS proposals (
  id         SERIAL PRIMARY KEY,
  nome       TEXT        NOT NULL,
  orgao      TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  telefone   TEXT,
  vertical   TEXT,
  mensagem   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
