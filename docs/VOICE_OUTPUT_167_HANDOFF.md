# Sprachausgabe (TTS) im Beziehungs-/Coach-Chat — Übergabe an .167

**Stand:** 2026-06-12 | **Quelle:** Implementierung auf .138 (Branch `claude/relationship-chat-voice-053s4g`)

Dieses Dokument beschreibt, wie die bereits auf **.138** umgesetzte Sprachausgabe
auch im **.167**-Frontend (Repo `Heiko888/The-Connection-Key`, MUI-Stack) ergänzt wird.
Es ist als Auftrag für eine Claude-Code-Session gedacht, die auf das `.167`-Repo
gescoped ist.

## Kontext / Was auf .138 schon existiert

- Datei: `frontend/components/AIChatInterface.tsx` (Commit `61badfe`)
- Verhalten:
  - **Header-Toggle** → AI-Antworten automatisch vorlesen (an/aus)
  - **Vorlese-/Stopp-Button pro Assistenten-Nachricht**
  - Nutzt den vorhandenen `frontend/lib/audioService.ts` (`useAudio`-Hook,
    Web Speech API). Wiedergabe wird beim Verlassen der Komponente gestoppt.
- ⚠️ Der `.167`-Stack ist **MUI** (kein Tailwind) und hat den `audioService`
  aus dem .138-Frontend vermutlich **nicht** → daher unten ein self-contained Hook.

## Ziel auf .167

Gleiches Verhalten im Beziehungs-/Coach-Chat (vermutlich `components/AgentChat.tsx`,
ggf. `AgentChatInterface.tsx` für den Relationship-Agent), umgesetzt mit MUI-Komponenten.

## Schritt 1 — Neuen Hook anlegen: `lib/useTextToSpeech.ts`

```ts
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Sprachausgabe via Web Speech API (kostenlos, browser-nativ, deutsche Stimme)
export function useTextToSpeech(lang = 'de-DE') {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setSpeakingId(null);
  }, []);

  // Vorlesen; toggelt, wenn dieselbe id erneut kommt
  const speak = useCallback((id: string, text: string) => {
    const synth = synthRef.current;
    if (!synth || !text?.trim()) return;
    if (speakingId === id) { stop(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    const voice = synth.getVoices().find(v => v.lang.startsWith('de'));
    if (voice) u.voice = voice;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    synth.speak(u);
  }, [speakingId, stop, lang]);

  return { speak, stop, speakingId };
}
```

## Schritt 2 — In die Beziehungs-Chat-Komponente einbauen

Imports:

```ts
import { useTextToSpeech } from '@/lib/useTextToSpeech';
import { VolumeUp, VolumeOff, Stop } from '@mui/icons-material';
import { useState } from 'react';
```

Im Component:

```ts
const { speak, stop, speakingId } = useTextToSpeech();
const [autoSpeak, setAutoSpeak] = useState(false);
```

**Header-Toggle** (MUI `IconButton` + `Tooltip`):

```tsx
<Tooltip title={autoSpeak ? 'Sprachausgabe aus' : 'Antworten vorlesen'}>
  <IconButton onClick={() => { setAutoSpeak(p => { if (p) stop(); return !p; }); }}>
    {autoSpeak ? <VolumeUp color="primary" /> : <VolumeOff />}
  </IconButton>
</Tooltip>
```

**Nach Erhalt einer Agent-Antwort** (dort, wo die Antwort an `conversation`/`messages`
angehängt wird):

```ts
if (autoSpeak) speak(agentMessage.id ?? String(index), agentMessage.content);
```

**Vorlese-Button pro Assistenten-Nachricht** (nur `role === 'agent'`/`'assistant'`):

```tsx
<IconButton size="small" onClick={() => speak(msgId, msg.content)}>
  {speakingId === msgId ? <Stop fontSize="small" /> : <VolumeUp fontSize="small" />}
</IconButton>
```

## Schritt 3 — Hinweise

- `'use client'` ist Pflicht (Hook + Komponente).
- `window.speechSynthesis` nur clientseitig nutzen — der SSR-Guard ist im Hook drin.
- Branch committen & pushen. **Keinen PR ohne Rückfrage** erstellen.

## Optionaler nächster Schritt (Qualität)

Web-Speech-Stimmen klingen je nach Gerät/Browser teils „roboterhaft". Für eine
natürliche, markentaugliche Stimme später auf **Server-TTS (ElevenLabs / OpenAI TTS)**
umstellen: kleiner Endpoint Text → MP3, Frontend spielt das Audio ab.
