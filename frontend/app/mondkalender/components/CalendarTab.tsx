import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  Paper, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Moon, Sparkles, Heart, Target, Zap, BookOpen, Star, CheckCircle } from 'lucide-react';
import { fetchMonthCalendar } from '../moonApi';

interface CalendarTabProps {
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}

interface CalendarDay {
  date: string;
  day: number;
  phase: {
    name: string;
    icon: string;
    energy: string;
  };
}

interface DailyUsagePopupProps {
  open: boolean;
  onClose: () => void;
  selectedDay: CalendarDay | null;
  currentMonth: Date;
  onSaveToJournal: (day: CalendarDay, month: Date, phaseDetails: PhaseDetails) => void;
}

interface PhaseDetails {
  description: string;
  energy: string;
  dailyUsage: string[];
  activities: string[];
  avoid: string[];
}

// Popup-Komponente für den täglichen Gebrauch
function DailyUsagePopup({ 
  open, 
  onClose, 
  selectedDay, 
  currentMonth, 
  onSaveToJournal 
}: DailyUsagePopupProps) {
  if (!selectedDay) return null;

  const getPhaseDetails = (phaseName: string): PhaseDetails => {
    const phaseDetails: { [key: string]: PhaseDetails } = {
      'Neumond': {
        description: 'Zeit der neuen Anfänge und Intentionen',
        energy: 'Introspektiv & Manifestierend',
        dailyUsage: [
          'Neue Projekte starten und Ziele setzen',
          'Meditation und innere Einkehr',
          'Intentionen für den Monat formulieren',
          'Rituale der Reinigung und des Neubeginns',
          'Vision Board erstellen oder aktualisieren'
        ],
        activities: [
          'Planung und Strategie',
          'Kreative Projekte',
          'Persönliche Entwicklung',
          'Beziehungen neu definieren'
        ],
        avoid: [
          'Überstürzte Entscheidungen',
          'Zu viele Verpflichtungen eingehen',
          'Oberflächliche Gespräche'
        ]
      },
      'Zunehmender Sichelmond': {
        description: 'Zeit des Wachstums und der Entwicklung',
        energy: 'Dynamisch & Wachsend',
        dailyUsage: [
          'Bestehende Projekte vorantreiben',
          'Neue Fähigkeiten erlernen',
          'Netzwerken und Kontakte knüpfen',
          'Energie für Ziele sammeln',
          'Positive Affirmationen'
        ],
        activities: [
          'Lernen und Studieren',
          'Soziale Aktivitäten',
          'Körperliche Bewegung',
          'Geschäftliche Entwicklung'
        ],
        avoid: [
          'Projekte aufgeben',
          'Isolation',
          'Negative Gedanken'
        ]
      },
      'Erstes Viertel': {
        description: 'Zeit der Entscheidungen und des Handelns',
        energy: 'Aktiv & Entscheidungsfreudig',
        dailyUsage: [
          'Wichtige Entscheidungen treffen',
          'Konflikte lösen und klären',
          'Projekte in die Tat umsetzen',
          'Verantwortung übernehmen',
          'Führungsqualitäten entwickeln'
        ],
        activities: [
          'Verhandlungen und Gespräche',
          'Projektmanagement',
          'Teamarbeit',
          'Körperliche Herausforderungen'
        ],
        avoid: [
          'Aufschieben von Entscheidungen',
          'Passivität',
          'Konflikte vermeiden'
        ]
      },
      'Zunehmender Gibbous': {
        description: 'Zeit der Verfeinerung und des Feintunings',
        energy: 'Analytisch & Perfektionistisch',
        dailyUsage: [
          'Projekte verfeinern und optimieren',
          'Details überprüfen und korrigieren',
          'Qualitätssicherung',
          'Feedback einholen und umsetzen',
          'Systeme und Prozesse verbessern'
        ],
        activities: [
          'Qualitätskontrolle',
          'Datenanalyse',
          'Prozessoptimierung',
          'Kreative Verfeinerung'
        ],
        avoid: [
          'Überperfektionismus',
          'Zu viele Änderungen',
          'Kritik an anderen'
        ]
      },
      'Vollmond': {
        description: 'Zeit der Vollendung und des Feierns',
        energy: 'Emotional & Intensiv',
        dailyUsage: [
          'Projekte abschließen und feiern',
          'Erfolge würdigen und teilen',
          'Emotionale Verbindungen vertiefen',
          'Intuition und Kreativität nutzen',
          'Rituale der Dankbarkeit'
        ],
        activities: [
          'Feiern und Zusammenkünfte',
          'Kreative Ausdrucksformen',
          'Emotionale Gespräche',
          'Spirituelle Praktiken'
        ],
        avoid: [
          'Neue Projekte starten',
          'Konflikte eskalieren lassen',
          'Übermäßiger Stress'
        ]
      },
      'Abnehmender Gibbous': {
        description: 'Zeit der Reflexion und des Teilens',
        energy: 'Kommunikativ & Reflektierend',
        dailyUsage: [
          'Erfahrungen reflektieren und teilen',
          'Wissen weitergeben',
          'Beziehungen pflegen',
          'Gemeinschaft stärken',
          'Lektionen aus Projekten ziehen'
        ],
        activities: [
          'Mentoring und Coaching',
          'Gemeinschaftsarbeit',
          'Reflexion und Journaling',
          'Soziale Medien und Kommunikation'
        ],
        avoid: [
          'Neue Verpflichtungen',
          'Isolation',
          'Oberflächliche Gespräche'
        ]
      },
      'Letztes Viertel': {
        description: 'Zeit der Reinigung und des Loslassens',
        energy: 'Transformativ & Befreiend',
        dailyUsage: [
          'Alte Gewohnheiten loslassen',
          'Aufräumen und entrümpeln',
          'Vergebungsarbeit',
          'Emotionale Reinigung',
          'Vorbereitung auf Neues'
        ],
        activities: [
          'Aufräumen und Organisieren',
          'Therapie und Heilung',
          'Spirituelle Reinigung',
          'Körperliche Entgiftung'
        ],
        avoid: [
          'Neue Projekte starten',
          'Festhalten an Altem',
          'Übermäßige Aktivität'
        ]
      },
      'Abnehmender Sichelmond': {
        description: 'Zeit der Ruhe und des Rückzugs',
        energy: 'Meditativ & Regenerierend',
        dailyUsage: [
          'Ruhe und Entspannung',
          'Meditation und Gebet',
          'Traumarbeit und Intuition',
          'Körperliche Regeneration',
          'Vorbereitung auf den Neumond'
        ],
        activities: [
          'Meditation und Yoga',
          'Schlaf und Ruhe',
          'Traumtagebuch führen',
          'Sanfte Bewegung'
        ],
        avoid: [
          'Übermäßige Aktivität',
          'Stress und Hektik',
          'Neue Verpflichtungen'
        ]
      }
    };
    
    return phaseDetails[phaseName] || {
      description: 'Mondphase-Informationen',
      energy: 'Neutral',
      dailyUsage: ['Keine spezifischen Empfehlungen verfügbar'],
      activities: [],
      avoid: []
    };
  };

  const phaseDetails = getPhaseDetails(selectedDay.phase.name);
  const fullDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay.day);
  const formattedDate = fullDate.toLocaleDateString('de-DE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '2px solid rgba(254,243,199,0.3)',
          borderRadius: 3,
          backdropFilter: 'blur(20px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#fef3c7', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(254,243,199,0.2)',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
          <Moon size={28} color="#fef3c7" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formattedDate}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontSize: '2rem' }}>
            {selectedDay.phase.icon}
          </Typography>
          <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 600 }}>
            {selectedDay.phase.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sparkles size={20} color="#fef3c7" />
            Beschreibung
          </Typography>
          <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 2, fontStyle: 'italic' }}>
            {phaseDetails.description}
          </Typography>
          <Chip 
            label={phaseDetails.energy}
            sx={{
              background: 'rgba(254,243,199,0.2)',
              color: '#fef3c7',
              border: '1px solid rgba(254,243,199,0.3)',
              fontWeight: 600
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Täglicher Gebrauch */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'rgba(254,243,199,0.1)', 
              border: '1px solid rgba(254,243,199,0.2)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Target size={20} color="#fef3c7" />
                  Täglicher Gebrauch
                </Typography>
                <List dense>
                  {phaseDetails.dailyUsage.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Star size={16} color="#fef3c7" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item}
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            color: 'rgba(254,243,199,0.9)',
                            fontSize: '0.9rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Empfohlene Aktivitäten */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'rgba(254,243,199,0.1)', 
              border: '1px solid rgba(254,243,199,0.2)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Zap size={20} color="#fef3c7" />
                  Empfohlene Aktivitäten
                </Typography>
                <List dense>
                  {phaseDetails.activities.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Heart size={16} color="#fef3c7" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item}
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            color: 'rgba(254,243,199,0.9)',
                            fontSize: '0.9rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Vermeiden */}
        {phaseDetails.avoid.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Card sx={{ 
              background: 'rgba(239,68,68,0.1)', 
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpen size={20} color="#fef3c7" />
                  Besser vermeiden
                </Typography>
                <List dense>
                  {phaseDetails.avoid.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Typography sx={{ color: 'rgba(239,68,68,0.8)', fontSize: '1.2rem' }}>⚠️</Typography>
                      </ListItemIcon>
                      <ListItemText 
                        primary={item}
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            color: 'rgba(254,243,199,0.9)',
                            fontSize: '0.9rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#fef3c7',
            color: '#fef3c7',
            '&:hover': {
              borderColor: '#fbbf24',
              color: '#fbbf24',
              bgcolor: 'rgba(254,243,199,0.1)'
            }
          }}
        >
          Schließen
        </Button>
                 <Button
           variant="contained"
           onClick={() => {
             const phaseDetails = getPhaseDetails(selectedDay.phase.name);
             onSaveToJournal(selectedDay, currentMonth, phaseDetails);
           }}
           sx={{
             background: 'linear-gradient(45deg, #fef3c7, #fbbf24)',
             color: '#1a1a2e',
             fontWeight: 600,
             '&:hover': {
               background: 'linear-gradient(45deg, #fbbf24, #fef3c7)'
             }
           }}
         >
           Für heute merken ✨
         </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CalendarTab({ currentMonth, setCurrentMonth }: CalendarTabProps) {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showDailyUsagePopup, setShowDailyUsagePopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [savingToJournal, setSavingToJournal] = useState(false);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await fetchMonthCalendar(year, month);
      setCalendarData(data.calendar || []);
    } catch (error) {
      console.error('Fehler beim Laden des Kalenders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Abrufen der Mondphasen-Details
  const getPhaseDetails = (phaseName: string): PhaseDetails => {
    const phaseDetails: { [key: string]: PhaseDetails } = {
      'Neumond': {
        description: 'Zeit der neuen Anfänge und Intentionen',
        energy: 'Introspektiv & Manifestierend',
        dailyUsage: [
          'Neue Projekte starten und Ziele setzen',
          'Meditation und innere Einkehr',
          'Intentionen für den Monat formulieren',
          'Rituale der Reinigung und des Neubeginns',
          'Vision Board erstellen oder aktualisieren'
        ],
        activities: [
          'Planung und Strategie',
          'Kreative Projekte',
          'Persönliche Entwicklung',
          'Beziehungen neu definieren'
        ],
        avoid: [
          'Überstürzte Entscheidungen',
          'Zu viele Verpflichtungen eingehen',
          'Oberflächliche Gespräche'
        ]
      },
      'Zunehmender Sichelmond': {
        description: 'Zeit des Wachstums und der Entwicklung',
        energy: 'Dynamisch & Wachsend',
        dailyUsage: [
          'Bestehende Projekte vorantreiben',
          'Neue Fähigkeiten erlernen',
          'Netzwerken und Kontakte knüpfen',
          'Energie für Ziele sammeln',
          'Positive Affirmationen'
        ],
        activities: [
          'Lernen und Studieren',
          'Soziale Aktivitäten',
          'Körperliche Bewegung',
          'Geschäftliche Entwicklung'
        ],
        avoid: [
          'Projekte aufgeben',
          'Isolation',
          'Negative Gedanken'
        ]
      },
      'Erstes Viertel': {
        description: 'Zeit der Entscheidungen und des Handelns',
        energy: 'Aktiv & Entscheidungsfreudig',
        dailyUsage: [
          'Wichtige Entscheidungen treffen',
          'Konflikte lösen und klären',
          'Projekte in die Tat umsetzen',
          'Verantwortung übernehmen',
          'Führungsqualitäten entwickeln'
        ],
        activities: [
          'Verhandlungen und Gespräche',
          'Projektmanagement',
          'Teamarbeit',
          'Körperliche Herausforderungen'
        ],
        avoid: [
          'Aufschieben von Entscheidungen',
          'Passivität',
          'Konflikte vermeiden'
        ]
      },
      'Zunehmender Gibbous': {
        description: 'Zeit der Verfeinerung und des Feintunings',
        energy: 'Analytisch & Perfektionistisch',
        dailyUsage: [
          'Projekte verfeinern und optimieren',
          'Details überprüfen und korrigieren',
          'Qualitätssicherung',
          'Feedback einholen und umsetzen',
          'Systeme und Prozesse verbessern'
        ],
        activities: [
          'Qualitätskontrolle',
          'Datenanalyse',
          'Prozessoptimierung',
          'Kreative Verfeinerung'
        ],
        avoid: [
          'Überperfektionismus',
          'Zu viele Änderungen',
          'Kritik an anderen'
        ]
      },
      'Vollmond': {
        description: 'Zeit der Vollendung und des Feierns',
        energy: 'Emotional & Intensiv',
        dailyUsage: [
          'Projekte abschließen und feiern',
          'Erfolge würdigen und teilen',
          'Emotionale Verbindungen vertiefen',
          'Intuition und Kreativität nutzen',
          'Rituale der Dankbarkeit'
        ],
        activities: [
          'Feiern und Zusammenkünfte',
          'Kreative Ausdrucksformen',
          'Emotionale Gespräche',
          'Spirituelle Praktiken'
        ],
        avoid: [
          'Neue Projekte starten',
          'Konflikte eskalieren lassen',
          'Übermäßiger Stress'
        ]
      },
      'Abnehmender Gibbous': {
        description: 'Zeit der Reflexion und des Teilens',
        energy: 'Kommunikativ & Reflektierend',
        dailyUsage: [
          'Erfahrungen reflektieren und teilen',
          'Wissen weitergeben',
          'Beziehungen pflegen',
          'Gemeinschaft stärken',
          'Lektionen aus Projekten ziehen'
        ],
        activities: [
          'Mentoring und Coaching',
          'Gemeinschaftsarbeit',
          'Reflexion und Journaling',
          'Soziale Medien und Kommunikation'
        ],
        avoid: [
          'Neue Verpflichtungen',
          'Isolation',
          'Oberflächliche Gespräche'
        ]
      },
      'Letztes Viertel': {
        description: 'Zeit der Reinigung und des Loslassens',
        energy: 'Transformativ & Befreiend',
        dailyUsage: [
          'Alte Gewohnheiten loslassen',
          'Aufräumen und entrümpeln',
          'Vergebungsarbeit',
          'Emotionale Reinigung',
          'Vorbereitung auf Neues'
        ],
        activities: [
          'Aufräumen und Organisieren',
          'Therapie und Heilung',
          'Spirituelle Reinigung',
          'Körperliche Entgiftung'
        ],
        avoid: [
          'Neue Projekte starten',
          'Festhalten an Altem',
          'Übermäßige Aktivität'
        ]
      },
      'Abnehmender Sichelmond': {
        description: 'Zeit der Ruhe und des Rückzugs',
        energy: 'Meditativ & Regenerierend',
        dailyUsage: [
          'Ruhe und Entspannung',
          'Meditation und Gebet',
          'Traumarbeit und Intuition',
          'Körperliche Regeneration',
          'Vorbereitung auf den Neumond'
        ],
        activities: [
          'Meditation und Yoga',
          'Schlaf und Ruhe',
          'Traumtagebuch führen',
          'Sanfte Bewegung'
        ],
        avoid: [
          'Übermäßige Aktivität',
          'Stress und Hektik',
          'Neue Verpflichtungen'
        ]
      }
    };
    
    return phaseDetails[phaseName] || {
      description: 'Mondphase-Informationen',
      energy: 'Neutral',
      dailyUsage: ['Keine spezifischen Empfehlungen verfügbar'],
      activities: [],
      avoid: []
    };
  };

  // Funktion zum Speichern der Mondphasen-Empfehlungen ins Journal
  const handleSaveToJournal = async (day: CalendarDay, month: Date, phaseDetails: PhaseDetails) => {
    if (!day) return;
    
    setSavingToJournal(true);
    
    try {
      const fullDate = new Date(month.getFullYear(), month.getMonth(), day.day);
      const formattedDate = fullDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Erstelle den Journal-Eintrag
      const journalEntry = {
        title: `Mondphasen-Empfehlungen: ${day.phase.name} - ${formattedDate}`,
        content: `# Mondphasen-Empfehlungen für ${formattedDate}

## 🌙 ${day.phase.name} ${day.phase.icon}

**Energie:** ${phaseDetails.energy}
**Beschreibung:** ${phaseDetails.description}

### ✨ Täglicher Gebrauch:
${phaseDetails.dailyUsage.map(item => `- ${item}`).join('\n')}

### 🎯 Empfohlene Aktivitäten:
${phaseDetails.activities.map(item => `- ${item}`).join('\n')}

${phaseDetails.avoid.length > 0 ? `### ⚠️ Besser vermeiden:
${phaseDetails.avoid.map(item => `- ${item}`).join('\n')}` : ''}

---
*Automatisch aus dem Mondkalender übertragen*`,
        category: 'Mondphasen',
        date: fullDate.toISOString(),
        tags: ['Mondphasen', day.phase.name, 'Empfehlungen'],
        mood: 'Neutral'
      };

      // Speichere ins lokale Storage (als temporäre Lösung)
      const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
      const existingEntries = safeLocalStorageParse<any[]>('moonPhaseJournalEntries', []) || [];
      const newEntry = {
        id: Date.now(),
        ...journalEntry
      };
      
      existingEntries.push(newEntry);
      safeLocalStorageSet('moonPhaseJournalEntries', existingEntries);

      // Zeige Erfolgsmeldung
      setShowSuccessMessage(true);
      
      // Schließe das Popup nach kurzer Verzögerung
      setTimeout(() => {
        setShowDailyUsagePopup(false);
        setSelectedDay(null);
      }, 1500);

    } catch (error) {
      console.error('Fehler beim Speichern ins Journal:', error);
    } finally {
      setSavingToJournal(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev.getTime());
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev.getTime());
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date(2024, 11, 10)); // Fester Wert für Hydration-Sicherheit
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    return days[dayIndex];
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Montag = 0
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const isToday = (day: number) => {
    // Fester Wert für Hydration-Sicherheit
    return day === 10 && 
           currentMonth.getMonth() === 11 && // Dezember
           currentMonth.getFullYear() === 2024;
  };

  const getPhaseColor = (phaseName: string) => {
    const colors: { [key: string]: string } = {
      'Neumond': '#1a1a2e',
      'Zunehmender Sichelmond': '#2d3748',
      'Erstes Viertel': '#4a5568',
      'Zunehmender Gibbous': '#718096',
      'Vollmond': '#f7fafc',
      'Abnehmender Gibbous': '#a0aec0',
      'Letztes Viertel': '#718096',
      'Abnehmender Sichelmond': '#2d3748'
    };
    return colors[phaseName] || '#4a5568';
  };

  const firstDayIndex = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Calendar size={24} color="#fef3c7" />
              <Typography variant="h5" sx={{
                color: '#fef3c7',
                fontWeight: 700,
                ml: 2
              }}>
                Mondkalender
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={goToPreviousMonth}
                sx={{ color: '#fef3c7', '&:hover': { backgroundColor: 'rgba(254,243,199,0.1)' } }}
              >
                <ChevronLeft size={20} />
              </IconButton>
              <Typography
                onClick={goToCurrentMonth}
                sx={{
                  color: '#fef3c7',
                  fontWeight: 600,
                  cursor: 'pointer',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(254,243,199,0.1)' }
                }}
              >
                {getMonthName(currentMonth)}
              </Typography>
              <IconButton
                onClick={goToNextMonth}
                sx={{ color: '#fef3c7', '&:hover': { backgroundColor: 'rgba(254,243,199,0.1)' } }}
              >
                <ChevronRight size={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Calendar Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {/* Day Headers */}
            {Array.from({ length: 7 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(254,243,199,0.2)',
                  pb: 2
                }}
              >
                <Typography sx={{
                  color: 'rgba(254,243,199,0.8)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  {getDayName(i)}
                </Typography>
              </Box>
            ))}

            {/* Empty cells for first week */}
            {Array.from({ length: firstDayIndex }, (_, i) => (
              <Box key={`empty-${i}`} sx={{ p: 1, minHeight: 80 }} />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const calendarDay = calendarData.find(d => d.day === day);
              const isCurrentDay = isToday(day);

              return (
                <motion.div
                  key={day}
                  
                  
                  
                >
                  <Paper
                    elevation={isCurrentDay ? 8 : 1}
                    onClick={() => {
                      if (calendarDay) {
                        setSelectedDay(calendarDay);
                        setShowDailyUsagePopup(true);
                      }
                    }}
                    sx={{
                      p: 1,
                      minHeight: 80,
                      background: isCurrentDay 
                        ? 'linear-gradient(135deg, rgba(254,243,199,0.2) 0%, rgba(254,243,199,0.1) 100%)'
                        : 'rgba(255,255,255,0.05)',
                      border: isCurrentDay ? '2px solid #fef3c7' : '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2,
                      cursor: calendarDay ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      '&:hover': calendarDay ? {
                        background: 'rgba(254,243,199,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(254,243,199,0.2)'
                      } : {}
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Day number */}
                      <Typography sx={{
                        color: isCurrentDay ? '#fef3c7' : 'rgba(254,243,199,0.9)',
                        fontWeight: isCurrentDay ? 700 : 600,
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        mb: 1
                      }}>
                        {day}
                      </Typography>

                      {/* Moon phase */}
                      {calendarDay && (
                        <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography sx={{
                            fontSize: '1.2rem',
                            mb: 0.5
                          }}>
                            {calendarDay.phase.icon}
                          </Typography>
                          <Chip
                            label={calendarDay.phase.name}
                            size="small"
                            sx={{
                              background: `rgba(${getPhaseColor(calendarDay.phase.name).replace('#', '')}, 0.2)`,
                              color: '#fef3c7',
                              border: `1px solid ${getPhaseColor(calendarDay.phase.name)}`,
                              fontSize: '0.7rem',
                              height: 20,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              );
            })}

            {/* Empty cells for last week */}
            {Array.from({ length: totalCells - firstDayIndex - daysInMonth }, (_, i) => (
              <Box key={`empty-end-${i}`} sx={{ p: 1, minHeight: 80 }} />
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{ mt: 4, p: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <Typography sx={{
              color: '#fef3c7',
              fontWeight: 600,
              mb: 2
            }}>
              Mondphasen Legende:
            </Typography>
            <Grid container spacing={3}>
              {[
                { name: 'Neumond', icon: '🌑', color: '#1a1a2e' },
                { name: 'Zunehmender Sichelmond', icon: '🌒', color: '#2d3748' },
                { name: 'Erstes Viertel', icon: '🌓', color: '#4a5568' },
                { name: 'Zunehmender Gibbous', icon: '🌔', color: '#718096' },
                { name: 'Vollmond', icon: '🌕', color: '#f7fafc' },
                { name: 'Abnehmender Gibbous', icon: '🌖', color: '#a0aec0' },
                { name: 'Letztes Viertel', icon: '🌗', color: '#718096' },
                { name: 'Abnehmender Sichelmond', icon: '🌘', color: '#2d3748' }
              ].map((phase, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>{phase.icon}</Typography>
                    <Typography sx={{
                      color: 'rgba(254,243,199,0.8)',
                      fontSize: '0.8rem'
                    }}>
                      {phase.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Daily Usage Popup */}
      <DailyUsagePopup
        open={showDailyUsagePopup}
        onClose={() => {
          setShowDailyUsagePopup(false);
          setSelectedDay(null);
        }}
        selectedDay={selectedDay}
        currentMonth={currentMonth}
        onSaveToJournal={handleSaveToJournal}
      />

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity="success"
          sx={{
            background: 'linear-gradient(45deg, #10b981, #059669)',
            color: 'white',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
          icon={<CheckCircle size={24} />}
        >
          Mondphasen-Empfehlungen erfolgreich ins Journal übertragen! 📝✨
        </Alert>
      </Snackbar>
    </motion.div>
  );
}
