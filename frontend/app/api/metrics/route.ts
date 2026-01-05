import { NextResponse } from 'next/server';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Sammle Standard Node.js Metriken
collectDefaultMetrics({ register });

// Custom Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

export async function GET() {
  try {
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType
      }
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return new NextResponse('Error collecting metrics', { status: 500 });
  }
}

