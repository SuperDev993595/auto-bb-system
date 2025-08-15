import React, { useState, useEffect, useRef } from 'react';
import { FaTachometerAlt, FaMemory, FaNetworkWired, FaClock } from 'react-icons/fa';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkRequests: number;
  renderTime: number;
  cacheHitRate: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  showDetails = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    renderTime: 0,
    cacheHitRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [networkCount, setNetworkCount] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);
  const startTime = useRef(performance.now());
  const renderStartTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // Measure initial load time
    const loadTime = performance.now() - startTime.current;
    setMetrics(prev => ({ ...prev, loadTime }));

    // Monitor memory usage
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      setNetworkCount(prev => prev + 1);
      return originalFetch.apply(this, args);
    };

    // Monitor cache performance
    const originalGetCache = (window as any).PerformanceOptimizer?.getCache;
    if (originalGetCache) {
      (window as any).PerformanceOptimizer.getCache = function(key: string) {
        const result = originalGetCache.call(this, key);
        if (result) {
          setCacheHits(prev => prev + 1);
        } else {
          setCacheMisses(prev => prev + 1);
        }
        return result;
      };
    }

    // Update metrics periodically
    const interval = setInterval(() => {
      updateMemoryUsage();
      const totalCacheRequests = cacheHits + cacheMisses;
      const cacheHitRate = totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0;
      
      setMetrics(prev => ({
        ...prev,
        networkRequests: networkCount,
        cacheHitRate
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      window.fetch = originalFetch;
    };
  }, [enabled]);

  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatMemory = (percentage: number) => `${percentage.toFixed(1)}%`;
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Monitor"
      >
        <FaTachometerAlt className="w-5 h-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* Load Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Load Time</span>
              </div>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
                {formatTime(metrics.loadTime)}
              </span>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaMemory className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Memory Usage</span>
              </div>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 80 })}`}>
                {formatMemory(metrics.memoryUsage)}
              </span>
            </div>

            {/* Network Requests */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaNetworkWired className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Network Requests</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.networkRequests}
              </span>
            </div>

            {/* Render Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaTachometerAlt className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Render Time</span>
              </div>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.renderTime, { good: 16, warning: 33 })}`}>
                {formatTime(metrics.renderTime)}
              </span>
            </div>

            {/* Cache Hit Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaMemory className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
              </div>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.cacheHitRate, { good: 80, warning: 60 })}`}>
                {formatPercentage(metrics.cacheHitRate)}
              </span>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Detailed Metrics</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Cache Hits: {cacheHits}</div>
                <div>Cache Misses: {cacheMisses}</div>
                <div>Total Requests: {cacheHits + cacheMisses}</div>
                <div>FPS: {Math.round(1000 / Math.max(metrics.renderTime, 1))}</div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Tips</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {metrics.loadTime > 3000 && (
                <div>⚠️ Consider code splitting and lazy loading</div>
              )}
              {metrics.memoryUsage > 80 && (
                <div>⚠️ High memory usage detected</div>
              )}
              {metrics.cacheHitRate < 60 && (
                <div>💡 Enable more aggressive caching</div>
              )}
              {metrics.networkRequests > 20 && (
                <div>💡 Consider batching API requests</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
