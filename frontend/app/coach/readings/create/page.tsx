'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import CoachAuth from '@/components/CoachAuth';
import CoachNavigation from '@/components/CoachNavigation';
import ReadingGenerator from '@/components/agents/ReadingGenerator';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  TextField as MuiTextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type ReadingMode = 'single' | 'connection' | 'penta';

type StepId = 'mode' | 'client' | 'sections' | 'format' | 'summary';

const steps: { id: StepId; label: string }[] = [
  { id: 'mode', label: 'Art wählen' },
  { id: 'client', label: 'Klientendaten' },
  { id: 'sections', label: 'Analyse-Bausteine' },
  { id: 'format', label: 'Format & Titel' },
  { id: 'summary', label: 'Übersicht' },
];

interface PersonData {
  name: string;
  relation: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

interface SingleReadingData {
  person: PersonData;
  focus: string;
  context: string;
}

interface ConnectionReadingData {
  personA: PersonData;
  personB: PersonData;
  focus: string;
  context: string;
}

interface PentaReadingData {
  groupSize: number;
  people: PersonData[];
  focus: string;
  context: string;
}

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

interface SectionConfig {
  id: SectionId;
  label: string;
  defaultEnabled: boolean;
}

const singleSections: SectionConfig[] = [
  { id: 'typeStrategy', label: 'Typ & Strategie', defaultEnabled: true },
  { id: 'authority', label: 'Innere Autorität', defaultEnabled: true },
  { id: 'centers', label: 'Zentren', defaultEnabled: true },
  { id: 'profile', label: 'Profil', defaultEnabled: false },
  { id: 'channels', label: 'Kanäle & Tore', defaultEnabled: false },
  { id: 'incarnationCross', label: 'Inkarnationskreuz', defaultEnabled: false },
  { id: 'sleepSystem', label: 'Schlafsystem 2.0', defaultEnabled: false },
  { id: 'businessPotential', label: 'Business-Potential', defaultEnabled: false },
];

const connectionSections: SectionConfig[] = [
  { id: 'connectionOverview', label: 'Grundresonanz & Dynamik', defaultEnabled: true },
  { id: 'connectionStrengths', label: 'Gemeinsame Stärken', defaultEnabled: true },
  { id: 'connectionConflicts', label: 'Konfliktfelder & Spannung', defaultEnabled: false },
  { id: 'connectionGrowth', label: 'Wachstumspotential', defaultEnabled: false },
  { id: 'connectionCommunication', label: 'Empfehlungen & Kommunikation', defaultEnabled: false },
  { id: 'businessPotential', label: 'Business-Potential', defaultEnabled: false },
];

const pentaSections: SectionConfig[] = [
  { id: 'groupEnergy', label: 'Gruppen-Schwingung & Gesamtenergie', defaultEnabled: true },
  { id: 'groupCenters', label: 'Zentren im Penta', defaultEnabled: true },
  { id: 'groupRoles', label: 'Rollen im Penta', defaultEnabled: true },
  { id: 'groupConflicts', label: 'Konflikte & Spannungsfelder', defaultEnabled: false },
  { id: 'groupGrowth', label: 'Wachstum & Lösungswege', defaultEnabled: false },
  { id: 'businessPotential', label: 'Business-Potential der Gruppe', defaultEnabled: false },
];

interface FormatData {
  title: string;
  format: 'session_only' | 'session_plus_pdf' | 'pdf_only';
  template: string;
  sendEmail: boolean;
  showInDashboard: boolean;
  saveAsTemplate: boolean;
}

interface AgentConfig {
  readingDepth: 'basic' | 'detailed' | 'premium';
  tone: 'professional' | 'warm' | 'casual' | 'poetic';
  focus: 'business' | 'relationship' | 'personal' | 'general';
  length: 'short' | 'medium' | 'long';
  includeExamples: boolean;
  includeRecommendations: boolean;
}

const initialPerson: PersonData = {
  name: '',
  relation: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
};

const initialSingle: SingleReadingData = {
  person: { ...initialPerson },
  focus: '',
  context: '',
};

const initialConnection: ConnectionReadingData = {
  personA: { ...initialPerson },
  personB: { ...initialPerson },
  focus: '',
  context: '',
};

const initialPenta = (size: number): PentaReadingData => ({
  groupSize: size,
  people: Array.from({ length: size }, () => ({ ...initialPerson })),
  focus: '',
  context: '',
});

const initialFormat: FormatData = {
  title: '',
  format: 'session_plus_pdf',
  template: '',
  sendEmail: true,
  showInDashboard: true,
  saveAsTemplate: false,
};

const initialAgentConfig: AgentConfig = {
  readingDepth: 'detailed',
  tone: 'warm',
  focus: 'general',
  length: 'medium',
  includeExamples: true,
  includeRecommendations: true,
};

const CreateReadingPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const readingId = searchParams?.get('id');
  const [mode, setMode] = useState<ReadingMode | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingReading, setLoadingReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number, duration: number, delay: number}>>([]);

  const [singleData, setSingleData] = useState<SingleReadingData>(initialSingle);
  const [connectionData, setConnectionData] =
    useState<ConnectionReadingData>(initialConnection);
  const [pentaData, setPentaData] = useState<PentaReadingData>(initialPenta(3));

  const [selectedSections, setSelectedSections] = useState<SectionId[]>([]);
  const [formatData, setFormatData] = useState<FormatData>(initialFormat);
  const [additionalText, setAdditionalText] = useState<string>('');
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(initialAgentConfig);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  const currentStep = steps[activeStepIndex].id;

  // Mounted State für Hydration-Fix
  useEffect(() => {
    setMounted(true);
    // Generate random positions only on client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStarPositions(stars);
  }, []);

  // Lade Reading, wenn ID vorhanden (Bearbeitungsmodus)
  useEffect(() => {
    if (readingId) {
      console.log('📝 Edit-Modus: Lade Reading mit ID:', readingId);
      loadReadingForEdit();
    } else {
      console.log('📝 Create-Modus: Keine Reading-ID vorhanden');
    }
  }, [readingId]);

  const loadReadingForEdit = async () => {
    try {
      setLoadingReading(true);
      setError(null);

      console.log('📥 Lade Reading für Bearbeitung:', readingId);
      const response = await fetch(`/api/coach/readings/${readingId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        console.error('❌ Fehler beim Laden des Readings:', errorData);
        throw new Error(errorData.error || 'Fehler beim Laden des Readings');
      }
      
      const data = await response.json();
      console.log('✅ Reading geladen:', data);

      const reading = data.reading || data;
      setIsEditing(true);

      // Setze Mode basierend auf reading_type
      const readingType = reading.reading_type;
      if (readingType === 'single' || readingType === 'human-design') {
        setMode('single');
      } else if (readingType === 'connection' || readingType === 'connectionKey') {
        setMode('connection');
      } else if (readingType === 'penta') {
        setMode('penta');
      }

      const rd = reading.reading_data || {};

      // Lade Daten basierend auf Mode
      if (readingType === 'single' || readingType === 'human-design') {
        setSingleData({
          person: {
            name: rd.person?.name || '',
            relation: rd.person?.relation || '',
            birthDate: rd.person?.geburtsdatum || '',
            birthTime: rd.person?.geburtszeit || '',
            birthPlace: rd.person?.geburtsort || '',
          },
          focus: rd.focus || '',
          context: rd.context || '',
        });
      } else if (readingType === 'connection' || readingType === 'connectionKey') {
        setConnectionData({
          personA: {
            name: rd.personA?.name || '',
            relation: rd.personA?.relation || '',
            birthDate: rd.personA?.geburtsdatum || '',
            birthTime: rd.personA?.geburtszeit || '',
            birthPlace: rd.personA?.geburtsort || '',
          },
          personB: {
            name: rd.personB?.name || '',
            relation: rd.personB?.relation || '',
            birthDate: rd.personB?.geburtsdatum || '',
            birthTime: rd.personB?.geburtszeit || '',
            birthPlace: rd.personB?.geburtsort || '',
          },
          focus: rd.focus || '',
          context: rd.context || '',
        });
      } else if (readingType === 'penta') {
        const people = rd.people || [];
        setPentaData({
          groupSize: rd.group_size || people.length || 3,
          people: people.map((p: any) => ({
            name: p.name || '',
            relation: p.rolle || p.relation || '',
            birthDate: p.geburtsdatum || '',
            birthTime: p.geburtszeit || '',
            birthPlace: p.geburtsort || '',
          })),
          focus: rd.focus || '',
          context: rd.context || '',
        });
      }

      // Lade Format-Daten
      setFormatData({
        title: rd.reading_title || '',
        format: rd.format || 'standard',
        template: rd.template || '',
        sendEmail: rd.send_email || false,
        showInDashboard: rd.show_in_dashboard || false,
        saveAsTemplate: rd.save_as_template || false,
      });

      // Lade Sections
      if (rd.enabled_sections && Array.isArray(rd.enabled_sections)) {
        setSelectedSections(rd.enabled_sections);
      }

      // Lade zusätzlichen Text (falls vorhanden)
      if (rd.additionalText) {
        setAdditionalText(rd.additionalText);
      }

      // Lade Agent-Konfiguration (falls vorhanden)
      if (rd.agentConfig) {
        setAgentConfig(rd.agentConfig);
      }

      // Springe zum letzten Schritt (Format)
      setActiveStepIndex(steps.length - 1);
    } catch (err: any) {
      console.error('Fehler beim Laden:', err);
      setError(err.message || 'Fehler beim Laden des Readings');
    } finally {
      setLoadingReading(false);
    }
  };

  const getSectionsForMode = (m: ReadingMode | null): SectionConfig[] => {
    if (!m) return [];
    if (m === 'single') return singleSections;
    if (m === 'connection') return connectionSections;
    return pentaSections;
  };

  const handleModeSelect = (m: ReadingMode) => {
    setMode(m);
    // beim Wechsel Standard-Sections setzen
    const defaults = getSectionsForMode(m)
      .filter((s) => s.defaultEnabled)
      .map((s) => s.id);
    setSelectedSections(defaults);
    // format title grob vorbelegen
    if (m === 'single') {
      setFormatData((prev) => ({
        ...prev,
        title: prev.title || 'Human Design Reading',
        template: prev.template || 'Standard Reading',
      }));
    } else if (m === 'connection') {
      setFormatData((prev) => ({
        ...prev,
        title: prev.title || 'Connection Key – Resonanzanalyse',
        template: prev.template || 'Connection Key Standard',
      }));
    } else {
      setFormatData((prev) => ({
        ...prev,
        title: prev.title || 'Penta / Gruppenresonanz',
        template: prev.template || 'Penta Familie / Team',
      }));
    }
  };

  const toggleSection = (id: SectionId) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const goNext = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const canGoNext = (): boolean => {
    if (currentStep === 'mode') {
      return mode !== null;
    }
    if (currentStep === 'client') {
      if (mode === 'single') {
        return singleData.person.name.trim().length > 0;
      }
      if (mode === 'connection') {
        return (
          connectionData.personA.name.trim().length > 0 &&
          connectionData.personB.name.trim().length > 0
        );
      }
      if (mode === 'penta') {
        return pentaData.people.every((p) => p.name.trim().length > 0);
      }
    }
    if (currentStep === 'sections') {
      return selectedSections.length > 0;
    }
    if (currentStep === 'format') {
      return formatData.title.trim().length > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!mode) return;

    setLoading(true);
    setError(null);

    try {
      // Transformiere Daten in API-Format
      let readingType: string;
      let clientName: string;
      let readingData: any;

      if (mode === 'single') {
        readingType = 'single';
        clientName = singleData.person.name;
        readingData = {
          person: {
            name: singleData.person.name,
            relation: singleData.person.relation,
            geburtsdatum: singleData.person.birthDate,
            geburtszeit: singleData.person.birthTime,
            geburtsort: singleData.person.birthPlace,
          },
          focus: singleData.focus,
          context: singleData.context,
        };
      } else if (mode === 'connection') {
        readingType = 'connection';
        clientName = connectionData.personA.name;
        readingData = {
          personA: {
            name: connectionData.personA.name,
            relation: connectionData.personA.relation,
            geburtsdatum: connectionData.personA.birthDate,
            geburtszeit: connectionData.personA.birthTime,
            geburtsort: connectionData.personA.birthPlace,
          },
          personB: {
            name: connectionData.personB.name,
            relation: connectionData.personB.relation,
            geburtsdatum: connectionData.personB.birthDate,
            geburtszeit: connectionData.personB.birthTime,
            geburtsort: connectionData.personB.birthPlace,
          },
          focus: connectionData.focus,
          context: connectionData.context,
        };
      } else {
        // penta
        readingType = 'penta';
        clientName = pentaData.people[0]?.name || 'Gruppe';
        readingData = {
          group_size: pentaData.groupSize,
          people: pentaData.people.map((p) => ({
            name: p.name,
            rolle: p.relation,
            geburtsdatum: p.birthDate,
            geburtszeit: p.birthTime,
            geburtsort: p.birthPlace,
          })),
          focus: pentaData.focus,
          context: pentaData.context,
        };
      }

      // Füge Format- und Sektions-Daten hinzu
      readingData = {
        ...readingData,
        reading_title: formatData.title,
        format: formatData.format,
        template: formatData.template,
        send_email: formatData.sendEmail,
        show_in_dashboard: formatData.showInDashboard,
        save_as_template: formatData.saveAsTemplate,
        enabled_sections: selectedSections,
        additionalText: additionalText, // Zusätzlicher Text
        agentConfig: agentConfig, // Agent-Konfiguration
      };

      const url = isEditing && readingId 
        ? `/api/coach/readings/${readingId}`
        : '/api/coach/readings';
      const method = isEditing && readingId ? 'PATCH' : 'POST';

      // Setze Agent-Status für besseres Feedback
      setAgentStatus('Vorbereitung...');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reading_type: readingType,
          client_name: clientName,
          reading_data: readingData,
        }),
      });

      // Status-Updates während der Verarbeitung
      setAgentStatus('Chart wird berechnet...');
      
      const data = await response.json();

      if (!response.ok) {
        setAgentStatus(null);
        throw new Error(data.error || `Fehler beim ${isEditing ? 'Aktualisieren' : 'Erstellen'} des Readings`);
      }

      // Status: Agent generiert Text
      setAgentStatus('KI-Agent generiert Reading-Text...');

      // Debug: Prüfe ob generatedText vorhanden ist
      console.log('✅ Reading erstellt/aktualisiert:', {
        id: data.reading?.id || readingId,
        hasGeneratedText: !!data.reading?.reading_data?.generatedText,
        hasGeneratedTextFlag: data.hasGeneratedText,
        message: data.message,
        agentStatus: data.reading?.reading_data?.agentStatus,
      });

      // Prüfe Agent-Status und zeige Warnung falls nötig
      const agentStatus = data.reading?.reading_data?.agentStatus;
      const agentError = data.reading?.reading_data?.agentError;
      
      if (agentStatus === 'failed' || agentStatus === 'error') {
        setError(
          `⚠️ ${agentError || 'Der KI-Agent konnte den Reading-Text nicht generieren. Das Reading wurde trotzdem erstellt und kann manuell bearbeitet werden.'}`
        );
        // Fehler ist nicht fatal - Reading wurde erstellt
        setTimeout(() => setError(null), 10000); // Nach 10 Sekunden ausblenden
      }

      // Status zurücksetzen nach erfolgreichem Abschluss
      setAgentStatus(null);

      // Erfolgreich erstellt/aktualisiert - Weiterleitung zur Reading-Detail-Seite
      if (data.reading?.id) {
        router.push(`/coach/readings/${data.reading.id}`);
      } else if (readingId) {
        // Bei Update: Weiterleitung zur Detail-Seite
        router.push(`/coach/readings/${readingId}`);
      } else {
        // Fallback: Zur Readings-Übersicht
        router.push('/coach/readings');
      }
    } catch (err: any) {
      console.error('Fehler beim Erstellen:', err);
      setError(err.message || 'Fehler beim Erstellen des Readings');
      setLoading(false);
    }
  };

  const renderStepper = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        mb: 3,
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isDone = index < activeStepIndex;
        
        return (
          <Box
            key={step.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              background: isActive
                ? 'rgba(242, 159, 5, 0.25)'
                : isDone
                ? 'rgba(76, 175, 80, 0.15)'
                : 'rgba(255, 255, 255, 0.08)',
              border: isActive
                ? '1px solid rgba(242, 159, 5, 0.5)'
                : isDone
                ? '1px solid rgba(76, 175, 80, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)'
                  : isDone
                  ? '#4caf50'
                  : 'rgba(255, 255, 255, 0.1)',
                color: isActive || isDone ? '#000' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {isDone ? '✓' : index + 1}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: isActive
                  ? '#F29F05'
                  : isDone
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(255, 255, 255, 0.5)',
                fontWeight: isActive ? 600 : 400,
                flex: 1,
              }}
            >
              {step.label}
            </Typography>
            {isActive && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#F29F05',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                    '50%': {
                      opacity: 0.5,
                      transform: 'scale(1.2)',
                    },
                  },
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );

  const renderModeStep = () => (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 1,
          }}
        >
          Was möchtest du erstellen?
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Wähle die Form deines Readings. Du kannst später einzelne Analyse-Bausteine
          flexibel aktivieren oder weglassen.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        <ModeCard
          title="Human Design Reading"
          icon="👤"
          description="Tiefes Reading für eine Person – Typ, Strategie, Autorität, Profil, Zentren & mehr."
          active={mode === 'single'}
          onClick={() => handleModeSelect('single')}
        />
        <ModeCard
          title="Connection Key"
          icon="💙"
          description="Resonanzanalyse zwischen zwei Menschen – Dynamik, Stärken & Konfliktfelder."
          active={mode === 'connection'}
          onClick={() => handleModeSelect('connection')}
        />
        <ModeCard
          title="Penta / Gruppenresonanz"
          icon="🧩"
          description="Familien & Teams (3–6 Personen) – Gruppenenergie, Rollen & Spannungsfelder."
          active={mode === 'penta'}
          onClick={() => handleModeSelect('penta')}
        />
      </Box>
    </Box>
  );

  const updatePerson =
    (target: 'single' | 'connectionA' | 'connectionB' | { mode: 'penta'; index: number }) =>
    (field: keyof PersonData, value: string) => {
      if (target === 'single') {
        setSingleData((prev) => ({
          ...prev,
          person: { ...prev.person, [field]: value },
        }));
      } else if (target === 'connectionA') {
        setConnectionData((prev) => ({
          ...prev,
          personA: { ...prev.personA, [field]: value },
        }));
      } else if (target === 'connectionB') {
        setConnectionData((prev) => ({
          ...prev,
          personB: { ...prev.personB, [field]: value },
        }));
      } else {
        setPentaData((prev) => {
          const people = [...prev.people];
          people[target.index] = { ...people[target.index], [field]: value };
          return { ...prev, people };
        });
      }
    };

  const renderClientStep = () => {
    if (!mode) return null;

    if (mode === 'single') {
      const { person, focus, context } = singleData;
      return (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Klientendaten
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Bitte fülle die wichtigsten Informationen für das Reading aus.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                value={person.name}
                onChange={(v) => updatePerson('single')('name', v)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Beziehung / Kontext (optional)"
                value={person.relation}
                onChange={(v) => updatePerson('single')('relation', v)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Geburtsdatum"
                placeholder="TT.MM.JJJJ"
                value={person.birthDate}
                onChange={(v) => updatePerson('single')('birthDate', v)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Geburtszeit (optional)"
                placeholder="HH:MM"
                value={person.birthTime}
                onChange={(v) => updatePerson('single')('birthTime', v)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Geburtsort"
                value={person.birthPlace}
                onChange={(v) => updatePerson('single')('birthPlace', v)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SelectField
                label="Fokus des Readings"
                value={focus}
                onChange={(v) => setSingleData((prev) => ({ ...prev, focus: v }))}
                options={[
                  { value: '', label: 'Bitte wählen …' },
                  { value: 'business', label: 'Business & Berufung' },
                  { value: 'relationship', label: 'Beziehung & Partnerschaft' },
                  { value: 'personal', label: 'Persönliche Entwicklung' },
                  { value: 'life', label: 'Lebensweg & Ausrichtung' },
                ]}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <TextAreaField
              label="Notizen / Kontext des Klienten (optional)"
              value={context}
              onChange={(v) => setSingleData((prev) => ({ ...prev, context: v }))}
            />
          </Box>
        </Box>
      );
    }

    if (mode === 'connection') {
      const { personA, personB, focus, context } = connectionData;
        return (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Personen-Daten
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Gib die Daten beider Personen für die Resonanzanalyse ein.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#F29F05',
                      fontWeight: 600,
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Person A
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Name"
                      value={personA.name}
                      onChange={(v) => updatePerson('connectionA')('name', v)}
                    />
                    <TextField
                      label="Beziehung zu Person B"
                      value={personA.relation}
                      onChange={(v) => updatePerson('connectionA')('relation', v)}
                    />
                    <TextField
                      label="Geburtsdatum"
                      placeholder="TT.MM.JJJJ"
                      value={personA.birthDate}
                      onChange={(v) => updatePerson('connectionA')('birthDate', v)}
                    />
                    <TextField
                      label="Geburtszeit (optional)"
                      placeholder="HH:MM"
                      value={personA.birthTime}
                      onChange={(v) => updatePerson('connectionA')('birthTime', v)}
                    />
                    <TextField
                      label="Geburtsort"
                      value={personA.birthPlace}
                      onChange={(v) => updatePerson('connectionA')('birthPlace', v)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#F29F05',
                      fontWeight: 600,
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Person B
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Name"
                      value={personB.name}
                      onChange={(v) => updatePerson('connectionB')('name', v)}
                    />
                    <TextField
                      label="Beziehung zu Person A"
                      value={personB.relation}
                      onChange={(v) => updatePerson('connectionB')('relation', v)}
                    />
                    <TextField
                      label="Geburtsdatum"
                      placeholder="TT.MM.JJJJ"
                      value={personB.birthDate}
                      onChange={(v) => updatePerson('connectionB')('birthDate', v)}
                    />
                    <TextField
                      label="Geburtszeit (optional)"
                      placeholder="HH:MM"
                      value={personB.birthTime}
                      onChange={(v) => updatePerson('connectionB')('birthTime', v)}
                    />
                    <TextField
                      label="Geburtsort"
                      value={personB.birthPlace}
                      onChange={(v) => updatePerson('connectionB')('birthPlace', v)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <SelectField
                label="Fokus der Resonanzanalyse"
                value={focus}
                onChange={(v) => setConnectionData((prev) => ({ ...prev, focus: v }))}
                options={[
                  { value: '', label: 'Bitte wählen …' },
                  { value: 'partnership', label: 'Partnerschaft' },
                  { value: 'family', label: 'Familie' },
                  { value: 'business', label: 'Business / Team' },
                  { value: 'friendship', label: 'Freundschaft' },
                ]}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <TextAreaField
              label="Situation / Kontext (optional)"
              value={context}
              onChange={(v) => setConnectionData((prev) => ({ ...prev, context: v }))}
            />
          </Box>
        </Box>
      );
    }

    // Penta / Gruppe
    const { groupSize, people, focus, context } = pentaData;
        return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Gruppen-Daten
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Gib die Daten aller Personen für die Gruppenresonanz-Analyse ein.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SelectField
              label="Gruppengröße"
              value={String(groupSize)}
              onChange={(v) => {
                const size = parseInt(v, 10);
                setPentaData((prev) => {
                  const newPeople = Array.from({ length: size }, (_, idx) => {
                    if (prev.people[idx]) return prev.people[idx];
                    return { ...initialPerson };
                  });
                  return { ...prev, groupSize: size, people: newPeople };
                });
              }}
              options={[
                { value: '3', label: '3 Personen' },
                { value: '4', label: '4 Personen' },
                { value: '5', label: '5 Personen (klassisches Penta)' },
                { value: '6', label: '6 Personen (erweitertes Feld)' },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectField
              label="Fokus der Gruppenanalyse"
              value={focus}
              onChange={(v) => setPentaData((prev) => ({ ...prev, focus: v }))}
              options={[
                { value: '', label: 'Bitte wählen …' },
                { value: 'family', label: 'Familienharmonie' },
                { value: 'parentsChildren', label: 'Eltern–Kind–Dynamik' },
                { value: 'team', label: 'Teamenergie / Business' },
                { value: 'friends', label: 'Freundesgruppe' },
              ]}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {people.map((person, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#F29F05',
                      fontWeight: 600,
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Person {index + 1}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Name"
                      value={person.name}
                      onChange={(v) =>
                        updatePerson({ mode: 'penta', index })('name', v)
                      }
                    />
                    <TextField
                      label="Rolle in der Gruppe"
                      placeholder="Mutter, Vater, Kind, Teamlead, etc."
                      value={person.relation}
                      onChange={(v) =>
                        updatePerson({ mode: 'penta', index })('relation', v)
                      }
                    />
                    <TextField
                      label="Geburtsdatum"
                      placeholder="TT.MM.JJJJ"
                      value={person.birthDate}
                      onChange={(v) =>
                        updatePerson({ mode: 'penta', index })('birthDate', v)
                      }
                    />
                    <TextField
                      label="Geburtszeit (optional)"
                      placeholder="HH:MM"
                      value={person.birthTime}
                      onChange={(v) =>
                        updatePerson({ mode: 'penta', index })('birthTime', v)
                      }
                    />
                    <TextField
                      label="Geburtsort"
                      value={person.birthPlace}
                      onChange={(v) =>
                        updatePerson({ mode: 'penta', index })('birthPlace', v)
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2 }}>
          <TextAreaField
            label="Situation / Kontext (optional)"
            value={context}
            onChange={(v) => setPentaData((prev) => ({ ...prev, context: v }))}
          />
        </Box>
      </Box>
    );
  };

  const renderSectionsStep = () => {
    if (!mode) return null;
    const sections = getSectionsForMode(mode);

        return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Analyse-Bausteine
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Aktiviere die Bereiche, die in diesem Reading vorkommen sollen. Du
            kannst damit dein Reading sehr gezielt auf das Thema des Klienten
            ausrichten.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {sections.map((section) => (
            <Grid item xs={12} md={6} key={section.id}>
              <Card
                component="button"
                onClick={() => toggleSection(section.id)}
                sx={{
                  background: selectedSections.includes(section.id)
                    ? 'rgba(242, 159, 5, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: selectedSections.includes(section.id)
                    ? '2px solid #F29F05'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  width: '100%',
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#fff',
                    }}
                  >
                    {section.label}
                  </Typography>
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    sx={{
                      color: '#F29F05',
                      '&.Mui-checked': {
                        color: '#F29F05',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderFormatStep = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 1,
          }}
        >
          Format & Ausgabe
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Bestimme, wie dein Reading aussehen und versendet werden soll.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Titel des Readings"
            value={formatData.title}
            onChange={(v) => setFormatData((prev) => ({ ...prev, title: v }))}
            placeholder="z.B. Soul Business Reading – Max Mustermann"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <SelectField
            label="Format"
            value={formatData.format}
            onChange={(v) =>
              setFormatData((prev) => ({
                ...prev,
                format: v as FormatData['format'],
              }))
            }
            options={[
              { value: 'session_only', label: 'Nur Session (ohne PDF)' },
              {
                value: 'session_plus_pdf',
                label: 'Session + PDF-Zusammenfassung',
              },
              { value: 'pdf_only', label: 'Nur PDF-Reading' },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Reading-Vorlage
            </Typography>
            <Tooltip title="Wähle eine Vorlage für die Struktur des Readings. Der Agent generiert den Inhalt automatisch basierend auf der gewählten Vorlage.">
              <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <SelectField
            label="Reading-Vorlage"
            value={formatData.template}
            onChange={(v) => setFormatData((prev) => ({ ...prev, template: v }))}
            options={[
              { value: '', label: 'Keine Vorlage / Standard' },
              { value: 'basis-reading', label: 'Basis-Reading (Kompakt)' },
              { value: 'erweitertes-reading', label: 'Erweitertes Reading (Detailliert)' },
              { value: 'grosses-reading', label: 'Großes Reading (Vollständig)' },
              { value: 'business-reading', label: 'Business & Berufung' },
              { value: 'relationship-reading', label: 'Beziehung & Partnerschaft' },
              { value: 'sexuality', label: 'Sexuality & Chemistry' },
              { value: 'sleep-system', label: 'Schlafsystem 2.0' },
              { value: 'connection-key-standard', label: 'Connection Key Standard' },
              { value: 'penta-team', label: 'Penta Familie / Team' },
            ]}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <CheckboxField
          label="Klient erhält eine Zusammenfassung per E-Mail"
          checked={formatData.sendEmail}
          onChange={(checked) =>
            setFormatData((prev) => ({ ...prev, sendEmail: checked }))
          }
        />
        <CheckboxField
          label="Reading im Klienten-Dashboard anzeigen"
          checked={formatData.showInDashboard}
          onChange={(checked) =>
            setFormatData((prev) => ({ ...prev, showInDashboard: checked }))
          }
        />
        <CheckboxField
          label="Dieses Setup als Vorlage speichern"
          checked={formatData.saveAsTemplate}
          onChange={(checked) =>
            setFormatData((prev) => ({ ...prev, saveAsTemplate: checked }))
          }
        />
      </Box>

      {/* Agent-Konfiguration */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: '1px solid rgba(242, 159, 5, 0.3)',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#F29F05',
              fontWeight: 600,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            🤖 Agent-Konfiguration
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Passe die Generierung des Reading-Textes durch den KI-Agenten an.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Reading-Tiefe
              </Typography>
              <Tooltip title="Bestimmt, wie detailliert der generierte Reading-Text sein soll. Basis ist kurz und prägnant, Premium sehr ausführlich mit allen Details.">
                <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <SelectField
              label="Reading-Tiefe"
              value={agentConfig.readingDepth}
              onChange={(v) =>
                setAgentConfig((prev) => ({
                  ...prev,
                  readingDepth: v as AgentConfig['readingDepth'],
                }))
              }
              options={[
                { value: 'basic', label: 'Basis (Kurz & prägnant)' },
                { value: 'detailed', label: 'Detailliert (Empfohlen)' },
                { value: 'premium', label: 'Premium (Sehr ausführlich)' },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Ton & Stil
              </Typography>
              <Tooltip title="Bestimmt den Schreibstil des generierten Textes. Professionell für Business-Readings, warm für persönliche, poetisch für inspirierende Texte.">
                <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <SelectField
              label="Ton & Stil"
              value={agentConfig.tone}
              onChange={(v) =>
                setAgentConfig((prev) => ({
                  ...prev,
                  tone: v as AgentConfig['tone'],
                }))
              }
              options={[
                { value: 'professional', label: 'Professionell' },
                { value: 'warm', label: 'Warm & persönlich' },
                { value: 'casual', label: 'Locker & freundlich' },
                { value: 'poetic', label: 'Poetisch & inspirierend' },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectField
              label="Fokus-Bereich"
              value={agentConfig.focus}
              onChange={(v) =>
                setAgentConfig((prev) => ({
                  ...prev,
                  focus: v as AgentConfig['focus'],
                }))
              }
              options={[
                { value: 'general', label: 'Allgemein' },
                { value: 'business', label: 'Business & Berufung' },
                { value: 'relationship', label: 'Beziehung & Partnerschaft' },
                { value: 'personal', label: 'Persönliche Entwicklung' },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectField
              label="Text-Länge"
              value={agentConfig.length}
              onChange={(v) =>
                setAgentConfig((prev) => ({
                  ...prev,
                  length: v as AgentConfig['length'],
                }))
              }
              options={[
                { value: 'short', label: 'Kurz (800-1200 Wörter)' },
                { value: 'medium', label: 'Mittel (1500-2500 Wörter)' },
                { value: 'long', label: 'Lang (3000+ Wörter)' },
              ]}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <CheckboxField
            label="Beispiele & praktische Anwendungen einbeziehen"
            checked={agentConfig.includeExamples}
            onChange={(checked) =>
              setAgentConfig((prev) => ({ ...prev, includeExamples: checked }))
            }
          />
          <CheckboxField
            label="Konkrete Handlungsempfehlungen generieren"
            checked={agentConfig.includeRecommendations}
            onChange={(checked) =>
              setAgentConfig((prev) => ({
                ...prev,
                includeRecommendations: checked,
              }))
            }
          />
        </Box>
      </Box>

      {/* Zusätzlicher Text */}
      <Box sx={{ mt: 3 }}>
        <TextAreaField
          label="Zusätzlicher Text / Notizen (optional)"
          value={additionalText}
          onChange={(v) => setAdditionalText(v)}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            mt: 1,
            display: 'block',
          }}
        >
          Dieser Text wird zum Reading hinzugefügt und kann später bearbeitet werden.
        </Typography>
      </Box>
    </Box>
  );

  const renderSummaryStep = () => {
    if (!mode) return null;

    const modeLabel =
      mode === 'single'
        ? 'Human Design Reading (Einzelperson)'
        : mode === 'connection'
          ? 'Connection Key – Resonanzanalyse (2 Personen)'
          : 'Penta / Gruppenresonanz (3–6 Personen)';

    const sections = getSectionsForMode(mode).filter((s) =>
      selectedSections.includes(s.id),
    );

        return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Übersicht & Bestätigung
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Bitte überprüfe alle Angaben, bevor du das Reading erstellst.
          </Typography>
        </Box>
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  mb: 1,
                  display: 'block',
                }}
              >
                Art
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {modeLabel}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  mb: 1,
                  display: 'block',
                }}
              >
                Analyse-Bausteine
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {sections.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.label}
                    size="small"
                    sx={{
                      background: 'rgba(242, 159, 5, 0.2)',
                      color: '#F29F05',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Titel
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                  {formatData.title}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Format
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {formatData.format === 'session_only' && 'Nur Session'}
                  {formatData.format === 'session_plus_pdf' &&
                    'Session + PDF-Zusammenfassung'}
                  {formatData.format === 'pdf_only' && 'Nur PDF-Reading'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Vorlage
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {formatData.template || 'Keine Vorlage gewählt'}
                </Typography>
              </Grid>
            </Grid>

            {/* Agent-Vorschau */}
            <Box
              sx={{
                pt: 3,
                mt: 3,
                borderTop: '1px solid rgba(242, 159, 5, 0.3)',
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: '#F29F05',
                  fontWeight: 600,
                  mb: 2,
                  display: 'block',
                }}
              >
                🤖 Agent-Konfiguration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.5 }}
                  >
                    Reading-Tiefe
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {agentConfig.readingDepth === 'basic' && 'Basis (Kurz & prägnant)'}
                    {agentConfig.readingDepth === 'detailed' && 'Detailliert (Empfohlen)'}
                    {agentConfig.readingDepth === 'premium' && 'Premium (Sehr ausführlich)'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.5 }}
                  >
                    Ton & Stil
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {agentConfig.tone === 'professional' && 'Professionell'}
                    {agentConfig.tone === 'warm' && 'Warm & persönlich'}
                    {agentConfig.tone === 'casual' && 'Locker & freundlich'}
                    {agentConfig.tone === 'poetic' && 'Poetisch & inspirierend'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.5 }}
                  >
                    Fokus-Bereich
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {agentConfig.focus === 'general' && 'Allgemein'}
                    {agentConfig.focus === 'business' && 'Business & Berufung'}
                    {agentConfig.focus === 'relationship' && 'Beziehung & Partnerschaft'}
                    {agentConfig.focus === 'personal' && 'Persönliche Entwicklung'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.5 }}
                  >
                    Text-Länge
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {agentConfig.length === 'short' && 'Kurz (800-1200 Wörter)'}
                    {agentConfig.length === 'medium' && 'Mittel (1500-2500 Wörter)'}
                    {agentConfig.length === 'long' && 'Lang (3000+ Wörter)'}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {agentConfig.includeExamples && (
                  <Chip
                    label="Beispiele & Anwendungen"
                    size="small"
                    sx={{
                      background: 'rgba(242, 159, 5, 0.2)',
                      color: '#F29F05',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                    }}
                  />
                )}
                {agentConfig.includeRecommendations && (
                  <Chip
                    label="Handlungsempfehlungen"
                    size="small"
                    sx={{
                      background: 'rgba(242, 159, 5, 0.2)',
                      color: '#F29F05',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                    }}
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                pt: 2,
                mt: 3,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Du kannst dieses Reading nach dem Erstellen weiter bearbeiten, bevor
                du es an deine Klienten sendest.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        pt: 0,
        pb: 8,
        overflow: 'hidden',
      }}
    >
      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
            zIndex: 1,
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

      <Box sx={{ position: 'relative', zIndex: 1000, pt: 0, mt: 0 }}>
        <CoachNavigation />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: 2 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Box sx={{ 
            position: 'relative', 
            width: { xs: '100%', md: 600 }, 
            maxWidth: 600, 
            height: { xs: 120, md: 180 }, 
            mx: 'auto' 
          }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </Box>
        </Box>

      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center', px: { xs: 1, md: 0 } }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: { xs: 1, md: 1 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            lineHeight: { xs: 1.2, md: 1.3 },
          }}
        >
          {isEditing ? 'Reading bearbeiten' : 'Neues Reading erstellen'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '0.875rem', md: '1rem' },
            lineHeight: { xs: 1.5, md: 1.6 },
          }}
        >
          Schritt für Schritt zu deinem individuellen Human Design Reading
        </Typography>
      </Box>

      {/* Einleitung */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2) 0%, rgba(140, 29, 4, 0.15) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(242, 159, 5, 0.4)',
          mb: { xs: 3, md: 4 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              color: '#F29F05',
              fontWeight: 600,
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '1.125rem', md: '1.5rem' },
            }}
          >
            Willkommen im Reading-Assistenten von The Connection Key
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 2,
              lineHeight: 1.8,
            }}
          >
            Hier kannst du Schritt für Schritt eines von drei Formaten erstellen:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              ein professionelles Human Design Reading,
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              eine Connection Key Resonanzanalyse zwischen zwei Personen
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              oder eine Penta-Gruppenresonanz für Familien und Teams (3–6 Personen).
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 2,
              lineHeight: 1.8,
            }}
          >
            Wähle einfach aus, welche Art von Analyse du erstellen möchtest. Danach führt dich der Assistent durch alle wichtigen Schritte:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Klientendaten eingeben
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Analyse-Bausteine auswählen
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Darstellung & Format bestimmen
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
              Übersicht prüfen
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 2,
              lineHeight: 1.8,
            }}
          >
            Am Ende erhältst du ein vollständig aufbereitetes Reading oder eine Resonanzanalyse, die du speichern, exportieren oder direkt weitergeben kannst.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#F29F05',
              fontWeight: 600,
              fontStyle: 'italic',
              lineHeight: 1.8,
            }}
          >
            Flexibel. Klar. Professionell.
          </Typography>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        {renderStepper()}
      </Box>

      {/* Content Card */}
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            {currentStep === 'mode' && renderModeStep()}
            {currentStep === 'client' && renderClientStep()}
            {currentStep === 'sections' && renderSectionsStep()}
            {currentStep === 'format' && renderFormatStep()}
            {currentStep === 'summary' && (
              <>
                {renderSummaryStep()}
                <ReadingGenerator
                  wizardData={{
                    mode,
                    singleData,
                    connectionData,
                    pentaData,
                    selectedSections,
                    formatData,
                    additionalText,
                    agentConfig,
                  }}
                  mode={mode || ''}
                  readingId={readingId}
                />
              </>
            )}
          </Box>

          {/* Navigation */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              onClick={goBack}
              disabled={activeStepIndex === 0 || loading}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                },
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              ← Zurück
            </Button>

            {currentStep === 'summary' ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                  color: '#000',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: '#000' }} />
                      <span>{isEditing ? 'Wird aktualisiert...' : 'Wird erstellt...'}</span>
                    </Box>
                    {agentStatus && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(0, 0, 0, 0.7)',
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                        }}
                      >
                        🤖 {agentStatus}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  isEditing ? 'Reading aktualisieren' : 'Reading & Analyse erstellen'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={goNext}
                disabled={!canGoNext() || loading}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                  color: '#000',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.4,
                  },
                }}
              >
                Weiter →
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
};

const CreateReadingPage: React.FC = () => {
  return (
    <CoachAuth>
      <Suspense fallback={
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#000000'
        }}>
          <CircularProgress sx={{ color: '#e8b86d' }} />
        </Box>
      }>
        <CreateReadingPageContent />
      </Suspense>
    </CoachAuth>
  );
};

export default CreateReadingPage;

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <MuiTextField
    fullWidth
    label={label}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    size="small"
    sx={{
      '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#F29F05',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-focused': {
          color: '#F29F05',
        },
      },
    }}
  />
);

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <FormControl fullWidth size="small">
    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{label}</InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      sx={{
        color: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#F29F05',
        },
        '& .MuiSvgIcon-root': {
          color: '#fff',
        },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value || opt.label} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
}) => (
  <MuiTextField
    fullWidth
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    multiline
    rows={4}
    sx={{
      '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#F29F05',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-focused': {
          color: '#F29F05',
        },
      },
    }}
  />
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
}) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          color: '#F29F05',
          '&.Mui-checked': {
            color: '#F29F05',
          },
        }}
      />
    }
    label={label}
    sx={{
      color: 'rgba(255, 255, 255, 0.9)',
      '& .MuiFormControlLabel-label': {
        fontSize: '0.875rem',
      },
    }}
  />
);

interface ModeCardProps {
  title: string;
  icon: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({
  title,
  icon,
  description,
  active,
  onClick,
}) => {
  const colors = {
    single: '#F29F05',
    connection: '#4fc3f7',
    penta: '#4caf50',
  };
  
  const getColor = () => {
    if (title.includes('Human Design')) return colors.single;
    if (title.includes('Connection Key')) return colors.connection;
    return colors.penta;
  };

  const cardColor = getColor();

  return (
    <Card
      component="button"
      onClick={onClick}
      sx={{
        background: active
          ? `rgba(255, 255, 255, 0.15)`
          : 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
        border: active
          ? `2px solid ${cardColor}`
          : '1px solid rgba(255, 255, 255, 0.2)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        p: { xs: 2, md: 3 },
        '&:hover': {
          transform: { xs: 'none', md: 'translateY(-4px)' },
          boxShadow: { xs: 'none', md: `0 8px 24px ${cardColor}40` },
          borderColor: cardColor,
          background: 'rgba(255, 255, 255, 0.18)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
        <Typography
          variant="h4"
          sx={{
            mb: { xs: 1.5, md: 2 },
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          {icon}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: active ? cardColor : '#ffffff',
            fontWeight: 600,
            mb: { xs: 1, md: 1.5 },
            fontSize: { xs: '1rem', md: '1.25rem' },
            lineHeight: { xs: 1.3, md: 1.4 },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
            lineHeight: { xs: 1.5, md: 1.6 },
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
          }}
        >
          {description}
        </Typography>
        {active && (
          <Box
            sx={{
              mt: 2,
              height: 2,
              background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}cc 100%)`,
              borderRadius: 1,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
