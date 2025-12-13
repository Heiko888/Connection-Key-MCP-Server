# 🎯 Agenten - Nächste Schritte

## 📊 Aktueller Status

### ✅ Vollständig fertig
- **Reading Agent** - Frontend ✅, Brand Book ✅

### ⚠️ Backend fertig, Frontend fehlt (5 Agenten)
- Marketing Agent
- Automation Agent
- Sales Agent
- Social-YouTube Agent
- Chart Agent

### ❌ Brand Book fehlt (4 Agenten)
- Marketing, Automation, Sales, Social-YouTube

---

## 🚀 Konkrete nächste Schritte

### Schritt 1: Brand Book Integration (2 Stunden) - ZUERST

**Warum zuerst:** Schnell umsetzbar, verbessert Qualität aller Agent-Antworten

**Was zu tun:**
```bash
# Auf Hetzner Server (138.199.237.34)
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# Script ausführen
chmod +x update-all-agents-brandbook.sh
./update-all-agents-brandbook.sh

# MCP Server neu starten
systemctl restart mcp

# Prüfen
systemctl status mcp
```

**Ergebnis:** Alle 4 Agenten haben Brand Book Integration

---

### Schritt 2: Frontend-Seiten erstellen (5-10 Stunden)

**Warum wichtig:** Benutzer können Agenten nicht nutzen ohne Frontend

**Was zu erstellen:**

#### 2.1 Marketing Agent Frontend

**Datei:** `app/coach/agents/marketing/page.tsx`

```typescript
import { AgentChat } from '@/components/agents/AgentChat';

export default function MarketingAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Marketing Agent</h1>
      <AgentChat agentId="marketing" />
    </div>
  );
}
```

#### 2.2 Automation Agent Frontend

**Datei:** `app/coach/agents/automation/page.tsx`

```typescript
import { AgentChat } from '@/components/agents/AgentChat';

export default function AutomationAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Automation Agent</h1>
      <AgentChat agentId="automation" />
    </div>
  );
}
```

#### 2.3 Sales Agent Frontend

**Datei:** `app/coach/agents/sales/page.tsx`

```typescript
import { AgentChat } from '@/components/agents/AgentChat';

export default function SalesAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Agent</h1>
      <AgentChat agentId="sales" />
    </div>
  );
}
```

#### 2.4 Social-YouTube Agent Frontend

**Datei:** `app/coach/agents/social-youtube/page.tsx`

```typescript
import { AgentChat } from '@/components/agents/AgentChat';

export default function SocialYouTubeAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Social-YouTube Agent</h1>
      <AgentChat agentId="social-youtube" />
    </div>
  );
}
```

#### 2.5 Chart Agent Frontend

**Datei:** `app/coach/agents/chart/page.tsx`

**Option 1: ChartAgentInterface verwenden (falls vorhanden)**
```typescript
import { ChartAgentInterface } from '@/components/ChartAgentInterface';

export default function ChartAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Chart Agent</h1>
      <ChartAgentInterface />
    </div>
  );
}
```

**Option 2: AgentChat erweitern**
```typescript
// AgentChat.tsx erweitern:
interface AgentChatProps {
  agentId: 'marketing' | 'automation' | 'sales' | 'social-youtube' | 'chart'; // ← chart hinzufügen
  agentName: string;
  userId?: string;
}
```

**Option 3: Eigene Komponente**
```typescript
import { ChartDevelopment } from '@/components/agents/ChartDevelopment';

export default function ChartAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Chart Agent</h1>
      <ChartDevelopment />
    </div>
  );
}
```

**Voraussetzung:** `AgentChat` Komponente muss vorhanden sein

**Wichtig:** AgentChat unterstützt aktuell nur:
- `'marketing' | 'automation' | 'sales' | 'social-youtube'`
- **Chart Agent fehlt!** Muss erweitert werden

**Prüfen:**
```bash
# Auf CK-App Server
ls -la app/components/agents/AgentChat.tsx
# Oder
ls -la components/agents/AgentChat.tsx

# Bereits vorhandene Komponenten prüfen:
ls -la components/AgentChatInterface.tsx
ls -la components/AutomationAgentInterface.tsx
ls -la components/ChartAgentInterface.tsx
```

**Bereits vorhanden auf Server:**
- ✅ `AgentChatInterface.tsx`
- ✅ `AutomationAgentInterface.tsx`
- ✅ `ChartAgentInterface.tsx`
- ✅ `components/agents/ChartDevelopment.tsx`

**Möglicherweise müssen diese nur mit den API-Routes verbunden werden!**

---

### Schritt 3: Chart Agent Endpoint prüfen (30 Min)

**Problem:** Möglicher Endpoint-Unterschied

**Lokale Datei:** `agents-chart-development.ts` → verwendet `chart-development`  
**Server:** Möglicherweise `chart` statt `chart-development`

**Prüfen:**
```bash
# Auf Hetzner Server
curl -X POST http://138.199.237.34:7000/agent/chart \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

curl -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Falls `chart` funktioniert:**
- API-Route auf Server anpassen: `chart-development` → `chart`
- Oder lokale Datei anpassen

---

## 📋 Checkliste

### Brand Book Integration
- [ ] Script auf Hetzner Server ausführen
- [ ] MCP Server neu starten
- [ ] Testen (4 Agenten)

### Frontend-Seiten
- [ ] Vorhandene Komponenten prüfen (AgentChatInterface, etc.)
- [ ] AgentChat Komponente prüfen/erstellen/erweitern
- [ ] Marketing Agent Seite erstellen
- [ ] Automation Agent Seite erstellen (oder AutomationAgentInterface verwenden)
- [ ] Sales Agent Seite erstellen
- [ ] Social-YouTube Agent Seite erstellen
- [ ] Chart Agent Seite erstellen (ChartAgentInterface oder ChartDevelopment verwenden)
- [ ] Navigation/Links hinzufügen

### Chart Agent Endpoint
- [ ] Endpoint prüfen (`chart` vs `chart-development`)
- [ ] API-Route anpassen falls nötig
- [ ] Testen

---

## 🎯 Empfohlene Reihenfolge

1. **Brand Book Integration** (2 Stunden) ← ZUERST
2. **Chart Agent Endpoint prüfen** (30 Min)
3. **Frontend-Seiten erstellen** (5-10 Stunden)

**Gesamtaufwand:** ~8-13 Stunden

---

## ✅ Nach Abschluss

**Alle Agenten haben:**
- ✅ Backend API-Route
- ✅ Frontend-Seite
- ✅ Brand Book Integration

**Benutzer können:**
- ✅ Alle 6 Agenten über Frontend nutzen
- ✅ Qualitativ hochwertige Antworten erhalten (dank Brand Book)

