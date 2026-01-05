"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Heart,
  Star,
  X
} from 'lucide-react';

interface ProfileImage {
  id: string;
  url: string;
  is_primary: boolean;
  uploaded_at: string;
  order: number;
  alt_text?: string;
}

interface ProfileImageCarouselProps {
  images: ProfileImage[];
  name?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showThumbnails?: boolean;
  showIndicators?: boolean;
  height?: string | number;
  onImageClick?: (image: ProfileImage, index: number) => void;
  onLike?: (image: ProfileImage) => void;
  likedImages?: string[]; // Array of image IDs that are liked
  showLikeButton?: boolean;
  showFullscreen?: boolean;
}

const ProfileImageCarousel: React.FC<ProfileImageCarouselProps> = ({
  images,
  name,
  autoPlay = false,
  autoPlayInterval = 3000,
  showControls = true,
  showThumbnails = true,
  showIndicators = true,
  height = 400,
  onImageClick,
  onLike,
  likedImages = [],
  showLikeButton = false,
  showFullscreen = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, images.length, autoPlayInterval]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(images[currentIndex], currentIndex);
    } else if (showFullscreen) {
      setFullscreenImage(images[currentIndex].url);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(images[currentIndex]);
    }
  };

  if (!images || images.length === 0) {
    return (
      <Box sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Keine Bilder verfügbar
        </Typography>
      </Box>
    );
  }

  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const currentImage = sortedImages[currentIndex];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Carousel */}
      <Box sx={{
        position: 'relative',
        height,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Main Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', height: '100%' }}
        >
          <img
            src={currentImage.url}
            alt={currentImage.alt_text || `${name || 'Profil'} Bild ${currentIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: onImageClick || showFullscreen ? 'pointer' : 'default'
            }}
            onClick={handleImageClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </motion.div>

        {/* Primary Badge */}
        {currentImage.is_primary && (
          <Box sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255, 215, 0, 0.9)',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <Star size={14} style={{ color: '#000' }} />
            <Typography variant="caption" sx={{ color: '#000', fontWeight: 600 }}>
              Hauptbild
            </Typography>
          </Box>
        )}

        {/* Like Button */}
        {showLikeButton && (
          <Tooltip title={likedImages.includes(currentImage.id) ? "Gefällt mir nicht mehr" : "Gefällt mir"}>
            <IconButton
              onClick={handleLike}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: likedImages.includes(currentImage.id) 
                  ? 'rgba(239, 68, 68, 0.9)' 
                  : 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: likedImages.includes(currentImage.id) 
                    ? 'rgba(239, 68, 68, 1)' 
                    : 'rgba(0,0,0,0.8)'
                }
              }}
            >
              <Heart 
                size={20} 
                fill={likedImages.includes(currentImage.id) ? 'currentColor' : 'none'} 
              />
            </IconButton>
          </Tooltip>
        )}

        {/* Fullscreen Button */}
        {showFullscreen && (
          <Tooltip title="Vollbild">
            <IconButton
              onClick={() => setFullscreenImage(currentImage.url)}
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.8)'
                }
              }}
            >
              <Maximize2 size={18} />
            </IconButton>
          </Tooltip>
        )}

        {/* Navigation Controls */}
        {showControls && images.length > 1 && (
          <>
            <IconButton
              onClick={prevImage}
              sx={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.8)'
                }
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>
            
            <IconButton
              onClick={nextImage}
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.8)'
                }
              }}
            >
              <ChevronRight size={24} />
            </IconButton>
          </>
        )}

        {/* Play/Pause Button */}
        {images.length > 1 && (
          <Tooltip title={isPlaying ? "Pause" : "Abspielen"}>
            <IconButton
              onClick={togglePlayPause}
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.8)'
                }
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </IconButton>
          </Tooltip>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <Box sx={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.7)',
            borderRadius: 2,
            px: 2,
            py: 0.5
          }}>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              {currentIndex + 1} / {images.length}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 2
        }}>
          {sortedImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToImage(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? '#FFD700' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: index === currentIndex ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <Box sx={{
          display: 'flex',
          gap: 1,
          mt: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 4
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 2
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,215,0,0.5)',
            borderRadius: 2
          }
        }}>
          {sortedImages.map((image, index) => (
            <Box
              key={image.id}
              onClick={() => goToImage(index)}
              sx={{
                minWidth: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === currentIndex ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  borderColor: '#FFD700'
                }
              }}
            >
              <img
                src={image.url}
                alt={image.alt_text || `Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Fullscreen Dialog */}
      <Dialog
        open={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'rgba(0,0,0,0.95)',
            m: 0,
            maxHeight: '100vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setFullscreenImage(null)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.8)'
              }
            }}
          >
            <X size={24} />
          </IconButton>
          
          {fullscreenImage && (
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              style={{
                width: '100%',
                height: '100vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfileImageCarousel;
