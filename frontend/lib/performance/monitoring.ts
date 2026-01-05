// Performance Monitoring für HD App
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

// Performance-Metriken sammeln
export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  getCLS((metric) => sendMetric(metric));
  getFID((metric) => sendMetric(metric));
  getFCP((metric) => sendMetric(metric));
  getLCP((metric) => sendMetric(metric));
  getTTFB((metric) => sendMetric(metric));
  
  // Custom Metriken
  measurePageLoadTime();
  measureSupabaseQueryTime();
  measureComponentRenderTime();
};

// Metriken an Analytics senden
const sendMetric = (metric: PerformanceMetric) => {
  // In Development: Console ausgeben
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Performance: ${metric.name} = ${metric.value}ms`);
  }
  
  // In Production: An Analytics-Service senden
  if (process.env.NODE_ENV === 'production') {
    // Hier könnten wir an Supabase, Google Analytics, etc. senden
    // sendToAnalytics(metric);
  }
};

// Page Load Time messen
const measurePageLoadTime = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      sendMetric({
        name: 'page-load-time',
        value: loadTime,
        delta: loadTime,
        id: 'page-load',
        navigationType: 'navigate'
      });
    });
  }
};

// Supabase Query Performance
const measureSupabaseQueryTime = () => {
  // Supabase Client erweitern für Performance-Monitoring
  const originalFrom = window.supabase?.from;
  if (originalFrom) {
    window.supabase.from = function(table: string) {
      const startTime = performance.now();
      const query = originalFrom.call(this, table);
      
      // Query-Ergebnis abfangen
      const originalSelect = query.select;
      query.select = function(...args: any[]) {
        const result = originalSelect.apply(this, args);
        
        // Performance messen
        result.then(() => {
          const endTime = performance.now();
          const queryTime = endTime - startTime;
          
          sendMetric({
            name: 'supabase-query-time',
            value: queryTime,
            delta: queryTime,
            id: `query-${table}`,
            navigationType: 'navigate'
          });
        });
        
        return result;
      };
      
      return query;
    };
  }
};

// Component Render Time
const measureComponentRenderTime = () => {
  // React Performance Monitoring
  if (typeof window !== 'undefined' && window.React) {
    const originalCreateElement = window.React.createElement;
    
    window.React.createElement = function(type: any, props: any, ...children: any[]) {
      const startTime = performance.now();
      const element = originalCreateElement.call(this, type, props, ...children);
      
      // Render-Zeit messen
      setTimeout(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16) { // Nur langsame Renders loggen
          sendMetric({
            name: 'component-render-time',
            value: renderTime,
            delta: renderTime,
            id: `render-${type.name || 'unknown'}`,
            navigationType: 'navigate'
          });
        }
      }, 0);
      
      return element;
    };
  }
};

// Bundle-Size Monitoring
export const measureBundleSize = () => {
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('_next/static')) {
        // Bundle-Size schätzen (vereinfacht)
        totalSize += 100; // Schätzung
      }
    });
    
    sendMetric({
      name: 'bundle-size',
      value: totalSize,
      delta: totalSize,
      id: 'bundle-analysis',
      navigationType: 'navigate'
    });
  }
};

// Memory Usage Monitoring
export const measureMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    
    sendMetric({
      name: 'memory-usage',
      value: memory.usedJSHeapSize / 1024 / 1024, // MB
      delta: memory.usedJSHeapSize / 1024 / 1024,
      id: 'memory-check',
      navigationType: 'navigate'
    });
  }
};

// Performance-Report generieren
export const generatePerformanceReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    memory: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    } : null,
    timing: performance.timing ? {
      navigationStart: performance.timing.navigationStart,
      loadEventEnd: performance.timing.loadEventEnd,
      domContentLoaded: performance.timing.domContentLoadedEventEnd
    } : null
  };
  
  console.log('📊 Performance Report:', report);
  return report;
};

// Performance-Monitoring initialisieren
if (typeof window !== 'undefined') {
  // Warten bis DOM geladen ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
  } else {
    initPerformanceMonitoring();
  }
}
