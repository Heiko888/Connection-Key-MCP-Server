/**
 * Zentrale UserData Service-Klasse
 * 
 * Verwaltet alle Benutzerdaten in localStorage mit konsistenter Struktur
 * und Merge-Mechanismus, um Datenverlust zu vermeiden.
 */

export interface UserData {
  // Basis-Daten (Pflichtfelder)
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  
  // Profil-Daten (Optional)
  phone?: string;
  location?: string;
  postalCode?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  bio?: string;
  description?: string;
  interests?: string[];
  website?: string;
  profileImage?: string;
  datingPhotos?: string[];
  
  // Human Design Daten
  hdType?: string;
  hdProfile?: string;
  hdStrategy?: string;
  hdAuthority?: string;
  hdIncarnationCross?: string;
  
  // Subscription
  package?: 'free' | 'basic' | 'premium' | 'vip' | 'admin';
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy-Felder (für Kompatibilität)
  name?: string;
  first_name?: string;
  last_name?: string;
  subscriptionPlan?: string;
}

export interface ChartData {
  hdType?: string;
  type?: string; // Alias für Kompatibilität
  profile?: string;
  strategy?: string;
  authority?: string;
  incarnationCross?: string;
  definedCenters?: string[];
  openCenters?: string[];
  gates?: number[];
  activeGates?: number[];
  personality?: any;
  design?: any;
}

class UserDataService {
  private static readonly USER_DATA_KEY = 'userData';
  private static readonly USER_CHART_KEY = 'userChart';
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_ID_KEY = 'userId';
  
  // Legacy Keys (werden migriert)
  private static readonly LEGACY_KEYS = [
    'userEmail',
    'userPackage',
    'user-subscription',
    'profileImage',
    'datingPhotos'
  ];

  /**
   * Lädt UserData aus localStorage
   */
  static getUserData(): UserData | null {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem(this.USER_DATA_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as UserData;
    } catch (error) {
      console.error('Fehler beim Parsen von userData:', error);
      return null;
    }
  }

  /**
   * Aktualisiert UserData mit Merge-Mechanismus
   * Überschreibt nur die angegebenen Felder, behält Rest bei
   */
  static updateUserData(updates: Partial<UserData>): void {
    if (typeof window === 'undefined') return;
    
    const existing = this.getUserData() || {} as UserData;
    
    // Merge mit bestehenden Daten
    const merged: UserData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Normalisiere Felder (firstName/first_name, etc.)
    if (merged.first_name && !merged.firstName) {
      merged.firstName = merged.first_name;
    }
    if (merged.last_name && !merged.lastName) {
      merged.lastName = merged.last_name;
    }
    if (merged.firstName && !merged.first_name) {
      merged.first_name = merged.firstName;
    }
    if (merged.lastName && !merged.last_name) {
      merged.last_name = merged.lastName;
    }
    
    // Name aus firstName + lastName generieren, falls nicht vorhanden
    if (!merged.name && (merged.firstName || merged.lastName)) {
      merged.name = [merged.firstName, merged.lastName].filter(Boolean).join(' ').trim();
    }
    
    // Subscription normalisieren
    if (merged.subscriptionPlan && !merged.package) {
      merged.package = merged.subscriptionPlan as any;
    }
    
    try {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(merged));
      
      // Dispatch Custom Event, um andere Komponenten zu benachrichtigen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userDataUpdated', { 
          detail: { userData: merged }
        }));
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ UserData aktualisiert:', merged);
      }
    } catch (error) {
      console.error('Fehler beim Speichern von userData:', error);
    }
  }

  /**
   * Setzt UserData komplett (nur wenn nötig)
   */
  static setUserData(data: UserData): void {
    if (typeof window === 'undefined') return;
    
    const normalized: UserData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error('Fehler beim Setzen von userData:', error);
    }
  }

  /**
   * Spezifische Getter
   */
  static getEmail(): string | null {
    const userData = this.getUserData();
    return userData?.email || null;
  }

  static getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.USER_ID_KEY);
  }

  static setUserId(userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_ID_KEY, userId);
    
    // Auch in userData speichern
    this.updateUserData({ id: userId });
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getPackage(): 'free' | 'basic' | 'premium' | 'vip' | 'admin' | null {
    const userData = this.getUserData();
    return userData?.package || null;
  }

  static setPackage(pkg: 'free' | 'basic' | 'premium' | 'vip' | 'admin'): void {
    this.updateUserData({ package: pkg });
  }

  /**
   * Chart-Daten
   */
  static getChartData(): ChartData | null {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem(this.USER_CHART_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as ChartData;
    } catch (error) {
      console.error('Fehler beim Parsen von userChart:', error);
      return null;
    }
  }

  static setChartData(chartData: ChartData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.USER_CHART_KEY, JSON.stringify(chartData));
      
      // Automatisch in userData mergen
      this.updateUserData({
        hdType: chartData.type || chartData.hdType,
        hdProfile: chartData.profile,
        hdStrategy: chartData.strategy,
        hdAuthority: chartData.authority,
        hdIncarnationCross: chartData.incarnationCross
      });
      
      // Dispatch Custom Event, um andere Komponenten zu benachrichtigen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chartDataUpdated', { 
          detail: { chartData, userData: this.getUserData() }
        }));
        window.dispatchEvent(new CustomEvent('userDataUpdated', { 
          detail: { userData: this.getUserData() }
        }));
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Chart-Daten gespeichert und ins Profil übernommen');
      }
    } catch (error) {
      console.error('Fehler beim Speichern von userChart:', error);
    }
  }

  /**
   * Migration alter localStorage-Keys
   */
  static migrateOldData(): void {
    if (typeof window === 'undefined') return;
    
    const migrated: Partial<UserData> = {};
    let hasChanges = false;
    
    // Migriere userEmail
    const oldEmail = localStorage.getItem('userEmail');
    if (oldEmail && !this.getEmail()) {
      migrated.email = oldEmail;
      hasChanges = true;
    }
    
    // Migriere userPackage
    const oldPackage = localStorage.getItem('userPackage');
    if (oldPackage) {
      migrated.package = oldPackage as any;
      hasChanges = true;
    }
    
    // Migriere user-subscription
    const oldSubscription = localStorage.getItem('user-subscription');
    if (oldSubscription) {
      try {
        const sub = JSON.parse(oldSubscription);
        if (sub.packageId && !migrated.package) {
          migrated.package = sub.packageId;
          hasChanges = true;
        }
      } catch (e) {
        console.warn('Konnte user-subscription nicht parsen:', e);
      }
    }
    
    // Migriere profileImage
    const oldProfileImage = localStorage.getItem('profileImage');
    if (oldProfileImage) {
      migrated.profileImage = oldProfileImage;
      hasChanges = true;
    }
    
    // Migriere datingPhotos
    const oldDatingPhotos = localStorage.getItem('datingPhotos');
    if (oldDatingPhotos) {
      try {
        migrated.datingPhotos = JSON.parse(oldDatingPhotos);
        hasChanges = true;
      } catch (e) {
        console.warn('Konnte datingPhotos nicht parsen:', e);
      }
    }
    
    if (hasChanges) {
      this.updateUserData(migrated);
      
      // Lösche alte Keys (nach erfolgreicher Migration)
      this.LEGACY_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Alte localStorage-Keys migriert und gelöscht');
      }
    }
  }

  /**
   * Initialisiert Service und migriert alte Daten
   */
  static init(): void {
    if (typeof window === 'undefined') return;
    
    // Migriere alte Daten beim ersten Aufruf
    this.migrateOldData();
  }

  /**
   * Löscht alle User-Daten (für Logout)
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.USER_CHART_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    
    // Lösche auch Legacy-Keys
    this.LEGACY_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Prüft ob User-Daten vorhanden sind
   */
  static hasUserData(): boolean {
    return this.getUserData() !== null;
  }

  /**
   * Gibt vollständigen Namen zurück
   */
  static getFullName(): string {
    const userData = this.getUserData();
    if (!userData) return '';
    
    if (userData.name) return userData.name;
    if (userData.firstName || userData.lastName) {
      return [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim();
    }
    return '';
  }
}

// Automatische Initialisierung beim Import
if (typeof window !== 'undefined') {
  UserDataService.init();
}

export default UserDataService;

