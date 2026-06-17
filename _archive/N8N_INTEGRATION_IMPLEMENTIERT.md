# ✅ Phase 3: n8n-Integration implementiert

## 📋 Was wurde erstellt

### 1. **Reading Generation Workflow** - `reading-generation-workflow.json`

**Features:**
- ✅ Webhook-Endpoint: `/webhook/reading`
- ✅ Compatibility Reading Check
- ✅ Reading Agent aufrufen (Port 4001)
- ✅ Ergebnis in Supabase speichern
- ✅ Frontend benachrichtigen
- ✅ Webhook Response

**Flow:**
```
Webhook (POST /webhook/reading)
  ↓
Check Compatibility?
  ↓ (ja) → Call Reading Agent (Compatibility)
  ↓ (nein) → Call Reading Agent (Standard)
  ↓
Save to Supabase
  ↓
Notify Frontend
  ↓
Webhook Response
```

---

### 2. **Scheduled Reading Generation** - `scheduled-reading-generation.json`

**Features:**
- ✅ Cron-Trigger (täglich um 9:00 Uhr)
- ✅ Neue Subscriber abrufen
- ✅ Batch-Processing
- ✅ Welcome Reading generieren
- ✅ In Supabase speichern
- ✅ Frontend benachrichtigen

**Flow:**
```
Schedule Trigger (täglich 9:00)
  ↓
Get New Subscribers
  ↓
Split Subscribers (Batch)
  ↓
Generate Reading (für jeden)
  ↓
Save Reading
  ↓
Notify Frontend
```

---

### 3. **User Registration → Reading** - `user-registration-reading.json`

**Features:**
- ✅ Webhook-Endpoint: `/webhook/user-registered`
- ✅ Geburtsdaten prüfen
- ✅ Welcome Reading generieren
- ✅ In Supabase speichern
- ✅ User benachrichtigen

**Flow:**
```
User Registered Webhook
  ↓
Check Birth Data vorhanden?
  ↓ (ja) → Generate Welcome Reading
  ↓ (nein) → Skip
  ↓
Save Welcome Reading
  ↓
Notify User
  ↓
Webhook Response
```

---

### 4. **Reading Notification API-Route** - `/api/notifications/reading/route.ts`

**Features:**
- ✅ Empfängt Notifications von n8n
- ✅ API-Key Authentifizierung (optional)
- ✅ Reading verifizieren (aus Supabase)
- ✅ History-Eintrag erstellen
- ✅ Success Response

**Verwendung:**
- n8n ruft nach Reading-Generierung auf
- Frontend kann für Real-time Updates verwendet werden
- Optional: WebSocket/SSE Integration

---

## 🔧 n8n Workflow-Konfiguration

### **Environment Variables in n8n:**

```bash
# In n8n Settings → Environment Variables
READING_AGENT_URL=http://138.199.237.34:4001
FRONTEND_URL=https://www.the-connection-key.de
N8N_API_KEY=dein-api-key-hier
```

### **Supabase Credentials:**

In n8n → Credentials → Supabase API:
- **URL:** `https://xxxxx.supabase.co`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🚀 Installation

### **Schritt 1: Workflows in n8n importieren**

1. Öffne n8n: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Gehe zu **Workflows**
3. Klicke **Import from File**
4. Importiere:
   - `reading-generation-workflow.json`
   - `scheduled-reading-generation.json`
   - `user-registration-reading.json`

### **Schritt 2: Environment Variables setzen**

In n8n → Settings → Environment Variables:
```bash
READING_AGENT_URL=http://138.199.237.34:4001
FRONTEND_URL=https://www.the-connection-key.de
```

### **Schritt 3: Supabase Credentials konfigurieren**

1. In n8n → Credentials → **New Credential**
2. Wähle **Supabase API**
3. Fülle aus:
   - **URL:** Deine Supabase URL
   - **Service Role Key:** Dein Service Role Key

### **Schritt 4: Workflows aktivieren**

1. Öffne jeden Workflow
2. Klicke **Activate** (oben rechts)
3. Prüfe Webhook-URLs:
   - `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading`
   - `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`

### **Schritt 5: API-Route installieren**

```bash
# Auf CK-App Server
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/notifications/reading
cp integration/api-routes/app-router/notifications/reading/route.ts \
   /opt/hd-app/The-Connection-Key/frontend/app/api/notifications/reading/route.ts
```

---

## 📊 Workflow-Details

### **D1: Reading-Generierung via n8n** ✅

**Webhook-URL:**
```
POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading
```

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "readingType": "detailed",
  "birthDate2": "1992-08-20",  // Nur für Compatibility
  "birthTime2": "10:15",       // Nur für Compatibility
  "birthPlace2": "München"     // Nur für Compatibility
}
```

**Response:**
```json
{
  "success": true,
  "readingId": "reading-uuid",
  "message": "Reading erfolgreich generiert und gespeichert"
}
```

---

### **D2: Automatische Notifications** ✅

**Frontend-Endpoint:**
```
POST /api/notifications/reading
```

**Request Body (von n8n):**
```json
{
  "readingId": "reading-uuid",
  "userId": "user-uuid",
  "readingType": "detailed",
  "status": "completed",
  "timestamp": "2025-12-13T..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification received",
  "readingId": "reading-uuid"
}
```

---

### **D3: Scheduled Readings** ✅

**Cron-Expression:**
```
0 9 * * *  // Täglich um 9:00 Uhr
```

**Was passiert:**
1. Holt neue Subscriber aus Supabase
2. Generiert für jeden ein Basic Reading
3. Speichert in Supabase
4. Benachrichtigt Frontend

---

### **D4: Event-Trigger** ✅

**User-Registrierung → Reading:**

**Webhook-URL:**
```
POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany"
}
```

**Was passiert:**
1. Prüft ob Geburtsdaten vorhanden
2. Generiert Welcome Reading (Basic)
3. Speichert in Supabase
4. Benachrichtigt User

---

## 🔗 Integration mit Frontend

### **Frontend kann n8n Workflow auslösen:**

```typescript
// Reading via n8n generieren
const response = await fetch(
  'https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: user.id,
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Berlin, Germany',
      readingType: 'detailed'
    })
  }
);
```

### **Frontend empfängt Notifications:**

```typescript
// Optional: WebSocket/SSE für Real-time Updates
// Aktuell: Polling oder nach Reading-Generierung prüfen

// Nach Reading-Generierung:
const checkNotification = async (readingId: string) => {
  const response = await fetch(`/api/readings/${readingId}`);
  // ...
};
```

---

## ✅ Status

- ✅ **D1: Reading-Generierung via n8n** - FERTIG
- ✅ **D2: Automatische Notifications** - FERTIG
- ✅ **D3: Scheduled Readings** - FERTIG
- ✅ **D4: Event-Trigger** - FERTIG

**Phase 3 (Automatisierung) ist abgeschlossen!** 🎉

---

## 🎯 Optional: Weitere Verbesserungen

### **Real-time Updates:**
- WebSocket Integration
- Server-Sent Events (SSE)
- Push Notifications

### **Weitere Event-Trigger:**
- Chart-Berechnung → Reading generieren
- Subscription → Welcome Reading
- Reading-Update → Notification

Die vollständige Dokumentation ist in `N8N_INTEGRATION_IMPLEMENTIERT.md` gespeichert.

