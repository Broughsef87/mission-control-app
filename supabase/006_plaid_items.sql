-- Coffer Phase 2 — Plaid item storage
-- One row per Plaid Item (a bank login). Holds the access_token used by the
-- daily puller to call /transactions/sync. Single-tenant: Forge currently has
-- one Item (Chase business — checking + cards on the same login).

CREATE TABLE IF NOT EXISTS plaid_items (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id           TEXT         NOT NULL UNIQUE,
  access_token      TEXT         NOT NULL,
  institution_id    TEXT,
  institution_name  TEXT,
  accounts          JSONB,
  cursor            TEXT,
  status            TEXT         NOT NULL DEFAULT 'active' CHECK (status IN ('active','login_required','pending_expiration','revoked')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_sync_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS plaid_items_status_idx ON plaid_items (status);

DROP TRIGGER IF EXISTS plaid_items_set_updated_at ON plaid_items;
CREATE TRIGGER plaid_items_set_updated_at
  BEFORE UPDATE ON plaid_items
  FOR EACH ROW EXECUTE FUNCTION coffer_set_updated_at();

-- Service-role-only by design. access_token is a long-lived bank credential.
-- Same RLS posture as coffer_transactions: anon key gets nothing; the cron
-- worker and Mission Control server-side queries use SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS.
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
