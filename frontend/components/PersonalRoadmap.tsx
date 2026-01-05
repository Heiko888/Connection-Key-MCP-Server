"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress, Stepper, Step, StepLabel, StepContent, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Star, Zap, Eye, Moon, Flame, Users, BookOpen, Heart, Calendar, CheckCircle, ArrowRight, RotateCcw, Share2, Bookmark, TrendingUp, Award, Lightbulb, Brain, Sparkles } from 'lucide-react';
import { useNotifications } from './NotificationService';
import AIEngineService from '@/lib/ai/aiEngineService';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'relationships' | 'career' | 'spirituality' | 'health' | 'creativity';
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  estimatedTime: string;
  prerequisites: string[];
  benefits: string[];
  activities: string[];
  resources: string[];
  completed: boolean;
  progress: number;
  color: string;
  icon: string;
  aiGenerated?: boolean;
  aiInsights?: string[];
  aiRecommendations?: string[];
  optimalTiming?: string;
  confidence?: number;
}

interface PersonalRoadmap {
  id: string;
  title: string;
  description: string;
  hdType: string;
  profile: string;
  authority: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  estimatedCompletion: string;
  steps: RoadmapStep[];
  achievements: string[];
  nextMilestone: string;
  aiGenerated?: boolean;
  aiInsights?: string[];
  lastUpdated?: string;
  confidence?: number;
}

const roadmapTemplates: PersonalRoadmap[] = [
  {
    id: '1',
    title: 'Generator Energie-Meister',
    description: 'Optimiere deine sakrale Energie und lebe im Einklang mit deiner inneren Antwort. Dein persönliches Generator-Entwicklungsprogramm basierend auf Human Design.',
    hdType: 'Generator',
    profile: '2/4',
    authority: 'Sakrale Autorität',
    totalSteps: 8,
    completedSteps: 3,
    currentStep: 4,
    estimatedCompletion: '3 Monate',
    nextMilestone: 'Energie-Management verstehen',
    achievements: ['Erste Energie-Erkennung', 'Sakrale Antworten verstehen'],
    steps: [
      {
        id: '1',
        title: 'Energie-Bewusstsein entwickeln',
        description: 'Entdecke, wie deine sakrale Energie dir jeden Tag klare, intuitive Antworten gibt.',
        category: 'energy',
        level: 'beginner',
        estimatedTime: '2 Wochen',
        prerequisites: ['Human Design Grundlagen'],
        benefits: ['Bessere Energie-Wahrnehmung', 'Authentische Entscheidungen'],
        activities: ['Energie-Tracking', 'Sakrale Antworten beobachten', 'Tagebuch führen'],
        resources: ['Energie-Guide', 'Meditationen', 'Community-Support'],
        completed: true,
        progress: 100,
        color: '#10B981',
        icon: '⚡'
      },
      {
        id: '2',
        title: 'Sakrale Antworten verstehen',
        description: 'Entwickle ein tiefes Verständnis für deine sakralen Antworten',
        category: 'energy',
        level: 'beginner',
        estimatedTime: '3 Wochen',
        prerequisites: ['Energie-Bewusstsein'],
        benefits: ['Klarere Entscheidungen', 'Weniger Frustration'],
        activities: ['Sakrale Antworten dokumentieren', 'Entscheidungsprozesse analysieren'],
        resources: ['Sakrale Antworten Guide', 'Entscheidungs-Templates'],
        completed: true,
        progress: 100,
        color: '#10B981',
        icon: '🎯'
      },
      {
        id: '3',
        title: 'Energie-Management praktizieren',
        description: 'Lerne deine Energie effektiv zu managen und zu schützen',
        category: 'energy',
        level: 'intermediate',
        estimatedTime: '4 Wochen',
        prerequisites: ['Sakrale Antworten verstehen'],
        benefits: ['Bessere Work-Life-Balance', 'Mehr Produktivität'],
        activities: ['Energie-Zyklen beobachten', 'Grenzen setzen', 'Pausen einplanen'],
        resources: ['Energie-Management Kurs', 'Pausen-Timer', 'Grenzen-Guide'],
        completed: true,
        progress: 100,
        color: '#10B981',
        icon: '🛡️'
      },
      {
        id: '4',
        title: 'Authentische Beziehungen aufbauen',
        description: 'Nutze deine Energie, um echte Verbindungen zuzulassen.',
        category: 'relationships',
        level: 'intermediate',
        estimatedTime: '6 Wochen',
        prerequisites: ['Energie-Management'],
        benefits: ['Tiefere Verbindungen', 'Weniger toxische Beziehungen'],
        activities: ['Beziehungs-Patterns analysieren', 'Authentische Kommunikation üben'],
        resources: ['Beziehungs-Guide', 'Kommunikations-Training', 'Dating-Tipps'],
        completed: false,
        progress: 45,
        color: '#EF4444',
        icon: '💖'
      },
      {
        id: '5',
        title: 'Karriere-Energie nutzen',
        description: 'Finde eine Karriere, die deine sakrale Energie erfüllt',
        category: 'career',
        level: 'intermediate',
        estimatedTime: '8 Wochen',
        prerequisites: ['Authentische Beziehungen'],
        benefits: ['Erfüllende Arbeit', 'Bessere Performance'],
        activities: ['Karriere-Interessen erkunden', 'Energie-Erfüllung messen'],
        resources: ['Karriere-Guide', 'Interessen-Test', 'Networking-Tipps'],
        completed: false,
        progress: 20,
        color: '#F59E0B',
        icon: '💼'
      },
      {
        id: '6',
        title: 'Spirituelle Entwicklung',
        description: 'Vertiefe dein spirituelles Verständnis durch Human Design',
        category: 'spirituality',
        level: 'advanced',
        estimatedTime: '10 Wochen',
        prerequisites: ['Karriere-Energie'],
        benefits: ['Tiefere Spiritualität', 'Besseres Selbstverständnis'],
        activities: ['Meditation praktizieren', 'Spirituelle Texte lesen'],
        resources: ['Spiritualitäts-Guide', 'Meditations-App', 'Bücher-Liste'],
        completed: false,
        progress: 0,
        color: '#8B5CF6',
        icon: '🌙'
      },
      {
        id: '7',
        title: 'Kreative Energie entfalten',
        description: 'Nutze deine Energie für kreative Projekte und Ausdruck',
        category: 'creativity',
        level: 'advanced',
        estimatedTime: '6 Wochen',
        prerequisites: ['Spirituelle Entwicklung'],
        benefits: ['Kreative Erfüllung', 'Persönlicher Ausdruck'],
        activities: ['Kreative Projekte starten', 'Künstlerische Fähigkeiten entwickeln'],
        resources: ['Kreativitäts-Guide', 'Projekt-Templates', 'Kunst-Kurse'],
        completed: false,
        progress: 0,
        color: '#06B6D4',
        icon: '🎨'
      },
      {
        id: '8',
        title: 'Energie-Meister werden',
        description: 'Integriere alle Aspekte deiner sakralen Energie für ein erfülltes Leben',
        category: 'energy',
        level: 'master',
        estimatedTime: '12 Wochen',
        prerequisites: ['Kreative Energie'],
        benefits: ['Vollständige Energie-Integration', 'Erfülltes Leben'],
        activities: ['Alle Aspekte integrieren', 'Mentoring anbieten'],
        resources: ['Master-Guide', 'Mentoring-Programm', 'Community-Leadership'],
        completed: false,
        progress: 0,
        color: '#FFD700',
        icon: '👑'
      }
    ]
  }
];

const getCategoryIcon = (category: RoadmapStep['category']) => {
  switch (category) {
    case 'energy':
      return <Zap size={20} />;
    case 'relationships':
      return <Heart size={20} />;
    case 'career':
      return <Target size={20} />;
    case 'spirituality':
      return <Moon size={20} />;
    case 'health':
      return <Star size={20} />;
    case 'creativity':
      return <Lightbulb size={20} />;
    default:
      return <Star size={20} />;
  }
};

const getLevelColor = (level: RoadmapStep['level']) => {
  switch (level) {
    case 'beginner':
      return '#22c55e';
    case 'intermediate':
      return '#f59e0b';
    case 'advanced':
      return '#8b5cf6';
    case 'master':
      return '#ffd700';
    default:
      return '#6b7280';
  }
};

const getCategoryColor = (category: RoadmapStep['category']) => {
  switch (category) {
    case 'energy':
      return '#F59E0B'; // Gelb/Orange
    case 'relationships':
      return '#EC4899'; // Pink/Rot
    case 'spirituality':
      return '#8B5CF6'; // Lila
    case 'career':
      return '#06B6D4'; // Blau/Grün
    case 'creativity':
      return '#10B981'; // Grün
    case 'health':
      return '#EF4444'; // Rot
    default:
      return '#6B7280'; // Grau
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

export default function PersonalRoadmap() {
  const [roadmap, setRoadmap] = useState<PersonalRoadmap | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAICoaching, setShowAICoaching] = useState(false);
  const [aiCoaching, setAiCoaching] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved roadmaps
    const saved = localStorage.getItem('saved-personal-roadmaps');
    if (saved) {
      setSavedRoadmaps(JSON.parse(saved));
    }

    // Load user's roadmap (in real app, this would come from an API)
    const userRoadmap = roadmapTemplates[0]; // For demo, use first template
    setRoadmap(userRoadmap);
    
    // Generate AI insights on load
    generateAIInsights();
  }, []);

  // AI-Funktionen
  const generateAIInsights = async () => {
    if (!roadmap) return;
    
    setIsGeneratingAI(true);
    try {
      // Personalisierte AI-Insights basierend auf User-Profil, Journal, Hobbies & Interessen
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const hobbies = userData.hobbies || [];
      const interests = userData.interests || [];
      const hdType = roadmap.hdType || 'Generator';
      const profile = roadmap.profile || '2/4';
      const authority = roadmap.authority || 'Sakrale Autorität';
      
      // Analysiere Journal-Einträge für Muster
      const recentJournalEntries = journalEntries.slice(-10);
      const commonThemes = analyzeJournalThemes(recentJournalEntries);
      const emotionalPatterns = analyzeEmotionalPatterns(recentJournalEntries);
      
      // Dynamische Insights basierend auf allen User-Daten
      const insights = [
        `🎯 Basierend auf deinem ${hdType}-Profil solltest du deine ${authority} zuerst verstehen`,
        `⚡ Deine ${profile} Profile zeigt, dass du ein natürlicher ${profile.includes('2') ? 'Netzwerker' : 'Forscher'} bist - nutze das!`,
        `🌙 Der aktuelle Mondzyklus ist optimal für ${hdType === 'Generator' ? 'Energie-Management' : 'Strategische Planung'}-Übungen`,
        `💡 Deine nächsten 30 Tage sind ideal für ${profile.includes('4') ? 'Beziehungsarbeit' : 'Persönliches Wachstum'}`,
        `🚀 Deine ${authority} wird in den nächsten 2 Wochen besonders stark sein`,
        `⭐ Als ${hdType} profitierst du besonders von ${hdType === 'Generator' ? 'sakralen Antworten' : 'strategischen Entscheidungen'}`,
        `🔮 Dein ${profile} Profil zeigt Potenzial für ${profile.includes('2') ? 'tiefe Verbindungen' : 'innovative Lösungen'}`
      ];
      
      // Journal-basierte Insights hinzufügen
      if (commonThemes.length > 0) {
        insights.push(`📝 Deine Journal-Einträge zeigen wiederkehrende Themen: ${commonThemes.join(', ')}`);
      }
      
      if (emotionalPatterns.length > 0) {
        insights.push(`💭 Deine emotionalen Muster zeigen: ${emotionalPatterns.join(', ')}`);
      }
      
      // Hobby-basierte Insights
      if (hobbies.length > 0) {
        const hobbyInsights = generateHobbyInsights(hobbies, hdType, profile);
        insights.push(...hobbyInsights);
      }
      
      // Interesse-basierte Dating-Tipps
      if (interests.length > 0) {
        const datingTips = generateDatingTips(interests, hdType, profile);
        insights.push(...datingTips);
      }
      
      setAiInsights(insights);
      
      addNotification({
        type: 'success',
        title: '✨ Erkenntnisse generiert',
        message: 'Deine personalisierten Erkenntnisse sind bereit!',
      });
    } catch (error) {
      console.error('Fehler bei AI-Insight-Generierung:', error);
      addNotification({
        type: 'error',
        title: '❌ Fehler',
        message: 'Konnte Erkenntnisse nicht generieren',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateAIActionPlan = async (step: RoadmapStep) => {
    try {
      // Kontextabhängige AI-Empfehlungen basierend auf Schritt, User-Profil, Journal & Hobbies
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const hobbies = userData.hobbies || [];
      const interests = userData.interests || [];
      const hdType = roadmap?.hdType || 'Generator';
      const profile = roadmap?.profile || '2/4';
      const authority = roadmap?.authority || 'Sakrale Autorität';
      
      // Dynamische Empfehlungen basierend auf Schritt-Kategorie
      let aiRecommendations: string[] = [];
      let optimalTiming = "";
      let confidence = 0.85;
      
      switch (step.category) {
        case 'energy':
          aiRecommendations = [
            `🎯 Beginne mit 10 Minuten täglicher ${hdType === 'Generator' ? 'sakraler Energie' : 'strategischer'}-Beobachtung`,
            `📝 Führe ein ${authority}-Tagebuch für deine Reaktionen`,
            `🔄 Teste deine ${authority} bei kleinen Entscheidungen`,
            `⏰ Nutze die Zeit zwischen 14-16 Uhr für Energie-Übungen`,
            `🤝 Suche einen ${profile.includes('2') ? 'Energie-Buddy' : 'Mentor'} für Unterstützung`
          ];
          optimalTiming = "14:00-16:00 Uhr (Energie-Peak)";
          confidence = 0.92;
          break;
          
        case 'relationships':
          aiRecommendations = [
            `💕 Beobachte deine ${hdType === 'Generator' ? 'sakralen Reaktionen' : 'strategischen Impulse'} bei Begegnungen`,
            `🌟 Nutze dein ${profile} Profil für ${profile.includes('2') ? 'tiefe Verbindungen' : 'authentische Kommunikation'}`,
            `🤝 Praktiziere ${authority} in sozialen Situationen`,
            `💬 Führe bewusste Gespräche über deine Human Design Erkenntnisse`,
            `🌙 Nutze Mondzyklen für Beziehungsreflexion`
          ];
          
          // Hobby-basierte Dating-Empfehlungen hinzufügen
          if (hobbies.length > 0) {
            const hobbyDatingTips = generateHobbyDatingRecommendations(hobbies, hdType, profile);
            aiRecommendations.push(...hobbyDatingTips);
          }
          
          // Interesse-basierte Orte hinzufügen
          if (interests.length > 0) {
            const locationTips = generateLocationRecommendations(interests, hdType, profile);
            aiRecommendations.push(...locationTips);
          }
          
          optimalTiming = "19:00-21:00 Uhr (Beziehungszeit)";
          confidence = 0.88;
          break;
          
        case 'career':
          aiRecommendations = [
            `💼 Analysiere deine ${hdType === 'Generator' ? 'sakralen Antworten' : 'strategischen Entscheidungen'} bei beruflichen Aufgaben`,
            `🎯 Nutze dein ${profile} Profil für ${profile.includes('4') ? 'Netzwerkaufbau' : 'Innovation'}`,
            `⚡ Praktiziere ${authority} bei Karriereentscheidungen`,
            `📈 Erstelle einen Human Design-basierten Karriereplan`,
            `🚀 Suche nach ${hdType === 'Generator' ? 'energieerfüllenden' : 'strategisch sinnvollen'} Projekten`
          ];
          optimalTiming = "09:00-11:00 Uhr (Produktivitätszeit)";
          confidence = 0.90;
          break;
          
        case 'spirituality':
          aiRecommendations = [
            `🧘 Praktiziere ${hdType === 'Generator' ? 'sakrale Meditation' : 'strategische Reflexion'}`,
            `🌟 Nutze dein ${profile} Profil für spirituelles Wachstum`,
            `🔮 Integriere ${authority} in deine spirituelle Praxis`,
            `🌙 Verbinde dich mit natürlichen Rhythmen und Zyklen`,
            `💫 Erforsche deine Human Design Archetypen`
          ];
          optimalTiming = "06:00-08:00 Uhr (Spirituelle Zeit)";
          confidence = 0.87;
          break;
          
        default:
          aiRecommendations = [
            `🎯 Beginne mit kleinen Schritten in ${step.category}`,
            `📝 Beobachte deine ${authority} bei ${step.category}-Aktivitäten`,
            `🔄 Praktiziere regelmäßige Reflexion`,
            `⏰ Finde deine optimale Zeit für ${step.category}`,
            `🤝 Suche Unterstützung bei Bedarf`
          ];
          optimalTiming = "Flexibel nach deinem Rhythmus";
          confidence = 0.80;
      }
      
      const updatedStep = {
        ...step,
        aiGenerated: true,
        aiRecommendations,
        optimalTiming,
        confidence
      };
      
      return updatedStep;
    } catch (error) {
      console.error('Fehler bei AI-Action-Plan:', error);
      return step;
    }
  };

  // Journal-Analyse-Funktionen
  const analyzeJournalThemes = (entries: any[]) => {
    if (entries.length === 0) return [];
    
    const themes = [];
    const content = entries.map(entry => entry.content || entry.text || '').join(' ').toLowerCase();
    
    // Analysiere häufige Themen
    if (content.includes('beziehung') || content.includes('partner') || content.includes('liebe')) {
      themes.push('Beziehungen');
    }
    if (content.includes('arbeit') || content.includes('beruf') || content.includes('karriere')) {
      themes.push('Karriere');
    }
    if (content.includes('energie') || content.includes('müde') || content.includes('erschöpft')) {
      themes.push('Energie-Management');
    }
    if (content.includes('ziel') || content.includes('traum') || content.includes('wunsch')) {
      themes.push('Ziele & Träume');
    }
    if (content.includes('familie') || content.includes('freunde') || content.includes('sozial')) {
      themes.push('Soziale Verbindungen');
    }
    
    return themes.slice(0, 3); // Maximal 3 Themen
  };

  const analyzeEmotionalPatterns = (entries: any[]) => {
    if (entries.length === 0) return [];
    
    const patterns = [];
    const content = entries.map(entry => entry.content || entry.text || '').join(' ').toLowerCase();
    
    // Analysiere emotionale Muster
    if (content.includes('glücklich') || content.includes('zufrieden') || content.includes('freude')) {
      patterns.push('positive Stimmung');
    }
    if (content.includes('stress') || content.includes('angst') || content.includes('sorge')) {
      patterns.push('Stress-Muster');
    }
    if (content.includes('reflexion') || content.includes('nachdenken') || content.includes('überlegen')) {
      patterns.push('reflektive Natur');
    }
    if (content.includes('kreativ') || content.includes('inspiration') || content.includes('ideen')) {
      patterns.push('kreative Phasen');
    }
    
    return patterns.slice(0, 2); // Maximal 2 Muster
  };

  // Hobby-basierte Insights
  const generateHobbyInsights = (hobbies: string[], hdType: string, profile: string) => {
    const insights: any[] = [];
    
    hobbies.forEach(hobby => {
      const hobbyLower = hobby.toLowerCase();
      
      if (hobbyLower.includes('sport') || hobbyLower.includes('fitness')) {
        insights.push(`🏃‍♂️ Dein ${hobby}-Hobby passt perfekt zu deinem ${hdType} Profil - nutze es für Energie-Management!`);
      }
      if (hobbyLower.includes('musik') || hobbyLower.includes('kunst') || hobbyLower.includes('kreativ')) {
        insights.push(`🎨 Deine kreative Seite mit ${hobby} kann deine ${profile} Profile-Stärken verstärken!`);
      }
      if (hobbyLower.includes('lesen') || hobbyLower.includes('lernen') || hobbyLower.includes('studium')) {
        insights.push(`📚 Dein ${hobby}-Interesse zeigt deine ${profile.includes('2') ? 'forschende' : 'analytische'} Natur!`);
      }
      if (hobbyLower.includes('reisen') || hobbyLower.includes('abenteuer') || hobbyLower.includes('natur')) {
        insights.push(`🌍 Dein ${hobby}-Hobby kann dir helfen, deine ${hdType} Energie optimal zu nutzen!`);
      }
    });
    
    return insights.slice(0, 2); // Maximal 2 Hobby-Insights
  };

  // Dating-Tipps basierend auf Interessen
  const generateDatingTips = (interests: string[], hdType: string, profile: string) => {
    const tips: any[] = [];
    
    interests.forEach(interest => {
      const interestLower = interest.toLowerCase();
      
      if (interestLower.includes('kultur') || interestLower.includes('kunst') || interestLower.includes('museum')) {
        tips.push(`🎭 Perfekte Dating-Orte für dich: Museen, Galerien, Theater - dein ${profile} Profil liebt kulturelle Tiefe!`);
      }
      if (interestLower.includes('natur') || interestLower.includes('outdoor') || interestLower.includes('wandern')) {
        tips.push(`🌲 Ideale Dating-Aktivitäten: Naturwanderungen, Picknicks - deine ${hdType} Energie blüht in der Natur auf!`);
      }
      if (interestLower.includes('sport') || interestLower.includes('fitness') || interestLower.includes('aktiv')) {
        tips.push(`⚡ Sportliche Dates passen zu deinem ${hdType} Profil - gemeinsame Aktivitäten stärken die Verbindung!`);
      }
      if (interestLower.includes('kochen') || interestLower.includes('essen') || interestLower.includes('gastronomie')) {
        tips.push(`🍽️ Kulinarische Dates sind ideal für dein ${profile} Profil - gemeinsames Kochen schafft Intimität!`);
      }
      if (interestLower.includes('musik') || interestLower.includes('konzert') || interestLower.includes('festival')) {
        tips.push(`🎵 Musik-Events sind perfekt für dein ${profile} Profil - teile deine Leidenschaft für Musik!`);
      }
    });
    
    return tips.slice(0, 2); // Maximal 2 Dating-Tipps
  };

  // Hobby-basierte Dating-Empfehlungen
  const generateHobbyDatingRecommendations = (hobbies: string[], hdType: string, profile: string) => {
    const recommendations: any[] = [];
    
    hobbies.forEach(hobby => {
      const hobbyLower = hobby.toLowerCase();
      
      if (hobbyLower.includes('fotografie') || hobbyLower.includes('foto')) {
        recommendations.push(`📸 Organisiere einen Fotografie-Spaziergang - perfekt für dein ${profile} Profil!`);
      }
      if (hobbyLower.includes('kochen') || hobbyLower.includes('backen')) {
        recommendations.push(`👨‍🍳 Koche gemeinsam - dein ${hdType} Profil liebt praktische Aktivitäten!`);
      }
      if (hobbyLower.includes('tanzen') || hobbyLower.includes('tanz')) {
        recommendations.push(`💃 Besuche einen Tanzkurs zusammen - ideal für deine ${hdType} Energie!`);
      }
      if (hobbyLower.includes('lesen') || hobbyLower.includes('buch')) {
        recommendations.push(`📚 Besuche eine Buchhandlung oder Bibliothek - dein ${profile} Profil liebt intellektuelle Gespräche!`);
      }
    });
    
    return recommendations.slice(0, 2); // Maximal 2 Empfehlungen
  };

  // Orts-basierte Empfehlungen
  const generateLocationRecommendations = (interests: string[], hdType: string, profile: string) => {
    const recommendations: any[] = [];
    
    interests.forEach(interest => {
      const interestLower = interest.toLowerCase();
      
      if (interestLower.includes('kultur') || interestLower.includes('kunst')) {
        recommendations.push(`🏛️ Besuche lokale Museen, Galerien oder Kulturzentren - dein ${profile} Profil liebt kulturelle Tiefe!`);
      }
      if (interestLower.includes('natur') || interestLower.includes('outdoor')) {
        recommendations.push(`🌳 Erkunde lokale Parks, Gärten oder Naturgebiete - deine ${hdType} Energie blüht draußen auf!`);
      }
      if (interestLower.includes('sport') || interestLower.includes('fitness')) {
        recommendations.push(`🏃‍♂️ Besuche Sportveranstaltungen oder Fitness-Events - perfekt für dein ${hdType} Profil!`);
      }
      if (interestLower.includes('musik') || interestLower.includes('konzert')) {
        recommendations.push(`🎵 Gehe zu lokalen Konzerten, Open Mic Nights oder Musik-Events - dein ${profile} Profil liebt Musik!`);
      }
    });
    
    return recommendations.slice(0, 2); // Maximal 2 Empfehlungen
  };

  const getAICoaching = async (step: RoadmapStep) => {
    try {
      // Kontextabhängiges AI-Coaching basierend auf Schritt und User-Profil
      const hdType = roadmap?.hdType || 'Generator';
      const profile = roadmap?.profile || '2/4';
      const authority = roadmap?.authority || 'Sakrale Autorität';
      
      // Dynamische Coaching-Tipps basierend auf Schritt-Kategorie
      let tips: string[] = [];
      let nextAction = "";
      let confidence = 0.85;
      
      switch (step.category) {
        case 'energy':
          tips = [
            `Beginne mit kleinen Schritten - deine ${authority} braucht Zeit`,
            `Achte auf deine körperlichen Reaktionen bei Entscheidungen`,
            `Nutze deine natürliche ${hdType === 'Generator' ? 'Energie' : 'Strategie'} für authentische Verbindungen`,
            `Sei geduldig mit dir selbst - ${hdType}s brauchen Zeit zum Reifen`,
            `Praktiziere täglich 5-10 Minuten ${authority}-Beobachtung`
          ];
          nextAction = "Starte heute mit 5 Minuten Energie-Beobachtung";
          confidence = 0.92;
          break;
          
        case 'relationships':
          tips = [
            `Nutze dein ${profile} Profil für ${profile.includes('2') ? 'tiefe Verbindungen' : 'authentische Kommunikation'}`,
            `Beobachte deine ${authority} bei sozialen Begegnungen`,
            `Sei authentisch in deinen Beziehungen - dein Human Design zeigt den Weg`,
            `Praktiziere aktives Zuhören basierend auf deiner ${authority}`,
            `Nutze Mondzyklen für Beziehungsreflexion und -planung`
          ];
          nextAction = "Führe heute ein bewusstes Gespräch mit deiner Human Design Perspektive";
          confidence = 0.88;
          break;
          
        case 'career':
          tips = [
            `Analysiere deine ${authority} bei beruflichen Entscheidungen`,
            `Nutze dein ${profile} Profil für ${profile.includes('4') ? 'Netzwerkaufbau' : 'Innovation'}`,
            `Suche nach ${hdType === 'Generator' ? 'energieerfüllenden' : 'strategisch sinnvollen'} Projekten`,
            `Praktiziere ${authority} bei Karriereentscheidungen`,
            `Erstelle einen Human Design-basierten Karriereplan`
          ];
          nextAction = "Analysiere heute eine berufliche Entscheidung mit deiner Human Design Perspektive";
          confidence = 0.90;
          break;
          
        case 'spirituality':
          tips = [
            `Praktiziere ${hdType === 'Generator' ? 'sakrale Meditation' : 'strategische Reflexion'}`,
            `Nutze dein ${profile} Profil für spirituelles Wachstum`,
            `Integriere ${authority} in deine spirituelle Praxis`,
            `Verbinde dich mit natürlichen Rhythmen und Zyklen`,
            `Erforsche deine Human Design Archetypen und ihre spirituelle Bedeutung`
          ];
          nextAction = "Praktiziere heute 10 Minuten Human Design-basierte Meditation";
          confidence = 0.87;
          break;
          
        default:
          tips = [
            `Beginne mit kleinen Schritten in ${step.category}`,
            `Beobachte deine ${authority} bei ${step.category}-Aktivitäten`,
            `Praktiziere regelmäßige Reflexion über deine Fortschritte`,
            `Nutze dein Human Design Profil für bessere Ergebnisse`,
            `Sei geduldig mit dir selbst - Wachstum braucht Zeit`
          ];
          nextAction = `Starte heute mit einer kleinen ${step.category}-Aktivität`;
          confidence = 0.80;
      }
      
      const coaching = {
        message: `🎯 Für "${step.title}" empfehle ich dir:`,
        tips,
        nextAction,
        confidence
      };
      
      return coaching;
    } catch (error) {
      console.error('Fehler bei AI-Coaching:', error);
      return null;
    }
  };

  const handleStepComplete = (stepId: string) => {
    if (!roadmap) return;

    const updatedSteps = roadmap.steps.map(step => 
      step.id === stepId 
        ? { ...step, completed: true, progress: 100 }
        : step
    );

    const completedSteps = updatedSteps.filter(step => step.completed).length;
    const currentStep = updatedSteps.findIndex(step => !step.completed) + 1;

    const updatedRoadmap = {
      ...roadmap,
      steps: updatedSteps,
      completedSteps,
      currentStep: currentStep > roadmap.totalSteps ? roadmap.totalSteps : currentStep
    };

    setRoadmap(updatedRoadmap);

    addNotification({
      type: 'success',
      title: '🎉 Schritt abgeschlossen!',
      message: 'Du hast einen wichtigen Meilenstein erreicht!',
    });
  };

  const handleStepSelect = async (step: RoadmapStep) => {
    // Generiere AI-Insights für den ausgewählten Schritt
    const aiEnhancedStep = await generateAIActionPlan(step);
    setSelectedStep(aiEnhancedStep);
    setShowDetails(true);
  };

  const handleSave = () => {
    if (!roadmap) return;
    
    const newSaved = [...savedRoadmaps, roadmap.id];
    setSavedRoadmaps(newSaved);
    localStorage.setItem('saved-personal-roadmaps', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Deine persönliche Roadmap wurde gespeichert!',
    });
  };

  const handleShare = () => {
    if (!roadmap) return;
    
    const shareText = `🗺️ Meine persönliche Human Design Roadmap:\n\n${roadmap.title}\n\n${roadmap.description}\n\n📊 Fortschritt: ${roadmap.completedSteps}/${roadmap.totalSteps} Schritte\n🎯 Nächster Meilenstein: ${roadmap.nextMilestone}\n\n#PersonalRoadmap #HumanDesign #HDApp`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meine persönliche Human Design Roadmap',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addNotification({
        type: 'success',
        title: '📋 Kopiert',
        message: 'Deine Roadmap wurde in die Zwischenablage kopiert!',
      });
    }
  };

  if (!roadmap) return null;

  const isSaved = savedRoadmaps.includes(roadmap.id);
  const progressPercentage = (roadmap.completedSteps / roadmap.totalSteps) * 100;

  return (
    <Box>
      {/* Roadmap Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            mb: 4,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                  🗺️
                </Typography>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    {roadmap.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {roadmap.description}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={generateAIInsights}
                  size="small"
                  disabled={isGeneratingAI}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: '#F29F05' }
                  }}
                  title="Erkenntnisse generieren"
                >
                  {isGeneratingAI ? <CircularProgress size={16} /> : <Sparkles size={16} />}
                </IconButton>
                <IconButton
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  size="small"
                  sx={{ 
                    color: showAIInsights ? '#F29F05' : 'text.secondary',
                    '&:hover': { color: '#F29F05' }
                  }}
                  title="Erkenntnisse anzeigen"
                >
                  <Sparkles size={16} />
                </IconButton>
                <IconButton
                  onClick={handleSave}
                  size="small"
                  sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
                >
                  <Bookmark size={16} />
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <Share2 size={16} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={getHdTypeIcon(roadmap.hdType)}
                label={`${roadmap.hdType} ${roadmap.profile}`}
                sx={{
                  backgroundColor: `${getHdTypeColor(roadmap.hdType)}20`,
                  color: getHdTypeColor(roadmap.hdType),
                  border: `1px solid ${getHdTypeColor(roadmap.hdType)}40`,
                }}
              />
              <Chip
                label={`${roadmap.completedSteps}/${roadmap.totalSteps} Schritte`}
                sx={{
                  backgroundColor: 'primary.20',
                  color: 'primary.main',
                  border: '1px solid primary.40',
                }}
              />
              <Chip
                label={`Geschätzte Zeit: ${roadmap.estimatedCompletion}`}
                sx={{
                  backgroundColor: 'secondary.20',
                  color: 'secondary.main',
                  border: '1px solid secondary.40',
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Gesamtfortschritt
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {Math.round(progressPercentage)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 0 }}>
                🎯 Nächster Meilenstein: {roadmap.nextMilestone}
              </Typography>
              {roadmap.steps.find(step => !step.completed) && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const nextStep = roadmap.steps.find(step => !step.completed);
                    if (nextStep) {
                      handleStepSelect(nextStep);
                    }
                  }}
                  startIcon={<ArrowRight size={18} />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Nächsten Schritt öffnen
                </Button>
              )}
            </Box>

            {/* Insights Section */}
            {showAIInsights && aiInsights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3,
                    background: 'rgba(242, 159, 5, 0.15)',
                    border: '2px solid rgba(242, 159, 5, 0.3)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#F29F05' }}>
                    <Sparkles size={20} color="#F29F05" />
                    ✨ Erkenntnisse für deine Roadmap
                  </Typography>
                  <List dense>
                    {aiInsights.map((insight, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary={insight}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '0.9rem',
                              color: 'white'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
            📋 Deine Entwicklungsschritte
          </Typography>
          
          {/* Filter Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Alle"
              onClick={() => setSelectedCategory(null)}
              sx={{
                backgroundColor: selectedCategory === null ? 'primary.main' : 'rgba(255,255,255,0.1)',
                color: selectedCategory === null ? 'white' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            />
            <Chip
              icon={<Zap size={16} />}
              label="Energie"
              onClick={() => setSelectedCategory('energy')}
              sx={{
                backgroundColor: selectedCategory === 'energy' ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                color: selectedCategory === 'energy' ? 'white' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.2)' }
              }}
            />
            <Chip
              icon={<Heart size={16} />}
              label="Beziehung"
              onClick={() => setSelectedCategory('relationships')}
              sx={{
                backgroundColor: selectedCategory === 'relationships' ? '#EC4899' : 'rgba(255,255,255,0.1)',
                color: selectedCategory === 'relationships' ? 'white' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(236, 72, 153, 0.2)' }
              }}
            />
            <Chip
              icon={<Moon size={16} />}
              label="Spiritualität"
              onClick={() => setSelectedCategory('spirituality')}
              sx={{
                backgroundColor: selectedCategory === 'spirituality' ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                color: selectedCategory === 'spirituality' ? 'white' : 'rgba(255,255,255,0.8)',
                border: selectedCategory === 'spirituality' ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.2)' }
              }}
            />
            <Chip
              icon={<Target size={16} />}
              label="Karriere"
              onClick={() => setSelectedCategory('career')}
              sx={{
                backgroundColor: selectedCategory === 'career' ? '#06B6D4' : 'rgba(255,255,255,0.1)',
                color: selectedCategory === 'career' ? 'white' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.2)' }
              }}
            />
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          {roadmap.steps
            .filter(step => selectedCategory === null || step.category === selectedCategory)
            .map((step, index) => {
              const originalIndex = roadmap.steps.findIndex(s => s.id === step.id);
              const isRecommended = !step.completed && originalIndex === roadmap.steps.findIndex(s => !s.completed);
              const categoryColor = getCategoryColor(step.category);
              return (
            <Grid item xs={12} md={6} key={step.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}05)`,
                    border: `2px solid ${isRecommended ? categoryColor : `${categoryColor}40`}`,
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    boxShadow: isRecommended ? `0 0 20px ${categoryColor}40` : 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 35px ${categoryColor}30`,
                    },
                  }}
                >
                  {isRecommended && (
                    <Chip
                      label="⭐ Empfohlener nächster Schritt"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}CC)`,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        zIndex: 1,
                        boxShadow: `0 2px 10px ${categoryColor}50`
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3, pt: isRecommended ? 5 : 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Typography variant="h4">
                        {step.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontStyle: 'italic' }}>
                          👉 {step.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {step.estimatedTime}
                        </Typography>
                      </Box>
                      {step.completed && (
                        <CheckCircle size={24} color="#22c55e" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={getCategoryIcon(step.category)}
                        label={step.category}
                        size="small"
                        sx={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                          border: `1px solid ${categoryColor}40`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={step.level}
                        size="small"
                        sx={{
                          backgroundColor: `${getLevelColor(step.level)}20`,
                          color: getLevelColor(step.level),
                          fontSize: '0.7rem',
                        }}
                      />
                      {step.confidence && (
                        <Chip
                          label={`${Math.round(step.confidence * 100)}%`}
                          size="small"
                          sx={{
                            backgroundColor: '#10B981 20',
                            color: '#10B981',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>

                    {!step.completed && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                            Fortschritt
                          </Typography>
                          <Typography variant="body2" sx={{ color: categoryColor, fontWeight: 700 }}>
                            {step.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={step.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}CC)`,
                              borderRadius: 4,
                              boxShadow: `0 0 10px ${categoryColor}50`,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                          Fortschritt basiert auf abgeschlossenen Aufgaben
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={() => handleStepSelect(step)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        <ArrowRight size={16} />
                      </Button>
                      {!step.completed && (
                        <Button
                          size="small"
                          onClick={() => handleStepComplete(step.id)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            );
          })}
        </Grid>
      </motion.div>

      {/* Step Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {selectedStep?.icon} {selectedStep?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {selectedStep?.estimatedTime} • {selectedStep?.level}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}>
            {selectedStep?.description}
          </Typography>

          {/* Recommendations */}
          {selectedStep?.aiRecommendations && selectedStep.aiRecommendations.length > 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                background: 'rgba(242, 159, 5, 0.15)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#F29F05' }}>
                <Sparkles size={20} color="#F29F05" />
                ✨ Empfehlungen
              </Typography>
              <List dense>
                {selectedStep.aiRecommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText 
                      primary={recommendation}
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: '0.9rem',
                          color: 'white'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {/* Optimal Timing */}
          {selectedStep?.optimalTiming && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
            >
              <Typography variant="body2">
                <strong>⏰ Optimales Timing:</strong> {selectedStep.optimalTiming}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Benefits */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                ✅ Vorteile:
              </Typography>
              <List dense>
                {selectedStep?.benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle size={16} color="#22c55e" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Activities */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                🎯 Aktivitäten:
              </Typography>
              <List dense>
                {selectedStep?.activities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Target size={16} color="#F29F05" />
                    </ListItemIcon>
                    <ListItemText primary={activity} />
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
                {selectedStep?.prerequisites.map((prereq, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <BookOpen size={16} color="#f59e0b" />
                    </ListItemIcon>
                    <ListItemText primary={prereq} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Resources */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
                📚 Ressourcen:
              </Typography>
              <List dense>
                {selectedStep?.resources.map((resource, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <BookOpen size={16} color="#06B6D4" />
                    </ListItemIcon>
                    <ListItemText primary={resource} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={async () => {
              if (selectedStep) {
                const coaching = await getAICoaching(selectedStep);
                if (coaching) {
                  setAiCoaching(coaching);
                  setShowAICoaching(true);
                }
              }
            }} 
            variant="outlined"
            startIcon={<Sparkles size={16} />}
            sx={{ borderColor: '#F29F05', color: '#F29F05', '&:hover': { borderColor: '#F29F05', backgroundColor: 'rgba(242, 159, 5, 0.1)' } }}
          >
            Coaching
          </Button>
          {!selectedStep?.completed && (
            <Button 
              onClick={() => {
                if (selectedStep) {
                  handleStepComplete(selectedStep.id);
                  setShowDetails(false);
                }
              }} 
              variant="contained"
              startIcon={<CheckCircle size={16} />}
            >
              Als abgeschlossen markieren
            </Button>
          )}
          <Button onClick={() => setShowDetails(false)} variant="outlined">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coaching Dialog */}
      <Dialog 
        open={showAICoaching} 
        onClose={() => setShowAICoaching(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(11, 10, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(242, 159, 5, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          color: 'white',
          borderBottom: '1px solid rgba(242, 159, 5, 0.3)',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Sparkles size={24} color="#F29F05" />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#F29F05' }}>
              ✨ Coaching
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {aiCoaching && (
            <>
              <Typography variant="h6" sx={{ mb: 3, color: '#F29F05', textAlign: 'center', fontWeight: 600 }}>
                {aiCoaching.message}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb size={20} color="#F59E0B" />
                  💡 Coaching-Tipps:
                </Typography>
                <List>
                  {aiCoaching.tips.map((tip: string, index: number) => (
                    <ListItem key={index} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(242, 159, 5, 0.2)',
                          border: '1px solid rgba(242, 159, 5, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          color: '#F29F05',
                          fontWeight: 700
                        }}>
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={tip}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            color: 'white',
                            fontSize: '1rem',
                            lineHeight: 1.5
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(135deg, #10B981 20%, #059669 10%)',
                  border: '1px solid #10B981 40',
                  color: 'white'
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  🎯 Nächste Aktion: {aiCoaching.nextAction}
                </Typography>
              </Alert>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 1,
                mt: 2,
                p: 2,
                backgroundColor: 'rgba(242, 159, 5, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(242, 159, 5, 0.3)'
              }}>
                <Star size={16} color="#F29F05" />
                <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600 }}>
                  Empfehlungs-Qualität: {Math.round(aiCoaching.confidence * 100)}%
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowAICoaching(false)} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Verstanden! 🚀
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
