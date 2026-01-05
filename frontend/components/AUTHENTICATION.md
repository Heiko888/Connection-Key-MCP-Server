# Authentifizierung - Human Design App

## Übersicht

Die Human Design App verwendet ein robustes Authentifizierungssystem mit rollenbasierter Zugriffskontrolle (RBAC) und geschützten Routen.

## Komponenten

### 1. ProtectedRoute-Komponente

Schützt Seiten vor unautorisiertem Zugriff:

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

// Basis-Schutz (Basic-Abonnement erforderlich)
<ProtectedRoute requiredRole="basic">
  <MyComponent />
</ProtectedRoute>

// Premium-Schutz
<ProtectedRoute requiredRole="premium">
  <PremiumComponent />
</ProtectedRoute>

// Admin-Schutz
<ProtectedRoute requiredRole="admin">
  <AdminComponent />
</ProtectedRoute>
```

### 2. AuthProvider

Zentrale Authentifizierungsverwaltung im Layout:

```typescript
// layout.tsx
<AuthProvider>
  {children}
</AuthProvider>
```

### 3. useAuth Hook

React-Hook für Authentifizierung:

```typescript
const {
  isAuthenticated,  // boolean
  user,            // User-Objekt oder null
  isLoading,       // boolean
  login,           // Funktion
  register,        // Funktion
  logout,          // Funktion
  checkAuth        // Funktion
} = useAuth();
```

## Rollen-Hierarchie

```typescript
const roleHierarchy = {
  'free': 0,      // Öffentliche Seiten
  'basic': 1,     // Basis-Features
  'premium': 2,   // Premium-Features
  'vip': 3,       // VIP-Features
  'admin': 4      // Admin-Features
};
```

## Geschützte Seiten

### ✅ Vollständig geschützt

- **Dashboard** (`/dashboard`) - Basic+
- **Admin** (`/admin`) - Admin
- **Knowledge** (`/knowledge`) - Basic+
- **Mobile-Dashboard** (`/mobile-dashboard`) - Basic+

### 🔓 Öffentliche Seiten

- **Startseite** (`/`) - Öffentlich
- **Login** (`/login`) - Öffentlich
- **Register** (`/register`) - Öffentlich
- **Chart** (`/chart`) - Öffentlich
- **Mondkalender** (`/mondkalender`) - Öffentlich

## Implementierung

### 1. Neue geschützte Seite erstellen

```typescript
"use client";
import ProtectedRoute from '@/components/ProtectedRoute';

function MyPageContent() {
  // Seiteninhalt hier
  return <div>Geschützter Inhalt</div>;
}

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

### 2. Bestehende Seite schützen

```typescript
// Vorher (ungeschützt)
export default function MyPage() {
  return <div>Inhalt</div>;
}

// Nachher (geschützt)
function MyPageContent() {
  return <div>Inhalt</div>;
}

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

## Sicherheitsfeatures

### 1. Automatische Weiterleitung

- Nicht authentifizierte Benutzer → `/login`
- Falsche Rolle → Upgrade-Prompt oder Zurück-Button

### 2. Token-Validierung

- Automatische Token-Überprüfung
- Refresh-Token-Support
- Automatische Abmeldung bei ungültigen Tokens

### 3. Loading-States

- Authentifizierung wird überprüft
- Benutzerfreundliche Loading-Anzeigen
- Keine Flash-of-Unprotected-Content

## Fehlerbehandlung

### 1. Auth-Fehler

```typescript
// Automatische Weiterleitung bei Auth-Fehlern
if (!isAuthenticated) {
  router.push('/login');
}
```

### 2. Rollen-Fehler

```typescript
// Benutzerfreundliche Fehlermeldung
if (!hasRequiredRole()) {
  return <UpgradePrompt requiredRole={requiredRole} />;
}
```

### 3. Netzwerk-Fehler

```typescript
// Retry-Logik für Auth-API-Aufrufe
const response = await authService.validateToken();
if (!response.success) {
  // Fallback-Verhalten
}
```

## Best Practices

### 1. Immer ProtectedRoute verwenden

```typescript
// ✅ Gut
<ProtectedRoute requiredRole="basic">
  <SensitiveContent />
</ProtectedRoute>

// ❌ Schlecht
// Direkter Zugriff ohne Schutz
<SensitiveContent />
```

### 2. Minimale erforderliche Rolle

```typescript
// ✅ Gut - Minimale Rolle
<ProtectedRoute requiredRole="basic">
  <BasicContent />
</ProtectedRoute>

// ❌ Schlecht - Zu hohe Anforderung
<ProtectedRoute requiredRole="admin">
  <BasicContent />
</ProtectedRoute>
```

### 3. Auth-Status prüfen

```typescript
// ✅ Gut
const { isAuthenticated, user } = useAuth();
if (!isAuthenticated) {
  return <LoginPrompt />;
}

// ❌ Schlecht
// Keine Auth-Prüfung
```

## Debugging

### 1. Auth-Status prüfen

```typescript
const { isAuthenticated, user, isLoading } = useAuth();
console.log('Auth Status:', { isAuthenticated, user, isLoading });
```

### 2. Token-Validierung testen

```typescript
const token = localStorage.getItem('token');
const validation = await authService.validateToken(token);
console.log('Token valid:', validation.success);
```

### 3. Rollen-Hierarchie prüfen

```typescript
const roleHierarchy = { 'free': 0, 'basic': 1, 'premium': 2, 'vip': 3, 'admin': 4 };
const hasAccess = roleHierarchy[user.subscription] >= roleHierarchy[requiredRole];
console.log('Has access:', hasAccess);
```

## Migration von altem Code

### Vorher (unsicher)

```typescript
// Keine Authentifizierung
export default function MyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Unsicher!
  }, []);
  
  if (!isAuthenticated) {
    return <div>Bitte anmelden</div>; // Keine Weiterleitung
  }
  
  return <div>Inhalt</div>;
}
```

### Nachher (sicher)

```typescript
// Mit ProtectedRoute
function MyPageContent() {
  return <div>Inhalt</div>;
}

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

## Vorteile

1. **Sicherheit**: Zentrale und konsistente Authentifizierung
2. **Benutzerfreundlichkeit**: Automatische Weiterleitungen und klare Fehlermeldungen
3. **Wartbarkeit**: Einheitliche Implementierung aller geschützten Seiten
4. **Flexibilität**: Einfache Anpassung der Rollen-Anforderungen
5. **Performance**: Optimierte Loading-States und Token-Validierung
6. **TypeScript**: Vollständige Typisierung für bessere Entwicklererfahrung
