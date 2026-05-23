-- Coffer Phase 2 — multi-source ingest + categorization
-- Adds the unified transaction ledger and the rule-learning store.
-- Spec: workspace/handoffs/coffer-phase-2-multisource-ingest.md

-- ---------------------------------------------------------------------------
-- coffer_transactions
-- One row per money movement across every source (Stripe, Plaid bank, Plaid
-- card, manual, future Bill.com). Append-mostly per the Decision Authority
-- Matrix; categorization may be re-classified via Andrew review.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coffer_transactions (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  source           TEXT         NOT NULL CHECK (source IN ('stripe','billcom','bank','card','manual')),
  source_id        TEXT         NOT NULL,
  amount_cents     BIGINT       NOT NULL,
  currency         TEXT         NOT NULL DEFAULT 'usd',
  occurred_at      TIMESTAMPTZ  NOT NULL,
  description      TEXT,
  counterparty     TEXT,
  category         TEXT,
  confidence       TEXT         CHECK (confidence IN ('rule','heuristic','claude_high','claude_low','manual')),
  client_id        UUID,
  reconciled_with  UUID[],
  receipt_url      TEXT,
  raw_data         JSONB,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS coffer_transactions_occurred_at_idx
  ON coffer_transactions (occurred_at DESC);
CREATE INDEX IF NOT EXISTS coffer_transactions_source_idx
  ON coffer_transactions (source);
CREATE INDEX IF NOT EXISTS coffer_transactions_category_idx
  ON coffer_transactions (category);
CREATE INDEX IF NOT EXISTS coffer_transactions_client_id_idx
  ON coffer_transactions (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS coffer_transactions_pending_review_idx
  ON coffer_transactions (occurred_at DESC) WHERE category = 'pending_review';

-- Keep updated_at fresh on any UPDATE (Postgres doesn't do this for us).
CREATE OR REPLACE FUNCTION coffer_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coffer_transactions_set_updated_at ON coffer_transactions;
CREATE TRIGGER coffer_transactions_set_updated_at
  BEFORE UPDATE ON coffer_transactions
  FOR EACH ROW EXECUTE FUNCTION coffer_set_updated_at();

-- ---------------------------------------------------------------------------
-- coffer_categorization_rules
-- Learned categorization rules. Created exclusively from Andrew approvals in
-- the review queue (never auto-generated — see Decision Authority Matrix).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coffer_categorization_rules (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  match_field  TEXT         NOT NULL CHECK (match_field IN ('counterparty','description','amount_range')),
  match_value  TEXT         NOT NULL,
  category     TEXT         NOT NULL,
  client_id    UUID,
  created_by   TEXT         NOT NULL DEFAULT 'andrew',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coffer_categorization_rules_lookup_idx
  ON coffer_categorization_rules (match_field, match_value);
CREATE INDEX IF NOT EXISTS coffer_categorization_rules_client_id_idx
  ON coffer_categorization_rules (client_id) WHERE client_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Row Level Security: service-role-only by design.
-- Both tables hold live financial data (amounts, counterparties, receipt URLs,
-- raw ingest payloads). RLS is enabled with NO policies, which denies all
-- access via the anon key. The Coffer worker (coffer.js) and Mission Control
-- server-side queries both use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Diverges from the permissive "USING (true)" pattern used by less-sensitive
-- Foundry tables (agent_logs, monthly_report_runs) — intentional for finance.
-- ---------------------------------------------------------------------------
ALTER TABLE coffer_transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffer_categorization_rules ENABLE ROW LEVEL SECURITY;
