-- migrations/001-init.sql
-- Initial schema for the ecommerce-api fixture. Demonstrates:
--   - node-postgresql-persistence: critical invariants as DB constraints (UNIQUE, CHECK, FK)
--   - node-transactional-outbox: an outbox table for reliable event publication
--   - node-idempotency: a unique constraint on (idempotency_key, scope)
--
-- This migration is expand-only. Apply against a fresh database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  total_cents     INTEGER NOT NULL CHECK (total_cents >= 0),
  currency        TEXT NOT NULL DEFAULT 'USD' CHECK (char_length(currency) = 3),
  idempotency_key TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (idempotency_key, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders(created_at DESC);

-- Transactional outbox: writes to the same DB transaction as the order.
-- A relay worker (src/jobs/outbox-relay.js) reads, publishes to BullMQ,
-- marks published. Survives process crash between commit and publish.
CREATE TABLE IF NOT EXISTS outbox (
  id            BIGSERIAL PRIMARY KEY,
  aggregate     TEXT NOT NULL,
  aggregate_id  TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  payload       JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_unpublished
  ON outbox(created_at)
  WHERE published_at IS NULL;
