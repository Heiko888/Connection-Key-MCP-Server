# 🎨 Frontend-Komponenten für Agenten-Integration

## 📁 Dateien

1. **AgentChat.tsx** - Universelle Chat-Komponente für alle Agenten
2. **ReadingGenerator.tsx** - Komponente für Human Design Readings
3. **agents-dashboard.tsx** - Dashboard-Seite für alle Agenten

## 🚀 Installation auf CK-App Server

### Schritt 1: Dateien kopieren

```bash
# Auf CK-App Server (167.235.224.149)
cd /path/to/your/nextjs-app

# Für Pages Router:
mkdir -p components/agents
cp integration/frontend/components/*.tsx components/agents/
cp integration/frontend/pages/agents-dashboard.tsx pages/

# Oder für App Router:
mkdir -p app/components/agents
mkdir -p app/agents/dashboard
# (Anpassung der Dateien nötig)
```

### Schritt 2: CSS/Styling hinzufügen

Erstellen Sie `styles/agents.css`:

```css
.agent-chat-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chat-history {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.chat-item {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.user-message {
  margin-bottom: 10px;
  color: #333;
}

.agent-response {
  color: #666;
}

.response-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.chat-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.submit-button {
  padding: 10px 20px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.reading-generator-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.reading-form {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.generate-button {
  padding: 12px 24px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.reading-result {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.reading-content {
  white-space: pre-wrap;
  line-height: 1.8;
  margin: 20px 0;
}

.agents-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.agent-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
}
```

### Schritt 3: Routing

**Für Pages Router:**
- `/pages/agents-dashboard.tsx` → `/agents-dashboard`
- `/pages/readings/create.tsx` → `/readings/create` (mit ReadingGenerator)

**Für App Router:**
- `/app/agents/dashboard/page.tsx`
- `/app/readings/create/page.tsx`

### Schritt 4: Navigation hinzufügen

```tsx
// In Ihrer Navigation-Komponente
<Link href="/agents-dashboard">Agenten Dashboard</Link>
<Link href="/readings/create">Reading erstellen</Link>
```

## 📋 Verwendung

### AgentChat Component

```tsx
import { AgentChat } from '@/components/agents/AgentChat';

<AgentChat 
  agentId="marketing" 
  agentName="Marketing"
  userId="optional-user-id"
/>
```

### ReadingGenerator Component

```tsx
import { ReadingGenerator } from '@/components/agents/ReadingGenerator';

<ReadingGenerator userId="optional-user-id" />
```

## ✅ Schritt 2 abgeschlossen!

Die Frontend-Komponenten sind erstellt und bereit für die Installation.

