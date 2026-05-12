-- Monthly report graduation tracking
-- One row per (client, month). Tracks consecutive clean months toward auto-send.
CREATE TABLE IF NOT EXISTS monthly_report_runs (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                TEXT        NOT NULL,
  client_name              TEXT        NOT NULL,
  month                    TEXT        NOT NULL,  -- YYYY-MM
  status                   TEXT        NOT NULL DEFAULT 'pending',
  -- 'pending' | 'approved' | 'edited' | 'skipped' | 'sent' | 'failed'
  consecutive_clean_months INTEGER     NOT NULL DEFAULT 0,
  auto_send                BOOLEAN     NOT NULL DEFAULT false,
  pdf_drive_url            TEXT,
  discord_message_id       TEXT,
  draft_email              TEXT,
  error_message            TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS monthly_report_runs_client_month
  ON monthly_report_runs (client_id, month);

CREATE INDEX IF NOT EXISTS monthly_report_runs_client_id
  ON monthly_report_runs (client_id);

ALTER TABLE monthly_report_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON monthly_report_runs FOR SELECT USING (true);
CREATE POLICY "Service insert"     ON monthly_report_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update"     ON monthly_report_runs FOR UPDATE USING (true);
