"use client";
import React from 'react';
import { motion } from 'framer-motion';
import DatingImpulse from '@/components/DatingImpulse';
import UnifiedPageLayout from '@/components/UnifiedPageLayout';

export default function DatingImpulsePage() {
  return (
    <UnifiedPageLayout
      title="💕 Dating-Impulse"
      subtitle="Entdecke deine tägliche Dating-Energie und optimale Begegnungszeiten"
      maxWidth="lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DatingImpulse />
      </motion.div>
    </UnifiedPageLayout>
  );
}
