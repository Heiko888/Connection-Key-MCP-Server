"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import AccessControl from '../components/AccessControl';

/**
 * SEITEN-TEMPLATE für die Human Design App
 * 
 * Dieses Template verwendet das einheitliche Pink/Teal-Design.
 * Kopiere diese Datei und benenne sie um für neue Seiten.
 * 
 * Das Design wird automatisch aus dem globalen Theme geladen.
 */

const TemplatePage: React.FC = () => {
  const router = useRouter();
  const [userSubscription] = useState<any>(null);

  return (
    <AccessControl 
      path="/template" 
      userSubscription={userSubscription}
      onUpgrade={() => router.push('/pricing')}
    >
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 8 } }}>
          
          {/* Header */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            py: { xs: 4, md: 6 }
          }}>
            <Typography
              variant="h2"
              sx={{
                background: 'linear-gradient(135deg, #ff6b9d, #c44569, #4ecdc4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                textShadow: '0 0 30px rgba(255, 107, 157, 0.3)'
              }}
            >
              Dein Seitentitel
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 3,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Dein Untertitel oder Beschreibung
            </Typography>
          </Box>

          {/* Main Content */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 3,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              p: 4
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(255, 107, 157, 0.2)',
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      Feature 1
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      Beschreibung deines Features
                    </Typography>
                    <Button 
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #ff6b9d, #c44569)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #ff5a8a, #b83a5a)',
                        }
                      }}
                    >
                      Action Button
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(78, 205, 196, 0.2)',
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      Feature 2
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      Beschreibung deines Features
                    </Typography>
                    <Button 
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(78, 205, 196, 0.5)',
                        color: '#4ecdc4',
                        '&:hover': {
                          borderColor: '#4ecdc4',
                          backgroundColor: 'rgba(78, 205, 196, 0.1)'
                        }
                      }}
                    >
                      Action Button
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Info Box */}
            <Card sx={{ 
              mt: 4, 
              background: 'rgba(78, 205, 196, 0.1)', 
              border: '1px solid rgba(78, 205, 196, 0.3)',
              borderRadius: 3
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                  💡 Wichtige Information
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Deine wichtigen Informationen oder Hinweise für den Nutzer.
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Container>
      </Box>
    </AccessControl>
  );
};

export default TemplatePage;

