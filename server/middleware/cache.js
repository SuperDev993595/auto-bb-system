const NodeCache = require('node-cache');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // Better performance
});

// Cache middleware for GET requests
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create cache key from URL and query parameters
    const key = `cache:${req.originalUrl || req.url}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(key);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Store original send function
    const originalSend = res.json;
    
    // Override send function to cache the response
    res.json = function(data) {
      // Cache the response
      cache.set(key, data, duration);
      
      // Call original send function
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  return (req, res, next) => {
    // Store original send function
    const originalSend = res.json;
    
    // Override send function to invalidate cache after successful operations
    res.json = function(data) {
      // Invalidate cache patterns
      patterns.forEach(pattern => {
        const keys = cache.keys();
        keys.forEach(key => {
          if (key.includes(pattern)) {
            cache.del(key);
          }
        });
      });
      
      // Call original send function
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Cache statistics
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) * 100
  };
};

// Clear all cache
const clearCache = () => {
  cache.flushAll();
};

// Cache middleware for specific routes
const cacheRoutes = {
  // Cache customer list for 2 minutes
  customerList: cacheMiddleware(120),
  
  // Cache service categories for 10 minutes
  serviceCategories: cacheMiddleware(600),
  
  // Cache appointment calendar for 1 minute
  appointmentCalendar: cacheMiddleware(60),
  
  // Cache service statistics for 5 minutes
  serviceStats: cacheMiddleware(300)
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  getCacheStats,
  clearCache,
  cacheRoutes
};
