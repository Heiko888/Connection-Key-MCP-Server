'use client';

/**
 * VideoGenerationPanel — Coach-Portal UI für echte Video-Generierung
 * (Runway / Seedance 2.0) über /api/agents/video-generation.
 *
 * Flow: Formular absenden → jobId → Status pollen (alle 5s) → permanentes Video
 * (Supabase Storage) anzeigen. Unterstützt Multi-Shot (mehrere Szenen → längeres Video).
 * Deployment-Ziel: Server .167, frontend-coach (components/VideoGenerationPanel.tsx)
 */

import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Card, CardContent, CircularProgress, MenuItem,
  Stack, TextField, Typography, Alert, LinearProgress, FormControlLabel, Switch,
} from '@mui/material';

type Mode = 'text' | 'image' | 'reference';
type Status = 'idle' | 'starting' | 'polling' | 'done' | 'error';

const RATIOS = ['1280:720', '720:1280', '1920:1080', '1080:1920'];

export default function VideoGenerationPanel() {
  const [mode, setMode] = useState<Mode>('text');
  const [multiShot, setMultiShot] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [shotsText, setShotsText] = useState(''); // eine Szene pro Zeile
  const [imagesText, setImagesText] = useState(''); // eine URL pro Zeile
  const [ratio, setRatio] = useState('1280:720');
  const [duration, setDuration] = useState(5);

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const startPolling = (jobId: string) => {
    setStatus('polling');
    pollRef.current = setInterval(async () => {
      try {
        const s = await fetch(`/api/agents/video-generation/status/${jobId}`).then((r) => r.json());
        if (typeof s.progress === 'number') setProgress(s.progress);
        if (s.status === 'completed') {
          stopPolling();
          setVideoUrl(s.video_url ?? null);
          setStatus('done');
        } else if (s.status === 'failed' || s.status === 'timeout' || s.status === 'cancelled') {
          stopPolling();
          setError(s.error || `Generierung ${s.status}`);
          setStatus('error');
        }
      } catch (e: any) {
        stopPolling();
        setError(e.message || 'Status-Abfrage fehlgeschlagen');
        setStatus('error');
      }
    }, 5000);
  };

  const handleGenerate = async () => {
    setError(null);
    setVideoUrl(null);
    setProgress(0);
    setStatus('starting');
    const images = imagesText.split('\n').map((s) => s.trim()).filter(Boolean);
    const shots = shotsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const payload: Record<string, unknown> = { mode, ratio, duration: Number(duration), images };
    if (multiShot && shots.length > 0) payload.shots = shots;
    else payload.prompt = prompt;

    try {
      const res = await fetch('/api/agents/video-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());
      if (!res.success || !res.jobId) throw new Error(res.error || 'Start fehlgeschlagen');
      startPolling(res.jobId);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Start');
      setStatus('error');
    }
  };

  const busy = status === 'starting' || status === 'polling';
  const needsImages = mode === 'image' || mode === 'reference';
  const canSubmit = multiShot ? shotsText.trim().length > 0 : prompt.trim().length > 0;

  return (
    <Card sx={{ maxWidth: 760 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>🎬 Video-Generierung (Seedance 2.0)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Erzeugt ein echtes Video über Runway und speichert es dauerhaft. Dauer i. d. R. 1–3 Min.
        </Typography>

        <Stack spacing={2}>
          <TextField select label="Modus" value={mode}
            onChange={(e) => setMode(e.target.value as Mode)} disabled={busy}>
            <MenuItem value="text">Text → Video</MenuItem>
            <MenuItem value="image">Bild → Video (Startbild)</MenuItem>
            <MenuItem value="reference">Referenz → Video (@IMG_1, @IMG_2 …)</MenuItem>
          </TextField>

          {mode === 'text' && (
            <FormControlLabel
              control={<Switch checked={multiShot} onChange={(e) => setMultiShot(e.target.checked)} disabled={busy} />}
              label="Multi-Shot (mehrere Szenen → längeres Video)"
            />
          )}

          {multiShot && mode === 'text' ? (
            <TextField label="Szenen (eine pro Zeile)" value={shotsText}
              onChange={(e) => setShotsText(e.target.value)} multiline minRows={3} disabled={busy}
              placeholder={'Weite Berglandschaft bei Sonnenaufgang\nNahaufnahme eines Adlers im Flug\nKamera schwenkt über ein Tal'}
              helperText="Jede Zeile wird zu einem Shot; die Dauer skaliert automatisch." />
          ) : (
            <TextField label="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
              multiline minRows={3} disabled={busy}
              placeholder="z. B. Sonnenaufgang über den Bergen, langsame Kamerafahrt" />
          )}

          {needsImages && (
            <TextField label="Bild-URLs (eine pro Zeile, HTTPS)" value={imagesText}
              onChange={(e) => setImagesText(e.target.value)} multiline minRows={2} disabled={busy}
              helperText={mode === 'reference' ? 'Im Prompt via @IMG_1, @IMG_2 … referenzieren' : 'Erstes Bild = Startframe'} />
          )}

          <Stack direction="row" spacing={2}>
            <TextField select label="Format" value={ratio} sx={{ minWidth: 140 }}
              onChange={(e) => setRatio(e.target.value)} disabled={busy}>
              {RATIOS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            {!(multiShot && mode === 'text') && (
              <TextField label="Dauer (Sek.)" type="number" value={duration} sx={{ width: 140 }}
                onChange={(e) => setDuration(Number(e.target.value))} disabled={busy}
                inputProps={{ min: 3, max: 15 }} />
            )}
          </Stack>

          <Button variant="contained" size="large" onClick={handleGenerate}
            disabled={busy || !canSubmit || (needsImages && !imagesText.trim())}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {status === 'starting' ? 'Starte …' : status === 'polling' ? 'Generiere …' : 'Video generieren'}
          </Button>

          {status === 'polling' && (
            <Box>
              <LinearProgress variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress} />
              <Typography variant="caption" color="text.secondary">
                Generierung läuft ({progress || 0}%) – verbraucht Runway-Credits.
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {status === 'done' && videoUrl && (
            <Box>
              <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8 }} />
              <Button href={videoUrl} target="_blank" rel="noopener" sx={{ mt: 1 }}>
                Video herunterladen / öffnen
              </Button>
              <Typography variant="caption" display="block" color="text.secondary">
                Dauerhaft gespeichert (Supabase Storage).
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
