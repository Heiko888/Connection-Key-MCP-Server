// Moon Calendar API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/moon-calendar`
  : '/api/moon-calendar'; // Relative URL für gleiche Domain

export interface MoonPhase {
  name: string;
  description: string;
  icon: string;
  energy: string;
  color: string;
  advice: string;
  explanation: string;
  reflectionExercises: string[];
  moonRituals: string[];
  humanDesignConnection: string;
}

export interface MoonPhaseResponse {
  date: string;
  phase: MoonPhase;
  timestamp: string;
}

export interface CalendarDay {
  date: string;
  day: number;
  phase: {
    name: string;
    icon: string;
    energy: string;
  };
}

export interface MoonCalendarResponse {
  year: number;
  month: number;
  calendar: CalendarDay[];
}

export interface CurrentMoonResponse {
  current: {
    date: string;
    time: string;
    phase: MoonPhase;
    cycleProgress: number;
  };
  nextPhase: {
    estimatedDate: string;
  };
}

// Neue Interfaces für erweiterte Features
export interface MoonTracking {
  id: string;
  user_id: string;
  date: string;
  moon_phase: string;
  mood: number; // 1-10
  energy: number; // 1-10
  notes: string;
  rituals_completed: string[];
  created_at: string;
}

export interface MoonNotification {
  id: string;
  user_id: string;
  moon_phase: string;
  notification_type: 'full_moon' | 'new_moon' | 'quarter_moon' | 'custom';
  message: string;
  scheduled_date: string;
  is_sent: boolean;
  created_at: string;
}

export interface TrackingStats {
  total_entries: number;
  average_mood: number;
  average_energy: number;
  most_common_phase: string | null;
  phase_correlations: {
    [phase: string]: {
      mood: number;
      energy: number;
      count: number;
    };
  };
}

export interface HumanDesignRecommendations {
  hd_type: string;
  recommendations: {
    optimal_phases: string[];
    advice: string;
    rituals: string[];
  };
  current_phase: string;
  is_optimal_phase: boolean;
}

// Bestehende API-Funktionen
export async function fetchCurrentMoonPhase(): Promise<CurrentMoonResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/current`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der aktuellen Mondphase:', error);
    throw error;
  }
}

export async function fetchMoonPhase(date: string): Promise<MoonPhaseResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/phases/${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der Mondphase:', error);
    throw error;
  }
}

export async function fetchMonthCalendar(year: number, month: number): Promise<MoonCalendarResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/calendar/${year}/${month}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden des Mondkalenders:', error);
    throw error;
  }
}

export async function fetchAllPhases(): Promise<{ phases: MoonPhase[]; totalPhases: number; cycleLength: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/phases`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden aller Mondphasen:', error);
    throw error;
  }
}

// NEUE API-FUNKTIONEN:

// Moon-Tracking Funktionen
export async function addMoonTracking(trackingData: {
  user_id: string;
  date: string;
  moon_phase: string;
  mood?: number;
  energy?: number;
  notes?: string;
  rituals_completed?: string[];
}): Promise<MoonTracking & { journal_entry?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Fehler beim Speichern des Moon-Trackings:', error);
    throw error;
  }
}

export async function fetchUserTracking(
  userId: string, 
  options?: { 
    start_date?: string; 
    end_date?: string; 
    limit?: number; 
  }
): Promise<MoonTracking[]> {
  try {
    const params = new URLSearchParams();
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const url = `${API_BASE_URL}/tracking/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden des Moon-Trackings:', error);
    throw error;
  }
}

export async function fetchTrackingStats(userId: string): Promise<TrackingStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/tracking/${userId}/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der Tracking-Statistiken:', error);
    throw error;
  }
}

// Moon-Benachrichtigungen Funktionen
export async function createMoonNotification(notificationData: {
  user_id: string;
  moon_phase: string;
  notification_type: 'full_moon' | 'new_moon' | 'quarter_moon' | 'custom';
  message?: string;
  scheduled_date?: string;
}): Promise<MoonNotification> {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Erstellen der Moon-Benachrichtigung:', error);
    throw error;
  }
}

export async function fetchUserNotifications(userId: string): Promise<MoonNotification[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der Moon-Benachrichtigungen:', error);
    throw error;
  }
}

// Human Design Integration
export async function fetchHumanDesignRecommendations(hdType: string): Promise<HumanDesignRecommendations> {
  try {
    const response = await fetch(`${API_BASE_URL}/human-design/${encodeURIComponent(hdType)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der Human Design Empfehlungen:', error);
    throw error;
  }
}

// NASA Moon Image (bestehende Funktion)
export async function fetchNasaMoonImage(): Promise<string> {
  try {
    // Fallback zu einem schönen Moon-Image
    return 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=600&fit=crop';
  } catch (error) {
    console.error('Fehler beim Laden des NASA Moon Images:', error);
    // Fallback zu einem lokalen oder anderen Moon-Image
    return 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=600&fit=crop';
  }
}

// Hilfsfunktionen
export function getMoonPhaseIcon(phaseName: string): string {
  const phaseIcons: { [key: string]: string } = {
    'Neumond': '🌑',
    'Zunehmender Sichelmond': '🌒',
    'Erstes Viertel': '🌓',
    'Zunehmender Gibbous': '🌔',
    'Vollmond': '🌕',
    'Abnehmender Gibbous': '🌖',
    'Letztes Viertel': '🌗',
    'Abnehmender Sichelmond': '🌘'
  };
  
  return phaseIcons[phaseName] || '🌙';
}

export function getMoonPhaseColor(phaseName: string): string {
  const phaseColors: { [key: string]: string } = {
    'Neumond': '#1a1a2e',
    'Zunehmender Sichelmond': '#2d3748',
    'Erstes Viertel': '#4a5568',
    'Zunehmender Gibbous': '#718096',
    'Vollmond': '#f7fafc',
    'Abnehmender Gibbous': '#a0aec0',
    'Letztes Viertel': '#718096',
    'Abnehmender Sichelmond': '#2d3748'
  };
  
  return phaseColors[phaseName] || '#4a5568';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 8) return '😊';
  if (mood >= 6) return '🙂';
  if (mood >= 4) return '😐';
  if (mood >= 2) return '😔';
  return '😢';
}

export function getEnergyEmoji(energy: number): string {
  if (energy >= 8) return '⚡';
  if (energy >= 6) return '🔥';
  if (energy >= 4) return '💪';
  if (energy >= 2) return '🕯️';
  return '🕳️';
}
