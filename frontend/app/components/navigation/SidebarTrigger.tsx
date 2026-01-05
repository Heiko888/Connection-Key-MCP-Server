'use client';

import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Menu } from 'lucide-react';
import FloatingSidebar from './FloatingSidebar';

export default function SidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          color: '#FFB347',
          p: 1.5,
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 179, 71, 0.1)',
            transform: 'scale(1.05)',
          },
        }}
      >
        <Menu size={26} />
      </IconButton>
      <FloatingSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}

