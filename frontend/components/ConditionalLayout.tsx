"use client";
import { useState, useEffect } from "react";
import CssBaseline from '@mui/material/CssBaseline';
// import SimpleMoonlightHeader from "./SimpleMoonlightHeader";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}


export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Header komplett entfernt

  // Während SSR oder vor dem Mount immer das gleiche Layout rendern
  if (!mounted) {
    return (
      <>
        <CssBaseline />
        <div style={{
          minHeight: '100vh',
          background: '#0f0f23',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <main style={{ 
            flex: 1
          }}>
            {children}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <div style={{
        minHeight: '100vh',
        background: '#0f0f23',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <main style={{ 
          flex: 1,
          paddingTop: '0'
        }}>
          {children}
        </main>
      </div>
    </>
  );
}
