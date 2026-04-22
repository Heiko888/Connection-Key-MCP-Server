-- profiles.active_gates: aktive HD-Gates des Users für Dating-Matching
-- Electromagnetic-Channel-Erkennung zwischen 2 Profilen
-- (Kanal = beide Gates eines Kanals sind aktiv, je einer bei jeder Person)

alter table public.profiles
  add column if not exists active_gates int[];

comment on column public.profiles.active_gates is
  'Aktive Human-Design-Tore (1-64). Für Dating: Gegentor-Matching + Channel-Bildung. Backfill aus readings.reading_data.chart_data.gates.';

create index if not exists idx_profiles_active_gates
  on public.profiles using gin (active_gates);
