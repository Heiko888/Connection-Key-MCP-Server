-- RLS Smoke Tests für Dynamic Blueprint
-- Ausführen mit Service-Role-Key (umgeht RLS) und dann mit simuliertem User

-- 1) Zähle Gesamtdaten (Service-Role, umgeht RLS)
SELECT 'total_clients' as test, count(*)::text as result FROM public.client_profiles
UNION ALL
SELECT 'total_sections', count(*)::text FROM public.reading_sections
UNION ALL
SELECT 'released_sections', count(*)::text FROM public.reading_sections WHERE is_released = true
UNION ALL
SELECT 'unreleased_sections', count(*)::text FROM public.reading_sections WHERE is_released = false;

-- 2) Prüfe Unique-Constraint (sollte 0 Duplikate zeigen)
SELECT 'duplicate_check' as test, count(*)::text as result
FROM (
  SELECT reading_id, area, version, count(*) as cnt
  FROM public.reading_sections
  GROUP BY reading_id, area, version
  HAVING count(*) > 1
) dups;

-- 3) Prüfe Orphan-Sections (Sections ohne existierendes Reading)
SELECT 'orphan_sections' as test, count(*)::text as result
FROM public.reading_sections rs
WHERE NOT EXISTS (SELECT 1 FROM public.readings r WHERE r.id = rs.reading_id);

-- 4) Prüfe Orphan-Profiles (Profile ohne Sections)
SELECT 'orphan_profiles' as test, count(*)::text as result
FROM public.client_profiles cp
WHERE NOT EXISTS (SELECT 1 FROM public.reading_sections rs WHERE rs.client_id = cp.id);

-- 5) Prüfe Superseded-Chain-Integrität
SELECT 'broken_superseded' as test, count(*)::text as result
FROM public.reading_sections rs
WHERE rs.superseded_by IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.reading_sections r2 WHERE r2.id = rs.superseded_by);
