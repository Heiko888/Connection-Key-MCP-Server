/**
 * E-Mail-Service für Reading-Benachrichtigungen
 * 
 * In Produktion: Verwende einen Service wie:
 * - SendGrid
 * - Resend
 * - AWS SES
 * - Postmark
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ReadingEmailData {
  email: string;
  name?: string;
  title: string;
  status: string;
  zoomLink?: string;
  zoomDate?: string;
  pdfUrl?: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    // In Produktion: Aus Umgebungsvariablen laden
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'no-reply@humandesign.app';
    this.fromName = 'Human Design Reading';
  }

  /**
   * Sendet eine E-Mail (Simulation für Entwicklung)
   */
  private async sendEmail(data: EmailData): Promise<boolean> {
    // Simulation für Entwicklung
    
    // In Produktion: Echte E-Mail-API aufrufen
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: data.to }]
        }],
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: data.subject,
        content: [{
          type: 'text/html',
          value: data.html
        }]
      })
    });

    return response.ok;
    */

    return true;
  }

  /**
   * Sendet Bestätigungs-E-Mail nach Reading-Anmeldung
   */
  async sendReadingConfirmation(data: ReadingEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #ff6b9d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Reading-Anfrage erhalten!</h1>
            </div>
            <div class="content">
              <p>Hallo${data.name ? ` ${data.name}` : ''},</p>
              
              <p>vielen Dank für deine Anfrage für ein <strong>${data.title}</strong> Reading!</p>
              
              <p>Wir haben deine Anfrage erfolgreich erhalten und unser zertifizierter Human Design Coach wird sich innerhalb von 24-48 Stunden bei dir melden, um einen Termin für dein persönliches Live-Reading via Zoom zu vereinbaren.</p>
              
              <h3>📋 Nächste Schritte:</h3>
              <ol>
                <li>Du erhältst eine E-Mail mit Terminvorschlägen</li>
                <li>Wähle einen passenden Termin aus</li>
                <li>Nimm am Live-Reading via Zoom teil (60-90 Min)</li>
                <li>Erhalte dein vollständiges Reading-PDF nach Coach-Freigabe</li>
              </ol>
              
              <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <strong>⚠️ Wichtig:</strong> Dein vollständiges Reading-PDF ist erst nach dem Live-Reading und der Coach-Freigabe verfügbar. Dies stellt sicher, dass du die bestmögliche Qualität und persönliche Betreuung erhältst.
              </p>
              
              <p>Bei Fragen kannst du uns jederzeit unter support@humandesign.app erreichen.</p>
              
              <p>Wir freuen uns auf dein Reading!</p>
              
              <p>Dein Human Design Team 💫</p>
            </div>
            <div class="footer">
              <p>© 2024 Human Design Reading | support@humandesign.app</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: '🎉 Deine Reading-Anfrage wurde erhalten!',
      html,
      text: `Hallo, vielen Dank für deine Anfrage für ein ${data.title} Reading! Wir melden uns innerhalb von 24-48 Stunden bei dir.`
    });
  }

  /**
   * Sendet E-Mail bei Zoom-Terminvereinbarung
   */
  async sendZoomScheduled(data: ReadingEmailData): Promise<boolean> {
    const zoomDate = data.zoomDate ? new Date(data.zoomDate).toLocaleString('de-DE') : 'wird noch bekannt gegeben';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .zoom-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6; }
            .button { display: inline-block; padding: 15px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Dein Zoom-Termin steht fest!</h1>
            </div>
            <div class="content">
              <p>Hallo${data.name ? ` ${data.name}` : ''},</p>
              
              <p>großartig! Dein Termin für das <strong>${data.title}</strong> Reading ist vereinbart.</p>
              
              <div class="zoom-box">
                <h3>🎥 Zoom-Meeting Details:</h3>
                <p><strong>Datum & Uhrzeit:</strong> ${zoomDate}</p>
                ${data.zoomLink ? `<p><strong>Zoom-Link:</strong><br><a href="${data.zoomLink}" class="button">Zum Zoom-Meeting</a></p>` : '<p>Der Zoom-Link wird dir rechtzeitig zugesendet.</p>'}
                <p><strong>Dauer:</strong> ca. 60-90 Minuten</p>
              </div>
              
              <h3>💡 Vorbereitung auf dein Reading:</h3>
              <ul>
                <li>Stelle sicher, dass du eine stabile Internetverbindung hast</li>
                <li>Bereite deine Fragen vor</li>
                <li>Plane genügend Zeit ein (keine Störungen)</li>
                <li>Halte Stift und Papier bereit für Notizen</li>
              </ul>
              
              <p>Wir freuen uns auf dein Reading!</p>
              
              <p>Dein Human Design Team 💫</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: '📅 Dein Zoom-Termin für dein Human Design Reading',
      html,
      text: `Dein Zoom-Termin: ${zoomDate}${data.zoomLink ? ` - Link: ${data.zoomLink}` : ''}`
    });
  }

  /**
   * Sendet E-Mail bei Freigabe des Reading-PDFs
   */
  async sendReadingApproved(data: ReadingEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Dein Reading ist fertig!</h1>
            </div>
            <div class="content">
              <p>Hallo${data.name ? ` ${data.name}` : ''},</p>
              
              <p>großartige Neuigkeiten! Dein <strong>${data.title}</strong> Reading wurde von unserem Coach freigegeben und ist jetzt zum Download verfügbar.</p>
              
              <p style="background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                <strong>✨ Dein personalisiertes Human Design Reading wartet auf dich!</strong>
              </p>
              
              ${data.pdfUrl ? `
                <a href="${data.pdfUrl}" class="button">📥 PDF jetzt herunterladen</a>
              ` : `
                <p>Logge dich in deinem Dashboard ein, um dein Reading herunterzuladen:</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/reading" class="button">Zum Dashboard</a>
              `}
              
              <h3>💡 Tipps für die Nutzung deines Readings:</h3>
              <ul>
                <li>Lies dein Reading mehrmals in Ruhe durch</li>
                <li>Experimentiere mit den Erkenntnissen im Alltag</li>
                <li>Beobachte, wie sich dein Leben verändert</li>
                <li>Teile deine Erkenntnisse mit anderen (wenn du möchtest)</li>
              </ul>
              
              <p>Bei Fragen zu deinem Reading kannst du uns jederzeit kontaktieren.</p>
              
              <p>Alles Gute auf deiner Human Design Reise! 🌟</p>
              
              <p>Dein Human Design Team 💫</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: '🎉 Dein Human Design Reading ist jetzt verfügbar!',
      html,
      text: `Dein ${data.title} Reading ist jetzt verfügbar! Logge dich ein, um es herunterzuladen.`
    });
  }

  /**
   * Sendet Coach-Benachrichtigung bei neuer Reading-Anfrage
   */
  async notifyCoachNewReading(readingData: any): Promise<boolean> {
    const coachEmail = process.env.COACH_EMAIL || 'coach@humandesign.app';

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>🔔 Neue Reading-Anfrage</h2>
          <p><strong>Titel:</strong> ${readingData.title}</p>
          <p><strong>Kunde:</strong> ${readingData.email}</p>
          <p><strong>Kategorie:</strong> ${readingData.category}</p>
          <p><strong>Geburtsdaten:</strong> ${readingData.birthdate} um ${readingData.birthtime} in ${readingData.birthplace}</p>
          <p><strong>Frage:</strong> ${readingData.question}</p>
          <p><strong>Telefon:</strong> ${readingData.phone || 'Nicht angegeben'}</p>
          <hr>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/coach/dashboard">Zum Coach-Dashboard</a></p>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: coachEmail,
      subject: `🔔 Neue Reading-Anfrage: ${readingData.title}`,
      html,
      text: `Neue Reading-Anfrage von ${readingData.email} für ${readingData.title}`
    });
  }
}

const emailService = new EmailService();
export default emailService;

