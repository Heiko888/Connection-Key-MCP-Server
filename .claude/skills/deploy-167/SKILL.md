---
name: deploy-167
description: Frontend-Services auf Server .167 (167.235.224.149) bauen und deployen — pull, betroffene Services bestimmen, SERIELL bauen, echten Build-Exit prüfen, Container verifizieren. Use when deploying/rebuilding frontend or frontend-coach on .167, or after a git pull on .167 that touched frontend code.
---

# .167 Frontend-Deploy

Server **.167** (`167.235.224.149`, Repo `/opt/hd-app/The-Connection-Key`) hostet die Frontends. Deploy läuft per SSH von hier aus: `ssh root@167.235.224.149 '<cmd>'`. Es gibt **keine CI-Automatik** für Deploys → manuell bauen.

Goldene Regel (siehe CLAUDE.md): Frontend/UI gehört auf .167, niemals auf .138. Berechnungen/Worker gehören auf .138.

## Services

`docker compose` auf .167 baut u. a.: `frontend` (Next 14/webpack, `the-connection-key.de`:3000), `frontend-coach` (Next 16/Turbopack, `coach.the-connection-key.de`:3002), `ck-agent`, `nginx`, Monitoring.

## Workflow

### 1. Pull + betroffene Services bestimmen
```bash
ssh root@167.235.224.149 'cd /opt/hd-app/The-Connection-Key && git pull'
```
Aus dem Diff ableiten, welche Services neu gebaut werden müssen:
- Änderungen unter `frontend/` → `frontend`
- Änderungen unter `frontend-coach/` → `frontend-coach`
- Änderungen unter `packages/shared/` → **beide**

### 2. SERIELL bauen (nicht parallel!)
Pro Service einzeln, **nie** `docker compose build frontend frontend-coach` zusammen:
```bash
ssh root@167.235.224.149 'cd /opt/hd-app/The-Connection-Key && docker compose up -d --build <service>' > /tmp/build-<service>.log 2>&1; echo "EXIT=$?"
```
Großen Build im Hintergrund laufen lassen (`run_in_background: true`, Timeout 600000). Nach Abschluss folgt in Schritt 5 immer das Dangling-Prune.

**Warum seriell:** Paralleler Build killte `buildkitd` per OOM. .167 hat seit 2026-06-02 einen 4 GB Swapfile (swappiness 10) als Reserve, aber RAM ist knapp (7.6 GiB) → seriell bleibt sicherer.

### 3. ECHTEN Build-Exit prüfen (Falle!)
Ein abschließendes `echo "EXIT=$?"` **maskiert** den Docker-Exit, wenn die docker-Ausgabe per `| tail` gepiped wurde — die Task-Notification meldet dann fälschlich „exit code 0". Immer den **EXIT=-Wert aus dem Log** prüfen, nicht nur die Notification:
```bash
cat /tmp/build-<service>.log | grep -E "EXIT=|did not complete|Type error|Module not found|failed to solve"
```
Container-Uptime gegenchecken: wurde der Container wirklich neu erstellt (jung) oder läuft die alte Version weiter?

### 4. Beide Container verifizieren
```bash
ssh root@167.235.224.149 'docker ps --filter "name=frontend" --format "{{.Names}}\t{{.Status}}"; echo "frontend (3000): HTTP $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)"; echo "coach (3002): HTTP $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002)"'
```
Erwartung: betroffener Container „Up <Sekunden> (healthy)", HTTP 200.

### 5. Disk aufräumen (nach JEDEM erfolgreichen Deploy)
Zwei Fresser, **beide** nach verifiziertem Deploy behandeln:

**(a) Dangling-Images:** Jeder `--build` erzeugt ein neues ~4,7 GB-Image und **verwaist** das vorige (untagged).
**(b) buildx-BuildKit-Cache (der GROSSE, leicht übersehene):** `.167` baut über den **buildx docker-container-Builder `mybuilder0`**; dessen Cache liegt im Volume `buildx_buildkit_mybuilder0_state` und wuchs am 2026-07-05 unbemerkt auf **85 GB** (→ Disk 79 %/„voll"). ⚠️ Weder `docker image prune` **noch** `docker builder prune` erwischt ihn — nur **`docker buildx prune`** (builder-container). Nicht komplett leeren (kalter Cache = langsame Rebuilds), sondern **deckeln** via `--max-used-space` (buildx ≥ v0.27; ältere: `--keep-storage`):
```bash
ssh root@167.235.224.149 'docker image prune -f; docker buildx prune -f --max-used-space=15GB; echo "dangling: $(docker images -f dangling=true -q | wc -l)"; df -h / | tail -1'
```
Nur `image`/`buildx` prune — **nie** `system prune` oder `volume prune` (die ~80 GB Local Volumes sind aktiv: Grafana/Prometheus/Redis; das buildx-Cache-Volume wird korrekt über `buildx prune` gedeckelt, nicht über `volume prune`).

### 6. Commit (nur wenn vom User gewünscht)
.167-Working-Tree hat oft **unzusammenhängende** uncommittete Änderungen (`.env`-Backups, `nginx.conf`, Bilder). **Nur** die tatsächlich geänderten Dateien explizit stagen (`git add <pfade>`), nie `git add -A`. Commit-Footer:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

## Bekannter Stolperstein: @ck/shared-Dependencies
Beide Frontends binden `@ck/shared` per tsconfig-`paths` + `transpilePackages` aus der **Quelle** ein. Neue Runtime-Deps in `@ck/shared` brauchen: dep in `packages/shared/package.json`, committete `packages/shared/package-lock.json`, und `RUN cd packages/shared && npm ci --omit=dev --omit=peer` in **beiden** Dockerfiles. `--omit=peer` ist Pflicht (sonst überschattet react ohne Types das app-eigene react → coach-TS-Build bricht). `frontend` hat `ignoreBuildErrors=true` und verschleiert solche Fehler — der strenge `frontend-coach`-Build deckt sie auf, also immer auch coach bauen.
