/**
 * Memory Manager - Verwaltet Chat-Sessions und Konversationsverlauf
 */
export class MemoryManager {
  constructor() {
    // In-Memory Storage (in Produktion: Datenbank)
    this.sessions = new Map();
    this.maxMessagesPerSession = 50; // Begrenzung für Performance
  }

  /**
   * Holt oder erstellt eine Session
   * @param {string} userId - User-ID
   * @returns {object} Session-Objekt
   */
  getSession(userId) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        id: userId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metadata: {}
      });
    }

    const session = this.sessions.get(userId);
    session.lastActivity = new Date().toISOString();
    return session;
  }

  /**
   * Fügt eine Nachricht zur Session hinzu
   * @param {string} userId - User-ID
   * @param {string} role - Rolle (user, assistant, system)
   * @param {string} content - Nachrichteninhalt
   */
  addMessage(userId, role, content) {
    const session = this.getSession(userId);
    
    session.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Alte Nachrichten entfernen, wenn Limit überschritten
    if (session.messages.length > this.maxMessagesPerSession) {
      // Behalte System-Prompt und die letzten N Nachrichten
      const systemMessages = session.messages.filter(m => m.role === "system");
      const recentMessages = session.messages
        .filter(m => m.role !== "system")
        .slice(-(this.maxMessagesPerSession - systemMessages.length));
      
      session.messages = [...systemMessages, ...recentMessages];
    }
  }

  /**
   * Löscht eine Session
   * @param {string} userId - User-ID
   */
  clearSession(userId) {
    this.sessions.delete(userId);
  }

  /**
   * Löscht alle Sessions (für Testing/Reset)
   */
  clearAllSessions() {
    this.sessions.clear();
  }

  /**
   * Gibt alle Sessions zurück (für Debugging)
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  /**
   * Speichert Metadaten für eine Session
   * @param {string} userId - User-ID
   * @param {object} metadata - Metadaten
   */
  setMetadata(userId, metadata) {
    const session = this.getSession(userId);
    session.metadata = { ...session.metadata, ...metadata };
  }

  /**
   * Holt Metadaten einer Session
   * @param {string} userId - User-ID
   * @returns {object} Metadaten
   */
  getMetadata(userId) {
    const session = this.getSession(userId);
    return session.metadata || {};
  }
}

