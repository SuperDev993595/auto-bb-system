import { useState, useEffect, Suspense, lazy } from 'react'
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from '../../utils/icons'

// Lazy load heavy components
const CustomerAnalytics = lazy(() => import('./CustomerAnalytics'))
const CustomerReporting = lazy(() => import('./CustomerReporting'))

interface PerformanceMetrics {
  apiResponseTime: number
  componentRenderTime: number
  memoryUsage: number
  cacheHitRate: number
  errorRate: number
}

interface OptimizationSuggestion {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'api' | 'ui' | 'memory' | 'cache'
  implemented: boolean
}

interface Props {
  customerId?: string
}

export default function CustomerPerformanceOptimizer({ customerId }: Props) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    componentRenderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    errorRate: 0
  })
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [activeTab, setActiveTab] = useState<'metrics' | 'suggestions' | 'lazy'>('metrics')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
    startPerformanceMonitoring()
  }, [customerId])

  const fetchPerformanceData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockMetrics: PerformanceMetrics = {
      apiResponseTime: 245,
      componentRenderTime: 89,
      memoryUsage: 67,
      cacheHitRate: 78,
      errorRate: 2.3
    }

    const mockSuggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        title: 'Implement API Response Caching',
        description: 'Cache frequently requested customer data to reduce API calls',
        impact: 'high',
        category: 'api',
        implemented: false
      },
      {
        id: '2',
        title: 'Lazy Load Heavy Components',
        description: 'Load CustomerAnalytics and CustomerReporting only when needed',
        impact: 'medium',
        category: 'ui',
        implemented: true
      },
      {
        id: '3',
        title: 'Optimize Database Queries',
        description: 'Add database indexes for customer search and filtering',
        impact: 'high',
        category: 'api',
        implemented: false
      },
      {
        id: '4',
        title: 'Implement Virtual Scrolling',
        description: 'Use virtual scrolling for large customer lists',
        impact: 'medium',
        category: 'ui',
        implemented: false
      },
      {
        id: '5',
        title: 'Add Error Boundaries',
        description: 'Implement error boundaries to prevent component crashes',
        impact: 'low',
        category: 'ui',
        implemented: true
      }
    ]

    setMetrics(mockMetrics)
    setSuggestions(mockSuggestions)
    setLoading(false)
  }

  const startPerformanceMonitoring = () => {
    // In a real app, this would start actual performance monitoring
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        apiResponseTime: prev.apiResponseTime + Math.random() * 10 - 5,
        componentRenderTime: prev.componentRenderTime + Math.random() * 5 - 2.5,
        memoryUsage: prev.memoryUsage + Math.random() * 2 - 1,
        cacheHitRate: Math.max(0, Math.min(100, prev.cacheHitRate + Math.random() * 4 - 2)),
        errorRate: Math.max(0, prev.errorRate + Math.random() * 0.4 - 0.2)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }

  const getPerformanceColor = (value: number, threshold: number, reverse = false) => {
    if (reverse) {
      return value <= threshold ? 'text-green-600' : value <= threshold * 1.5 ? 'text-yellow-600' : 'text-red-600'
    }
    return value <= threshold ? 'text-green-600' : value <= threshold * 1.5 ? 'text-yellow-600' : 'text-red-600'
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api': return <Zap className="w-4 h-4" />
      case 'ui': return <Activity className="w-4 h-4" />
      case 'memory': return <TrendingUp className="w-4 h-4" />
      case 'cache': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Optimization</h2>
            <p className="text-gray-600">Monitor and optimize Customer Management performance</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
              <CheckCircle className="w-4 h-4" />
              Apply All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
              <Activity className="w-4 h-4" />
              Refresh Metrics
            </button>
          </div>
        </div>

        {/* Quick Performance Overview */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.apiResponseTime, 200)}`}>
              {metrics.apiResponseTime.toFixed(0)}ms
            </p>
            <p className="text-sm text-blue-600">API Response</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.componentRenderTime, 100)}`}>
              {metrics.componentRenderTime.toFixed(0)}ms
            </p>
            <p className="text-sm text-green-600">Render Time</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.memoryUsage, 80, true)}`}>
              {metrics.memoryUsage.toFixed(1)}%
            </p>
            <p className="text-sm text-purple-600">Memory Usage</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.cacheHitRate, 70, true)}`}>
              {metrics.cacheHitRate.toFixed(1)}%
            </p>
            <p className="text-sm text-orange-600">Cache Hit Rate</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.errorRate, 5, true)}`}>
              {metrics.errorRate.toFixed(1)}%
            </p>
            <p className="text-sm text-red-600">Error Rate</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['metrics', 'suggestions', 'lazy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Performance Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Response Time Trend</h3>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-500 ml-4">Chart visualization would go here</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage Over Time</h3>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-500 ml-4">Chart visualization would go here</p>
                  </div>
                </div>
              </div>

              {/* Performance Alerts */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800">Performance Alerts</h3>
                </div>
                <div className="mt-2 space-y-2">
                  {metrics.apiResponseTime > 300 && (
                    <p className="text-yellow-700">
                      ⚠️ API response time is above threshold (300ms). Consider implementing caching.
                    </p>
                  )}
                  {metrics.memoryUsage > 80 && (
                    <p className="text-yellow-700">
                      ⚠️ Memory usage is high. Check for memory leaks in components.
                    </p>
                  )}
                  {metrics.errorRate > 5 && (
                    <p className="text-yellow-700">
                      ⚠️ Error rate is elevated. Review error logs and implement error boundaries.
                    </p>
                  )}
                  {metrics.apiResponseTime <= 300 && metrics.memoryUsage <= 80 && metrics.errorRate <= 5 && (
                    <p className="text-green-700">
                      ✅ All performance metrics are within acceptable ranges.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(suggestion.category)}
                        <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact} impact
                        </span>
                        {suggestion.implemented && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Implemented
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {suggestion.category}</span>
                        <span>Status: {suggestion.implemented ? 'Complete' : 'Pending'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!suggestion.implemented && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                          Implement
                        </button>
                      )}
                      <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lazy Loading Tab */}
          {activeTab === 'lazy' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Lazy Loading Demo</h3>
                <p className="text-blue-700">
                  These components are loaded only when needed, improving initial page load performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Analytics</h4>
                  <Suspense fallback={
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  }>
                    <CustomerAnalytics customerId={customerId} />
                  </Suspense>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Reporting</h4>
                  <Suspense fallback={
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  }>
                    <CustomerReporting customerId={customerId} />
                  </Suspense>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
