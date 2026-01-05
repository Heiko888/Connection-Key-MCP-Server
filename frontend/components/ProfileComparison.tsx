'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import { Users, Sparkles, X, Heart } from 'lucide-react';
import ConnectionKeyAnalyzer from './ConnectionKeyAnalyzer';
import { type CenterStatus, type HDType, type HDAuthority, type Strategy } from '@/lib/human-design';

interface Profile {
  _id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  hd_type: string;
  profile: string;
  authority: string;
  strategy?: string;
  image: string;
  interests: string[];
  compatibility_score: number;
}

interface ProfileComparisonProps {
  ownChartData: any;
  otherProfile: Profile;
  onSwipe: (liked: boolean) => void;
}

export default function ProfileComparison({
  ownChartData,
  otherProfile,
  onSwipe
}: ProfileComparisonProps) {
  const [person1Gates, setPerson1Gates] = useState<number[]>([]);
  const [person2Gates, setPerson2Gates] = useState<number[]>([]);
  const [person1Centers, setPerson1Centers] = useState<CenterStatus>({} as CenterStatus);
  const [person2Centers, setPerson2Centers] = useState<CenterStatus>({} as CenterStatus);

  useEffect(() => {
    // Extrahiere Gates für Person 1 (eigenes Chart)
    if (ownChartData) {
      const gates = ownChartData.gates || ownChartData.hdChart?.gates || ownChartData.hdChart?.activeGates || [];
      setPerson1Gates(gates.length > 0 ? gates : [1, 8, 13, 34, 10, 20, 57, 25, 51, 21]);
      
      // Extrahiere Centers
      const centers = ownChartData.centers || ownChartData.hdChart?.centers;
      if (centers && typeof centers === 'object') {
        setPerson1Centers(centers as CenterStatus);
      }
    }

    // Für Person 2 (fremdes Profil) - verwende Mock-Daten basierend auf Profil
    // In einer echten App würdest du die Gates aus dem Profil extrahieren
    const mockGates = [2, 7, 14, 33, 9, 19, 58, 26, 52, 22];
    setPerson2Gates(mockGates);
    
    // Mock Centers für Person 2
    setPerson2Centers({
      krone: 'definiert',
      ajna: 'definiert',
      kehle: 'offen',
      gZentrum: 'offen',
      herzEgo: 'definiert',
      sakral: 'offen',
      solarplexus: 'definiert',
      milz: 'offen',
      wurzel: 'offen'
    } as CenterStatus);
  }, [ownChartData, otherProfile]);

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Own Profile - Left */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.5)',
            borderRadius: 4,
            p: 3,
            height: '100%',
            minHeight: '500px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Users size={24} color="#F29F05" style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                Dein Profil
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                {ownChartData?.name || 'Du'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip 
                  label={ownChartData?.type || ownChartData?.hdChart?.type || 'Generator'} 
                  size="small" 
                  sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                />
                <Chip 
                  label={ownChartData?.profile || ownChartData?.hdChart?.profile || '1/3'} 
                  size="small" 
                  sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                />
                <Chip 
                  label={ownChartData?.authority || ownChartData?.hdChart?.authority || 'Sakral'} 
                  size="small" 
                  sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                />
              </Stack>
              <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                <strong>Gates:</strong> {person1Gates.slice(0, 10).join(', ')}{person1Gates.length > 10 ? '...' : ''}
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                {person1Gates.length} aktive Gates
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Other Profile - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            p: 3,
            height: '100%',
            minHeight: '500px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Users size={24} color="#F29F05" style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                {otherProfile.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                {otherProfile.name}, {otherProfile.age}
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                {otherProfile.location}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip 
                  label={otherProfile.hd_type} 
                  size="small" 
                  sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                />
                <Chip 
                  label={otherProfile.profile} 
                  size="small" 
                  sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                />
                <Chip 
                  label={otherProfile.authority} 
                  size="small" 
                  sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                />
              </Stack>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                  <strong>Kompatibilität:</strong> {otherProfile.compatibility_score}%
                </Typography>
                <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {otherProfile.bio}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1, fontWeight: 600 }}>
                  Interessen
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {otherProfile.interests.slice(0, 6).map((interest: string, idx: number) => (
                    <Chip 
                      key={idx}
                      label={interest} 
                      size="small" 
                      sx={{ background: 'rgba(242, 159, 5, 0.20)', color: '#F29F05', fontSize: '0.7rem', mb: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onSwipe(false)}
                sx={{
                  borderColor: 'rgba(140, 29, 4, 0.5)',
                  color: '#8C1D04',
                  '&:hover': {
                    borderColor: '#8C1D04',
                    background: 'rgba(140, 29, 4, 0.1)'
                  }
                }}
              >
                <X size={18} style={{ marginRight: 4 }} />
                Pass
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => onSwipe(true)}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                  }
                }}
              >
                <Heart size={18} style={{ marginRight: 4 }} />
                Like
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Connection Key Analysis - Full Width Below Profiles */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.5)',
            borderRadius: 4,
            p: 3,
            mt: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Sparkles size={24} color="#F29F05" style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                Connection Key Analyse
              </Typography>
            </Box>
            {person1Gates.length > 0 && person2Gates.length > 0 ? (
              <ConnectionKeyAnalyzer
                person1Gates={person1Gates}
                person2Gates={person2Gates}
                person1Centers={person1Centers}
                person2Centers={person2Centers}
                person1Type={(ownChartData?.type || ownChartData?.hdChart?.type || 'Generator') as HDType}
                person2Type={(otherProfile.hd_type || 'Generator') as HDType}
                person1Profile={ownChartData?.profile || ownChartData?.hdChart?.profile || '1/3'}
                person2Profile={otherProfile.profile || '1/3'}
                person1Authority={(ownChartData?.authority || ownChartData?.hdChart?.authority || 'Sakral') as HDAuthority}
                person2Authority={(otherProfile.authority || 'Sakral') as HDAuthority}
                person1Strategy={(ownChartData?.strategy || ownChartData?.hdChart?.strategy || 'Wait to Respond') as Strategy}
                person2Strategy={(otherProfile.strategy || 'Wait to Respond') as Strategy}
                person1Name={ownChartData?.name || 'Du'}
                person2Name={otherProfile.name}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Lade Connection Key Daten...
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

