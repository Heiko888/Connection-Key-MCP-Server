"use client";
import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default class ClientErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err?: Error }
> {
  state = { err: undefined as Error | undefined };
  
  static getDerivedStateFromError(err: Error) { 
    return { err }; 
  }
  
  componentDidCatch(err: Error, info: any) { 
    console.error("Client crash:", err, info);
  }
  
  handleRetry = () => {
    this.setState({ err: undefined });
  }
  
  handleGoHome = () => {
    window.location.href = '/';
  }
  
  render() {
    if (this.state.err) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <AlertTriangle size={64} color="#ff6b9d" style={{ marginBottom: 16 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#ff6b9d' }}>
              Oops! Etwas ist schiefgelaufen
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
              Die App ist auf einen Fehler gestoßen. Keine Sorge, das passiert manchmal.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<RotateCcw size={20} />}
                onClick={this.handleRetry}
                sx={{
                  background: 'linear-gradient(45deg, #ff6b9d, #4ecdc4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #e55a8a, #3bb5b0)'
                  }
                }}
              >
                Erneut versuchen
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home size={20} />}
                onClick={this.handleGoHome}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Zur Startseite
              </Button>
            </Box>
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Entwicklungsfehler:
                </Typography>
                <pre style={{ 
                  color: '#ff6b9d', 
                  fontSize: '12px', 
                  marginTop: 8,
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {String(this.state.err)}
                </pre>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }
    return this.props.children;
  }
}
