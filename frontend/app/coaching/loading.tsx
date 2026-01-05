import { Box, CircularProgress, Typography } from '@mui/material';
import Image from 'next/image';

export default function CoachingLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(1200px 600px at 50% 10%, rgba(242,159,5,0.08), transparent), linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)',
        gap: 4,
        padding: 3
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: { xs: 250, sm: 350, md: 450 },
          height: { xs: 120, sm: 160, md: 200 },
          mb: 2
        }}
      >
        <Image
          src="/images/connection-key-optimized.png"
          alt="The Connection Key"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </Box>

      {/* Loading Spinner */}
      <CircularProgress
        size={70}
        thickness={4}
        sx={{
          color: '#F29F05',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }}
      />

      {/* Loading Text */}
      <Typography
        variant="h6"
        sx={{
          color: '#F29F05',
          fontWeight: 600,
          textAlign: 'center'
        }}
      >
        Lade Coaching...
      </Typography>
    </Box>
  );
}

