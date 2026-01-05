export interface User {
  id: string;
  name: string;
  email: string;
  tier: 'basic' | 'premium' | 'vip';
  vipPoints: number;
  joinDate: string;
  lastActive: string;
  hdType: string;
  hdProfile: string;
  hdAuthority: string;
}

export interface VIPStats {
  userId: string;
  totalConnections: number;
  totalMatches: number;
  totalReadings: number;
  totalMoonEntries: number;
  monthlyProgress: number;
  achievements: number;
  exclusiveAccess: boolean;
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  tier: 'basic' | 'premium' | 'vip';
  earned: boolean;
  earnedDate?: string;
  progress: number;
  maxProgress: number;
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  tier: 'basic' | 'premium' | 'vip';
  points?: number;
}

export interface Tier {
  id: 'basic' | 'premium' | 'vip';
  name: string;
  icon: string;
  color: string;
  price: string;
  features: string[];
  limitations: string[];
}

class VIPService {
  private baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/vip`
    : '/api/vip'; // Relative URL für gleiche Domain

  // Benutzer-Details abrufen
  async getUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden des Benutzers`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.user;
      } else {
        throw new Error(data.error || 'Benutzer nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Benutzers:', error);
      return this.getMockUser(userId);
    }
  }

  // VIP-Statistiken abrufen
  async getVIPStats(userId: string): Promise<VIPStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Statistiken`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.error || 'Statistiken nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
      return this.getMockVIPStats(userId);
    }
  }

  // Achievements abrufen
  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Achievements`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.achievements;
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Achievements');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Achievements:', error);
      return this.getMockAchievements(userId);
    }
  }

  // Aktivitäten abrufen
  async getActivities(userId: string, limit: number = 10, offset: number = 0): Promise<{ activities: Activity[], total: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/${userId}?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Aktivitäten`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return {
          activities: data.activities,
          total: data.total
        };
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Aktivitäten');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Aktivitäten:', error);
      const mockActivities = this.getMockActivities(userId);
      return {
        activities: mockActivities.slice(offset, offset + limit),
        total: mockActivities.length
      };
    }
  }

  // Benutzer-Tier aktualisieren
  async updateUserTier(userId: string, tier: 'basic' | 'premium' | 'vip'): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier })
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Aktualisieren des Tiers');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.user;
      } else {
        throw new Error(data.error || 'Fehler beim Aktualisieren des Tiers');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Tiers:', error);
      throw error;
    }
  }

  // Neue Aktivität hinzufügen
  async addActivity(activityData: {
    userId: string;
    type: string;
    title: string;
    description: string;
    tier: 'basic' | 'premium' | 'vip';
    points?: number;
  }): Promise<Activity> {
    try {
      const response = await fetch(`${this.baseUrl}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Hinzufügen der Aktivität');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.activity;
      } else {
        throw new Error(data.error || 'Fehler beim Hinzufügen der Aktivität');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Aktivität:', error);
      throw error;
    }
  }

  // Alle verfügbaren Tiers abrufen
  async getTiers(): Promise<Tier[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Tiers`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.tiers;
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Tiers');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Tiers:', error);
      return this.getMockTiers();
    }
  }

  // Hilfsfunktionen
  getTierColor(tier: string): string {
    const colors: { [key: string]: string } = {
      'basic': '#6b7280',
      'premium': '#8b5cf6',
      'vip': '#f59e0b'
    };
    return colors[tier] || '#6b7280';
  }

  getTierIcon(tier: string): string {
    const icons: { [key: string]: string } = {
      'basic': 'Star',
      'premium': 'Diamond',
      'vip': 'Crown'
    };
    return icons[tier] || 'Star';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateProgress(progress: number, maxProgress: number): number {
    return Math.round((progress / maxProgress) * 100);
  }

  // Mock-Daten als Fallback
  private getMockUser(userId: string): User {
    return {
      id: userId,
      name: 'Max',
      email: 'max@example.com',
      tier: 'vip',
      vipPoints: 2847,
      joinDate: '2024-01-15T00:00:00Z',
      lastActive: new Date().toISOString(),
      hdType: 'Generator',
      hdProfile: '2/4',
      hdAuthority: 'Sakral'
    };
  }

  private getMockVIPStats(userId: string): VIPStats {
    return {
      userId,
      totalConnections: 47,
      totalMatches: 23,
      totalReadings: 156,
      totalMoonEntries: 89,
      monthlyProgress: 87,
      achievements: 12,
      exclusiveAccess: true,
      lastUpdated: new Date().toISOString()
    };
  }

  private getMockAchievements(userId: string): Achievement[] {
    return [
      {
        id: '1',
        userId,
        name: 'Chart-Meister',
        description: 'Vollständige Chart-Analyse abgeschlossen',
        icon: 'BarChart3',
        tier: 'basic',
        earned: true,
        earnedDate: '2024-11-15T00:00:00Z',
        progress: 100,
        maxProgress: 100
      },
      {
        id: '2',
        userId,
        name: 'Mond-Experte',
        description: '30 Tage Mondkalender-Tracking',
        icon: 'Moon',
        tier: 'basic',
        earned: true,
        earnedDate: '2024-12-01T00:00:00Z',
        progress: 100,
        maxProgress: 100
      },
      {
        id: '3',
        userId,
        name: 'Community-Star',
        description: '50 Community-Beiträge',
        icon: 'Users',
        tier: 'premium',
        earned: true,
        earnedDate: '2024-11-20T00:00:00Z',
        progress: 100,
        maxProgress: 100
      },
      {
        id: '4',
        userId,
        name: 'VIP-Pionier',
        description: 'Erste VIP-Features genutzt',
        icon: 'Crown',
        tier: 'vip',
        earned: true,
        earnedDate: '2024-10-01T00:00:00Z',
        progress: 100,
        maxProgress: 100
      },
      {
        id: '5',
        userId,
        name: 'Coaching-Profi',
        description: '10 Coaching-Sessions',
        icon: 'MessageCircle',
        tier: 'vip',
        earned: false,
        progress: 5,
        maxProgress: 10
      },
      {
        id: '6',
        userId,
        name: 'Analytics-Guru',
        description: '100 Chart-Analysen',
        icon: 'TrendingUp',
        tier: 'premium',
        earned: false,
        progress: 67,
        maxProgress: 100
      }
    ];
  }

  private getMockActivities(userId: string): Activity[] {
    return [
      {
        id: '1',
        userId,
        type: 'vip_exclusive',
        title: 'VIP-Exklusiv Event',
        description: 'Teilnahme am exklusiven Human Design Workshop',
        timestamp: '2024-12-10T14:30:00Z',
        icon: 'Crown',
        tier: 'vip',
        points: 50
      },
      {
        id: '2',
        userId,
        type: 'coaching_session',
        title: '1:1 Coaching Session',
        description: 'Persönliche Beratung mit Elisabeth Taeubel',
        timestamp: '2024-12-09T10:00:00Z',
        icon: 'Users',
        tier: 'vip',
        points: 25
      },
      {
        id: '3',
        userId,
        type: 'advanced_analysis',
        title: 'Erweiterte Chart-Analyse',
        description: 'Tiefe Analyse deines Human Design Charts',
        timestamp: '2024-12-08T16:45:00Z',
        icon: 'BarChart3',
        tier: 'premium',
        points: 15
      },
      {
        id: '4',
        userId,
        type: 'moon_tracking',
        title: 'Mondkalender-Eintrag',
        description: 'Neuer Eintrag im VIP-Mondkalender',
        timestamp: '2024-12-07T20:15:00Z',
        icon: 'Moon',
        tier: 'basic',
        points: 5
      }
    ];
  }

  private getMockTiers(): Tier[] {
    return [
      {
        id: 'basic',
        name: 'Basic',
        icon: 'Star',
        color: '#6b7280',
        price: 'Kostenlos',
        features: [
          'Grundlegende Chart-Berechnung',
          'Mondkalender (7 Tage)',
          'Community-Zugang',
          'Basis-Matching'
        ],
        limitations: [
          'Begrenzte Chart-Details',
          'Keine erweiterten Analytics',
          'Keine VIP-Features'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        icon: 'Diamond',
        color: '#8b5cf6',
        price: '19,99€/Monat',
        features: [
          'Alle Basic-Features',
          'Erweiterte Chart-Analyse',
          'Vollständiger Mondkalender',
          'Erweiterte Matching-Algorithmen',
          'Coaching-Zugang',
          'Prioritäts-Support'
        ],
        limitations: [
          'Keine VIP-Exklusiv-Features',
          'Begrenzte API-Zugriffe'
        ]
      },
      {
        id: 'vip',
        name: 'VIP',
        icon: 'Crown',
        color: '#f59e0b',
        price: '49,99€/Monat',
        features: [
          'Alle Premium-Features',
          'Exklusive VIP-Community',
          'Persönlicher Coach',
          'Unbegrenzte API-Zugriffe',
          'Früher Zugang zu neuen Features',
          'Premium-Analytics',
          'Exklusive Events',
          '1:1 Beratung'
        ],
        limitations: []
      }
    ];
  }
}

// Singleton-Instanz
export const vipService = new VIPService();
export default vipService;
