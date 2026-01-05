'use client';

import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
  fullScreen?: boolean;
  title?: string;
}

export default function ErrorState({ 
  error, 
  onRetry,
  fullScreen = false,
  title = "Fehler aufgetreten"
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        py: fullScreen ? 0 : 8,
        px: 2,
        minHeight: fullScreen ? '100vh' : 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          severity="error"
          icon={<AlertCircle size={24} />}
          sx={{
            maxWidth: 600,
            width: '100%',
            backgroundColor: 'rgba(140, 29, 4, 0.15)',
            border: '1px solid rgba(140, 29, 4, 0.3)',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#8C1D04',
            },
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <AlertTitle sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
            {title}
          </AlertTitle>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            {errorMessage}
          </Typography>
        </Alert>
      </motion.div>

      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            variant="contained"
            onClick={onRetry}
            startIcon={<RefreshCw size={18} />}
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.35)',
              },
            }}
          >
            Erneut versuchen
          </Button>
        </motion.div>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

