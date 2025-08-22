// Rate Limit Helper Utilities
import { toast } from 'react-hot-toast';

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
  retryAfter?: string;
}

class RateLimitManager {
  private requestCounts: Map<string, number> = new Map();
  private lastReset: Map<string, number> = new Map();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  // Track API requests
  trackRequest(endpoint: string): void {
    const now = Date.now();
    const key = this.getKey(endpoint);
    
    // Reset counter if window has passed
    const lastResetTime = this.lastReset.get(key) || 0;
    if (now - lastResetTime > this.WINDOW_MS) {
      this.requestCounts.set(key, 0);
      this.lastReset.set(key, now);
    }
    
    const currentCount = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, currentCount + 1);
    
    console.log(`Rate Limit Tracker: ${endpoint} - ${currentCount + 1} requests in current window`);
  }

  // Get current request count for an endpoint
  getRequestCount(endpoint: string): number {
    const key = this.getKey(endpoint);
    return this.requestCounts.get(key) || 0;
  }

  // Get time until reset
  getTimeUntilReset(endpoint: string): number {
    const key = this.getKey(endpoint);
    const lastResetTime = this.lastReset.get(key) || 0;
    const nextReset = lastResetTime + this.WINDOW_MS;
    return Math.max(0, nextReset - Date.now());
  }

  // Check if we're approaching rate limit
  isApproachingLimit(endpoint: string, threshold: number = 80): boolean {
    const count = this.getRequestCount(endpoint);
    const limit = this.getLimitForEndpoint(endpoint);
    return (count / limit) * 100 >= threshold;
  }

  // Get rate limit info for debugging
  getRateLimitInfo(endpoint: string): RateLimitInfo {
    const count = this.getRequestCount(endpoint);
    const limit = this.getLimitForEndpoint(endpoint);
    const timeUntilReset = this.getTimeUntilReset(endpoint);
    
    return {
      remaining: Math.max(0, limit - count),
      reset: Date.now() + timeUntilReset,
      limit,
      retryAfter: timeUntilReset > 0 ? `${Math.ceil(timeUntilReset / 1000)} seconds` : undefined
    };
  }

  // Get limit for specific endpoint
  private getLimitForEndpoint(endpoint: string): number {
    if (endpoint.includes('/auth')) {
      return process.env.NODE_ENV === 'development' ? 50 : 5;
    }
    return process.env.NODE_ENV === 'development' ? 1000 : 100;
  }

  // Generate key for tracking
  private getKey(endpoint: string): string {
    return endpoint.split('?')[0]; // Remove query parameters
  }

  // Reset counters (useful for testing)
  reset(): void {
    this.requestCounts.clear();
    this.lastReset.clear();
  }

  // Get all tracked endpoints
  getTrackedEndpoints(): string[] {
    return Array.from(this.requestCounts.keys());
  }

  // Debug method to log current state
  debug(): void {
    console.group('Rate Limit Manager Debug Info');
    console.log('Tracked endpoints:', this.getTrackedEndpoints());
    
    this.getTrackedEndpoints().forEach(endpoint => {
      const info = this.getRateLimitInfo(endpoint);
      console.log(`${endpoint}:`, {
        requests: this.getRequestCount(endpoint),
        remaining: info.remaining,
        limit: info.limit,
        timeUntilReset: `${Math.ceil(info.reset - Date.now()) / 1000}s`
      });
    });
    
    console.groupEnd();
  }
}

// Global rate limit manager instance
export const rateLimitManager = new RateLimitManager();

// Utility functions for components
export const useRateLimitTracking = (endpoint: string) => {
  return {
    trackRequest: () => rateLimitManager.trackRequest(endpoint),
    getRequestCount: () => rateLimitManager.getRequestCount(endpoint),
    getTimeUntilReset: () => rateLimitManager.getTimeUntilReset(endpoint),
    isApproachingLimit: (threshold?: number) => rateLimitManager.isApproachingLimit(endpoint, threshold),
    getRateLimitInfo: () => rateLimitManager.getRateLimitInfo(endpoint)
  };
};

// Hook for rate limit warnings
export const useRateLimitWarning = (endpoint: string, threshold: number = 80) => {
  const { isApproachingLimit, getRateLimitInfo } = useRateLimitTracking(endpoint);
  
  const checkAndWarn = () => {
    if (isApproachingLimit(threshold)) {
      const info = getRateLimitInfo();
      console.warn(`⚠️ Rate limit warning for ${endpoint}: ${info.remaining} requests remaining`);
      
      // Show toast warning if approaching limit
      toast(`⚠️ Approaching rate limit for ${endpoint}. ${info.remaining} requests remaining.`, {
        icon: '⚠️',
        duration: 5000
      });
    }
  };
  
  return { checkAndWarn, getRateLimitInfo };
};

// Export for debugging
export const debugRateLimits = () => {
  rateLimitManager.debug();
};

// Export for testing
export const resetRateLimits = () => {
  rateLimitManager.reset();
};
