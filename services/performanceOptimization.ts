// Lazy Loading Utilities for Code Splitting
// Improves initial load time by deferring non-critical resources

import { lazy, Suspense } from 'react';

// Lazy load React components
export const lazyComponent = (importFunc: () => Promise<any>, fallback: React.ReactNode = null) => {
  const Component = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
};

// Preload link for critical resources
export const preloadLink = (href: string, rel: 'preload' | 'prefetch' = 'preload') => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (href.endsWith('.js')) link.as = 'script';
  else if (href.endsWith('.css')) link.as = 'style';
  else if (href.endsWith('.woff2')) link.as = 'font';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Image lazy loading with IntersectionObserver
export const observeImages = () => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img: any) => {
      img.src = img.dataset.src;
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
};

// Defer non-critical scripts
export const deferScript = (src: string, timeout = 0) => {
  if (timeout === 0) {
    requestAnimationFrame(() => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });
  } else {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }, timeout);
  }
};

// Throttle/Debounce utilities for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Request animation frame throttle
export const requestAnimationFrameThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
};

// Virtual scrolling helper for large lists
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  bufferItems?: number;
}

export const calculateVirtualScroll = (
  scrollTop: number,
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, bufferItems = 5 } = options;
  const itemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferItems);
  const endIndex = Math.min(startIndex + itemCount + bufferItems * 2, 10000); // Assume max 10K items

  return { startIndex, endIndex, visibleCount: endIndex - startIndex };
};

// Web Worker helper for heavy computations
export const createWorker = (workerScript: string): Worker => {
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
};

// Measure performance
export class PerformanceMeasurer {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    return duration;
  }

  measure(label: string, fn: () => any): any {
    this.start(label);
    const result = fn();
    const duration = this.end(label);
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    return result;
  }

  async measureAsync(label: string, fn: () => Promise<any>): Promise<any> {
    this.start(label);
    const result = await fn();
    const duration = this.end(label);
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    return result;
  }
}

// Monitor Core Web Vitals
export const monitorWebVitals = (callback: (metric: any) => void) => {
  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        callback({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: lastEntry.renderTime < 2500 ? 'good' : 'poor',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }
  }

  // Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!('hadRecentInput' in entry) || !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        callback({
          name: 'CLS',
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' : 'poor',
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }
  }

  // First Input Delay
  if ('PerformanceObserver' in window) {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        callback({
          name: 'FID',
          value: (firstInput as any).processingDuration,
          rating: (firstInput as any).processingDuration < 100 ? 'good' : 'poor',
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }
  }
};

export default {
  lazyComponent,
  preloadLink,
  observeImages,
  deferScript,
  debounce,
  throttle,
  requestAnimationFrameThrottle,
  calculateVirtualScroll,
  createWorker,
  PerformanceMeasurer,
  monitorWebVitals,
};
