"use client";
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDarkMode ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
          },
        }}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
