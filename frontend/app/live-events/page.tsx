"use client";
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import LiveEventsSystem from '@/components/LiveEventsSystem';
import UnifiedPageLayout from '@/components/UnifiedPageLayout';

export default function LiveEventsPage() {
  return (
    <UnifiedPageLayout
      title="🎥 Live Events"
      subtitle="Nimm teil an Live-Workshops, Q&A Sessions und Meditationssessions"
    >
      {/* Live Events System Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <LiveEventsSystem />
      </motion.div>
    </UnifiedPageLayout>
  );
}
