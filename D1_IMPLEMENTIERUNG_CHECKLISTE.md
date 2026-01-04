# D1 – Chart-Visualisierung: Implementierungs-Checkliste

**Status:** Implementierungs-Plan  
**Datum:** 2026-01-04

---

## ✅ Phase 1: API-Route (PRIORITÄT 1)

### Aufgaben:
- [x] Architektur definiert
- [x] API-Route erstellt: `app/api/chart/[chart_id]/route.ts`
- [ ] API-Route testen:
  - [ ] Valid `chart_id` → 200 OK
  - [ ] Invalid `chart_id` → 404
  - [ ] Unsupported `chart_version` → 400
  - [ ] Missing chart data → 500
- [ ] API-Dokumentation erstellen

### Dateien:
- ✅ `integration/api-routes/app-router/chart/[chart_id]/route.ts` (erstellt)

---

## ⏳ Phase 2: Frontend-Hook

### Aufgaben:
- [ ] Erstelle `lib/hooks/useChart.ts`
- [ ] Implementiere `useChart(chartId)` Hook
- [ ] Loading State
- [ ] Error State
- [ ] Success State
- [ ] Teste Hook mit verschiedenen `chart_id`s

### Dateien:
- [ ] `lib/hooks/useChart.ts`

### Code-Struktur:
```typescript
export function useChart(chartId: string) {
  const [data, setData] = useState<ChartResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch chart data
  }, [chartId]);
  
  return { data, error, isLoading };
}
```

---

## ⏳ Phase 3: Komponenten

### 3.1 ChartLoader
- [ ] Erstelle `components/chart/ChartLoader.tsx`
- [ ] Props: `chartId: string`
- [ ] Lädt Chart via `useChart(chartId)`
- [ ] Zeigt Loading State
- [ ] Zeigt Error State
- [ ] Zeigt Success State → `<BodygraphRenderer />`

### 3.2 ChartError
- [ ] Erstelle `components/chart/ChartError.tsx`
- [ ] Props: `error: Error`, `chartId: string`
- [ ] Zeigt Fehlermeldung
- [ ] Zeigt `chart_id` im Fehler

### 3.3 ChartLoadingSkeleton
- [ ] Erstelle `components/chart/ChartLoadingSkeleton.tsx`
- [ ] Zeigt Loading-Animation

### 3.4 BodygraphRenderer
- [ ] Erstelle `components/chart/BodygraphRenderer.tsx`
- [ ] Props: `chart: ChartData`
- [ ] Rendert `<BodygraphSVG />`
- [ ] Rendert `<ChannelsList />`
- [ ] Rendert `<GatesList />`

### 3.5 BodygraphSVG
- [ ] Erstelle `components/chart/BodygraphSVG.tsx`
- [ ] SVG-Struktur für Bodygraph
- [ ] Rendert 9 Centers

### 3.6 Center
- [ ] Erstelle `components/chart/Center.tsx`
- [ ] Props: `id: string`, `state: "defined" | "undefined"`
- [ ] SVG-Element für Center
- [ ] Styling: `defined` → gefüllt, `undefined` → leer

### 3.7 Channel
- [ ] Erstelle `components/chart/Channel.tsx`
- [ ] Props: `number: number`, `gate1: number`, `gate2: number`, `name: string`, `defined: boolean`
- [ ] SVG-Element für Channel
- [ ] Styling: `defined` → farbig, `undefined` → grau/gestrichelt

### 3.8 Gate
- [ ] Erstelle `components/chart/Gate.tsx`
- [ ] Props: `number: string`, `line: number`, `planet: string`
- [ ] SVG-Element für Gate

### Dateien:
- [ ] `components/chart/ChartLoader.tsx`
- [ ] `components/chart/ChartError.tsx`
- [ ] `components/chart/ChartLoadingSkeleton.tsx`
- [ ] `components/chart/BodygraphRenderer.tsx`
- [ ] `components/chart/BodygraphSVG.tsx`
- [ ] `components/chart/Center.tsx`
- [ ] `components/chart/Channel.tsx`
- [ ] `components/chart/Gate.tsx`

---

## ⏳ Phase 4: Integration

### Aufgaben:
- [ ] Integriere `<ChartLoader />` in ReadingPage
- [ ] Teste vollständigen Datenfluss:
  - [ ] Reading laden → `chart_id` extrahieren
  - [ ] Chart laden → `chart_data` erhalten
  - [ ] Bodygraph rendern
- [ ] Teste Fehlerfälle:
  - [ ] Reading ohne `chart_id` → Error
  - [ ] Chart nicht gefunden → 404 Error
  - [ ] Unsupported Version → 400 Error

### Dateien:
- [ ] `app/readings/[reading_id]/page.tsx` (anpassen)

---

## ⏳ Phase 5: Abnahme

### Abnahmekriterien prüfen:

- [ ] **Chart wird ausschließlich über `chart_id` geladen**
  - [ ] Keine Chart-Berechnung im Frontend
  - [ ] Keine Geburtsdaten im Frontend
  - [ ] Nur API-Call: `GET /api/chart/{chart_id}`

- [ ] **Keine Chart-Berechnung im Frontend**
  - [ ] Keine `calculateChart()` Funktionen
  - [ ] Keine `astronomy-engine` Imports
  - [ ] Keine Gate/Channel-Berechnungen

- [ ] **Löschen eines Charts bricht Visualisierung sichtbar**
  - [ ] Chart gelöscht → 404 Error sichtbar
  - [ ] Kein Fallback, kein "Chart nicht verfügbar" ohne Fehler
  - [ ] Error-Komponente zeigt: "Chart {chart_id} nicht gefunden"

- [ ] **Gleicher `chart_id` → identische Darstellung**
  - [ ] 2x gleicher `chart_id` → identisches Rendering
  - [ ] Keine Variation, keine Zufälligkeit

- [ ] **Unterschiedliche `chart_version` → bewusst unterscheidbar**
  - [ ] Version 1.0.0 → V1-Renderer
  - [ ] Version 2.0.0 → V2-Renderer (falls implementiert)
  - [ ] Unsupported Version → Error sichtbar

---

## ⏳ Phase 6: Dokumentation

### Aufgaben:
- [ ] API-Dokumentation aktualisieren
- [ ] Komponenten-Dokumentation erstellen
- [ ] Datenfluss-Diagramm aktualisieren
- [ ] Abnahme-Report erstellen

---

## 📋 Nächste Schritte

1. ✅ Architektur definiert
2. ✅ API-Route erstellt
3. ⏳ Frontend-Hook implementieren
4. ⏳ Komponenten implementieren
5. ⏳ Integration testen
6. ⏳ Abnahme durchführen

---

**Status:** Phase 1 abgeschlossen, Phase 2-6 ausstehend
