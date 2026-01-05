"use client";

import React, { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Box, Card, CardContent, Typography, Avatar, Chip, IconButton, Button } from '@mui/material';
import { Heart, X, Star, MessageCircle, MapPin, Calendar, Zap, Eye } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  hdType: string;
  hdProfile: string;
  compatibilityScore: number;
  interests: string[];
  definedCenters: string[];
  definedChannels: string[];
}

interface ModernSwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onSuperLike: () => void;
  isTop: boolean;
}

const ModernSwipeCard: React.FC<ModernSwipeCardProps> = ({
  profile,
  onSwipe,
  onSuperLike,
  isTop
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values für Rotation und Skalierung
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const scale = useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]);
  const opacity = useTransform(x, [-300, 0, 300], [0.5, 1, 0.5]);
  
  // Haptic Feedback (falls unterstützt)
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      
      // Haptic Feedback
      triggerHaptic('medium');
      
      // Animation starten
      setIsAnimating(true);
      
      // Swipe-Animation
      x.set(direction === 'right' ? 1000 : -1000);
      
      setTimeout(() => {
        onSwipe(direction);
        setIsAnimating(false);
      }, 300);
    } else {
      // Zurück zur Mitte
      x.set(0);
      y.set(0);
    }
  };

  const handleLike = () => {
    triggerHaptic('light');
    setIsAnimating(true);
    x.set(1000);
    setTimeout(() => {
      onSwipe('right');
      setIsAnimating(false);
    }, 300);
  };

  const handlePass = () => {
    triggerHaptic('light');
    setIsAnimating(true);
    x.set(-1000);
    setTimeout(() => {
      onSwipe('left');
      setIsAnimating(false);
    }, 300);
  };

  const handleSuperLike = () => {
    triggerHaptic('heavy');
    onSuperLike();
  };

  const nextImage = () => {
    if (currentImageIndex < profile.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex: isTop ? 10 : 5
      }}
      drag={isTop && !isAnimating}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ 
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
      className="swipe-card"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card
        sx={{
          width: 350,
          height: 600,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
          cursor: isTop ? 'grab' : 'default',
          '&:active': {
            cursor: isTop ? 'grabbing' : 'default'
          }
        }}
      >
        {/* Bild-Galerie */}
        <Box
          sx={{
            height: '60%',
            position: 'relative',
            backgroundImage: `url(${profile.images[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          {/* Bild-Navigation */}
          {profile.images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' }
                }}
              >
                <Eye size={20} />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' }
                }}
              >
                <Eye size={20} />
              </IconButton>
            </>
          )}

          {/* Kompatibilitäts-Score */}
          <Chip
            label={`${profile.compatibilityScore}% Match`}
            sx={{
              backgroundColor: profile.compatibilityScore > 80 ? '#4CAF50' : 
                              profile.compatibilityScore > 60 ? '#FF9800' : '#F44336',
              color: 'white',
              fontWeight: 'bold'
            }}
          />

          {/* Bild-Indikatoren */}
          {profile.images.length > 1 && (
            <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}>
              {profile.images.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    display: 'inline-block',
                    margin: '0 2px'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Profil-Informationen */}
        <CardContent sx={{ height: '40%', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mr: 1 }}>
                {profile.name}, {profile.age}
              </Typography>
              <MapPin size={16} color="white" />
              <Typography variant="body2" sx={{ color: 'white', ml: 0.5 }}>
                {profile.location}
              </Typography>
            </Box>

            {/* HD-Informationen */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={profile.hdType}
                size="small"
                sx={{ backgroundColor: '#8B5CF6', color: 'white' }}
              />
              <Chip
                label={profile.hdProfile}
                size="small"
                sx={{ backgroundColor: '#F59E0B', color: 'white' }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
              {profile.bio}
            </Typography>

            {/* Interessen */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {profile.interests.slice(0, 3).map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              ))}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton
              onClick={handlePass}
              sx={{
                backgroundColor: '#F44336',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': { backgroundColor: '#D32F2F' }
              }}
            >
              <X size={24} />
            </IconButton>

            <IconButton
              onClick={handleSuperLike}
              sx={{
                backgroundColor: '#2196F3',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': { backgroundColor: '#1976D2' }
              }}
            >
              <Star size={20} />
            </IconButton>

            <IconButton
              onClick={handleLike}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': { backgroundColor: '#388E3C' }
              }}
            >
              <Heart size={24} />
            </IconButton>
          </Box>
        </CardContent>

        {/* Swipe-Hinweise */}
        {isTop && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              opacity: 0.7
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
              ← Swipe links zum Passen
              <br />
              Swipe rechts zum Liken →
            </Typography>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

export default ModernSwipeCard;
