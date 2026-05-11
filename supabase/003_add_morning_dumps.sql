-- Morning voice brain-dump transcriptions stored by Whisper
CREATE TABLE IF NOT EXISTS morning_dumps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription TEXT      NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
