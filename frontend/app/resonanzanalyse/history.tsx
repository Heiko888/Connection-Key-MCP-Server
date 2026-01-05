"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Button, CircularProgress } from "@mui/material";
import { Sparkles, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReadingHistoryPage() {
  type Reading = {
    _id: string;
    createdAt: string;
    text?: string;
    content?: string;
    // add other fields if needed
  };
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // UserId aus Token holen
  const [userId, setUserId] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        // Keine Authentifizierung erforderlich - App ist öffentlich
        return;
      }
      try {
        const { safeJsonParse } = await import('@/lib/utils/safeJson');
        const base64Payload = token.split('.')[1];
        if (base64Payload) {
          const payload = safeJsonParse<any>(atob(base64Payload), null);
          if (payload && payload.userId) {
            setUserId(payload.userId);
          }
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function fetchReadings() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        const res = await fetch(`${apiUrl}/api/readings?userId=${userId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        
        if (!res.ok) {
          const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
          const errorMessage = await parseErrorResponse(res, "Fehler beim Laden der Readings.");
          setError(errorMessage);
          setReadings([]);
          return;
        }
        
        const data = await res.json();
        if (data.error) {
          setError(data.error || "Fehler beim Laden der Readings.");
          setReadings([]);
        } else {
          setReadings(data);
        }
      } catch {
        setError("Server nicht erreichbar.");
        setReadings([]);
      }
      setLoading(false);
    }
    fetchReadings();
  }, [userId]);

  return (
    <>
      <Box sx={{ maxWidth: 700, mx: "auto", py: 7, px: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#eab308', textShadow: '0 2px 12px #7c3aed' }}>
          <Sparkles style={{ color: '#eab308', marginRight: 8, fontSize: 32 }} /> Deine Reading-Historie
        </Typography>
        {loading && <CircularProgress sx={{ color: '#eab308', mb: 3 }} />}
        {error && <Typography sx={{ color: '#ef4444', fontWeight: 600, mb: 2 }}>{error}</Typography>}
        {readings.length === 0 && !loading && !error && (
          <Typography sx={{ color: '#fff', fontWeight: 500, mb: 2 }}>Keine Readings gefunden.</Typography>
        )}
        {readings.map((r) => (
          <Card key={r._id} sx={{ mb: 4, bgcolor: "#181820", color: "#f8fafc", borderRadius: 6, boxShadow: "0 4px 24px #eab30855", border: '1px solid #eab308' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#eab308', fontWeight: 700 }}>
                {new Date(r.createdAt).toLocaleString()} <Sparkles style={{ color: '#eab308', marginLeft: 8 }} />
              </Typography>
              <Box sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#f8fafc', letterSpacing: 0.2, px: 1 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.text || r.content || ''}</ReactMarkdown>
              </Box>
              <Button
                variant="outlined"
                sx={{ mt: 3, color: '#eab308', borderColor: '#eab308', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#eab308', color: '#23233a' } }}
                startIcon={<Download style={{marginRight:4}}/>}
                onClick={async () => {
                  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                  const res = await fetch(`${apiUrl}/reading/${r._id}/pdf`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  });
                  if (!res.ok) {
                    const errorText = await res.text();
                    alert(`PDF konnte nicht geladen werden: ${res.status} ${errorText || ''}`);
                    return;
                  }
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Reading_${r._id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                }}
              >
                PDF herunterladen
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}
