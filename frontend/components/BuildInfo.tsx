"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { Info, GitBranch, Calendar } from 'lucide-react';

interface BuildInfo {
  buildId: string;
  timestamp: string;
  environment: string;
  version: string;
}

export default function BuildInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildInfo = async () => {
      try {
        // Fallback auf statische Daten
        setBuildInfo({
          buildId: 'dev-build',
          timestamp: new Date().toISOString(),
          environment: 'development',
          version: '1.0.0'
        });
        setLoading(false);
        return;
        
        // Versuche zuerst die Frontend-Health-API
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setBuildInfo({
            buildId: data.buildId,
            timestamp: data.timestamp,
            environment: data.environment,
            version: data.version
          });
        } else {
          // Fallback auf Environment-Variable
          setBuildInfo({
            buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'BUILD-UNKNOWN',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
          });
        }
      } catch (error) {
        // Fallback auf Environment-Variable
        setBuildInfo({
          buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'BUILD-UNKNOWN',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBuildInfo();
  }, []);

  if (loading) {
    return null;
  }

  if (!buildInfo) {
    return null;
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'flex-end'
      }}
    >
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Build-Informationen
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Build ID:</strong> {buildInfo.buildId}
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Version:</strong> {buildInfo.version}
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Environment:</strong> {buildInfo.environment}
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Build Zeit:</strong> {formatTimestamp(buildInfo.timestamp)}
            </Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <Chip
          icon={<GitBranch size={14} />}
          label={buildInfo.buildId}
          size="small"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
            '& .MuiChip-icon': {
              color: '#FFD700',
            }
          }}
        />
      </Tooltip>
      
      <Chip
        icon={<Calendar size={12} />}
        label={formatTimestamp(buildInfo.timestamp)}
        size="small"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.7rem',
          '& .MuiChip-icon': {
            color: 'rgba(255, 255, 255, 0.6)',
          }
        }}
      />
    </Box>
  );
}
