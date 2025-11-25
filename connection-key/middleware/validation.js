/**
 * Input Validation Middleware
 */

/**
 * Validiert Chat-Request
 */
export const validateChatRequest = (req, res, next) => {
  const { userId, message } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "userId ist erforderlich"
    });
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "message ist erforderlich und muss ein nicht-leerer String sein"
    });
  }

  if (message.length > 5000) {
    return res.status(400).json({
      success: false,
      error: "message ist zu lang (max. 5000 Zeichen)"
    });
  }

  next();
};

/**
 * Validiert Reading-Request
 */
export const validateReadingRequest = (req, res, next) => {
  const { birthDate, birthTime, birthPlace } = req.body;

  // Geburtsdatum validieren
  if (!birthDate) {
    return res.status(400).json({
      success: false,
      error: "birthDate ist erforderlich (Format: YYYY-MM-DD)"
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthDate)) {
    return res.status(400).json({
      success: false,
      error: "birthDate muss im Format YYYY-MM-DD sein"
    });
  }

  // Geburtszeit validieren
  if (!birthTime) {
    return res.status(400).json({
      success: false,
      error: "birthTime ist erforderlich (Format: HH:MM)"
    });
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(birthTime)) {
    return res.status(400).json({
      success: false,
      error: "birthTime muss im Format HH:MM sein"
    });
  }

  // Geburtsort validieren
  if (!birthPlace || typeof birthPlace !== "string" || birthPlace.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "birthPlace ist erforderlich"
    });
  }

  next();
};

/**
 * Validiert Matching-Request
 */
export const validateMatchingRequest = (req, res, next) => {
  const { user1Chart, user2Chart } = req.body;

  if (!user1Chart || typeof user1Chart !== "object") {
    return res.status(400).json({
      success: false,
      error: "user1Chart ist erforderlich und muss ein Objekt sein"
    });
  }

  if (!user2Chart || typeof user2Chart !== "object") {
    return res.status(400).json({
      success: false,
      error: "user2Chart ist erforderlich und muss ein Objekt sein"
    });
  }

  next();
};

