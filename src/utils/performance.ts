// Performance optimization utilities
export class PerformanceOptimizer {
  private static cache = new Map<string, any>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache management
  static setCache(key: string, data: any, duration: number = this.DEFAULT_CACHE_DURATION): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + duration);
  }

  static getCache(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  // Debounce function for search inputs
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Image lazy loading
  static lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  }

  // Preload critical resources
  static preloadResource(url: string, type: 'image' | 'script' | 'style'): void {
    const link = document.createElement('link');
    link.rel = type === 'image' ? 'preload' : 'prefetch';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
  }

  // Optimize API calls with request deduplication
  private static pendingRequests = new Map<string, Promise<any>>();

  static async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Memory management
  static cleanupMemory(): void {
    // Clear old cache entries
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }

    // Clear completed requests
    this.pendingRequests.clear();
  }

  // Performance monitoring
  static measurePerformance(name: string, fn: () => any): any {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  static async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

// React-specific performance utilities
export const ReactPerformanceUtils = {
  // Memoization helper for expensive calculations
  memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, any>();
    
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Intersection Observer hook for lazy loading
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  },

  // Virtual scrolling helper
  calculateVisibleRange(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    buffer: number = 5
  ): { start: number; end: number } {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + buffer, Infinity);
    
    return { start: Math.max(0, start - buffer), end };
  }
};

// API optimization utilities
export const APIOptimizer = {
  // Batch API requests
  async batchRequests<T>(
    requests: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results.push(...batchResults);
    }
    
    return results;
  },

  // Retry failed requests with exponential backoff
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  },

  // Request cancellation
  createCancellableRequest<T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): { promise: Promise<T>; cancel: () => void } {
    const controller = new AbortController();
    
    return {
      promise: requestFn(controller.signal),
      cancel: () => controller.abort(),
    };
  }
};

// Export default instance
export default PerformanceOptimizer;
