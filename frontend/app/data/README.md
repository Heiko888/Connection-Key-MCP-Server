
# Human Design Dateien Integration

Hier können Sie Ihre gesammelten Human Design Dateien organisieren und in die Datenbank integrieren.

## 📁 Dateistruktur für Human Design Daten

### 1. Charts und Berechnungen

- `/charts/` - Bodygraph Images (PNG/JPG)
- `/calculations/` - Berechnungsdateien (PDF/TXT)
- `/ephemeris/` - Astrologische Daten (wenn vorhanden)

### 2. Profil-Beschreibungen

- `/profiles/` - Detaillierte Profilbeschreibungen
- `/types/` - Typ-spezifische Informationen
- `/authorities/` - Autoritäts-Beschreibungen

### 3. Gates und Zentren

- `/gates/` - Gate-Beschreibungen (1-64)
- `/centers/` - Zentren-Definitionen
- `/channels/` - Kanal-Beschreibungen

## 🔧 Integration Steps

### Schritt 1: Ihre Basisdaten

Tragen Sie hier Ihre Geburtsdaten ein:

```typescript
// In lib/human-design-calculator.ts
const YOUR_BIRTH_DATA = {
  date: 'YYYY-MM-DD',    // Ihr Geburtsdatum
  time: 'HH:MM',         // Ihre Geburtszeit
  place: 'Stadt, Land'   // Ihr Geburtsort
}
```text
### Schritt 2: Ihre Chart-Daten
```typescript
const YOUR_CHART_DATA = {
  type: 'Generator',
  authority: 'Sakral-Autorität',
  profile: '6/3',
  definedCenters: ['sacral', 'g', 'throat', 'spleen', 'root'],
  gates: [5, 14, 18, 20, 27, 34, 48, 50, 57, 58, 32, 28],
  // Weitere Details aus Ihren Dateien...
}
```text
### Schritt 3: Erweiterte Daten
- **Kanäle**: Welche Kanäle sind bei Ihnen aktiviert?
- **Planeten**: Wo stehen Ihre Planeten in den Gates?
- **Variablen**: PHS, Umgebung, Motivation, etc.
- **Inkarnationskreuz**: Ihr spezifisches Lebensthema

## 📋 Datensammlung Checkliste

- [ ] Geburtsdatum, -zeit und -ort verifiziert
- [ ] Bodygraph Chart (visuell)
- [ ] Liste aller definierten Gates
- [ ] Liste aller definierten Kanäle
- [ ] Alle definierten Zentren
- [ ] Planeten-Positionen
- [ ] Inkarnationskreuz
- [ ] Profil-Linien Details
- [ ] Autoritäts-Details
- [ ] Variablen (falls bekannt)

## 🎯 Nächste Schritte

1. **Fügen Sie Ihre Dateien hinzu**: Legen Sie Ihre Human Design Dateien in entsprechende Ordner
2. **Aktualisieren Sie die Datenbank**: Erweitern Sie `human-design-database.json`
3. **Testen Sie die Berechnung**: Verwenden Sie die API für Validierung
4. **Matching optimieren**: Nutzen Sie detaillierte Daten für besseres Matching

## 💡 Tipps

- **Backup erstellen**: Sichern Sie Ihre Original-Dateien
- **Versionierung**: Dokumentieren Sie Änderungen an den Daten
- **Validierung**: Vergleichen Sie berechnete mit bekannten Daten
- **Privacy**: Sensible Daten nur lokal speichern

## 🔗 Weiterführende Integration

Für erweiterte Features können Sie integrieren:
- Swiss Ephemeris für präzise Berechnungen
- Rave I'Ching für Gate-Beschreibungen
- Human Design Institute Daten
- Genetische Matrix Informationen
