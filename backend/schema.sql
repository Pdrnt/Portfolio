-- Execute este script uma vez para criar o banco e a tabela
-- psql -U postgres -f schema.sql

CREATE DATABASE etipi_portfolio;

\c etipi_portfolio

CREATE TABLE IF NOT EXISTS proposals (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(200) NOT NULL,
  orgao       VARCHAR(200) NOT NULL,
  email       VARCHAR(200) NOT NULL,
  telefone    VARCHAR(50),
  vertical    VARCHAR(100),
  mensagem    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
