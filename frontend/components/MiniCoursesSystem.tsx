"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Badge, LinearProgress, Slider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Download, Bookmark, Share2, Star, Clock, Users, Award, CheckCircle, ArrowRight, RotateCcw, Settings, Maximize2, Minimize2, SkipBack, SkipForward, Heart, Moon, Zap, Eye, Flame } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface MiniCourse {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'interactive' | 'text';
  category: 'energy' | 'relationships' | 'career' | 'spirituality' | 'health' | 'creativity' | 'basics';
  instructor: {
    name: string;
    avatar: string;
    hdType: string;
    profile: string;
    bio: string;
    rating: number;
  };
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  price: number;
  currency: string;
  rating: number;
  totalRatings: number;
  students: number;
  language: string;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  modules: CourseModule[];
  isCompleted: boolean;
  progress: number;
  lastWatched?: Date;
  color: string;
  icon: string;
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  transcript?: string;
  resources: string[];
  certificate: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'text' | 'quiz' | 'exercise';
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
  content: string;
  resources: string[];
}

const mockCourses: MiniCourse[] = [
  {
    id: '1',
    title: 'Human Design Grundlagen - Der Einstieg',
    description: 'Lerne die Grundlagen des Human Design Systems kennen. Entdecke deinen Typ, deine Autorität und deine Strategie für ein authentisches Leben.',
    type: 'video',
    category: 'basics',
    instructor: {
      name: 'Dr. Sarah Miller',
      avatar: '/images/sarah.jpg',
      hdType: 'Generator',
      profile: '2/4',
      bio: 'Human Design Expertin mit 15+ Jahren Erfahrung',
      rating: 4.9
    },
    duration: 45,
    level: 'beginner',
    price: 29.99,
    currency: 'EUR',
    rating: 4.8,
    totalRatings: 1247,
    students: 3456,
    language: 'Deutsch',
    tags: ['Grundlagen', 'Human Design', 'Einstieg', 'Typ', 'Autorität'],
    prerequisites: ['Keine Vorkenntnisse erforderlich'],
    learningOutcomes: [
      'Verstehe die 5 Human Design Typen',
      'Erkenne deine Autorität',
      'Lerne deine Strategie zu leben',
      'Entdecke deine einzigartigen Gaben'
    ],
    modules: [
      {
        id: '1',
        title: 'Was ist Human Design?',
        description: 'Eine Einführung in das Human Design System',
        type: 'video',
        duration: 8,
        isCompleted: true,
        isLocked: false,
        content: 'video-content-1',
        resources: ['PDF-Guide', 'Übungsblatt']
      },
      {
        id: '2',
        title: 'Die 5 Typen verstehen',
        description: 'Generator, Projector, Manifestor, Reflector - was bedeutet das?',
        type: 'video',
        duration: 12,
        isCompleted: true,
        isLocked: false,
        content: 'video-content-2',
        resources: ['Typ-Übersicht', 'Quiz']
      },
      {
        id: '3',
        title: 'Autorität und Strategie',
        description: 'Wie treffe ich die richtigen Entscheidungen?',
        type: 'video',
        duration: 15,
        isCompleted: false,
        isLocked: false,
        content: 'video-content-3',
        resources: ['Entscheidungs-Guide']
      },
      {
        id: '4',
        title: 'Praktische Übungen',
        description: 'Wende dein Wissen in der Praxis an',
        type: 'exercise',
        duration: 10,
        isCompleted: false,
        isLocked: true,
        content: 'exercise-content',
        resources: ['Übungsbuch']
      }
    ],
    isCompleted: false,
    progress: 45,
    lastWatched: new Date('2024-01-15'),
    color: '#8B5CF6',
    icon: '📚',
    thumbnail: '/images/course-thumbnail-1.jpg',
    videoUrl: '/videos/human-design-basics.mp4',
    transcript: 'transcript-content',
    resources: ['PDF-Guide', 'Übungsbuch', 'Audio-Version'],
    certificate: true
  },
  {
    id: '2',
    title: 'Generator Energie-Meister',
    description: 'Für alle Generators: Lerne deine sakrale Energie optimal zu nutzen und authentisch zu leben. Entdecke deine natürlichen Energie-Zyklen.',
    type: 'audio',
    category: 'energy',
    instructor: {
      name: 'Michael Chen',
      avatar: '/images/michael.jpg',
      hdType: 'Generator',
      profile: '3/5',
      bio: 'Energie-Experte und Generator-Coach',
      rating: 4.7
    },
    duration: 60,
    level: 'intermediate',
    price: 39.99,
    currency: 'EUR',
    rating: 4.6,
    totalRatings: 892,
    students: 2134,
    language: 'Deutsch',
    tags: ['Generator', 'Energie', 'Sakrale Autorität', 'Work-Life-Balance'],
    prerequisites: ['Human Design Grundlagen', 'Generator Typ'],
    learningOutcomes: [
      'Erkenne deine sakrale Energie',
      'Nutze deine Energie optimal',
      'Vermeide Energie-Räuber',
      'Lebst authentisch als Generator'
    ],
    modules: [
      {
        id: '1',
        title: 'Sakrale Energie verstehen',
        description: 'Was ist sakrale Energie und wie funktioniert sie?',
        type: 'audio',
        duration: 15,
        isCompleted: false,
        isLocked: false,
        content: 'audio-content-1',
        resources: ['Energie-Guide']
      },
      {
        id: '2',
        title: 'Energie-Zyklen erkennen',
        description: 'Lerne deine natürlichen Energie-Zyklen zu verstehen',
        type: 'audio',
        duration: 20,
        isCompleted: false,
        isLocked: true,
        content: 'audio-content-2',
        resources: ['Zyklus-Tracker']
      },
      {
        id: '3',
        title: 'Praktische Anwendung',
        description: 'Wie wende ich das Wissen im Alltag an?',
        type: 'audio',
        duration: 25,
        isCompleted: false,
        isLocked: true,
        content: 'audio-content-3',
        resources: ['Tagesplaner']
      }
    ],
    isCompleted: false,
    progress: 0,
    color: '#10B981',
    icon: '⚡',
    thumbnail: '/images/course-thumbnail-2.jpg',
    audioUrl: '/audio/generator-energy-master.mp3',
    transcript: 'transcript-content',
    resources: ['Audio-Guide', 'Energie-Tracker', 'Tagesplaner'],
    certificate: true
  },
  {
    id: '3',
    title: 'Dating nach Human Design',
    description: 'Entdecke, wie Human Design dir bei der Partnersuche und in Beziehungen helfen kann. Lerne kompatible Partner zu erkennen.',
    type: 'interactive',
    category: 'relationships',
    instructor: {
      name: 'Luna Rodriguez',
      avatar: '/images/luna.jpg',
      hdType: 'Projector',
      profile: '2/4',
      bio: 'Beziehungsexpertin und Human Design Beraterin',
      rating: 4.8
    },
    duration: 90,
    level: 'intermediate',
    price: 49.99,
    currency: 'EUR',
    rating: 4.7,
    totalRatings: 654,
    students: 1876,
    language: 'Deutsch',
    tags: ['Dating', 'Beziehungen', 'Kompatibilität', 'Human Design'],
    prerequisites: ['Human Design Grundlagen', 'Interesse an Beziehungen'],
    learningOutcomes: [
      'Verstehe Kompatibilität im Human Design',
      'Erkenne passende Partner',
      'Verbessere deine Beziehungen',
      'Nutze Human Design für Dating'
    ],
    modules: [
      {
        id: '1',
        title: 'Kompatibilität verstehen',
        description: 'Wie funktioniert Kompatibilität im Human Design?',
        type: 'exercise',
        duration: 25,
        isCompleted: false,
        isLocked: false,
        content: 'interactive-content-1',
        resources: ['Kompatibilitäts-Guide']
      },
      {
        id: '2',
        title: 'Dating-Strategien',
        description: 'Praktische Tipps für das Dating',
        type: 'exercise',
        duration: 30,
        isCompleted: false,
        isLocked: true,
        content: 'interactive-content-2',
        resources: ['Dating-Checkliste']
      },
      {
        id: '3',
        title: 'Beziehungen vertiefen',
        description: 'Wie baue ich tiefe Verbindungen auf?',
        type: 'exercise',
        duration: 35,
        isCompleted: false,
        isLocked: true,
        content: 'interactive-content-3',
        resources: ['Beziehungs-Guide']
      }
    ],
    isCompleted: false,
    progress: 0,
    color: '#EF4444',
    icon: '💖',
    thumbnail: '/images/course-thumbnail-3.jpg',
    resources: ['Interaktiver Guide', 'Dating-Templates', 'Kompatibilitäts-Test'],
    certificate: true
  }
];

const getCourseTypeIcon = (type: MiniCourse['type']) => {
  switch (type) {
    case 'video':
      return <Play size={20} />;
    case 'audio':
      return <Volume2 size={20} />;
    case 'interactive':
      return <Star size={20} />;
    case 'text':
      return <Bookmark size={20} />;
    default:
      return <Play size={20} />;
  }
};

const getCategoryIcon = (category: MiniCourse['category']) => {
  switch (category) {
    case 'energy':
      return <Star size={16} />;
    case 'relationships':
      return <Heart size={16} />;
    case 'career':
      return <Award size={16} />;
    case 'spirituality':
      return <Moon size={16} />;
    case 'health':
      return <Heart size={16} />;
    case 'creativity':
      return <Star size={16} />;
    case 'basics':
      return <Bookmark size={16} />;
    default:
      return <Star size={16} />;
  }
};

const getLevelColor = (level: MiniCourse['level']) => {
  switch (level) {
    case 'beginner':
      return '#22c55e';
    case 'intermediate':
      return '#f59e0b';
    case 'advanced':
      return '#8b5cf6';
    case 'all':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

const getHdTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'generator':
      return <Zap size={16} />;
    case 'projector':
      return <Eye size={16} />;
    case 'manifestor':
      return <Flame size={16} />;
    case 'reflector':
      return <Moon size={16} />;
    default:
      return <Users size={16} />;
  }
};

const getHdTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'generator':
      return '#10B981';
    case 'projector':
      return '#8B5CF6';
    case 'manifestor':
      return '#F59E0B';
    case 'reflector':
      return '#06B6D4';
    default:
      return '#6B7280';
  }
};

export default function MiniCoursesSystem() {
  const [courses, setCourses] = useState<MiniCourse[]>(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<MiniCourse | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved courses
    const saved = localStorage.getItem('saved-mini-courses');
    if (saved) {
      setSavedCourses(JSON.parse(saved));
    }
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesType = filterType === 'all' || course.type === filterType;
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const handleCourseSelect = (course: MiniCourse) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleStartCourse = (course: MiniCourse) => {
    const firstModule = course.modules.find(m => !m.isLocked);
    if (firstModule) {
      setCurrentModule(firstModule);
      setShowPlayer(true);
      setShowCourseDetails(false);
      addNotification({
        type: 'success',
        title: '🎓 Kurs gestartet!',
        message: `Du hast ${course.title} gestartet!`,
      });
    }
  };

  const handleSaveCourse = (courseId: string) => {
    const newSaved = [...savedCourses, courseId];
    setSavedCourses(newSaved);
    localStorage.setItem('saved-mini-courses', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Kurs wurde zu deinen Favoriten hinzugefügt!',
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    setCurrentTime(newValue as number);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          p: 3,
          mb: 4
        }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
            🔍 Filter
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label="Alle Kurse"
              onClick={() => setFilterType('all')}
              color={filterType === 'all' ? 'primary' : 'default'}
              variant={filterType === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Videos"
              onClick={() => setFilterType('video')}
              color={filterType === 'video' ? 'primary' : 'default'}
              variant={filterType === 'video' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Audio"
              onClick={() => setFilterType('audio')}
              color={filterType === 'audio' ? 'primary' : 'default'}
              variant={filterType === 'audio' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Interaktiv"
              onClick={() => setFilterType('interactive')}
              color={filterType === 'interactive' ? 'primary' : 'default'}
              variant={filterType === 'interactive' ? 'filled' : 'outlined'}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Alle Kategorien"
              onClick={() => setFilterCategory('all')}
              color={filterCategory === 'all' ? 'primary' : 'default'}
              variant={filterCategory === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Grundlagen"
              onClick={() => setFilterCategory('basics')}
              color={filterCategory === 'basics' ? 'primary' : 'default'}
              variant={filterCategory === 'basics' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Energie"
              onClick={() => setFilterCategory('energy')}
              color={filterCategory === 'energy' ? 'primary' : 'default'}
              variant={filterCategory === 'energy' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Beziehungen"
              onClick={() => setFilterCategory('relationships')}
              color={filterCategory === 'relationships' ? 'primary' : 'default'}
              variant={filterCategory === 'relationships' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Karriere"
              onClick={() => setFilterCategory('career')}
              color={filterCategory === 'career' ? 'primary' : 'default'}
              variant={filterCategory === 'career' ? 'filled' : 'outlined'}
            />
          </Box>
        </Card>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid container spacing={3}>
          {filteredCourses.map((course, index) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${course.color}15, ${course.color}05)`,
                    border: `1px solid ${course.color}30`,
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 30px ${course.color}20`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Course Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h3">
                        {course.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          {course.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getCourseTypeIcon(course.type)}
                          <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                            {course.type}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Course Description */}
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.4 }}>
                      {course.description}
                    </Typography>

                    {/* Instructor Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        src={course.instructor.avatar}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {course.instructor.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getHdTypeIcon(course.instructor.hdType)}
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {course.instructor.hdType} {course.instructor.profile}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Course Details */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Clock size={16} />}
                        label={`${course.duration} Min`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'text.primary',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        icon={<Users size={16} />}
                        label={`${course.students} Studenten`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'text.primary',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        label={course.level}
                        size="small"
                        sx={{
                          backgroundColor: `${getLevelColor(course.level)}20`,
                          color: getLevelColor(course.level),
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    {/* Rating and Price */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star size={16} color="#f59e0b" />
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {course.rating} ({course.totalRatings})
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: course.price === 0 ? 'success.main' : 'text.primary' }}>
                        {course.price === 0 ? 'Kostenlos' : `${course.price} ${course.currency}`}
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    {course.progress > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Fortschritt
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {course.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: course.color,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleStartCourse(course)}
                        sx={{
                          flex: 1,
                          backgroundColor: course.color,
                          '&:hover': {
                            backgroundColor: course.color,
                            opacity: 0.9,
                          },
                        }}
                      >
                        {course.progress > 0 ? 'Fortsetzen' : 'Starten'}
                      </Button>
                      <IconButton
                        onClick={() => handleSaveCourse(course.id)}
                        sx={{ color: savedCourses.includes(course.id) ? 'primary.main' : 'text.secondary' }}
                      >
                        <Bookmark size={16} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleCourseSelect(course)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Star size={16} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Course Details Dialog */}
      <Dialog
        open={showCourseDetails}
        onClose={() => setShowCourseDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {selectedCourse?.icon} {selectedCourse?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {selectedCourse?.type} • {selectedCourse?.level} • {selectedCourse?.duration} Min
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}>
            {selectedCourse?.description}
          </Typography>

          <Grid container spacing={3}>
            {/* Instructor Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                👨‍🏫 Instructor:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={selectedCourse?.instructor.avatar}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedCourse?.instructor.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getHdTypeIcon(selectedCourse?.instructor.hdType || '')}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {selectedCourse?.instructor.hdType} {selectedCourse?.instructor.profile}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedCourse?.instructor.bio}
              </Typography>
            </Grid>

            {/* Course Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📚 Kurs-Details:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Clock size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dauer" 
                    secondary={`${selectedCourse?.duration} Minuten`} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Users size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Studenten" 
                    secondary={`${selectedCourse?.students} Teilnehmer`} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Star size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Bewertung" 
                    secondary={`${selectedCourse?.rating} (${selectedCourse?.totalRatings} Bewertungen)`} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Award size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Zertifikat" 
                    secondary={selectedCourse?.certificate ? 'Ja' : 'Nein'} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Modules */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📋 Kurs-Module:
              </Typography>
              <List dense>
                {selectedCourse?.modules.map((module, index) => (
                  <ListItem key={module.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Box sx={{ position: 'relative' }}>
                        <Typography variant="body2" sx={{ 
                          color: 'primary.main', 
                          fontWeight: 600,
                          minWidth: 24,
                          textAlign: 'center'
                        }}>
                          {index + 1}
                        </Typography>
                        {module.isCompleted && (
                          <CheckCircle 
                            size={12} 
                            color="#22c55e" 
                            style={{ 
                              position: 'absolute', 
                              top: -3, 
                              right: -3,
                              backgroundColor: 'white',
                              borderRadius: '50%'
                            }} 
                          />
                        )}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary',
                          opacity: module.isLocked ? 0.5 : 1
                        }}>
                          {module.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {module.description}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary',
                            display: 'block'
                          }}>
                            {module.duration} Min • {module.type}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Learning Outcomes */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                ✅ Lernziele:
              </Typography>
              <List dense>
                {selectedCourse?.learningOutcomes.map((outcome, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle size={16} color="#22c55e" />
                    </ListItemIcon>
                    <ListItemText primary={outcome} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Prerequisites */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                📋 Voraussetzungen:
              </Typography>
              <List dense>
                {selectedCourse?.prerequisites.map((prereq, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Bookmark size={16} color="#f59e0b" />
                    </ListItemIcon>
                    <ListItemText primary={prereq} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => {
              if (selectedCourse) {
                handleStartCourse(selectedCourse);
              }
            }} 
            variant="contained"
            sx={{
              backgroundColor: selectedCourse?.color,
              '&:hover': {
                backgroundColor: selectedCourse?.color,
                opacity: 0.9,
              },
            }}
          >
            {(selectedCourse?.progress || 0) > 0 ? 'Fortsetzen' : 'Kurs starten'}
          </Button>
          <Button onClick={() => setShowCourseDetails(false)} variant="outlined">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video/Audio Player Dialog */}
      <Dialog
        open={showPlayer}
        onClose={() => setShowPlayer(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {currentModule?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {selectedCourse?.title} • {currentModule?.duration} Min
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Player Area */}
            <Box sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #0F0F23, #1A1A2E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
                🎥 {currentModule?.type === 'video' ? 'Video Player' : 'Audio Player'}
                <br />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {currentModule?.title}
                </Typography>
              </Typography>
              
              {/* Player Controls */}
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                background: 'rgba(0,0,0,0.8)',
                borderRadius: 2,
                p: 2
              }}>
                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Slider
                    value={currentTime}
                    onChange={handleSeek}
                    max={duration}
                    sx={{
                      color: selectedCourse?.color || '#8B5CF6',
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {formatTime(currentTime)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {formatTime(duration)}
                    </Typography>
                  </Box>
                </Box>

                {/* Control Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                    sx={{ color: 'white' }}
                  >
                    <SkipBack size={20} />
                  </IconButton>
                  
                  <IconButton
                    onClick={handlePlayPause}
                    sx={{ 
                      backgroundColor: selectedCourse?.color || '#8B5CF6',
                      color: 'white',
                      '&:hover': { backgroundColor: selectedCourse?.color || '#8B5CF6', opacity: 0.9 }
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </IconButton>
                  
                  <IconButton
                    onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                    sx={{ color: 'white' }}
                  >
                    <SkipForward size={20} />
                  </IconButton>

                  <Box sx={{ flex: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      onClick={() => setIsMuted(!isMuted)}
                      sx={{ color: 'white' }}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </IconButton>
                    
                    <Box sx={{ width: 100 }}>
                      <Slider
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        max={100}
                        sx={{
                          color: 'white',
                          '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <IconButton
                    onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : 1)}
                    sx={{ color: 'white' }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      {playbackRate}x
                    </Typography>
                  </IconButton>

                  <IconButton
                    onClick={() => setCurrentTime(0)}
                    sx={{ color: 'white' }}
                  >
                    <RotateCcw size={20} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
