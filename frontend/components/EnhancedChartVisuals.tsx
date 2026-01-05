import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Grid, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { Sun, Moon, Star, Circle, Zap, Eye, Target, TrendingUp } from 'lucide-react';

interface ChartData {
  type: string;
  profile: string;
  authority: string;
  strategy: string;
  centers: Record<string, { defined: boolean }>;
  gates: Array<{ id: number; active: boolean; center: string }>;
  planets?: Record<string, Planet>;
}

interface Planet {
  symbol: string;
  name: string;
  gate: string;
  line: string;
  position: number;
  color: string;
  description: string;
}

interface Transit {
  id: string;
  name: string;
  position: number;
  gate: string;
  influence: string;
  strength: number;
}

interface EnhancedChartVisualsProps {
  chartData: ChartData;
  onTransitClick?: (transit: Transit) => void;
}

// Vollständige detaillierte Gate-Beschreibungen für alle 64 Tore des Human Design Systems
const gateDescriptions: { [key: string]: string } = {
  '1': 'Kreative Energie - Das Tor der Kreativität und des Selbstausdrucks. Du bringst neue Ideen und Inspiration in die Welt. Deine kreative Kraft manifestiert sich in allen Bereichen deines Lebens.',
  '2': 'Empfänglichkeit - Das Tor der Empfänglichkeit und des Vertrauens. Du nimmst die Energien der Welt auf und verarbeitest sie. Deine natürliche Empfänglichkeit macht dich zu einem guten Zuhörer und Berater.',
  '3': 'Anfänge - Das Tor der Anfänge und des Wachstums. Du startest neue Projekte und bringst Dinge ins Rollen. Deine Energie ist wie ein Funke, der neue Entwicklungen entfacht.',
  '4': 'Formulierung - Das Tor der Formulierung und Klärung. Du bringst Ordnung in Chaos und schaffst Struktur. Deine Fähigkeit, komplexe Dinge verständlich zu machen, ist einzigartig.',
  '5': 'Warten - Das Tor des Wartens und der Geduld. Du wartest auf den richtigen Moment und handelst dann entschlossen. Deine Geduld ist deine Stärke und führt zu perfekten Ergebnissen.',
  '6': 'Konflikt - Das Tor des Konflikts und der Herausforderung. Du wächst durch Konflikte und lernst daraus. Deine Fähigkeit, Konflikte zu meistern, macht dich stärker.',
  '7': 'Führung - Das Tor der Führung und Autorität. Du führst andere durch deine natürliche Autorität. Menschen folgen dir, weil sie deine Führung spüren.',
  '8': 'Beitrag - Das Tor des Beitrags und der Zusammenarbeit. Du bringst deine Talente in Gruppen ein. Deine Beiträge sind wertvoll und werden von anderen geschätzt.',
  '9': 'Fokus - Das Tor des Fokus und der Konzentration. Du konzentrierst dich auf das Wesentliche. Deine Fähigkeit, Ablenkungen zu ignorieren, führt zu tiefen Erkenntnissen.',
  '10': 'Selbstliebe - Das Tor der Selbstliebe und des Selbstvertrauens. Du liebst dich selbst und strahlst das aus. Deine Selbstliebe inspiriert andere, sich selbst zu akzeptieren.',
  '11': 'Ideen - Das Tor der Ideen und der Inspiration. Du hast viele Ideen und teilst sie mit anderen. Deine Ideen sind wie Samen, die in anderen Menschen wachsen.',
  '12': 'Vorsicht - Das Tor der Vorsicht und des Stillstands. Du handelst vorsichtig und wartest auf Klarheit. Deine Vorsicht schützt dich vor übereilten Entscheidungen.',
  '13': 'Zuhörer - Das Tor des Zuhörens und der Empathie. Du hörst anderen zu und verstehst ihre Perspektive. Deine Empathie macht dich zu einem vertrauensvollen Begleiter.',
  '14': 'Macht - Das Tor der Macht und des Einflusses. Du hast natürliche Macht und Einfluss auf andere. Deine Macht wird durch Verantwortung und Weisheit ausgeglichen.',
  '15': 'Mäßigung - Das Tor der Mäßigung und Demut. Du bleibst bescheiden und mäßigst deine Energien. Deine Mäßigung macht dich zu einem ausgewogenen Menschen.',
  '16': 'Enthusiasmus - Das Tor des Enthusiasmus und der Begeisterung. Du begeisterst andere für deine Ideen. Dein Enthusiasmus ist ansteckend und motiviert andere.',
  '17': 'Folgen - Das Tor des Folgens und der Anpassung. Du folgst deiner inneren Führung und passt dich an. Deine Fähigkeit, dem Fluss zu folgen, führt zu Harmonie.',
  '18': 'Korrektur - Das Tor der Korrektur und Verbesserung. Du verbesserst bestehende Systeme und Prozesse. Deine Korrekturen machen Dinge effizienter und besser.',
  '19': 'Gemeinschaft - Das Tor der Gemeinschaft und des Zusammenhalts. Du bringst Menschen zusammen. Deine Fähigkeit, Gemeinschaft zu schaffen, ist ein Geschenk.',
  '20': 'Gegenwart - Das Tor der Gegenwart und des Augenblicks. Du lebst im Hier und Jetzt. Deine Präsenz macht jeden Moment wertvoll und bewusst.',
  '21': 'Kontrolle - Das Tor der Kontrolle und des Einflusses. Du kontrollierst Situationen und Menschen. Deine Kontrolle wird durch Weisheit und Mitgefühl ausgeglichen.',
  '22': 'Anmut - Das Tor der Anmut und Eleganz. Du bewegst dich mit natürlicher Anmut durchs Leben. Deine Anmut macht dich zu einem angenehmen Begleiter.',
  '23': 'Assimilation - Das Tor der Assimilation und Individualität. Du nimmst neue Erfahrungen auf und bleibst dabei du selbst. Deine Fähigkeit, Neues zu integrieren, macht dich reicher.',
  '24': 'Rationalisierung - Das Tor der Rationalisierung und des Verstehens. Du machst Dinge verständlich und logisch. Deine Klarheit hilft anderen, Zusammenhänge zu verstehen.',
  '25': 'Unschuld - Das Tor der Unschuld und des Vertrauens. Du vertraust dem Leben und bleibst unschuldig. Deine Unschuld macht dich offen für Wunder und Überraschungen.',
  '26': 'Verkauf - Das Tor des Verkaufs und der Überzeugung. Du verkaufst deine Ideen und überzeugst andere. Deine Überzeugungskraft kommt aus deiner Authentizität.',
  '27': 'Fürsorge - Das Tor der Fürsorge und des Schutzes. Du sorgst dich um andere und schützt sie. Deine Fürsorge macht die Welt zu einem besseren Ort.',
  '28': 'Spieler - Das Tor des Spielers und der Herausforderung. Du gehst Risiken ein und spielst mit dem Leben. Dein Spieltrieb macht das Leben spannend und lebendig.',
  '29': 'Verpflichtung - Das Tor der Verpflichtung und des Engagements. Du gehst Verpflichtungen ein und hältst sie. Deine Zuverlässigkeit macht dich zu einem wertvollen Partner.',
  '30': 'Gefühle - Das Tor der Gefühle und Emotionen. Du fühlst tief und drückst deine Emotionen aus. Deine Gefühle verbinden dich mit anderen Menschen.',
  '31': 'Einfluss - Das Tor des Einflusses und der Führung. Du übst Einfluss auf andere aus. Dein Einfluss wird durch deine Integrität und Weisheit bestimmt.',
  '32': 'Kontinuität - Das Tor der Kontinuität und Beständigkeit. Du sorgst für Beständigkeit und Kontinuität. Deine Beständigkeit gibt anderen Sicherheit und Vertrauen.',
  '33': 'Rückzug - Das Tor des Rückzugs und der Reflexion. Du ziehst dich zurück, um zu reflektieren. Deine Reflexion führt zu tiefen Einsichten und Weisheit.',
  '34': 'Macht - Das Tor der Macht und Stärke. Du hast natürliche Kraft und Macht. Deine Macht wird durch Verantwortung und Mitgefühl ausgeglichen.',
  '35': 'Veränderung - Das Tor der Veränderung und des Wandels. Du bringst Veränderung und Wandel. Deine Fähigkeit, Veränderung zu initiieren, macht dich zu einem Pionier.',
  '36': 'Krise - Das Tor der Krise und des Wachstums. Du wächst durch Krisen und Herausforderungen. Deine Krisenbewältigung macht dich stärker und weiser.',
  '37': 'Familie - Das Tor der Familie und Gemeinschaft. Du schaffst familiäre Bindungen und Gemeinschaft. Deine Fähigkeit, Familie zu schaffen, ist ein Geschenk.',
  '38': 'Kämpfer - Das Tor des Kämpfers und der Beharrlichkeit. Du kämpfst für das, was dir wichtig ist. Deine Beharrlichkeit führt dich zum Erfolg.',
  '39': 'Provokation - Das Tor der Provokation und Herausforderung. Du provozierst andere zum Wachstum. Deine Provokationen sind konstruktiv und führen zu Entwicklung.',
  '40': 'Allein - Das Tor des Alleinseins und der Unabhängigkeit. Du brauchst Zeit allein und bist unabhängig. Deine Unabhängigkeit macht dich zu einem starken Individuum.',
  '41': 'Fantasie - Das Tor der Fantasie und Kreativität. Du hast eine reiche Fantasie und Kreativität. Deine Fantasie öffnet neue Welten und Möglichkeiten.',
  '42': 'Wachstum - Das Tor des Wachstums und der Entwicklung. Du wächst kontinuierlich und entwickelst dich. Dein Wachstum inspiriert andere, sich weiterzuentwickeln.',
  '43': 'Durchbruch - Das Tor des Durchbruchs und der Erkenntnis. Du hast plötzliche Erkenntnisse und Durchbrüche. Deine Durchbrüche öffnen neue Wege und Möglichkeiten.',
  '44': 'Begegnung - Das Tor der Begegnung und des Zusammentreffens. Du bringst Menschen zusammen. Deine Begegnungen sind bedeutungsvoll und führen zu Verbindungen.',
  '45': 'Sammler - Das Tor des Sammlers und der Anziehung. Du sammelst Menschen und Ressourcen um dich. Deine Anziehungskraft macht dich zu einem natürlichen Anführer.',
  '46': 'Liebe - Das Tor der Liebe und des Vergnügens. Du liebst das Leben und genießt es. Deine Liebe zum Leben macht jeden Tag zu einem Geschenk.',
  '47': 'Verwirrung - Das Tor der Verwirrung und Klärung. Du verwirrst andere, um Klarheit zu schaffen. Deine Verwirrung führt zu neuen Erkenntnissen und Einsichten.',
  '48': 'Tiefe - Das Tor der Tiefe und Weisheit. Du gehst in die Tiefe und findest Weisheit. Deine Tiefe macht dich zu einem weisen Berater und Begleiter.',
  '49': 'Revolution - Das Tor der Revolution und des Wandels. Du bringst revolutionäre Veränderungen. Deine Revolutionen verbessern die Welt und schaffen Neues.',
  '50': 'Verantwortung - Das Tor der Verantwortung und des Schutzes. Du übernimmst Verantwortung für andere. Deine Verantwortung macht dich zu einem vertrauensvollen Partner.',
  '51': 'Schock - Das Tor des Schocks und der Überraschung. Du überraschst andere mit deinen Handlungen. Deine Überraschungen öffnen neue Perspektiven und Möglichkeiten.',
  '52': 'Stille - Das Tor der Stille und Konzentration. Du brauchst Stille, um dich zu konzentrieren. Deine Stille ist eine Quelle der Kraft und Klarheit.',
  '53': 'Entwicklung - Das Tor der Entwicklung und des Fortschritts. Du entwickelst dich kontinuierlich weiter. Deine Entwicklung inspiriert andere, sich weiterzuentwickeln.',
  '54': 'Ambition - Das Tor der Ambition und des Strebens. Du hast hohe Ziele und strebst danach. Deine Ambition treibt dich zu Höchstleistungen und Erfolg.',
  '55': 'Geist - Das Tor des Geistes und der Spiritualität. Du bist spirituell und geistig orientiert. Deine Spiritualität verbindet dich mit höheren Ebenen des Bewusstseins.',
  '56': 'Wanderer - Das Tor des Wanderers und der Erfahrung. Du sammelst Erfahrungen durch Reisen. Deine Reisen erweitern deinen Horizont und machen dich weiser.',
  '57': 'Intuition - Das Tor der Intuition und des Instinkts. Du vertraust deiner Intuition und deinem Instinkt. Deine Intuition führt dich zu den richtigen Entscheidungen.',
  '58': 'Lebensfreude - Das Tor der Lebensfreude und Vitalität. Du bringst Lebensfreude und Vitalität. Deine Lebensfreude ist ansteckend und macht andere glücklich.',
  '59': 'Sexualität - Das Tor der Sexualität und Intimität. Du schaffst tiefe Verbindungen und Intimität. Deine Fähigkeit, Intimität zu schaffen, macht deine Beziehungen reich.',
  '60': 'Begrenzung - Das Tor der Begrenzung und des Realismus. Du setzt realistische Grenzen. Deine Grenzen schützen dich und andere vor Überforderung.',
  '61': 'Mystik - Das Tor der Mystik und des Glaubens. Du hast mystische Erfahrungen und einen tiefen Glauben. Deine Mystik verbindet dich mit dem Göttlichen und Unbekannten.',
  '62': 'Details - Das Tor der Details und Präzision. Du achtest auf Details und bist präzise. Deine Aufmerksamkeit für Details macht deine Arbeit perfekt.',
  '63': 'Zweifel - Das Tor des Zweifels und der Unsicherheit. Du zweifelst und suchst nach Gewissheit. Deine Zweifel führen zu tieferen Erkenntnissen und Wahrheit.',
  '64': 'Konfusion - Das Tor der Konfusion und Klärung. Du schaffst Konfusion, um Klarheit zu gewinnen. Deine Konfusion führt zu neuen Einsichten und Verständnis.'
};

const transitData = {
  sun: { name: 'Sonne', position: 15, gate: '15', influence: gateDescriptions['15'], strength: 0.8 },
  moon: { name: 'Mond', position: 23, gate: '23', influence: gateDescriptions['23'], strength: 0.6 },
  mercury: { name: 'Merkur', position: 8, gate: '8', influence: gateDescriptions['8'], strength: 0.4 },
  venus: { name: 'Venus', position: 12, gate: '12', influence: gateDescriptions['12'], strength: 0.3 },
  mars: { name: 'Mars', position: 45, gate: '45', influence: gateDescriptions['45'], strength: 0.7 },
  earth: { name: 'Erde', position: 2, gate: '2', influence: gateDescriptions['2'], strength: 0.5 },
  northNode: { name: 'Nordknoten', position: 4, gate: '4', influence: gateDescriptions['4'], strength: 0.6 },
  southNode: { name: 'Südknoten', position: 5, gate: '5', influence: gateDescriptions['5'], strength: 0.4 }
};

export default function EnhancedChartVisuals({ chartData, onTransitClick }: EnhancedChartVisualsProps) {
  const [currentTransits, setCurrentTransits] = useState<Transit[]>([]);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    // Simuliere aktuelle Transits mit deterministischen Werten
    const transits = Object.entries(transitData).map(([planet, data], index) => ({
      ...data,
      id: planet,
      isActive: (index % 2) === 0, // Alternating true/false
      impact: 0.2 + (index * 0.1) % 0.8 // Deterministic impact values
    }));
    setCurrentTransits(transits);
  }, []);

  // Sicherheitscheck für chartData
  // Erlaube auch Chart-Daten ohne planets (für Fallback-Visualisierungen)
  if (!chartData) {
    return (
      <Box sx={{ 
        mt: 4, 
        p: 4, 
        textAlign: 'center',
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3
      }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
          ⚠️ Keine Chart-Daten für erweiterte Visualisierungen verfügbar
        </Typography>
      </Box>
    );
  }
  
  // Wenn keine planets vorhanden, verwende Fallback-Daten basierend auf gates
  const hasPlanets = chartData.planets && Object.keys(chartData.planets).length > 0;

  const getTransitColor = (strength: number) => {
    if (strength > 0.7) return '#ef4444'; // Rot für starke Einflüsse
    if (strength > 0.4) return '#f59e0b'; // Orange für mittlere Einflüsse
    return '#10b981'; // Grün für schwache Einflüsse
  };

  const getTransitDescription = (transit: Transit) => {
    const descriptions: { [key: string]: string } = {
      sun: 'Die Sonne steht für dein Bewusstsein und deine Lebenskraft. Dieser Transit beeinflusst deine grundlegende Energie und wie du dich der Welt zeigst.',
      moon: 'Der Mond repräsentiert dein Unterbewusstsein und deine Emotionen. Dieser Transit beeinflusst deine Stimmungen und inneren Prozesse.',
      mercury: 'Merkur steht für Kommunikation und Denken. Dieser Transit beeinflusst, wie du dich ausdrückst und Informationen verarbeitest.',
      venus: 'Venus symbolisiert Liebe, Schönheit und Harmonie. Dieser Transit beeinflusst deine Beziehungen und dein Verlangen nach Ausgewogenheit.',
      mars: 'Mars steht für Energie, Tatkraft und Durchsetzungsvermögen. Dieser Transit beeinflusst deine Motivation und wie du Herausforderungen angehst.',
      earth: 'Die Erde steht für dein Unterbewusstsein und deine Erdung. Dieser Transit beeinflusst deine Stabilität und deine Verbindung zur materiellen Welt.',
      northNode: 'Der Nordknoten steht für deine Zukunft und Entwicklung. Dieser Transit zeigt dir neue Wege und Wachstumsmöglichkeiten auf.',
      southNode: 'Der Südknoten steht für deine Vergangenheit und Erfahrungen. Dieser Transit hilft dir, aus alten Mustern zu lernen und loszulassen.'
    };
    
    return descriptions[transit.id] || 'Dieser Planetentransit beeinflusst deine energetische Konfiguration und kann neue Möglichkeiten eröffnen.';
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* 3D Chart Toggle */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Tooltip title={show3D ? "2D Ansicht" : "3D Ansicht"}>
          <IconButton
            onClick={() => setShow3D(!show3D)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: '#FFD700',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Eye size={20} />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
          {show3D ? "3D Visualisierung aktiv" : "2D Standardansicht"}
        </Typography>
      </Box>

      {/* Current Transits */}
      <Paper sx={{
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        p: 3,
        mb: 3
      }}>
        <Typography variant="h6" sx={{
          color: '#FFD700',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrendingUp size={20} />
          Aktuelle Planeten-Transits
        </Typography>
        
        {/* Erklärung der Planeten-Transits */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'rgba(255,255,255,0.05)', 
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)', 
            mb: 1,
            fontWeight: 600
          }}>
            🌟 Was sind Planeten-Transits?
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            lineHeight: 1.5,
            display: 'block'
          }}>
            Planeten-Transits zeigen, wie die aktuellen Positionen der Planeten (Sonne, Mond, Merkur, Venus, Mars) 
            deine Human Design Konfiguration beeinflussen. Sie können neue Energien aktivieren, 
            bestehende Muster verstärken oder temporäre Öffnungen in deinen Zentren schaffen. 
            Diese Einflüsse sind besonders wichtig für deine täglichen Entscheidungen und dein Wohlbefinden.
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {currentTransits.map((transit) => (
            <Grid item xs={12} sm={6} md={4} key={transit.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => onTransitClick?.(transit)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    border: `2px solid ${getTransitColor(transit.strength)}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${getTransitColor(transit.strength)}40`
                    }
                  }}
                >
                  <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Circle size={16} color={getTransitColor(transit.strength)} />
                              <Typography variant="subtitle2" sx={{ color: '#FFD700', ml: 1 }}>
                                {transit.name}
                              </Typography>
                      <Chip
                        label="Aktiv"
                        size="small"
                        sx={{
                          ml: 'auto',
                          bgcolor: '#10b981',
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    
                                         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                       <strong>Tor {transit.gate}:</strong> {transit.influence}
                     </Typography>
                     
                     {/* Zusätzliche Gate-Informationen */}
                     <Box sx={{ 
                       mb: 1, 
                       p: 1, 
                       bgcolor: 'rgba(255,255,255,0.05)', 
                       borderRadius: 1,
                       border: '1px solid rgba(255,255,255,0.1)'
                     }}>
                       <Typography variant="caption" sx={{ 
                         color: '#FFD700', 
                         fontWeight: 600,
                         display: 'block',
                         mb: 0.5
                       }}>
                         Gate-Details:
                       </Typography>
                       <Typography variant="caption" sx={{ 
                         color: 'rgba(255,255,255,0.8)', 
                         display: 'block',
                         lineHeight: 1.3
                       }}>
                         • Position: {transit.position}° im Chart<br/>
                         • Stärke: {Math.round(transit.strength * 100)}%<br/>
                         • Aktivierung: Aktiviert
                       </Typography>
                     </Box>
                    
                    {/* Erweiterte Beschreibung */}
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      mb: 1,
                      display: 'block',
                      lineHeight: 1.4
                    }}>
                      {getTransitDescription(transit)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        flex: 1,
                        height: 4,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: `${transit.strength * 100}%`,
                          height: '100%',
                          bgcolor: getTransitColor(transit.strength),
                          borderRadius: 2
                        }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {Math.round(transit.strength * 100)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Paper>

             {/* Kanäle & Verbindungen */}
       <Paper sx={{
         bgcolor: 'rgba(255,255,255,0.05)',
         backdropFilter: 'blur(20px)',
         border: '1px solid rgba(255,255,255,0.1)',
         borderRadius: 3,
         p: 3,
         mb: 3
       }}>
         <Typography variant="h6" sx={{
           color: '#FFD700',
           mb: 2,
           display: 'flex',
           alignItems: 'center',
           gap: 1
         }}>
           <Zap size={20} />
           Aktive Kanäle & Verbindungen
         </Typography>
         
         {/* Erklärung der Kanäle */}
         <Box sx={{ 
           mb: 3, 
           p: 2, 
           bgcolor: 'rgba(255,255,255,0.05)', 
           borderRadius: 2,
           border: '1px solid rgba(255,255,255,0.1)'
         }}>
           <Typography variant="body2" sx={{ 
             color: 'rgba(255,255,255,0.8)', 
             mb: 1,
             fontWeight: 600
           }}>
             🔗 Was sind Kanäle?
           </Typography>
           <Typography variant="caption" sx={{ 
             color: 'rgba(255,255,255,0.7)', 
             lineHeight: 1.5,
             display: 'block'
           }}>
             Kanäle verbinden zwei Zentren im Human Design Chart und schaffen eine stabile Energieverbindung. 
             Sie zeigen deine natürlichen Talente und wie du Energie durch deine Zentren fließen lässt. 
             Aktive Kanäle sind deine Stärken und bestimmen deine Persönlichkeit.
           </Typography>
         </Box>
         
         <Grid container spacing={2}>
           {/* Simulierte Kanäle - später durch echte Chart-Daten ersetzen */}
           {[
             { id: '1-8', from: 'Tor 1', to: 'Tor 8', name: 'Inspiration', strength: 0.9, color: '#ef4444' },
             { id: '2-14', from: 'Tor 2', to: 'Tor 14', name: 'Empfänglichkeit', strength: 0.7, color: '#f59e0b' },
             { id: '3-60', from: 'Tor 3', to: 'Tor 60', name: 'Mutation', strength: 0.6, color: '#10b981' },
             { id: '4-63', from: 'Tor 4', to: 'Tor 63', name: 'Logik', strength: 0.8, color: '#06b6d4' }
           ].map((channel) => (
             <Grid item xs={12} sm={6} md={4} key={channel.id}>
               <Box sx={{
                 bgcolor: 'rgba(255,255,255,0.1)',
                 borderRadius: 2,
                 p: 2,
                 border: `2px solid ${channel.color}`,
                 position: 'relative'
               }}>
                 <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, fontWeight: 600 }}>
                   {channel.name}
                 </Typography>
                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 1 }}>
                   <strong>Von:</strong> {channel.from}
                 </Typography>
                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 1 }}>
                   <strong>Zu:</strong> {channel.to}
                 </Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                   <Box sx={{
                     flex: 1,
                     height: 3,
                     bgcolor: 'rgba(255,255,255,0.2)',
                     borderRadius: 2,
                     overflow: 'hidden'
                   }}>
                     <Box sx={{
                       width: `${channel.strength * 100}%`,
                       height: '100%',
                       bgcolor: channel.color,
                       borderRadius: 2
                     }} />
                   </Box>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                     {Math.round(channel.strength * 100)}%
                   </Typography>
                 </Box>
               </Box>
             </Grid>
           ))}
         </Grid>
       </Paper>

               {/* Planetary Positions */}
        <Paper sx={{
          bgcolor: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          p: 3,
          mb: 3
        }}>
         <Typography variant="h6" sx={{
           color: '#FFD700',
           mb: 2,
           display: 'flex',
           alignItems: 'center',
           gap: 1
         }}>
           <Star size={20} />
           Planeten-Positionen
         </Typography>
         
         {/* Erklärung der Planeten-Positionen */}
         <Box sx={{ 
           mb: 3, 
           p: 2, 
           bgcolor: 'rgba(255,255,255,0.05)', 
           borderRadius: 2,
           border: '1px solid rgba(255,255,255,0.1)'
         }}>
           <Typography variant="body2" sx={{ 
             color: 'rgba(255,255,255,0.8)', 
             mb: 1,
             fontWeight: 600
           }}>
             🌍 Was sind Planeten-Positionen?
           </Typography>
           <Typography variant="caption" sx={{ 
             color: 'rgba(255,255,255,0.7)', 
             lineHeight: 1.5,
             display: 'block'
           }}>
             Planeten-Positionen zeigen, wo sich die wichtigsten Himmelskörper in deinem Human Design Chart befinden. 
             Jeder Planet aktiviert spezifische Tore (Gates) und Linien, die deine Persönlichkeit und Talente prägen. 
             Diese Positionen sind fest und bleiben ein Leben lang konstant - sie bilden die Grundlage deiner einzigartigen energetischen Konfiguration.
           </Typography>
         </Box>
         
         <Grid container spacing={2}>
           {Object.entries(chartData.planets || {}).map(([planetId, planet]: [string, Planet]) => (
             <Grid item xs={6} sm={4} md={3} key={planetId}>
               <Box sx={{
                 bgcolor: 'rgba(255,255,255,0.1)',
                 borderRadius: 2,
                 p: 2,
                 textAlign: 'center',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
                 <Typography variant="h4" sx={{ color: planet.color, mb: 1 }}>
                   {planet.symbol}
                 </Typography>
                 <Typography variant="body2" sx={{ color: '#FFD700', mb: 1 }}>
                   {planet.name}
                 </Typography>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                    Tor {planet.gate}, Linie {planet.line}
                  </Typography>
                  
                  {/* Zusätzliche Planeten-Details */}
                  <Box sx={{ 
                    mt: 1, 
                    p: 1, 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#FFD700', 
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5
                    }}>
                      Details:
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      display: 'block',
                      lineHeight: 1.3
                    }}>
                      • Position: {planet.position}°<br/>
                      • Farbe: {planet.color}<br/>
                      • {planet.description}
                    </Typography>
                  </Box>
               </Box>
             </Grid>
           ))}
         </Grid>
       </Paper>

       {/* Human Design Zentren - Vollständige Erklärung */}
       <Paper sx={{
         bgcolor: 'rgba(255,255,255,0.05)',
         backdropFilter: 'blur(20px)',
         border: '1px solid rgba(255,255,255,0.1)',
         borderRadius: 3,
         p: 3
       }}>
         <Typography variant="h6" sx={{
           color: '#FFD700',
           mb: 2,
           display: 'flex',
           alignItems: 'center',
           gap: 1
         }}>
           <Target size={20} />
           Human Design Zentren
         </Typography>
         
         {/* Erklärung der Zentren */}
         <Box sx={{ 
           mb: 3, 
           p: 2, 
           bgcolor: 'rgba(255,255,255,0.05)', 
           borderRadius: 2,
           border: '1px solid rgba(255,255,255,0.1)'
         }}>
           <Typography variant="body2" sx={{ 
             color: 'rgba(255,255,255,0.8)', 
             mb: 1,
             fontWeight: 600
           }}>
             🎯 Was sind Human Design Zentren?
           </Typography>
           <Typography variant="caption" sx={{ 
             color: 'rgba(255,255,255,0.7)', 
             lineHeight: 1.5,
             display: 'block'
           }}>
             Zentren sind die fundamentalen Bausteine deines Human Design Charts. Sie repräsentieren verschiedene Aspekte deiner Persönlichkeit, 
             deiner Talente und deiner energetischen Konfiguration. Jedes Zentrum hat eine spezifische Funktion und Bedeutung 
             für dein Leben und deine Entscheidungen.
           </Typography>
         </Box>
         
         <Grid container spacing={2}>
           {[
             {
               name: 'Kopf',
               color: '#FFD700',
               description: 'Das Zentrum der Inspiration und der geistigen Aktivität. Hier entstehen neue Ideen und kreative Impulse.',
               function: 'Inspiration, Kreativität, geistige Aktivität',
               gates: '61, 63, 64',
               type: 'Druck- und Bewusstseinszentrum'
             },
             {
               name: 'Ajna',
               color: '#FF6B6B',
               description: 'Das Zentrum der Konzeptualisierung und des Verstehens. Hier verarbeitest du Informationen und schaffst Klarheit.',
               function: 'Verstehen, Konzeptualisierung, mentale Verarbeitung',
               gates: '47, 24, 4',
               type: 'Verarbeitungszentrum'
             },
             {
               name: 'Hals',
               color: '#4ECDC4',
               description: 'Das Zentrum der Manifestation und Kommunikation. Hier bringst du deine Ideen in die Welt.',
               function: 'Manifestation, Kommunikation, Handlung',
               gates: '23, 8, 20, 16, 35, 45',
               type: 'Manifestationszentrum'
             },
             {
               name: 'G',
               color: '#45B7D1',
               description: 'Das Zentrum der Identität und der Liebe. Hier findest du deine wahre Bestimmung und deine Richtung im Leben.',
               function: 'Identität, Liebe, Lebensrichtung',
               gates: '1, 2, 7, 10, 15, 25',
               type: 'Identitätszentrum'
             },
             {
               name: 'Herz',
               color: '#96CEB4',
               description: 'Das Zentrum der Willenskraft und des Ego. Hier manifestiert sich deine Kraft und dein Durchhaltevermögen.',
               function: 'Willenskraft, Ego, Durchhaltevermögen',
               gates: '21, 26, 51, 40',
               type: 'Willenszentrum'
             },
             {
               name: 'Solar Plexus',
               color: '#FFEAA7',
               description: 'Das Zentrum der Emotionen und der emotionalen Intelligenz. Hier erlebst du die Tiefe deiner Gefühle.',
               function: 'Emotionen, emotionales Bewusstsein, Intuition',
               gates: '22, 36, 37, 55, 30, 49, 6, 56',
               type: 'Emotionales Zentrum'
             },
             {
               name: 'Sakral',
               color: '#DDA0DD',
               description: 'Das Zentrum der Lebenskraft und der Sexualität. Hier ist deine grundlegende Energie und Vitalität verankert.',
               function: 'Lebenskraft, Sexualität, Arbeit, Reproduktion',
               gates: '5, 14, 29, 9, 3, 42, 27, 59',
               type: 'Motorzentrum'
             },
             {
               name: 'Wurzel',
               color: '#FF8A80',
               description: 'Das Zentrum der Stressenergie und des Drucks. Hier entsteht die Kraft für Veränderung und Transformation.',
               function: 'Stress, Druck, Transformation, Veränderung',
               gates: '19, 39, 38, 41, 60, 52, 53, 54, 58',
               type: 'Druckzentrum'
             },
             {
               name: 'Milz',
               color: '#81C784',
               description: 'Das Zentrum des Instinkts und der Intuition. Hier spürst du, was gut für dich ist und was nicht.',
               function: 'Instinkt, Intuition, Gesundheit, Angst',
               gates: '48, 57, 44, 50, 32, 28, 18, 46',
               type: 'Awareness-Zentrum'
             }
           ].map((center) => (
             <Grid item xs={12} sm={6} md={4} key={center.name}>
               <Box sx={{
                 bgcolor: 'rgba(255,255,255,0.1)',
                 borderRadius: 2,
                 p: 2,
                 border: `2px solid ${center.color}`,
                 position: 'relative'
               }}>
                 <Typography variant="subtitle2" sx={{ 
                   color: center.color, 
                   mb: 1, 
                   fontWeight: 600,
                   fontSize: '1.1rem'
                 }}>
                   {center.name}
                 </Typography>
                 <Typography variant="caption" sx={{ 
                   color: 'rgba(255,255,255,0.8)', 
                   display: 'block', 
                   mb: 1,
                   lineHeight: 1.4
                 }}>
                   {center.description}
                 </Typography>
                 <Box sx={{ 
                   mt: 1, 
                   p: 1, 
                   bgcolor: 'rgba(255,255,255,0.05)', 
                   borderRadius: 1,
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
                   <Typography variant="caption" sx={{ 
                     color: '#FFD700', 
                     fontWeight: 600,
                     display: 'block',
                     mb: 0.5
                   }}>
                     Funktion:
                   </Typography>
                   <Typography variant="caption" sx={{ 
                     color: 'rgba(255,255,255,0.7)', 
                     display: 'block',
                     lineHeight: 1.3
                   }}>
                     {center.function}
                   </Typography>
                 </Box>
                 <Box sx={{ 
                   mt: 1, 
                   p: 1, 
                   bgcolor: 'rgba(255,255,255,0.05)', 
                   borderRadius: 1,
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
                   <Typography variant="caption" sx={{ 
                     color: '#FFD700', 
                     fontWeight: 600,
                     display: 'block',
                     mb: 0.5
                   }}>
                     Tore:
                   </Typography>
                   <Typography variant="caption" sx={{ 
                     color: 'rgba(255,255,255,0.7)', 
                     display: 'block',
                     lineHeight: 1.3
                   }}>
                     {center.gates}
                   </Typography>
                 </Box>
                 <Box sx={{ 
                   mt: 1, 
                   p: 1, 
                   bgcolor: 'rgba(255,255,255,0.05)', 
                   borderRadius: 1,
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
                   <Typography variant="caption" sx={{ 
                     color: '#FFD700', 
                     fontWeight: 600,
                     display: 'block',
                     mb: 0.5
                   }}>
                     Typ:
                   </Typography>
                   <Typography variant="caption" sx={{ 
                     color: 'rgba(255,255,255,0.7)', 
                     display: 'block',
                     lineHeight: 1.3
                   }}>
                     {center.type}
                   </Typography>
                 </Box>
               </Box>
             </Grid>
           ))}
         </Grid>
       </Paper>

      
    </Box>
  );
}
