'use client';

import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';

interface LogoProps {
  height?: number | { xs?: number; md?: number };
  width?: string | number | { xs?: string | number; md?: string | number };
  maxWidth?: number;
  mb?: number;
  priority?: boolean;
  sx?: any;
}

export default function Logo({
  height = { xs: 80, md: 180 },
  width = { xs: '100%', md: 600 },
  maxWidth = 600,
  mb = 6,
  priority = true,
  sx = {},
}: LogoProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);
  
  // Optimierte Logo-Versionen: Bevorzuge optimierte Versionen für bessere Ladezeiten
  // Reihenfolge: optimiertes PNG -> Original PNG -> Legacy
  const [logoSrc, setLogoSrc] = useState('/images/connection-key-optimized.png');
  const [useDirectImage, setUseDirectImage] = useState(false); // Wird in useEffect gesetzt
  const [errorCount, setErrorCount] = useState(0); // Verhindere Endlosschleifen

  // Warte auf Client-Side Mount, um Hydration-Mismatch zu vermeiden
  useEffect(() => {
    setMounted(true);
    setUseDirectImage(isMobile);
  }, [isMobile]);

  // Warte auf Client-Side Mount, um Hydration-Mismatch zu vermeiden
  if (!mounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb,
          ...sx,
        }}
      >
        <Box
          sx={{
            height: typeof height === 'object' ? height.xs : height,
            width: typeof width === 'object' ? width.xs : width,
            maxWidth,
            mx: 'auto',
          }}
        />
      </Box>
    );
  }

  // Auf Mobile oder bei Fehler: direktes <img> Tag verwenden
  if (useDirectImage) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb,
          ...sx,
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt="The Connection Key Logo"
          sx={{
            height: typeof height === 'object' ? { xs: height.xs, md: height.md } : height,
            width: typeof width === 'object' ? { xs: width.xs, md: width.md } : width,
            maxWidth,
            mx: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={(e) => {
            // Fallback-Kette: optimiertes PNG -> Original PNG -> Legacy
            // Verhindere Endlosschleifen
            if (errorCount >= 3) {
              console.error('Logo konnte nicht geladen werden, alle Fallbacks fehlgeschlagen');
              // Zeige Platzhalter an, damit Layout nicht zusammenbricht
              (e.target as HTMLImageElement).style.display = 'none';
              return;
            }
            setErrorCount(prev => prev + 1);
            if (logoSrc.includes('optimized')) {
              setLogoSrc('/images/connection-key-logo.png');
            } else if (logoSrc.includes('connection-key-logo.png')) {
              setLogoSrc('/images/Design%20ohne%20Titel(15).png');
            }
          }}
          onLoad={() => {
            // Stelle sicher, dass Bild angezeigt wird
            setErrorCount(0);
          }}
        />
      </Box>
    );
  }

  // Auf Desktop: Next.js Image-Komponente verwenden
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: typeof height === 'object' ? { xs: height.xs, md: height.md } : height,
          width: typeof width === 'object' ? { xs: width.xs, md: width.md } : width,
          maxWidth,
          mx: 'auto',
        }}
      >
        <Image
          src={logoSrc}
          alt="The Connection Key Logo"
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 100vw, 600px"
          priority={priority}
          unoptimized={true}
          onError={() => {
            // Fallback-Kette: optimiertes PNG -> Original PNG -> direktes <img>
            // Verhindere Endlosschleifen
            if (errorCount >= 3) {
              console.error('Logo konnte nicht geladen werden, alle Fallbacks fehlgeschlagen');
              setUseDirectImage(true);
              return;
            }
            setErrorCount(prev => prev + 1);
            if (logoSrc.includes('optimized')) {
              setLogoSrc('/images/connection-key-logo.png');
            } else if (logoSrc.includes('connection-key-logo.png')) {
              // Letzter Fallback: direktes <img> Tag
              setUseDirectImage(true);
            }
          }}
          onLoad={() => {
            // Stelle sicher, dass Bild angezeigt wird
            setErrorCount(0);
          }}
        />
      </Box>
    </Box>
  );
}

