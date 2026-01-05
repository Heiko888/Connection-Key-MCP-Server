import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper, Chip, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { BookOpen, Star, Heart, Zap, Target, Calendar, Clock, TrendingUp, Moon } from 'lucide-react';

const moonPhases = [
  {
    name: 'Neumond',
    icon: '🌑',
    description: 'Neuer Anfang und Intention setzen',
    longDescription: 'Der Neumond markiert den Beginn eines neuen Mondzyklus. Die Sonne und der Mond stehen in Konjunktion, was bedeutet, dass sie sich am gleichen Ort im Tierkreis befinden.',
    energy: 'Niedrig',
    energyColor: '#ef4444',
    activities: [
      'Intentionen setzen und Ziele definieren',
      'Meditation und innere Einkehr',
      'Neue Projekte planen',
      'Rituale für Neubeginn',
      'Reflexion und Selbstbeobachtung'
    ],
    rituals: [
      'Intention-Board erstellen',
      'Neumond-Meditation',
      'Ziele aufschreiben und visualisieren',
      'Räuchern mit Salbei oder Palo Santo',
      'Mondwasser herstellen'
    ],
    crystals: ['Obsidian', 'Schwarzer Turmalin', 'Labradorit', 'Mondstein'],
    colors: ['Schwarz', 'Dunkelblau', 'Silber'],
    duration: '2-3 Tage',
    percentage: '0%'
  },
  {
    name: 'Zunehmender Sichelmond',
    icon: '🌒',
    description: 'Wachstum und Entwicklung',
    longDescription: 'Der zunehmende Sichelmond zeigt sich als schmale Sichel am Himmel. Diese Phase symbolisiert Wachstum, Entwicklung und das Sammeln von Energie für kommende Projekte.',
    energy: 'Steigend',
    energyColor: '#f59e0b',
    activities: [
      'Neue Fähigkeiten erlernen',
      'Projekte beginnen',
      'Energie aufbauen',
      'Positive Gewohnheiten entwickeln',
      'Kreative Projekte starten'
    ],
    rituals: [
      'Vision Board erstellen',
      'Energie-Meditation',
      'Positive Affirmationen',
      'Kreative Aktivitäten',
      'Pflanzen säen oder pflegen'
    ],
    crystals: ['Citrin', 'Tigerauge', 'Aventurin', 'Rosenquarz'],
    colors: ['Gelb', 'Orange', 'Rosa'],
    duration: '3-4 Tage',
    percentage: '25%'
  },
  {
    name: 'Erstes Viertel',
    icon: '🌓',
    description: 'Entscheidungen treffen und handeln',
    longDescription: 'Das erste Viertel zeigt eine halb beleuchtete Mondscheibe. Diese Phase fordert uns auf, Entscheidungen zu treffen und konkrete Schritte zu unternehmen.',
    energy: 'Mittel-Hoch',
    energyColor: '#10b981',
    activities: [
      'Entscheidungen treffen',
      'Projekte vorantreiben',
      'Konflikte lösen',
      'Struktur schaffen',
      'Verantwortung übernehmen'
    ],
    rituals: [
      'Entscheidungs-Meditation',
      'Problemlösungs-Ritual',
      'Energie-Reinigung',
      'Ziel-Überprüfung',
      'Aktionsplan erstellen'
    ],
    crystals: ['Sodalith', 'Lapis Lazuli', 'Aquamarin', 'Bergkristall'],
    colors: ['Blau', 'Grün', 'Weiß'],
    duration: '3-4 Tage',
    percentage: '50%'
  },
  {
    name: 'Zunehmender Gibbous',
    icon: '🌔',
    description: 'Verfeinerung und Perfektionierung',
    longDescription: 'Der zunehmende Gibbous-Mond ist fast vollständig beleuchtet. Diese Phase ist ideal für die Verfeinerung von Projekten und die Perfektionierung von Fähigkeiten.',
    energy: 'Hoch',
    energyColor: '#8b5cf6',
    activities: [
      'Projekte verfeinern',
      'Fähigkeiten perfektionieren',
      'Details optimieren',
      'Qualität verbessern',
      'Vorbereitung auf Vollmond'
    ],
    rituals: [
      'Perfektionierungs-Meditation',
      'Detail-Ritual',
      'Qualitäts-Überprüfung',
      'Energie-Auffüllung',
      'Vollmond-Vorbereitung'
    ],
    crystals: ['Amethyst', 'Saphir', 'Diamant', 'Bergkristall'],
    colors: ['Lila', 'Blau', 'Weiß'],
    duration: '3-4 Tage',
    percentage: '75%'
  },
  {
    name: 'Vollmond',
    icon: '🌕',
    description: 'Höhepunkt, Erleuchtung und Manifestation',
    longDescription: 'Der Vollmond ist der Höhepunkt des Mondzyklus. Sonne und Mond stehen sich gegenüber, was zu maximaler Beleuchtung führt. Diese Phase ist ideal für Manifestation und Erleuchtung.',
    energy: 'Maximal',
    energyColor: '#fbbf24',
    activities: [
      'Manifestation von Wünschen',
      'Feiern und Dankbarkeit',
      'Erleuchtung und Einsicht',
      'Kreative Höchstleistungen',
      'Rituale und Zeremonien'
    ],
    rituals: [
      'Vollmond-Meditation',
      'Manifestations-Ritual',
      'Dankbarkeits-Zeremonie',
      'Mondbaden',
      'Kreative Projekte'
    ],
    crystals: ['Mondstein', 'Perle', 'Selenit', 'Bergkristall'],
    colors: ['Silber', 'Weiß', 'Gelb'],
    duration: '2-3 Tage',
    percentage: '100%'
  },
  {
    name: 'Abnehmender Gibbous',
    icon: '🌖',
    description: 'Dankbarkeit und Weitergabe',
    longDescription: 'Der abnehmende Gibbous-Mond beginnt sich zu verkleinern. Diese Phase ist ideal für Dankbarkeit, das Teilen von Wissen und die Weitergabe von Erfahrungen.',
    energy: 'Hoch',
    energyColor: '#ec4899',
    activities: [
      'Dankbarkeit praktizieren',
      'Wissen teilen',
      'Erfahrungen weitergeben',
      'Mentoring',
      'Gemeinschaftsarbeit'
    ],
    rituals: [
      'Dankbarkeits-Meditation',
      'Sharing-Ritual',
      'Wissens-Transfer',
      'Gemeinschafts-Zeremonie',
      'Reflexion der Erfolge'
    ],
    crystals: ['Rosenquarz', 'Rhodonit', 'Pink Opal', 'Morganit'],
    colors: ['Rosa', 'Pink', 'Rot'],
    duration: '3-4 Tage',
    percentage: '75%'
  },
  {
    name: 'Letztes Viertel',
    icon: '🌗',
    description: 'Loslassen und Vergebung',
    longDescription: 'Das letzte Viertel zeigt eine abnehmende Mondscheibe. Diese Phase fordert uns auf, loszulassen, zu vergeben und uns von dem zu befreien, was uns nicht mehr dient.',
    energy: 'Mittel',
    energyColor: '#6b7280',
    activities: [
      'Loslassen von Altem',
      'Vergebung praktizieren',
      'Aufräumen und Entrümpeln',
      'Beziehungen klären',
      'Sich von Toxischem befreien'
    ],
    rituals: [
      'Loslass-Meditation',
      'Vergebungs-Ritual',
      'Reinigungs-Zeremonie',
      'Entrümpelungs-Ritual',
      'Beziehungs-Klärung'
    ],
    crystals: ['Obsidian', 'Schwarzer Turmalin', 'Smokey Quarz', 'Hämatit'],
    colors: ['Schwarz', 'Grau', 'Dunkelblau'],
    duration: '3-4 Tage',
    percentage: '50%'
  },
  {
    name: 'Abnehmender Sichelmond',
    icon: '🌘',
    description: 'Ruhe und Regeneration',
    longDescription: 'Der abnehmende Sichelmond ist die letzte Phase vor dem Neumond. Diese Phase ist ideal für Ruhe, Regeneration und die Vorbereitung auf einen neuen Zyklus.',
    energy: 'Niedrig',
    energyColor: '#1f2937',
    activities: [
      'Ruhe und Entspannung',
      'Regeneration',
      'Reflexion und Integration',
      'Vorbereitung auf Neumond',
      'Innere Einkehr'
    ],
    rituals: [
      'Ruhe-Meditation',
      'Regenerations-Ritual',
      'Integration-Zeremonie',
      'Schlaf-Ritual',
      'Neumond-Vorbereitung'
    ],
    crystals: ['Mondstein', 'Labradorit', 'Selenit', 'Amethyst'],
    colors: ['Silber', 'Blau', 'Lila'],
    duration: '2-3 Tage',
    percentage: '25%'
  }
];

export default function MoonPhasesGuideTab() {
  const [expandedPhase, setExpandedPhase] = useState<string | false>(false);

  const handleAccordionChange = (phaseName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPhase(isExpanded ? phaseName : false);
  };

  const getEnergyLevel = (energy: string) => {
    switch (energy) {
      case 'Maximal':
        return { level: 5, color: '#fbbf24' };
      case 'Hoch':
        return { level: 4, color: '#8b5cf6' };
      case 'Mittel-Hoch':
        return { level: 3, color: '#10b981' };
      case 'Mittel':
        return { level: 2, color: '#6b7280' };
      case 'Steigend':
        return { level: 2, color: '#f59e0b' };
      case 'Niedrig':
        return { level: 1, color: '#ef4444' };
      default:
        return { level: 1, color: '#6b7280' };
    }
  };

  return (
    <motion.div
      
      
      
    >
      <Card sx={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(254,243,199,0.2)'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <BookOpen size={24} color="#fef3c7" />
            <Typography variant="h5" sx={{
              color: '#fef3c7',
              fontWeight: 700,
              ml: 2
            }}>
              Mondphasen Guide
            </Typography>
          </Box>

          {/* Introduction */}
          <Paper sx={{
            p: 3,
            mb: 4,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(254,243,199,0.1)',
            borderRadius: 2
          }}>
            <Typography sx={{
              color: '#fef3c7',
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Moon size={20} />
              Der Mondzyklus
            </Typography>
            <Typography sx={{
              color: 'rgba(254,243,199,0.8)',
              lineHeight: 1.6,
              mb: 2
            }}>
              Der Mond durchläuft in etwa 29,5 Tagen einen vollständigen Zyklus. Jede Phase hat ihre eigene Energie und Bedeutung. 
              Lerne, wie du die Mondphasen für dein persönliches Wachstum und deine Manifestation nutzen kannst.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="29.5 Tage Zyklus"
                icon={<Calendar size={16} />}
                sx={{
                  background: 'rgba(59,130,246,0.2)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59,130,246,0.3)'
                }}
              />
              <Chip
                label="8 Hauptphasen"
                icon={<Star size={16} />}
                sx={{
                  background: 'rgba(34,197,94,0.2)',
                  color: '#86efac',
                  border: '1px solid rgba(34,197,94,0.3)'
                }}
              />
              <Chip
                label="Persönliches Wachstum"
                icon={<TrendingUp size={16} />}
                sx={{
                  background: 'rgba(168,85,247,0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(168,85,247,0.3)'
                }}
              />
            </Box>
          </Paper>

          {/* Moon Phases Grid */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3 }}>
              Alle Mondphasen im Überblick
            </Typography>
            <Grid container spacing={2}>
              {moonPhases.map((phase, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={phase.name}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        height: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(254,243,199,0.1)',
                          borderColor: 'rgba(254,243,199,0.3)'
                        }
                      }}
                      onClick={() => setExpandedPhase(expandedPhase === phase.name ? false : phase.name)}
                    >
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                          {phase.icon}
                        </Typography>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 600,
                          fontSize: '1rem',
                          mb: 0.5
                        }}>
                          {phase.name}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.7)',
                          fontSize: '0.8rem',
                          mb: 1
                        }}>
                          {phase.description}
                        </Typography>
                        <Chip
                          label={phase.energy}
                          size="small"
                          sx={{
                            background: `${getEnergyLevel(phase.energy).color}20`,
                            color: getEnergyLevel(phase.energy).color,
                            border: `1px solid ${getEnergyLevel(phase.energy).color}`,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Detailed Phase Information */}
          <Box>
            <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3 }}>
              Detaillierte Informationen
            </Typography>
            {moonPhases.map((phase) => (
              <Accordion
                key={phase.name}
                expanded={expandedPhase === phase.name}
                onChange={handleAccordionChange(phase.name)}
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(254,243,199,0.1)',
                  borderRadius: 2,
                  mb: 2,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    background: 'rgba(254,243,199,0.1)',
                    borderColor: 'rgba(254,243,199,0.3)'
                  }
                }}
              >
                <AccordionSummary
                  sx={{
                    color: '#fef3c7',
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {phase.icon}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {phase.name}
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(254,243,199,0.7)',
                      fontSize: '0.9rem'
                    }}>
                      {phase.description}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{
                      color: 'rgba(254,243,199,0.8)',
                      lineHeight: 1.6,
                      mb: 2
                    }}>
                      {phase.longDescription}
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Energy Level */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{
                            color: '#fef3c7',
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Zap size={16} />
                            Energie
                          </Typography>
                          <Chip
                            label={phase.energy}
                            sx={{
                              background: `${getEnergyLevel(phase.energy).color}20`,
                              color: getEnergyLevel(phase.energy).color,
                              border: `1px solid ${getEnergyLevel(phase.energy).color}`
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Duration */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{
                            color: '#fef3c7',
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Clock size={16} />
                            Dauer
                          </Typography>
                          <Typography sx={{ color: 'rgba(254,243,199,0.8)' }}>
                            {phase.duration}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Percentage */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{
                            color: '#fef3c7',
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Target size={16} />
                            Beleuchtung
                          </Typography>
                          <Typography sx={{ color: 'rgba(254,243,199,0.8)' }}>
                            {phase.percentage}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Colors */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{
                            color: '#fef3c7',
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Star size={16} />
                            Farben
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {phase.colors.map((color, index) => (
                              <Chip
                                key={index}
                                label={color}
                                size="small"
                                sx={{
                                  background: 'rgba(254,243,199,0.1)',
                                  color: '#fef3c7',
                                  border: '1px solid rgba(254,243,199,0.2)',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(254,243,199,0.1)', my: 2 }} />

                  <Grid container spacing={3}>
                    {/* Activities */}
                    <Grid item xs={12} md={6}>
                      <Typography sx={{
                        color: '#fef3c7',
                        fontWeight: 600,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <TrendingUp size={18} />
                        Empfohlene Aktivitäten
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {phase.activities.map((activity, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Typography sx={{ color: '#fef3c7', fontSize: '0.8rem' }}>
                                ✨
                              </Typography>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography sx={{
                                  color: 'rgba(254,243,199,0.8)',
                                  fontSize: '0.9rem'
                                }}>
                                  {activity}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    {/* Rituals */}
                    <Grid item xs={12} md={6}>
                      <Typography sx={{
                        color: '#fef3c7',
                        fontWeight: 600,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Heart size={18} />
                        Rituale & Praktiken
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {phase.rituals.map((ritual, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Typography sx={{ color: '#fef3c7', fontSize: '0.8rem' }}>
                                🌙
                              </Typography>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography sx={{
                                  color: 'rgba(254,243,199,0.8)',
                                  fontSize: '0.9rem'
                                }}>
                                  {ritual}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>

                  {/* Crystals */}
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Star size={18} />
                      Unterstützende Kristalle
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {phase.crystals.map((crystal, index) => (
                        <Chip
                          key={index}
                          label={crystal}
                          sx={{
                            background: 'rgba(168,85,247,0.2)',
                            color: '#c4b5fd',
                            border: '1px solid rgba(168,85,247,0.3)',
                            fontSize: '0.8rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
