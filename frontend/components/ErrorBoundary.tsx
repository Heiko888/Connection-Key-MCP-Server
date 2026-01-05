"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper, Alert } from '@mui/material';
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Error logging could be implemented here (e.g., Sentry, LogRocket)
      console.error('Production error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={24}
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3
              }}
            >
              <AlertTriangle 
                size={80} 
                color="#ef4444" 
                style={{ marginBottom: '1rem' }}
              />
              
              <Typography variant="h4" gutterBottom sx={{ color: '#1f2937', fontWeight: 700 }}>
                Oops! Etwas ist schiefgelaufen
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                Es ist ein unerwarteter Fehler aufgetreten. Das tut uns leid!
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, textAlign: 'left' }}
                  icon={<Bug size={20} />}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Entwickler-Info:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                    {this.state.error.message}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', mt: 1 }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RotateCcw size={20} />}
                  onClick={this.handleRetry}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8, #6b46c1)'
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
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5a67d8',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                >
                  Zur Startseite
                </Button>
              </Box>

              <Typography variant="caption" sx={{ color: '#9ca3af', mt: 3, display: 'block' }}>
                Wenn das Problem weiterhin besteht, wende dich an unseren Support.
              </Typography>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Convenience-Komponenten für häufige Anwendungsfälle
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={24}
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3
              }}
            >
              <AlertTriangle size={60} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <Typography variant="h5" gutterBottom sx={{ color: '#1f2937' }}>
                Authentifizierungsfehler
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                Es gab ein Problem mit der Anmeldung. Bitte melde dich erneut an.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/login'}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8, #6b46c1)'
                  }
                }}
              >
                Zur Anmeldung
              </Button>
            </Paper>
          </Container>
        </Box>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ApiErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              API-Fehler
            </Typography>
            <Typography variant="body2">
              Es gab ein Problem beim Laden der Daten. Bitte versuche es später erneut.
            </Typography>
          </Alert>
        </Box>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
