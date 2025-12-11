/**
 * Workbook-Service
 * Konsumiert Chart-Daten vom Chart Architect Agent über die Workbook API
 */

interface ChartDataRequest {
  chartType: 'single' | 'dual' | 'penta';
  birthData: {
    person_A: {
      date: string;
      time: string;
      location: string;
      timezone?: string;
    };
    person_B?: {
      date: string;
      time: string;
      location: string;
      timezone?: string;
    };
    [key: string]: {
      date: string;
      time: string;
      location: string;
      timezone?: string;
    } | undefined;
  };
  options?: {
    includeSVG?: boolean;
    includeLayers?: boolean;
    includeData?: boolean;
    mode?: 'single' | 'dual-comparison' | 'dual-overlay' | 'penta' | 'focus';
  };
  userId?: string;
}

interface ChartDataResponse {
  success: boolean;
  chart_id: string;
  data: any;
  svg: string | null;
  svg_layers: {
    [key: string]: string;
  } | null;
  metadata: {
    version: string;
    generated_at: string;
    svg_standard: string;
    chart_type: string;
    calculation_method?: string;
    compatibility: {
      workbook: string;
      frontend: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class WorkbookService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/workbook/chart-data') {
    this.apiUrl = apiUrl;
  }

  /**
   * Holt Chart-Daten vom Chart Architect Agent
   */
  async getChartData(request: ChartDataRequest): Promise<ChartDataResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`
          }
        }));
        throw new Error(errorData.error?.message || `Workbook API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        chart_id: '',
        data: null,
        svg: null,
        svg_layers: null,
        metadata: {
          version: '1.0',
          generated_at: new Date().toISOString(),
          svg_standard: 'layer-based-v1',
          chart_type: request.chartType,
          compatibility: {
            workbook: '>=1.0',
            frontend: '>=1.0'
          }
        },
        error: {
          code: 'SERVICE_ERROR',
          message: error.message || 'Unknown error',
          details: {
            error: error instanceof Error ? error.stack : String(error)
          }
        }
      };
    }
  }

  /**
   * Holt nur SVG für bestehenden Chart (wenn Chart-ID bekannt)
   * Note: Diese Funktion benötigt eine erweiterte API-Route mit GET-Support
   */
  async getSVGOnly(chartId: string): Promise<string | null> {
    try {
      // Diese Funktion würde eine GET-Route benötigen
      // Für jetzt: Verwende POST mit minimalen Daten
      const response = await fetch(`${this.apiUrl}?chartId=${chartId}&svgOnly=true`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Workbook API error: ${response.status}`);
      }

      const data = await response.json();
      return data.svg || null;
    } catch (error: any) {
      console.error('Error fetching SVG only:', error);
      return null;
    }
  }

  /**
   * Holt nur bestimmte SVG-Layer
   * Note: Diese Funktion benötigt eine erweiterte API-Route
   */
  async getLayers(chartId: string, layers: string[]): Promise<{ [key: string]: string } | null> {
    try {
      const response = await fetch(`${this.apiUrl}?chartId=${chartId}&layers=${layers.join(',')}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Workbook API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.svg_layers) return null;

      // Filtere nur angeforderte Layer
      const filteredLayers: { [key: string]: string } = {};
      layers.forEach(layer => {
        if (data.svg_layers[layer]) {
          filteredLayers[layer] = data.svg_layers[layer];
        }
      });

      return Object.keys(filteredLayers).length > 0 ? filteredLayers : null;
    } catch (error: any) {
      console.error('Error fetching layers:', error);
      return null;
    }
  }

  /**
   * Validiert Chart-Daten-Request
   */
  validateRequest(request: ChartDataRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.chartType) {
      errors.push('chartType is required');
    } else if (!['single', 'dual', 'penta'].includes(request.chartType)) {
      errors.push('chartType must be one of: single, dual, penta');
    }

    if (!request.birthData) {
      errors.push('birthData is required');
    } else {
      if (!request.birthData.person_A) {
        errors.push('birthData.person_A is required');
      } else {
        if (!request.birthData.person_A.date) errors.push('birthData.person_A.date is required');
        if (!request.birthData.person_A.time) errors.push('birthData.person_A.time is required');
        if (!request.birthData.person_A.location) errors.push('birthData.person_A.location is required');
      }

      if ((request.chartType === 'dual' || request.chartType === 'penta') && !request.birthData.person_B) {
        errors.push('birthData.person_B is required for dual and penta charts');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export Singleton-Instanz (optional)
export const workbookService = new WorkbookService();
