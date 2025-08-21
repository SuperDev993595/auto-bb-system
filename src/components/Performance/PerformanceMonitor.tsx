import React, { useState, useEffect, useRef } from 'react';
import { Gauge, HardDrive, Network, Clock } from '../../utils/icons';

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
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white"
        title="Performance Monitor"
      >
        <Gauge className="w-5 h-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="absolute bottom-16 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Load Time */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Load Time</span>
              </div>
              <span className={`text-sm font-semibold ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
                {formatTime(metrics.loadTime)}
              </span>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HardDrive className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              </div>
              <span className={`text-sm font-semibold ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 80 })}`}>
                {formatMemory(metrics.memoryUsage)}
              </span>
            </div>

            {/* Network Requests */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Network className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Network Requests</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.networkRequests}
              </span>
            </div>

            {/* Render Time */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Gauge className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Render Time</span>
              </div>
              <span className={`text-sm font-semibold ${getPerformanceColor(metrics.renderTime, { good: 16, warning: 33 })}`}>
                {formatTime(metrics.renderTime)}
              </span>
            </div>

            {/* Cache Hit Rate */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <HardDrive className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Cache Hit Rate</span>
              </div>
              <span className={`text-sm font-semibold ${getPerformanceColor(metrics.cacheHitRate, { good: 80, warning: 60 })}`}>
                {formatPercentage(metrics.cacheHitRate)}
              </span>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Detailed Metrics</h4>
              <div className="text-xs text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Cache Hits:</span>
                  <span className="font-medium">{cacheHits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Misses:</span>
                  <span className="font-medium">{cacheMisses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-medium">{cacheHits + cacheMisses}</span>
                </div>
                <div className="flex justify-between">
                  <span>FPS:</span>
                  <span className="font-medium">{Math.round(1000 / Math.max(metrics.renderTime, 1))}</span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Tips</h4>
            <div className="text-xs text-gray-600 space-y-2">
              {metrics.loadTime > 3000 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600">⚠️</span>
                  <span>Consider code splitting and lazy loading</span>
                </div>
              )}
              {metrics.memoryUsage > 80 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <span className="text-red-600">⚠️</span>
                  <span>High memory usage detected</span>
                </div>
              )}
              {metrics.cacheHitRate < 60 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">💡</span>
                  <span>Enable more aggressive caching</span>
                </div>
              )}
              {metrics.networkRequests > 20 && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <span className="text-green-600">💡</span>
                  <span>Consider batching API requests</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
