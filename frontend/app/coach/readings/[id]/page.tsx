'use client';

import React, { useEffect, useState } from 'react';
import CoachAuth from '@/components/CoachAuth';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

type ReadingMode = 'single' | 'connection' | 'penta';

type SectionId =
  | 'typeStrategy'
  | 'authority'
  | 'centers'
  | 'profile'
  | 'channels'
  | 'incarnationCross'
  | 'sleepSystem'
  | 'businessPotential'
  | 'connectionOverview'
  | 'connectionStrengths'
  | 'connectionConflicts'
  | 'connectionGrowth'
  | 'connectionCommunication'
  | 'groupEnergy'
  | 'groupCenters'
  | 'groupRoles'
  | 'groupConflicts'
  | 'groupGrowth';

interface ReadingData {
  id: string;
  reading_type: string;
  client_name: string;
  reading_data: any;
  created_at: string;
  updated_at?: string;
}

function ReadingPageContent() {
  const router = useRouter();
  const params = useParams();
  const readingId = params?.id as string;

  const [reading, setReading] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedGeneratedText, setEditedGeneratedText] = useState('');
  const [editedAdditionalText, setEditedAdditionalText] = useState('');
  const [saving, setSaving] = useState(false);
  const [retryingAgent, setRetryingAgent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (readingId) {
      fetchReading();
    }
  }, [readingId]);

  const fetchReading = async () => {
    try {
      setLoading(true);
      setError(null);

      // Versuche nur den Coach-Endpoint (kein Fallback auf normale API)
      const response = await fetch(`/api/coach/readings/${readingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden des Readings');
      }

      const loadedReading = data.reading || data;
      setReading(loadedReading);
      
      // Setze initiale Werte für Edit-Modus
      setEditedGeneratedText(loadedReading.reading_data?.generatedText || '');
      setEditedAdditionalText(loadedReading.reading_data?.additionalText || '');

      // Debug: Prüfe ob generatedText vorhanden ist
      console.log('📄 Reading in UI geladen:', {
        id: loadedReading.id,
        hasReadingData: !!loadedReading.reading_data,
        hasGeneratedText: !!loadedReading.reading_data?.generatedText,
        generatedTextLength: loadedReading.reading_data?.generatedText?.length || 0,
        readingDataKeys: loadedReading.reading_data ? Object.keys(loadedReading.reading_data) : [],
        agentStatus: loadedReading.reading_data?.agentStatus,
        agentError: loadedReading.reading_data?.agentError,
        generatedTextPreview: loadedReading.reading_data?.generatedText?.substring(0, 100) || 'KEIN TEXT',
        readingDataType: typeof loadedReading.reading_data,
        fullReadingData: loadedReading.reading_data, // Vollständige Daten für Debugging
      });
    } catch (err: any) {
      console.error('Fehler beim Laden:', err);
      setError(err.message || 'Fehler beim Laden des Readings');
    } finally {
      setLoading(false);
    }
  };

  const getReadingMode = (): ReadingMode => {
    if (!reading) return 'single';
    const type = reading.reading_type;
    if (type === 'single' || type === 'human-design') return 'single';
    if (type === 'connection' || type === 'connectionKey') return 'connection';
    if (type === 'penta') return 'penta';
    return 'single';
  };

  const getEnabledSections = (): SectionId[] => {
    if (!reading?.reading_data) return [];
    const enabled = reading.reading_data.enabled_sections;
    if (Array.isArray(enabled)) {
      return enabled as SectionId[];
    }
    if (typeof enabled === 'object' && enabled !== null) {
      return Object.keys(enabled).filter((key) => enabled[key]) as SectionId[];
    }
    return [];
  };

  const handleExportPDF = async () => {
    if (!reading) {
      alert('Reading konnte nicht geladen werden');
      return;
    }

    try {
      // Dynamisch jsPDF importieren
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = margin;

      // Branding-Farben (als Tuple-Typen)
      const brandPrimary: [number, number, number] = [242, 159, 5]; // #F29F05
      const brandSecondary: [number, number, number] = [140, 29, 4]; // #8C1D04
      const brandGold: [number, number, number] = [232, 184, 109]; // #e8b86d
      const textDark: [number, number, number] = [11, 10, 15]; // #0b0a0f
      const textLight: [number, number, number] = [255, 255, 255];
      const textGray: [number, number, number] = [128, 128, 128];

      // Hilfsfunktion für Text mit Zeilenumbruch
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Prüfe ob neue Seite nötig
        if (yPos + (lines.length * fontSize * 0.4) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          // Header auf jeder Seite wiederholen
          drawPageHeader();
        }
        
        const xPos = align === 'center' ? pageWidth / 2 : (align === 'right' ? pageWidth - margin : margin);
        doc.text(lines, xPos, yPos, { align });
        yPos += lines.length * fontSize * 0.4 + 5;
      };

      // Header-Bereich zeichnen
      const drawPageHeader = () => {
        // Header-Box mit Branding-Farbe
        doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Logo/Title im Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textLight[0], textLight[1], textLight[2]);
        doc.text('The Connection Key', pageWidth / 2, 20, { align: 'center' });
        
        // Untertitel
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textLight[0], textLight[1], textLight[2]);
        doc.text('Human Design Reading', pageWidth / 2, 28, { align: 'center' });
        
        yPos = 45; // Start nach Header
      };

      // Erste Seite: Header zeichnen
      drawPageHeader();

      // Haupttitel (nach Header)
      const readingTitle = reading.reading_data?.reading_title || reading.client_name || 'Human Design Reading';
      addText(readingTitle, 22, true, [brandPrimary[0], brandPrimary[1], brandPrimary[2]], 'center');
      yPos += 8;

      // Geburtsdaten-Box mit Branding
      const readingData = reading.reading_data || {};
      
      // Info-Box zeichnen
      doc.setFillColor(245, 245, 245);
      const infoBoxHeight = 40;
      doc.roundedRect(margin, yPos, maxWidth, infoBoxHeight, 3, 3, 'F');
      doc.setDrawColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPos, maxWidth, infoBoxHeight, 3, 3);
      
      let infoYPos = yPos + 8;
      
      if (readingData.person || readingData.personA) {
        const person = readingData.person || readingData.personA;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Geburtsdaten:', margin + 5, infoYPos);
        infoYPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`Name: ${person.name || reading.client_name || 'Nicht angegeben'}`, margin + 5, infoYPos);
        infoYPos += 5;
        if (person.geburtsdatum) {
          doc.text(`Geboren: ${person.geburtsdatum} um ${person.geburtszeit || 'N/A'} in ${person.geburtsort || 'N/A'}`, margin + 5, infoYPos);
        }
      }

      // Connection Key: Beide Personen
      if (readingData.personA && readingData.personB) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Person A:', margin + 5, infoYPos);
        infoYPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`${readingData.personA.name} - ${readingData.personA.geburtsdatum} ${readingData.personA.geburtszeit}`, margin + 5, infoYPos);
        infoYPos += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Person B:', margin + 5, infoYPos);
        infoYPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`${readingData.personB.name} - ${readingData.personB.geburtsdatum} ${readingData.personB.geburtszeit}`, margin + 5, infoYPos);
      }

      // Penta: Gruppe
      if (readingData.people && Array.isArray(readingData.people)) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text(`Gruppe (${readingData.people.length} Personen):`, margin + 5, infoYPos);
        infoYPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        readingData.people.forEach((p: any, idx: number) => {
          doc.text(`${idx + 1}. ${p.name || 'Unbekannt'} - ${p.geburtsdatum || 'N/A'}`, margin + 5, infoYPos);
          infoYPos += 5;
        });
      }
      
      yPos += infoBoxHeight + 10;

      // Trennlinie mit Branding-Farbe
      doc.setDrawColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.setLineWidth(1.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 12;

      // Reading-Text mit Branding
      const generatedText = reading.reading_data?.generatedText || '';
      if (generatedText) {
        // Überschrift mit Branding
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Reading', margin, yPos);
        yPos += 10;
        
        // Text mit besserer Formatierung
        const cleanText = generatedText
          .replace(/#{1,6}\s+/g, '') // Überschriften entfernen
          .replace(/\*\*(.*?)\*\*/g, '$1') // Fettdruck entfernen
          .replace(/\*(.*?)\*/g, '$1') // Kursiv entfernen
          .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links entfernen
          .trim();
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        const lines = doc.splitTextToSize(cleanText, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPos > pageHeight - margin - 10) {
            doc.addPage();
            drawPageHeader();
            yPos = 45;
          }
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        yPos += 8;
      }

      // Zusätzlicher Text mit Branding
      const additionalText = reading.reading_data?.additionalText || '';
      if (additionalText) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          drawPageHeader();
          yPos = 45;
        }
        
        // Trennlinie
        doc.setDrawColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.setLineWidth(1);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        
        // Überschrift
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Zusätzliche Informationen', margin, yPos);
        yPos += 8;
        
        // Text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        const additionalLines = doc.splitTextToSize(additionalText, maxWidth);
        additionalLines.forEach((line: string) => {
          if (yPos > pageHeight - margin - 10) {
            doc.addPage();
            drawPageHeader();
            yPos = 45;
          }
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Footer mit Branding auf jeder Seite
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer-Box mit Branding-Farbe
        doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
        // Footer-Text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textLight[0], textLight[1], textLight[2]);
        const footerText = `Erstellt am: ${new Date(reading.created_at).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })} | Seite ${i} von ${totalPages}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('© The Connection Key - Human Design Reading', pageWidth / 2, pageHeight - 6, { align: 'center' });
      }

      // PDF herunterladen
      const fileName = `Reading_${reading.client_name || 'Reading'}_${new Date(reading.created_at).toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuche es erneut.');
    }
  };

  const handleEdit = () => {
    router.push(`/coach/readings/create?id=${readingId}`);
  };

  const handleSaveText = async () => {
    if (!reading) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/coach/readings/${readingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reading_data: {
            ...reading.reading_data,
            generatedText: editedGeneratedText,
            additionalText: editedAdditionalText,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      const data = await response.json();
      setReading(data.reading);
      setIsEditingText(false);
      alert('Text erfolgreich gespeichert!');
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err);
      alert('Fehler beim Speichern: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddTextBlock = (position: 'before' | 'after' | 'append') => {
    const textBlock = '\n\n---\n\n[Neuer Textbaustein - hier Text eingeben]\n\n';
    
    if (position === 'before') {
      setEditedGeneratedText(textBlock + editedGeneratedText);
    } else if (position === 'after') {
      setEditedGeneratedText(editedGeneratedText + textBlock);
    } else {
      setEditedAdditionalText(editedAdditionalText + textBlock);
    }
  };

  const handleRetryAgent = React.useCallback(async () => {
    if (!reading) return;
    
    setRetryingAgent(true);
    try {
      const response = await fetch(`/api/coach/readings/${readingId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Neugenerieren');
      }

      const data = await response.json();
      
      if (data.reading?.reading_data?.generatedText) {
        setReading(data.reading);
        setEditedGeneratedText(data.reading.reading_data.generatedText);
        alert('✅ Reading-Text erfolgreich generiert!');
      } else {
        alert('⚠️ Text konnte nicht generiert werden. Bitte prüfe, ob der Agent-Service läuft.');
      }
    } catch (err: any) {
      console.error('Fehler beim Neugenerieren:', err);
      alert('Fehler beim Neugenerieren: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setRetryingAgent(false);
    }
  }, [reading, readingId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link wurde in die Zwischenablage kopiert!');
    } catch (err) {
      alert('Fehler beim Kopieren des Links');
    }
  };

  const getModeLabel = () => {
    const mode = getReadingMode();
    switch (mode) {
      case 'single':
        return 'Human Design Reading';
      case 'connection':
        return 'Connection Key Analyse';
      case 'penta':
        return 'Penta / Gruppenresonanz';
      default:
        return reading?.reading_type || 'Reading';
    }
  };

  const getModeColor = () => {
    const mode = getReadingMode();
    switch (mode) {
      case 'single':
        return '#e8b86d'; // Gold
      case 'connection':
        return '#4fc3f7'; // Hellblau
      case 'penta':
        return '#4caf50'; // Grün
      default:
        return '#90caf9';
    }
  };

  const renderSection = (sectionId: SectionId) => {
    const sections: Record<SectionId, { title: string; description: string }> = {
      typeStrategy: {
        title: 'Typ & Strategie',
        description: 'Hier kommen Analyse-Infos zu Typ und Strategie des Klienten.',
      },
      authority: {
        title: 'Innere Autorität',
        description: 'Die innere Autorität des Klienten und wie er Entscheidungen treffen sollte.',
      },
      centers: {
        title: 'Zentren',
        description: 'Definiert / undefiniert – welche Zentren sind aktiv, welche offen?',
      },
      profile: {
        title: 'Profil',
        description: 'Profilanalyse des Klienten.',
      },
      channels: {
        title: 'Kanäle & Tore',
        description: 'Kanäle als Themenfelder und energetische Verbindungen.',
      },
      incarnationCross: {
        title: 'Inkarnationskreuz',
        description: 'Lebensaufgabe & Kreuz – die Mission des Klienten.',
      },
      sleepSystem: {
        title: 'Schlafsystem 2.0',
        description: 'Schlafsystem-Analyse für optimale Erholung.',
      },
      businessPotential: {
        title: 'Business-Potential',
        description: 'Business-Energie und berufliche Stärken.',
      },
      connectionOverview: {
        title: 'Grundresonanz & Dynamik',
        description: 'Die energetische Grundresonanz der beiden Personen und wie sie zusammenwirken.',
      },
      connectionStrengths: {
        title: 'Gemeinsame Stärken',
        description: 'Was funktioniert harmonisch? Wo fließen beide? Welche Komplementaritäten gibt es?',
      },
      connectionConflicts: {
        title: 'Konfliktfelder & Spannung',
        description: 'Energetische Reibungspunkte und Konditionierungen, die zu Spannungen führen können.',
      },
      connectionGrowth: {
        title: 'Wachstumspotenzial',
        description: 'Lernfelder, Wachstum, Entwicklungsmöglichkeiten in der Beziehung.',
      },
      connectionCommunication: {
        title: 'Empfehlungen & Kommunikation',
        description: 'Energetische Kommunikation & Umgang – wie können beide optimal miteinander kommunizieren?',
      },
      groupEnergy: {
        title: 'Gesamtenergie der Gruppe',
        description: 'Das energetische Feld der Gruppe – wie schwingt die Gruppe als Ganzes?',
      },
      groupCenters: {
        title: 'Zentren im Penta',
        description: 'Welche Zentren definiert sind – und von wem gehalten. Wer trägt welche Energie?',
      },
      groupRoles: {
        title: 'Rollen im Penta',
        description: 'Rollenverteilung: Initiator, Kommunikator, Träger, Beobachter – wer übernimmt welche Funktion?',
      },
      groupConflicts: {
        title: 'Konfliktfelder',
        description: 'Wo die Gruppe Spannungen erzeugt oder stockt. Energetische Reibungspunkte.',
      },
      groupGrowth: {
        title: 'Wachstum & lösende Kräfte',
        description: 'Wachstumschancen der Gruppe und wie sie gemeinsam stärker werden können.',
      },
    };

    const section = sections[sectionId];
    if (!section) return null;

    return (
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 2,
            }}
          >
            {section.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {section.description}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderClientHeader = () => {
    if (!reading) return null;

    const mode = getReadingMode();
    const readingData = reading.reading_data || {};

    if (mode === 'single' && readingData.person) {
      const p = readingData.person;
      return (
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
              Klientendaten
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Name:</strong> {p.name || reading.client_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Geburt:</strong> {p.birthDate || p.geburtsdatum || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Geburtsort:</strong> {p.birthPlace || p.geburtsort || '-'}
                </Typography>
              </Grid>
              {(p.birthTime || p.geburtszeit) && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <strong>Zeit:</strong> {p.birthTime || p.geburtszeit}
                  </Typography>
                </Grid>
              )}
              {readingData.focus && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <strong>Fokus:</strong> {readingData.focus}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      );
    }

    if (mode === 'connection' && readingData.personA && readingData.personB) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ClientCard title="Person A" person={readingData.personA} color={getModeColor()} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ClientCard title="Person B" person={readingData.personB} color={getModeColor()} />
          </Grid>
        </Grid>
      );
    }

    if (mode === 'penta' && readingData.people) {
      return (
        <Grid container spacing={3}>
          {readingData.people.map((person: any, i: number) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <ClientCard title={`Person ${i + 1}`} person={person} color={getModeColor()} />
            </Grid>
          ))}
        </Grid>
      );
    }

    // Fallback
    return (
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardContent>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <strong>Klient:</strong> {reading.client_name}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#e8b86d', mb: 2 }} />
          <Typography sx={{ color: '#e8b86d' }}>Lade Reading...</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !reading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
        }}
      >
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ mb: 3, background: 'rgba(211, 47, 47, 0.1)', color: '#ff5252' }}>
            {error || 'Reading nicht gefunden'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/coach/readings')}
            sx={{
              background: 'linear-gradient(135deg, #e8b86d 0%, #e8b86dcc 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Zurück zu Readings
          </Button>
        </Container>
      </Box>
    );
  }

  const mode = getReadingMode();
  const sections = getEnabledSections();
  const readingData = reading.reading_data || {};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#000000',
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Navigation */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/coach/readings')}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 3,
            '&:hover': {
              color: '#e8b86d',
              background: 'rgba(232, 184, 109, 0.1)',
            },
          }}
        >
          Zurück zu Readings
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 1,
            }}
          >
            {readingData.reading_title || reading.client_name || 'Reading'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Erstellt am{' '}
              {mounted && reading.created_at
                ? new Date(reading.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : reading.created_at
                  ? new Date(reading.created_at).toISOString().split('T')[0]
                  : 'N/A'}
            </Typography>
            <Chip
              label={getModeLabel()}
              sx={{
                background: `${getModeColor()}20`,
                color: getModeColor(),
                border: `1px solid ${getModeColor()}40`,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Client Data */}
        <Box sx={{ mb: 4 }}>{renderClientHeader()}</Box>

        {/* Context / Notes */}
        {(readingData.context || readingData.notes) && (
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mb: 4,
            }}
          >
            <CardContent>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  mb: 1,
                  display: 'block',
                }}
              >
                Kontext / Notizen
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {readingData.context || readingData.notes}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Debug Info (nur in Development) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 2, p: 2, background: 'rgba(255, 0, 0, 0.1)', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#fff' }}>
              Debug: hasGeneratedText = {readingData.generatedText ? 'true' : 'false'}, 
              Length = {readingData.generatedText?.length || 0}
            </Typography>
          </Box>
        )}

        {/* Generierter Text vom Agent */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(79, 195, 247, 0.3)',
            mb: 4,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#4fc3f7',
                  fontWeight: 600,
                }}
              >
                Analyse-Text {readingData.agentStatus === 'failed' && '(Nicht generiert)'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isEditingText && (
                  <>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setIsEditingText(true)}
                      sx={{
                        color: '#4fc3f7',
                        borderColor: '#4fc3f7',
                        '&:hover': {
                          background: 'rgba(79, 195, 247, 0.1)',
                        },
                      }}
                    >
                      Bearbeiten
                    </Button>
                    {!readingData.generatedText && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setIsEditingText(true);
                            setEditedGeneratedText('');
                          }}
                          sx={{
                            color: '#4fc3f7',
                            borderColor: '#4fc3f7',
                            '&:hover': {
                              background: 'rgba(79, 195, 247, 0.1)',
                            },
                          }}
                        >
                          Text hinzufügen
                        </Button>
                        {(readingData.agentStatus === 'failed' || readingData.agentStatus === 'error') && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={retryingAgent ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <RefreshIcon />}
                            onClick={handleRetryAgent}
                            disabled={retryingAgent}
                            sx={{
                              background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
                              color: '#000',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #29b6f6, #4fc3f7)',
                              },
                              '&.Mui-disabled': {
                                opacity: 0.6,
                              },
                            }}
                          >
                            {retryingAgent ? 'Generiere...' : 'Erneut versuchen'}
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
                {isEditingText && (
                  <>
                    <Button
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveText}
                      disabled={saving}
                      sx={{
                        color: '#4caf50',
                        borderColor: '#4caf50',
                        '&:hover': {
                          background: 'rgba(76, 175, 80, 0.1)',
                        },
                      }}
                    >
                      {saving ? 'Speichern...' : 'Speichern'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setIsEditingText(false);
                        setEditedGeneratedText(readingData.generatedText || '');
                      }}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Abbrechen
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {isEditingText ? (
              <Box>
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAddTextBlock('before')}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      fontSize: '0.75rem',
                    }}
                  >
                    Textbaustein oben
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAddTextBlock('after')}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      fontSize: '0.75rem',
                    }}
                  >
                    Textbaustein unten
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={editedGeneratedText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedGeneratedText(e.target.value)}
                  placeholder="Reading-Text hier eingeben oder bearbeiten..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '& fieldset': {
                        borderColor: 'rgba(79, 195, 247, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(79, 195, 247, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4fc3f7',
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              readingData.generatedText ? (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                  }}
                >
                  {readingData.generatedText}
                </Typography>
              ) : (
                <Box>
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      '& .MuiAlert-icon': {
                        color: '#ff9800',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1, fontWeight: 600 }}>
                      {readingData.agentError || 'Kein Text vorhanden. Klicke auf "Text hinzufügen" um einen Text zu erstellen.'}
                    </Typography>
                    {readingData.agentErrorDetails && (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mt: 1.5, mb: 1 }}>
                        {readingData.agentErrorDetails}
                      </Typography>
                    )}
                    {readingData.agentStatus === 'error' && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1, fontWeight: 600 }}>
                          🔧 Agent-Service starten:
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                            1. Terminal öffnen
                          </Box>
                          <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                            2. Zum Agent-Verzeichnis navigieren:
                          </Box>
                          <Box component="span" sx={{ display: 'block', mb: 1, ml: 2, color: '#4fc3f7' }}>
                            cd /opt/ck-agent
                          </Box>
                          <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                            3. Agent starten:
                          </Box>
                          <Box component="span" sx={{ display: 'block', mb: 1, ml: 2, color: '#4fc3f7' }}>
                            pm2 start ecosystem.config.cjs
                          </Box>
                          <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                            ODER für lokale Entwicklung:
                          </Box>
                          <Box component="span" sx={{ display: 'block', ml: 2, color: '#4fc3f7' }}>
                            node server.js
                          </Box>
                        </Typography>
                      </Box>
                    )}
                  </Alert>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontStyle: 'italic',
                    }}
                  >
                    Tipp: Du kannst den Text manuell hinzufügen oder auf "Erneut versuchen" klicken, um den Agent erneut aufzurufen.
                  </Typography>
                </Box>
              )
            )}
          </CardContent>
        </Card>

        {/* Zusätzlicher Text */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(232, 184, 109, 0.3)',
            mb: 4,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#e8b86d',
                  fontWeight: 600,
                }}
              >
                Zusätzliche Notizen
              </Typography>
              {!isEditingText && (
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditingText(true)}
                  sx={{
                    color: '#e8b86d',
                    borderColor: '#e8b86d',
                    '&:hover': {
                      background: 'rgba(232, 184, 109, 0.1)',
                    },
                  }}
                >
                  Bearbeiten
                </Button>
              )}
            </Box>

            {isEditingText ? (
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleAddTextBlock('append')}
                  sx={{
                    mb: 2,
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.75rem',
                  }}
                >
                  Textbaustein hinzufügen
                </Button>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={editedAdditionalText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedAdditionalText(e.target.value)}
                  placeholder="Zusätzliche Notizen hier eingeben..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '& fieldset': {
                        borderColor: 'rgba(232, 184, 109, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(232, 184, 109, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e8b86d',
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              readingData.additionalText ? (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                  }}
                >
                  {readingData.additionalText}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontStyle: 'italic',
                  }}
                >
                  Keine zusätzlichen Notizen vorhanden.
                </Typography>
              )
            )}
          </CardContent>
        </Card>

        {/* Sections */}
        {sections.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 3,
              }}
            >
              Analyse-Bereiche
            </Typography>
            {sections.map((section) => (
              <Box key={section}>{renderSection(section)}</Box>
            ))}
          </Box>
        ) : (
          !readingData.generatedText && (
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                py: 6,
              }}
            >
              <CardContent>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Keine Analyse-Bausteine ausgewählt.
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Bearbeite das Reading, um Sektionen hinzuzufügen.
                </Typography>
              </CardContent>
            </Card>
          )
        )}

        {/* Actions */}
        <Box sx={{ mt: 6, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleExportPDF}
            sx={{
              background: 'linear-gradient(135deg, #e8b86d 0%, #e8b86dcc 100%)',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #e8b86dcc 0%, #e8b86d 100%)',
              },
            }}
          >
            PDF Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#e8b86d',
                background: 'rgba(232, 184, 109, 0.1)',
              },
            }}
          >
            Reading bearbeiten
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#e8b86d',
                background: 'rgba(232, 184, 109, 0.1)',
              },
            }}
          >
            Teilen / Link kopieren
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

// Client Card Component
function ClientCard({ title, person, color }: { title: string; person: any; color: string }) {
  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100%',
      }}
    >
      <CardContent>
        <Typography
          variant="overline"
          sx={{
            color: color,
            fontWeight: 600,
            mb: 2,
            display: 'block',
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <strong>Name:</strong> {person.name || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <strong>Geburt:</strong> {person.birthDate || person.geburtsdatum || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <strong>Geburtsort:</strong> {person.birthPlace || person.geburtsort || '-'}
            </Typography>
          </Grid>
          {(person.birthTime || person.geburtszeit) && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <strong>Zeit:</strong> {person.birthTime || person.geburtszeit}
              </Typography>
            </Grid>
          )}
          {(person.relation || person.rolle || person.relationship) && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <strong>Rolle:</strong> {person.relation || person.rolle || person.relationship}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function ReadingPage() {
  return (
    <CoachAuth>
      <ReadingPageContent />
    </CoachAuth>
  );
}
