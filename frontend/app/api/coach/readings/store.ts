// Gemeinsamer In-Memory Store für Coach Readings
// Wird von allen Coach-Reading-API-Routen verwendet
// TODO: Später durch Datenbank ersetzen

export let readingsStore: any[] = [];

// Helper-Funktion zum Zurücksetzen des Stores (für Tests)
export function resetStore() {
  readingsStore = [];
}

// Helper-Funktion zum Hinzufügen von Test-Daten (optional)
export function addTestData(data: any[]) {
  readingsStore.push(...data);
}

