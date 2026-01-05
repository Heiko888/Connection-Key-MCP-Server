import { DefinedState, CenterId, GateId } from './types';

export interface ChartData {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  type: 'generator' | 'projector' | 'manifestor' | 'reflector' | 'manifesting-generator';
  profile: string;
  authority: string;
  strategy?: string;
  defined: DefinedState;
  gates: {
    id: GateId;
    line: number;
    conscious: boolean;
    unconscious: boolean;
  }[];
  channels: {
    id: string;
    gates: [GateId, GateId];
    defined: boolean;
  }[];
  centers: {
    id: CenterId;
    defined: boolean;
    gates: GateId[];
  }[];
  planets?: {
    sun?: { gate: number; line: number; sign: string };
    earth?: { gate: number; line: number; sign: string };
    moon?: { gate: number; line: number; sign: string };
    mercury?: { gate: number; line: number; sign: string };
    venus?: { gate: number; line: number; sign: string };
    mars?: { gate: number; line: number; sign: string };
    jupiter?: { gate: number; line: number; sign: string };
    saturn?: { gate: number; line: number; sign: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export class ChartService {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/charts`
    : '/api/charts'; // Relative URL für gleiche Domain

  // Lade alle verfügbaren Charts
  static async getCharts(): Promise<ChartData[]> {
    // Verwende direkt Demo-Charts, da Backend-Route nicht verfügbar ist
    console.log('Verwende Demo-Charts für Bodygraph-Advanced');
    return this.getDemoCharts();
  }

  // Demo-Charts als Fallback
  static getDemoCharts(): ChartData[] {
    return [
      this.generateDemoChart('generator'),
      this.generateDemoChart('projector'),
      this.generateDemoChart('manifestor'),
      this.generateDemoChart('reflector')
    ];
  }

  // Lade spezifischen Chart
  static async getChart(chartId: string): Promise<ChartData | null> {
    // Verwende Demo-Charts
    const demoCharts = this.getDemoCharts();
    return demoCharts.find(chart => chart.id === chartId) || demoCharts[0] || null;
  }

  // Erstelle neuen Chart
  static async createChart(chartData: Partial<ChartData>): Promise<ChartData | null> {
    // Simuliere Chart-Erstellung mit Demo-Daten
    return this.generateDemoChart('generator');
  }

  // Aktualisiere Chart
  static async updateChart(chartId: string, chartData: Partial<ChartData>): Promise<ChartData | null> {
    // Simuliere Chart-Update
    return this.generateDemoChart('generator');
  }

  // Generiere Beispiel-Chart für Demo
  static generateDemoChart(type: 'generator' | 'projector' | 'manifestor' | 'reflector'): ChartData {
    const baseChart: ChartData = {
      id: `demo-${type}-${Date.now()}`,
      name: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthPlace: 'Berlin, Deutschland',
      type,
      profile: '1/3',
      authority: 'Sakral',
      defined: {
        centers: {},
        channels: {},
        gates: {}
      },
      gates: [],
      channels: [],
      centers: []
    };

    switch (type) {
      case 'generator':
        baseChart.defined = {
          centers: { SACRAL: true, THROAT: true, G: true },
          channels: { "34-20": true, "1-8": true, "10-20": true },
          gates: { 34: true, 20: true, 1: true, 8: true, 10: true }
        };
        break;
      case 'projector':
        baseChart.defined = {
          centers: { THROAT: true, G: true, AJNA: true },
          channels: { "1-8": true, "11-56": true },
          gates: { 1: true, 8: true, 11: true, 56: true }
        };
        break;
      case 'manifestor':
        baseChart.defined = {
          centers: { THROAT: true, G: true, ROOT: true },
          channels: { "20-34": true, "1-8": true },
          gates: { 20: true, 34: true, 1: true, 8: true }
        };
        break;
      case 'reflector':
        baseChart.defined = {
          centers: {},
          channels: {},
          gates: {}
        };
        break;
    }

    return baseChart;
  }
}
