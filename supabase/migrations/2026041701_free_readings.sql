-- free_readings: kostenlose Basis-Readings via Double-Opt-In-Email
-- Teil des Free-Reading-Flows für /persoenlichkeitsanalyse/sofort,
-- /resonanzanalyse/sofort, /pentaanalyse/sofort

create table if not exists public.free_readings (
  id uuid primary key default gen_random_uuid(),

  -- User-Eingabe
  email text not null,
  analysis_type text not null check (analysis_type in ('personality','resonance','penta')),
  person_data jsonb not null,
  chart_data jsonb,

  -- Double-Opt-In
  confirmation_token text not null unique,
  confirmation_sent_at timestamptz not null default now(),
  confirmed_at timestamptz,

  -- Reading-Generation (verknüpft mit public.readings)
  reading_id uuid references public.readings(id) on delete set null,
  reading_sent_at timestamptz,

  -- Status-Maschine
  status text not null default 'pending_confirmation'
    check (status in (
      'pending_confirmation',
      'confirmed',
      'reading_generating',
      'reading_sent',
      'expired',
      'failed'
    )),

  -- Spam-Protection / Tracking
  ip_address inet,
  user_agent text,

  -- Newsletter-Opt-In (separat vom Reading-Confirm)
  newsletter_optin boolean not null default false,

  -- Zeitangaben
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours')
);

-- Indices für typische Zugriffsmuster
create index if not exists idx_free_readings_email
  on public.free_readings(email);

create index if not exists idx_free_readings_token
  on public.free_readings(confirmation_token);

create index if not exists idx_free_readings_status
  on public.free_readings(status);

create index if not exists idx_free_readings_created
  on public.free_readings(created_at desc);

create index if not exists idx_free_readings_status_confirmed
  on public.free_readings(status, confirmed_at)
  where status = 'reading_generating';

-- RLS: nur Service-Role, kein Client-Zugriff (alle Operationen via Backend-API)
alter table public.free_readings enable row level security;

drop policy if exists "free_readings_service_role_all" on public.free_readings;

create policy "free_readings_service_role_all"
  on public.free_readings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.free_readings is
  'Kostenlose Basis-Readings: Email-Erfassung mit Double-Opt-In, Verknüpfung mit public.readings. Nur Service-Role-Zugriff.';

comment on column public.free_readings.analysis_type is
  'personality (1 Person) | resonance (2 Personen) | penta (3-5 Personen)';

comment on column public.free_readings.status is
  'pending_confirmation → confirmed → reading_generating → reading_sent | expired | failed';
