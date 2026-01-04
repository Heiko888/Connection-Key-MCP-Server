/**
 * useChart Hook
 * Lädt Chart-Daten via GET /api/chart/{chart_id}
 * 
 * Regeln:
 * - Kein Retry-Spam (1 Request pro chartId)
 * - Optional in-memory cache
 * - Bei chartId null: return { chart: null, isLoading: false, error: "chart_id_missing" }
 */

'use client';

import { useState, useEffect, useRef } from 'react';

// Chart Response Type (aus API)
export interface ChartResponse {
  chart_id: string;
  chart_version: string;
  chart_input_hash: string;
  chart_data: {
    core: {
      type: string;
      authority: string;
      strategy: string;
      profile: string;
      definition: string;
    };
    centers: {
      head: 'defined' | 'undefined';
      ajna: 'defined' | 'undefined';
      throat: 'defined' | 'undefined';
      g: 'defined' | 'undefined';
      heart: 'defined' | 'undefined';
      spleen: 'defined' | 'undefined';
      solar_plexus: 'defined' | 'undefined';
      sacral: 'defined' | 'undefined';
      root: 'defined' | 'undefined';
    };
    channels: Array<{
      number: number;
      gate1: number;
      gate2: number;
      name: string;
      defined: boolean;
    }>;
    gates: {
      [gateNumber: string]: {
        line: number;
        planet: string;
      };
    };
  };
  created_at: string;
}

// Error Response Types
export interface ChartError {
  error: 'CHART_NOT_FOUND' | 'UNSUPPORTED_VERSION' | 'ACCESS_DENIED' | 'INTERNAL_ERROR' | 'chart_id_missing';
  message: string;
  chart_id: string;
  chart_version?: string;
  supported_versions?: string[];
}

// Hook Return Type
export interface UseChartResult {
  chart: ChartResponse | null;
  isLoading: boolean;
  error: ChartError | null;
  statusCode: number | null;
}

// In-Memory Cache (optional)
const chartCache = new Map<string, { data: ChartResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

/**
 * useChart Hook
 * 
 * @param chartId - Chart ID (UUID) oder null
 * @returns { chart, isLoading, error, statusCode }
 */
export function useChart(chartId: string | null): UseChartResult {
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ChartError | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  
  // Ref um zu verhindern, dass mehrere Requests gleichzeitig laufen
  const fetchingRef = useRef<boolean>(false);
  const currentChartIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset wenn chartId sich ändert
    if (currentChartIdRef.current !== chartId) {
      setChart(null);
      setError(null);
      setStatusCode(null);
      currentChartIdRef.current = chartId;
    }

    // chartId ist null → Error "chart_id_missing"
    if (!chartId) {
      setIsLoading(false);
      setError({
        error: 'chart_id_missing',
        message: 'Chart ID is missing',
        chart_id: '',
      });
      setStatusCode(null);
      return;
    }

    // Validierung: chartId muss UUID sein
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chartId)) {
      setIsLoading(false);
      setError({
        error: 'CHART_NOT_FOUND',
        message: `Invalid chart_id format: ${chartId}`,
        chart_id: chartId,
      });
      setStatusCode(404);
      return;
    }

    // Prüfe Cache
    const cached = chartCache.get(chartId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setChart(cached.data);
      setIsLoading(false);
      setError(null);
      setStatusCode(200);
      return;
    }

    // Verhindere mehrere gleichzeitige Requests
    if (fetchingRef.current) {
      return;
    }

    // Fetch Chart
    const fetchChart = async () => {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      setStatusCode(null);

      try {
        const response = await fetch(`/api/chart/${chartId}`);
        const data = await response.json();

        if (!response.ok) {
          // Error Response
          const errorData = data as ChartError;
          setError(errorData);
          setStatusCode(response.status);
          setChart(null);
        } else {
          // Success Response
          const chartData = data as ChartResponse;
          setChart(chartData);
          setError(null);
          setStatusCode(200);
          
          // Cache speichern
          chartCache.set(chartId, {
            data: chartData,
            timestamp: Date.now(),
          });
        }
      } catch (err: any) {
        // Network Error
        setError({
          error: 'INTERNAL_ERROR',
          message: err.message || 'Failed to fetch chart',
          chart_id: chartId,
        });
        setStatusCode(500);
        setChart(null);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchChart();
  }, [chartId]);

  return {
    chart,
    isLoading,
    error,
    statusCode,
  };
}
