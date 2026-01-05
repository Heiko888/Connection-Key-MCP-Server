export interface Coach {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  experience: string;
  specializations: string[];
  description: string;
  sessions: Array<{ type: string; price: string; duration: string }>;
  availability: string[];
  languages: string[];
  profileUrl: string;
  isOnline: boolean;
  lastSeen?: string;
  hourlyRate: number;
  timezone: string;
}

export interface Booking {
  id: string;
  coachId: string;
  userId: string;
  sessionType: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  meetingLink?: string;
  coach?: {
    name: string;
    avatar: string;
    title: string;
  };
}

export interface Availability {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

class CoachingService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/coaching`
    : '/api/coaching'; // Relative URL für gleiche Domain

  // Coaches abrufen
  async getCoaches(): Promise<Coach[]> {
    try {
      const response = await fetch(`${this.baseUrl}/coaches`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Coaches`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.coaches;
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Coaches');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Coaches:', error);
      return this.getMockCoaches();
    }
  }

  // Einzelnen Coach abrufen
  async getCoach(coachId: string): Promise<Coach> {
    try {
      const response = await fetch(`${this.baseUrl}/coaches/${coachId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden des Coaches`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.coach;
      } else {
        throw new Error(data.error || 'Coach nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Coaches:', error);
      const coaches = this.getMockCoaches();
      return coaches.find(c => c.id === coachId) || coaches[0];
    }
  }

  // Verfügbarkeit eines Coaches abrufen
  async getAvailability(coachId: string): Promise<Availability[]> {
    try {
      const response = await fetch(`${this.baseUrl}/availability/${coachId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Verfügbarkeit`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.availability;
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Verfügbarkeit');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Verfügbarkeit:', error);
      return this.getMockAvailability(coachId);
    }
  }

  // Verfügbare Zeitslots für einen bestimmten Tag abrufen
  async getAvailableSlots(coachId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/available-slots/${coachId}/${date}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der verfügbaren Slots`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.slots;
      } else {
        throw new Error(data.error || 'Fehler beim Laden der verfügbaren Slots');
      }
    } catch (error) {
      console.error('Fehler beim Laden der verfügbaren Slots:', error);
      return this.getMockTimeSlots();
    }
  }

  // Buchung erstellen
  async createBooking(bookingData: {
    coachId: string;
    userId: string;
    sessionType: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
  }): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Erstellen der Buchung');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.booking;
      } else {
        throw new Error(data.error || 'Fehler beim Erstellen der Buchung');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Buchung:', error);
      throw error;
    }
  }

  // Buchungen eines Benutzers abrufen
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Laden der Buchungen`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.bookings;
      } else {
        throw new Error(data.error || 'Fehler beim Laden der Buchungen');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Buchungen:', error);
      return this.getMockBookings(userId);
    }
  }

  // Buchung aktualisieren
  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Aktualisieren der Buchung');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.booking;
      } else {
        throw new Error(data.error || 'Fehler beim Aktualisieren der Buchung');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Buchung:', error);
      throw error;
    }
  }

  // Buchung stornieren
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Stornieren der Buchung');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Stornieren der Buchung');
      }
    } catch (error) {
      console.error('Fehler beim Stornieren der Buchung:', error);
      throw error;
    }
  }

  // Hilfsfunktionen
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    return time.slice(0, 5);
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayOfWeek];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'confirmed': return 'Bestätigt';
      case 'cancelled': return 'Storniert';
      case 'completed': return 'Abgeschlossen';
      default: return 'Unbekannt';
    }
  }

  // Mock-Daten als Fallback
  private getMockCoaches(): Coach[] {
    return [
      // Britta Coach entfernt - nicht mehr verfügbar
    ];
  }

  private getMockAvailability(coachId: string): Availability[] {
    return [
      {
        id: '1',
        coachId,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        maxBookings: 8,
        currentBookings: 3
      }
    ];
  }

  private getMockTimeSlots(): TimeSlot[] {
    return [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: false }
    ];
  }

  private getMockBookings(userId: string): Booking[] {
    return [
      {
        id: '1',
        coachId: '1',
        userId,
        sessionType: '1:1 Coaching',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        price: 120,
        status: 'confirmed',
        notes: 'Erste Coaching-Session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'paid',
        coach: {
          name: 'Elisabeth Taeubel',
          avatar: '/images/elisabeth.jpg',
          title: 'Spiritual Coach'
        }
      }
    ];
  }
}

// Singleton-Instanz
export const coachingService = new CoachingService();
export default coachingService;
