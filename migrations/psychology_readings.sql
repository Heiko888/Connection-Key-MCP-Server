CREATE TABLE IF NOT EXISTS psychology_readings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id            UUID REFERENCES readings(id) ON DELETE CASCADE,
  connection_reading_id UUID REFERENCES connection_readings(id) ON DELETE CASCADE,
  mode                  TEXT NOT NULL CHECK (mode IN ('single', 'connection')),
  person_a_id           UUID,
  person_b_id           UUID,
  polyvagal             JSONB,
  attachment            JSONB,
  jungian               JSONB,
  bigfive               JSONB,
  synthesis             TEXT,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','completed','failed')),
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_psychology_readings_reading_id
  ON psychology_readings(reading_id);
CREATE INDEX IF NOT EXISTS idx_psychology_readings_connection_reading_id
  ON psychology_readings(connection_reading_id);
CREATE INDEX IF NOT EXISTS idx_psychology_readings_status
  ON psychology_readings(status);
