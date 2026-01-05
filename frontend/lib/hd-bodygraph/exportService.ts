import { DefinedState } from './types';
import { ChartData } from './chartService';

export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf';
  width?: number;
  height?: number;
  includeLabels?: boolean;
  includeGateNumbers?: boolean;
  includeMetadata?: boolean;
  filename?: string;
}

export class BodygraphExportService {
  
  // SVG Export
  static async exportSVG(
    defined: DefinedState, 
    options: ExportOptions = { format: 'svg' }
  ): Promise<string> {
    const svgElement = document.querySelector('#bodygraph-svg') as SVGElement;
    if (!svgElement) {
      throw new Error('SVG element not found');
    }

    // Clone the SVG element
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Add metadata if requested
    if (options.includeMetadata) {
      const metadata = this.generateMetadata(defined);
      const metadataGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      metadataGroup.setAttribute('id', 'metadata');
      
      // Add title
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      title.setAttribute('x', '20');
      title.setAttribute('y', '30');
      title.setAttribute('font-size', '24');
      title.setAttribute('font-weight', 'bold');
      title.setAttribute('fill', '#1a1a2e');
      title.textContent = 'Human Design Bodygraph';
      metadataGroup.appendChild(title);
      
      // Add date
      const date = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      date.setAttribute('x', '20');
      date.setAttribute('y', '60');
      date.setAttribute('font-size', '16');
      date.setAttribute('fill', '#6c757d');
      date.textContent = `Erstellt am: ${new Date().toLocaleDateString('de-DE')}`;
      metadataGroup.appendChild(date);
      
      clonedSvg.insertBefore(metadataGroup, clonedSvg.firstChild);
    }

    // Set dimensions
    if (options.width) {
      clonedSvg.setAttribute('width', options.width.toString());
    }
    if (options.height) {
      clonedSvg.setAttribute('height', options.height.toString());
    }

    // Convert to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(clonedSvg);
  }

  // PNG Export
  static async exportPNG(
    defined: DefinedState, 
    options: ExportOptions = { format: 'png' }
  ): Promise<Blob> {
    const svgString = await this.exportSVG(defined, { ...options, format: 'svg' });
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const width = options.width || 800;
      const height = options.height || 1000;
      
      canvas.width = width;
      canvas.height = height;
      
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          }, 'image/png');
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    });
  }

  // PDF Export
  static async exportPDF(
    defined: DefinedState, 
    chartData?: ChartData,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<Blob> {
    // Import jsPDF dynamically
    const { default: jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Human Design Bodygraph', 20, 30);

    // Add chart information if available
    if (chartData) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${chartData.name}`, 20, 45);
      pdf.text(`Typ: ${chartData.type}`, 20, 55);
      pdf.text(`Profil: ${chartData.profile}`, 20, 65);
      pdf.text(`Autorität: ${chartData.authority}`, 20, 75);
    }

    // Add date
    pdf.setFontSize(10);
    pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 85);

    // Convert SVG to PNG and add to PDF
    try {
      const pngBlob = await this.exportPNG(defined, { 
        format: 'png', 
        width: 600, 
        height: 800,
        includeLabels: options.includeLabels,
        includeGateNumbers: options.includeGateNumbers
      });
      
      const pngUrl = URL.createObjectURL(pngBlob);
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const imgWidth = 170; // mm
          const imgHeight = (img.height * imgWidth) / img.width;
          
          pdf.addImage(img, 'PNG', 20, 100, imgWidth, imgHeight);
          
          // Add legend
          this.addLegendToPDF(pdf, defined, 20, 100 + imgHeight + 10);
          
          URL.revokeObjectURL(pngUrl);
          resolve(pdf.output('blob'));
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(pngUrl);
          reject(new Error('Failed to load PNG image'));
        };
        
        img.src = pngUrl;
      });
    } catch (error) {
      throw new Error(`Failed to create PDF: ${error}`);
    }
  }

  // Download file
  static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate metadata
  private static generateMetadata(defined: DefinedState): string {
    const definedCenters = Object.entries(defined.centers || {})
      .filter(([_, isDefined]) => isDefined)
      .map(([center, _]) => center);
    
    const definedChannels = Object.entries(defined.channels || {})
      .filter(([_, isDefined]) => isDefined)
      .map(([channel, _]) => channel);
    
    const definedGates = Object.entries(defined.gates || {})
      .filter(([_, isDefined]) => isDefined)
      .map(([gate, _]) => gate);

    return `
Definierte Zentren: ${definedCenters.join(', ')}
Definierte Kanäle: ${definedChannels.join(', ')}
Aktive Gates: ${definedGates.join(', ')}
    `.trim();
  }

  // Add legend to PDF
  private static addLegendToPDF(pdf: any, defined: DefinedState, x: number, y: number) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Legende:', x, y);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const definedCenters = Object.entries(defined.centers || {})
      .filter(([_, isDefined]) => isDefined)
      .map(([center, _]) => center);
    
    const definedChannels = Object.entries(defined.channels || {})
      .filter(([_, isDefined]) => isDefined)
      .map(([channel, _]) => channel);

    if (definedCenters.length > 0) {
      pdf.text(`Definierte Zentren: ${definedCenters.join(', ')}`, x, y + 10);
    }
    
    if (definedChannels.length > 0) {
      pdf.text(`Definierte Kanäle: ${definedChannels.join(', ')}`, x, y + 20);
    }
  }

  // Quick export methods
  static async quickExportSVG(defined: DefinedState, filename?: string) {
    const svgString = await this.exportSVG(defined);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    this.downloadFile(blob, filename || `bodygraph-${Date.now()}.svg`);
  }

  static async quickExportPNG(defined: DefinedState, filename?: string) {
    const blob = await this.exportPNG(defined);
    this.downloadFile(blob, filename || `bodygraph-${Date.now()}.png`);
  }

  static async quickExportPDF(defined: DefinedState, chartData?: ChartData, filename?: string) {
    const blob = await this.exportPDF(defined, chartData);
    this.downloadFile(blob, filename || `bodygraph-${Date.now()}.pdf`);
  }
}
