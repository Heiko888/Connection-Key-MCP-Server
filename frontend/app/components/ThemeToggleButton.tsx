"use client";
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <Tooltip title={isDarkMode ? 'Hell' : 'Dunkel'}>
      <IconButton onClick={toggleTheme} sx={{ color: '#FFD700' }} aria-label="Theme umschalten">
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
    </Tooltip>
  );
}


