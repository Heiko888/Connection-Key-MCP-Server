"use client";
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Upload,
  X,
  Star,
  GripVertical,
  Delete,
  Edit,
  Image as ImageIcon,
  Plus,
  CheckCircle,
  AlertCircle as ErrorIcon
} from 'lucide-react';

interface ProfileImage {
  id: string;
  url: string;
  is_primary: boolean;
  uploaded_at: string;
  order: number;
  alt_text?: string;
}

interface MultiImageUploadProps {
  userId: string;
  existingImages?: ProfileImage[];
  onImagesUpdate?: (images: ProfileImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  userId,
  existingImages = [],
  onImagesUpdate,
  maxImages = 6,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [images, setImages] = useState<ProfileImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop Handler
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // File Selection Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // File Processing
  const handleFiles = async (files: File[]) => {
    setError(null);
    
    // Validation
    if (images.length + files.length > maxImages) {
      setError(`Maximal ${maxImages} Bilder erlaubt. Du hast bereits ${images.length} Bilder.`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!acceptedFormats.includes(file.type)) {
        setError(`Datei ${file.name} hat ein ungültiges Format. Erlaubt: ${acceptedFormats.join(', ')}`);
        return false;
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(`Datei ${file.name} ist zu groß. Maximum: ${maxFileSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const newImages: ProfileImage[] = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        // Simulate upload progress
        const progress = ((i + 1) / validFiles.length) * 100;
        setUploadProgress(progress);

        // Convert to base64 for demo (in real app, upload to server)
        const base64 = await fileToBase64(file);
        
        const newImage: ProfileImage = {
          id: Date.now().toString() + i,
          url: base64,
          is_primary: images.length === 0 && i === 0, // First image is primary if no existing images
          uploaded_at: new Date().toISOString(),
          order: images.length + i,
          alt_text: file.name.split('.')[0]
        };
        
        newImages.push(newImage);
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesUpdate?.(updatedImages);

      // Simulate API call
      await uploadToServer(newImages);
      
    } catch (err) {
      setError('Fehler beim Hochladen der Bilder');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Simulate server upload
  const uploadToServer = async (newImages: ProfileImage[]) => {
    try {
      const response = await fetch(`/api/user-profile/images/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: newImages.map(img => ({
            url: img.url,
            alt_text: img.alt_text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Server upload error:', error);
      // In demo mode, we continue with local images
    }
  };

  // Set primary image
  const setPrimaryImage = async (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }));
    
    setImages(updatedImages);
    onImagesUpdate?.(updatedImages);

    try {
      const response = await fetch(`/api/user-profile/images/${userId}/primary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: Fehler beim Setzen des Primärbilds`, errorText);
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
    }
  };

  // Delete image
  const deleteImage = async (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesUpdate?.(updatedImages);

    try {
      const response = await fetch(`/api/user-profile/images/${userId}/${imageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: Fehler beim Löschen des Bilds`, errorText);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Reorder images
  const reorderImages = async (newOrder: string[]) => {
    const updatedImages = images
      .map(img => ({
        ...img,
        order: newOrder.indexOf(img.id)
      }))
      .sort((a, b) => a.order - b.order);
    
    setImages(updatedImages);
    onImagesUpdate?.(updatedImages);

    try {
      const response = await fetch(`/api/user-profile/images/${userId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds: newOrder })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: Fehler beim Sortieren der Bilder`, errorText);
      }
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Upload Area */}
      <Card
        sx={{
          border: dragActive ? '2px dashed #FFD700' : '2px dashed rgba(255,255,255,0.3)',
          background: dragActive 
            ? 'rgba(255, 215, 0, 0.1)' 
            : 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#FFD700',
            background: 'rgba(255, 215, 0, 0.1)'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <motion.div
            animate={{ 
              scale: dragActive ? 1.1 : 1,
              rotate: dragActive ? 5 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload 
              size={48} 
              style={{ 
                color: dragActive ? '#FFD700' : 'rgba(255,255,255,0.6)',
                marginBottom: 16
              }} 
            />
          </motion.div>
          
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontWeight: 600 }}>
            {dragActive ? 'Bilder hier ablegen' : 'Bilder hochladen'}
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Drag & Drop oder klicken zum Auswählen
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip 
              label={`Max. ${maxImages} Bilder`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,215,0,0.2)', 
                color: '#FFD700',
                border: '1px solid rgba(255,215,0,0.3)'
              }} 
            />
            <Chip 
              label={`Max. ${maxFileSize}MB`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,215,0,0.2)', 
                color: '#FFD700',
                border: '1px solid rgba(255,215,0,0.3)'
              }} 
            />
            <Chip 
              label="JPG, PNG, WebP" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,215,0,0.2)', 
                color: '#FFD700',
                border: '1px solid rgba(255,215,0,0.3)'
              }} 
            />
          </Box>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#FFD700'
              }
            }}
          />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, textAlign: 'center' }}>
            Lade Bilder hoch... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontWeight: 600 }}>
            Deine Bilder ({images.length}/{maxImages})
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: 2 
          }}>
            <AnimatePresence>
              {images
                .sort((a, b) => a.order - b.order)
                .map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    overflow: 'hidden',
                    border: image.is_primary ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <img
                      src={image.url}
                      alt={image.alt_text || `Bild ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPreviewImage(image.url)}
                    />
                    
                    {/* Primary Badge */}
                    {image.is_primary && (
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: '#FFD700',
                        borderRadius: '50%',
                        p: 0.5
                      }}>
                        <Star size={16} style={{ color: '#000' }} />
                      </Box>
                    )}
                    
                    {/* Order Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      display: 'flex',
                      gap: 0.5
                    }}>
                      <Tooltip title={image.is_primary ? "Hauptbild" : "Als Hauptbild setzen"}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryImage(image.id);
                          }}
                          sx={{
                            bgcolor: image.is_primary ? '#FFD700' : 'rgba(0,0,0,0.7)',
                            color: image.is_primary ? '#000' : '#FFD700',
                            '&:hover': {
                              bgcolor: image.is_primary ? '#fbbf24' : 'rgba(0,0,0,0.8)'
                            }
                          }}
                        >
                          {image.is_primary ? <Star size={14} fill="currentColor" /> : <Star size={14} />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Löschen">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                          sx={{
                            bgcolor: 'rgba(239, 68, 68, 0.8)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 1)'
                            }
                          }}
                        >
                          <Delete size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'rgba(0,0,0,0.8)', 
          color: '#FFD700',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Bildvorschau
          <IconButton onClick={() => setPreviewImage(null)} sx={{ color: 'white' }}>
            <X size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'rgba(0,0,0,0.9)' }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MultiImageUpload;
