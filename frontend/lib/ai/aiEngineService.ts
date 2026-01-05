interface UserProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  chart: Record<string, unknown>;
  readings: Record<string, unknown>[];
  reflections: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  preferences: Record<string, unknown>;
}

interface ActionContext {
  timeOfDay: number;
  dayOfWeek: number;
  moonPhase: string;
  userEnergy: number;
  currentChallenges: string[];
  recentBreakthroughs: string[];
  lifePhase: string;
}

interface CoachingContext {
  timeOfDay: number;
  dayOfWeek: number;
  moonPhase: string;
  weather?: string;
  userLocation?: string;
  recentEvents: string[];
  currentChallenges: string[];
  userGoals: string[];
}

class AIEngineService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002';
  }

  /**
   * Generiert erweiterte Readings mit Validierung
   */
  async generateAdvancedReading(
    userProfile: UserProfile,
    readingType: 'personal' | 'relationship' | 'career' | 'spiritual' | 'health' = 'personal',
    context?: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/advanced-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userProfile,
          readingType,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der erweiterten Reading-Generierung:', error);
      throw error;
    }
  }

  /**
   * Analysiert Reflektionen und erkennt Muster
   */
  async analyzeReflections(reflections: Record<string, unknown>[]) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/reflection-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          reflections
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Reflektions-Analyse:', error);
      throw error;
    }
  }

  /**
   * Generiert adaptive Handlungspläne
   */
  async generateActionPlan(
    userProfile: UserProfile,
    context: ActionContext,
    focusArea?: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/action-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userProfile,
          context,
          focusArea
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Handlungsplan-Generierung:', error);
      throw error;
    }
  }

  /**
   * Echtzeit-Coaching
   */
  async getRealTimeCoaching(
    userProfile: UserProfile,
    context: CoachingContext,
    userMessage?: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/real-time-coaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userProfile,
          context,
          userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler beim Echtzeit-Coaching:', error);
      throw error;
    }
  }

  /**
   * Predictive Analytics für Lebensphasen
   */
  async getPredictiveAnalytics(userProfile: UserProfile) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/predictive-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Predictive Analytics:', error);
      throw error;
    }
  }

  /**
   * Spezifische Handlungsempfehlungen
   */
  async getSpecificRecommendations(
    userProfile: UserProfile,
    context: ActionContext,
    situation: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/specific-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userProfile,
          context,
          situation
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Empfehlungs-Generierung:', error);
      throw error;
    }
  }

  /**
   * Proaktives Coaching
   */
  async getProactiveCoaching(
    userProfile: UserProfile,
    context: CoachingContext
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/proactive-coaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userProfile,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler beim proaktiven Coaching:', error);
      throw error;
    }
  }

  /**
   * Holt Coaching-Historie
   */
  async getCoachingHistory(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/coaching-history/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Coaching-Historie:', error);
      throw error;
    }
  }

  /**
   * Bewertet den Erfolg von Aktionen
   */
  async evaluateAction(action: Record<string, unknown>, outcome: string, userFeedback: number) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/evaluate-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          action,
          outcome,
          userFeedback
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Aktions-Bewertung:', error);
      throw error;
    }
  }

  /**
   * Analysiert Coaching-Effektivität
   */
  async getCoachingEffectiveness(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/coaching-effectiveness/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Effektivitäts-Analyse:', error);
      throw error;
    }
  }

  /**
   * Status der AI-Engine
   */
  async getEngineStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai-engine/status`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler beim Abrufen des Engine-Status:', error);
      throw error;
    }
  }

  /**
   * Hilfsfunktion: Auth-Token abrufen
   */
  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }

  /**
   * Hilfsfunktion: Aktuelle Zeit und Kontext
   */
  getCurrentContext(): ActionContext {
    const now = new Date();
    return {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      moonPhase: 'Vollmond',
      userEnergy: 7,
      currentChallenges: [],
      recentBreakthroughs: [],
      lifePhase: 'Erwachsen'
    };
  }

  /**
   * Hilfsfunktion: Coaching-Kontext
   */
  getCoachingContext(): CoachingContext {
    const now = new Date();
    return {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      moonPhase: 'Vollmond',
      recentEvents: [],
      currentChallenges: [],
      userGoals: []
    };
  }
}

const aiEngineService = new AIEngineService();
export default aiEngineService;
