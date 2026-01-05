"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Box, Container, Typography, Button, Paper, Stack } from "@mui/material";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    // Optional: Logging
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <AlertTriangle size={42} color="#F29F05" />
          </Box>
          <Typography variant="h4" sx={{ textAlign: "center", fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #F29F05, #8C1D04)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Unerwarteter Fehler
          </Typography>
          <Typography sx={{ textAlign: "center", color: 'text.secondary', mb: 3 }}>
            Etwas ist schiefgelaufen. Bitte versuche es erneut.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" startIcon={<RefreshCw size={18} />} onClick={() => reset()}>
              Neu laden
            </Button>
            <Button component={Link} href="/" variant="outlined" startIcon={<Home size={18} />}>Zur Startseite</Button>
          </Stack>

          {process.env.NODE_ENV !== 'production' && (
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
              {error?.message}
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}


