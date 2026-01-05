"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton
} from '@mui/material';
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Filter,
  Search,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  PenTool,
  FileText,
  Sparkles,
  Eye,
  Heart,
  MessageCircle,
  Flame,
  Pentagon,
  Zap,
  Key,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/app/components/Logo';
import PublicHeader from '@/app/components/PublicHeader';

// Mock Blogartikel Daten
export const blogArticles = [
  {
    id: 1,
    slug: 'human-design-energetischer-blueprint',
    title: 'Human Design: Dein energetischer Blueprint',
    excerpt: 'Entdecke, wie dein Human Design Chart die tiefsten Muster deiner Persönlichkeit offenbart und dir hilft, authentisch zu leben.',
    author: 'The Connection Key Team',
    date: '2024-01-15',
    category: 'Human Design',
    readTime: '5 Min',
    image: '/blog/human-design.jpg'
  },
  {
    id: 2,
    slug: 'kraft-der-resonanzanalyse',
    title: '🔑 Energetische Resonanz verstehen',
    excerpt: 'Warum dich manche Menschen sofort berühren – und andere nie wirklich erreichen. Es gibt diese Begegnungen, die passieren scheinbar ohne Vorwarnung. Ein Blick. Ein Satz. Ein Moment.',
    author: 'The Connection Key Team',
    date: '2024-01-10',
    category: 'Resonanz',
    readTime: '7 Min',
    image: '/blog/resonanz.jpg'
  },
  {
    id: 3,
    slug: 'penta-analyse-gruppenenergie',
    title: 'Penta-Analyse – Die verborgene Kraft jeder kleinen Gruppe',
    excerpt: 'Eine kleine Gruppe (3–5 Personen) erzeugt eine eigene Energie, ein eigenes Feld – eine eigene Identität. Diese energetische Struktur nennt man Penta. Und sie beeinflusst jede Zusammenarbeit, jede Stimmung und jedes Ergebnis stärker, als jeder einzelne Charakter es je könnte.',
    author: 'The Connection Key Team',
    date: '2024-01-05',
    category: 'Penta',
    readTime: '12 Min',
    image: '/blog/penta.jpg'
  },
  {
    id: 4,
    slug: 'dating-mit-human-design',
    title: 'Dating mit Human Design',
    excerpt: 'Wie du Human Design nutzt, um authentische und erfüllende Beziehungen zu finden, die wirklich zu dir passen.',
    author: 'The Connection Key Team',
    date: '2024-01-01',
    category: 'Dating',
    readTime: '8 Min',
    image: '/blog/dating.jpg'
  },
  {
    id: 5,
    slug: '9-zentren-human-design',
    title: 'Die 9 Zentren im Human Design',
    excerpt: 'Ein tiefer Einblick in die 9 Energiezentren und wie sie dein Leben, deine Entscheidungen und deine Beziehungen beeinflussen.',
    author: 'The Connection Key Team',
    date: '2023-12-28',
    category: 'Grundlagen',
    readTime: '10 Min',
    image: '/blog/zentren.jpg'
  },
  {
    id: 6,
    slug: 'mondkalender-energie',
    title: 'Mondkalender und deine Energie',
    excerpt: 'Entdecke, wie die Mondphasen deine Energiezyklen beeinflussen und wie du sie optimal für dich nutzen kannst.',
    author: 'The Connection Key Team',
    date: '2023-12-25',
    category: 'Mondkalender',
    readTime: '6 Min',
    image: '/blog/mond.jpg'
  },
  {
    id: 7,
    slug: 'der-moment-in-dem-du-spuerst-das-wird-nix',
    title: 'Der Moment, in dem du spürst: Das wird nix.',
    excerpt: 'Eine wahre Geschichte über Dating, Mikro-Momente und warum dein Nervensystem manchmal lauter spricht als dein Verstand.',
    author: 'Jani',
    date: '2025-01-15',
    category: 'Dating',
    readTime: '5 Min',
    image: '/blog/dating.jpg'
  },
  {
    id: 8,
    slug: 'warum-drama-suechtig-macht',
    title: 'Warum Drama süchtig macht (biologisch & emotional)',
    excerpt: 'Drama fühlt sich lebendig an. Intensiv. Bedeutungsvoll. Und genau deshalb verwechseln es so viele mit Liebe. Drama ist kein Zufall – es ist Biologie.',
    author: 'The Connection Key Team',
    date: '2025-01-20',
    category: 'Dating',
    readTime: '7 Min',
    image: '/blog/dating.jpg'
  },
  {
    id: 9,
    slug: 'echte-resonanz-vs-trauma-anziehung',
    title: 'Echte Resonanz vs. Trauma-Anziehung – wie du den Unterschied wirklich spürst',
    excerpt: 'Viele sagen: "Ich weiß einfach nicht, warum mich das so anzieht." Doch. Dein Körper weiß es sehr genau. Was du erlebst, ist entweder Resonanz oder Trauma-Anziehung.',
    author: 'The Connection Key Team',
    date: '2025-01-20',
    category: 'Resonanz',
    readTime: '6 Min',
    image: '/blog/resonanz.jpg'
  },
  {
    id: 10,
    slug: 'wie-mann-und-frau-naehe-unterschiedlich-aufbauen',
    title: 'Wie Mann und Frau Nähe unterschiedlich aufbauen',
    excerpt: 'Viele Beziehungsprobleme entstehen nicht, weil keine Liebe da ist – sondern weil Nähe unterschiedlich hergestellt wird. Beide wollen Verbindung. Beide fühlen sich missverstanden.',
    author: 'The Connection Key Team',
    date: '2025-01-21',
    category: 'Dating',
    readTime: '6 Min',
    image: '/blog/dating.jpg'
  },
  {
    id: 11,
    slug: 'warum-rueckzug-oft-interesse-ist',
    title: 'Warum Rückzug oft Interesse ist – und wann definitiv nicht',
    excerpt: 'Rückzug ist eines der meistmissverstandenen Signale im Dating. Für die einen ist er ein Warnsignal. Für die anderen ein Hoffnungsträger. Die Wahrheit ist: Rückzug kann Interesse sein – oder emotionale Abwesenheit.',
    author: 'The Connection Key Team',
    date: '2025-01-21',
    category: 'Dating',
    readTime: '5 Min',
    image: '/blog/dating.jpg'
  },
  {
    id: 12,
    slug: 'online-dating-zeigt-nicht-dein-muster',
    title: 'Online-Dating zeigt nicht dein Muster – sondern dein Bewusstseinsniveau',
    excerpt: 'Online-Dating hat einen schlechten Ruf. Zu oberflächlich. Zu austauschbar. Zu unverbindlich. Zu toxisch. Und ja – es fühlt sich oft genau so an. Aber nicht, weil mit dir etwas nicht stimmt. Sondern weil Online-Dating etwas tut, was kaum jemand wirklich einordnen kann.',
    author: 'The Connection Key Team',
    date: '2025-01-22',
    category: 'Dating',
    readTime: '8 Min',
    image: '/blog/dating.jpg'
  }
];

export default function BlogartikelPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'readTime'>('date-desc');
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, width: number, height: number, opacity: number, duration: number, delay: number}>>([]);
  const [scrollY, setScrollY] = useState(0);

  // Nur client-seitig rendern, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setMounted(true);
    // Generiere Sterne-Positionen nur auf dem Client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStarPositions(stars);

    // ✨ PREMIUM: Scroll-Partikel-Animation
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Alle eindeutigen Kategorien extrahieren
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(blogArticles.map(article => article.category)));
    return uniqueCategories.sort();
  }, []);

  // Alle eindeutigen Autoren extrahieren
  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(blogArticles.map(article => article.author)));
    return uniqueAuthors.sort();
  }, []);

  // Artikel nach Kategorie, Autor und Suche filtern
  const filteredArticles = useMemo(() => {
    let articles = blogArticles;

    // Kategorie-Filter
    if (selectedCategory) {
      articles = articles.filter(article => article.category === selectedCategory);
    }

    // Autor-Filter
    if (selectedAuthor) {
      articles = articles.filter(article => article.author === selectedAuthor);
    }

    // Such-Filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.author.toLowerCase().includes(searchLower) ||
        article.category.toLowerCase().includes(searchLower)
      );
    }

    // Sortierung
    const sorted = [...articles].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title, 'de');
        case 'readTime':
          return parseInt(a.readTime) - parseInt(b.readTime);
        default:
          return 0;
      }
    });

    return sorted;
  }, [selectedCategory, selectedAuthor, searchTerm, sortBy]);

  // Anzahl der Artikel pro Kategorie
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    blogArticles.forEach(article => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Anzahl der Artikel pro Autor
  const authorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    blogArticles.forEach(article => {
      counts[article.author] = (counts[article.author] || 0) + 1;
    });
    return counts;
  }, []);

  // ✨ PREMIUM: Kategorie-Icons Mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Penta':
        return <Pentagon size={16} />;
      case 'Resonanz':
        return <Zap size={16} />;
      case 'Human Design':
        return <Key size={16} />;
      case 'Dating':
        return <Heart size={16} />;
      case 'Grundlagen':
        return <BookOpen size={16} />;
      case 'Mondkalender':
        return <Sparkles size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  // ✨ PREMIUM: Kategorie-spezifische Hintergrundfarben
  const getCategoryBackground = (category: string) => {
    switch (category) {
      case 'Dating':
        return 'linear-gradient(135deg, rgba(255, 140, 0, 0.12) 0%, rgba(255, 100, 0, 0.08) 100%)';
      case 'Resonanz':
        return 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(242, 200, 100, 0.10) 100%)';
      case 'Grundlagen':
        return 'linear-gradient(135deg, rgba(242, 159, 5, 0.10) 0%, rgba(140, 29, 4, 0.08) 100%)';
      case 'Human Design':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(242, 159, 5, 0.10) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(242, 159, 5, 0.08) 0%, rgba(140, 29, 4, 0.06) 100%)';
    }
  };

  // Social Sharing Funktionen
  const shareArticle = (article: typeof blogArticles[0], platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    if (typeof window === 'undefined') return;
    
    const url = `${window.location.origin}/blogartikel/${article.slug}`;
    const title = article.title;
    const text = article.excerpt;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      pt: { xs: 4, md: 6 },
      pb: 8,
    }}>
      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.width}px`,
            height: `${star.height}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
            zIndex: 0,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      {/* Animierte Planeten-Orbits - nur nach Mount */}
      {mounted && Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${0.1 - i * 0.02})`,
            left: `${20 + i * 20}%`,
            top: `${10 + i * 15}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsierende Planeten - nur nach Mount */}
      {mounted && Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${20 + i * 10}px`,
            height: `${20 + i * 10}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.1}), rgba(140, 29, 4, ${0.3 - i * 0.05}))`,
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
            zIndex: 0,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <PublicHeader />
        {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
        {/* ✨ PREMIUM: Hero-Bereich mit Animationen */}
        <Box sx={{ 
          mb: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          py: { xs: 4, md: 6 }
        }}>
          {/* Animierte Gold-Verläufe im Hintergrund */}
          {mounted && Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`glow-${i}`}
              style={{
                position: 'absolute',
                width: `${400 + i * 200}px`,
                height: `${400 + i * 200}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(242, 159, 5, ${0.15 - i * 0.04}), transparent)`,
                left: `${30 + i * 20}%`,
                top: `${-20 + i * 10}%`,
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i * 1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mini-Illustration */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
              style={{ display: 'inline-block', marginBottom: 16 }}
            >
              <Box sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                border: '3px solid rgba(242, 159, 5, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(242, 159, 5, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.1))',
                  filter: 'blur(12px)',
                  zIndex: -1,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.1)' }
                  }
                }
              }}>
                <BookOpen size={48} color="#F29F05" style={{ filter: 'drop-shadow(0 0 12px rgba(242, 159, 5, 0.8))' }} />
              </Box>
            </motion.div>

            <Typography variant="h1" sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2rem', md: '3.5rem' },
              letterSpacing: '0.02em',
              lineHeight: 1.2,
            }}>
              Blogartikel
            </Typography>
            
            {/* Zweizeilige Subline */}
            <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              <Typography variant="h5" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                mb: 1,
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.4rem' }
              }}>
                Tiefe Einblicke in Human Design, Resonanzanalyse & energetische Verbindungen.
              </Typography>
              <Typography variant="h5" sx={{ 
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', md: '1.3rem' },
                fontStyle: 'italic'
              }}>
                Entdecke Geschichten, Wissen & echte Transformation.
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* ✨ PREMIUM: Beliebteste Artikel Sektion */}
        {!selectedCategory && !selectedAuthor && !searchTerm && (
          <Box sx={{ mb: { xs: 8, md: 10 } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* ✨ PREMIUM: Section-Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 3,
                mb: { xs: 4, md: 6 },
                position: 'relative'
              }}>
                <Box sx={{
                  flex: 1,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
                  borderRadius: 1
                }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Flame size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
                  <Typography variant="h3" sx={{ 
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', md: '2.8rem' }
                  }}>
                    Beliebteste Artikel
                  </Typography>
                  <Flame size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
                </Box>
                <Box sx={{
                  flex: 1,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
                  borderRadius: 1
                }} />
              </Box>

              <Grid container spacing={{ xs: 3, md: 4 }}>
                {blogArticles.slice(0, 3).map((article, index) => (
                  <Grid item xs={12} md={4} key={article.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <Card sx={{
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                        backdropFilter: 'blur(25px)',
                        borderRadius: 4,
                        border: '2px solid rgba(242, 159, 5, 0.4)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #F29F05, #8C1D04, #F29F05)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 3s ease-in-out infinite',
                          '@keyframes shimmer': {
                            '0%': { backgroundPosition: '200% 0' },
                            '100%': { backgroundPosition: '-200% 0' }
                          }
                        },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 50px rgba(242, 159, 5, 0.35)',
                          borderColor: 'rgba(242, 159, 5, 0.6)'
                        }
                      }}>
                        <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip
                              icon={<Flame size={14} />}
                              label="🔥 Beliebt"
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.5)',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                boxShadow: '0 0 15px rgba(242, 159, 5, 0.3)'
                              }}
                            />
                            <Chip
                              icon={<Tag size={14} />}
                              label={article.category}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.2)',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.4)',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                          <Link href={`/blogartikel/${article.slug}`} style={{ textDecoration: 'none' }}>
                            <Typography variant="h4" sx={{
                              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: 800,
                              mb: 2,
                              fontSize: { xs: '1.5rem', md: '2rem' },
                              lineHeight: 1.3,
                              letterSpacing: '0.01em',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.9
                              },
                              transition: 'opacity 0.3s ease'
                            }}>
                              {article.title}
                            </Typography>
                          </Link>
                          <Typography variant="body1" sx={{
                            color: 'rgba(255,255,255,0.9)',
                            mb: 3,
                            flexGrow: 1,
                            lineHeight: 1.8,
                            fontSize: { xs: '0.95rem', md: '1.05rem' }
                          }}>
                            {article.excerpt}
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 3,
                            flexWrap: 'wrap'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <User size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                {article.author}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Clock size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                {article.readTime}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            component={Link}
                            href={`/blogartikel/${article.slug}`}
                            variant="contained"
                            endIcon={<ArrowRight size={20} />}
                            sx={{
                              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                              color: 'white',
                              fontWeight: 700,
                              px: 4,
                              py: 1.5,
                              borderRadius: 3,
                              fontSize: { xs: '0.95rem', md: '1rem' },
                              boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                              },
                              '&:hover': {
                                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                                '&::before': {
                                  opacity: 1
                                }
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Jetzt lesen
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Box>
        )}

        {/* ✨ PREMIUM: Suchfunktion und Sortierung */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Suche nach Titel, Inhalt, Autor oder Kategorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                      backdropFilter: 'blur(25px)',
                      border: '2px solid rgba(242, 159, 5, 0.4)',
                      borderRadius: 4,
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(242, 159, 5, 0.15)',
                      '&:hover': {
                        borderColor: 'rgba(242, 159, 5, 0.6)',
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.18) 0%, rgba(140, 29, 4, 0.12) 100%)',
                        boxShadow: '0 6px 30px rgba(242, 159, 5, 0.25)'
                      },
                      '&.Mui-focused': {
                        borderColor: '#F29F05',
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.18) 0%, rgba(140, 29, 4, 0.12) 100%)',
                        boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.2), 0 8px 35px rgba(242, 159, 5, 0.3)'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      py: { xs: 2, md: 1.75 },
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.6)',
                        opacity: 1
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'rgba(242, 159, 5, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 15px rgba(242, 159, 5, 0.3)'
                        }}>
                          <Search color="#F29F05" size={20} />
                        </Box>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sortieren nach</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(242, 159, 5, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(242, 159, 5, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#F29F05'
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255,255,255,0.7)'
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <ArrowUpDown size={18} style={{ color: '#F29F05', marginRight: 8 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="date-desc">Neueste zuerst</MenuItem>
                    <MenuItem value="date-asc">Älteste zuerst</MenuItem>
                    <MenuItem value="title-asc">Titel (A-Z)</MenuItem>
                    <MenuItem value="readTime">Lesezeit (kürzeste)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </motion.div>
        </Box>

        {/* ✨ PREMIUM: Kategorieübersicht mit Icons */}
        <Box sx={{ mb: { xs: 6, md: 7 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: { xs: 3, md: 4 },
              position: 'relative'
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(242, 159, 5, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(242, 159, 5, 0.3)'
              }}>
                <Filter size={22} color="#F29F05" />
              </Box>
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 700,
                fontSize: { xs: '1.3rem', md: '1.6rem' },
                letterSpacing: '0.02em'
              }}>
                Kategorien
              </Typography>
            </Box>
            <Paper sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.08) 0%, rgba(140, 29, 4, 0.05) 100%)',
              backdropFilter: 'blur(25px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              p: { xs: 2.5, md: 3 },
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 1.5, md: 2 },
              boxShadow: '0 8px 30px rgba(242, 159, 5, 0.15)'
            }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                transition={{ duration: 0.3 }}
              >
                <Chip
                  label={`Alle (${blogArticles.length})`}
                  onClick={() => setSelectedCategory(null)}
                  icon={<Tag size={16} />}
                  sx={{
                    background: selectedCategory === null 
                      ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.35), rgba(140, 29, 4, 0.25))' 
                      : 'rgba(242, 159, 5, 0.12)',
                    color: selectedCategory === null ? '#F29F05' : 'rgba(255,255,255,0.85)',
                    border: selectedCategory === null 
                      ? '2px solid #F29F05' 
                      : '1px solid rgba(242, 159, 5, 0.4)',
                    fontWeight: selectedCategory === null ? 800 : 600,
                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedCategory === null 
                      ? '0 0 20px rgba(242, 159, 5, 0.4)' 
                      : 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))',
                      borderColor: '#F29F05',
                      boxShadow: '0 0 25px rgba(242, 159, 5, 0.3)',
                      transform: 'translateY(-3px)'
                    },
                    '& .MuiChip-icon': {
                      color: selectedCategory === null ? '#F29F05' : 'rgba(255,255,255,0.7)'
                    }
                  }}
                />
              </motion.div>
              {categories.map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <Chip
                    label={`${category} (${categoryCounts[category]})`}
                    onClick={() => setSelectedCategory(category)}
                    icon={getCategoryIcon(category)}
                    sx={{
                      background: selectedCategory === category 
                        ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.35), rgba(140, 29, 4, 0.25))' 
                        : 'rgba(242, 159, 5, 0.12)',
                      color: selectedCategory === category ? '#F29F05' : 'rgba(255,255,255,0.85)',
                      border: selectedCategory === category 
                        ? '2px solid #F29F05' 
                        : '1px solid rgba(242, 159, 5, 0.4)',
                      fontWeight: selectedCategory === category ? 800 : 600,
                      fontSize: { xs: '0.9rem', md: '0.95rem' },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedCategory === category 
                        ? '0 0 20px rgba(242, 159, 5, 0.4)' 
                        : 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))',
                        borderColor: '#F29F05',
                        boxShadow: '0 0 25px rgba(242, 159, 5, 0.3)',
                        transform: 'translateY(-3px)'
                      },
                      '& .MuiChip-icon': {
                        color: selectedCategory === category ? '#F29F05' : 'rgba(255,255,255,0.7)'
                      }
                    }}
                  />
                </motion.div>
              ))}
            </Paper>
          </motion.div>
        </Box>

        {/* Autor-Filter */}
        {authors.length > 1 && (
          <Box sx={{ mb: 5 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <User size={20} style={{ color: '#F29F05' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Autoren
                </Typography>
              </Box>
              <Paper sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5
              }}>
                <Chip
                  label={`Alle Autoren (${blogArticles.length})`}
                  onClick={() => setSelectedAuthor(null)}
                  sx={{
                    background: selectedAuthor === null 
                      ? 'rgba(242, 159, 5, 0.25)' 
                      : 'rgba(242, 159, 5, 0.1)',
                    color: selectedAuthor === null ? '#F29F05' : 'rgba(255,255,255,0.8)',
                    border: selectedAuthor === null 
                      ? '2px solid #F29F05' 
                      : '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: selectedAuthor === null ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(242, 159, 5, 0.2)',
                      borderColor: '#F29F05',
                      transform: 'translateY(-2px)'
                    }
                  }}
                />
                {authors.map((author) => (
                  <Chip
                    key={author}
                    label={`${author} (${authorCounts[author]})`}
                    onClick={() => setSelectedAuthor(author)}
                    icon={<User size={14} />}
                    sx={{
                      background: selectedAuthor === author 
                        ? 'rgba(242, 159, 5, 0.25)' 
                        : 'rgba(242, 159, 5, 0.1)',
                      color: selectedAuthor === author ? '#F29F05' : 'rgba(255,255,255,0.8)',
                      border: selectedAuthor === author 
                        ? '2px solid #F29F05' 
                        : '1px solid rgba(242, 159, 5, 0.3)',
                      fontWeight: selectedAuthor === author ? 700 : 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(242, 159, 5, 0.2)',
                        borderColor: '#F29F05',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  />
                ))}
              </Paper>
            </motion.div>
          </Box>
        )}

        {/* Featured/Neueste Artikel */}
        {!selectedCategory && !selectedAuthor && !searchTerm && filteredArticles.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TrendingUp size={20} style={{ color: '#F29F05' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Neueste Artikel
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {filteredArticles.slice(0, 2).map((article, index) => (
                  <Grid item xs={12} md={6} key={article.id}>
                    <Card sx={{
                      background: 'rgba(242, 159, 5, 0.12)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '2px solid rgba(242, 159, 5, 0.3)',
                      boxShadow: '0 8px 30px rgba(242, 159, 5, 0.2)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
                        borderColor: 'rgba(242, 159, 5, 0.5)'
                      }
                    }}>
                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={<Tag size={14} />}
                            label={article.category}
                            size="small"
                            sx={{
                              background: 'rgba(242, 159, 5, 0.25)',
                              color: '#F29F05',
                              border: '1px solid rgba(242, 159, 5, 0.4)',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip
                            icon={<TrendingUp size={12} />}
                            label="Neu"
                            size="small"
                            sx={{
                              background: 'rgba(242, 159, 5, 0.2)',
                              color: '#F29F05',
                              border: '1px solid rgba(242, 159, 5, 0.3)',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        <Link href={`/blogartikel/${article.slug}`} style={{ textDecoration: 'none' }}>
                          <Typography variant="h5" sx={{
                            color: 'white',
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: '1.35rem', md: '1.65rem' },
                            lineHeight: 1.3,
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#F29F05',
                              transition: 'color 0.3s ease'
                            }
                          }}>
                            {article.title}
                          </Typography>
                        </Link>
                        <Typography variant="body1" sx={{
                          color: 'rgba(255,255,255,0.85)',
                          mb: 3,
                          flexGrow: 1,
                          lineHeight: 1.7,
                          fontSize: '1rem'
                        }}>
                          {article.excerpt}
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                          flexWrap: 'wrap'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <User size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                              {article.author}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Calendar size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                              {mounted ? new Date(article.date).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }) : article.date}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                              {article.readTime}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          component={Link}
                          href={`/blogartikel/${article.slug}`}
                          variant="contained"
                          endIcon={<ArrowRight size={18} />}
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: 'white',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            alignSelf: 'flex-start',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              transform: 'translateX(4px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Jetzt lesen
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Box>
        )}

        {/* ✨ PREMIUM: Weitere Artikel Bereich mit Section-Titel */}
        {filteredArticles.length > 0 && (
          <Box sx={{ mb: { xs: 5, md: 6 } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {/* ✨ PREMIUM: Section-Header mit Icon */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 3,
                mb: { xs: 4, md: 5 },
                position: 'relative'
              }}>
                <Box sx={{
                  flex: 1,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
                  borderRadius: 1
                }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(242, 159, 5, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(242, 159, 5, 0.4)'
                  }}>
                    <FileText size={26} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
                  </Box>
                  <Typography variant="h3" sx={{ 
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', md: '2.8rem' },
                    letterSpacing: '0.02em'
                  }}>
                    {searchTerm || selectedCategory || selectedAuthor 
                      ? `Gefundene Artikel (${filteredArticles.length})` 
                      : `Weitere Artikel (${filteredArticles.length > 2 ? filteredArticles.length - 2 : filteredArticles.length})`}
                  </Typography>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(242, 159, 5, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(242, 159, 5, 0.4)'
                  }}>
                    <FileText size={26} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
                  </Box>
                </Box>
                <Box sx={{
                  flex: 1,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
                  borderRadius: 1
                }} />
              </Box>
            </motion.div>
          </Box>
        )}

        {/* Blogartikel Grid */}
        {filteredArticles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              {searchTerm ? 'Keine Artikel gefunden.' : 'Keine Artikel in dieser Kategorie gefunden.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {searchTerm && (
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  sx={{
                    color: '#F29F05',
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)'
                    }
                  }}
                >
                  Suche zurücksetzen
                </Button>
              )}
              {selectedCategory && (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedCategory(null)}
                  sx={{
                    color: '#F29F05',
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)'
                    }
                  }}
                >
                  Kategorie zurücksetzen
                </Button>
              )}
              {selectedAuthor && (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedAuthor(null)}
                  sx={{
                    color: '#F29F05',
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)'
                    }
                  }}
                >
                  Autor zurücksetzen
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {(!selectedCategory && !selectedAuthor && !searchTerm ? filteredArticles.slice(2) : filteredArticles).map((article, index) => (
              <Grid item xs={12} md={6} key={article.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{
                    background: getCategoryBackground(article.category),
                    backdropFilter: 'blur(25px)',
                    borderRadius: 4,
                    border: '2px solid rgba(242, 159, 5, 0.3)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.12)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${article.category === 'Dating' ? 'rgba(255, 140, 0, 0.6)' : article.category === 'Resonanz' ? 'rgba(242, 159, 5, 0.6)' : article.category === 'Human Design' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(242, 159, 5, 0.6)'}, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 3, md: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                      {/* ✨ PREMIUM: Kategorie mit Icon */}
                      <Box sx={{ mb: 2.5 }}>
                        <Chip
                          icon={getCategoryIcon(article.category)}
                          label={article.category}
                          size="small"
                          sx={{
                            background: 'rgba(242, 159, 5, 0.2)',
                            color: '#F29F05',
                            border: '1px solid rgba(242, 159, 5, 0.4)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            boxShadow: '0 0 15px rgba(242, 159, 5, 0.2)',
                            '& .MuiChip-icon': {
                              color: '#F29F05'
                            }
                          }}
                        />
                      </Box>

                      {/* ✨ PREMIUM: Größerer Titel mit Gradient & optimierter Typografie */}
                      <Link href={`/blogartikel/${article.slug}`} style={{ textDecoration: 'none' }}>
                        <Typography variant="h4" sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 800,
                          mb: 2.5,
                          fontSize: { xs: '1.5rem', md: '1.9rem' },
                          lineHeight: 1.25,
                          letterSpacing: '0.02em',
                          cursor: 'pointer',
                          minHeight: { xs: '3.5rem', md: '4.2rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'translateX(2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}>
                          {article.title}
                        </Typography>
                      </Link>

                      {/* ✨ PREMIUM: Verbesserter Excerpt mit optimierter Typografie */}
                      <Typography variant="body1" sx={{
                        color: 'rgba(255,255,255,0.92)',
                        mb: 3,
                        flexGrow: 1,
                        lineHeight: 1.85,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 400,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.excerpt}
                      </Typography>

                      {/* ✨ PREMIUM: Kompakte Meta-Informationen mit optimierter Typografie */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2.5,
                        mb: 3,
                        flexWrap: 'wrap',
                        pb: 2,
                        borderBottom: '1px solid rgba(242, 159, 5, 0.15)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <User size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.75)', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            letterSpacing: '0.01em'
                          }}>
                            {article.author}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Calendar size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.75)', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            letterSpacing: '0.01em'
                          }}>
                            {mounted ? new Date(article.date).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : article.date}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Clock size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.75)', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            letterSpacing: '0.01em'
                          }}>
                            {article.readTime}
                          </Typography>
                        </Box>
                      </Box>

                      {/* ✨ PREMIUM: Prominenterer CTA */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ flex: 1, minWidth: '140px' }}
                          >
                            <Button
                              component={Link}
                              href={`/blogartikel/${article.slug}`}
                              variant="contained"
                              endIcon={<ArrowRight size={20} />}
                              sx={{
                                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                color: 'white',
                                fontWeight: 700,
                                px: { xs: 3, md: 4 },
                                py: { xs: 1.25, md: 1.5 },
                                borderRadius: 3,
                                fontSize: { xs: '0.95rem', md: '1rem' },
                                textTransform: 'none',
                                boxShadow: '0 6px 25px rgba(242, 159, 5, 0.35)',
                                position: 'relative',
                                overflow: 'hidden',
                                width: '100%',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)',
                                  opacity: 0,
                                  transition: 'opacity 0.3s ease'
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  inset: -2,
                                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.4))',
                                  borderRadius: 3,
                                  opacity: 0,
                                  filter: 'blur(8px)',
                                  animation: 'pulseGlow 2s ease-in-out infinite',
                                  '@keyframes pulseGlow': {
                                    '0%, 100%': { opacity: 0 },
                                    '50%': { opacity: 0.6 }
                                  }
                                },
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 10px 35px rgba(242, 159, 5, 0.45)',
                                  '&::before': {
                                    opacity: 1
                                  },
                                  '&::after': {
                                    opacity: 0.8
                                  }
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Weiterlesen
                            </Button>
                          </motion.div>
                        </motion.div>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            shareArticle(article, 'facebook');
                          }}
                          sx={{
                            color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(242, 159, 5, 0.2)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              color: '#1877F2',
                              borderColor: '#1877F2',
                              background: 'rgba(24, 119, 242, 0.1)'
                            }
                          }}
                          title="Auf Facebook teilen"
                        >
                          <Facebook size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            shareArticle(article, 'twitter');
                          }}
                          sx={{
                            color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(242, 159, 5, 0.2)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              color: '#1DA1F2',
                              borderColor: '#1DA1F2',
                              background: 'rgba(29, 161, 242, 0.1)'
                            }
                          }}
                          title="Auf Twitter teilen"
                        >
                          <Twitter size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            shareArticle(article, 'email');
                          }}
                          sx={{
                            color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(242, 159, 5, 0.2)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              color: '#F29F05',
                              borderColor: '#F29F05',
                              background: 'rgba(242, 159, 5, 0.1)'
                            }
                          }}
                          title="Per E-Mail teilen"
                        >
                          <Mail size={16} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        )}
      </Container>
    </Box>
  );
}

