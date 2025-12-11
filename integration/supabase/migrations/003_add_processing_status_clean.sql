-- Migration: Add Processing Status and History
-- Created: 2025-12-13
-- Description: Erweitert das Readings-Schema um detaillierten Status und eine Status-History-Tabelle

-- Status erweitern
ALTER TABLE readings DROP CONSTRAINT IF EXISTS readings_status_check;

ALTER TABLE readings ADD CONSTRAINT readings_status_check 
  CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  ));

-- Status-History Tabelle
CREATE TABLE IF NOT EXISTS reading_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_id UUID REFERENCES readings(id) ON DELETE CASCADE NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by VARCHAR(100),
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_reading_status_history_reading_id 
  ON reading_status_history(reading_id);
CREATE INDEX IF NOT EXISTS idx_reading_status_history_changed_at 
  ON reading_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_status_history_reading_changed 
  ON reading_status_history(reading_id, changed_at DESC);

-- Function: Status automatisch tracken
CREATE OR REPLACE FUNCTION track_reading_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO reading_status_history (
      reading_id,
      old_status,
      new_status,
      changed_by,
      changed_at
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(
        current_setting('app.user_id', true),
        'system'
      ),
      timezone('utc', now())
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatisches Status-Tracking
DROP TRIGGER IF EXISTS track_reading_status_change_trigger ON readings;

CREATE TRIGGER track_reading_status_change_trigger
  AFTER UPDATE OF status ON readings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_reading_status_change();

-- Function: Get Reading Status
CREATE OR REPLACE FUNCTION get_reading_status(p_reading_id UUID)
RETURNS TABLE (
  reading_id UUID,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  status_history JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.status,
    r.created_at,
    r.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'old_status', rsh.old_status,
            'new_status', rsh.new_status,
            'changed_by', rsh.changed_by,
            'changed_at', rsh.changed_at,
            'reason', rsh.reason
          )
          ORDER BY rsh.changed_at DESC
        )
        FROM reading_status_history rsh
        WHERE rsh.reading_id = r.id
      ),
      '[]'::jsonb
    ) AS status_history
  FROM readings r
  WHERE r.id = p_reading_id;
END;
$$ LANGUAGE plpgsql;

