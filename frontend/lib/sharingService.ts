// Sharing-Service für Human Design Chart

export interface ShareOptions {
  includeProfile: boolean;
  includeTransits: boolean;
  include3D: boolean;
  includeAudio: boolean;
  format: 'image' | 'pdf' | 'link' | 'qr';
  quality: 'low' | 'medium' | 'high';
  watermark: boolean;
  socialMedia: {
    facebook: boolean;
    twitter: boolean;
    instagram: boolean;
    linkedin: boolean;
    whatsapp: boolean;
  };
}

export interface ShareData {
  chartId: string;
  title: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  qrCodeUrl?: string;
  shareUrl: string;
  timestamp: string;
  metadata: {
    hdType: string;
    profile: string;
    authority: string;
    strategy: string;
    definedCenters: number;
    activeChannels: number;
    activeGates: number;
  };
}

class SharingService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'mock://localhost:3005'; // Frontend-only
    this.apiKey = process.env.NEXT_PUBLIC_SHARING_API_KEY || '';
  }

  // Chart als Bild generieren
  async generateChartImage(chartElement: HTMLElement, options: Partial<ShareOptions> = {}): Promise<string> {
    try {
      // HTML2Canvas für Bild-Generierung
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: null,
        scale: options.quality === 'high' ? 2 : options.quality === 'medium' ? 1.5 : 1,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('Fehler beim Generieren des Chart-Bildes:', error);
      throw new Error('Chart-Bild konnte nicht generiert werden');
    }
  }

  // QR-Code generieren
  async generateQRCode(data: string, size: number = 200): Promise<string> {
    try {
      const QRCode = (await import('qrcode')).default;
      
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Fehler beim Generieren des QR-Codes:', error);
      throw new Error('QR-Code konnte nicht generiert werden');
    }
  }

  // Chart-Daten für Sharing vorbereiten
  prepareShareData(chartData: any, options: ShareOptions): ShareData {
    const shareId = this.generateShareId();
    const shareUrl = `${this.baseUrl}/share/${shareId}`;
    
    return {
      chartId: shareId,
      title: `Mein Human Design Chart - ${chartData.hdType} ${chartData.profile}`,
      description: `Entdecke mein Human Design Chart: ${chartData.hdType} mit Profil ${chartData.profile}, Autorität ${chartData.authority} und Strategie ${chartData.strategy}.`,
      shareUrl,
      timestamp: new Date().toISOString(),
      metadata: {
        hdType: chartData.hdType,
        profile: chartData.profile,
        authority: chartData.authority,
        strategy: chartData.strategy,
        definedCenters: chartData.definedCenters?.length || 0,
        activeChannels: chartData.activeChannels?.length || 0,
        activeGates: chartData.activeGates?.length || 0
      }
    };
  }

  // Chart teilen
  async shareChart(chartData: any, options: ShareOptions): Promise<ShareData> {
    const shareData = this.prepareShareData(chartData, options);
    
    try {
      // Chart-Bild generieren
      if (options.format === 'image' || options.socialMedia.facebook || options.socialMedia.instagram) {
        const chartElement = document.getElementById('human-design-chart');
        if (chartElement) {
          shareData.imageUrl = await this.generateChartImage(chartElement, options);
        }
      }

      // QR-Code generieren
      if (options.format === 'qr') {
        shareData.qrCodeUrl = await this.generateQRCode(shareData.shareUrl, 300);
      }

      // PDF generieren
      if (options.format === 'pdf') {
        shareData.pdfUrl = await this.generatePDF(shareData, options);
      }

      // Daten auf Server speichern
      await this.saveShareData(shareData);

      return shareData;
    } catch (error) {
      console.error('Fehler beim Teilen des Charts:', error);
      throw new Error('Chart konnte nicht geteilt werden');
    }
  }

  // PDF generieren
  async generatePDF(shareData: ShareData, options: ShareOptions): Promise<string> {
    try {
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Titel
      pdf.setFontSize(20);
      pdf.text(shareData.title, 20, 30);
      
      // Beschreibung
      pdf.setFontSize(12);
      const descriptionLines = pdf.splitTextToSize(shareData.description, 170);
      pdf.text(descriptionLines, 20, 50);
      
      // Metadaten
      pdf.setFontSize(14);
      pdf.text('Chart-Informationen:', 20, 80);
      
      pdf.setFontSize(10);
      pdf.text(`Typ: ${shareData.metadata.hdType}`, 20, 95);
      pdf.text(`Profil: ${shareData.metadata.profile}`, 20, 105);
      pdf.text(`Autorität: ${shareData.metadata.authority}`, 20, 115);
      pdf.text(`Strategie: ${shareData.metadata.strategy}`, 20, 125);
      pdf.text(`Definierte Zentren: ${shareData.metadata.definedCenters}`, 20, 135);
      pdf.text(`Aktive Kanäle: ${shareData.metadata.activeChannels}`, 20, 145);
      pdf.text(`Aktive Tore: ${shareData.metadata.activeGates}`, 20, 155);
      
      // Chart-Bild einfügen
      if (shareData.imageUrl) {
        const img = new Image();
        img.src = shareData.imageUrl;
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 150;
            const imgHeight = (img.height * imgWidth) / img.width;
            pdf.addImage(img, 'PNG', 20, 170, imgWidth, imgHeight);
            resolve(void 0);
          };
        });
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.text(`Generiert am: ${new Date(shareData.timestamp).toLocaleDateString('de-DE')}`, 20, 280);
      pdf.text(`Share-URL: ${shareData.shareUrl}`, 20, 285);
      
      return pdf.output('datauristring');
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error);
      throw new Error('PDF konnte nicht generiert werden');
    }
  }

  // Share-Daten auf Server speichern
  async saveShareData(shareData: ShareData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(shareData)
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Share-Daten');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      // Fallback: Daten im localStorage speichern (nur im Browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`share-${shareData.chartId}`, JSON.stringify(shareData));
      }
    }
  }

  // Share-Daten abrufen
  async getShareData(shareId: string): Promise<ShareData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/shares/${shareId}`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Share-Daten:', error);
    }

    // Fallback: Daten aus localStorage abrufen (nur im Browser)
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(`share-${shareId}`);
      return localData ? JSON.parse(localData) : null;
    }
    return null;
  }

  // Social Media Sharing
  async shareToSocialMedia(shareData: ShareData, platform: string): Promise<void> {
    const encodedUrl = encodeURIComponent(shareData.shareUrl);
    const encodedTitle = encodeURIComponent(shareData.title);
    const encodedDescription = encodeURIComponent(shareData.description);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      default:
        throw new Error(`Unbekannte Plattform: ${platform}`);
    }

    // Neues Fenster öffnen
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  // Link kopieren
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  // Download-Funktionen
  async downloadImage(imageUrl: string, filename: string): Promise<void> {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async downloadPDF(pdfUrl: string, filename: string): Promise<void> {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // E-Mail teilen
  generateEmailShare(shareData: ShareData): string {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(
      `${shareData.description}\n\n` +
      `Mein Human Design Chart:\n` +
      `Typ: ${shareData.metadata.hdType}\n` +
      `Profil: ${shareData.metadata.profile}\n` +
      `Autorität: ${shareData.metadata.authority}\n` +
      `Strategie: ${shareData.metadata.strategy}\n\n` +
      `Link: ${shareData.shareUrl}`
    );

    return `mailto:?subject=${subject}&body=${body}`;
  }

  // Share-ID generieren
  private generateShareId(): string {
    return 'hd-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  // Share-Statistiken
  async getShareStats(shareId: string): Promise<{
    views: number;
    shares: number;
    downloads: number;
    lastAccessed: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/shares/${shareId}/stats`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Statistiken:', error);
    }

    return {
      views: 0,
      shares: 0,
      downloads: 0,
      lastAccessed: new Date().toISOString()
    };
  }
}

// Singleton-Instanz
export const sharingService = new SharingService();

// React Hook für Sharing
export const useSharing = () => {
  const [isSharing, setIsSharing] = React.useState(false);
  const [shareData, setShareData] = React.useState<ShareData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const shareChart = async (chartData: any, options: ShareOptions) => {
    setIsSharing(true);
    setError(null);

    try {
      const result = await sharingService.shareChart(chartData, options);
      setShareData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      throw err;
    } finally {
      setIsSharing(false);
    }
  };

  const shareToSocial = async (platform: string) => {
    if (shareData) {
      await sharingService.shareToSocialMedia(shareData, platform);
    }
  };

  const copyLink = async () => {
    if (shareData) {
      await sharingService.copyToClipboard(shareData.shareUrl);
    }
  };

  const downloadImage = async () => {
    if (shareData?.imageUrl) {
      await sharingService.downloadImage(shareData.imageUrl, `hd-chart-${shareData.chartId}.png`);
    }
  };

  const downloadPDF = async () => {
    if (shareData?.pdfUrl) {
      await sharingService.downloadPDF(shareData.pdfUrl, `hd-chart-${shareData.chartId}.pdf`);
    }
  };

  const generateEmailShare = () => {
    if (shareData) {
      return sharingService.generateEmailShare(shareData);
    }
    return '';
  };

  return {
    isSharing,
    shareData,
    error,
    shareChart,
    shareToSocial,
    copyLink,
    downloadImage,
    downloadPDF,
    generateEmailShare
  };
};

// React Import für Hook
import React from 'react';
