-- reading_type Spalte zu live_reading_sessions hinzufügen
ALTER TABLE public.live_reading_sessions
  ADD COLUMN IF NOT EXISTS reading_type TEXT;
