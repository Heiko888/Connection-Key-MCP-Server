# 📘 Workbook-Schnittstelle - API-Spec

**Datum:** 17.12.2025

**Ziel:** Schnittstelle zwischen Chart Architect Agent und Workbook-System definieren

---

## 📋 Übersicht

Dieses Dokument definiert die Schnittstelle zwischen dem **Chart Architect Agent** und dem **Workbook-System**. Es legt fest, welche Daten und Formate ausgetauscht werden.

---

## 🔗 Schnittstellen-Architektur

```
Chart Architect Agent
    ↓
    | (liefert)
    |
    ├─→ Datenstruktur (JSON)
    ├─→ SVG-Grafik (vollständig)
    ├─→ SVG-Layer (modular)
    └─→ Metadaten
    ↓
Workbook-System
    ↓
    | (konsumiert)
    |
    ├─→ PDF-Generierung
    ├─→ Web-Workbook
    └─→ Interaktive Visualisierung
```

---

## 📦 API-Endpoint

### Chart Architect → Workbook

**Endpoint:** `POST /api/workbook/chart-data`

**Request:**
```json
{
  "chartType": "single|dual|penta",
  "birthData": {
    "person_A": {
      "date": "1978-05-12",
      "time": "14:32",
      "timezone": "Europe/Berlin",
      "location": "Berlin, Germany"
    },
    "person_B": {
      "date": "1985-03-20",
      "time": "10:15",
      "timezone": "Europe/Berlin",
      "location": "München, Germany"
    }
  },
  "options": {
    "includeSVG": true,
    "includeLayers": true,
    "includeData": true,
    "mode": "single|dual-comparison|dual-overlay|penta|focus"
  }
}
```

**Response:**
```json
{
  "success": true,
  "chart_id": "chart_001",
  "data": {
    "person_A": {
      "chart_id": "chart_001",
      "person": {...},
      "type": "Generator",
      "authority": "Sacral",
      "profile": "1/3",
      "definition": "Single",
      "centers": {...},
      "channels": {...},
      "gates": {...}
    },
    "person_B": {...}
  },
  "svg": {
    "full": "<svg>...</svg>",
    "layers": {
      "centers": "<g id=\"layer_centers\">...</g>",
      "channels": "<g id=\"layer_channels\">...</g>",
      "gates": "<g id=\"layer_gates\">...</g>",
      "person_A": "<g id=\"layer_person_A\">...</g>",
      "person_B": "<g id=\"layer_person_B\">...</g>",
      "connections": "<g id=\"layer_connections\">...</g>"
    }
  },
  "metadata": {
    "version": "1.0",
    "generated_at": "2025-12-17T18:00:00Z",
    "svg_standard": "layer-based-v1"
  }
}
```

---

## 📊 Datenformat (Standard)

### Single Chart

```json
{
  "chart_id": "chart_001",
  "person": {
    "id": "person_A",
    "name": "Heiko",
    "birth": {
      "date": "1978-05-12",
      "time": "14:32",
      "timezone": "Europe/Berlin",
      "location": "Berlin, Germany",
      "coordinates": {
        "lat": 52.52,
        "lng": 13.405
      }
    }
  },
  "type": "Generator",
  "authority": "Sacral",
  "profile": "1/3",
  "definition": "Single",
  "strategy": "Wait to respond",
  "centers": {
    "head": {
      "defined": false,
      "activation_source": []
    },
    "ajna": {
      "defined": true,
      "activation_source": ["gate_11"]
    },
    "throat": {
      "defined": true,
      "activation_source": ["gate_62", "gate_23"]
    },
    "g": {
      "defined": false,
      "activation_source": []
    },
    "heart": {
      "defined": false,
      "activation_source": []
    },
    "solar": {
      "defined": true,
      "activation_source": ["gate_30", "gate_50"]
    },
    "sacral": {
      "defined": true,
      "activation_source": ["gate_5", "gate_14"]
    },
    "spleen": {
      "defined": false,
      "activation_source": []
    },
    "root": {
      "defined": true,
      "activation_source": ["gate_19", "gate_39"]
    }
  },
  "channels": {
    "11-56": {
      "active": true,
      "gates": ["gate_11", "gate_56"],
      "definition_type": "personal",
      "source": "person_A"
    },
    "34-20": {
      "active": false,
      "gates": ["gate_34", "gate_20"],
      "definition_type": null,
      "source": null
    }
  },
  "gates": {
    "gate_11": {
      "number": 11,
      "line": 2,
      "planet": "Sun",
      "active": true,
      "center": "ajna"
    },
    "gate_56": {
      "number": 56,
      "line": 4,
      "planet": "Earth",
      "active": true,
      "center": "throat"
    }
  },
  "incarnation_cross": {
    "name": "Cross of Planning",
    "type": "Right Angle",
    "sun_gate": 11,
    "sun_line": 2,
    "earth_gate": 12,
    "earth_line": 5
  }
}
```

---

### Dual Chart (Connection Key)

```json
{
  "connection_chart_id": "connection_001",
  "participants": ["person_A", "person_B"],
  "person_A": {
    "chart_id": "chart_001",
    "person": {...},
    "centers": {...},
    "channels": {...},
    "gates": {...}
  },
  "person_B": {
    "chart_id": "chart_002",
    "person": {...},
    "centers": {...},
    "channels": {...},
    "gates": {...}
  },
  "connections": [
    {
      "type": "electromagnetic",
      "gate_from": "gate_11",
      "person_from": "person_A",
      "gate_to": "gate_56",
      "person_to": "person_B",
      "channel": "11-56",
      "strength": "high"
    },
    {
      "type": "dominant",
      "gate": "gate_34",
      "dominant_person": "person_A",
      "submissive_person": "person_B"
    }
  ],
  "composite_channels": {
    "11-56": {
      "active": true,
      "defined_by": ["person_A", "person_B"],
      "type": "electromagnetic"
    }
  },
  "defined_centers": {
    "sacral": {
      "defined_by": ["person_A"],
      "composite": false
    },
    "throat": {
      "defined_by": ["person_A", "person_B"],
      "composite": true
    }
  }
}
```

---

### Penta / Gruppen Chart

```json
{
  "penta_id": "penta_001",
  "participants": [
    "person_A",
    "person_B",
    "person_C"
  ],
  "person_A": {...},
  "person_B": {...},
  "person_C": {...},
  "defined_centers": ["sacral", "throat"],
  "missing_centers": ["heart"],
  "group_channels": {
    "34-20": {
      "active": true,
      "contributors": ["person_A", "person_C"]
    }
  },
  "penta_type": "Individual|Tribal|Collective",
  "group_energy": {
    "strength": "high",
    "focus": "creativity",
    "dynamics": {...}
  }
}
```

---

## 🎨 SVG-Format

### Vollständiges SVG

```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 800 1200" 
     width="800" 
     height="1200"
     class="hd-bodygraph hd-mode-single"
     data-chart-id="chart_001">
  <!-- Alle Layer (siehe SVG-Standard) -->
</svg>
```

### SVG-Layer (Modular)

```json
{
  "svg_layers": {
    "centers": "<g id=\"layer_centers\">...</g>",
    "channels": "<g id=\"layer_channels\">...</g>",
    "gates": "<g id=\"layer_gates\">...</g>",
    "person_A": "<g id=\"layer_person_A\">...</g>",
    "person_B": "<g id=\"layer_person_B\">...</g>",
    "connections": "<g id=\"layer_connections\">...</g>",
    "highlights": "<g id=\"layer_highlights\">...</g>",
    "labels": "<g id=\"layer_labels\">...</g>"
  }
}
```

---

## 🔧 Workbook-API (Was Workbook anfordern kann)

### Option 1: Vollständiger Chart (Daten + SVG)

```bash
POST /api/workbook/chart-data
{
  "chartType": "single",
  "birthData": {
    "person_A": {
      "date": "1978-05-12",
      "time": "14:32",
      "location": "Berlin, Germany"
    }
  },
  "options": {
    "includeSVG": true,
    "includeData": true
  }
}
```

**Response:** Komplette Datenstruktur + vollständiges SVG

---

### Option 2: Nur Daten (ohne SVG)

```bash
POST /api/workbook/chart-data
{
  "chartType": "single",
  "birthData": {...},
  "options": {
    "includeSVG": false,
    "includeData": true
  }
}
```

**Response:** Nur Datenstruktur (Workbook generiert SVG selbst)

---

### Option 3: Nur SVG (ohne Daten)

```bash
POST /api/workbook/chart-data
{
  "chartType": "single",
  "birthData": {...},
  "options": {
    "includeSVG": true,
    "includeLayers": true,
    "includeData": false
  }
}
```

**Response:** Nur SVG (Workbook hat Daten bereits)

---

### Option 4: SVG-Layer einzeln

```bash
POST /api/workbook/chart-data
{
  "chartType": "single",
  "birthData": {...},
  "options": {
    "includeSVG": true,
    "includeLayers": true,
    "layers": ["centers", "channels", "gates"]
  }
}
```

**Response:** Nur bestimmte Layer

---

## 📝 Workbook-Verwendung

### Statisches PDF

**Workbook bekommt:**
- Vollständiges SVG (für direkte Einbettung)
- Datenstruktur (für Text-Erklärungen)

**Workbook macht:**
- SVG in PDF einbetten
- Text aus Datenstruktur generieren
- PDF zusammenstellen

---

### Interaktives Web-Workbook

**Workbook bekommt:**
- SVG-Layer (modular)
- Datenstruktur (für dynamische Anpassungen)

**Workbook macht:**
- Layer ein/ausblenden
- Farben ändern (über CSS)
- Fokus setzen
- Interaktive Elemente

---

### Dynamisches Workbook

**Workbook bekommt:**
- Nur Datenstruktur
- SVG-Template

**Workbook macht:**
- SVG selbst generieren (basierend auf Daten)
- Anpassungen vornehmen
- Eigene Visualisierungen

---

## 🔄 Datenfluss

### Szenario 1: Neuer Chart

```
1. Workbook → Chart Architect: "Erstelle Chart für Person A"
2. Chart Architect → Berechnet Chart-Daten
3. Chart Architect → Generiert SVG
4. Chart Architect → Workbook: { data, svg }
5. Workbook → Speichert Daten + SVG
6. Workbook → Generiert PDF/Web
```

---

### Szenario 2: Bestehender Chart

```
1. Workbook → Chart Architect: "Gib mir SVG für chart_001"
2. Chart Architect → Liest Chart-Daten (aus Cache/DB)
3. Chart Architect → Generiert SVG (basierend auf Daten)
4. Chart Architect → Workbook: { svg }
5. Workbook → Verwendet SVG
```

---

### Szenario 3: Dual-Chart

```
1. Workbook → Chart Architect: "Erstelle Dual-Chart für Person A + B"
2. Chart Architect → Berechnet beide Charts
3. Chart Architect → Berechnet Verbindungen
4. Chart Architect → Generiert Dual-SVG
5. Chart Architect → Workbook: { data, svg, connections }
6. Workbook → Kombiniert Grafik + Text
```

---

## 🎯 Metadaten

### Chart-Metadaten

```json
{
  "metadata": {
    "version": "1.0",
    "generated_at": "2025-12-17T18:00:00Z",
    "svg_standard": "layer-based-v1",
    "chart_type": "single|dual|penta",
    "calculation_method": "swiss-ephemeris|astronomy-engine",
    "coordinates_system": "standard-hd",
    "compatibility": {
      "workbook": ">=1.0",
      "frontend": ">=1.0"
    }
  }
}
```

---

## ✅ Validierung

### Daten-Validierung

```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "checks": {
    "centers": "9/9 vorhanden",
    "channels": "36/36 vorhanden",
    "gates": "64/64 vorhanden",
    "svg": "gültig",
    "layers": "9/9 vorhanden"
  }
}
```

---

## 🔍 Error-Handling

### Fehler-Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_BIRTH_DATA",
    "message": "Geburtsdatum ungültig",
    "details": {
      "field": "birthDate",
      "value": "invalid",
      "expected": "YYYY-MM-DD"
    }
  }
}
```

---

## 📋 Zusammenfassung

**Chart Architect liefert:**
- ✅ Datenstruktur (JSON, Standard-Format)
- ✅ SVG-Grafik (vollständig oder modular)
- ✅ Metadaten (Version, Timestamp, etc.)

**Workbook konsumiert:**
- ✅ Datenstruktur (für Text-Generierung)
- ✅ SVG-Grafik (für Visualisierung)
- ✅ Metadaten (für Validierung)

**Schnittstelle:**
- ✅ API-Endpoint: `/api/workbook/chart-data`
- ✅ Request: Chart-Typ, Geburtsdaten, Optionen
- ✅ Response: Daten + SVG + Metadaten

---

**🎯 Diese Schnittstelle ist die Basis für die Workbook-Integration!** 🚀
