export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  readTime: string;
  difficulty: 'Anfänger' | 'Mittel' | 'Fortgeschritten';
}

export interface KnowledgeResponse {
  success: boolean;
  data: KnowledgeEntry[];
  count: number;
}

export interface KnowledgeSingleResponse {
  success: boolean;
  data: KnowledgeEntry;
}

export interface KnowledgeSearchResponse {
  success: boolean;
  data: KnowledgeEntry[];
  count: number;
  query: string;
}

export interface KnowledgeCategoriesResponse {
  success: boolean;
  data: string[];
}

export class KnowledgeService {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/knowledge`
    : '/api/knowledge'; // Relative URL für gleiche Domain

  // Alle Knowledge-Entries abrufen
  static async getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Abrufen der Knowledge-Entries`);
      }
      
      const result: KnowledgeResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Fehler beim Abrufen der Knowledge-Entries');
      }
      
      return result.data;
    } catch (error) {
      console.error('Backend nicht verfügbar, verwende Demo-Daten:', error);
      // Fallback zu Demo-Daten
      return this.getDemoKnowledgeEntries();
    }
  }

  // Einzelnen Knowledge-Entry abrufen
  static async getKnowledgeEntry(id: string): Promise<KnowledgeEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: Fehler beim Abrufen des Knowledge-Entries`);
      }
      
      const result: KnowledgeSingleResponse = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data;
    } catch (error) {
      console.error('Fehler beim Abrufen des Knowledge-Entries:', error);
      return null;
    }
  }

  // Neuen Knowledge-Entry erstellen
  static async createKnowledgeEntry(entry: Partial<KnowledgeEntry>): Promise<KnowledgeEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        const { safeResponseText, safeTextParse } = await import('@/lib/utils/safeJson');
        const errorText = await safeResponseText(response, 'Unknown error');
        const errorData = safeTextParse<{ error?: string; message?: string }>(errorText, null);
        const errorMessage = (errorData && !('error' in errorData) && (errorData.error || errorData.message)) 
          || `HTTP ${response.status}: ${errorText || 'Fehler beim Erstellen des Knowledge-Entries'}`;
        throw new Error(errorMessage);
      }
      
      const result: KnowledgeSingleResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Fehler beim Erstellen des Knowledge-Entries');
      }
      
      return result.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Knowledge-Entries:', error);
      return null;
    }
  }

  // Knowledge-Entry aktualisieren
  static async updateKnowledgeEntry(id: string, entry: Partial<KnowledgeEntry>): Promise<KnowledgeEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        const { safeResponseText, safeTextParse } = await import('@/lib/utils/safeJson');
        const errorText = await safeResponseText(response, 'Unknown error');
        const errorData = safeTextParse<{ error?: string; message?: string }>(errorText, null);
        const errorMessage = (errorData && !('error' in errorData) && (errorData.error || errorData.message)) 
          || `HTTP ${response.status}: ${errorText || 'Fehler beim Aktualisieren des Knowledge-Entries'}`;
        throw new Error(errorMessage);
      }
      
      const result: KnowledgeSingleResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Fehler beim Aktualisieren des Knowledge-Entries');
      }
      
      return result.data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Knowledge-Entries:', error);
      return null;
    }
  }

  // Favoriten-Status umschalten
  static async toggleFavorite(id: string): Promise<KnowledgeEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/favorite`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Umschalten des Favoriten-Status`);
      }
      
      const result: KnowledgeSingleResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Fehler beim Umschalten des Favoriten-Status');
      }
      
      return result.data;
    } catch (error) {
      console.error('Backend nicht verfügbar, simuliere Favoriten-Update:', error);
      // Fallback: Simuliere Favoriten-Update mit Demo-Daten
      const demoEntries = this.getDemoKnowledgeEntries();
      const entry = demoEntries.find(e => e.id === id);
      if (entry) {
        return { ...entry, isFavorite: !entry.isFavorite };
      }
      return null;
    }
  }

  // Knowledge-Entry löschen
  static async deleteKnowledgeEntry(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Löschen des Knowledge-Entries`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Fehler beim Löschen des Knowledge-Entries:', error);
      return false;
    }
  }

  // Kategorien abrufen
  static async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/meta/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler beim Abrufen der Kategorien`);
      }
      
      const result: KnowledgeCategoriesResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Fehler beim Abrufen der Kategorien');
      }
      
      return result.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error);
      return ['Grundlagen', 'Typen', 'Mondkalender', 'Chakren', 'Profile', 'Autorität', 'Planeten'];
    }
  }

  // Suche in Knowledge-Entries
  static async searchKnowledgeEntries(query: string): Promise<KnowledgeEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Fehler bei der Suche`);
      }
      
      const result: KnowledgeSearchResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Fehler bei der Suche');
      }
      
      return result.data;
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
      // Fallback: Lokale Suche in Demo-Daten
      const demoEntries = this.getDemoKnowledgeEntries();
      return demoEntries.filter(entry => 
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        entry.category.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Demo-Daten als Fallback
  private static getDemoKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'demo-1',
        title: 'Grundlagen des Human Design',
        content: 'Human Design ist ein System, das Astrologie, I-Ching, Kabbalah und Chakren kombiniert, um deine einzigartige energetische Blaupause zu enthüllen.',
        category: 'Grundlagen',
        tags: ['Human Design', 'Energetik', 'Persönlichkeit'],
        isFavorite: true,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
        author: 'System',
        readTime: '5 Min',
        difficulty: 'Anfänger'
      },
      {
        id: 'demo-2',
        title: 'Die vier Human Design Typen',
        content: 'Es gibt vier Haupttypen: Manifestoren, Generatoren, Projektoren und Reflektoren. Jeder Typ hat eine spezifische Strategie und Autorität.',
        category: 'Typen',
        tags: ['Typen', 'Strategie', 'Autorität'],
        isFavorite: false,
        createdAt: '2024-01-20T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Anfänger'
      },
      {
        id: 'demo-3',
        title: 'Mondphasen und Energie',
        content: 'Die verschiedenen Mondphasen beeinflussen unsere Energie und unser Wohlbefinden. Lerne, wie du mit den Mondzyklen im Einklang leben kannst.',
        category: 'Mondkalender',
        tags: ['Mond', 'Energie', 'Zyklus'],
        isFavorite: true,
        createdAt: '2024-01-25T00:00:00.000Z',
        updatedAt: '2024-01-25T00:00:00.000Z',
        author: 'System',
        readTime: '6 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-4',
        title: 'Chakren und Human Design',
        content: 'Die neun Zentren im Human Design entsprechen den traditionellen Chakren und zeigen, wo du definiert oder offen bist.',
        category: 'Chakren',
        tags: ['Chakren', 'Zentren', 'Energie'],
        isFavorite: false,
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z',
        author: 'System',
        readTime: '7 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-5',
        title: 'Planeten im Human Design',
        content: 'Die Planeten im Human Design repräsentieren verschiedene Aspekte deiner Persönlichkeit und Energie. Jeder Planet hat eine spezifische Bedeutung und beeinflusst, wie sich deine Human Design Eigenschaften manifestieren.',
        category: 'Planeten',
        tags: ['Planeten', 'Astrologie', 'Energie', 'Persönlichkeit'],
        isFavorite: false,
        createdAt: '2024-02-10T00:00:00.000Z',
        updatedAt: '2024-02-10T00:00:00.000Z',
        author: 'System',
        readTime: '10 Min',
        difficulty: 'Fortgeschritten'
      },
      {
        id: 'demo-planet-sun',
        title: 'Die Sonne im Human Design',
        content: 'Die Sonne repräsentiert dein wahres Selbst, deine Essenz und dein Bewusstsein. Sie zeigt, wer du wirklich bist und was dich antreibt. Die Sonne macht etwa 70% deiner Grundenergie aus und ist der zentrale Punkt deiner Persönlichkeit. Wenn du authentisch bist, strahlst du Lebensfreude aus.',
        category: 'Planeten',
        tags: ['Sonne', 'Planeten', 'Bewusstsein', 'Identität', 'Persönlichkeit'],
        isFavorite: false,
        createdAt: '2024-02-11T00:00:00.000Z',
        updatedAt: '2024-02-11T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-earth',
        title: 'Die Erde im Human Design',
        content: 'Die Erde repräsentiert Stabilität und Balance in deinem Human Design. Sie zeigt, was dich erdet und wie du dein Gleichgewicht hältst. Die Erde ist das Gegenstück zur Sonne und hilft dir, Stabilität durch deine Verbindung zur Erde zu finden.',
        category: 'Planeten',
        tags: ['Erde', 'Planeten', 'Stabilität', 'Balance', 'Gleichgewicht'],
        isFavorite: false,
        createdAt: '2024-02-12T00:00:00.000Z',
        updatedAt: '2024-02-12T00:00:00.000Z',
        author: 'System',
        readTime: '7 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-moon',
        title: 'Der Mond im Human Design',
        content: 'Der Mond repräsentiert deine Emotionen, Instinkte und dein Unterbewusstsein. Er zeigt, wie du dich fühlst und reagierst. Der Mond ist deine Motivation und dein Antrieb - er zeigt, was dich innerlich bewegt. Deine Emotionen führen dich zu deiner Bestimmung.',
        category: 'Planeten',
        tags: ['Mond', 'Planeten', 'Emotionen', 'Unterbewusstsein', 'Motivation'],
        isFavorite: false,
        createdAt: '2024-02-13T00:00:00.000Z',
        updatedAt: '2024-02-13T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-mercury',
        title: 'Merkur im Human Design',
        content: 'Merkur repräsentiert Kommunikation und Ausdruck in deinem Human Design. Er zeigt, wofür du sprichst und welche Wahrheit du teilst. Merkur beeinflusst, wie du kommunizierst und Informationen verarbeitest. Deine Worte tragen die Kraft der Wahrheit.',
        category: 'Planeten',
        tags: ['Merkur', 'Planeten', 'Kommunikation', 'Ausdruck', 'Wahrheit'],
        isFavorite: false,
        createdAt: '2024-02-14T00:00:00.000Z',
        updatedAt: '2024-02-14T00:00:00.000Z',
        author: 'System',
        readTime: '7 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-venus',
        title: 'Venus im Human Design',
        content: 'Venus repräsentiert Werte und Beziehungen in deinem Human Design. Sie zeigt, was du liebst, was dir Schönheit und Harmonie bedeutet. Venus beeinflusst, wie du Beziehungen gestaltest und was dir wichtig ist. Du ziehst an, was deine Seele nährt.',
        category: 'Planeten',
        tags: ['Venus', 'Planeten', 'Werte', 'Beziehungen', 'Liebe', 'Harmonie'],
        isFavorite: false,
        createdAt: '2024-02-15T00:00:00.000Z',
        updatedAt: '2024-02-15T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-mars',
        title: 'Mars im Human Design',
        content: 'Mars repräsentiert Handlung und Reife in deinem Human Design. Er zeigt, wo du impulsiv bist und durch Erfahrung reifst. Mars beeinflusst, wie du handelst und deine Energie einsetzt. Deine Handlungen formen deine Reife.',
        category: 'Planeten',
        tags: ['Mars', 'Planeten', 'Handlung', 'Reife', 'Energie', 'Aktion'],
        isFavorite: false,
        createdAt: '2024-02-16T00:00:00.000Z',
        updatedAt: '2024-02-16T00:00:00.000Z',
        author: 'System',
        readTime: '7 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-jupiter',
        title: 'Jupiter im Human Design',
        content: 'Jupiter repräsentiert Weisheit und Expansion in deinem Human Design. Er ist dein innerer Lehrer und zeigt, wo du wachsen und Fülle erfahren kannst. Jupiter beeinflusst deine Fähigkeit zu lernen und zu expandieren. Du wächst durch deine Weisheit und Erfahrung.',
        category: 'Planeten',
        tags: ['Jupiter', 'Planeten', 'Weisheit', 'Expansion', 'Wachstum', 'Fülle'],
        isFavorite: false,
        createdAt: '2024-02-17T00:00:00.000Z',
        updatedAt: '2024-02-17T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-saturn',
        title: 'Saturn im Human Design',
        content: 'Saturn repräsentiert Lektionen und Verantwortung in deinem Human Design. Er ist der Lehrer des Lebens und zeigt, wo du Disziplin und Reife lernen musst. Saturn beeinflusst, wo du Struktur brauchst und Verantwortung übernimmst. Deine Herausforderungen formen deine Stärke.',
        category: 'Planeten',
        tags: ['Saturn', 'Planeten', 'Lektionen', 'Verantwortung', 'Disziplin', 'Struktur'],
        isFavorite: false,
        createdAt: '2024-02-18T00:00:00.000Z',
        updatedAt: '2024-02-18T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-uranus',
        title: 'Uranus im Human Design',
        content: 'Uranus repräsentiert Einzigartigkeit und Revolution in deinem Human Design. Er zeigt, wo du anders bist, rebellierst und Freiheit suchst. Uranus beeinflusst deine Fähigkeit zu innovieren und Veränderung zu bringen. Du bringst Veränderung durch deine Einzigartigkeit.',
        category: 'Planeten',
        tags: ['Uranus', 'Planeten', 'Einzigartigkeit', 'Revolution', 'Innovation', 'Freiheit'],
        isFavorite: false,
        createdAt: '2024-02-19T00:00:00.000Z',
        updatedAt: '2024-02-19T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Mittel'
      },
      {
        id: 'demo-planet-neptune',
        title: 'Neptun im Human Design',
        content: 'Neptun repräsentiert Spiritualität und Illusion in deinem Human Design. Er zeigt, wo du träumst, idealisierst oder transzendierst. Neptun beeinflusst deine Intuition und deine Verbindung zum Spirituellen. Deine Träume führen dich zur Transzendenz.',
        category: 'Planeten',
        tags: ['Neptun', 'Planeten', 'Spiritualität', 'Illusion', 'Intuition', 'Transzendenz'],
        isFavorite: false,
        createdAt: '2024-02-20T00:00:00.000Z',
        updatedAt: '2024-02-20T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Fortgeschritten'
      },
      {
        id: 'demo-planet-pluto',
        title: 'Pluto im Human Design',
        content: 'Pluto repräsentiert Transformation und Macht in deinem Human Design. Er zeigt, wo du stirbst und wiedergeboren wirst - tiefe Wandlungskraft. Pluto beeinflusst deine Fähigkeit zur Transformation und Regeneration. Du transformierst durch deine tiefste Kraft.',
        category: 'Planeten',
        tags: ['Pluto', 'Planeten', 'Transformation', 'Macht', 'Wandlung', 'Regeneration'],
        isFavorite: false,
        createdAt: '2024-02-21T00:00:00.000Z',
        updatedAt: '2024-02-21T00:00:00.000Z',
        author: 'System',
        readTime: '9 Min',
        difficulty: 'Fortgeschritten'
      },
      {
        id: 'demo-planet-northnode',
        title: 'Der Nordknoten im Human Design',
        content: 'Der Nordknoten repräsentiert deine Entwicklungsrichtung im Human Design. Er zeigt, wo deine Lebensreise hingeht - Wachstum, Zukunft und Bestimmung. Der Nordknoten beeinflusst, wohin du dich entwickelst und was deine Bestimmung ist. Du wächst in Richtung deiner Bestimmung.',
        category: 'Planeten',
        tags: ['Nordknoten', 'Planeten', 'Entwicklung', 'Bestimmung', 'Zukunft', 'Wachstum'],
        isFavorite: false,
        createdAt: '2024-02-22T00:00:00.000Z',
        updatedAt: '2024-02-22T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Fortgeschritten'
      },
      {
        id: 'demo-planet-southnode',
        title: 'Der Südknoten im Human Design',
        content: 'Der Südknoten repräsentiert deine Herkunft und Gewohnheiten im Human Design. Er zeigt, wo du herkommst, alte Muster und vertraute Energien. Der Südknoten beeinflusst deine Vergangenheit und die Muster, die du mitbringst. Deine Vergangenheit gibt dir Stabilität.',
        category: 'Planeten',
        tags: ['Südknoten', 'Planeten', 'Herkunft', 'Gewohnheiten', 'Vergangenheit', 'Muster'],
        isFavorite: false,
        createdAt: '2024-02-23T00:00:00.000Z',
        updatedAt: '2024-02-23T00:00:00.000Z',
        author: 'System',
        readTime: '8 Min',
        difficulty: 'Fortgeschritten'
      }
    ];
  }
}
