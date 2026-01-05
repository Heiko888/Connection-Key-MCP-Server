"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  Settings,
  Download,
  Share2,
  ChevronDown,
  Star
} from 'lucide-react';

// AnimatedStars Komponente (wie im Journal)
const AnimatedStars = () => (
  <Box sx={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0
  }}>
    {[...Array(20)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
          animationDelay: `${Math.random() * 2}s`,
          '@keyframes twinkle': {
            '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.2)' }
          }
        }}
      />
    ))}
  </Box>
);

interface ReadingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'fixed' | 'variable';
  order: number;
  isActive: boolean;
}

interface ReadingTemplate {
  id: string;
  name: string;
  description: string;
  modules: string[];
  category: 'business' | 'relationship' | 'spiritual' | 'personal' | 'general';
  isActive: boolean;
}

interface ReadingBuilderProps {
  userId: string;
}

export default function ReadingBuilder({ userId }: ReadingBuilderProps) {
  // userId wird für zukünftige Erweiterungen benötigt
  const [templates, setTemplates] = useState<ReadingTemplate[]>([]);
  const [modules, setModules] = useState<ReadingModule[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [context, setContext] = useState({
    question: '',
    situation: '',
    timeframe: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedReading, setGeneratedReading] = useState<{
    id: string;
    title: string;
    content: string;
    timestamp: string;
  } | null>(null);

  // Templates und Module laden
  useEffect(() => {
    loadTemplates();
    loadModules();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/reading/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Templates:', err);
    }
  };

  const loadModules = async () => {
    try {
      const response = await fetch('/api/reading/modules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setModules(data.modules);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Module:', err);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedModules(template.modules);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const generateFallbackReading = () => {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    const selectedModulesData = modules.filter(m => selectedModules.includes(m.id));
    
    let content = '';
    
    if (selectedTemplateData && selectedTemplateData.modules) {
      // Wenn ein Template ausgewählt ist, verwende die Module des Templates
      const templateModules = modules.filter(m => selectedTemplateData.modules.includes(m.id));
      content = templateModules.map(module => 
        `## ${module.title}\n\n${module.content || 'Kein Inhalt verfügbar'}`
      ).join('\n\n');
    } else if (selectedModulesData.length > 0) {
      // Wenn einzelne Module ausgewählt sind
      content = selectedModulesData.map(module => 
        `## ${module.title}\n\n${module.content || 'Kein Inhalt verfügbar'}`
      ).join('\n\n');
    } else {
      // Fallback-Content wenn nichts gefunden wird
      content = `# Reading für ${context.question || 'Ihre Frage'}

## Einleitung
Dieses Reading wurde basierend auf Ihrer Situation erstellt: ${context.situation || 'Allgemeine Situation'}

## Zeitrahmen
${context.timeframe || 'Aktuell'}

## Empfehlung
Bitte wählen Sie ein Template oder Module aus, um ein detaillierteres Reading zu erhalten.`;
    }
    
    // Ersetze Platzhalter nur wenn content existiert
    if (content) {
      content = content
        .replace(/\{question\}/g, context.question || 'Keine spezifische Frage')
        .replace(/\{situation\}/g, context.situation || 'Allgemeine Situation')
        .replace(/\{timeframe\}/g, context.timeframe || 'Aktuell');
    }
    
    return {
      id: Date.now().toString(),
      title: selectedTemplateData?.name || 'Custom Reading',
      content: content || 'Kein Inhalt verfügbar',
      timestamp: new Date().toISOString()
    };
  };

  const generateReading = async () => {
    if (!selectedTemplate && selectedModules.length === 0) {
      setError('Bitte wählen Sie ein Template oder mindestens ein Modul aus');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestBody = {
        templateId: selectedTemplate || 'custom',
        customModules: selectedTemplate ? undefined : selectedModules,
        context: {
          question: context.question,
          situation: context.situation,
          timeframe: context.timeframe
        }
      };

      const response = await fetch('/api/reading/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        setError('Backend nicht verfügbar. Verwende lokale Generierung.');
        // Fallback: Lokale Reading-Generierung
        const fallbackReading = generateFallbackReading();
        setGeneratedReading(fallbackReading);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Ungültige Antwort vom Server. Verwende lokale Generierung.');
        const fallbackReading = generateFallbackReading();
        setGeneratedReading(fallbackReading);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedReading(data.reading);
      } else {
        setError(data.error || 'Fehler beim Generieren des Readings');
      }
    } catch (err) {
      console.error('Fehler beim Generieren des Readings:', err);
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedModulesData = () => {
    return modules.filter(module => selectedModules.includes(module.id));
  };

  const getTemplateName = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    return template ? template.name : 'Custom Reading';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at top, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatedStars />
      
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
              <Star size={48} color="#FFD700" />
              <Typography variant="h1" sx={{
                color: '#FFD700',
                fontWeight: 800,
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                fontSize: { xs: '2.5rem', md: '4rem' },
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Reading-Baukasten
              </Typography>
              <Star size={48} color="#FFD700" />
            </Box>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography variant="h5" sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 6,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.4,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                Erstelle professionelle Readings mit der universellen Grundstruktur. 
                Perfekt für Business, Beziehungen, Spiritualität und Persönlichkeitsentwicklung.
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        {/* Fehler-Anzeige */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Linke Spalte - Konfiguration */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                  borderColor: 'rgba(255,255,255,0.4)',
                }
              }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#FFD700',
                  fontWeight: 700
                }}>
                  <Settings size={20} style={{ marginRight: 8 }} />
                  Reading konfigurieren
                </Typography>

                {/* Template-Auswahl */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Reading-Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    label="Reading-Template"
                  >
                    <MenuItem value="">
                      <em>Custom Reading erstellen</em>
                    </MenuItem>
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {template.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Kontext-Informationen */}
                <Accordion sx={{ mb: 3 }}>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="subtitle1">Kontext & Fragen</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      label="Deine Frage"
                      value={context.question}
                      onChange={(e) => setContext(prev => ({ ...prev, question: e.target.value }))}
                      sx={{ mb: 2 }}
                      multiline
                      rows={2}
                    />
                    <TextField
                      fullWidth
                      label="Aktuelle Situation"
                      value={context.situation}
                      onChange={(e) => setContext(prev => ({ ...prev, situation: e.target.value }))}
                      sx={{ mb: 2 }}
                      multiline
                      rows={2}
                    />
                    <TextField
                      fullWidth
                      label="Zeitraum"
                      value={context.timeframe}
                      onChange={(e) => setContext(prev => ({ ...prev, timeframe: e.target.value }))}
                      placeholder="z.B. nächste 3 Monate, dieses Jahr"
                    />
                  </AccordionDetails>
                </Accordion>

                {/* Modul-Auswahl */}
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Module auswählen ({selectedModules.length})
                </Typography>
                
                <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
                  {modules.map((module) => (
                    <Chip
                      key={module.id}
                      label={module.title}
                      color={selectedModules.includes(module.id) ? 'primary' : 'default'}
                      onClick={() => handleModuleToggle(module.id)}
                      sx={{ 
                        m: 0.5,
                        cursor: 'pointer',
                        opacity: module.category === 'fixed' ? 0.7 : 1
                      }}
                      disabled={module.category === 'fixed'}
                    />
                  ))}
                </Box>

                {/* Generate Button */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={generateReading}
                  disabled={loading || (selectedModules.length === 0 && !selectedTemplate)}
                  sx={{ 
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    color: '#1a1a2e',
                    fontWeight: 'bold',
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFA500, #FFD700)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <Play size={20} style={{ marginRight: 8 }} />
                      Reading generieren
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          </Grid>

          {/* Rechte Spalte - Vorschau */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                  borderColor: 'rgba(255,255,255,0.4)',
                }
              }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#FFD700',
                  fontWeight: 700
                }}>
                  <BookOpen size={20} style={{ marginRight: 8 }} />
                  Reading-Vorschau
                </Typography>

                {selectedModules.length > 0 ? (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#ffffff',
                      fontWeight: 600
                    }}>
                      {getTemplateName()}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      mb: 3, 
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      {selectedModules.length} Module ausgewählt
                    </Typography>

                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {getSelectedModulesData()
                        .sort((a, b) => a.order - b.order)
                        .map((module, index) => (
                          <Box key={module.id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 'bold',
                              color: module.category === 'fixed' ? '#FFD700' : '#ffffff'
                            }}>
                              {index + 1}. {module.title}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.8)', 
                              mb: 1 
                            }}>
                              {module.description}
                            </Typography>
                            <Chip 
                              label={module.category === 'fixed' ? 'Fix' : 'Variabel'} 
                              size="small"
                              color={module.category === 'fixed' ? 'warning' : 'primary'}
                            />
                          </Box>
                        ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Wählen Sie ein Template oder Module aus, um eine Vorschau zu sehen
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Generiertes Reading */}
        {generatedReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ 
              mt: 4,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                borderColor: 'rgba(255,255,255,0.4)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ 
                    color: '#FFD700', 
                    fontWeight: 'bold',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}>
                    {generatedReading.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{ color: '#FFD700', borderColor: '#FFD700' }}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share2 />}
                      sx={{ color: '#FFD700', borderColor: '#FFD700' }}
                    >
                      Teilen
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1rem'
                }}>
                  {generatedReading.content}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </Container>
    </Box>
  );
}
